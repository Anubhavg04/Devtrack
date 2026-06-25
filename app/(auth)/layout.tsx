import { ReactNode } from "react"
import { Activity, Code2, GitBranch, Terminal, BookOpen } from "lucide-react"
import { DevTrackLogo } from "@/components/ui/devtrack-logo"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      {/* Left side - Forms */}
      <div className="flex w-full flex-col justify-center pb-24 px-4 py-12 sm:px-6 lg:flex-none lg:w-1/2 lg:px-20 xl:px-24 bg-background z-10 relative shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
        
        {/* Small Logo for Left Panel */}
        <div className="absolute top-8 left-8 sm:left-12 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl border border-indigo-500/30 bg-indigo-500/10 flex items-center justify-center">
            <BookOpen size={16} className="text-indigo-500" />
          </div>
          <div className="flex flex-col">
            <DevTrackLogo className="text-lg leading-none" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Track. Improve. Ship.</span>
          </div>
        </div>

        <div className="mx-auto w-full max-w-sm -mt-12">
          {children}
        </div>
      </div>

      {/* Right side - Developer Visuals */}
      <div className="hidden lg:flex relative w-1/2 flex-col items-center justify-center bg-muted/10 overflow-hidden">
        
        {/* Animated background subtle pattern */}
        <div 
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, oklch(0.5 0 0 / 0.15) 1px, transparent 1px),
              linear-gradient(to bottom, oklch(0.5 0 0 / 0.15) 1px, transparent 1px)
            `,
            backgroundSize: "64px 64px",
          }}
        />

        {/* Glow effects */}
        <div className="absolute top-1/4 left-1/4 w-[30vw] h-[30vw] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Content wrapper */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-2xl p-8 2xl:scale-125 transition-transform duration-500">
          
          <div className="flex flex-col items-center gap-6 mb-16 text-center">
            <div className="w-20 h-20 rounded-3xl border border-indigo-500/30 bg-card/50 flex items-center justify-center shadow-2xl backdrop-blur-sm shadow-indigo-500/10">
              <BookOpen size={40} className="text-indigo-500" />
            </div>
            <div>
              <h1 className="text-4xl mb-1">
                <DevTrackLogo />
              </h1>
              <p className="mt-4 text-xl text-muted-foreground font-light tracking-wide max-w-md mx-auto">
                Your GitHub-style developer journey.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 w-full">
            
            {/* Feature Cards */}
            <div className="p-6 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-md flex flex-col gap-3 shadow-xl transform hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-indigo-500/10 transition-all duration-300">
              <Activity className="w-6 h-6 text-indigo-500" />
              <div className="space-y-1">
                <div className="text-base font-semibold text-foreground">Track Progress</div>
                <div className="text-sm text-foreground/80">Monitor your learning streaks</div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-md flex flex-col gap-3 shadow-xl transform hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-indigo-500/10 transition-all duration-300">
              <Code2 className="w-6 h-6 text-indigo-500" />
              <div className="space-y-1">
                <div className="text-base font-semibold text-foreground">Log Sessions</div>
                <div className="text-sm text-foreground/80">Record every coding hour</div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-md flex flex-col gap-3 shadow-xl col-span-2 transform hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-indigo-500/10 transition-all duration-300">
              <GitBranch className="w-6 h-6 text-indigo-500" />
              <div className="space-y-1">
                <div className="text-base font-semibold text-foreground">GitHub Integration</div>
                <div className="text-sm text-foreground/80">Sync your commits and PRs directly into your learning timeline to see a complete picture of your growth.</div>
              </div>
            </div>

          </div>

          {/* Decorative code block */}
          <div className="mt-12 w-full p-6 pb-8 rounded-xl bg-[#0d1117] border border-white/10 shadow-2xl backdrop-blur-md font-mono text-sm sm:text-base text-gray-300 relative">
            <div className="absolute top-0 left-0 w-full h-10 bg-black/40 flex items-center px-4 gap-2 border-b border-white/5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="mt-6 space-y-2 opacity-90">
              <div className="text-gray-500">{"// Initialize new developer journey"}</div>
              <div><span className="text-pink-400">const</span> developer <span className="text-blue-400">=</span> <span className="text-pink-400">new</span> <span className="text-yellow-200">User</span>()</div>
              <div className="flex items-center">
                <span className="text-pink-400">await</span>&nbsp;developer.<span className="text-blue-400">trackSession</span>({"{"}
                <div className="ml-2 w-2 h-5 bg-gray-400 animate-pulse" />
              </div>
              <div className="pl-6">topic: <span className="text-green-300">"Authentication Systems"</span>,</div>
              <div className="pl-6">duration: <span className="text-orange-300">120</span>,</div>
              <div className="pl-6">status: <span className="text-green-300">"mastered"</span></div>
              <div>{"}"})</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
