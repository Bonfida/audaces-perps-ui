import { UserAccount, AUDACES_ID } from "@audaces/perps";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import tuple from "immutable-tuple";
import { useAsyncData } from "../utils/fetch-loop";

export const useOpenPositions = () => {
  const { connection } = useConnection();
  const { connected, publicKey } = useWallet();

  const fn = async () => {
    if (!connected || !publicKey) return;
    const [key] = await UserAccount.findAddress(publicKey, AUDACES_ID);
    const userAccount = await UserAccount.retrieve(connection, key);
    return userAccount.openMarkets;
  };

  return useAsyncData(fn, tuple("useOpenPositions", connected));
};
