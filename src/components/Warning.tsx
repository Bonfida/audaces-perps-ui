import React, { useState } from "react";
import Modal from "./Modal";
import { useLocalStorageState, apiGet, useSmallScreen } from "../utils/utils";
import Emoji from "./Emoji";
import { Typography, Button, Checkbox, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useAsyncData } from "../utils/fetch-loop";
import Link from "./Link";

const useStyles = makeStyles({
  h2: {
    fontSize: "max(3vw, 40px)",
    color: "white",
    fontWeight: 600,
  },
  text: {
    fontSize: 16,
    color: "white",
    marginTop: 10,
    marginBottom: 10,
  },
  root: {
    maxWidth: "70vw",
    overflow: "auto",
  },
  button: {
    color: "white",
    fontWeight: 600,
    background: "linear-gradient(213.67deg, #DC1FFF -3.51%, #00ADB5 99.6%)",
    borderRadius: 5,
    height: "50px",
    fontSize: 30,
    padding: 30,
  },
  checkbox: {
    color: "red",
  },
  link: {
    color: "white",
  },
  important: {
    textDecoration: "underline",
    fontWeight: 600,
  },
});

export const DISALLOWED_COUNTRIES = [
  "AF", // Afghanistan
  "CI", // Ivory Coast
  "CU", // Cuba
  "IQ", // Iraq
  "IR", // Iran
  "LR", // Liberia
  "KP", // North Korea
  "SY", // Syria
  "SD", // Sudan
  "SS", // South Sudan
  "ZW", // Zimbabwe
  "AG", // Antigua
  "US", // United States
  "AS", // American Samoa
  "GU", // Guam
  "MP", // Northern Mariana Islands
  "PR", // Puerto Rico
  "UM", // United States Minor Outlying Islands
  "VI", // US Virgin Islands
  "UA", // Ukraine
  "BY", // Belarus,
  "AL", // Albania
  "BU", // Burma
  "CF", // Central African Republic
  "CD", // Democratic Republic of Congo
  "LY", // Lybia
  "SO", // Somalia
  "YD", // Yemen
  "GB", // United Kingdom
  "TH", // Thailand
];

const useCountryCode = () => {
  const fn = async () => {
    const URL = "https://countrycode.bonfida.workers.dev/";
    const result = await apiGet(URL);
    console.log("Country Code", result?.countryCode);
    return result?.countryCode;
  };
  return useAsyncData(fn, "useCountryCode", { refreshInterval: 60 * 1_000 });
};

const REDIRECT_LINK = "https://google.com";

export const Forbidden = () => {
  const [countryCode] = useCountryCode();
  const classes = useStyles();
  if (!DISALLOWED_COUNTRIES.includes(countryCode)) {
    return null;
  }
  return (
    <Modal openModal={true} disableBackdropClick setOpen={() => undefined}>
      <div className={classes.root}>
        <Typography align="center" variant="h2" className={classes.h2}>
          Access Denied <Emoji emoji="⚠️" />
        </Typography>
        <Typography align="center" variant="body1" className={classes.text}>
          This website is not available to residents of{" "}
          <strong>
            Belarus, the Central African Republic, the Democratic Republic of
            Congo, the Democratic People’s Republic of Korea, the Crimea region
            of Ukraine, Cuba, Iran, Libya, Somalia, Sudan, South Sudan, Syria,
            Thailand, the UK, the USA, Yemen, Zimbabwe and any other
            jurisdiction
          </strong>{" "}
          in which accessing or using this website is prohibited
        </Typography>
      </div>
      <Grid container justify="center">
        <Button
          style={{ margin: 10 }}
          className={classes.button}
          href={REDIRECT_LINK}
        >
          Leave
        </Button>
      </Grid>
    </Modal>
  );
};

const URL_RULES = "https://rules.bonfida.org";
const URL_RISKS = "https://risks.bonfida.org";

const Warning = () => {
  const classes = useStyles();
  const [checked, setChecked] = useState(false);
  const [visible, setVisible] = useLocalStorageState("warning-visible", 0);
  const now = new Date().getTime();
  const openModal = now - visible > 14 * 24 * 60 * 60 * 1_000;
  const smallScreen = useSmallScreen();
  return (
    <Modal openModal={openModal} setOpen={() => undefined} disableBackdropClick>
      <Typography align="center" variant="h2" className={classes.h2}>
        Warning <Emoji emoji="⚠️" />
      </Typography>
      <div
        className={classes.root}
        style={{
          height: smallScreen ? 200 : undefined,
        }}
      >
        <Typography variant="body1" className={classes.text}>
          The Bonfida DEX is a fully decentralised digital asset exchange. No
          representation or warranty is made concerning any aspect of the
          Bonfida DEX, including its suitability, quality, availability,
          accessibility, accuracy or safety. As more fully explained in the{" "}
          <span className={classes.important}>Rules</span> (available{" "}
          <Link className={classes.link} external to={URL_RULES}>
            here
          </Link>
          ) and the <span className={classes.important}>Risk Statement</span>{" "}
          (available{" "}
          <Link className={classes.link} external to={URL_RISKS}>
            here
          </Link>
          ), your access to and use of the Bonfida DEX is entirely at your own
          risk and could lead to substantial losses. You take full
          responsibility for your use of the Bonfida DEX, and acknowledge that
          you use it on the basis of your own enquiry, without solicitation or
          inducement by Contributors (as defined in the Rules).
        </Typography>
        <Typography variant="body1" className={classes.text}>
          The Bonfida DEX is not available to residents of{" "}
          <strong>
            Belarus, the Central African Republic, the Democratic Republic of
            Congo, the Democratic People’s Republic of Korea, the Crimea region
            of Ukraine, Cuba, Iran, Libya, Somalia, Sudan, South Sudan, Syria,
            the USA, Yemen, and Zimbabwe or any other jurisdiction in which
            accessing or using the Bonfida DEX is prohibited (“Prohibited
            Jurisdictions”)
          </strong>
          . In using the Bonfida DEX, you confirm that you are not located in,
          incorporated or otherwise established in, or a citizen or resident of,
          a Prohibited Jurisdiction.
        </Typography>
        <Typography variant="body1" className={classes.text}>
          If you intend to enter into any transactions involving derivatives,
          you also confirm that you are not located in, incorporated or
          otherwise established in, or a citizen or resident of, a Derivatives
          Restricted Jurisdiction (as defined in the{" "}
          <Link className={classes.link} external to={URL_RULES}>
            Rules
          </Link>
          ).
        </Typography>
      </div>
      <Grid container alignItems="center" justify="center">
        <Grid item>
          <Checkbox
            className={classes.checkbox}
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
        </Grid>
        <Grid item>
          <Typography variant="body1" className={classes.text}>
            I confirm that I have read, understand and accept the{" "}
            <Link className={classes.link} external to={URL_RULES}>
              Rules
            </Link>{" "}
            and the{" "}
            <Link className={classes.link} external to={URL_RISKS}>
              Risk Statement
            </Link>
          </Typography>
        </Grid>
      </Grid>
      <Grid container justify="center">
        <Button
          className={classes.button}
          disabled={!checked}
          onClick={() => setVisible(now)}
        >
          Enter
        </Button>
      </Grid>
    </Modal>
  );
};

export default Warning;
