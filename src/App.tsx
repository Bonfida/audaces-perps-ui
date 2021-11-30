import React from "react";
import { MuiThemeProvider } from "@material-ui/core/styles";
import { CssBaseline } from "@material-ui/core";
import { theme } from "./theme";
import WalletProviderWrapper from "./utils/wallet";
import { ConnectionProvider } from "./utils/connection";
import { SnackbarProvider } from "notistack";
import { LayoutProvider } from "./utils/layout";
import { MarketProvider } from "./utils/market";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const App = ({ children }: { children: React.ReactNode }) => {
  return (
    <ConnectionProvider>
      <SnackbarProvider maxSnack={5} autoHideDuration={8000}>
        <WalletProviderWrapper>
          <MarketProvider>
            <LayoutProvider>
              <MuiThemeProvider theme={theme}>
                <CssBaseline />
                {children}
              </MuiThemeProvider>
            </LayoutProvider>
          </MarketProvider>
        </WalletProviderWrapper>
      </SnackbarProvider>
    </ConnectionProvider>
  );
};

export default App;
