import { createPublicClient, formatUnits, http } from "viem";
import { parseUnits } from "viem/utils";
import { AppError } from "../../core/errors.js";
import { env } from "../../config/env.js";
import { SUPPORTED_CHAINS } from "../../domain/chains.js";
import { getTokenConfig } from "../../domain/tokens.js";
import type { BuildSwapTxInput, QuoteSwapInput } from "./swap.schemas.js";
import type { SwapProvider } from "./providers/types.js";

export type QuoteSwapResult = {
  chain: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  estimatedAmountOut: string;
  minAmountOut?: string;
  estimatedAmountOutHuman: string;
  minAmountOutHuman?: string;
  routeId?: string;
};

export type BuildSwapTxResult = {
  chain: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  estimatedAmountOut: string;
  minAmountOut?: string;
  transaction: {
    to: string;
    data: string;
    value: string;
    chainId: number;
    gasLimit?: string;
    gasPrice?: string;
  };
};

export type TxStatusResult = {
  txHash: string;
  status: "pending" | "success" | "failed" | "not_found";
  blockNumber?: string;
};

function assertSwapInputs(tokenIn: string, tokenOut: string, amountIn: string) {
  if (tokenIn === tokenOut) {
    throw new AppError(400, "VALIDATION_ERROR", "tokenIn and tokenOut must be different");
  }

  const parsedAmount = Number(amountIn);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    throw new AppError(400, "VALIDATION_ERROR", "amountIn must be greater than 0");
  }
}

export class SwapService {
  constructor(private readonly provider: SwapProvider) {}

  async quote(input: QuoteSwapInput): Promise<QuoteSwapResult> {
    assertSwapInputs(input.tokenIn, input.tokenOut, input.amountIn);

    const chain = SUPPORTED_CHAINS[input.chain];
    const tokenIn = getTokenConfig(input.chain, input.tokenIn);
    const tokenOut = getTokenConfig(input.chain, input.tokenOut);

    const amountBaseUnits = parseUnits(input.amountIn, tokenIn.decimals).toString();
    const quote = await this.provider.quote({
      fromChainId: chain.chainId,
      toChainId: chain.chainId,
      fromTokenAddress: tokenIn.address,
      toTokenAddress: tokenOut.address,
      fromAmount: amountBaseUnits,
      fromAddress: input.userAddress,
      slippageBps: input.slippageBps,
    });

    return {
      chain: chain.chainName,
      tokenIn: input.tokenIn,
      tokenOut: input.tokenOut,
      amountIn: input.amountIn,
      estimatedAmountOut: quote.estimatedAmountOut,
      minAmountOut: quote.minAmountOut,
      estimatedAmountOutHuman: formatUnits(BigInt(quote.estimatedAmountOut), tokenOut.decimals),
      minAmountOutHuman: quote.minAmountOut
        ? formatUnits(BigInt(quote.minAmountOut), tokenOut.decimals)
        : undefined,
      routeId: quote.routeId,
    };
  }

  async buildTx(input: BuildSwapTxInput): Promise<BuildSwapTxResult> {
    assertSwapInputs(input.tokenIn, input.tokenOut, input.amountIn);

    const chain = SUPPORTED_CHAINS[input.chain];
    const tokenIn = getTokenConfig(input.chain, input.tokenIn);
    const tokenOut = getTokenConfig(input.chain, input.tokenOut);

    const amountBaseUnits = parseUnits(input.amountIn, tokenIn.decimals).toString();

    const quote = await this.provider.quote({
      fromChainId: chain.chainId,
      toChainId: chain.chainId,
      fromTokenAddress: tokenIn.address,
      toTokenAddress: tokenOut.address,
      fromAmount: amountBaseUnits,
      fromAddress: input.userAddress,
      slippageBps: input.slippageBps,
    });

    const tx = quote.transactionRequest;
    if (!tx) {
      throw new AppError(502, "QUOTE_PROVIDER_INVALID", "Provider did not return transactionRequest");
    }

    return {
      chain: chain.chainName,
      tokenIn: input.tokenIn,
      tokenOut: input.tokenOut,
      amountIn: input.amountIn,
      estimatedAmountOut: quote.estimatedAmountOut,
      minAmountOut: quote.minAmountOut,
      transaction: {
        to: tx.to,
        data: tx.data,
        value: tx.value,
        chainId: chain.chainId,
        gasLimit: tx.gasLimit,
        gasPrice: tx.gasPrice,
      },
    };
  }

  async getStatus(txHash: string): Promise<TxStatusResult> {
    const client = createPublicClient({
      transport: http(env.ARC_RPC_URL),
    });

    const receipt = await client.getTransactionReceipt({
      hash: txHash as `0x${string}`,
    }).catch(() => null);

    if (receipt) {
      return {
        txHash,
        status: receipt.status === "success" ? "success" : "failed",
        blockNumber: receipt.blockNumber.toString(),
      };
    }

    const tx = await client.getTransaction({
      hash: txHash as `0x${string}`,
    }).catch(() => null);

    if (tx) {
      return {
        txHash,
        status: "pending",
      };
    }

    return {
      txHash,
      status: "not_found",
    };
  }
}
