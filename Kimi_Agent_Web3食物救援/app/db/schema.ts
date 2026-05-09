import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  decimal,
  json,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  walletAddress: varchar("wallet_address", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Food listings table - restaurants list surplus food
export const foodListings = mysqlTable("food_listings", {
  id: serial("id").primaryKey(),
  restaurantName: varchar("restaurant_name", { length: 255 }).notNull(),
  foodName: varchar("food_name", { length: 255 }).notNull(),
  description: text("description"),
  quantity: int("quantity").notNull().default(1),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }).notNull(),
  discountedPrice: decimal("discounted_price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 20 }).notNull().default("USDC"),
  imageUrl: text("image_url"),
  category: varchar("category", { length: 100 }),
  status: mysqlEnum("status", ["active", "sold_out", "expired", "cancelled"]).default("active").notNull(),
  blockchainTxHash: varchar("blockchain_tx_hash", { length: 255 }),
  metadata: json("metadata"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type FoodListing = typeof foodListings.$inferSelect;
export type InsertFoodListing = typeof foodListings.$inferInsert;

// Orders table - consumer purchases
export const orders = mysqlTable("orders", {
  id: serial("id").primaryKey(),
  listingId: int("listing_id").notNull(),
  buyerWalletAddress: varchar("buyer_wallet_address", { length: 255 }).notNull(),
  quantity: int("quantity").notNull().default(1),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 20 }).notNull().default("USDC"),
  sourceChain: varchar("source_chain", { length: 50 }),
  paymentTxHash: varchar("payment_tx_hash", { length: 255 }),
  status: mysqlEnum("status", ["pending", "confirmed", "dispensed", "cancelled"]).default("pending").notNull(),
  ticketHash: varchar("ticket_hash", { length: 255 }),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// Voice sessions table - track voice listing sessions
export const voiceSessions = mysqlTable("voice_sessions", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 255 }).notNull().unique(),
  audioUrl: text("audio_url"),
  transcript: text("transcript"),
  extractedData: json("extracted_data"),
  status: mysqlEnum("status", ["recording", "processing", "completed", "failed"]).default("recording").notNull(),
  listingId: int("listing_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type VoiceSession = typeof voiceSessions.$inferSelect;
export type InsertVoiceSession = typeof voiceSessions.$inferInsert;
