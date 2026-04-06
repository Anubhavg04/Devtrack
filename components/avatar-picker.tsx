"use client"
import { useState } from "react"

const EMOJI_AVATARS = ["🧑‍💻", "👨‍🚀", "🦊", "🐉", "⚡", "🎯", "🔥", "🌙", "🦁", "🐺"]
const COLORS = [
  { name: "green", bg: "bg-green-500", value: "#22c55e" },
  { name: "blue", bg: "bg-blue-500", value: "#3b82f6" },
  { name: "purple", bg: "bg-purple-500", value: "#a855f7" },
  { name: "orange", bg: "bg-orange-500", value: "#f97316" },
  { name: "pink", bg: "bg-pink-500", value: "#ec4899" },
  { name: "cyan", bg: "bg-cyan-500", value: "#06b6d4" },
  { name: "red", bg: "bg-red-500", value: "#ef4444" },
  { name: "yellow", bg: "bg-yellow-500", value: "#eab308" },
]

export function AvatarPicker({ defaultAvatar }: { defaultAvatar?: string | null }) {
  const [emoji, color] = defaultAvatar?.split("::") ?? []
  const [selectedEmoji, setSelectedEmoji] = useState(emoji ?? "")
  const [selectedColor, setSelectedColor] = useState(color ?? "#22c55e")

  return (
    <div className="flex flex-col gap-6">
      {/* Preview */}
      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl border-2 border-border"
          style={{ backgroundColor: selectedColor + "33" }}
        >
          {selectedEmoji || "👤"}
        </div>
        <p className="text-sm text-muted-foreground">Preview</p>
      </div>

      {/* Emoji */}
      <div className="border border-border rounded-xl p-4 flex flex-col gap-3">
        <h3 className="text-sm font-medium">Choose Emoji</h3>
        <div className="flex flex-wrap gap-2">
          {EMOJI_AVATARS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setSelectedEmoji(e)}
              className={`w-10 h-10 rounded-xl border-2 text-xl transition-all
                ${selectedEmoji === e
                  ? "border-primary bg-primary/10 scale-110"
                  : "border-border hover:border-primary"
                }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div className="border border-border rounded-xl p-4 flex flex-col gap-3">
        <h3 className="text-sm font-medium">Choose Color</h3>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => setSelectedColor(c.value)}
              className={`w-8 h-8 rounded-full ${c.bg} transition-all
                ${selectedColor === c.value
                  ? "scale-125 ring-2 ring-white ring-offset-2"
                  : "hover:scale-110"
                }`}
            />
          ))}
        </div>
      </div>

      {/* Hidden inputs for form */}
      <input type="hidden" name="avatar" value={selectedEmoji} />
      <input type="hidden" name="avatarColor" value={selectedColor} />
    </div>
  )
}