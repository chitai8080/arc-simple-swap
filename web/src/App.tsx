import { useEffect, useState } from "react";
import { arcTestnet } from "viem/chains";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSwitchChain,
  useWalletClient,
} from "wagmi";
import { TOKEN_LIST } from "./features/swap/constants/tokens";
import {
  buildSwapTransaction,
  getSwapQuote,
  getSwapStatus,
} from "./features/swap/api/swapClient";
import { useSwapValidation } from "./features/swap/hooks/useSwapValidation";
import type {
  BuildSwapTxResponse,
  SwapQuoteResponse,
  SwapStatusResponse,
  SwapToken,
} from "./shared/types/swap";
import { WalletPanel } from "./components/WalletPanel";
import "./App.css";

type UiStatus =
  | "idle"
  | "quoting"
  | "quote-ready"
  | "building"
  | "awaiting-signature"
  | "submitted"
  | "success"
  | "error";

function formatAddress(address?: string) {
  if (!address) {
    return "";
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function App() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { data: walletClient } = useWalletClient();

  const [tokenIn, setTokenIn] = useState<SwapToken>("USDC");
  const [tokenOut, setTokenOut] = useState<SwapToken>("EURC");
  const [amountIn, setAmountIn] = useState("1.00");
  const [slippageBps, setSlippageBps] = useState(100);
  const [status, setStatus] = useState<UiStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [quote, setQuote] = useState<SwapQuoteResponse | null>(null);
  const [buildTx, setBuildTx] = useState<BuildSwapTxResponse | null>(null);
  const [txHash, setTxHash] = useState("");
  const [txStatus, setTxStatus] = useState<SwapStatusResponse["status"]>("not_found");

  const isOnArcTestnet = chain?.id === arcTestnet.id;

  const validationError = useSwapValidation({
    isConnected,
    chainId: chain?.id,
    tokenIn,
    tokenOut,
    amountIn,
    slippageBps,
  });

  async function handleQuote() {
    if (validationError) {
      setStatus("error");
      setErrorMessage(validationError);
      return;
    }

    if (!address) {
      setStatus("error");
      setErrorMessage("Connected wallet address is required.");
      return;
    }

    setStatus("quoting");
    setErrorMessage("");
    setQuote(null);
    setBuildTx(null);
    setTxHash("");
    setTxStatus("not_found");

    try {
      const quoteResult = await getSwapQuote({
        chain: "arc_testnet",
        tokenIn,
        tokenOut,
        amountIn,
        slippageBps,
        userAddress: address,
      });

      setQuote(quoteResult);
      setStatus("quote-ready");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Quote failed.");
    }
  }

  async function handleBuildAndSend() {
    if (!address) {
      setStatus("error");
      setErrorMessage("Connected wallet address is required.");
      return;
    }

    if (!walletClient) {
      setStatus("error");
      setErrorMessage("Wallet client is not ready.");
      return;
    }

    setStatus("building");
    setErrorMessage("");

    try {
      const txPayload = await buildSwapTransaction({
        chain: "arc_testnet",
        tokenIn,
        tokenOut,
        amountIn,
        slippageBps,
        userAddress: address,
      });

      setBuildTx(txPayload);
      setStatus("awaiting-signature");

      const sentHash = await walletClient.sendTransaction({
        account: address,
        chain: arcTestnet,
        to: txPayload.transaction.to as `0x${string}`,
        data: txPayload.transaction.data as `0x${string}`,
        value: BigInt(txPayload.transaction.value),
        gas: txPayload.transaction.gasLimit ? BigInt(txPayload.transaction.gasLimit) : undefined,
        gasPrice: txPayload.transaction.gasPrice ? BigInt(txPayload.transaction.gasPrice) : undefined,
      });

      setTxHash(sentHash);
      setStatus("submitted");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Swap failed.");
    }
  }

  useEffect(() => {
    if (!txHash || status !== "submitted") {
      return;
    }

    const intervalId = setInterval(() => {
      void (async () => {
        try {
          const swapStatus = await getSwapStatus(txHash);
          setTxStatus(swapStatus.status);

          if (swapStatus.status === "success") {
            setStatus("success");
            clearInterval(intervalId);
            return;
          }

          if (swapStatus.status === "failed") {
            setStatus("error");
            setErrorMessage("Swap transaction failed on-chain.");
            clearInterval(intervalId);
          }
        } catch (error) {
          setStatus("error");
          setErrorMessage(error instanceof Error ? error.message : "Could not fetch tx status.");
          clearInterval(intervalId);
        }
      })();
    }, 3000);

    return () => clearInterval(intervalId);
  }, [status, txHash]);

  return (
    <main className="page">
      <section className="header">
        <p className="eyebrow">Arc App Kit Demo</p>
        <h1>User-Signed Token Swap</h1>
        <p className="subtitle">
          Arc-first swap UX: backend only quote/builds transaction data, wallet user
          signs and sends the on-chain transaction.
        </p>
      </section>

      <WalletPanel
        isConnected={isConnected}
        shortAddress={formatAddress(address)}
        chainLabel={chain?.name ?? "Unknown"}
        connectors={connectors.map((connector) => ({ id: connector.id, name: connector.name }))}
        onConnect={(connectorId) => {
          const connector = connectors.find((item) => item.id === connectorId);
          if (connector) {
            connect({ connector });
          }
        }}
        onDisconnect={() => disconnect()}
        onSwitchArc={() => switchChain({ chainId: arcTestnet.id })}
        isConnecting={isConnecting}
        isSwitching={isSwitching}
        isOnArcTestnet={isOnArcTestnet}
      />

      <section className="card">
        <h2>Swap Input</h2>
        <div className="form-grid">
          <label>
            Token In
            <select
              value={tokenIn}
              onChange={(event) => setTokenIn(event.target.value as SwapToken)}
            >
              {TOKEN_LIST.map((token) => (
                <option key={token} value={token}>
                  {token}
                </option>
              ))}
            </select>
          </label>

          <label>
            Token Out
            <select
              value={tokenOut}
              onChange={(event) => setTokenOut(event.target.value as SwapToken)}
            >
              {TOKEN_LIST.map((token) => (
                <option key={token} value={token}>
                  {token}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label>
          Amount In
          <input
            type="number"
            min="0"
            step="0.000001"
            value={amountIn}
            onChange={(event) => setAmountIn(event.target.value)}
            placeholder="1.00"
          />
        </label>

        <label>
          Slippage (bps)
          <input
            type="number"
            min="1"
            max="5000"
            step="1"
            value={slippageBps}
            onChange={(event) => setSlippageBps(Number(event.target.value))}
          />
        </label>

        <div className="actions-row">
          <button
            type="button"
            className="primary"
            onClick={handleQuote}
            disabled={status === "quoting" || Boolean(validationError)}
          >
            {status === "quoting" ? "Quoting..." : "Get Quote"}
          </button>

          <button
            type="button"
            onClick={handleBuildAndSend}
            disabled={Boolean(validationError) || !quote || status === "building" || status === "awaiting-signature"}
          >
            {status === "building"
              ? "Building tx..."
              : status === "awaiting-signature"
                ? "Check wallet..."
                : "Build & Sign Swap"}
          </button>
        </div>

        {validationError ? <p className="warning">{validationError}</p> : null}
      </section>

      <section className="card status-card">
        <h2>Status</h2>
        <p className="status-line">
          <span className={`status-dot ${status}`} />
          {status}
        </p>

        {quote ? (
          <div className="result-grid">
            <p>estimatedAmountOut: {quote.estimatedAmountOutHuman} {quote.tokenOut}</p>
            {quote.minAmountOutHuman ? <p>minAmountOut: {quote.minAmountOutHuman} {quote.tokenOut}</p> : null}
            {buildTx ? <p>txTo: {buildTx.transaction.to}</p> : null}
            {txHash ? <p>txHash: {txHash}</p> : null}
            {txHash ? <p>txStatus: {txStatus}</p> : null}
          </div>
        ) : null}

        {status === "error" ? <p className="error-text">{errorMessage}</p> : null}
      </section>
    </main>
  );
}

export default App;
