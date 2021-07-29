import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
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
    backgroundColor: "#77E3EF",
  },
  container: {
    background: "#141721",
    height: "100%",
    width: "100%",
  },
  text: {
    fontSize: 18,
    fontWeight: 800,
    textTransform: "capitalize",
    color: "#C8CCD6",
  },
  scrollButton: {
    color: "white",
  },
});

const Label = ({
  selected,
  children,
}: {
  selected?: boolean;
  children: React.ReactNode;
}) => {
  const classes = useStyles();
  return (
    <Typography
      variant="body1"
      className={classes.text}
      style={{ color: selected ? "#77E3EF" : undefined }}
    >
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
    <FloatingCard>
      <Tabs
        value={tab}
        indicatorColor="primary"
        textColor="primary"
        onChange={handleTabChange}
        classes={{ indicator: classes.indicator }}
        variant="scrollable"
        scrollButtons={smallScreen ? "on" : "auto"}
        TabScrollButtonProps={{ className: classes.scrollButton }}
        style={{ borderBottom: "1px solid rgba(57, 60, 69, 0.5)" }}
      >
        <Tab
          disableRipple
          label={<Label selected={tab === 0}>Positions</Label>}
        />
        <Tab
          disableRipple
          label={<Label selected={tab === 1}>Accounts</Label>}
        />
        <Tab
          disableRipple
          label={<Label selected={tab === 2}>Trade History</Label>}
        />
        <Tab
          disableRipple
          label={<Label selected={tab === 3}>Funding Payments</Label>}
        />
        <Tab disableRipple label={<Label selected={tab === 4}>Fees</Label>} />
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
    </FloatingCard>
  );
};

export default UserTable;
