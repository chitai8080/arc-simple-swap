import { env } from "../../../shared/config/env";
import type {
  BuildSwapTxRequest,
  BuildSwapTxResponse,
  SwapQuoteRequest,
  SwapQuoteResponse,
  SwapStatusResponse,
} from "../../../shared/types/swap";

type ApiErrorShape = {
  error?: {
    code?: string;
    message?: string;
  };
};

async function parseJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

async function ensureOk(response: Response): Promise<void> {
  if (response.ok) {
    return;
  }

  const payload = await parseJson<ApiErrorShape>(response).catch(() => undefined);
  const message = payload?.error?.message ?? "Swap API request failed";
  throw new Error(message);
}

export async function getSwapQuote(payload: SwapQuoteRequest): Promise<SwapQuoteResponse> {
  const response = await fetch(`${env.apiBaseUrl}/api/swap/quote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  await ensureOk(response);
  return parseJson<SwapQuoteResponse>(response);
}

export async function buildSwapTransaction(
  payload: BuildSwapTxRequest,
): Promise<BuildSwapTxResponse> {
  const response = await fetch(`${env.apiBaseUrl}/api/swap/build-tx`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  await ensureOk(response);
  return parseJson<BuildSwapTxResponse>(response);
}

export async function getSwapStatus(txHash: string): Promise<SwapStatusResponse> {
  const response = await fetch(`${env.apiBaseUrl}/api/swap/status/${txHash}`);
  await ensureOk(response);
  return parseJson<SwapStatusResponse>(response);
}
