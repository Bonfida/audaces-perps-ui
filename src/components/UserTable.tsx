import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import FeeTable from "./FeesTable";
import FloatingCard from "./FloatingCard";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import TabPanel from "./TabPanel";
import TradeTable from "./TradeTable";
import PositionTable from "./PositionTable";
import { Typography } from "@material-ui/core";
import { useSmallScreen } from "../utils/utils";
import { useMarket } from "../utils/market";
import OpenOrdersTable from "./OpenOrdersTable";
import FundingPaymentTable from "./FundingTable";

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  indicator: {
    // backgroundColor: "#FFFFFF",
    backgroundColor: "transparent",
  },
  container: {
    background: "#141721",
    height: "100%",
    width: "100%",
  },
  text: {
    fontSize: 14,
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
      style={{ color: selected ? "#FFFFFF" : "rgb(124, 127, 131)" }}
    >
      {children}
    </Typography>
  );
};

const UserTable = () => {
  const classes = useStyles();
  const [tab, setTab] = React.useState(0);
  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTab(newValue);
  };
  const smallScreen = useSmallScreen();

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
          label={<Label selected={tab === 1}>Open orders</Label>}
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
        <OpenOrdersTable />
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
