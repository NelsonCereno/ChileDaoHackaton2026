import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { voiceSessions } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const voiceRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(voiceSessions).orderBy(desc(voiceSessions.createdAt));
  }),

  getBySessionId: publicQuery
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const results = await db
        .select()
        .from(voiceSessions)
        .where(eq(voiceSessions.sessionId, input.sessionId));
      return results[0] || null;
    }),

  create: publicQuery
    .input(
      z.object({
        sessionId: z.string(),
        audioUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(voiceSessions).values({
        sessionId: input.sessionId,
        audioUrl: input.audioUrl || null,
        transcript: null,
        extractedData: null,
        status: "recording",
        listingId: null,
      });
      return { id: Number(result[0].insertId) };
    }),

  updateTranscript: publicQuery
    .input(
      z.object({
        sessionId: z.string(),
        transcript: z.string(),
        extractedData: z.any().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(voiceSessions)
        .set({
          transcript: input.transcript,
          extractedData: input.extractedData || null,
          status: "processing",
        })
        .where(eq(voiceSessions.sessionId, input.sessionId));
      return { success: true };
    }),

  complete: publicQuery
    .input(
      z.object({
        sessionId: z.string(),
        listingId: z.number().optional(),
        extractedData: z.any().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(voiceSessions)
        .set({
          status: "completed",
          listingId: input.listingId || null,
          extractedData: input.extractedData || null,
        })
        .where(eq(voiceSessions.sessionId, input.sessionId));
      return { success: true };
    }),

  processVoice: publicQuery
    .input(
      z.object({
        transcript: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      // Simulated AI processing - in production this would call ElevenLabs API
      const transcript = input.transcript.toLowerCase();
      
      // Extract quantity
      const quantityMatch = transcript.match(/(\d+)/);
      const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;
      
      // Extract price
      const priceMatch = transcript.match(/(\d+(?:\.\d+)?)\s*(?:dollar|usd|\$)/i);
      const price = priceMatch ? priceMatch[1] : "3.00";
      
      // Extract food name - look for keywords
      const foodKeywords = [
        "shepherd's pie", "sushi", "pasta", "salad", "sandwich", 
        "tiramisu", "pizza", "burger", "tacos", "ramen", "curry",
        "steak", "chicken", "fish", "soup", "bread"
      ];
      let foodName = "Surplus Food Item";
      for (const keyword of foodKeywords) {
        if (transcript.includes(keyword)) {
          foodName = keyword.charAt(0).toUpperCase() + keyword.slice(1);
          break;
        }
      }
      
      // Try to extract more specific name from context
      const portionsMatch = transcript.match(/(?:portions?|servings?|pieces?)\s+of\s+(.+?)(?:\s+for|\s+at|\s*\d|$)/i);
      if (portionsMatch) {
        const extracted = portionsMatch[1].trim();
        if (extracted.length > 2) {
          foodName = extracted.charAt(0).toUpperCase() + extracted.slice(1);
        }
      }
      
      return {
        success: true,
        extracted: {
          foodName,
          quantity,
          price,
          currency: "USDC",
          originalTranscript: input.transcript,
          confidence: 0.92,
        },
      };
    }),
});
