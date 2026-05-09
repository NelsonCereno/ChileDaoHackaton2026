import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { foodListings } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const foodRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(foodListings).orderBy(desc(foodListings.createdAt));
  }),

  listActive: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(foodListings)
      .where(eq(foodListings.status, "active"))
      .orderBy(desc(foodListings.createdAt));
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const results = await db
        .select()
        .from(foodListings)
        .where(eq(foodListings.id, input.id));
      return results[0] || null;
    }),

  create: publicQuery
    .input(
      z.object({
        restaurantName: z.string().min(1),
        foodName: z.string().min(1),
        description: z.string().optional(),
        quantity: z.number().min(1),
        originalPrice: z.string(),
        discountedPrice: z.string(),
        currency: z.string().default("USDC"),
        imageUrl: z.string().optional(),
        category: z.string().optional(),
        blockchainTxHash: z.string().optional(),
        metadata: z.any().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(foodListings).values({
        restaurantName: input.restaurantName,
        foodName: input.foodName,
        description: input.description || null,
        quantity: input.quantity,
        originalPrice: input.originalPrice,
        discountedPrice: input.discountedPrice,
        currency: input.currency,
        imageUrl: input.imageUrl || null,
        category: input.category || null,
        status: "active",
        blockchainTxHash: input.blockchainTxHash || null,
        metadata: input.metadata || null,
      });
      return { id: Number(result[0].insertId) };
    }),

  updateStatus: publicQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["active", "sold_out", "expired", "cancelled"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(foodListings)
        .set({ status: input.status })
        .where(eq(foodListings.id, input.id));
      return { success: true };
    }),

  decrementQuantity: publicQuery
    .input(z.object({ id: z.number(), amount: z.number().default(1) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const listing = await db
        .select()
        .from(foodListings)
        .where(eq(foodListings.id, input.id));
      
      if (listing.length === 0) return { success: false, error: "Not found" };
      
      const current = listing[0];
      const newQuantity = current.quantity - input.amount;
      
      await db
        .update(foodListings)
        .set({
          quantity: newQuantity,
          status: newQuantity <= 0 ? "sold_out" : current.status,
        })
        .where(eq(foodListings.id, input.id));
      
      return { success: true, remaining: newQuantity };
    }),
});
