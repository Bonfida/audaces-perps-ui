import React from "react";
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
import OpenOrdersTable from "./OpenOrdersTable";
import FundingPaymentTable from "./FundingTable";
import { useOpenPositions } from "../hooks/useOpenPositions";
import { useEcosystem } from "../hooks/useEcosystem";
import { useOpenOrders } from "../hooks/useOpenOrders";
import { useWallet } from "@solana/wallet-adapter-react";

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  indicator: {
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
  const { connected } = useWallet();
  const [tab, setTab] = React.useState(0);
  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTab(newValue);
  };
  const smallScreen = useSmallScreen();
  const [positions, positionsLoaded] = useOpenPositions();
  const [ecosystem, ecosystemLoaded] = useEcosystem();
  const [openOrders, openOrdersLoaded] = useOpenOrders();

  const totalPositions =
    positions?.filter((p) => p.baseAmount.toNumber() > 0).length || 0;
  const totalOpenOrders = openOrders?.length || 0;

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
          label={
            <Label selected={tab === 0}>
              Positions {connected ? `(${totalPositions})` : null}
            </Label>
          }
        />
        <Tab
          disableRipple
          label={
            <Label selected={tab === 1}>
              Open orders {connected ? `(${totalOpenOrders})` : null}
            </Label>
          }
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
        <PositionTable
          positions={positions}
          ecosystem={ecosystem}
          positionsLoaded={positionsLoaded}
          ecosystemLoaded={ecosystemLoaded}
        />
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <OpenOrdersTable
          openOrders={openOrders}
          openOrdersLoaded={openOrdersLoaded}
        />
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
