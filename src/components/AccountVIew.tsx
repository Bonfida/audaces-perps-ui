import React, { useState } from "react";
import { useUserAccount } from "../hooks/useUserAccount";
import { makeStyles, Button } from "@material-ui/core";
import FloatingCard from "./FloatingCard";
import { useWallet } from "@solana/wallet-adapter-react";
import Modal from "./Modal";
import DepositDialog from "./DepositDialog";
import WithdrawDialog from "./WithdrawDialog";
import { roundToDecimal } from "../utils/utils";
import { useFreeCollateral } from "../hooks/useFreeCollateral";
import { useEcosystem } from "../hooks/useEcosystem";
import { useMargin } from "../hooks/useMargin";

const useStyles = makeStyles({
  root: {
    height: "100%",
    width: "100%",
  },
  container: {
    height: "100%",
    display: "flex",
    justifyContent: "space-around",
    flexDirection: "column",
  },
  row: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    margin: "5px 2px 5px 2px",
  },
  label: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    opacity: 0.7,
    fontWeight: 600,
  },
  value: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 1)",
    fontWeight: 600,
  },
  createContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 600,
  },
  buttonContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 20,
  },
  button: {
    fontSize: 16,
    color: "white",
    fontWeight: 600,
    textTransform: "capitalize",
    width: "40%",
    backgroundColor: "#37324d",
    "&:hover": {
      backgroundColor: "rgb(55, 51, 78)",
    },
    "&.Mui-disabled": {
      color: "white",
      pointerEvents: "unset",
      cursor: "not-allowed",
      backgroundColor: "rgb(55, 51, 78)",
      "&:hover": {
        backgroundColor: "rgb(55, 51, 78)",
      },
    },
  },
});

const Row = ({
  label,
  value,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
}) => {
  const classes = useStyles();
  return (
    <div className={classes.row}>
      <span className={classes.label}>{label}</span>
      <span className={classes.value}>{value}</span>
    </div>
  );
};

const AccountView = () => {
  const classes = useStyles();
  const { connected } = useWallet();
  const [userAccount, userAccountLoaded] = useUserAccount();
  const [deposit, setDeposit] = useState(false);
  const [withdraw, setWithdraw] = useState(false);
  const [ecosystem] = useEcosystem();
  const [freeCollateral] = useFreeCollateral(userAccount, ecosystem);
  const [margin] = useMargin(userAccount, ecosystem);

  const accountValue =
    userAccount && userAccount?.header.credit.toNumber() / Math.pow(10, 6);

  return (
    <div className={classes.root}>
      <FloatingCard>
        <div className={classes.container}>
          <span className={classes.title}>Account</span>
          <div>
            <Row
              label="Account value"
              value={
                accountValue ? `US$ ${roundToDecimal(accountValue, 3)}` : 0
              }
            />

            <Row
              label="Free collateral"
              value={
                freeCollateral ? `US$ ${roundToDecimal(freeCollateral, 3)}` : 0
              }
            />

            <Row
              label="Leverage"
              value={margin ? roundToDecimal(1 / margin.margin, 2) : 0}
            />

            <Row
              label="Margin"
              value={
                margin && isFinite(margin.margin)
                  ? roundToDecimal(margin.margin, 2)
                  : 0
              }
            />

            <Row label="Maintenance margin fraction" value="5%" />
          </div>
          <div className={classes.buttonContainer}>
            <Button
              disabled={!connected}
              onClick={() => setDeposit(true)}
              className={classes.button}
            >
              Deposit
            </Button>
            <Modal openModal={deposit} setOpen={setDeposit}>
              <DepositDialog userAccount={userAccount} />
            </Modal>
            <Button
              disabled={!connected}
              onClick={() => setWithdraw(true)}
              className={classes.button}
            >
              Withdraw
            </Button>
            <Modal openModal={withdraw} setOpen={setWithdraw}>
              <WithdrawDialog />
            </Modal>
          </div>
        </div>
      </FloatingCard>
    </div>
  );
};

export default AccountView;
