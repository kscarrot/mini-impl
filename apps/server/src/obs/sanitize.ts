import type { Context } from 'koa'

const DEFAULT_REDACT = new Set(['password', 'token', 'authorization', 'cookie', 'set-cookie'])

export interface SanitizeOptions {
  redactKeys?: string[]
  maxStringLen?: number
  maxDepth?: number
  maxKeys?: number
}

function mergedRedact(keys?: string[]): Set<string> {
  const s = new Set(DEFAULT_REDACT)
  if (keys) {
    for (const k of keys)
      s.add(k.toLowerCase())
  }
  return s
}

function isKoaContext(x: unknown): x is Context {
  if (x == null || typeof x !== 'object')
    return false
  const o = x as Record<string, unknown>
  return typeof o.method === 'string' && typeof o.url === 'string' && 'status' in o
}

function summarizeKoaContext(ctx: Context, maxStringLen: number): Record<string, unknown> {
  return {
    kind: 'Koa.Context',
    method: ctx.method,
    path: ctx.path,
    url: truncate(String(ctx.url), maxStringLen),
    status: ctx.status,
  }
}

function truncate(s: string, max: number): string {
  if (s.length <= max)
    return s
  return `${s.slice(0, max)}…(${s.length})`
}

export function summarizeValue(value: unknown, options: SanitizeOptions = {}, depth = 0): unknown {
  const maxStringLen = options.maxStringLen ?? 200
  const maxDepth = options.maxDepth ?? 4
  const maxKeys = options.maxKeys ?? 40
  const redact = mergedRedact(options.redactKeys)

  if (depth > maxDepth)
    return '[MaxDepth]'

  if (value === null || value === undefined)
    return value

  if (typeof value === 'string')
    return truncate(value, maxStringLen)

  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint')
    return value

  if (typeof value === 'symbol')
    return value.toString()

  if (typeof value === 'function')
    return `[Function ${value.name || 'anonymous'}]`

  if (isKoaContext(value))
    return summarizeKoaContext(value, maxStringLen)

  if (Array.isArray(value)) {
    const cap = Math.min(value.length, 20)
    const items = value.slice(0, cap).map(v => summarizeValue(v, options, depth + 1))
    if (value.length > cap)
      (items as unknown[]).push(`…+${value.length - cap} more`)
    return { kind: 'Array', len: value.length, items }
  }

  if (typeof value === 'object') {
    const o = value as Record<string, unknown>
    const keys = Object.keys(o)
    const out: Record<string, unknown> = { kind: 'Object', keys: keys.length }
    let n = 0
    for (const k of keys) {
      if (n >= maxKeys) {
        out['…'] = `${keys.length - maxKeys} more keys`
        break
      }
      const lk = k.toLowerCase()
      if (redact.has(lk)) {
        out[k] = '[REDACTED]'
      }
      else {
        out[k] = summarizeValue(o[k], options, depth + 1)
      }
      n++
    }
    return out
  }

  return String(value)
}
