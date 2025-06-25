import { authTables } from '@convex-dev/auth/server';
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  ...authTables,

  tokenTransactions: defineTable({
    userId: v.id('users'),
    type: v.union(v.literal('income'), v.literal('expense')),
    amount: v.number(),
    createdAt: v.number(),
    battleId: v.optional(v.id('battles')),
  })
    .index('by_userId', ['userId'])
    .index('by_userId_and_createdAt', ['userId', 'createdAt'])
    .index('by_battleId', ['battleId'])
    .index('by_type', ['type'])
    .index('by_createdAt', ['createdAt']),

  battles: defineTable({
    createdBy: v.id('users'),
    createdAt: v.number(),
    amount: v.number(),
    moveCreator: v.union(
      v.literal('rock'),
      v.literal('paper'),
      v.literal('scissors')
    ),
    moveJoiner: v.optional(
      v.union(v.literal('rock'), v.literal('paper'), v.literal('scissors'))
    ),
    joinerId: v.optional(v.id('users')),
    gifUrl: v.optional(v.string()),
    resolved: v.boolean(),
    winnerId: v.optional(v.union(v.id('users'), v.null())),
    resolvedAt: v.optional(v.number()),
  })
    .index('by_createdBy', ['createdBy'])
    .index('by_joinerId', ['joinerId'])
    .index('by_resolved', ['resolved'])
    .index('by_resolved_and_createdAt', ['resolved', 'createdAt'])
    .index('by_createdAt', ['createdAt'])
    .index('by_winnerId', ['winnerId']),

  chatMessages: defineTable({
    userId: v.id('users'),
    content: v.string(),
    createdAt: v.number(),
  })
    .index('by_userId', ['userId'])
    .index('by_createdAt', ['createdAt'])
    .index('by_userId_and_createdAt', ['userId', 'createdAt']),

  metrics: defineTable({
    totalBattles: v.number(),
    totalTokensDistributed: v.number(),
    updatedAt: v.number(),
  }).index('by_updatedAt', ['updatedAt']),
});
