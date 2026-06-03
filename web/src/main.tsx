import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { injected, walletConnect } from "wagmi/connectors";
import { arcTestnet } from "viem/chains";
import { env } from "./shared/config/env";
import "./index.css";
import App from "./App.tsx";

const queryClient = new QueryClient();

const connectors = [
  injected({ target: "metaMask" }),
  injected({ target: "rabby" }),
];

if (env.walletConnectProjectId) {
  connectors.push(
    walletConnect({
      projectId: env.walletConnectProjectId,
      metadata: {
        name: "Arc Swap Simple",
        description: "User-signed swap app on Arc",
        url: "http://localhost:5173",
        icons: ["https://walletconnect.com/walletconnect-logo.png"],
      },
      showQrModal: true,
    }),
  );
}

const wagmiConfig = createConfig({
  chains: [arcTestnet],
  connectors,
  transports: {
    [arcTestnet.id]: http(),
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
)
