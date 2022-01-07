import tuple from "immutable-tuple";
import { PublicKey } from "@solana/web3.js";
import { MarketState } from "@audaces/perps";
import { useAsyncData } from "../utils/fetch-loop";
import { useConnection } from "@solana/wallet-adapter-react";

export const useMarketState = (marketKey: PublicKey | undefined | null) => {
  const { connection } = useConnection();
  const fn = async () => {
    if (!marketKey) return;
    const marketState = await MarketState.retrieve(connection, marketKey);
    return marketState;
  };
  return useAsyncData(fn, tuple("useMarketState", marketKey?.toBase58()));
};
