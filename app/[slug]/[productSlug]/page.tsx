import { redirect } from "next/navigation"

interface Props {
  params: Promise<{ slug: string; productSlug: string }>
}

/**
 * The dedicated per-product page (legacy 3-template renderer) has no live
 * caller left — the v2 storefront opens products in an in-page sheet instead
 * of navigating here. Redirects to the store page rather than 404ing on any
 * old/bookmarked link. Per-product deep links are a possible future feature,
 * not something this route ever served from a real UI flow.
 */
export default async function ProductDetailRedirect({ params }: Props) {
  const { slug } = await params
  redirect(`/${slug}`)
}
