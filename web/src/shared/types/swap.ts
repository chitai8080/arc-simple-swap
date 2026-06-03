export type SwapToken = "USDC" | "EURC";
export type SwapChain = "arc_testnet";

export type SwapQuoteRequest = {
  chain: SwapChain;
  tokenIn: SwapToken;
  tokenOut: SwapToken;
  amountIn: string;
  slippageBps?: number;
  userAddress: string;
};

export type SwapQuoteResponse = {
  chain: string;
  tokenIn: SwapToken;
  tokenOut: SwapToken;
  amountIn: string;
  estimatedAmountOut: string;
  minAmountOut?: string;
  estimatedAmountOutHuman: string;
  minAmountOutHuman?: string;
  routeId?: string;
};

export type BuildSwapTxRequest = SwapQuoteRequest & {
  userAddress: string;
};

export type BuildSwapTxResponse = {
  chain: string;
  tokenIn: SwapToken;
  tokenOut: SwapToken;
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

export type SwapStatusResponse = {
  txHash: string;
  status: "pending" | "success" | "failed" | "not_found";
  blockNumber?: string;
};
