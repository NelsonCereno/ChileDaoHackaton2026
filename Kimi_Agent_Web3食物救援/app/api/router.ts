import { authRouter } from "./auth-router";
import { createRouter, publicQuery } from "./middleware";
import { foodRouter } from "./routers/food";
import { orderRouter } from "./routers/order";
import { voiceRouter } from "./routers/voice";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  food: foodRouter,
  order: orderRouter,
  voice: voiceRouter,
});

export type AppRouter = typeof appRouter;
