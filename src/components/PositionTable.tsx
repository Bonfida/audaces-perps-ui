import React, { useState, useMemo } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Position, completeClosePosition } from "@audaces/perps";
import Grid from "@material-ui/core/Grid";
import { roundToDecimal, USDC_DECIMALS } from "../utils/utils";
import { useOpenPositions, useOraclePrice } from "../utils/perpetuals";
import WalletConnect from "./WalletConnect";
import Spin from "./Spin";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
} from "@material-ui/core";
import EditPositionModal from "./EditPositionModal";
import { notify } from "../utils/notifications";
import { refreshAllCaches } from "../utils/fetch-loop";
import { sendTransaction } from "../utils/send";
import { useWallet } from "../utils/wallet";
import { useConnection } from "../utils/connection";
import { Transaction } from "@solana/web3.js";
import CreateIcon from "@material-ui/icons/Create";
import { useSmallScreen } from "../utils/utils";
import LeverageChip, { LiquidatedChip } from "./Chips";
import MouseOverPopOver from "./MouseOverPopOver";
import { useReferrer, marketNameFromAddress } from "../utils/perpetuals";
import { useMarket } from "../utils/market";

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  tableCell: {
    textTransform: "capitalize",
    fontSize: 14,
    color: "white",
  },
  sellCell: {
    textTransform: "capitalize",
    fontSize: 14,
    color: "#FF3B69",
  },
  buyCell: {
    textTransform: "capitalize",
    fontSize: 14,
    color: "#02C77A",
  },
  indicator: {
    backgroundColor: "#5C1864",
  },
  button: {
    color: "white",
    background: "transparent",
    width: "auto",
    borderRadius: 2,
    border: "2px solid",
    borderColor: "#00ADB5",
    fontSize: 14,
  },
  loading: {
    color: "white",
    fontSize: 18,
  },
  closeButton: {
    background: "#FF3B69",
    minWidth: 80,
    border: "1px solid",
    color: "white",
    borderColor: "transparent",
    borderRadius: 2,
    "&:hover": {
      color: "#FF3B69",
      borderColor: "#FF3B69",
      cursor: "pointer",
    },
    fontSize: 14,
  },
  createIcon: {
    color: "white",
    marginBottom: 2,
    fontSize: 20,
    marginLeft: 8,
  },
  iconButton: {
    padding: 0,
    margin: 0,
  },
  popOverText: {
    color: "white",
    fontSize: 12,
  },
  marketName: {
    fontWeight: 600,
    fontSize: 14,
  },
});

const PenButton = ({ onClick }: { onClick: () => void }) => {
  const classes = useStyles();
  const smallScreen = useSmallScreen("lg");
  if (smallScreen) {
    return null;
  }
  return (
    <IconButton disableRipple onClick={onClick} className={classes.iconButton}>
      <CreateIcon className={classes.createIcon} />
    </IconButton>
  );
};

const PositionTableHead = () => {
  const classes = useStyles();
  return (
    <TableHead>
      <TableRow>
        <TableCell className={classes.tableCell}>Market</TableCell>
        <TableCell className={classes.tableCell}>Entry Price</TableCell>
        <TableCell className={classes.tableCell}>Side</TableCell>
        <TableCell className={classes.tableCell}>Size</TableCell>
        <TableCell className={classes.tableCell}>PnL</TableCell>

        <TableCell className={classes.tableCell}>
          <MouseOverPopOver
            popOverText={<>Liquidation is based on the index price</>}
            textClassName={classes.popOverText}
          >
            <span className={classes.tableCell}>Liq. Price</span>
          </MouseOverPopOver>
        </TableCell>

        <TableCell className={classes.tableCell}>Collateral</TableCell>
        <TableCell />
        <TableCell />
      </TableRow>
    </TableHead>
  );
};

const PositionRow = (props: Position) => {
  const classes = useStyles();
  const [openEditPosition, setOpenEditPosition] = useState(false);
  const [selectedButton, setSelectedButton] = useState("size");
  const [loading, setLoading] = useState(false);
  const { wallet, connected } = useWallet();
  const connection = useConnection();
  const smallScreen = useSmallScreen("md");
  const referrer = useReferrer();
  const { marketAddress } = useMarket();

  const positivePnl = props.pnl > 0;
  const buySide = props.side === "long";

  const [oraclePrice, oraclePriceLoaded] = useOraclePrice();

  const isLiquidated = useMemo(() => {
    if (!oraclePrice?.price) {
      return false;
    }
    return props.side === "long"
      ? oraclePrice.price < props.liqPrice
      : oraclePrice.price > props.liqPrice;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oraclePrice, oraclePriceLoaded]);

  const onClickClosePosition = async () => {
    setLoading(true);
    if (!wallet.publicKey || !connected) {
      return notify({
        message: "Wallet not connected",
      });
    }
    notify({
      message: "Closing position...",
    });
    try {
      const tx = new Transaction();
      const [signers, instruction] = await completeClosePosition(
        connection,
        props,
        wallet.publicKey,
        referrer
      );
      tx.add(...instruction);
      await sendTransaction({
        transaction: tx,
        wallet: wallet,
        connection: connection,
        signers: signers,
      });

      notify({
        message: "Position closed",
        variant: "success",
      });
    } catch (err) {
      console.warn(err);
      notify({
        message: `Error closing position - ${err}`,
        variant: "error",
      });
    } finally {
      setLoading(false);
      refreshAllCaches();
    }
  };

  const onClickClear = async () => {
    setLoading(true);
    if (!wallet.publicKey || !connected) {
      return notify({
        message: "Wallet not connected",
      });
    }
    notify({
      message: "Cleaning liquidated position...",
    });
    try {
      const tx = new Transaction();
      const [signers, instruction] = await completeClosePosition(
        connection,
        props,
        wallet.publicKey,
        referrer
      );
      tx.add(...instruction);
      await sendTransaction({
        transaction: tx,
        wallet: wallet,
        connection: connection,
        signers: signers,
      });

      notify({
        message: "Position cleaned",
        variant: "success",
      });
    } catch (err) {
      console.warn(err);
      notify({
        message: `Error cleaning position - ${err}`,
        variant: "error",
      });
    } finally {
      setLoading(false);
      refreshAllCaches();
    }
  };

  if (isLiquidated) {
    return (
      <TableRow>
        <TableCell className={classes.tableCell}>
          {marketNameFromAddress(marketAddress.toBase58())}
          <LiquidatedChip />
        </TableCell>
        <TableCell />
        <TableCell />
        <TableCell />
        <TableCell />
        <TableCell />
        <TableCell />
        <TableCell />
        <TableCell>
          <Button
            disabled={loading}
            className={classes.closeButton}
            onClick={onClickClear}
          >
            {loading ? <Spin size={20} /> : "Clear"}
          </Button>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell className={classes.tableCell}>
        <Grid container alignItems="center">
          <Grid item>
            <Typography className={classes.marketName}>
              {marketNameFromAddress(marketAddress.toBase58())}
            </Typography>
          </Grid>
          {!smallScreen && (
            <Grid item>
              <LeverageChip
                leverage={props.leverage.toLocaleString()}
                side={props.side}
              />
            </Grid>
          )}
        </Grid>
      </TableCell>
      <TableCell className={classes.tableCell}>
        {props.entryPrice.toLocaleString()}
      </TableCell>
      <TableCell className={buySide ? classes.buyCell : classes.sellCell}>
        {props.side}
      </TableCell>
      <TableCell className={buySide ? classes.buyCell : classes.sellCell}>
        <Grid container alignItems="center">
          <Grid item>{props.size / USDC_DECIMALS}</Grid>
          <Grid item>
            <PenButton
              onClick={() => {
                setOpenEditPosition(true);
                setSelectedButton("size");
              }}
            />
          </Grid>
        </Grid>
      </TableCell>
      <TableCell className={positivePnl ? classes.buyCell : classes.sellCell}>
        {roundToDecimal(props.pnl / USDC_DECIMALS, 4)?.toLocaleString()}
      </TableCell>
      <TableCell className={classes.tableCell}>
        {props.liqPrice.toLocaleString()}
      </TableCell>
      <TableCell className={classes.tableCell}>
        <Grid container alignItems="center">
          <Grid item>
            {(props.collateral / USDC_DECIMALS).toLocaleString()}
          </Grid>
          <Grid item>
            <PenButton
              onClick={() => {
                setOpenEditPosition(true);
                setSelectedButton("collateral");
              }}
            />
          </Grid>
        </Grid>
      </TableCell>
      <TableCell>
        <Grid container spacing={5} alignItems="center" justify="center">
          <Grid item>
            <Button
              onClick={() => setOpenEditPosition(true)}
              className={classes.button}
            >
              Edit
            </Button>
            <EditPositionModal
              position={props}
              setOpen={setOpenEditPosition}
              openModal={openEditPosition}
              selectedButton={selectedButton}
              setSelectedButton={setSelectedButton}
            />
          </Grid>
        </Grid>
      </TableCell>
      <TableCell>
        <Button
          disabled={loading}
          className={classes.closeButton}
          onClick={onClickClosePosition}
        >
          {loading ? <Spin size={20} /> : "Close"}
        </Button>
      </TableCell>
    </TableRow>
  );
};

const PositionTable = () => {
  const classes = useStyles();
  // Design ideads
  // const positions = usePositions()

  // Hard coded value
  const [positions, positionsLoaded] = useOpenPositions();
  const { connected } = useWallet();

  if (!connected) {
    return (
      <Grid container justify="center">
        <WalletConnect />
      </Grid>
    );
  }

  if (!positionsLoaded) {
    return (
      <Grid container justify="center" direction="column" alignItems="center">
        <Grid item>
          <Spin size={50} />
        </Grid>
        <Grid item>
          <Typography
            className={classes.loading}
            variant="body1"
            align="center"
          >
            Loading your positions... This might take sometime
          </Typography>
        </Grid>
      </Grid>
    );
  }

  return (
    <TableContainer style={{ maxHeight: 250 }}>
      <Table>
        <PositionTableHead />
        <TableBody
          style={{
            maxHeight: 200,
            overflowX: "scroll",
          }}
        >
          {positions?.map((row, i) => {
            return <PositionRow {...row} key={`position-${i}`} />;
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PositionTable;
