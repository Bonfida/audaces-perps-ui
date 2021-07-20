import React, { useContext, useState, useEffect } from "react";
import { LayoutContextValues } from "./types";
import { useLocalStorageState } from "./utils";

const LayoutContext: React.Context<null | LayoutContextValues> =
  React.createContext<null | LayoutContextValues>(null);

const breakpoints = { lg: 2000, md: 1200, sm: 800, xs: 480 };
const cols = { lg: 12, md: 12, sm: 12, xs: 12 };
const width = 150;
const rowHeight = 125;

export function useWindowSize() {
  const isClient = typeof window === "object";
  function getSize() {
    return {
      width: isClient ? window.innerWidth : undefined,
      height: isClient ? window.innerHeight : undefined,
    };
  }

  const [windowSize, setWindowSize] = useState(getSize);

  // @ts-ignore
  useEffect(() => {
    if (!isClient) {
      return false;
    }

    function handleResize() {
      setWindowSize(getSize());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return windowSize;
}

export const LayoutProvider = ({ children }) => {
  const [locked, setLocked] = useState(true);
  const windowSize = useWindowSize();

  let isLg =
    windowSize?.width && windowSize?.width > breakpoints.lg ? true : false;
  let isMd =
    windowSize.width &&
    windowSize.width < breakpoints.lg &&
    windowSize.width > breakpoints.md
      ? true
      : false;
  let isSm =
    windowSize.width &&
    windowSize.width < breakpoints.md &&
    windowSize.width > breakpoints.sm
      ? true
      : false;
  let isXs =
    windowSize.width && windowSize.width < breakpoints.sm ? true : false;

  let breakpointString = isXs ? "xs" : isSm ? "sm" : isMd ? "md" : "lg";

  // TradingView
  let tradingViewWidth = isLg ? 10 : isMd ? 9 : isSm ? 12 : 12;
  let tradingViewHeight = isLg ? 40 : isMd ? 22 : isSm ? 20 : 20;
  // UserTable
  let userTableWidth = isLg ? 12 : isMd ? 9 : isSm ? 12 : 12;
  let userTableHeight = isLg ? 15 : isMd ? 15 : isSm ? 15 : 15;
  // Trade Tabel
  let tradePanelWidth = isLg ? 2 : isMd ? 3 : isSm ? 12 : 12;
  let tradePanelHeight = isLg ? 18 : isMd ? 15 : isSm ? 20 : 20;
  // Trade Form
  let tradeFormWidth = isLg ? 2 : isMd ? 3 : isSm ? 12 : 12;
  let tradeFormHeight = isLg ? 25 : isMd ? 25 : isSm ? 25 : 25;
  // MarketInfo
  let marketInfoWidth = isLg ? 10 : isMd ? 9 : isSm ? 12 : 12;
  let marketInfoHeight = isLg ? 3 : isMd ? 3 : isSm ? 3 : 3;

  // Layout Positions
  let tradingViewPosition = isLg
    ? [0, 0]
    : isMd
    ? [0, 0]
    : isSm
    ? [0, 0]
    : [0, marketInfoHeight];

  let userTablePosition = isLg
    ? [0, tradingViewHeight + marketInfoHeight]
    : isMd
    ? [0, tradingViewHeight + marketInfoHeight]
    : isSm
    ? [0, tradingViewHeight + marketInfoHeight]
    : [0, tradingViewHeight + marketInfoHeight + tradeFormHeight];

  let tradePanelPosition = isLg
    ? [tradingViewWidth, tradeFormHeight]
    : isMd
    ? [tradingViewWidth, tradeFormHeight]
    : isSm
    ? [0, tradingViewHeight + marketInfoHeight + userTableHeight]
    : [
        0,
        tradingViewHeight +
          marketInfoHeight +
          userTableHeight +
          tradeFormHeight,
      ];

  let tradeFormPosition = isLg
    ? [tradingViewWidth + tradePanelWidth, 0]
    : isMd
    ? [tradingViewWidth + tradePanelWidth, 0]
    : isSm
    ? [marketInfoWidth, tradingViewHeight]
    : [marketInfoWidth, tradingViewHeight];

  let marketInfoPosition = isLg
    ? [0, 0]
    : isMd
    ? [0, 0]
    : isSm
    ? [0, 0]
    : [0, 0];

  // Layout configs
  let tradingViewConfig = {
    x: tradingViewPosition[0],
    y: tradingViewPosition[1],
    w: tradingViewWidth,
    h: tradingViewHeight,
    i: "tradingView",
  };
  let userTableConfig = {
    x: userTablePosition[0],
    y: userTablePosition[1],
    w: userTableWidth,
    h: userTableHeight,
    minW: 5,
    minH: 11,
    i: "userTable",
  };
  let tradePanelConfig = {
    x: tradePanelPosition[0],
    y: tradePanelPosition[1],
    w: tradePanelWidth,
    h: tradePanelHeight,
    minW: 2,
    minH: 18,
    i: "tradePanel",
  };
  let tradeFormConfig = {
    x: tradeFormPosition[0],
    y: tradeFormPosition[1],
    w: tradeFormWidth,
    h: tradeFormHeight,
    minW: 2,
    minH: 20,
    i: "tradeForm",
  };
  let marketInfoConfig = {
    x: marketInfoPosition[0],
    y: marketInfoPosition[1],
    w: marketInfoWidth,
    h: marketInfoHeight,
    minH: 3,
    minW: 2,
    i: "marketInfo",
  };

  let defaultLayouts = [
    tradingViewConfig,
    userTableConfig,
    tradePanelConfig,
    tradeFormConfig,
    marketInfoConfig,
  ];

  const [layouts, setLayouts] = useLocalStorageState("layouts", defaultLayouts);

  const resetLayout = () => {
    localStorage.removeItem("layouts");
    window.location.reload();
  };

  const onLayoutChange = (_layouts: any) => {
    setLayouts(layouts);
  };

  const getLayout = (layoutName: string) => {
    return layouts.find((l) => l.i === layoutName);
  };

  return (
    <LayoutContext.Provider
      value={{
        locked,
        setLocked,
        onLayoutChange,
        resetLayout,
        layouts,
        getLayout,
        breakpoints,
        cols,
        rowHeight,
        width,
        breakpointString,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("Missing connection context");
  }
  return {
    locked: context.locked,
    setLocked: context.setLocked,
    layouts: context.layouts,
    resetLayout: context.resetLayout,
    onChangeLayout: context.onLayoutChange,
    getLayout: context.getLayout,
    breakpoints: context.breakpoints,
    cols: context.cols,
    breakpointString: context.breakpointString,
  };
};
