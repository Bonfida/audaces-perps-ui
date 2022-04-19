import React, { useMemo } from "react";
import { MuiThemeProvider } from "@material-ui/core/styles";
import { CssBaseline } from "@material-ui/core";
import { theme } from "./theme";
import { SnackbarProvider } from "notistack";
import { LayoutProvider } from "./utils/layout";
import { MarketProvider } from "./utils/market";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  getBloctoWallet,
  getPhantomWallet,
  getSolflareWallet,
  getSolletWallet,
  getSolongWallet,
  getCoin98Wallet,
  getCloverWallet,
  getTorusWallet,
  getMathWallet,
  getSlopeWallet,
} from "@solana/wallet-adapter-wallets";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { getToken } from "./utils/rpc";
import { tokenAuthFetchMiddleware } from "@strata-foundation/web3-token-auth";

require("@solana/wallet-adapter-react-ui/styles.css");

const App = ({ children }: { children: React.ReactNode }) => {
  const network = WalletAdapterNetwork.Mainnet;
  const wallets = useMemo(
    () => [
      getPhantomWallet(),
      getSolflareWallet(),
      getSolletWallet({ network }),
      getBloctoWallet({ network }),
      getTorusWallet(),
      getSolongWallet(),
      getMathWallet(),
      getCoin98Wallet(),
      getCloverWallet(),
      getSlopeWallet(),
    ],
    [network]
  );

  const endpoint = useMemo(
    () =>
      process.env.NODE_ENV === "production"
        ? process.env.REACT_APP_CONNECTION!
        : process.env.REACT_APP_CONNECTION_DEV!,
    []
  );

  return (
    <ConnectionProvider
      endpoint={endpoint}
      config={{
        commitment: "processed",
        wsEndpoint: process.env.REACT_APP_CONNECTION_WSS as string,
        fetchMiddleware: tokenAuthFetchMiddleware({
          getToken,
        }),
      }}
    >
      <SnackbarProvider maxSnack={5} autoHideDuration={8000}>
        <WalletProvider wallets={wallets} autoConnect>
          <MarketProvider>
            <LayoutProvider>
              <MuiThemeProvider theme={theme}>
                <CssBaseline />
                {children}
              </MuiThemeProvider>
            </LayoutProvider>
          </MarketProvider>
        </WalletProvider>
      </SnackbarProvider>
    </ConnectionProvider>
  );
};

export default App;
