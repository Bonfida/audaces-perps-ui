import React from "react";
import TradeForm from "../components/TradeForm";
import UserTable from "../components/UserTable";
import { TVChartContainer } from "../components/TVChartContainer";
import TradePanel from "../components/TradePanel";
import { useLayout } from "../utils/layout";
import { Responsive, WidthProvider } from "react-grid-layout";

const ResponsiveGridLayout = WidthProvider(Responsive);

const TradePage = () => {
  const { getLayout, layouts, locked, onChangeLayout, breakpoints, cols } =
    useLayout();

  return (
    <>
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={breakpoints}
        cols={cols}
        rowHeight={15}
        width={window.innerWidth}
        isDraggable={!locked}
        isResizable={!locked}
        draggableHandle={".draggable"}
        onLayoutChange={onChangeLayout}
      >
        <div
          className="draggable"
          key="tradeForm"
          data-grid={getLayout("tradeForm")}
        >
          <TradeForm />
        </div>
        <div
          className="draggable"
          key="tradingView"
          data-grid={getLayout("tradingView")}
        >
          <TVChartContainer />
        </div>
        <div
          className="draggable"
          key="tradePanel"
          data-grid={getLayout("tradePanel")}
        >
          <TradePanel />
        </div>
        <div
          className="draggable"
          key="userTable"
          data-grid={getLayout("userTable")}
        >
          <UserTable />
        </div>
      </ResponsiveGridLayout>
    </>
  );
};

export default TradePage;
