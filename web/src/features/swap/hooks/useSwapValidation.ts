import { useMemo } from "react";
import { arcTestnet } from "viem/chains";
import type { SwapToken } from "../../../shared/types/swap";

type Params = {
  isConnected: boolean;
  chainId?: number;
  tokenIn: SwapToken;
  tokenOut: SwapToken;
  amountIn: string;
  slippageBps: number;
};

export function useSwapValidation(params: Params): string {
  return useMemo(() => {
    if (!params.isConnected) {
      return "Connect wallet before swapping.";
    }

    if (params.chainId !== arcTestnet.id) {
      return "Switch wallet to Arc Testnet before swapping.";
    }

    if (params.tokenIn === params.tokenOut) {
      return "tokenIn and tokenOut must be different.";
    }

    const numericAmount = Number(params.amountIn);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return "amountIn must be greater than 0.";
    }

    if (!Number.isInteger(params.slippageBps) || params.slippageBps < 1 || params.slippageBps > 5000) {
      return "slippageBps must be between 1 and 5000.";
    }

    return "";
  }, [params.amountIn, params.chainId, params.isConnected, params.slippageBps, params.tokenIn, params.tokenOut]);
}
