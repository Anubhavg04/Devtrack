import { redirect } from "next/navigation"
import { saveProfile } from "./actions"
import { SubmitButton } from "@/components/submitbutton"
import { AvatarPicker } from "@/components/avatar-picker"
import { getCurrentUser } from "@/lib/getUser"
import { getSettingsData } from "@/lib/settings-data"

export default async function SettingsPage() {
  const currentUser = await getCurrentUser()
  const user = await getSettingsData(currentUser.id)
  if (!user) redirect("/login")

  return (
    <div className="flex flex-col gap-8 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold py-6">Settings</h1>
        <p className="text-muted-foreground">Manage your profile</p>
      </div>

      <form action={saveProfile} className="flex flex-col gap-6">

        {/* Display Name */}
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
        </div>

        {/* Username */}
        <div className="border border-border rounded-xl p-6 flex flex-col gap-4">
          <h2 className="font-semibold">Public Username</h2>
          <p className="text-sm text-muted-foreground">
            Your profile → /u/your-username
          </p>
          <input
            name="username"
            placeholder="e.g. anubhav"
            defaultValue={user.username ?? ""}
            required
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Avatar Picker */}
        <AvatarPicker defaultAvatar={user.avatar} />

        <SubmitButton label="Save profile" loadingLabel="Saving..." className="self-start" />
      </form>
    </div>
  )
}