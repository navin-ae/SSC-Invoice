export function shouldShowTooltip(key: string) {
  return !localStorage.getItem(`ssc_ttip_${key}`);
}

export function dismissTooltip(key: string) {
  localStorage.setItem(`ssc_ttip_${key}`, '1');
}
