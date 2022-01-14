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
  let tradingViewWidth = isLg ? 6 : isMd ? 6 : isSm ? 12 : 12;
  let tradingViewHeight = isLg ? 32 : isMd ? 27 : isSm ? 20 : 20;
  // UserTable
  let userTableWidth = isLg ? 12 : isMd ? 9 : isSm ? 12 : 12;
  let userTableHeight = isLg ? 15 : isMd ? 15 : isSm ? 15 : 15;
  // Trade Tabel
  let tradePanelWidth = isLg ? 3 : isMd ? 3 : isSm ? 12 : 12;
  let tradePanelHeight = isLg ? 14 : isMd ? 13 : isSm ? 20 : 20;
  // Trade Form
  let tradeFormWidth = isLg ? 3 : isMd ? 3 : isSm ? 12 : 12;
  let tradeFormHeight = isLg ? 18 : isMd ? 27 : isSm ? 25 : 25;

  // Orderbook
  let orderbookWidth = isLg ? 3 : isMd ? 3 : isSm ? 12 : 12;
  let orderbookHeight = isLg ? 18 : isMd ? 14 : isSm ? 18 : 18;

  // Account view
  let accountWidth = isLg ? 3 : isMd ? 3 : isSm ? 12 : 12;
  let accountHeight = isLg ? 14 : isMd ? 15 : isSm ? 20 : 20;

  // Layout Positions
  let tradingViewPosition = isLg
    ? [0, 0]
    : isMd
    ? [0, 0]
    : isSm
    ? [0, 0]
    : [0, 0];

  let userTablePosition = isLg
    ? [0, tradingViewHeight]
    : isMd
    ? [0, tradingViewHeight]
    : isSm
    ? [0, tradingViewHeight + tradeFormHeight + orderbookHeight]
    : [0, tradingViewHeight + tradeFormHeight + orderbookHeight];

  let tradePanelPosition = isLg
    ? [tradingViewWidth, orderbookHeight]
    : isMd
    ? [tradingViewWidth, orderbookHeight]
    : isSm
    ? [
        0,
        tradingViewHeight + userTableHeight + tradeFormHeight + orderbookHeight,
      ]
    : [
        0,
        tradingViewHeight + userTableHeight + tradeFormHeight + orderbookHeight,
      ];

  let tradeFormPosition = isLg
    ? [tradingViewWidth + tradePanelWidth, 0]
    : isMd
    ? [tradingViewWidth + tradePanelWidth, 0]
    : isSm
    ? [0, tradingViewHeight]
    : [0, tradingViewHeight];

  let orderBookPosition = isLg
    ? [tradingViewWidth, 0]
    : isMd
    ? [tradingViewWidth, 0]
    : isSm
    ? [0, tradingViewHeight + tradeFormHeight]
    : [0, tradingViewHeight + tradeFormHeight];

  let accountPosition = isLg
    ? [userTableWidth, tradeFormHeight]
    : isMd
    ? [userTableWidth, tradeFormHeight]
    : isSm
    ? [
        0,
        tradingViewHeight +
          userTableHeight +
          tradeFormHeight +
          orderbookHeight +
          tradePanelHeight,
      ]
    : [
        0,
        tradingViewHeight +
          userTableHeight +
          tradeFormHeight +
          orderbookHeight +
          tradePanelHeight,
      ];

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
  let orderbookConfig = {
    x: orderBookPosition[0],
    y: orderBookPosition[1],
    w: orderbookWidth,
    h: orderbookHeight,
    minW: 2,
    minH: 20,
    i: "orderbook",
  };
  let accountViewConfig = {
    x: accountPosition[0],
    y: accountPosition[1],
    w: accountWidth,
    h: accountHeight,
    minW: 2,
    minH: 20,
    i: "accountView",
  };

  let defaultLayouts = [
    tradingViewConfig,
    userTableConfig,
    tradePanelConfig,
    tradeFormConfig,
    orderbookConfig,
    accountViewConfig,
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
