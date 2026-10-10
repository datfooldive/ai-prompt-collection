import * as React from 'react'
import { Pencil, Trash2 } from 'lucide-react'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card } from '#/components/ui/card'
import type { PromptItem } from '#/components/prompt-form'

interface PromptCardProps {
  prompt: PromptItem
  onClick: () => void
  onEdit: (e: React.MouseEvent) => void
  onDelete: (e: React.MouseEvent) => void
}

export function PromptCard({
  prompt,
  onClick,
  onEdit,
  onDelete,
}: PromptCardProps) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick()
        }
      }}
      className="group relative flex cursor-pointer flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
    >
      {/* Image thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted/40">
        <img
          src={prompt.resultImage}
          alt={prompt.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Action buttons overlay */}
        <div
          className="absolute right-2 top-2 flex items-center gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            type="button"
            size="icon-xs"
            variant="secondary"
            title="Edit prompt"
            className="h-7 w-7 rounded-full bg-background/80 shadow-xs backdrop-blur-sm hover:bg-background"
            onClick={onEdit}
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="icon-xs"
            variant="destructive"
            title="Delete prompt"
            className="h-7 w-7 rounded-full shadow-xs"
            onClick={onDelete}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-1 font-semibold text-foreground group-hover:text-primary transition-colors">
          {prompt.name}
        </h3>

        {/* Tags */}
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {prompt.tags && prompt.tags.length > 0 ? (
            prompt.tags.map((tag, idx) => (
              <Badge key={`${tag}-${idx}`} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-muted-foreground italic">No tags</span>
          )}
        </div>
      </div>
    </Card>
  )
}
