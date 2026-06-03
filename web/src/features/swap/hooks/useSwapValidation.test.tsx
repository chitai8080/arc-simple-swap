import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { arcTestnet } from "viem/chains";
import { useSwapValidation } from "./useSwapValidation";

describe("useSwapValidation", () => {
  it("requires connection", () => {
    const { result } = renderHook(() =>
      useSwapValidation({
        isConnected: false,
        chainId: arcTestnet.id,
        tokenIn: "USDC",
        tokenOut: "EURC",
        amountIn: "1",
        slippageBps: 100,
      }),
    );

    expect(result.current).toContain("Connect wallet");
  });

  it("passes valid payload", () => {
    const { result } = renderHook(() =>
      useSwapValidation({
        isConnected: true,
        chainId: arcTestnet.id,
        tokenIn: "USDC",
        tokenOut: "EURC",
        amountIn: "1",
        slippageBps: 100,
      }),
    );

    expect(result.current).toBe("");
  });
});
