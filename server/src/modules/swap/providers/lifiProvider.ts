import { AppError } from "../../../core/errors.js";
import { env } from "../../../config/env.js";
import { logger } from "../../../config/logger.js";
import type { ProviderQuoteRequest, ProviderQuoteResponse, SwapProvider } from "./types.js";

type LiFiQuoteResponse = {
  estimate?: {
    toAmount?: string;
    toAmountMin?: string;
    executionDuration?: number;
  };
  includedSteps?: Array<{
    estimate?: {
      toAmount?: string;
      toAmountMin?: string;
    };
  }>;
  transactionRequest?: {
    to: string;
    data: string;
    value: string;
    gasLimit?: string;
    gasPrice?: string;
  };
  id?: string;
  [key: string]: unknown;
};

function toSlippagePercent(slippageBps?: number): string | undefined {
  if (!slippageBps) {
    return undefined;
  }

  return (slippageBps / 10_000).toFixed(4);
}

export class LifiProvider implements SwapProvider {
  async quote(request: ProviderQuoteRequest): Promise<ProviderQuoteResponse> {
    const url = new URL(`${env.SWAP_PROVIDER_BASE_URL}/quote`);

    url.searchParams.set("fromChain", String(request.fromChainId));
    url.searchParams.set("toChain", String(request.toChainId));
    url.searchParams.set("fromToken", request.fromTokenAddress);
    url.searchParams.set("toToken", request.toTokenAddress);
    url.searchParams.set("fromAmount", request.fromAmount);

    if (request.fromAddress) {
      url.searchParams.set("fromAddress", request.fromAddress);
    }

    const slippage = toSlippagePercent(request.slippageBps);
    if (slippage) {
      url.searchParams.set("slippage", slippage);
    }

    const timeout = AbortSignal.timeout(env.SWAP_PROVIDER_TIMEOUT_MS);
    const response = await fetch(url, {
      method: "GET",
      signal: timeout,
      headers: {
        ...(env.APP_INTEGRATOR_ID ? { "x-lifi-integrator": env.APP_INTEGRATOR_ID } : {}),
      },
    });

    const raw = (await response.json()) as LiFiQuoteResponse;

    if (!response.ok) {
      logger.warn(
        {
          statusCode: response.status,
          providerBody: raw,
        },
        "Quote provider returned non-success status",
      );

      throw new AppError(502, "QUOTE_PROVIDER_ERROR", "Unable to get swap quote right now");
    }

    const amountOut =
      raw.estimate?.toAmount ??
      raw.includedSteps?.at(-1)?.estimate?.toAmount;

    const minAmountOut =
      raw.estimate?.toAmountMin ??
      raw.includedSteps?.at(-1)?.estimate?.toAmountMin;

    if (!amountOut) {
      throw new AppError(502, "QUOTE_PROVIDER_INVALID", "Swap quote response is missing output amount");
    }

    return {
      estimatedAmountOut: amountOut,
      minAmountOut,
      routeId: raw.id,
      transactionRequest: raw.transactionRequest,
      raw,
    };
  }
}
