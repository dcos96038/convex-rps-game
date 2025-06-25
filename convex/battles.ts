import { v } from 'convex/values';
import { internalMutation, mutation, query } from './_generated/server';
import { getAuthUserId } from '@convex-dev/auth/server';
import { Id } from './_generated/dataModel';
import { internal } from './_generated/api';
import { battleAggregate, userBalanceAggregate } from './aggregates';

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

    const totalBalance = await userBalanceAggregate.sum(ctx, {
      namespace: userId,
      bounds: {},
    });

    if (totalBalance < args.amount) {
      throw new Error('Insufficient balance');
    }

    const battleId = await ctx.db.insert('battles', {
      createdBy: userId,
      moveCreator: args.move,
      amount: args.amount,
      resolved: false,
      createdAt: Date.now(),
      gifUrl: args.gifUrl,
    });
    await ctx.runMutation(internal.tokenTransactions.createTransaction, {
      userId,
      amount: args.amount,
      type: 'expense',
      battleId,
    });

    const battle = await ctx.db.get(battleId);

    if (!battle) {
      throw new Error('Battle not found');
    }

    await battleAggregate.insert(ctx, battle);

    return battleId;
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

    const totalBalance = await userBalanceAggregate.sum(ctx, {
      namespace: userId,
      bounds: {},
    });

    if (totalBalance < battle.amount) {
      throw new Error('Insufficient balance');
    }

    await ctx.runMutation(internal.tokenTransactions.createTransaction, {
      userId,
      amount: battle.amount,
      type: 'expense',
      battleId: args.battleId,
    });

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
    const oldBattle = await ctx.db.get(args.battleId);

    if (!oldBattle) {
      throw new Error('Battle not found');
    }

    if (!oldBattle.joinerId) {
      throw new Error('Joiner not found');
    }

    let winnerId: Id<'users'> | null = null;

    if (
      oldBattle.moveCreator === 'rock' &&
      oldBattle.moveJoiner === 'scissors'
    ) {
      winnerId = oldBattle.createdBy;
    } else if (
      oldBattle.moveCreator === 'paper' &&
      oldBattle.moveJoiner === 'rock'
    ) {
      winnerId = oldBattle.createdBy;
    } else if (
      oldBattle.moveCreator === 'scissors' &&
      oldBattle.moveJoiner === 'paper'
    ) {
      winnerId = oldBattle.createdBy;
    } else if (oldBattle.moveCreator === oldBattle.moveJoiner) {
      winnerId = null;
    } else {
      winnerId = oldBattle.joinerId;
    }

    if (winnerId === oldBattle.createdBy) {
      await ctx.runMutation(internal.tokenTransactions.createTransaction, {
        userId: oldBattle.createdBy,
        amount: oldBattle.amount * 2,
        type: 'income',
        battleId: args.battleId,
      });
    } else if (winnerId === oldBattle.joinerId) {
      await ctx.runMutation(internal.tokenTransactions.createTransaction, {
        userId: oldBattle.joinerId,
        amount: oldBattle.amount * 2,
        type: 'income',
        battleId: args.battleId,
      });
    }

    await ctx.db.patch(args.battleId, {
      winnerId,
      resolved: true,
      resolvedAt: Date.now(),
    });

    const newBattle = await ctx.db.get(args.battleId);

    if (!newBattle) {
      throw new Error('Battle not found');
    }

    await battleAggregate.replace(ctx, oldBattle, newBattle);
  },
});

export const getBattleMetrics = query({
  args: {},
  handler: async ctx => {
    const finishedBattles = await battleAggregate.count(ctx, {
      bounds: {
        prefix: ['resolved_with_winner'],
      },
    });

    const totalTokensEarned = await battleAggregate.sum(ctx, {
      bounds: {
        prefix: ['resolved_with_winner'],
      },
    });

    return {
      finishedBattles,
      totalTokensEarned,
    };
  },
});
