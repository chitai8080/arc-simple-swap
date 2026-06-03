export type ProviderQuoteRequest = {
  fromChainId: number;
  toChainId: number;
  fromTokenAddress: string;
  toTokenAddress: string;
  fromAmount: string;
  fromAddress?: string;
  slippageBps?: number;
};

export type ProviderQuoteResponse = {
  estimatedAmountOut: string;
  minAmountOut?: string;
  priceImpactPct?: string;
  routeId?: string;
  transactionRequest?: {
    to: string;
    data: string;
    value: string;
    gasLimit?: string;
    gasPrice?: string;
  };
  raw: unknown;
};

export interface SwapProvider {
  quote(request: ProviderQuoteRequest): Promise<ProviderQuoteResponse>;
}
