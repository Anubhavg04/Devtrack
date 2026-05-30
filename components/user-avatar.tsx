"use client"
import React from 'react'

export const DICEBEAR_COLLECTIONS = [
  "bottts",
  "micah",
  "lorelei",
  "avataaars",
  "adventurer",
  "fun-emoji",
  "notionists"
] as const

type Collection = typeof DICEBEAR_COLLECTIONS[number]

interface Props {
  avatar: string | null
  name: string | null
  image?: string | null
  size?: number | string
  className?: string
}

export function UserAvatar({ avatar, name, image, size = 40, className = "" }: Props) {
  const seedName = name || "User"
  
  if (avatar && avatar.startsWith("dicebear::")) {
    const [, collection, seed] = avatar.split("::")
    const validCollection = DICEBEAR_COLLECTIONS.includes(collection as Collection) ? collection : "bottts"
    const finalSeed = seed || seedName
    const url = `https://api.dicebear.com/7.x/${validCollection}/svg?seed=${encodeURIComponent(finalSeed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`
    
    return (
      <img
        src={url}
        alt="avatar"
        className={`rounded-full object-cover flex-shrink-0 ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  // Fallback for old emoji avatars (backward compatibility)
  if (avatar) {
    const [emoji, color] = avatar.split("::")
    if (emoji && color && emoji.length <= 2) {
      return (
        <div 
          className={`rounded-full border-2 border-border flex flex-shrink-0 items-center justify-center ${className}`}
          style={{ width: size, height: size, backgroundColor: color + "33", fontSize: typeof size === 'number' ? size * 0.5 : '1.5rem' }}
        >
          {emoji}
        </div>
      )
    }
    
    if (avatar.startsWith("#")) {
      return (
        <div
          className={`rounded-full flex flex-shrink-0 items-center justify-center font-bold text-white ${className}`}
          style={{ width: size, height: size, backgroundColor: avatar, fontSize: typeof size === 'number' ? size * 0.4 : '1.2rem' }}
        >
          {seedName[0]?.toUpperCase()}
        </div>
      )
    }
  }

  // Google OAuth image fallback
  if (image) {
    return (
      <img
        src={image}
        alt="avatar"
        className={`rounded-full object-cover flex-shrink-0 ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  // Default fallback if no avatar
  return (
    <div
      className={`rounded-full border border-border flex flex-shrink-0 items-center justify-center font-bold text-muted-foreground bg-muted ${className}`}
      style={{ width: size, height: size, fontSize: typeof size === 'number' ? size * 0.4 : '1.2rem' }}
    >
      {seedName[0]?.toUpperCase()}
    </div>
  )
}
