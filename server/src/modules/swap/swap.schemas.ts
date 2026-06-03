import { z } from "zod";

const chainSchema = z.enum(["arc_testnet"]).default("arc_testnet");
const tokenSchema = z.enum(["USDC", "EURC"]);

export const quoteSwapSchema = z.object({
  chain: chainSchema,
  tokenIn: tokenSchema,
  tokenOut: tokenSchema,
  amountIn: z.string().trim().min(1),
  slippageBps: z.number().int().min(1).max(5000).optional(),
  userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

export const buildSwapTxSchema = z.object({
  chain: chainSchema,
  tokenIn: tokenSchema,
  tokenOut: tokenSchema,
  amountIn: z.string().trim().min(1),
  slippageBps: z.number().int().min(1).max(5000).optional(),
  userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

export const swapStatusParamsSchema = z.object({
  txHash: z.string().regex(/^0x([A-Fa-f0-9]{64})$/),
});

export type QuoteSwapInput = z.infer<typeof quoteSwapSchema>;
export type BuildSwapTxInput = z.infer<typeof buildSwapTxSchema>;
export type SwapStatusParams = z.infer<typeof swapStatusParamsSchema>;
