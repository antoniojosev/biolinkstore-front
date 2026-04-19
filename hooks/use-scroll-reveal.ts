"use client"

import { useEffect, useRef } from "react"

interface ScrollRevealOptions {
  threshold?: number
  rootMargin?: string
}

/**
 * Adds .is-visible when element enters viewport.
 * Threshold defaults to 0 (any overlap triggers) with a small bottom
 * margin. Falls back to immediate reveal if the element is already on
 * screen at mount, so tall sections never get stuck at opacity:0.
 */
export function useScrollReveal<T extends HTMLElement>(
  options: ScrollRevealOptions = {}
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reveal = () => el.classList.add("is-visible")

    if (typeof IntersectionObserver === "undefined") {
      reveal()
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal()
          observer.unobserve(el)
        }
      },
      {
        threshold: options.threshold ?? 0,
        rootMargin: options.rootMargin ?? "0px 0px -10% 0px",
      }
    )

    observer.observe(el)

    const rect = el.getBoundingClientRect()
    const alreadyVisible = rect.top < window.innerHeight && rect.bottom > 0
    if (alreadyVisible) reveal()

    return () => observer.disconnect()
  }, [options.threshold, options.rootMargin])

  return ref
}

export function useStaggerReveal<T extends HTMLElement>(
  options: ScrollRevealOptions = {}
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reveal = () => el.classList.add("is-visible")

    if (typeof IntersectionObserver === "undefined") {
      reveal()
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal()
          observer.unobserve(el)
        }
      },
      {
        threshold: options.threshold ?? 0,
        rootMargin: options.rootMargin ?? "0px 0px -10% 0px",
      }
    )

    observer.observe(el)

    const rect = el.getBoundingClientRect()
    const alreadyVisible = rect.top < window.innerHeight && rect.bottom > 0
    if (alreadyVisible) reveal()

    return () => observer.disconnect()
  }, [options.threshold, options.rootMargin])

  return ref
}
