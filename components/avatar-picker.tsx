"use client"
import { useState, useEffect } from "react"
import { DICEBEAR_COLLECTIONS } from "./user-avatar"
import { Dices } from "lucide-react"

export function AvatarPicker({ defaultAvatar, username }: { defaultAvatar?: string | null, username?: string }) {
  const [collection, setCollection] = useState<typeof DICEBEAR_COLLECTIONS[number]>("bottts")
  const [seed, setSeed] = useState(username || "user")

  // Initialize from defaultAvatar
  useEffect(() => {
    if (defaultAvatar && defaultAvatar.startsWith("dicebear::")) {
      const [, c, s] = defaultAvatar.split("::")
      if (c && DICEBEAR_COLLECTIONS.includes(c as any)) {
        setCollection(c as any)
      }
      if (s) {
        setSeed(s)
      }
    }
  }, [defaultAvatar])

  const generateRandomSeed = () => {
    setSeed(Math.random().toString(36).substring(2, 10))
  }

  const previewUrl = `https://api.dicebear.com/7.x/${collection}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`

  return (
    <div className="flex flex-col gap-6">
      {/* Preview */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-border flex-shrink-0 bg-muted">
          <img src={previewUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-foreground">Avatar Preview</p>
          <button
            type="button"
            onClick={generateRandomSeed}
            className="flex items-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground px-3 py-1.5 rounded-full hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Dices size={14} />
            Shuffle Seed
          </button>
        </div>
      </div>

      {/* Collection Picker */}
      <div className="border border-border rounded-xl p-4 flex flex-col gap-3">
        <h3 className="text-sm font-medium">Choose Art Style</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {DICEBEAR_COLLECTIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCollection(c)}
              className={`flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all
                ${collection === c
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-primary/50"
                }`}
            >
              <img 
                src={`https://api.dicebear.com/7.x/${c}/svg?seed=example&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`} 
                alt={c} 
                className="w-10 h-10 rounded-full"
              />
              <span className="text-xs font-medium capitalize">{c}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Hidden input for form */}
      <input type="hidden" name="avatar" value={`dicebear::${collection}::${seed}`} />
    </div>
  )
}