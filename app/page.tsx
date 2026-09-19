/*
 * SITE-001 ships the deployable shell and nothing else.
 *
 * Non-goals, from the issue: no routes beyond `/`, no content. The fold
 * composition is SITE-007, the input is SITE-008, and the builder state
 * machine is SITE-012. This file exists so the export has a route to emit.
 */

export default function Home() {
  return <main />
}
