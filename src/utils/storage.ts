type StorageArea = 'local' | 'session'

type ReadOptions<T> = {
  area?: StorageArea
  fallback: T
  validate?: (value: unknown) => value is T
}

type WriteOptions = {
  area?: StorageArea
}

type Envelope<T> = {
  version: number
  expiresAt?: number
  value: T
}

type ReadVersionedOptions<T> = ReadOptions<T> & {
  expectedVersion: number
}

type WriteVersionedOptions = WriteOptions & {
  version?: number
  ttlMs?: number
}

function getStorage(area: StorageArea): Storage | null {
  try {
    return area === 'session' ? window.sessionStorage : window.localStorage
  } catch {
    return null
  }
}

export function readStorageJson<T>(key: string, options: ReadOptions<T>): T {
  const storage = getStorage(options.area ?? 'local')
  if (!storage) return options.fallback

  try {
    const raw = storage.getItem(key)
    if (!raw) return options.fallback
    const parsed = JSON.parse(raw) as unknown
    if (options.validate && !options.validate(parsed)) {
      storage.removeItem(key)
      return options.fallback
    }
    return (parsed as T) ?? options.fallback
  } catch {
    return options.fallback
  }
}

export function writeStorageJson<T>(key: string, value: T, options: WriteOptions = {}): boolean {
  const storage = getStorage(options.area ?? 'local')
  if (!storage) return false
  try {
    storage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeStorageKey(key: string, options: WriteOptions = {}): void {
  const storage = getStorage(options.area ?? 'local')
  if (!storage) return
  try {
    storage.removeItem(key)
  } catch {
    /* ignore */
  }
}

function isEnvelope<T>(value: unknown): value is Envelope<T> {
  return typeof value === 'object' && value !== null && 'version' in value && 'value' in value
}

export function readVersionedStorage<T>(key: string, options: ReadVersionedOptions<T>): T {
  const envelope = readStorageJson<Envelope<T> | null>(key, {
    area: options.area,
    fallback: null,
    validate: (value): value is Envelope<T> => isEnvelope<T>(value),
  })
  if (!envelope) return options.fallback

  if (envelope.version !== options.expectedVersion) {
    removeStorageKey(key, { area: options.area })
    return options.fallback
  }
  if (envelope.expiresAt !== undefined && envelope.expiresAt <= Date.now()) {
    removeStorageKey(key, { area: options.area })
    return options.fallback
  }
  if (options.validate && !options.validate(envelope.value)) {
    removeStorageKey(key, { area: options.area })
    return options.fallback
  }

  return envelope.value
}

export function writeVersionedStorage<T>(
  key: string,
  value: T,
  options: WriteVersionedOptions = {},
): boolean {
  const version = options.version ?? 1
  const expiresAt = options.ttlMs ? Date.now() + options.ttlMs : undefined
  const envelope: Envelope<T> = { version, expiresAt, value }
  return writeStorageJson(key, envelope, { area: options.area })
}
