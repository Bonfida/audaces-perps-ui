import { MarketState } from "@audaces/perps";
import * as aob from "@bonfida/aob";
import { useAsyncData } from "../utils/fetch-loop";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import * as math from "mathjs";
import tuple from "immutable-tuple";
import { useMarket } from "../contexts/market";

export const useMarkPrice = (market: PublicKey) => {
  const { connection } = useConnection();
  const fn = async () => {
    const marketState = await MarketState.retrieve(connection, market);
    const aobMarketState = await aob.MarketState.retrieve(
      connection,
      marketState.aobMarket
    );
    const bids = (await aobMarketState.loadBidsSlab(connection)).getL2DepthJS(
      1,
      false
    );
    const asks = (await aobMarketState.loadAsksSlab(connection)).getL2DepthJS(
      1,
      true
    );

    return (
      math.median(
        bids[0].price,
        asks[0].price,
        marketState.lastTradePrice.toNumber()
      ) / Math.pow(2, 32)
    );
  };

  return useAsyncData(fn, tuple("useMarkPrice", market.toBase58()));
};
