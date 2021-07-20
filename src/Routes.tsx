import React, { useEffect } from "react";
import { HashRouter, Route } from "react-router-dom";
import { useSnackbar } from "notistack";
import SnackbarUtils from "./utils/SnackbarUtils";
import NavigationFrame from "./components/NavigationFrame";
import TradePage from "./pages/TradePage";
import HomePage from "./pages/HomePage";
import NodesPage from "./pages/NodesPage";
import LeaderboardPage from "./pages/LeaderboardPage";

export default function Routes() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  useEffect(() => {
    SnackbarUtils.setSnackBar(enqueueSnackbar, closeSnackbar);
  }, [enqueueSnackbar, closeSnackbar]);
  return (
    <HashRouter>
      <NavigationFrame>
        <Route exact path="/" component={HomePage} />
        <Route exact path="/nodes" component={NodesPage} />
        <Route exact path="/trade/:market" component={TradePage} />
        <Route exact path="/ref/:refCode" component={HomePage} />
        <Route exact path="/leaderboard" component={LeaderboardPage} />
      </NavigationFrame>
    </HashRouter>
  );
}
