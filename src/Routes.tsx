import React, { useEffect } from "react";
import { HashRouter, Route } from "react-router-dom";
import { useSnackbar } from "notistack";
import SnackbarUtils from "./utils/SnackbarUtils";
import NavigationFrame from "./components/NavigationFrame";
import TradePage from "./pages/TradePage";
import HomePage from "./pages/HomePage";
import NodesPage from "./pages/NodesPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import CreateUi from "./pages/CreateUi";

export default function Routes() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  useEffect(() => {
    SnackbarUtils.setSnackBar(enqueueSnackbar, closeSnackbar);
  }, [enqueueSnackbar, closeSnackbar]);
  return (
    <HashRouter>
      <NavigationFrame>
        <Route exact path="/" component={TradePage} />
        <Route exact path="/trade/:market" component={TradePage} />
        <Route exact path="/leaderboard" component={LeaderboardPage} />
        <Route exact path="/create-ui" component={CreateUi} />
      </NavigationFrame>
    </HashRouter>
  );
}
