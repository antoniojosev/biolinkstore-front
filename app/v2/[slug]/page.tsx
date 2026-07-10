import { redirect } from "next/navigation"

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | undefined>>
}

/**
 * /v2/[slug] was the staging route for the templated storefront while it
 * lived alongside the legacy 3-template renderer at /[slug]. That renderer
 * is now canonical at /[slug] itself — this redirects old links/bookmarks.
 */
export default async function StorefrontV2Redirect({ params, searchParams }: Props) {
  const { slug } = await params
  const qs = new URLSearchParams(
    Object.entries(await searchParams).filter(([, v]) => v !== undefined) as [string, string][],
  ).toString()
  redirect(`/${slug}${qs ? `?${qs}` : ""}`)
}
