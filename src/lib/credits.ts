import { Redis } from "@upstash/redis"

const redis = Redis.fromEnv()

export const FREE_CREDITS = 10

function key(userId: string): string {
  return `credits:${userId}`
}

export async function getCredits(userId: string): Promise<number> {
  const existing = await redis.get<number>(key(userId))
  if (existing === null || existing === undefined) {
    await redis.set(key(userId), FREE_CREDITS)
    return FREE_CREDITS
  }
  return existing
}

// Atomically decrements and returns the remaining balance, or null if the
// user had no credits left (decrement is not applied in that case).
export async function spendCredit(userId: string): Promise<number | null> {
  await getCredits(userId) // ensure the key is initialized for new users
  const remaining = await redis.decr(key(userId))
  if (remaining < 0) {
    await redis.incr(key(userId)) // undo, don't let balance go negative
    return null
  }
  return remaining
}

export async function refundCredit(userId: string): Promise<void> {
  await redis.incr(key(userId))
}
