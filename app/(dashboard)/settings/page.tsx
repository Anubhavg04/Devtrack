import { redirect } from "next/navigation"
import { saveProfile } from "./actions"
import { SubmitButton } from "@/components/submitbutton"
import { AvatarPicker } from "@/components/avatar-picker"
import { getCurrentUser } from "@/lib/getUser"
import { getSettingsData } from "@/lib/settings-data"
import { Settings, User, Shield } from "lucide-react"

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ onboarding?: string }>
}) {
  const { onboarding } = await searchParams
  const isOnboarding = onboarding === "1"
  const currentUser = await getCurrentUser()
  const user = await getSettingsData(currentUser.id)
  if (!user) redirect("/login")

  return (
    <div className="flex flex-col gap-8 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold py-6 flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Profile & Account
        </h1>
        <p className="text-muted-foreground">
          {isOnboarding ? "Complete your profile to continue to dashboard" : "Manage your public profile and account"}
        </p>
      </div>

      <form action={saveProfile} className="flex flex-col gap-6">
        <input type="hidden" name="onboarding" value={isOnboarding ? "1" : "0"} />

        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <User className="h-4 w-4" />
          Public Profile
        </div>

        <div className="border border-border rounded-xl p-6 flex flex-col gap-4">
          <h2 className="font-semibold">Display Name</h2>
          <p className="text-sm text-muted-foreground">
            This will show on your public profile
          </p>
          <input
            name="displayName"
            placeholder="e.g. Anubhav Gupta"
            defaultValue={user.displayName ?? user.name ?? ""}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {isOnboarding ? (
            <button
              type="submit"
              name="intent"
              value="continue-dashboard"
              className="w-fit px-4 py-2 rounded-lg border border-border bg-background hover:bg-accent text-sm"
            >
              Continue to dashboard
            </button>
          ) : null}
        </div>

        <div className="border border-border rounded-xl p-6 flex flex-col gap-4">
          <h2 className="font-semibold">Public Username</h2>
          <p className="text-sm text-muted-foreground">
            Your profile → /u/your-username
          </p>
          <input
            name="username"
            placeholder="e.g. anubhav"
            defaultValue={user.username ?? ""}
            required={!isOnboarding}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="border border-border rounded-xl p-6 flex flex-col gap-4">
          <h2 className="font-semibold">Bio</h2>
          <p className="text-sm text-muted-foreground">
            A short intro for your public profile (GitHub-style)
          </p>
          <textarea
            name="bio"
            placeholder="Building in public. Learning full-stack every day."
            defaultValue={user.bio ?? ""}
            maxLength={280}
            rows={4}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        <AvatarPicker defaultAvatar={user.avatar} />

        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Shield className="h-4 w-4" />
          Account
        </div>

        <div className="border border-border rounded-xl p-6 flex flex-col gap-4">
          <h2 className="font-semibold">Email</h2>
          <p className="text-sm text-muted-foreground">
            Connected with Google and used for sign in
          </p>
          <input
            value={user.email}
            readOnly
            className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm text-muted-foreground"
          />
        </div>

        <SubmitButton
          label={isOnboarding ? "Save and continue" : "Save profile"}
          loadingLabel="Saving..."
          className="self-start"
        />
      </form>
    </div>
  )
}