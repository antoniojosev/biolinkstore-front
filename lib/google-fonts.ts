/**
 * Builds a Google Fonts CSS2 stylesheet URL for the given family names.
 * Storefront typography (FONT_WHITELIST) is theme-driven — only known at
 * render time per store — so we can't use next/font's static imports here.
 */
export function googleFontsHref(families: string[]): string {
  const unique = Array.from(new Set(families.filter(Boolean)))
  const params = unique
    .map((name) => `family=${encodeURIComponent(name)}:wght@400;500;600;700`)
    .join("&")
  return `https://fonts.googleapis.com/css2?${params}&display=swap`
}
