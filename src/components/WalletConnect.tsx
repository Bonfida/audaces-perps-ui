import React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";

export default function WalletConnect() {
  const { connected } = useWallet();
  return (
    <>
      <WalletModalProvider>
        {connected ? <WalletDisconnectButton /> : <WalletMultiButton />}
      </WalletModalProvider>
    </>
  );
}
