import React from "react";
import TopBar from "./TopBar";
import Footer from "./Footer";
import Warning, { Forbidden } from "../Warning";

const styles = {
  root: {
    display: "flex",
    minHeight: "100vh",
    flexDirection: "column",
    overflowY: "scroll",
    overflowX: "hidden",
  } as React.CSSProperties,
  terms: {
    fontWeight: 600,
  },
  agreeButton: {
    marginTop: 30,
  },
};

const NavigationFrame = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div style={styles.root}>
        <TopBar />
        <div style={{ flexGrow: 1 }}>{children}</div>
        <Footer />
        <Warning />
        <Forbidden />
      </div>
    </>
  );
};

export default NavigationFrame;
