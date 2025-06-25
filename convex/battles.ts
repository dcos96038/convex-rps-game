import { v } from 'convex/values';
import { internalMutation, mutation, query } from './_generated/server';
import { getAuthUserId } from '@convex-dev/auth/server';
import { Id } from './_generated/dataModel';
import { internal } from './_generated/api';

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

        const joiner = battle.joinerId
          ? await ctx.db.get(battle.joinerId)
          : null;

        return {
          ...battle,
          creator: user,
          joiner: joiner,
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

    await ctx.db.patch(args.battleId, {
      joinerId: userId,
      moveJoiner: args.move,
    });

    await ctx.scheduler.runAfter(5000, internal.battles.defineWinner, {
      battleId: args.battleId,
    });

    return battle;
  },
});

export const defineWinner = internalMutation({
  args: {
    battleId: v.id('battles'),
  },
  handler: async (ctx, args) => {
    const battle = await ctx.db.get(args.battleId);

    if (!battle) {
      throw new Error('Battle not found');
    }

    if (!battle.joinerId) {
      throw new Error('Joiner not found');
    }

    let winnerId: Id<'users'> | null = null;

    if (battle.moveCreator === 'rock' && battle.moveJoiner === 'scissors') {
      winnerId = battle.createdBy;
    } else if (battle.moveCreator === 'paper' && battle.moveJoiner === 'rock') {
      winnerId = battle.createdBy;
    } else if (
      battle.moveCreator === 'scissors' &&
      battle.moveJoiner === 'paper'
    ) {
      winnerId = battle.createdBy;
    } else if (battle.moveCreator === battle.moveJoiner) {
      winnerId = null;
    } else {
      winnerId = battle.joinerId;
    }

    await ctx.db.patch(args.battleId, {
      winnerId,
      resolved: true,
      resolvedAt: Date.now(),
    });
  },
});
