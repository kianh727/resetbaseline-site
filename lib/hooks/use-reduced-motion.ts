'use client'

/*
 * SITE-006 · `useReducedMotion()`.
 *
 * PRD §8.3: the site must be fully comprehensible with every animation
 * disabled. This hook is how components find out, and it stays live — a user
 * can change the OS setting mid-session, and a value read once at mount would
 * be wrong from then on.
 *
 * `useSyncExternalStore` rather than `useState` + `useEffect`: it gives the
 * server a defined snapshot instead of a hydration mismatch, and it is already
 * in React, so it costs nothing against the 120 KB ceiling.
 *
 * The server snapshot is `false`. On the server there is no preference to
 * read, and a static export has no request-time hint; a component that renders
 * its reduced state on the server and its animated state on the client would
 * flash. `false` means "no reduction known yet", and a true preference applies
 * on mount, before any animation this project runs has begun.
 */

import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(onChange: () => void): () => void {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches
}

function getServerSnapshot(): boolean {
  return false
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
