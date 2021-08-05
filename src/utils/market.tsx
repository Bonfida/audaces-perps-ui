import React, {
  useMemo,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  MarketContextValues,
  PastTrade,
  FundingPayment,
  Trader,
  Market,
} from "./types";
import { PublicKey } from "@solana/web3.js";
import { useAsyncData } from "./fetch-loop";
import { useConnection } from "./connection";
import {
  MarketState,
  UserAccount,
  getUserAccountsForOwner,
  getDiscountAccount,
} from "@audaces/perps";
import tuple from "immutable-tuple";
import { useWallet } from "./wallet";
import { apiGet, roundToDecimal, useLocalStorageState } from "./utils";

const URL_API_TRADES = "https://serum-api.bonfida.com/perps/trades?market=";
const URL_API_VOLUME = "https://serum-api.bonfida.com/perps/volume?market=";
const URL_API_FUNDING =
  "https://serum-api.bonfida.com/perps/funding-payment?userAddress=";
const URL_LEADERBOARD = "https://serum-api.bonfida.com/perps/leaderboard";

export const MAX_LEVERAGE = 15;

// TODO put this on NPM
export const MARKETS: Market[] = [
  {
    address: "475P8ZX3NrzyEMJSFHt9KCMjPpWBWGa6oNxkWcwww2BR",
    name: "BTC-PERP",
  },
  {
    address: "3ds9ZtmQfHED17tXShfC1xEsZcfCvmT8huNG79wa4MHg",
    name: "ETH-PERP",
  },
  {
    address: "jeVdn6rxFPLpCH9E6jmk39NTNx2zgTmKiVXBDiApXaV",
    name: "SOL-PERP",
  },
];

const MarketContext: React.Context<null | MarketContextValues> =
  React.createContext<null | MarketContextValues>(null);

export const MarketProvider = ({ children }) => {
  const connection = useConnection();
  const [slippage, setSlippage] = useState(0.1);
  const [autoApprove, setAutoApprove] = useLocalStorageState(
    "autoApprove",
    false
  );
  const [market, setMarket] = useLocalStorageState("market", MARKETS[0]);
  const [userAccount, setUserAccount] = useState<
    UserAccount | null | undefined
  >(null);
  const [useIsolatedPositions, setUseIsolatedPositions] = useLocalStorageState(
    "useIsolatedPositions",
    false
  );
  const { wallet, connected } = useWallet();

  const marketAddress = useMemo(
    () => new PublicKey(market.address),
    [market.address]
  );

  const getMarketState = useCallback(async () => {
    const marketState = await MarketState.retrieve(
      connection,
      new PublicKey(market.address)
    );
    marketState.quoteDecimals = Math.pow(10, marketState.quoteDecimals);
    marketState.coinDecimals = Math.pow(10, marketState.coinDecimals);
    return marketState;
  }, [market.address, connection]);

  const [marketState, marketStateLoaded] = useAsyncData(
    getMarketState,
    tuple("getMarketState", connection, market.address),
    { refreshInterval: 1_000 }
  );
  const [refreshUserAccount, setRefreshUserAccount] = useState(false);

  useEffect(() => {
    const fn = async () => {
      if (!connected) {
        return;
      }
      const userAccounts = await getUserAccountsForOwner(
        connection,
        wallet.publicKey
      );
      const filtered = userAccounts
        ?.filter((u) => u?.market.equals(marketAddress))
        .sort((a, b) => {
          if (a && b) {
            return b?.balance - a?.balance;
          }
          return 0;
        });
      setUserAccount(filtered[0] as UserAccount);
    };
    fn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, market.address, refreshUserAccount, marketState]);

  return (
    <MarketContext.Provider
      value={{
        marketAddress,
        marketName: market.name,
        marketState,
        marketStateLoaded,
        slippage,
        setSlippage,
        setMarket,
        userAccount,
        setUserAccount,
        autoApprove,
        setAutoApprove,
        refreshUserAccount,
        setRefreshUserAccount,
        useIsolatedPositions,
        setUseIsolatedPositions,
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
    marketAddress: context.marketAddress,
    marketName: context.marketName,
    marketState: context.marketState,
    marketStateLoaded: context.marketStateLoaded,
    slippage: context.slippage,
    setSlippage: context.setSlippage,
    setMarket: context.setMarket,
    userAccount: context.userAccount,
    setUserAccount: context.setUserAccount,
    autoApprove: context.autoApprove,
    setAutoApprove: context.setAutoApprove,
    refreshUserAccount: context.refreshUserAccount,
    setRefreshUserAccount: context.setRefreshUserAccount,
    useIsolatedPositions: context.useIsolatedPositions,
    setUseIsolatedPositions: context.setUseIsolatedPositions,
  };
};

export const useVolume = (
  marketAddress: string | null | undefined,
  startTime?: number,
  endTime?: number
) => {
  if (!startTime || !endTime) {
    endTime = new Date().getTime() / 1_000;
    endTime = endTime - (endTime % (60 * 60));
    startTime = endTime - 24 * 60 * 60;
  }
  const fn = async () => {
    if (!marketAddress) return;
    const result = await apiGet(
      `${URL_API_VOLUME}${marketAddress}&startTime=${startTime}&endTime=${endTime}`
    );
    if (!result.success) return 0;
    return roundToDecimal(result?.data?.volume, 2)?.toLocaleString();
  };
  return useAsyncData(
    fn,
    tuple("useVolume", marketAddress, startTime, endTime)
  );
};

export const useLastTrades = () => {};

export const useMarkPrice = () => {
  const { marketState } = useMarket();
  if (!marketState?.vQuoteAmount || !marketState?.vCoinAmount) {
    return null;
  }
  return marketState.vQuoteAmount / marketState.vCoinAmount;
};

export const getFundingRate = (marketState: MarketState | null | undefined) => {
  if (!marketState) {
    return null;
  }
  return marketState.getFundingRatioLongShort();
};

export const useUserAccount = () => {
  const { userAccount } = useMarket();
  return userAccount;
};

export const useMarketTrades = (marketAddress: PublicKey) => {
  const fn = async () => {
    const result = await apiGet(`${URL_API_TRADES}${marketAddress.toBase58()}`);
    if (!result.success) {
      throw new Error("Error fetching pas trade");
    }
    const data: PastTrade[] = result.data;
    return data;
  };
  return useAsyncData(fn, tuple("useMarketTrades", marketAddress.toBase58()), {
    refreshInterval: 5_000,
  });
};

export const useUserTrades = (marketAddress: PublicKey) => {
  const { wallet, connected } = useWallet();
  const fn = async () => {
    if (!connected || !wallet.publicKey) return;
    const result = await apiGet(
      `${URL_API_TRADES}${marketAddress.toBase58()}&feePayer=${wallet.publicKey.toBase58()}`
    );
    if (!result.success) {
      throw new Error("Error fetching past trade");
    }
    const data: PastTrade[] = result.data;
    return data;
  };
  return useAsyncData(
    fn,
    tuple("useUserTrades", marketAddress.toBase58(), connected)
  );
};

export const useUserFunding = () => {
  const { userAccount } = useMarket();
  const fn = async () => {
    const result = await apiGet(
      `${URL_API_FUNDING}${userAccount?.address.toBase58()}`
    );
    if (!result.success) {
      throw new Error("Error fetching funding");
    }
    let data: FundingPayment[] = result.data;
    let vide: FundingPayment[] = [];
    data = data.reduce((unique, o) => {
      // Server returning funding payment might contain duplicates. Checking signature for unicity
      if (!unique.some((obj) => obj.signature === o.signature)) {
        unique.push(o);
      }
      return unique;
    }, vide);
    return data;
  };
  return useAsyncData(
    fn,
    tuple("useUserFunding", userAccount?.address?.toBase58())
  );
};

export const useFidaAmount = () => {
  const { wallet, connected } = useWallet();
  const connection = useConnection();
  const fn = async () => {
    if (!connected) return;
    const discountAccount = await getDiscountAccount(
      connection,
      wallet.publicKey
    );
    if (!discountAccount) return 0;
    const accountInfo = await connection.getParsedAccountInfo(discountAccount);
    // @ts-ignore
    return accountInfo.value?.data.parsed.info.tokenAmount.uiAmount;
  };
  return useAsyncData(fn, tuple("useFidaAmount", connection, connected));
};

export const useLeaderBoard = (
  startTime?: number,
  endTime?: number,
  limit?: number
) => {
  const fn = async () => {
    let url = URL_LEADERBOARD;
    if (startTime && endTime) {
      url += `?endTime=${endTime}&startTime=${startTime}`;
    }
    const result = await apiGet(url);
    if (!result.success) {
      throw new Error("Error fetching leaderboard");
    }
    const data: Trader[] = result.data;
    data.sort((a, b) => b.volume - a.volume);
    if (limit) return data.slice(0, limit);
    return data;
  };
  return useAsyncData(fn, tuple("useLeaderBoard", startTime, endTime), {
    refreshInterval: 60 * 1_000 * 10,
  });
};

export const findSide = (action: string, side: string) => {
  if (action === "closePosition") {
    return side === "buy" ? "sell" : "buy";
  }
  return side;
};

export const useMarketState = (marketAddress: PublicKey) => {
  const connection = useConnection();
  const fn = async () => {
    const marketState = await MarketState.retrieve(connection, marketAddress);
    marketState.quoteDecimals = Math.pow(10, marketState.quoteDecimals);
    marketState.coinDecimals = Math.pow(10, marketState.coinDecimals);
    return marketState;
  };
  return useAsyncData(fn, tuple("useMarketState", marketAddress.toBase58()));
};
