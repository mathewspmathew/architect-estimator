class RateLimiter {
  private store: Map<string, number[]> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null
  private readonly MAX_REQUESTS = 5
  private readonly WINDOW_MS = 600000 // 10 minutes

  constructor() {
    this.startCleanup()
  }

  check(ip: string): boolean {
    const now = Date.now()
    const timestamps = this.store.get(ip) || []

    const recentTimestamps = timestamps.filter((ts) => now - ts < this.WINDOW_MS)

    if (recentTimestamps.length >= this.MAX_REQUESTS) {
      return false
    }

    recentTimestamps.push(now)
    this.store.set(ip, recentTimestamps)
    return true
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      for (const [ip, timestamps] of this.store.entries()) {
        const validTimestamps = timestamps.filter((ts) => now - ts < this.WINDOW_MS)
        if (validTimestamps.length === 0) {
          this.store.delete(ip)
        } else {
          this.store.set(ip, validTimestamps)
        }
      }
    }, this.WINDOW_MS)
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
  }
}

export const rateLimiter = new RateLimiter()
