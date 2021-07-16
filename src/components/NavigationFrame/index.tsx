import React from "react";
import TopBar from "./TopBar";
import Footer from "./Footer";
import Warning, { Forbidden } from "../Warning";

const NavigationFrame = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <TopBar />
      <div
        style={{
          flexGrow: 1,
          overflowX: "hidden",
          overflowY: "hidden",
          width: "100%",
        }}
      >
        {children}
      </div>
      <Footer />
      <Warning />
      <Forbidden />
    </>
  );
};

export default NavigationFrame;
