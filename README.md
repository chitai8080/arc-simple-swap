# Arc Swap Simple (User-Signed, Arc-First)

Production-oriented swap starter with a strict user-signed security model:

- Web app connects wallet (MetaMask, Rabby, WalletConnect)
- Backend only provides quote/build/status APIs
- User wallet signs and sends the transaction

No API or UI flow in this project requires a developer wallet private key.

## Security model

- Backend does not hold or use user private keys
- Backend does not sign transactions for users
- Frontend only uses safe VITE_ variables
- Rate limit, CORS policy, structured logging, and Zod validation are enabled on server

## Swap flow (user-signed)

1. User connects wallet in web app
2. Web calls POST /api/swap/quote with userAddress
3. Web calls POST /api/swap/build-tx with userAddress
4. Backend returns raw transaction payload (to, data, value, chainId)
5. User wallet signs and submits transaction
6. Web polls GET /api/swap/status/:txHash

## API

- POST /api/swap/quote
- POST /api/swap/build-tx
- GET /api/swap/status/:txHash
- GET /api/health

## Environment

### server/.env

Copy server/.env.example to server/.env and configure:

PORT=8787
WEB_ORIGIN=http://localhost:5173
ARC_RPC_URL=https://rpc.testnet.arc.network
SWAP_PROVIDER_BASE_URL=https://li.quest/v1
SWAP_PROVIDER_TIMEOUT_MS=12000
APP_INTEGRATOR_ID=

### web/.env

Copy web/.env.example to web/.env:

VITE_API_BASE_URL=http://localhost:8787
VITE_WALLETCONNECT_PROJECT_ID=

WalletConnect is optional. MetaMask and Rabby work via injected connectors.

## Local run

Install:

npm install
npm --prefix server install
npm --prefix web install

Run both apps:

npm run dev

- Web: http://localhost:5173
- Server: http://localhost:8787

## Validation, test, build

Server:

npm --prefix server run lint
npm --prefix server run typecheck
npm --prefix server run test
npm --prefix server run build

Web:

npm --prefix web run lint
npm --prefix web run typecheck
npm --prefix web run test
npm --prefix web run build

## Architecture

High-level structure:

- server/src/config: env + logger
- server/src/middleware: validation + error handling
- server/src/domain: Arc chain and token metadata
- server/src/modules/swap: schemas, routes, controller, service, provider
- web/src/features/swap: API client, token constants, hooks, ABI
- web/src/shared: app-safe env and shared swap types

## Notes

- Arc Testnet is the default chain in this project
- Current token set is USDC/EURC and is easy to extend in domain/config layers
- For production, add persistent observability, auth on write APIs, and provider fallback strategy
