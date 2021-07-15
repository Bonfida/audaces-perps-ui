import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Link from "../Link";
import HelpUrls from "../../utils/HelpUrls";
import Typography from "@material-ui/core/Typography";
import { useLocalStorageState } from "../../utils/utils";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    marginTop: 100,
  },
  list: {
    margin: 0,
    paddingLeft: 0,
    paddingBottom: 0,
    listStyle: "none",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  listItem: {
    paddingLeft: 20,
    paddingRight: 20,
    fontSize: 16,
    fontWeight: 900,
    textTransform: "capitalize",
    color: "white",
  },
  disclaimer: {
    color: "white",
    marginLeft: 5,
    marginRight: 5,
  },
  refText: {
    color: "white",
    fontSize: 12,
  },
});

interface footerElementI {
  name: string;
  link: string;
}

const listElement: footerElementI[] = [
  { name: "GitHub", link: HelpUrls.github },
  { name: "Help", link: HelpUrls.help },
];

const Footer = () => {
  const classes = useStyles();
  const [refCode] = useLocalStorageState("referralCode");
  return (
    <>
      <footer className={classes.root}>
        <ul className={classes.list}>
          {listElement.map((e, i) => {
            return (
              <Link
                key={`footer-${i}`}
                external
                to={e.link}
                style={{ textDecoration: "none" }}
              >
                <li className={classes.listItem}>{e.name}</li>
              </Link>
            );
          })}
        </ul>
        {refCode && (
          <Typography variant="body1" className={classes.refText}>
            Your referrer is {refCode}
          </Typography>
        )}
        <Typography
          variant="body1"
          align="center"
          className={classes.disclaimer}
        >
          This website is hosted on IPFS and is not available in the United
          States or other prohibited jurisdictions.
        </Typography>
      </footer>
    </>
  );
};

export default Footer;
