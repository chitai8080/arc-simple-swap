type WalletPanelProps = {
  isConnected: boolean;
  shortAddress: string;
  chainLabel: string;
  connectors: Array<{ id: string; name: string }>;
  onConnect: (connectorId: string) => void;
  onDisconnect: () => void;
  onSwitchArc: () => void;
  isConnecting: boolean;
  isSwitching: boolean;
  isOnArcTestnet: boolean;
};

export function WalletPanel({
  isConnected,
  shortAddress,
  chainLabel,
  connectors,
  onConnect,
  onDisconnect,
  onSwitchArc,
  isConnecting,
  isSwitching,
  isOnArcTestnet,
}: WalletPanelProps) {
  return (
    <section className="card">
      <h2>Wallet</h2>
      <p className="muted">
        Status: {isConnected ? "Connected" : "Disconnected"}
      </p>
      <p className="muted">Address: {isConnected ? shortAddress : "-"}</p>
      <p className="muted">Network: {chainLabel}</p>

      <div className="actions-row">
        {!isConnected ? (
          connectors.map((connector) => (
            <button
              key={connector.id}
              type="button"
              onClick={() => onConnect(connector.id)}
              disabled={isConnecting}
            >
              {isConnecting ? "Connecting..." : `Connect ${connector.name}`}
            </button>
          ))
        ) : (
          <button type="button" className="danger" onClick={onDisconnect}>
            Disconnect
          </button>
        )}

        {isConnected && !isOnArcTestnet ? (
          <button type="button" onClick={onSwitchArc} disabled={isSwitching}>
            {isSwitching ? "Switching..." : "Switch to Arc Testnet"}
          </button>
        ) : null}
      </div>
    </section>
  );
}
