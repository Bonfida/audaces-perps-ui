import { useAsyncData } from "../utils/fetch-loop";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AUDACES_ID, UserAccount, Side } from "@audaces/perps";
import tuple from "immutable-tuple";

export interface OpenOrder {
  side: Side;
  price: number;
  size: number;
  orderIndex: number;
}

export const useOpenOrders = () => {
  const { connection } = useConnection();
  const { connected, publicKey } = useWallet();
  const fn = async () => {
    if (!connected || !publicKey) return;
    try {
      const [key] = await UserAccount.findAddress(publicKey, AUDACES_ID);
      const userAccount = await UserAccount.retrieve(connection, key);
      return await userAccount.allOpenOrders(connection);
    } catch (err) {
      console.log(err);
      return null;
    }
  };
  return useAsyncData(fn, tuple("useOpenOrders", connected));
};
