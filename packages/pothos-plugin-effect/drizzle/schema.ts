import { InferSelectModel } from 'drizzle-orm';
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const posts = sqliteTable('post', {
  id: int('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  content: text('content'),
});

export type Post = InferSelectModel<typeof posts>;
