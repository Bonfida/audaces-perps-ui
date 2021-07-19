import * as React from "react";
import "./index.css";
import {
  widget,
  ChartingLibraryWidgetOptions,
  IChartingLibraryWidget,
} from "../../charting_library";
import * as saveLoadAdapter from "./saveLoadAdapter";
import { flatten } from "../../utils/utils";

export interface ChartContainerProps {
  symbol: ChartingLibraryWidgetOptions["symbol"];
  interval: ChartingLibraryWidgetOptions["interval"];
  auto_save_delay: ChartingLibraryWidgetOptions["auto_save_delay"];

  // BEWARE: no trailing slash is expected in feed URL
  datafeedUrl: string;
  libraryPath: ChartingLibraryWidgetOptions["library_path"];
  chartsStorageUrl: ChartingLibraryWidgetOptions["charts_storage_url"];
  chartsStorageApiVersion: ChartingLibraryWidgetOptions["charts_storage_api_version"];
  clientId: ChartingLibraryWidgetOptions["client_id"];
  userId: ChartingLibraryWidgetOptions["user_id"];
  fullscreen: ChartingLibraryWidgetOptions["fullscreen"];
  autosize: ChartingLibraryWidgetOptions["autosize"];
  studiesOverrides: ChartingLibraryWidgetOptions["studies_overrides"];
  containerId: ChartingLibraryWidgetOptions["container_id"];
  theme: string;
}

export interface ChartContainerState {}

export const TVChartContainer = () => {
  // let datafeed = useTvDataFeed();
  const defaultProps: ChartContainerProps = {
    symbol: "BTC-PERP",
    // @ts-ignore
    interval: "60",
    auto_save_delay: 5,
    theme: "Dark",
    containerId: "tv_chart_container",
    datafeedUrl: "https://serum-api.bonfida.com/tv",
    libraryPath: "/charting_library/",
    chartsStorageUrl: "https://saveload.tradingview.com",
    chartsStorageApiVersion: "1.1",
    clientId: "tradingview.com",
    userId: "public_user_id",
    fullscreen: false,
    autosize: true,
    studiesOverrides: {},
  };

  const tvWidgetRef = React.useRef<IChartingLibraryWidget | null>(null);
  const market = "BTC-PERP";
  const index = "BTC-PERP-INDEX";

  const chartProperties = JSON.parse(
    localStorage.getItem("chartproperties") || "{}"
  );

  React.useEffect(() => {
    const savedProperties = flatten(chartProperties, {
      restrictTo: ["scalesProperties", "paneProperties", "tradingProperties"],
    });

    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol: market,
      // BEWARE: no trailing slash is expected in feed URL
      // tslint:disable-next-line:no-any
      // @ts-ignore
      datafeed: new (window as any).Datafeeds.UDFCompatibleDatafeed(
        defaultProps.datafeedUrl
      ),
      interval:
        defaultProps.interval as ChartingLibraryWidgetOptions["interval"],
      container_id:
        defaultProps.containerId as ChartingLibraryWidgetOptions["container_id"],
      library_path: defaultProps.libraryPath as string,
      auto_save_delay: 5,
      locale: "en",
      disabled_features: [
        "use_localstorage_for_settings",
        "create_volume_indicator_by_default",
      ],
      enabled_features: ["study_templates"],
      load_last_chart: true,
      client_id: defaultProps.clientId,
      user_id: defaultProps.userId,
      fullscreen: defaultProps.fullscreen,
      autosize: defaultProps.autosize,
      studies_overrides: defaultProps.studiesOverrides,
      theme: defaultProps.theme === "Dark" ? "Dark" : "Light",
      overrides: {
        ...savedProperties,
        "mainSeriesProperties.candleStyle.upColor": "#41C77A",
        "mainSeriesProperties.candleStyle.downColor": "#F23B69",
        // 'mainSeriesProperties.candleStyle.borderColor': '#378658',
        "mainSeriesProperties.candleStyle.borderUpColor": "#41C77A",
        "mainSeriesProperties.candleStyle.borderDownColor": "#F23B69",
        "mainSeriesProperties.candleStyle.wickUpColor": "#41C77A",
        "mainSeriesProperties.candleStyle.wickDownColor": "#F23B69",
      },
      // @ts-ignore
      save_load_adapter: saveLoadAdapter,
      settings_adapter: {
        initialSettings: {
          "trading.orderPanelSettingsBroker": JSON.stringify({
            showRelativePriceControl: false,
            showCurrencyRiskInQty: false,
            showPercentRiskInQty: false,
            showBracketsInCurrency: false,
            showBracketsInPercent: false,
          }),
          // "proterty"
          "trading.chart.proterty":
            localStorage.getItem("trading.chart.proterty") ||
            JSON.stringify({
              hideFloatingPanel: 1,
            }),
          "chart.favoriteDrawings":
            localStorage.getItem("chart.favoriteDrawings") ||
            JSON.stringify([]),
          "chart.favoriteDrawingsPosition":
            localStorage.getItem("chart.favoriteDrawingsPosition") ||
            JSON.stringify({}),
        },
        setValue: (key, value) => {
          localStorage.setItem(key, value);
        },
        removeValue: (key) => {
          localStorage.removeItem(key);
        },
      },
      custom_indicators_getter: function (PineJS) {
        return Promise.resolve([
          {
            // Replace the <study name> with your study name
            // The name will be used internally by the Charting Library
            name: "index",
            metainfo: {
              _metainfoVersion: 40,
              id: `index@tv-basicstudies-1`,
              scriptIdPart: "",
              name: "index",
              description: "index",
              shortDescription: "index",

              is_hidden_study: true,
              is_price_study: true,
              isCustomIndicator: true,

              plots: [{ id: "plot_0", type: "line" }],
              defaults: {
                styles: {
                  plot_0: {
                    linestyle: 0,
                    visible: true,

                    // Make the line thinner
                    linewidth: 1,

                    // Plot type is Line
                    plottype: 2,

                    // Show price line
                    trackPrice: true,

                    transparency: 40,

                    // Set the plotted line color to dark red
                    color: "#4576ff",
                  },
                },

                // Precision is set to one digit, e.g. 777.7
                precision: 1,

                inputs: {},
              },
              styles: {
                plot_0: {
                  // Output name will be displayed in the Style window
                  title: "Equity value",
                  histogramBase: 0,
                },
              },
              inputs: [],
            },
            constructor: function () {
              // @ts-ignore
              this.init = function (context, inputCallback) {
                // @ts-ignore
                this._context = context;
                // @ts-ignore
                this._input = inputCallback;

                var symbol = index;
                // @ts-ignore
                this._context.new_sym(
                  symbol,
                  // @ts-ignore
                  PineJS.Std.period(this._context),
                  // @ts-ignore
                  PineJS.Std.period(this._context)
                );
              };
              // @ts-ignore
              this.main = function (context, inputCallback) {
                // @ts-ignore
                this._context = context;
                // @ts-ignore
                this._input = inputCallback;
                // @ts-ignore
                this._context.select_sym(1);
                // @ts-ignore
                var v = PineJS.Std.close(this._context);
                return [v];
              };
            },
          },
        ]);
      },
    };

    const tvWidget = new widget(widgetOptions);

    tvWidget.onChartReady(() => {
      tvWidget.chart().createStudy("Index", false, true);
      tvWidgetRef.current = tvWidget;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [market, tvWidgetRef.current]);

  return <div id={defaultProps.containerId} className={"TVChartContainer"} />;
};
