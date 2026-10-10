import { z } from 'zod'

export const promptSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  tags: z.array(z.string().trim()).default([]),
  prompt: z.string().trim().min(1, 'Prompt is required'),
  resultImage: z.string().trim().min(1, 'Result image is required'),
})

export const createPromptSchema = promptSchema

export const updatePromptSchema = promptSchema.extend({
  id: z.number().int().positive('ID must be a valid positive integer'),
})

export const getPromptByIdSchema = z.object({
  id: z.number().int().positive(),
})

export const deletePromptSchema = z.object({
  id: z.number().int().positive(),
})

export type PromptSchema = z.infer<typeof promptSchema>
export type CreatePromptInput = z.infer<typeof createPromptSchema>
export type UpdatePromptInput = z.infer<typeof updatePromptSchema>

export function parseTags(tags: string | string[]): string[] {
  if (Array.isArray(tags)) {
    return tags.map((t) => t.trim()).filter(Boolean)
  }
  return tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}

export function formatTags(tags?: string[]): string {
  if (!tags || tags.length === 0) return ''
  return tags.join(', ')
}
