"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, Square, SkipForward, Code2, Flame, RotateCcw, ArrowRightLeft, Volume2, VolumeX, Music } from "lucide-react"
import { logSession } from "../topics/actions"
import ReactPlayer from "react-player/youtube"

interface Topic {
  id: string
  title: string
  todayMinutes: number
}

interface Stats {
  sessionsDone: number
  focusedMinutes: number
  streak: number
}

const PHASES = {
  focus: { label: "Focus", minutes: 25 },
  shortBreak: { label: "Short break", minutes: 5 },
  longBreak: { label: "Long break", minutes: 15 },
}

const SOUND_OPTIONS = [
  { id: "lofi", label: "Lofi Chillhop", url: "https://www.youtube.com/watch?v=jfKfPfyJRdk" },
  { id: "piano", label: "Classical Piano", url: "https://www.youtube.com/watch?v=mIYzpCGx1JI" },
  { id: "motivation", label: "Motivational Speech", url: "https://www.youtube.com/watch?v=wnHW6o8WMas" },
  { id: "rain", label: "Heavy Rain", url: "https://www.youtube.com/watch?v=mPZkdNFkNps" },
  { id: "jazz", label: "Coffee Shop Jazz", url: "https://www.youtube.com/watch?v=e3OpmAebYRw" },
  { id: "synth", label: "Synthwave", url: "https://www.youtube.com/watch?v=4xDzrUhVKVA" },
  { id: "brown", label: "Deep Focus Noise", url: "https://www.youtube.com/watch?v=hXrtQcWEptI" },
  { id: "epic", label: "Epic Cinematic", url: "https://www.youtube.com/watch?v=4q9UafAMwgI" },
  { id: "ocean", label: "Ocean Waves", url: "https://www.youtube.com/watch?v=bn9F19Hi1Lk" },
  { id: "forest", label: "Forest Birds", url: "https://www.youtube.com/watch?v=eKFTSSKCzWA" }
]

export function FocusTimer({ topics, stats: initialStats }: { topics: Topic[], stats: Stats }) {
  const [topicId, setTopicId] = useState(topics[0]?.id || "")
  const [phase, setPhase] = useState<keyof typeof PHASES>("focus")
  const [timeLeft, setTimeLeft] = useState(PHASES.focus.minutes * 60)
  const [isActive, setIsActive] = useState(false)
  const [pomodorosCompleted, setPomodorosCompleted] = useState(initialStats.sessionsDone % 4)
  const [stats, setStats] = useState(initialStats)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
  // Sound Settings
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [ambienceEnabled, setAmbienceEnabled] = useState(false)
  const [selectedSoundId, setSelectedSoundId] = useState(SOUND_OPTIONS[0].id)
  const [isSoundMenuOpen, setIsSoundMenuOpen] = useState(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioCtxRef = useRef<any>(null)

  const playDing = () => {
    if (!soundEnabled) return
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContextClass()
    const ctx = audioCtxRef.current
    if (ctx.state === 'suspended') ctx.resume()

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = "sine"
    osc.frequency.setValueAtTime(800, ctx.currentTime)
    gain.gain.setValueAtTime(0.5, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 1)
  }

  const selectedSound = SOUND_OPTIONS.find(s => s.id === selectedSoundId) || SOUND_OPTIONS[0]
  const shouldPlayAmbience = ambienceEnabled && isActive && phase === "focus"

  const currentTopic = topics.find(t => t.id === topicId)

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false)
      handleComplete()
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isActive, timeLeft])

  const toggleTimer = () => {
    if (timeLeft === 0) return
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    setTimeLeft(PHASES[phase].minutes * 60)
  }

  const skipTimer = () => {
    setIsActive(false)
    setTimeLeft(0)
    handleComplete()
  }

  const switchPhase = (newPhase: keyof typeof PHASES) => {
    setIsActive(false)
    setPhase(newPhase)
    setTimeLeft(PHASES[newPhase].minutes * 60)
  }

  const handleComplete = async () => {
    // Play Ding sound
    playDing()

    if (phase === "focus") {
      if (!topicId) return
      try {
        const formData = new FormData()
        formData.append("topicId", topicId)
        formData.append("minutes", PHASES.focus.minutes.toString())
        formData.append("note", "Pomodoro Focus Session")
        await logSession(formData)
        
        const newCompleted = (pomodorosCompleted + 1) % 4
        setPomodorosCompleted(newCompleted)
        setStats(prev => ({
          ...prev,
          sessionsDone: prev.sessionsDone + 1,
          focusedMinutes: prev.focusedMinutes + PHASES.focus.minutes,
          streak: prev.streak === 0 ? 1 : prev.streak // Optimistic streak update
        }))
        
        // Auto-switch to break
        if (newCompleted === 0) switchPhase("longBreak")
        else switchPhase("shortBreak")
        
      } catch (e) {
        console.error(e)
      }
    } else {
      // Break is over, back to focus
      switchPhase("focus")
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  const formatHrsMins = (minutes: number) => {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  const totalDuration = PHASES[phase].minutes * 60
  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100

  if (topics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-border rounded-xl bg-card">
        <Flame className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-medium">No topics found</h2>
        <p className="text-muted-foreground text-sm mt-2">Add a topic to start your focus session.</p>
        <a href="/topics" className="mt-6 px-6 py-2 bg-primary/10 text-primary hover:bg-primary/20 transition-colors rounded-lg text-sm font-medium">
          Go to Topics
        </a>
      </div>
    )
  }

  const sessionsUntilLongBreak = 4 - pomodorosCompleted

  return (
    <div className="flex flex-col gap-3 w-full max-w-2xl text-foreground">
      {/* Hidden YouTube Player for Ambience */}
      <div className="hidden">
        <ReactPlayer
          url={selectedSound.url}
          playing={shouldPlayAmbience}
          loop={true}
          volume={0.5}
          width="0"
          height="0"
          config={{ youtube: { playerVars: { origin: typeof window !== 'undefined' ? window.location.origin : '' } } }}
        />
      </div>

      {/* Top Controls: Sound Toggles & Topic Selector */}
      <div className="flex items-center gap-3 w-full">
        <div className="relative flex-1 border border-border bg-card/40 rounded-2xl p-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Code2 size={20} strokeWidth={1.5} />
            </div>
            <div>
              <div className="font-semibold text-base">{currentTopic?.title || "Select Topic"}</div>
              <div className="text-sm text-muted-foreground">
                {formatHrsMins((currentTopic?.todayMinutes || 0) + (phase === "focus" && isActive ? Math.floor((PHASES.focus.minutes * 60 - timeLeft) / 60) : 0))} studied today
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => !isActive && setIsDropdownOpen(!isDropdownOpen)}
            disabled={isActive}
            className="p-2 hover:bg-accent rounded-lg text-muted-foreground transition-colors disabled:opacity-50"
          >
            <ArrowRightLeft size={18} />
          </button>

          {isDropdownOpen && !isActive && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-xl shadow-2xl py-1 z-50 animate-in fade-in slide-in-from-top-2">
              {topics.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTopicId(t.id)
                    setIsDropdownOpen(false)
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-muted ${topicId === t.id ? 'text-primary font-medium bg-primary/5' : ''}`}
                >
                  {t.title}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sound Toggles */}
        <div className="relative flex bg-card/40 border border-border rounded-2xl p-2 items-center gap-1 shadow-sm h-[66px]">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl transition-all ${soundEnabled ? 'bg-primary/10 text-primary' : 'hover:bg-accent text-muted-foreground'}`}
            title="Toggle Ding Sound"
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button
            onClick={() => setAmbienceEnabled(!ambienceEnabled)}
            className={`p-2.5 rounded-xl transition-all ${ambienceEnabled ? 'bg-blue-500/10 text-blue-500' : 'hover:bg-accent text-muted-foreground'}`}
            title="Toggle Background Ambience (Plays while focusing)"
          >
            <Music size={18} />
          </button>

          <button
            onClick={() => !isActive && setIsSoundMenuOpen(!isSoundMenuOpen)}
            disabled={isActive}
            className="p-2 ml-1 hover:bg-accent rounded-lg text-muted-foreground transition-colors disabled:opacity-50"
          >
            <ArrowRightLeft size={14} />
          </button>

          {isSoundMenuOpen && !isActive && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-background border border-border rounded-xl shadow-2xl py-1 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border mb-1">
                Background Sound
              </div>
              {SOUND_OPTIONS.map((sound) => (
                <button
                  key={sound.id}
                  onClick={() => {
                    setSelectedSoundId(sound.id)
                    setIsSoundMenuOpen(false)
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-muted ${selectedSoundId === sound.id ? 'text-blue-500 font-medium bg-blue-500/5' : ''}`}
                >
                  {sound.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Timer Card */}
      <div className="border border-border bg-card/30 rounded-2xl p-6 flex flex-col items-center shadow-sm">
        
        {/* Phase Tabs */}
        <div className="flex bg-background border border-border rounded-full p-1 mb-5 shadow-sm">
          {(Object.keys(PHASES) as Array<keyof typeof PHASES>).map((p) => (
            <button
              key={p}
              onClick={() => !isActive && switchPhase(p)}
              disabled={isActive}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                phase === p 
                  ? "bg-primary/10 text-primary shadow-sm" 
                  : "text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:hover:text-muted-foreground"
              }`}
            >
              {PHASES[p].label}
            </button>
          ))}
        </div>

        {/* Huge Timer */}
        <div className="text-[5rem] leading-none font-medium tracking-tight tabular-nums mb-5 text-foreground drop-shadow-sm">
          {formatTime(timeLeft)}
        </div>

        {/* Linear Progress */}
        <div className="w-full max-w-sm mb-3">
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ease-linear ${phase === 'focus' ? 'bg-primary' : 'bg-green-500'}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Session Info */}
        <div className="text-sm text-muted-foreground font-medium">
          Session {pomodorosCompleted + 1} of 4 · {sessionsUntilLongBreak} session{sessionsUntilLongBreak !== 1 ? 's' : ''} until long break
        </div>

      </div>

      {/* Controls Container */}
      <div className="flex items-center justify-center gap-3 py-2">
        <button
          onClick={resetTimer}
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-border bg-card hover:bg-accent text-muted-foreground transition-all shadow-sm"
          title="Reset"
        >
          <RotateCcw size={18} />
        </button>

        <button
          onClick={toggleTimer}
          className={`px-8 h-10 flex items-center justify-center gap-2 rounded-xl text-primary-foreground font-medium transition-all shadow-md hover:scale-105 active:scale-95 ${isActive ? 'bg-foreground' : 'bg-primary'}`}
        >
          {isActive ? <Pause size={18} className="fill-current" /> : <Play size={18} className="fill-current translate-x-0.5" />}
          {isActive ? "Pause" : "Start"}
        </button>

        <button
          onClick={skipTimer}
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-border bg-card hover:bg-accent text-muted-foreground transition-all shadow-sm"
          title="Skip Phase"
        >
          <SkipForward size={18} />
        </button>
      </div>

      {/* Bottom Stat Cards */}
      <div className="grid grid-cols-3 gap-3 mt-1">
        <div className="border border-primary/20 bg-primary/5 rounded-xl p-3 flex flex-col justify-center">
          <div className="text-xl font-semibold text-primary">{stats.sessionsDone}</div>
          <div className="text-[11px] text-muted-foreground font-medium mt-0.5">sessions done</div>
        </div>
        
        <div className="border border-blue-500/20 bg-blue-500/5 rounded-xl p-3 flex flex-col justify-center">
          <div className="text-xl font-semibold text-blue-500">{formatHrsMins(stats.focusedMinutes)}</div>
          <div className="text-[11px] text-muted-foreground font-medium mt-0.5">focused today</div>
        </div>
        
        <div className="border border-orange-500/20 bg-orange-500/5 rounded-xl p-3 flex flex-col justify-center">
          <div className="text-xl font-semibold flex items-center gap-1.5 text-foreground">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            {stats.streak}
          </div>
          <div className="text-[11px] text-muted-foreground font-medium mt-0.5">day streak</div>
        </div>
      </div>

    </div>
  )
}
