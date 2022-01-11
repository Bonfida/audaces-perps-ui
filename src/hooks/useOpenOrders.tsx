import { useAsyncData } from "../utils/fetch-loop";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  AUDACES_ID,
  UserAccount,
  MarketState,
  MARKET,
  Side,
} from "@audaces/perps";
import * as aob from "@bonfida/aob";
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
    const [key] = await UserAccount.findAddress(publicKey, AUDACES_ID);
    const userAccount = await UserAccount.retrieve(connection, key);
    const marketState = await MarketState.retrieve(connection, MARKET);
    const aobMarketState = await aob.MarketState.retrieve(
      connection,
      marketState.aobMarket
    );
    const bids = await aobMarketState.loadBidsSlab(connection);
    const asks = await aobMarketState.loadAsksSlab(connection);

    let result: OpenOrder[] = [];

    for (let i = 0; i < userAccount.orders.length; i++) {
      const bid = bids.getNodeByKey(userAccount.orders[i].orderId.toNumber());
      console.log(bid);
      if (!!bid) {
        result.push({
          side: Side.Bid,
          size: bid.baseQuantity.toNumber(),
          price: bid.getPrice().toNumber() / Math.pow(2, 32),
          orderIndex: i,
        });
        continue;
      }
      console.log(1);
      const ask = asks.getNodeByKey(userAccount.orders[i].orderId.toNumber());
      if (!!ask) {
        result.push({
          side: Side.Ask,
          size: ask.baseQuantity.toNumber(),
          price: ask.getPrice().toNumber() / Math.pow(2, 32),
          orderIndex: i,
        });
      }
    }

    // Order index + info price, size side
    console.log(result);

    return result;
  };
  return useAsyncData(fn, tuple("useOpenOrders", connected));
};
