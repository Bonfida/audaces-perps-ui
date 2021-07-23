import Wallet from "@project-serum/sol-wallet-adapter";
import { AccountInfo, Connection, PublicKey } from "@solana/web3.js";
import { MarketState, UserAccount } from "@audaces/perps";
import { Mark } from "@material-ui/core";

export interface ConnectionContextValues {
  endpoint: string;
  setEndpoint: (newEndpoint: string) => void;
  connection: Connection;
  sendConnection: Connection;
  availableEndpoints: EndpointInfo[];
  setCustomEndpoints: (newCustomEndpoints: EndpointInfo[]) => void;
}

export interface WalletContextValues {
  wallet: Wallet;
  connected: boolean;
  providerUrl: string;
  setProviderUrl: (newProviderUrl: string) => void;
  providerName: string;
}

export interface EndpointInfo {
  name: string;
  endpoint: string;
  custom: boolean;
}

export interface SelectedTokenAccounts {
  [tokenMint: string]: string;
}

export interface TokenAccount {
  pubkey: PublicKey;
  account: AccountInfo<Buffer> | null;
  effectiveMint: PublicKey;
}

export interface ExternalSignalProvider {
  name: string;
  displayName: string;
  pubKey: PublicKey;
  description: JSX.Element;
}

export interface TradeRowProps {
  market: string;
  side: string;
  size: number;
  time: number;
  price: number;
}

export interface FeesRowProps {
  feeTier: number;
  fee: string;
  feeHighLeverage: string;
  requirements: string;
  min: number;
  max: number;
  isUserFeeTier?: boolean;
}

export interface LayoutContextValues {
  locked: boolean;
  setLocked: (args: boolean) => void;
  onLayoutChange: (args: any) => void;
  resetLayout: () => void;
  layouts: any;
  getLayout: (arg: string) => any;
  breakpoints: Object;
  cols: Object;
  rowHeight: number;
  width: number;
  breakpointString: string;
}

export interface AvailableCollateral {
  address: PublicKey;
  amount: number;
  uiAmount: number;
  decimals: number;
}

export interface MarketContextValues {
  marketAddress: PublicKey;
  marketName: string;
  marketState: MarketState | null | undefined;
  marketStateLoaded: boolean;
  slippage: number;
  setSlippage: (arg: number) => void;
  setMarket: (arg: Market) => void;
  userAccount: UserAccount | null | undefined;
  setUserAccount: (arg: UserAccount | null | undefined) => void;
  autoApprove: boolean;
  setAutoApprove: (arg: boolean) => void;
  refreshUserAccount: boolean;
  setRefreshUserAccount: (arg: any) => void;
  useIsolatedPositions: boolean;
  setUseIsolatedPositions: (arg: boolean) => void;
}

export interface Position {
  marketName: string;
  side: string;
  size: number;
  pnl: number;
  leverage: number;
  liqPrice: number;
  entryPrice: number;
  positionAccount: PublicKey;
  collateral: number;
  marketAddress: PublicKey;
  positionIndex: number;
  vCoinAmount: number;
}

export interface PastTrade {
  type: string;
  side: string;
  time: number;
  feePayer: string;
  orderSize: number;
  markPrice: number;
  market: string;
  signature: string;
}

export interface FundingPayment {
  time: number;
  market: string;
  amount: number;
  fundingPayer: string;
  signature: string;
}

export interface Trader {
  feePayer: string;
  volume: number;
}

export interface Market {
  address: string;
  name: string;
}
