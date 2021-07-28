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
import { useWallet } from "../utils/wallet";
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
import { useConnection } from "../utils/connection";
import {
  checkTextFieldNumberInput,
  roundToDecimal,
  sleep,
} from "../utils/utils";
import { useAvailableCollateral } from "../utils/perpetuals";
import { notify } from "../utils/notifications";
import { PublicKey, Transaction } from "@solana/web3.js";
import { sendTransaction } from "../utils/send";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import CreateUserAccountButton from "./CreateUserAccountButton";
import { InformationRow } from "./SummaryPosition";
import LaunchIcon from "@material-ui/icons/Launch";
import { ExplorerLink } from "./Link";
import RefreshIcon from "@material-ui/icons/Refresh";
import { useHistory } from "react-router-dom";

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
    background: "#02C77A",
    fontSize: 14,
    maxWidth: 200,
    width: "100%",
    border: "1px solid",
    color: "white",
    borderColor: "transparent",
    "&:hover": {
      color: "#02C77A",
      borderColor: "#02C77A",
      cursor: "pointer",
    },
  },
  maxButton: {
    marginLeft: 10,
    background: "#02C77A",
    fontSize: 14,
    maxWidth: 30,
    width: "100%",
    border: "1px solid",
    color: "white",
    borderColor: "transparent",
    "&:hover": {
      color: "#02C77A",
      borderColor: "#02C77A",
      cursor: "pointer",
    },
  },
  sellButton: {
    background: "#FF3B69",
    maxWidth: 200,
    width: "100%",
    border: "1px solid",
    color: "white",
    borderColor: "transparent",
    "&:hover": {
      color: "#FF3B69",
      borderColor: "#FF3B69",
      cursor: "pointer",
    },
  },
  radio: {
    color: "#00ADB5",
    "&$checked": {
      color: "#00ADB5",
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
    opacity: 0.8,
    fontSize: 20,
    marginBottom: 10,
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
    width: 100,
    background: "transaparent",
    border: "1px solid",
    color: "#FF3B69",
    borderColor: "#FF3B69",
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
    opacity: 0.8,
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
});

const AccountTableHead = () => {
  const classes = useStyles();
  const { setRefreshUserAccount } = useMarket();
  return (
    <TableHead>
      <TableRow>
        <TableCell className={classes.tableCell}>User Account</TableCell>
        <TableCell className={classes.tableCell}>
          Collateral Available
        </TableCell>
        <TableCell className={classes.tableCell}>Nb Open Position</TableCell>
        <TableCell className={classes.tableCell}>Deposit</TableCell>
        <TableCell className={classes.tableCell}>Withdraw</TableCell>
        <TableCell className={classes.tableCell}>Funding</TableCell>
        <TableCell className={classes.tableCell}>Selected Acc.</TableCell>
        <TableCell>
          {/* Refresh column */}
          <RefreshIcon
            onClick={() => setRefreshUserAccount((prev) => !prev)}
            className={classes.refreshIcon}
          />
        </TableCell>
      </TableRow>
    </TableHead>
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
  const connection = useConnection();
  const { wallet, connected } = useWallet();
  const { marketAddress, setRefreshUserAccount, marketState } = useMarket();
  const [collateral] = useAvailableCollateral();
  const [amount, setAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<null | number>(null);

  useEffect(() => {
    const fn = async () => {
      const quoteAccount = await getQuoteAccount(wallet.publicKey);
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
      if (
        !amount ||
        !collateral?.collateralAddress ||
        !marketState?.quoteDecimals
      ) {
        return;
      }
      notify({
        message: "Depositing collateral...",
      });
      const [signers, instructions] = await depositCollateral(
        connection,
        marketAddress,
        amount * marketState?.quoteDecimals,
        wallet.publicKey,
        acc
      );

      await sendTransaction({
        transaction: new Transaction().add(...instructions),
        wallet: wallet,
        signers: signers,
        connection: connection,
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
      <div style={{ height: 250, width: 250 }}>
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
  const connection = useConnection();
  const { wallet } = useWallet();
  const { marketAddress, userAccount, setRefreshUserAccount, marketState } =
    useMarket();
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
        !marketState?.quoteDecimals
      ) {
        return;
      }
      notify({
        message: "Withdrawing collateral...",
      });

      const [signers, instructions] = await withdrawCollateral(
        connection,
        marketAddress,
        amount * marketState?.quoteDecimals,
        wallet.publicKey,
        acc?.address
      );

      await sendTransaction({
        transaction: new Transaction().add(...instructions),
        wallet: wallet,
        signers: signers,
        connection: connection,
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
      <Typography className={classes.modalTitle}>
        Withdraw Collateral from Vault
      </Typography>
      <Grid container justify="center" alignItems="flex-end" spacing={4}>
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
    </Modal>
  );
};

const AccountRow = ({ acc }: { acc: UserAccount | undefined | null }) => {
  const classes = useStyles();
  const connection = useConnection();
  const { wallet } = useWallet();
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
      await sendTransaction({
        transaction: new Transaction().add(...instructions),
        connection: connection,
        wallet: wallet,
        signers: signers,
      });
    } catch (err) {
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
    if (acc.balance > 0) {
      return notify({ message: "Cannot delete account with collateral" });
    }
    try {
      const [signers, instructions] = await closeAccount(
        acc.address,
        wallet.publicKey,
        wallet.publicKey
      );
      await sendTransaction({
        transaction: new Transaction().add(...instructions),
        wallet: wallet,
        connection: connection,
        signers: signers,
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
    <TableRow>
      <TableCell className={classes.tableCell}>
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
      <TableCell className={classes.tableCell}>
        {!!marketState?.quoteDecimals &&
          roundToDecimal(
            acc.balance / marketState?.quoteDecimals,
            4
          )?.toLocaleString()}{" "}
        <strong>USDC</strong>
      </TableCell>
      <TableCell className={classes.tableCell}>
        {acc.openPositions?.length}
      </TableCell>
      <TableCell className={classes.tableCell}>
        <Button onClick={() => setOpenAdd(true)} className={classes.buyButton}>
          Deposit
        </Button>
        <ModalAdd setOpen={setOpenAdd} open={openAdd} acc={acc.address} />
      </TableCell>
      <TableCell className={classes.tableCell}>
        <Button
          onClick={() => setOpenWithdraw(true)}
          className={classes.sellButton}
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
        <Button
          onClick={onClickExtractFunding}
          className={classes.fundingButton}
        >
          {loading ? <Spin size={20} /> : "Extract"}
        </Button>
      </TableCell>
      <TableCell>
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
      <TableCell className={classes.tableCell}>
        <DeleteForeverIcon
          className={classes.deleteIcon}
          onClick={onClickDelete}
        />
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
              return <AccountRow acc={row} key={`${i}-account-table-row`} />;
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
