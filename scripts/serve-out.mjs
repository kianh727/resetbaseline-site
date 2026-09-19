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
import { join, extname, normalize } from 'node:path'

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
      res.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' })
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
