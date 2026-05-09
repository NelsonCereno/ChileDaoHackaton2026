import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { orders } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const orderRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(orders).orderBy(desc(orders.createdAt));
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const results = await db
        .select()
        .from(orders)
        .where(eq(orders.id, input.id));
      return results[0] || null;
    }),

  getByWallet: publicQuery
    .input(z.object({ walletAddress: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(orders)
        .where(eq(orders.buyerWalletAddress, input.walletAddress))
        .orderBy(desc(orders.createdAt));
    }),

  create: publicQuery
    .input(
      z.object({
        listingId: z.number(),
        buyerWalletAddress: z.string().min(1),
        quantity: z.number().min(1).default(1),
        totalAmount: z.string(),
        currency: z.string().default("USDC"),
        sourceChain: z.string().optional(),
        paymentTxHash: z.string().optional(),
        ticketHash: z.string().optional(),
        metadata: z.any().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(orders).values({
        listingId: input.listingId,
        buyerWalletAddress: input.buyerWalletAddress,
        quantity: input.quantity,
        totalAmount: input.totalAmount,
        currency: input.currency,
        sourceChain: input.sourceChain || null,
        paymentTxHash: input.paymentTxHash || null,
        status: "pending",
        ticketHash: input.ticketHash || null,
        metadata: input.metadata || null,
      });
      return { id: Number(result[0].insertId) };
    }),

  updateStatus: publicQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "confirmed", "dispensed", "cancelled"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(orders)
        .set({ status: input.status })
        .where(eq(orders.id, input.id));
      return { success: true };
    }),

  confirmPayment: publicQuery
    .input(
      z.object({
        id: z.number(),
        paymentTxHash: z.string(),
        ticketHash: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(orders)
        .set({
          status: "confirmed",
          paymentTxHash: input.paymentTxHash,
          ticketHash: input.ticketHash,
        })
        .where(eq(orders.id, input.id));
      return { success: true };
    }),
});
