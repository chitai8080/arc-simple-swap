export const ARC_TESTNET_CHAIN = {
  key: "arc_testnet",
  chainId: 5042002,
  chainName: "Arc_Testnet",
} as const;

export const SUPPORTED_CHAINS = {
  [ARC_TESTNET_CHAIN.key]: ARC_TESTNET_CHAIN,
} as const;

export type SupportedChainKey = keyof typeof SUPPORTED_CHAINS;
