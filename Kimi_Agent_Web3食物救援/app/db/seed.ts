import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2/promise";
import * as schema from "./schema";

const DATABASE_URL = process.env.DATABASE_URL || "mysql://user:pass@localhost:3306/db";

const client = createPool({
  uri: DATABASE_URL,
});

const db = drizzle(client, { schema, mode: "planetscale" });

async function seed() {
  // Check if we already have listings
  const existing = await db.select().from(schema.foodListings);
  if (existing.length > 0) {
    console.log("Database already seeded with", existing.length, "listings");
    await client.end();
    return;
  }

  const listings = [
    {
      restaurantName: "Bella's Kitchen",
      foodName: "Shepherd's Pie",
      description: "Classic British comfort food with golden mashed potato topping and savory minced lamb filling",
      quantity: 5,
      originalPrice: "8.00",
      discountedPrice: "3.00",
      currency: "USDC",
      imageUrl: "/images/food-1.jpg",
      category: "British",
      status: "active" as const,
    },
    {
      restaurantName: "Sakura Bento",
      foodName: "Salmon Roll Set",
      description: "Fresh salmon nigiri and maki rolls with premium wasabi and pickled ginger",
      quantity: 3,
      originalPrice: "12.00",
      discountedPrice: "5.50",
      currency: "USDC",
      imageUrl: "/images/food-2.jpg",
      category: "Japanese",
      status: "active" as const,
    },
    {
      restaurantName: "Nonna's",
      foodName: "Truffle Pasta",
      description: "Handmade fettuccine with shaved black truffle, parmesan, and butter",
      quantity: 4,
      originalPrice: "16.00",
      discountedPrice: "4.00",
      currency: "USDC",
      imageUrl: "/images/food-3.jpg",
      category: "Italian",
      status: "active" as const,
    },
    {
      restaurantName: "Green Bowl",
      foodName: "Mediterranean Salad",
      description: "Mixed greens with feta, olives, cherry tomatoes, red onion, and hummus",
      quantity: 8,
      originalPrice: "10.00",
      discountedPrice: "2.50",
      currency: "USDC",
      imageUrl: "/images/food-4.jpg",
      category: "Healthy",
      status: "active" as const,
    },
    {
      restaurantName: "Deli Express",
      foodName: "Club Sandwich",
      description: "Triple-decker with turkey, bacon, lettuce, tomato, and avocado on toasted sourdough",
      quantity: 6,
      originalPrice: "9.00",
      discountedPrice: "3.50",
      currency: "USDC",
      imageUrl: "/images/food-5.jpg",
      category: "American",
      status: "active" as const,
    },
    {
      restaurantName: "Sweet End",
      foodName: "Tiramisu Slice",
      description: "Classic Italian dessert with espresso-soaked ladyfingers and mascarpone cream",
      quantity: 4,
      originalPrice: "7.00",
      discountedPrice: "2.00",
      currency: "USDC",
      imageUrl: "/images/food-6.jpg",
      category: "Dessert",
      status: "active" as const,
    },
  ];

  for (const listing of listings) {
    await db.insert(schema.foodListings).values(listing);
  }

  console.log("Seeded", listings.length, "food listings");
  await client.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
