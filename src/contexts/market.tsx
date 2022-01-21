import React, { useCallback, useContext } from "react";
import { PublicKey } from "@solana/web3.js";
import {
  MarketState,
  ECOSYSTEM,
  AUDACES_ID,
  Ecosystem,
  MARKET,
} from "@audaces/perps";
import { useConnection } from "@solana/wallet-adapter-react";
import { useLocalStorageState } from "../utils/utils";
import tuple from "immutable-tuple";
import { useAsyncData } from "../utils/fetch-loop";

export interface Market {
  address: string;
  name: string;
}

const MARKETS = [
  {
    address: MARKET.toBase58(),
    name: "BTC-PERP",
  },
];

export interface MarketContextValues {
  programId: PublicKey;

  // Market
  currentMarket: Market;
  marketState: MarketState | undefined | null;
  availableMarkets: Market[];
  setMarket: (arg: Market) => void;

  // Ecosystem
  ecosystemKey: PublicKey;
  ecosystem: Ecosystem | undefined | null;
}

const MarketContext: React.Context<null | MarketContextValues> =
  React.createContext<null | MarketContextValues>(null);

export const MarketProvider = ({ children }) => {
  const { connection } = useConnection();
  const [market, setMarket] = useLocalStorageState<Market>(
    "market",
    MARKETS[0]
  );

  // Market state
  const getMarketState = useCallback(async () => {
    const marketState = await MarketState.retrieve(
      connection,
      new PublicKey(market.address)
    );
    return marketState;
  }, [market.address, connection]);

  const [marketState] = useAsyncData(
    getMarketState,
    tuple("getMarketState", connection, market.address),
    { refreshInterval: 1_000 }
  );

  // Ecosystem
  const getEcosystem = useCallback(async () => {
    const ecosystem = await Ecosystem.retrieve(connection, ECOSYSTEM);
    return ecosystem;
  }, []);
  const [ecosystem] = useAsyncData(getEcosystem, "ecosystem");

  return (
    <MarketContext.Provider
      value={{
        programId: AUDACES_ID,
        currentMarket: market,
        marketState,
        availableMarkets: MARKETS,
        setMarket,
        ecosystemKey: ECOSYSTEM,
        ecosystem,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error("Missing market context");
  }
  return {
    programId: context.programId,
    currentMarket: context.currentMarket,
    marketState: context.marketState,
    availableMarkets: context.availableMarkets,
    setMarket: context.setMarket,
    ecosystemKey: context.ecosystemKey,
    ecosystem: context.ecosystem,
  };
};
