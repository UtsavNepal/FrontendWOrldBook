export function collectIds(...values: unknown[]): string[] {
  return values
    .flatMap((value) => {
      if (value == null) return [];
      if (typeof value === "object") {
        const item = value as Record<string, any>;
        return [item.id, item.user?.id, item.profile_id, item.userId, item.profile?.id];
      }
      return [value];
    })
    .filter((value) => value != null && value !== "")
    .map((value) => String(value));
}

export function refersTo(side: any, target: any): boolean {
  const left = new Set(collectIds(side));
  return collectIds(target).some((id) => left.has(id));
}
