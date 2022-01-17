import { PublicKey } from "@solana/web3.js";
import { useAsyncData } from "../utils/fetch-loop";
import tuple from "immutable-tuple";
import { getOraclePrice, MARKET } from "@audaces/perps";
import { useConnection } from "@solana/wallet-adapter-react";
import { useMarketState } from "./useMarketState";

export const useOraclePrice = () => {
  const { connection } = useConnection();
  const [marketState, marketStateLoaded] = useMarketState(MARKET);
  const fn = async () => {
    if (!marketState) return;
    const { price } = await getOraclePrice(
      connection,
      marketState.oracleAddress
    );
    return price;
  };

  return useAsyncData(fn, tuple("useOraclePrice", marketStateLoaded));
};
