import React, { useState, useMemo } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Position, completeClosePosition } from "@audaces/perps";
import Grid from "@material-ui/core/Grid";
import { roundToDecimal } from "../utils/utils";
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
import { useReferrer } from "../utils/perpetuals";
import { MARKETS, useMarketState, useMarket } from "../utils/market";
import { useHistory } from "react-router";
import { Market } from "../utils/types";

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  tableCell: {
    textTransform: "capitalize",
    fontSize: 14,
    color: "white",
    fontWeight: 800,
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
    color: "#77E3EF",
    background: "transparent",
    width: "auto",
    fontSize: 14,
    fontWeight: 800,
  },
  loading: {
    color: "white",
    fontSize: 18,
  },
  closeButton: {
    minWidth: 80,
    color: "#EB5252",
    fontWeight: 800,
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

const PositionRow = ({ props, index }: { props: Position; index: number }) => {
  const classes = useStyles();
  const history = useHistory();
  const [openEditPosition, setOpenEditPosition] = useState(false);
  const [selectedButton, setSelectedButton] = useState("size");
  const [loading, setLoading] = useState(false);
  const { wallet, connected } = useWallet();
  const connection = useConnection();
  const smallScreen = useSmallScreen("md");
  const referrer = useReferrer();
  const market = MARKETS.find(
    (m) => m.address === props.marketAddress.toBase58()
  );

  const buySide = props.side === "long";
  const [oraclePrice, oraclePriceLoaded] = useOraclePrice(props.marketAddress);
  const [marketState] = useMarketState(props.marketAddress);
  const positivePnl = props.pnl > 0;
  const { setMarket } = useMarket();

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

  const onClickMarketName = (market: Market | undefined) => () => {
    if (market) {
      setMarket(market);
      history.push(`/trade/${market.name}`);
    }
  };

  if (isLiquidated) {
    return (
      <TableRow style={{ background: index % 2 === 0 ? "#141722" : undefined }}>
        <TableCell className={classes.tableCell}>
          {market ? market.name : "Unknown"}
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
    <TableRow style={{ background: index % 2 === 0 ? "#141722" : undefined }}>
      <TableCell className={classes.tableCell}>
        <Grid container alignItems="center">
          <Grid item>
            <Typography className={classes.marketName}>
              <div
                style={{ cursor: market ? "pointer" : undefined }}
                onClick={onClickMarketName(market)}
              >
                {market ? market.name : "Unknown"}
              </div>
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
          <Grid item>
            {!!marketState?.coinDecimals
              ? props.size / marketState?.coinDecimals
              : null}
          </Grid>
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
        {!!marketState?.quoteDecimals && (
          <>
            {roundToDecimal(
              props.pnl / marketState?.quoteDecimals,
              4
            )?.toLocaleString()}
          </>
        )}
      </TableCell>
      <TableCell className={classes.tableCell}>
        {props.liqPrice.toLocaleString()}
      </TableCell>
      <TableCell className={classes.tableCell}>
        <Grid container alignItems="center">
          <Grid item>
            {!!marketState?.quoteDecimals && (
              <>
                {(
                  props.collateral / marketState?.quoteDecimals
                ).toLocaleString()}
              </>
            )}
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
  const [positions, positionsLoaded] = useOpenPositions();
  positions?.sort((a, b) =>
    a.marketAddress.toBase58().localeCompare(b.marketAddress.toBase58())
  );
  const { connected } = useWallet();
  const { marketAddress } = useMarket();
  const { useIsolatedPositions } = useMarket();
  const currentPosition = positions?.find((p) =>
    p.marketAddress.equals(marketAddress)
  );
  const otherPositions = positions
    ? [...positions]?.filter((p) => !p.marketAddress.equals(marketAddress))
    : [];

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

  if (!positions) {
    return null;
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
          {useIsolatedPositions &&
            positions?.map((row, i) => {
              return (
                <PositionRow
                  index={i + 1}
                  props={row}
                  key={`position-${i}-${row.positionIndex}`}
                />
              );
            })}
          {!useIsolatedPositions && currentPosition && (
            <PositionRow index={0} props={currentPosition} />
          )}
          {!useIsolatedPositions &&
            otherPositions?.map((row, i) => {
              return (
                <PositionRow
                  index={i + 1}
                  props={row}
                  key={`position-${i}-${row.positionIndex}`}
                />
              );
            })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PositionTable;
