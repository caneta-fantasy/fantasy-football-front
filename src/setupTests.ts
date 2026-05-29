import '@testing-library/jest-dom'

// Node 22+ exposes a partial experimental global `localStorage` that lacks the
// Storage API and shadows jsdom's implementation, so `localStorage.getItem` is
// undefined under vitest. Install a minimal in-memory Storage when that happens.
if (typeof localStorage === 'undefined' || typeof localStorage.getItem !== 'function') {
  class MemoryStorage implements Storage {
    private store = new Map<string, string>()
    get length(): number {
      return this.store.size
    }
    clear(): void {
      this.store.clear()
    }
    getItem(key: string): string | null {
      return this.store.has(key) ? (this.store.get(key) as string) : null
    }
    key(index: number): string | null {
      return Array.from(this.store.keys())[index] ?? null
    }
    removeItem(key: string): void {
      this.store.delete(key)
    }
    setItem(key: string, value: string): void {
      this.store.set(key, String(value))
    }
  }
  const storage = new MemoryStorage()
  Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true })
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'localStorage', { value: storage, configurable: true })
  }
}
