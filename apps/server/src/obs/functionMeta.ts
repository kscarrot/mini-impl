/** Preserve symbols (e.g. route metadata) when wrapping controller methods. */
export function copyMethodSymbols(from: object, to: object): void {
  for (const key of Reflect.ownKeys(from)) {
    if (typeof key === 'symbol')
      (to as Record<PropertyKey, unknown>)[key] = (from as Record<PropertyKey, unknown>)[key]
  }
}
