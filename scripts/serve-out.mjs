/*
 * A minimal static server for the exported site, used by the overflow check.
 *
 * `file://` is not an option: the export references its chunks at absolute
 * paths like `/_next/static/...`, which resolve against the filesystem root
 * under `file://` and 404. So the check needs an origin.
 *
 * Hand-written rather than a dependency — it serves one directory to one
 * local browser and is about forty lines.
 */

import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { join, extname, normalize } from 'node:path'

/*
 * **The headers come from the file that ships, parsed, not recomputed.**
 * `out/_headers` carries per-build inline-script hashes, so a server calling
 * `headersFor()` would apply a *different* policy from the deployed one — and
 * the difference would be exactly the part that decides whether the page
 * hydrates. Parsing the artefact makes the local run and production two
 * readings of one file rather than two implementations of one intention.
 */
function parseHeadersFile(root) {
  let text
  try {
    text = readFileSync(join(root, '_headers'), 'utf8')
  } catch {
    return []
  }

  const rules = []
  let current = null
  for (const line of text.split('\n')) {
    if (line.trim().length === 0 || line.trimStart().startsWith('#')) continue
    if (!line.startsWith(' ')) {
      current = { path: line.trim(), headers: {} }
      rules.push(current)
      continue
    }
    const at = line.indexOf(':')
    if (current && at > 0) {
      current.headers[line.slice(0, at).trim()] = line.slice(at + 1).trim()
    }
  }
  return rules
}

function headersFrom(rules, pathname) {
  const out = {}
  for (const rule of rules) {
    const pattern = new RegExp(
      `^${rule.path.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`,
    )
    if (pattern.test(pathname)) Object.assign(out, rule.headers)
  }
  return out
}

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
}

export async function serve(root, port = 0) {
  const headerRules = parseHeadersFile(root)

  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? '/', 'http://localhost')
      // normalize() collapses `..`, so a request cannot escape the root.
      let path = join(root, normalize(decodeURIComponent(url.pathname)))
      try {
        if ((await stat(path)).isDirectory()) path = join(path, 'index.html')
      } catch {
        // Fall through to the read, which produces the 404.
      }
      const body = await readFile(path)
      /*
       * **The deployment's real headers, applied locally.** Without this the
       * CSP would first run in production, on the one page nobody can fix
       * quickly — and every check in this repository would have been measuring
       * a more permissive site than the one that ships.
       */
      res.writeHead(200, {
        'content-type': TYPES[extname(path)] ?? 'application/octet-stream',
        ...headersFrom(headerRules, url.pathname),
      })
      res.end(body)
    } catch {
      res.writeHead(404, { 'content-type': 'text/plain' })
      res.end('not found')
    }
  })

  await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve))
  const { port: actual } = /** @type {{ port: number }} */ (server.address())
  return {
    origin: `http://127.0.0.1:${actual}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  }
}
