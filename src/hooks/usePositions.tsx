import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { AUDACES_ID, UserAccount } from "@audaces/perps";
import { useAsyncData } from "../utils/fetch-loop";
import tuple from "immutable-tuple";

export const usePositions = () => {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();

  const fn = async () => {
    if (!connected || !publicKey) return;
    const [key] = await UserAccount.findAddress(publicKey, AUDACES_ID);
    const userAccount = await UserAccount.retrieve(connection, key);
    const positions = userAccount.openMarkets;
    return positions;
  };

  return useAsyncData(
    fn,
    tuple("usePositions", connected, publicKey?.toBase58())
  );
};
