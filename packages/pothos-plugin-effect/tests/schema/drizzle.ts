import { Effect } from 'effect';
import type * as DrizzleSchema from '../../drizzle/schema.js';
import { PostService } from '../setupTest.js';
import { builder } from './builder.js';

export const PostSchema = builder
  .objectRef<DrizzleSchema.Post>('Post')
  .implement({
    fields: (t) => ({
      id: t.exposeID('id'),
      title: t.exposeString('title'),
      content: t.exposeString('content', { nullable: true }),
    }),
  });

builder.queryFields((t) => ({
  posts: t.effect({
    type: [PostSchema],
    nullable: true,
    resolve: () =>
      Effect.gen(function* () {
        const postService = yield* PostService;
        return postService.getPosts();
      }),
  }),
}));
