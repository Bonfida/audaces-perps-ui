import * as aob from "@bonfida/aob";
import { MarketState } from "@audaces/perps";
import { useAsyncData } from "../utils/fetch-loop";
import { useConnection } from "@solana/wallet-adapter-react";
import tuple from "immutable-tuple";
import { PublicKey } from "@solana/web3.js";

export const useOrderbook = (marketKey: PublicKey | undefined | null) => {
  const { connection } = useConnection();
  const fn = async () => {
    if (!marketKey) return;
    const marketState = await MarketState.retrieve(connection, marketKey);
    const aobMarketState = await aob.MarketState.retrieve(
      connection,
      marketState.aobMarket
    );
    const bids = await aobMarketState.loadBidsSlab(connection);
    const asks = await aobMarketState.loadAsksSlab(connection);
    return {
      bids: bids.getL2DepthJS(10, false),
      asks: asks.getL2DepthJS(10, true),
    };
  };
  return useAsyncData(fn, tuple("useOrderbook", marketKey?.toBase58()), {
    refreshInterval: 5_000,
  });
};
