import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/getUser"
import { getSettingsData } from "@/lib/settings-data"
import { Share2, Copy, Twitter, Linkedin, ExternalLink } from "lucide-react"
import { ShareButton, ShareLinkDisplay } from "./share-button-client"

export default async function SharePage() {
  const currentUser = await getCurrentUser()
  const user = await getSettingsData(currentUser.id)
  
  if (!user) redirect("/login")
  
  if (!user.username) {
    // If they don't have a username yet, they can't have a public profile
    return (
      <div className="flex flex-col gap-8 max-w-lg">
        <div>
          <h1 className="text-2xl font-bold py-6 flex items-center gap-2">
            <Share2 className="h-6 w-6" />
            Share Profile
          </h1>
          <p className="text-muted-foreground">
            You need to set a Public Username before you can share your profile!
          </p>
        </div>
        
        <div className="border border-border rounded-xl p-6 flex flex-col gap-4 items-center text-center">
          <span className="text-4xl">👤</span>
          <h3 className="font-semibold text-lg">No Username Set</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Go to your Settings to choose a unique username so people can visit your public developer resume.
          </p>
          <a href="/settings" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
            Go to Settings
          </a>
        </div>
      </div>
    )
  }

  // Note: We'll construct the full URL on the client-side inside the ShareButton component
  // because server components don't always know the exact host/protocol reliably in all deployments.
  const profilePath = `/u/${user.username}`

  return (
    <div className="flex flex-col gap-8 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold py-6 flex items-center gap-2">
          <Share2 className="h-6 w-6" />
          Share Profile
        </h1>
        <p className="text-muted-foreground">
          Share your progress, heatmaps, and stats with the world.
        </p>
      </div>

      <div className="border border-border rounded-xl p-6 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="font-semibold">Your Public Link</h2>
          <div className="flex items-center gap-2">
            <ShareLinkDisplay path={profilePath} />
            <a 
              href={profilePath} 
              target="_blank" 
              rel="noreferrer"
              className="p-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              title="Open profile"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-border">
          <ShareButton 
            platform="copy" 
            path={profilePath}
            className="flex items-center justify-center gap-2 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors font-medium text-sm"
          >
            <Copy className="w-4 h-4" />
            Copy Link
          </ShareButton>
          
          <ShareButton 
            platform="twitter" 
            path={profilePath}
            className="flex items-center justify-center gap-2 py-3 bg-[#1DA1F2] text-white rounded-lg hover:bg-[#1A91DA] transition-colors font-medium text-sm"
          >
            <Twitter className="w-4 h-4" />
            Twitter
          </ShareButton>

          <ShareButton 
            platform="linkedin" 
            path={profilePath}
            className="flex items-center justify-center gap-2 py-3 bg-[#0A66C2] text-white rounded-lg hover:bg-[#0958A6] transition-colors font-medium text-sm"
          >
            <Linkedin className="w-4 h-4" />
            LinkedIn
          </ShareButton>
        </div>
      </div>
    </div>
  )
}
