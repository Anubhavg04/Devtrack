const DEFAULT_SECRET = "devtrack-github-token-secret"

const encoder = new TextEncoder()
const decoder = new TextDecoder()

function bytesToBase64(bytes: Uint8Array) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64")
  }
  let binary = ""
  bytes.forEach((b) => {
    binary += String.fromCharCode(b)
  })
  return btoa(binary)
}

function base64ToBytes(base64: string) {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(base64, "base64"))
  }
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

async function getKey() {
  const secret =
    process.env.GITHUB_TOKEN_SECRET ??
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    DEFAULT_SECRET
  const secretBytes = encoder.encode(secret)
  const hash = await crypto.subtle.digest("SHA-256", secretBytes)
  return crypto.subtle.importKey("raw", hash, "AES-GCM", false, ["encrypt", "decrypt"])
}

export async function encryptToken(token: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await getKey()
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(token)
  )
  return `${bytesToBase64(iv)}.${bytesToBase64(new Uint8Array(encryptedBuffer))}`
}

export async function decryptToken(payload: string) {
  const [ivPart, encryptedPart] = payload.split(".")
  if (!ivPart || !encryptedPart) {
    throw new Error("Invalid encrypted token format")
  }

  const iv = base64ToBytes(ivPart)
  const encrypted = base64ToBytes(encryptedPart)
  const key = await getKey()
  const decryptedBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encrypted)
  return decoder.decode(decryptedBuffer)
}
