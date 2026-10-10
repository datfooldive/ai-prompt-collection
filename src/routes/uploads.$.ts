import { createFileRoute } from '@tanstack/react-router'
import '@tanstack/react-start'
import fs from 'node:fs/promises'
import path from 'node:path'

const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
}

export const Route = createFileRoute('/uploads/$')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const filename = params._splat
          if (!filename) {
            return new Response('File not found', { status: 404 })
          }

          // Secure against path traversal
          const safeName = path.basename(filename)
          const filePath = path.join(process.cwd(), 'public', 'uploads', safeName)
          const fileBuffer = await fs.readFile(filePath)

          const ext = path.extname(safeName).toLowerCase()
          const contentType = MIME_TYPES[ext] || 'application/octet-stream'

          return new Response(fileBuffer, {
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=31536000, immutable',
            },
          })
        } catch {
          return new Response('File not found', { status: 404 })
        }
      },
    },
  },
})
