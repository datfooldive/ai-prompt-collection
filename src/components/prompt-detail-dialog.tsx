import * as React from 'react'
import { Check, Copy, Pencil, Trash2 } from 'lucide-react'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import type { PromptItem } from '#/components/prompt-form'

interface PromptDetailDialogProps {
  prompt: PromptItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (prompt: PromptItem) => void
  onDelete: (prompt: PromptItem) => void
}

export function PromptDetailDialog({
  prompt,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: PromptDetailDialogProps) {
  const [copied, setCopied] = React.useState(false)

  if (!prompt) return null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy prompt to clipboard:', err)
    }
  }

  const formattedDate = new Date(prompt.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4 pr-6">
            <div>
              <DialogTitle className="text-xl font-bold">{prompt.name}</DialogTitle>
              <DialogDescription className="mt-1 text-xs text-muted-foreground">
                Added on {formattedDate}
              </DialogDescription>
            </div>
          </div>

          {/* Tags */}
          {prompt.tags && prompt.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {prompt.tags.map((tag, idx) => (
                <Badge key={`${tag}-${idx}`} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </DialogHeader>

        {/* Result Image */}
        <div className="relative overflow-hidden rounded-lg border border-border bg-muted/30">
          <img
            src={prompt.resultImage}
            alt={prompt.name}
            className="max-h-80 w-full object-contain"
          />
        </div>

        {/* Prompt Text Section with Copy Button */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Full Prompt
            </span>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={handleCopy}
              className="gap-1.5 text-xs font-medium"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  <span>Copy Prompt</span>
                </>
              )}
            </Button>
          </div>

          <div className="relative rounded-lg border border-border/80 bg-muted/40 p-4">
            <p className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground select-all">
              {prompt.prompt}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <DialogFooter className="mt-4 flex flex-row items-center justify-between sm:justify-between">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => onDelete(prompt)}
            className="gap-1.5"
          >
            <Trash2 className="size-4" />
            Delete
          </Button>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onEdit(prompt)}
              className="gap-1.5"
            >
              <Pencil className="size-4" />
              Edit
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
