import { relations } from 'drizzle-orm';

// Import tables directly from migrations schema for use in relations
import { products, prices } from '../../../migrations/schema';

// Re-export all tables from migrations schema
export {
  customers,
  prices,
  products,
  users,
  workspaces,
  workflows,
  folders,
  files,
  collaborators,
  subscriptions,
  documents,
  documentVersions,
  assets,
  exports,
} from '../../../migrations/schema';

export const productsRelations = relations(products, ({ many }) => ({
  prices: many(prices),
}));

export const pricesRelations = relations(prices, ({ one }) => ({
  product: one(products, {
    fields: [prices.productId],
    references: [products.id],
  }),
}));
