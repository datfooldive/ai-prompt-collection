import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Moon, Plus, Sparkles, Sun } from 'lucide-react'

import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { DeletePromptDialog } from '#/components/delete-prompt-dialog'
import { PromptCard } from '#/components/prompt-card'
import { PromptDetailDialog } from '#/components/prompt-detail-dialog'
import { PromptForm, type PromptItem } from '#/components/prompt-form'
import { useTRPC } from '#/integrations/trpc/react'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const trpc = useTRPC()
  const {
    data: prompts,
    isLoading,
    isError,
    error,
  } = useQuery(trpc.prompt.list.queryOptions())

  // Dialog states
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editingPrompt, setEditingPrompt] = React.useState<PromptItem | null>(null)
  const [detailPrompt, setDetailPrompt] = React.useState<PromptItem | null>(null)
  const [deletingPrompt, setDeletingPrompt] = React.useState<PromptItem | null>(null)
  const [isDark, setIsDark] = React.useState(true)

  const toggleTheme = () => {
    const root = document.documentElement
    const next = !isDark
    setIsDark(next)
    if (next) {
      root.classList.add('dark')
      root.style.colorScheme = 'dark'
      document.body.classList.add('dark')
    } else {
      root.classList.remove('dark')
      root.style.colorScheme = 'light'
      document.body.classList.remove('dark')
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Navigation / Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="page-wrap flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">AI Prompt Collection</h1>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Curate, inspect, and share generative AI prompts and outputs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              onClick={toggleTheme}
              className="h-9 w-9 rounded-md"
            >
              {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            <Button
              onClick={() => setCreateOpen(true)}
              className="gap-1.5 shadow-xs"
              size="sm"
            >
              <Plus className="size-4" />
              <span>New Prompt</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="page-wrap px-4 py-8 sm:px-6">
        {/* Loading State */}
        {isLoading && (
          <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm">Loading prompt collection...</p>
          </div>
        )}

        {/* Database Error State (e.g. before migration) */}
        {isError && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center">
            <h2 className="text-lg font-semibold text-destructive">
              Unable to load prompts
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {error?.message ||
                'Please verify the database connection and ensure Prisma migrations have been run.'}
            </p>
            <div className="mt-4">
              <code className="text-xs bg-destructive/20 px-2 py-1 rounded">
                npm run db:migrate
              </code>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && prompts && prompts.length === 0 && (
          <div className="flex min-h-[440px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="size-7" />
            </div>
            <h2 className="mt-4 text-xl font-bold">No prompts in your collection yet</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Save your AI generation prompts alongside their result images to keep track
              of models, parameters, and creative styles.
            </p>
            <Button
              onClick={() => setCreateOpen(true)}
              className="mt-6 gap-2"
              size="default"
            >
              <Plus className="size-4" />
              Create First Prompt
            </Button>
          </div>
        )}

        {/* Gallery Grid */}
        {!isLoading && !isError && prompts && prompts.length > 0 && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing{' '}
                <span className="font-semibold text-foreground">
                  {prompts.length}
                </span>{' '}
                {prompts.length === 1 ? 'prompt' : 'prompts'}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {prompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  onClick={() => setDetailPrompt(prompt)}
                  onEdit={(e) => {
                    e.stopPropagation()
                    setEditingPrompt(prompt)
                  }}
                  onDelete={(e) => {
                    e.stopPropagation()
                    setDeletingPrompt(prompt)
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Create Prompt Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add New Prompt</DialogTitle>
            <DialogDescription>
              Record an AI prompt and upload its generated output image.
            </DialogDescription>
          </DialogHeader>
          <PromptForm
            onSuccess={() => setCreateOpen(false)}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Prompt Dialog */}
      <Dialog
        open={!!editingPrompt}
        onOpenChange={(open) => {
          if (!open) setEditingPrompt(null)
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Prompt</DialogTitle>
            <DialogDescription>
              Update prompt details, tags, or replace the result image.
            </DialogDescription>
          </DialogHeader>
          <PromptForm
            initialData={editingPrompt}
            onSuccess={() => setEditingPrompt(null)}
            onCancel={() => setEditingPrompt(null)}
          />
        </DialogContent>
      </Dialog>

      {/* Detail View Dialog */}
      <PromptDetailDialog
        prompt={detailPrompt}
        open={!!detailPrompt}
        onOpenChange={(open) => {
          if (!open) setDetailPrompt(null)
        }}
        onEdit={(p) => {
          setDetailPrompt(null)
          setEditingPrompt(p)
        }}
        onDelete={(p) => {
          setDetailPrompt(null)
          setDeletingPrompt(p)
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DeletePromptDialog
        prompt={deletingPrompt}
        open={!!deletingPrompt}
        onOpenChange={(open) => {
          if (!open) setDeletingPrompt(null)
        }}
        onSuccess={() => setDeletingPrompt(null)}
      />
    </div>
  )
}
