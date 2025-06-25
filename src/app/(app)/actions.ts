'use server'; // don't forget to add this!

import { z } from 'zod';

import { actionClient } from '@/lib/safe-action';
import { fetchMutation } from 'convex/nextjs';
import { api } from '../../../convex/_generated/api';
import { convexAuthNextjsToken } from '@convex-dev/auth/nextjs/server';
import { Id } from '../../../convex/_generated/dataModel';

// This schema is used to validate input from client.
const inputSchema = z.object({
  amount: z.number(),
  move: z.union([z.literal('rock'), z.literal('paper'), z.literal('scissors')]),
  gifUrl: z.string(),
});

export const createBattle = actionClient
  .inputSchema(inputSchema)
  .action(async ({ parsedInput: { amount, move, gifUrl } }) => {
    const battle = await fetchMutation(
      api.battles.createBattle,
      {
        amount,
        move,
        gifUrl,
      },
      {
        token: await convexAuthNextjsToken(),
      }
    );

    return battle;
  });

const challengeBattleInputSchema = z.object({
  battleId: z.string(),
  move: z.union([z.literal('rock'), z.literal('paper'), z.literal('scissors')]),
});

export const challengeBattle = actionClient
  .inputSchema(challengeBattleInputSchema)
  .action(async ({ parsedInput: { battleId, move } }) => {
    const battle = await fetchMutation(
      api.battles.joinBattle,
      {
        battleId: battleId as Id<'battles'>,
        move,
      },
      {
        token: await convexAuthNextjsToken(),
      }
    );

    return battle;
  });
