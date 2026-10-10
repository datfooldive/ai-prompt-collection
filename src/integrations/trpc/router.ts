import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import type { TRPCRouterRecord } from '@trpc/server'
import { prisma } from '#/db'
import {
  createPromptSchema,
  updatePromptSchema,
  getPromptByIdSchema,
  deletePromptSchema,
} from '#/lib/prompt-schema'
import { createTRPCRouter, publicProcedure } from './init'

const todos = [
  { id: 1, name: 'Get groceries' },
  { id: 2, name: 'Buy a new phone' },
  { id: 3, name: 'Finish the project' },
]

const todosRouter = {
  list: publicProcedure.query(() => todos),
  add: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(({ input }) => {
      const newTodo = { id: todos.length + 1, name: input.name }
      todos.push(newTodo)
      return newTodo
    }),
} satisfies TRPCRouterRecord

const promptRouter = {
  list: publicProcedure.query(async () => {
    return await prisma.prompt.findMany({
      orderBy: { createdAt: 'desc' },
    })
  }),
  getById: publicProcedure
    .input(getPromptByIdSchema)
    .query(async ({ input }) => {
      const prompt = await prisma.prompt.findUnique({
        where: { id: input.id },
      })
      if (!prompt) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Prompt with ID ${input.id} not found`,
        })
      }
      return prompt
    }),
  create: publicProcedure
    .input(createPromptSchema)
    .mutation(async ({ input }) => {
      return await prisma.prompt.create({
        data: {
          name: input.name,
          tags: input.tags,
          prompt: input.prompt,
          resultImage: input.resultImage,
        },
      })
    }),
  update: publicProcedure
    .input(updatePromptSchema)
    .mutation(async ({ input }) => {
      return await prisma.prompt.update({
        where: { id: input.id },
        data: {
          name: input.name,
          tags: input.tags,
          prompt: input.prompt,
          resultImage: input.resultImage,
        },
      })
    }),
  delete: publicProcedure
    .input(deletePromptSchema)
    .mutation(async ({ input }) => {
      return await prisma.prompt.delete({
        where: { id: input.id },
      })
    }),
} satisfies TRPCRouterRecord

export const trpcRouter = createTRPCRouter({
  todos: todosRouter,
  prompt: promptRouter,
})
export type TRPCRouter = typeof trpcRouter

