export const TOKENS = {
  USDC: {
    symbol: "USDC",
    decimals: 6,
    address: "0x3600000000000000000000000000000000000000",
  },
  EURC: {
    symbol: "EURC",
    decimals: 6,
    address: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a",
  },
} as const;

export const TOKEN_LIST = ["USDC", "EURC"] as const;
