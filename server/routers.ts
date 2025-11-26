import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  journal: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getUserJournalEntries } = await import('./db');
      return getUserJournalEntries(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({
        title: z.string().optional(),
        content: z.string(),
        mood: z.enum(["very_bad", "bad", "neutral", "good", "very_good"]),
        tags: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createJournalEntry } = await import('./db');
        await createJournalEntry({
          userId: ctx.user.id,
          title: input.title,
          content: input.content,
          mood: input.mood,
          tags: input.tags ? JSON.stringify(input.tags) : null,
        });
        return { success: true };
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        content: z.string().optional(),
        mood: z.enum(["very_bad", "bad", "neutral", "good", "very_good"]).optional(),
        tags: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { updateJournalEntry } = await import('./db');
        const updateData: any = {};
        if (input.title !== undefined) updateData.title = input.title;
        if (input.content !== undefined) updateData.content = input.content;
        if (input.mood !== undefined) updateData.mood = input.mood;
        if (input.tags !== undefined) updateData.tags = JSON.stringify(input.tags);
        await updateJournalEntry(input.id, ctx.user.id, updateData);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { deleteJournalEntry } = await import('./db');
        await deleteJournalEntry(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  migraine: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getUserMigraineLogs } = await import('./db');
      return getUserMigraineLogs(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({
        severity: z.number().min(1).max(10),
        duration: z.number().optional(),
        triggers: z.array(z.string()).optional(),
        symptoms: z.array(z.string()).optional(),
        medication: z.string().optional(),
        notes: z.string().optional(),
        startTime: z.date(),
        endTime: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createMigraineLog } = await import('./db');
        await createMigraineLog({
          userId: ctx.user.id,
          severity: input.severity,
          duration: input.duration,
          triggers: input.triggers ? JSON.stringify(input.triggers) : null,
          symptoms: input.symptoms ? JSON.stringify(input.symptoms) : null,
          medication: input.medication,
          notes: input.notes,
          startTime: input.startTime,
          endTime: input.endTime,
        });
        return { success: true };
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        severity: z.number().min(1).max(10).optional(),
        duration: z.number().optional(),
        triggers: z.array(z.string()).optional(),
        symptoms: z.array(z.string()).optional(),
        medication: z.string().optional(),
        notes: z.string().optional(),
        endTime: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { updateMigraineLog } = await import('./db');
        const updateData: any = {};
        if (input.severity !== undefined) updateData.severity = input.severity;
        if (input.duration !== undefined) updateData.duration = input.duration;
        if (input.triggers !== undefined) updateData.triggers = JSON.stringify(input.triggers);
        if (input.symptoms !== undefined) updateData.symptoms = JSON.stringify(input.symptoms);
        if (input.medication !== undefined) updateData.medication = input.medication;
        if (input.notes !== undefined) updateData.notes = input.notes;
        if (input.endTime !== undefined) updateData.endTime = input.endTime;
        await updateMigraineLog(input.id, ctx.user.id, updateData);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { deleteMigraineLog } = await import('./db');
        await deleteMigraineLog(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  sleep: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getUserSleepSessions } = await import('./db');
      return getUserSleepSessions(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({
        soundType: z.string().optional(),
        duration: z.number().optional(),
        quality: z.number().min(1).max(5).optional(),
        notes: z.string().optional(),
        startTime: z.date(),
        endTime: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createSleepSession } = await import('./db');
        await createSleepSession({
          userId: ctx.user.id,
          soundType: input.soundType,
          duration: input.duration,
          quality: input.quality,
          notes: input.notes,
          startTime: input.startTime,
          endTime: input.endTime,
        });
        return { success: true };
      }),
  }),

  breathing: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getUserBreathingSessions } = await import('./db');
      return getUserBreathingSessions(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({
        exerciseType: z.string(),
        duration: z.number(),
        completed: z.boolean().optional(),
        moodBefore: z.enum(["very_bad", "bad", "neutral", "good", "very_good"]).optional(),
        moodAfter: z.enum(["very_bad", "bad", "neutral", "good", "very_good"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createBreathingSession } = await import('./db');
        await createBreathingSession({
          userId: ctx.user.id,
          exerciseType: input.exerciseType,
          duration: input.duration,
          completed: input.completed ? 1 : 0,
          moodBefore: input.moodBefore,
          moodAfter: input.moodAfter,
        });
        return { success: true };
      }),
  }),

  chat: router({
    history: protectedProcedure.query(async ({ ctx }) => {
      const { getUserChatMessages } = await import('./db');
      return getUserChatMessages(ctx.user.id);
    }),
    send: protectedProcedure
      .input(z.object({ message: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const { createChatMessage } = await import('./db');
        const { invokeLLM } = await import('./_core/llm');
        const { getUserChatMessages } = await import('./db');
        
        // Save user message
        await createChatMessage({
          userId: ctx.user.id,
          role: 'user',
          content: input.message,
        });
        
        // Get chat history
        const history = await getUserChatMessages(ctx.user.id);
        const messages = history.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));
        
        // Get AI response with cat personality
        const response = await invokeLLM({
          messages: [
            {
              role: 'system',
              content: 'You are a supportive, empathetic AI cat companion helping someone with anxiety, depression, and migraines. Be warm, gentle, understanding, and occasionally playful like a cat. Offer comfort, coping strategies, and encouragement. Keep responses concise and caring. Use cat-themed language occasionally (purr, meow) but stay professional and helpful.',
            },
            ...messages,
          ],
        });
        
        const rawContent = response.choices[0]?.message?.content;
        const aiMessage = typeof rawContent === 'string' ? rawContent : 'Purr... I\'m here for you.';
        
        // Save AI response
        await createChatMessage({
          userId: ctx.user.id,
          role: 'assistant',
          content: aiMessage,
        });
        
        return { message: aiMessage };
      }),
    clear: protectedProcedure.mutation(async ({ ctx }) => {
      const { clearUserChatHistory } = await import('./db');
      await clearUserChatHistory(ctx.user.id);
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
