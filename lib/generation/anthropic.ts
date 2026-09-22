/*
 * SITE-032 · The generated provider — PRD v7.3 §6.5, §12.
 *
 * Wraps one Messages API call behind `PlanProvider`, so everything above it —
 * the timeout, the field-by-field fallback, the five failure reasons — is
 * `resolvePlan`'s and is already built and tested. This file's whole job is to
 * turn one HTTP call into either three validated fields or a named failure.
 *
 * ---
 *
 * **The transport is injected, and that is what keeps CI off the network.**
 * A provider that called `fetch` directly could only be tested by a flag saying
 * *skip this in CI* — and a suite that skips its own subject reports a pass for
 * a path nobody ran, which is §0.3 with the network as the missing thing. Here
 * there is no live path to skip: the tests hand it a transport that returns
 * fixtures, and the deployment hands it `fetch`. Neither knows about the other.
 *
 * **The key is read from a named environment variable and is never a default.**
 * A provider constructed without one throws at construction rather than at the
 * first request, because a missing key that surfaces as a `network_error` on
 * every call is a misconfiguration wearing a failure mode's clothes — the site
 * would fall back silently and correctly, forever, and look like it was working.
 */

import { ProviderFailure } from '../providers/resolve.ts'
import type { PlanFields, PlanProvider, PlanRequest } from '../providers/types.ts'
import { validateFields } from '../providers/validate.ts'
import { costCents, requestBody, windowForId } from './prompt.ts'

export const API_URL = 'https://api.anthropic.com/v1/messages'
export const API_VERSION = '2023-06-01'

/** The env var holding the key. **Named only** — no value appears in this tree. */
export const API_KEY_ENV = 'ANTHROPIC_API_KEY'

/** Exactly `fetch`'s shape, so the deployment passes `fetch` itself. */
export type Transport = (url: string, init: RequestInit) => Promise<Response>

export interface GeneratedProviderOptions {
  readonly apiKey: string
  readonly transport: Transport
  /** Called with the request's cost once it is known. Feeds the daily cap. */
  readonly onSpend?: (cents: number) => void | Promise<void>
}

/**
 * Pull the model's JSON out of a Messages response.
 *
 * **Not a lenient parse.** It concatenates the text blocks and parses once. It
 * does not strip markdown fences, hunt for the first `{`, or retry on a
 * substring — every one of those recovers a response the model was told not to
 * send, and recovering it is how the instruction stops being enforced. A model
 * that fences its JSON should show up as a discard rate, which is a fact about
 * the prompt, not a bug in the parser.
 */
function parseModelJson(payload: unknown): unknown {
  const content = (payload as { content?: unknown })?.content
  if (!Array.isArray(content)) throw new ProviderFailure('invalid_schema')

  const text = content
    .filter((b): b is { type: string; text: string } => {
      const block = b as { type?: unknown; text?: unknown }
      return block.type === 'text' && typeof block.text === 'string'
    })
    .map((b) => b.text)
    .join('')

  if (text.trim().length === 0) throw new ProviderFailure('invalid_schema')

  try {
    return JSON.parse(text) as unknown
  } catch {
    throw new ProviderFailure('invalid_schema')
  }
}

export function createGeneratedProvider(options: GeneratedProviderOptions): PlanProvider {
  if (!options.apiKey) {
    throw new Error(
      `${API_KEY_ENV} is not set. Generation is optional on this site, but a ` +
        'provider constructed without a key would fail every request as a ' +
        'network error and fall back silently — indistinguishable from working.',
    )
  }

  return {
    name: 'generated',

    async generate(request: PlanRequest): Promise<PlanFields> {
      let response: Response
      try {
        const init: RequestInit = {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-api-key': options.apiKey,
            'anthropic-version': API_VERSION,
          },
          body: JSON.stringify(requestBody(request.rawGoal, request.wantsClarification)),
        }
        if (request.signal) init.signal = request.signal
        response = await options.transport(API_URL, init)
      } catch (error) {
        // An abort surfaces here as a throw. It is the orchestrator's timeout,
        // not a network failure, and mislabelling it would send the wrong
        // reason to `plan_generation_fallback` — the one field that event
        // carries.
        if (request.signal?.aborted) throw new ProviderFailure('timeout')
        if (error instanceof ProviderFailure) throw error
        throw new ProviderFailure('network_error')
      }

      if (response.status === 429) throw new ProviderFailure('rate_limit')
      if (!response.ok) throw new ProviderFailure('network_error')

      let payload: unknown
      try {
        payload = await response.json()
      } catch {
        throw new ProviderFailure('invalid_schema')
      }

      const usage = (payload as { usage?: { input_tokens?: number; output_tokens?: number } }).usage
      if (options.onSpend && usage) {
        await options.onSpend(costCents(usage.input_tokens ?? 0, usage.output_tokens ?? 0))
      }

      const raw = parseModelJson(payload) as Record<string, unknown>

      /*
       * The window arrives as an id and is resolved to minutes **before**
       * validation, so an unknown id becomes `null` — a discarded field — rather
       * than reaching the validator as a shape it would reject for the wrong
       * reason. The resolution is the membership check; the validator checks the
       * shape. Neither is the other's second source.
       */
      return validateFields({
        title: raw['title'],
        window: windowForId(raw['window']),
        clarification: request.wantsClarification ? raw['clarification'] : undefined,
      })
    },
  }
}
