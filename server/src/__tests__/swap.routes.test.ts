import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "../app.js";

vi.mock("../modules/swap/providers/lifiProvider.js", () => {
  class MockLifiProvider {
    async quote() {
      return {
        estimatedAmountOut: "990000",
        minAmountOut: "980000",
        routeId: "route_1",
        transactionRequest: {
          to: "0x1111111111111111111111111111111111111111",
          data: "0xabcdef",
          value: "0",
          gasLimit: "210000",
          gasPrice: "1000000",
        },
        raw: {},
      };
    }
  }

  return {
    LifiProvider: MockLifiProvider,
  };
});

describe("Swap API routes", () => {
  const app = createApp();

  it("returns validation error for invalid quote payload", async () => {
    const response = await request(app).post("/api/swap/quote").send({
      chain: "arc_testnet",
      tokenIn: "USDC",
      tokenOut: "USDC",
      amountIn: "-1",
      userAddress: "0x1111111111111111111111111111111111111111",
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns quote response", async () => {
    const response = await request(app).post("/api/swap/quote").send({
      chain: "arc_testnet",
      tokenIn: "USDC",
      tokenOut: "EURC",
      amountIn: "1.0",
      slippageBps: 100,
      userAddress: "0x1111111111111111111111111111111111111111",
    });

    expect(response.status).toBe(200);
    expect(response.body.estimatedAmountOut).toBe("990000");
    expect(response.body.chain).toBe("Arc_Testnet");
  });

  it("returns build transaction payload", async () => {
    const response = await request(app).post("/api/swap/build-tx").send({
      chain: "arc_testnet",
      tokenIn: "USDC",
      tokenOut: "EURC",
      amountIn: "1.0",
      userAddress: "0x1111111111111111111111111111111111111111",
    });

    expect(response.status).toBe(200);
    expect(response.body.transaction.to).toBe("0x1111111111111111111111111111111111111111");
    expect(response.body.transaction.data).toBe("0xabcdef");
  });

  it("validates tx hash for status endpoint", async () => {
    const response = await request(app).get("/api/swap/status/not-a-hash");
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });
});
