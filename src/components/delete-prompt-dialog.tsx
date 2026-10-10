import * as React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Loader2 } from 'lucide-react'

import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { useTRPC } from '#/integrations/trpc/react'
import type { PromptItem } from '#/components/prompt-form'

interface DeletePromptDialogProps {
  prompt: PromptItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function DeletePromptDialog({
  prompt,
  open,
  onOpenChange,
  onSuccess,
}: DeletePromptDialogProps) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const deleteMutation = useMutation(trpc.prompt.delete.mutationOptions())
  const [isDeleting, setIsDeleting] = React.useState(false)

  if (!prompt) return null

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteMutation.mutateAsync({ id: prompt.id })
      await queryClient.invalidateQueries({
        queryKey: trpc.prompt.list.queryKey(),
      })
      onSuccess()
    } catch (err) {
      console.error('Failed to delete prompt:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">Delete Prompt</DialogTitle>
              <DialogDescription className="text-sm mt-1">
                Are you sure you want to delete <span className="font-semibold text-foreground">"{prompt.name}"</span>? This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogFooter className="mt-4 flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-1.5 size-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
