import * as React from 'react'
import { useForm } from '@tanstack/react-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ImageIcon, Loader2 } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { useTRPC } from '#/integrations/trpc/react'
import {
  formatTags,
  parseTags,
  promptSchema,
} from '#/lib/prompt-schema'
import { cn } from '#/lib/utils'

export interface PromptItem {
  id: number
  name: string
  tags: string[]
  prompt: string
  resultImage: string
  createdAt: Date | string
  updatedAt: Date | string
}

interface PromptFormProps {
  initialData?: PromptItem | null
  onSuccess: () => void
  onCancel: () => void
}

export function PromptForm({
  initialData,
  onSuccess,
  onCancel,
}: PromptFormProps) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const createMutation = useMutation(trpc.prompt.create.mutationOptions())
  const updateMutation = useMutation(trpc.prompt.update.mutationOptions())

  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string>(
    initialData?.resultImage ?? ''
  )
  const [fileError, setFileError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      name: initialData?.name ?? '',
      tags: formatTags(initialData?.tags),
      prompt: initialData?.prompt ?? '',
      resultImage: initialData?.resultImage ?? '',
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true)
      setSubmitError(null)

      try {
        let finalImageUrl = value.resultImage

        // If user picked a new file, upload it to the server
        if (selectedFile) {
          const formData = new FormData()
          formData.append('file', selectedFile)

          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })

          if (!uploadRes.ok) {
            const errData = await uploadRes.json().catch(() => ({}))
            throw new Error(errData.error || 'Failed to upload image')
          }

          const uploadData = await uploadRes.json()
          finalImageUrl = uploadData.url
        }

        if (!finalImageUrl) {
          setFileError('Result image is required')
          setIsSubmitting(false)
          return
        }

        const parsedTags = parseTags(value.tags)
        const payload = {
          name: value.name.trim(),
          tags: parsedTags,
          prompt: value.prompt.trim(),
          resultImage: finalImageUrl,
        }

        // Validate with shared Zod schema
        const validation = promptSchema.safeParse(payload)
        if (!validation.success) {
          setSubmitError(
            validation.error.issues[0]?.message || 'Please check form fields'
          )
          setIsSubmitting(false)
          return
        }

        if (initialData?.id) {
          await updateMutation.mutateAsync({
            id: initialData.id,
            ...payload,
          })
        } else {
          await createMutation.mutateAsync(payload)
        }

        await queryClient.invalidateQueries({
          queryKey: trpc.prompt.list.queryKey(),
        })

        onSuccess()
      } catch (err: any) {
        console.error('Submit error:', err)
        setSubmitError(err?.message || 'An error occurred while saving')
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setFileError('Only image files are allowed')
      return
    }

    setFileError(null)
    setSelectedFile(file)
    const localUrl = URL.createObjectURL(file)
    setPreviewUrl(localUrl)
    form.setFieldValue('resultImage', localUrl)
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-4"
    >
      {submitError && (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {submitError}
        </div>
      )}

      {/* Name Field */}
      <form.Field
        name="name"
        validators={{
          onChange: ({ value }) => {
            const res = promptSchema.shape.name.safeParse(value)
            return res.success ? undefined : res.error.issues[0]?.message
          },
        }}
      >
        {(field) => (
          <div className="space-y-1.5">
            <Label htmlFor={field.name} className="text-sm font-medium">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="e.g. Cyberpunk Neon Samurai"
              disabled={isSubmitting}
              className={
                field.state.meta.errors.length
                  ? 'border-destructive focus-visible:ring-destructive/30'
                  : ''
              }
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-xs text-destructive">
                {String(field.state.meta.errors[0])}
              </p>
            )}
          </div>
        )}
      </form.Field>

      {/* Tags Field */}
      <form.Field name="tags">
        {(field) => (
          <div className="space-y-1.5">
            <Label htmlFor={field.name} className="text-sm font-medium">
              Tags{' '}
              <span className="text-xs font-normal text-muted-foreground">
                (optional, comma-separated)
              </span>
            </Label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="e.g. portrait, cyberpunk, cinematic, 8k"
              disabled={isSubmitting}
            />
          </div>
        )}
      </form.Field>

      {/* Prompt Field */}
      <form.Field
        name="prompt"
        validators={{
          onChange: ({ value }) => {
            const res = promptSchema.shape.prompt.safeParse(value)
            return res.success ? undefined : res.error.issues[0]?.message
          },
        }}
      >
        {(field) => (
          <div className="space-y-1.5">
            <Label htmlFor={field.name} className="text-sm font-medium">
              Prompt <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Enter the complete prompt text used to generate the image..."
              rows={4}
              disabled={isSubmitting}
              className={
                field.state.meta.errors.length
                  ? 'border-destructive focus-visible:ring-destructive/30'
                  : ''
              }
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-xs text-destructive">
                {String(field.state.meta.errors[0])}
              </p>
            )}
          </div>
        )}
      </form.Field>

      {/* Result Image Field */}
      <form.Field
        name="resultImage"
        validators={{
          onChange: ({ value }) => {
            const res = promptSchema.shape.resultImage.safeParse(value)
            return res.success ? undefined : res.error.issues[0]?.message
          },
        }}
      >
        {(field) => (
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              Result Image <span className="text-destructive">*</span>
            </Label>

            {previewUrl ? (
              <div className="group relative overflow-hidden rounded-lg border border-border bg-muted/20">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-48 w-full object-cover transition-transform"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting}
                  >
                    Change Image
                  </Button>
                </div>
              </div>
            ) : (
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    fileInputRef.current?.click()
                  }
                }}
                className={cn(
                  'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/30',
                  fileError || field.state.meta.errors.length
                    ? 'border-destructive'
                    : 'border-border'
                )}
              >
                <ImageIcon className="size-8 opacity-60" />
                <div className="text-center">
                  <span className="text-sm font-medium text-foreground">
                    Click to select an image
                  </span>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Supports PNG, JPG, WebP, GIF (Images only)
                  </p>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isSubmitting}
            />

            {(fileError || (!previewUrl && field.state.meta.isTouched)) && (
              <p className="text-xs text-destructive">
                {fileError || 'Result image is required'}
              </p>
            )}
          </div>
        )}
      </form.Field>

      {/* Form Action Buttons */}
      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-1.5 size-4 animate-spin" />
              Saving...
            </>
          ) : initialData?.id ? (
            'Update Prompt'
          ) : (
            'Create Prompt'
          )}
        </Button>
      </div>
    </form>
  )
}
