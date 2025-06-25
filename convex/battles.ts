import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getAuthUserId } from '@convex-dev/auth/server';
import { Id } from './_generated/dataModel';

export const getOpenBattles = query({
  args: {},
  handler: async ctx => {
    const openBattles = await ctx.db
      .query('battles')
      .withIndex('by_resolved', q => q.eq('resolved', false))
      .collect();

    const battlesWithUser = await Promise.all(
      openBattles.map(async battle => {
        const user = await ctx.db.get(battle.createdBy);

        if (!user) {
          throw new Error('User not found');
        }

        return {
          ...battle,
          creator: user,
        };
      })
    );

    return battlesWithUser;
  },
});

export const getFinishedBattles = query({
  args: {},
  handler: async ctx => {
    const finishedBattles = await ctx.db
      .query('battles')
      .withIndex('by_resolved', q => q.eq('resolved', true))
      .collect();

    const battlesWithUser = await Promise.all(
      finishedBattles.map(async battle => {
        const user = await ctx.db.get(battle.createdBy);

        if (!battle.joinerId) {
          throw new Error('Joiner not found');
        }

        const joiner = await ctx.db.get(battle.joinerId);

        if (!battle.winnerId) {
          throw new Error('Winner not found');
        }

        const winner = await ctx.db.get(battle.winnerId);

        if (!winner) {
          throw new Error('Winner not found');
        }

        return {
          ...battle,
          creator: user,
          joiner: joiner,
          winner: winner,
        };
      })
    );

    return battlesWithUser;
  },
});

export const getUserBattles = query({
  args: {},

  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const createdBattles = await ctx.db
      .query('battles')
      .withIndex('by_createdBy', q => q.eq('createdBy', userId))
      .collect();

    const joinedBattles = await ctx.db
      .query('battles')
      .withIndex('by_joinerId', q => q.eq('joinerId', userId))
      .collect();

    return [...createdBattles, ...joinedBattles];
  },
});

export const createBattle = mutation({
  args: {
    amount: v.number(),
    move: v.union(v.literal('rock'), v.literal('paper'), v.literal('scissors')),
    gifUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const battle = await ctx.db.insert('battles', {
      createdBy: userId,
      moveCreator: args.move,
      amount: args.amount,
      resolved: false,
      createdAt: Date.now(),
      gifUrl: args.gifUrl,
    });

    return battle;
  },
});

export const joinBattle = mutation({
  args: {
    battleId: v.id('battles'),
    move: v.union(v.literal('rock'), v.literal('paper'), v.literal('scissors')),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const battle = await ctx.db.get(args.battleId);
    if (!battle) {
      throw new Error('Battle not found');
    }

    let winnerId: Id<'users'> | null = null;
    if (battle.moveCreator === 'rock' && args.move === 'scissors') {
      winnerId = userId;
    } else if (battle.moveCreator === 'paper' && args.move === 'rock') {
      winnerId = userId;
    } else if (battle.moveCreator === 'scissors' && args.move === 'paper') {
    }

    await ctx.db.patch(args.battleId, {
      joinerId: userId,
      moveJoiner: args.move,
      resolved: true,
      resolvedAt: Date.now(),
      winnerId: winnerId,
    });

    return battle;
  },
});
