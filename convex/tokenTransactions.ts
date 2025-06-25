import { v } from 'convex/values';
import { internalMutation, mutation, query } from './_generated/server';
import { getAuthUserId } from '@convex-dev/auth/server';
import { userBalanceAggregate } from './aggregates';
import { internal } from './_generated/api';
import { Id } from './_generated/dataModel';

export const createUserTransaction = mutation({
  args: {
    amount: v.number(),
    type: v.union(v.literal('income'), v.literal('expense')),
  },
  handler: async (ctx, args): Promise<Id<'tokenTransactions'>> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const transactionId = await ctx.runMutation(
      internal.tokenTransactions.createTransaction,
      {
        userId,
        amount: args.amount,
        type: args.type,
      }
    );

    return transactionId;
  },
});

export const getUserBalance = query({
  args: {},
  returns: v.number(),
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    // Suma total para el namespace del usuario
    const totalBalance = await userBalanceAggregate.sum(ctx, {
      namespace: userId,
      bounds: {},
    });

    return totalBalance;
  },
});

export const createTransaction = internalMutation({
  args: {
    userId: v.id('users'),
    amount: v.number(),
    type: v.union(v.literal('income'), v.literal('expense')),
    battleId: v.optional(v.id('battles')),
  },
  handler: async (ctx, args) => {
    const transactionId = await ctx.db.insert('tokenTransactions', {
      userId: args.userId,
      amount: args.amount,
      type: args.type,
      createdAt: Date.now(),
      battleId: args.battleId,
    });

    const transaction = await ctx.db.get(transactionId);

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    await userBalanceAggregate.insert(ctx, transaction);

    return transactionId;
  },
});
