import type { SupportedChainKey } from "./chains.js";

export const TOKENS = {
  arc_testnet: {
    USDC: { symbol: "USDC", address: "0x3600000000000000000000000000000000000000", decimals: 6 },
    EURC: { symbol: "EURC", address: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a", decimals: 6 },
  },
} as const;

export type TokenSymbol = keyof (typeof TOKENS)["arc_testnet"];

export function getTokenConfig(chain: SupportedChainKey, symbol: TokenSymbol) {
  return TOKENS[chain][symbol];
}
