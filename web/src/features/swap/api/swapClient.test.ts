import { describe, expect, it, vi, afterEach } from "vitest";
import { buildSwapTransaction, getSwapQuote } from "./swapClient";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("swapClient", () => {
  it("returns quote data", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          chain: "Arc_Testnet",
          tokenIn: "USDC",
          tokenOut: "EURC",
          amountIn: "1",
          estimatedAmountOut: "990000",
          estimatedAmountOutHuman: "0.99",
        }),
        { status: 200 },
      ),
    );

    const result = await getSwapQuote({
      chain: "arc_testnet",
      tokenIn: "USDC",
      tokenOut: "EURC",
      amountIn: "1",
      slippageBps: 100,
      userAddress: "0x1111111111111111111111111111111111111111",
    });

    expect(result.estimatedAmountOut).toBe("990000");
  });

  it("throws API message on build failure", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          error: {
            code: "VALIDATION_ERROR",
            message: "amountIn must be greater than 0",
          },
        }),
        { status: 400 },
      ),
    );

    await expect(
      buildSwapTransaction({
        chain: "arc_testnet",
        tokenIn: "USDC",
        tokenOut: "EURC",
        amountIn: "0",
        userAddress: "0x1111111111111111111111111111111111111111",
      }),
    ).rejects.toThrow("amountIn must be greater than 0");
  });
});
