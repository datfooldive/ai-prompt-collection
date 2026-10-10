import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import '@tanstack/react-start'
import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'

export const Route = createFileRoute('/api/upload')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const formData = await request.formData()
          const file = formData.get('file')

          if (!file || !(file instanceof File)) {
            return json({ error: 'No image file provided' }, { status: 400 })
          }

          if (!file.type.startsWith('image/')) {
            return json({ error: 'Only image files are allowed' }, { status: 400 })
          }

          const bytes = await file.arrayBuffer()
          const buffer = Buffer.from(bytes)

          const originalExt = path.extname(file.name) || '.png'
          const safeExt = /^\.[a-zA-Z0-9]+$/.test(originalExt)
            ? originalExt.toLowerCase()
            : '.png'
          const filename = `${Date.now()}-${crypto.randomUUID()}${safeExt}`

          const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
          await fs.mkdir(uploadsDir, { recursive: true })
          await fs.writeFile(path.join(uploadsDir, filename), buffer)

          return json({ url: `/uploads/${filename}` })
        } catch (error) {
          console.error('File upload error:', error)
          return json({ error: 'Failed to upload image' }, { status: 500 })
        }
      },
    },
  },
})
