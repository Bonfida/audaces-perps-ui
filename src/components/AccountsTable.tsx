import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "./Modal";
import {
  Button,
  Grid,
  TableContainer,
  Checkbox,
  Typography,
  TextField,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@material-ui/core";
import WalletConnect from "./WalletConnect";
import { useUserData } from "../utils/perpetuals";
import Spin from "./Spin";
import { closeAccount, getQuoteAccount, UserAccount } from "@audaces/perps";
import {
  depositCollateral,
  fundingExtraction,
  withdrawCollateral,
} from "@audaces/perps";
import { useMarket, MARKETS } from "../utils/market";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  checkTextFieldNumberInput,
  roundToDecimal,
  sleep,
} from "../utils/utils";
import { useAvailableCollateral } from "../utils/perpetuals";
import { notify } from "../utils/notifications";
import { PublicKey } from "@solana/web3.js";
import CreateUserAccountButton from "./CreateUserAccountButton";
import { InformationRow } from "./SummaryPosition";
import LaunchIcon from "@material-ui/icons/Launch";
import { ExplorerLink } from "./Link";
import { useHistory } from "react-router-dom";
import refresh from "../assets/tables/refresh.svg";
import deleteIcon from "../assets/tables/delete.svg";
import { sendTx } from "../utils/send";

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  tableCell: {
    textTransform: "capitalize",
    fontSize: 14,
    color: "white",
  },
  buyButton: {
    background: "#4EDC76",
    fontSize: 14,
    fontWeight: 600,
    maxWidth: 200,
    width: "100%",
    color: "#141722",
    "&:hover": {
      background: "#4EDC76",
      color: "#141722",
    },
  },
  maxButton: {
    marginLeft: 10,
    fontSize: 14,
    color: "#4EDC76",
    fontWeight: 800,
  },
  sellButton: {
    background: "#EB5252",
    maxWidth: 200,
    width: "100%",
    color: "#141722",
    "&:hover": {
      background: "#EB5252",
      color: "#141722",
    },
  },
  radio: {
    color: "#C8CCD6",
    "&$checked": {
      color: "#77E3EF",
    },
  },
  checked: {},
  text: {
    color: "white",
    opacity: 0.8,
    fontSize: 14,
    margin: "1%",
    padding: "0.5%",
  },
  maxBalance: {
    color: "white",
    opacity: 0.8,
    fontSize: 12,

    marginTop: 3,
  },
  inputProps: {
    color: "white",
    fontSize: 14,
  },
  modalTitle: {
    color: "white",
    fontSize: 20,
    marginBottom: 10,
    fontWeight: 700,
  },
  fundingButton: {
    background: "#1e8bf0",
    maxWidth: 200,
    width: "100%",
    border: "1px solid",
    color: "white",
    borderColor: "transparent",
    "&:hover": {
      color: "#1e8bf0",
      borderColor: "#1e8bf0",
      cursor: "pointer",
    },
  },
  maxWithdrawButton: {
    color: "#EB5252",
  },
  withdrawButtonContainer: {
    marginTop: 50,
    marginBottom: 5,
  },
  tableContainer: {
    maxHeight: 250,
  },
  tableBody: {
    maxHeight: 200,
    overflow: "scroll",
  },
  deleteIcon: {
    fontSize: 28,
    marginTop: 2,
    cursor: "pointer",
  },
  section: {
    fontSize: 18,
    color: "white",
    fontWeight: 400,
  },
  marketName: {
    fontWeight: 600,
    fontSize: 14,
  },
  userAccountAddress: {
    fontSize: 12,
  },
  explorerIcon: {
    fontSize: 14,
    color: "white",
  },
  refreshIcon: {
    marginTop: 5,
    color: "white",
    fontSize: 18,
    cursor: "pointer",
  },
  refreshDiv: {
    cursor: "pointer",
  },
  tableCellHead: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: 800,
  },
  extract: {
    color: "#77E3EF",
    fontSize: 14,
    fontWeight: 800,
    textTransform: "capitalize",
  },
  withdraw: {
    color: "#EB5252",
    fontSize: 14,
    fontWeight: 800,
    textTransform: "capitalize",
  },
  deposit: {
    color: "#4EDC76",
    fontSize: 14,
    fontWeight: 800,
    textTransform: "capitalize",
  },
  delete: {
    cursor: "pointer",
  },
  fundingWarning: {
    marginTop: 20,
    textAlign: "center",
  },
});

const AccountTableHead = () => {
  const classes = useStyles();
  const { setRefreshUserAccount } = useMarket();
  return (
    <TableHead>
      <TableRow>
        <TableCell className={classes.tableCellHead} align="left">
          Selected Acc.
        </TableCell>
        <TableCell className={classes.tableCellHead} align="left">
          User Account
        </TableCell>
        <TableCell className={classes.tableCellHead} align="left">
          Collateral Available
        </TableCell>
        <TableCell className={classes.tableCellHead} align="left">
          Nb Open Position
        </TableCell>
        <TableCell className={classes.tableCellHead} align="left">
          Deposit
        </TableCell>
        <TableCell className={classes.tableCellHead} align="left">
          Withdraw
        </TableCell>
        <TableCell className={classes.tableCellHead} align="left">
          Funding
        </TableCell>

        <TableCell>
          {/* Refresh column */}
          <div
            className={classes.refreshDiv}
            onClick={() => setRefreshUserAccount((prev) => !prev)}
          >
            <img src={refresh} alt="" />
          </div>
        </TableCell>
      </TableRow>
    </TableHead>
  );
};

const FundingWarning = () => {
  const classes = useStyles();
  return (
    <div className={classes.fundingWarning}>
      ⚠️
      <Typography variant="body1" className={classes.text}>
        Funding is debited from the user account. If there is not enough
        balances to pay for funding the open position will be liquidated.
      </Typography>
    </div>
  );
};

export const ModalAdd = ({
  open,
  setOpen,
  acc,
}: {
  open: boolean;
  setOpen: (arg: boolean) => void;
  acc: PublicKey;
}) => {
  const classes = useStyles();
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction } = useWallet();
  const { setRefreshUserAccount, marketState } = useMarket();
  const [collateral] = useAvailableCollateral();
  const [amount, setAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<null | number>(null);

  useEffect(() => {
    const fn = async () => {
      if (!publicKey) return;
      const quoteAccount = await getQuoteAccount(publicKey);
      const info = await connection.getParsedAccountInfo(quoteAccount);
      if (!!info) {
        //@ts-ignore
        setBalance(info.value?.data.parsed.info.tokenAmount.uiAmount);
      }
    };
    fn();
    // eslint-disable-next-line
  }, [connected, connection]);

  const onChangeCollateral = (e) => {
    const { value, valid } = checkTextFieldNumberInput(e);
    if (!valid) {
      notify({ message: "Invalid amoount", variant: "error" });
      return;
    }
    setAmount(value);
  };

  const onClick = async () => {
    try {
      setLoading(true);
      const userAccount = await UserAccount.retrieve(connection, acc);
      if (
        !amount ||
        !collateral?.collateralAddress ||
        !marketState?.quoteDecimals ||
        !publicKey
      ) {
        return;
      }
      notify({
        message: "Depositing collateral...",
      });
      const [signers, instructions] = await depositCollateral(
        connection,
        userAccount.market,
        amount * marketState?.quoteDecimals,
        publicKey,
        acc
      );

      await sendTx(connection, publicKey, instructions, sendTransaction, {
        signers,
      });

      notify({
        message: "Deposit succesful",
        variant: "success",
      });
      setOpen(false);
    } catch (err) {
      console.warn(err);
      notify({
        message: `Error depositing collateral - ${err}`,
        variant: "error",
      });
    } finally {
      await sleep(3_000);
      setRefreshUserAccount((prev) => !prev);
      setLoading(false);
    }
  };
  return (
    <Modal openModal={open} setOpen={setOpen}>
      <div style={{ height: 350, width: 350 }}>
        <Typography align="center" className={classes.modalTitle}>
          Deposit
        </Typography>

        <Grid container direction="column" spacing={3}>
          <Grid item>
            <Typography align="left" className={classes.section}>
              Balance
            </Typography>
            <InformationRow
              value={balance?.toLocaleString()}
              label="Available to deposit"
            />
          </Grid>
          <Grid item>
            <Typography align="left" className={classes.section}>
              Amount
            </Typography>
            <Grid
              container
              justify="flex-start"
              alignItems="flex-end"
              spacing={2}
              direction="row"
            >
              <Grid item>
                <FormControl>
                  <TextField
                    value={amount}
                    onChange={onChangeCollateral}
                    inputProps={{
                      className: classes.inputProps,
                    }}
                    InputLabelProps={{ shrink: true }}
                    // label="Amount"
                  />
                </FormControl>
              </Grid>
              <Grid item>
                <Button
                  onClick={() => setAmount(balance)}
                  className={classes.maxButton}
                >
                  Max
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid container justify="center">
          <Button
            disabled={loading}
            onClick={onClick}
            className={classes.buyButton}
            style={{ marginTop: 30 }}
          >
            {loading ? <Spin size={20} /> : "Deposit"}
          </Button>
        </Grid>
        <FundingWarning />
      </div>
    </Modal>
  );
};

const ModalWithdraw = ({
  open,
  setOpen,
  acc,
}: {
  open: boolean;
  setOpen: (arg: boolean) => void;
  acc: UserAccount;
}) => {
  const classes = useStyles();
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { userAccount, setRefreshUserAccount, marketState } = useMarket();
  const [collateral] = useAvailableCollateral();
  const [amount, setAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const onChangeCollateral = (e) => {
    const { value, valid } = checkTextFieldNumberInput(e);
    if (!valid) {
      notify({ message: "Invalid amoount", variant: "error" });
      return;
    }
    setAmount(value);
  };

  const onClickMax = () => {
    if (!acc?.balance || !marketState?.quoteDecimals) {
      return;
    }
    setAmount(acc?.balance / marketState?.quoteDecimals);
  };

  const onClick = async () => {
    try {
      setLoading(true);
      if (
        !amount ||
        !collateral?.collateralAddress ||
        !userAccount?.address ||
        !marketState?.quoteDecimals ||
        !publicKey
      ) {
        return;
      }
      notify({
        message: "Withdrawing collateral...",
      });

      const [signers, instructions] = await withdrawCollateral(
        connection,
        acc.market,
        amount * marketState?.quoteDecimals,
        publicKey,
        acc?.address
      );

      await sendTx(connection, publicKey, instructions, sendTransaction, {
        signers,
      });

      notify({
        message: "Withdrawal succesful",
        variant: "success",
      });
      setOpen(false);
    } catch (err) {
      console.warn(err);
      notify({
        message: `Error withdrawing collateral - ${err}`,
        variant: "error",
      });
    } finally {
      await sleep(3_000);
      setRefreshUserAccount((prev) => !prev);
      setLoading(false);
    }
  };
  return (
    <Modal openModal={open} setOpen={setOpen}>
      <div style={{ height: 350, width: 350 }}>
        <Typography className={classes.modalTitle}>
          Withdraw Collateral from Vault
        </Typography>
        <Grid container justify="center" alignItems="center" spacing={4}>
          <Grid item>
            <FormControl>
              <TextField
                value={amount}
                onChange={onChangeCollateral}
                inputProps={{
                  className: classes.inputProps,
                }}
                InputLabelProps={{ shrink: true }}
                label="Amount"
              />
            </FormControl>
          </Grid>
          <Grid item>
            <Button className={classes.maxWithdrawButton} onClick={onClickMax}>
              Max
            </Button>
          </Grid>
        </Grid>
        <Grid
          container
          justify="center"
          className={classes.withdrawButtonContainer}
        >
          <Button
            disabled={loading}
            onClick={onClick}
            className={classes.sellButton}
          >
            {loading ? <Spin size={20} /> : "Withdraw"}
          </Button>
        </Grid>
        <FundingWarning />
      </div>
    </Modal>
  );
};

const AccountRow = ({
  acc,
  index,
}: {
  acc: UserAccount | undefined | null;
  index: number;
}) => {
  const classes = useStyles();
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const {
    userAccount,
    setUserAccount,
    marketAddress,
    marketState,
    setRefreshUserAccount,
    setMarket,
  } = useMarket();
  const [openAdd, setOpenAdd] = useState(false);
  const [openWithdraw, setOpenWithdraw] = useState(false);
  const instanceIndex = userAccount?.openPositions[0]?.instanceIndex;
  const history = useHistory();

  const market = MARKETS.find((m) => m.address === acc?.market.toBase58());

  const onClickExtractFunding = async () => {
    if (!publicKey) return;
    if (
      !userAccount ||
      marketState?.fundingHistoryOffset === userAccount?.lastFundingOffset
    ) {
      return notify({
        message: `Nothing to extract`,
      });
    }
    if (instanceIndex === null || instanceIndex === undefined) {
      return notify({
        message: "Nothing to extract",
      });
    }
    try {
      setLoading(true);
      const [signers, instructions] = await fundingExtraction(
        connection,
        marketAddress,
        instanceIndex,
        userAccount?.address
      );
      await sendTx(connection, publicKey, instructions, sendTransaction, {
        signers,
      });
    } catch (err) {
      // @ts-ignore
      if (err.message.includes("no-op")) {
        return notify({
          message: `Nothing to extract`,
          variant: "success",
        });
      }
      console.warn(err);
      notify({
        message: `Error extracting funding - ${err}`,
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!acc) {
    return null;
  }

  const onClickDelete = async () => {
    if (!publicKey) return;
    if (acc.balance > 0) {
      return notify({ message: "Cannot delete account with collateral" });
    }
    try {
      const [signers, instructions] = await closeAccount(
        acc.address,
        publicKey,
        publicKey
      );
      await sendTx(connection, publicKey, instructions, sendTransaction, {
        signers,
      });
    } catch (err) {
      console.warn(
        `Error closing user account ${acc.address.toBase58()} - err ${err}`
      );
      notify({
        message: `Error closing user account ${acc.address.toBase58()} - err ${err}`,
      });
    } finally {
      await sleep(5_000);
      setRefreshUserAccount((prev) => !prev);
    }
  };

  const handleChangeUserAccount = (acc: UserAccount) => {
    setUserAccount(acc);
    const _market = MARKETS.find((m) => acc.market.toBase58() === m.address);
    if (!_market) return;
    setMarket(_market);
    history.push(_market.name.split("-").join(""));
  };

  return (
    <TableRow style={{ background: index % 2 === 0 ? "#141722" : undefined }}>
      <TableCell align="left">
        <Checkbox
          classes={{
            root: classes.radio,
            checked: classes.checked,
          }}
          checked={
            userAccount?.address
              ? acc.address.equals(userAccount?.address)
              : false
          }
          onChange={() => handleChangeUserAccount(acc)}
        />
      </TableCell>
      <TableCell className={classes.tableCell} align="left">
        <Typography className={classes.marketName}>
          {market ? market.name : "Unknown"}
        </Typography>
        <Typography component={"div"} className={classes.userAccountAddress}>
          <Grid container spacing={1} alignItems="center">
            <Grid item>{acc.address.toBase58()}</Grid>
            <Grid item style={{ marginTop: 5 }}>
              <ExplorerLink address={acc.address.toBase58()}>
                <LaunchIcon className={classes.explorerIcon} />
              </ExplorerLink>
            </Grid>
          </Grid>
        </Typography>
      </TableCell>
      <TableCell className={classes.tableCell} align="right">
        <strong>$</strong>
        {(!!marketState?.quoteDecimals &&
          roundToDecimal(
            acc.balance / marketState?.quoteDecimals,
            4
          )?.toLocaleString()) ||
          0}
      </TableCell>
      <TableCell className={classes.tableCell} align="right">
        {acc.openPositions?.length}
      </TableCell>
      <TableCell className={classes.tableCell}>
        <Button onClick={() => setOpenAdd(true)} className={classes.deposit}>
          Deposit
        </Button>
        <ModalAdd setOpen={setOpenAdd} open={openAdd} acc={acc.address} />
      </TableCell>
      <TableCell className={classes.tableCell}>
        <Button
          onClick={() => setOpenWithdraw(true)}
          className={classes.withdraw}
        >
          Withdraw
        </Button>
        <ModalWithdraw
          setOpen={setOpenWithdraw}
          open={openWithdraw}
          acc={acc}
        />
      </TableCell>
      <TableCell className={classes.tableCell}>
        <Button onClick={onClickExtractFunding} className={classes.extract}>
          {loading ? <Spin size={20} /> : "Extract"}
        </Button>
      </TableCell>
      <TableCell className={classes.tableCell}>
        <div onClick={onClickDelete} className={classes.delete}>
          <img src={deleteIcon} alt="" />
        </div>
      </TableCell>
    </TableRow>
  );
};

const AccountsTable = () => {
  const classes = useStyles();
  const [userData, userDataLoaded] = useUserData();
  const { connected } = useWallet();

  const filteredUserData = userData?.sort((a, b) => {
    if (a && b) {
      return b?.balance - a?.balance;
    }
    return 0;
  });

  return (
    <>
      <TableContainer className={classes.tableContainer}>
        <Table>
          <AccountTableHead />
          <TableBody className={classes.tableBody}>
            {filteredUserData?.map((row, i) => {
              return (
                <AccountRow
                  acc={row}
                  key={`${i}-account-table-row`}
                  index={i}
                />
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {!connected && (
        <Grid container justify="center" style={{ marginTop: 30 }}>
          <WalletConnect />
        </Grid>
      )}
      {!userDataLoaded && (
        <Grid container justify="center" style={{ marginTop: 30 }}>
          <Spin size={20} />
        </Grid>
      )}
      {(!filteredUserData || filteredUserData?.length === 0) &&
        connected &&
        userDataLoaded && (
          <div style={{ marginTop: 30 }}>
            <Typography className={classes.text} align="center" variant="body1">
              You don't have a trading account
            </Typography>
            <CreateUserAccountButton />
          </div>
        )}
    </>
  );
};

export default AccountsTable;
