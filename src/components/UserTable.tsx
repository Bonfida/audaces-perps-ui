import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import TableContainer from "@material-ui/core/TableContainer";
import FeeTable from "./FeesTable";
import FloatingCard from "./FloatingCard";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import TabPanel from "./TabPanel";
import TradeTable from "./TradeTable";
import PositionTable from "./PositionTable";
import AccountsTable from "./AccountsTable";
import { Typography } from "@material-ui/core";
import { useSmallScreen } from "../utils/utils";
import { useMarket } from "../utils/market";
import FundingPaymentTable from "./FundingTable";

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  indicator: {
    backgroundColor: "#00ADB5",
  },
  container: {
    background: "#141721",
    height: "100%",
    width: "100%",
  },
  text: {
    fontSize: 14,
    fontWeight: 600,
    textTransform: "capitalize",
  },
  scrollButton: {
    color: "white",
  },
});

const Label = ({ children }: { children: React.ReactNode }) => {
  const classes = useStyles();
  return (
    <Typography variant="body1" className={classes.text}>
      {children}
    </Typography>
  );
};

const UserTable = () => {
  const classes = useStyles();
  const [tab, setTab] = React.useState(0);
  const [loaded, setLoaded] = useState(false);
  const { userAccount } = useMarket();
  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTab(newValue);
  };
  const smallScreen = useSmallScreen();

  useEffect(() => {
    if (!loaded && (!userAccount || userAccount.balance === 0)) {
      setTab(1);
      setLoaded(true);
    }
  }, [userAccount, loaded]);

  return (
    <>
      <TableContainer component={FloatingCard}>
        <Tabs
          value={tab}
          indicatorColor="primary"
          textColor="primary"
          onChange={handleTabChange}
          classes={{ indicator: classes.indicator }}
          variant="scrollable"
          scrollButtons={smallScreen ? "on" : "auto"}
          TabScrollButtonProps={{ className: classes.scrollButton }}
        >
          <Tab disableRipple label={<Label>Positions</Label>} />
          <Tab disableRipple label={<Label>Accounts</Label>} />
          <Tab disableRipple label={<Label>Trade History</Label>} />
          <Tab disableRipple label={<Label>Funding Payments</Label>} />
          <Tab disableRipple label={<Label>Fees</Label>} />
        </Tabs>
        <TabPanel value={tab} index={0}>
          <PositionTable />
        </TabPanel>
        <TabPanel value={tab} index={1}>
          <AccountsTable />
        </TabPanel>
        <TabPanel value={tab} index={2}>
          <TradeTable />
        </TabPanel>
        <TabPanel value={tab} index={3}>
          <FundingPaymentTable />
        </TabPanel>
        <TabPanel value={tab} index={4}>
          <FeeTable />
        </TabPanel>
      </TableContainer>
    </>
  );
};

export default UserTable;
