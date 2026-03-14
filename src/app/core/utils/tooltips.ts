const dismissedTooltips = new Set<string>();

export function shouldShowTooltip(key: string) {
  return !dismissedTooltips.has(key);
}

export function dismissTooltip(key: string) {
  dismissedTooltips.add(key);
}
