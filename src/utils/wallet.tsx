import { useEffect, useMemo } from "react";
import { FC, } from 'react';
import { useWallet, WalletProvider } from "@solana/wallet-adapter-react";
import {
  getBloctoWallet,
  getPhantomWallet,
  getSolflareWallet,
  getSolletWallet,
  getSolongWallet,
  getMathWallet,
  getCoin98Wallet,
  getCloverWallet,
} from '@solana/wallet-adapter-wallets';
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { notify } from "./notifications";

export const WalletProviderWrapper: FC = ({ children }) => {
  const network = WalletAdapterNetwork.Mainnet;
  const wallets = useMemo(() => [
      getBloctoWallet({ network }),
      getPhantomWallet(),
      getSolletWallet({ network }),
      getSolflareWallet(),
      getSolongWallet(),
      getMathWallet(),
      getCoin98Wallet(),
      getCloverWallet(),
  ], [network]);

  return (
    <WalletProvider wallets={wallets} autoConnect>
      <Children>
        {children}
      </Children>
    </WalletProvider>
  )
}

const Children: FC = ({ children }) => {
  const { adapter, connected } = useWallet()

  useEffect(() => {
    if (!adapter) return;

    const connect = () => {
      if (!adapter) return;

      console.log("connected");
      if (adapter.publicKey) {
        console.log("connected");
        localStorage.removeItem("feeDiscountKey");
        const walletPublicKey = adapter.publicKey.toBase58();
        const keyToDisplay =
          walletPublicKey.length > 20
            ? `${walletPublicKey.substring(
                0,
                7
              )}.....${walletPublicKey.substring(
                walletPublicKey.length - 7,
                walletPublicKey.length
              )}`
            : walletPublicKey;

        notify({
          message: "Wallet update Connected to wallet " + keyToDisplay,
        });
      }
    }

    adapter.on("connect", connect)

    return () => {
      adapter?.removeListener("connect", connect)
    }
  }, [adapter]);

  useEffect(() => {
    if (!adapter) return;

    const disconnect = () => {
      console.log("disconnect");
      notify({
        message: "Wallet update - Disconnected from wallet",
      });
      localStorage.removeItem("feeDiscountKey");
    }

    adapter.on("disconnect", disconnect)

    return () => {
      adapter?.removeListener("disconnect", disconnect)
    }
  }, [adapter]);

  return (
    <>
      {children}
    </>
  )
}

export default WalletProviderWrapper;