import React, { useEffect, useState } from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
// import { fetchDashboardGraphData } from "../../Redux/Dashboards/dashboardSlice"; // API not ready yet
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

const numberFormatter = (num) =>
  num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const formatINR = (val) => {
  if (val >= 1_00_000) return `₹${(val / 1_00_000).toFixed(1)}L`;
  if (val >= 1_000) return `₹${(val / 1_000).toFixed(1)}K`;
  return `₹${val}`;
};

const formatCombinedData = (
  quotations = [],
  performas = [],
  purchaseOrders = [],
) =>
  MONTHS.map((month) => {
    const qObj = quotations.find((item) => Object.keys(item)[0] === month);
    const pObj = performas.find((item) => Object.keys(item)[0] === month);
    const poObj = purchaseOrders.find((item) => Object.keys(item)[0] === month);
    return {
      month: month.slice(0, 3).toUpperCase(),
      quotations: qObj ? qObj[month] : 0,
      performas: pObj ? pObj[month] : 0,
      purchaseOrders: poObj ? poObj[month] : 0,
    };
  });

const formatSalesData = (sales = []) =>
  MONTHS.map((month) => {
    const obj = sales.find((item) => Object.keys(item)[0] === month);
    const data = obj ? obj[month] : { amount: 0, count: 0 };
    return {
      month: month.slice(0, 3).toUpperCase(),
      amount: data.amount || 0,
      count: data.count || 0,
    };
  });

// ── Per-year cache (outside component so it persists across re-renders) ──
const graphCache = {};

const DashboardCharts = () => {
  const dispatch = useDispatch();
  const { graphData, graphYear, graphLoading } = useSelector(
    (state) => state.dashboard,
  );

  const currentYear = dayjs().year();

  // Separate year state for each chart
  const [docYear, setDocYear] = useState(currentYear);
  const [salesYear, setSalesYear] = useState(currentYear);

  const [docChartData, setDocChartData] = useState([]);
  const [salesChartData, setSalesChartData] = useState([]);
  const [docLoading, setDocLoading] = useState(false);
  const [salesLoading, setSalesLoading] = useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch helper — stub until API is ready
  const fetchYear = (year, onSuccess) => {
    if (graphCache[year]) {
      onSuccess(graphCache[year]);
      return;
    }
    // TODO: uncomment fetchDashboardGraphData when API is ready
    const emptyData = { monthly: { quotations: [], performas: [], purchaseOrders: [], sales: [] } };
    graphCache[year] = emptyData;
    onSuccess(emptyData);
  };

  // Doc chart year change
  useEffect(() => {
    setDocLoading(true);
    fetchYear(docYear, (data) => {
      setDocChartData(
        formatCombinedData(
          data.monthly.quotations,
          data.monthly.performas,
          data.monthly.purchaseOrders,
        ),
      );
      setDocLoading(false);
    });
  }, [docYear]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sales chart year change
  useEffect(() => {
    setSalesLoading(true);
    fetchYear(salesYear, (data) => {
      setSalesChartData(formatSalesData(data.monthly.sales));
      setSalesLoading(false);
    });
  }, [salesYear]); // eslint-disable-line react-hooks/exhaustive-deps

  const getColors = () => {
    const root = getComputedStyle(document.documentElement);
    return {
      pinkSoft: root.getPropertyValue("--pink-soft").trim() || "#60a5fa",
      purpleSoft: root.getPropertyValue("--purple-soft").trim() || "#4f46e5",
      redSoft: root.getPropertyValue("--red-soft").trim() || "#38bdf8",
      textPrimary: root.getPropertyValue("--text-primary").trim() || "#000",
      textSecondary: root.getPropertyValue("--text-secondary").trim() || "#000",
      textMuted: root.getPropertyValue("--text-muted").trim() || "#000",
    };
  };
  const colors = getColors();

  // Doc chart halves (mobile split)
  const docFirstHalf = docChartData.slice(0, 6);
  const docSecondHalf = docChartData.slice(6, 12);

  // Sales chart halves (mobile split)
  const salesFirstHalf = salesChartData.slice(0, 6);
  const salesSecondHalf = salesChartData.slice(6, 12);

  // Sales summary
  const totalSalesAmount = salesChartData.reduce((acc, d) => acc + d.amount, 0);
  const totalInvoiceCount = salesChartData.reduce((acc, d) => acc + d.count, 0);
  const peakMonth = salesChartData.reduce(
    (max, d) => (d.amount > max.amount ? d : max),
    { month: "-", amount: 0 },
  );

  // ── Tooltips ──────────────────────────────────────────────
  const DocTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        className="bg-white rounded-lg p-2 border shadow-lg"
        style={{ borderColor: `rgba(79,70,229,0.3)`, fontSize: 12 }}
      >
        <div className="font-bold mb-1" style={{ color: colors.textPrimary }}>
          {label}
        </div>
        {payload.map((entry, i) => (
          <div key={i} style={{ color: entry.fill }}>
            {entry.name}: {numberFormatter(entry.value)}
          </div>
        ))}
      </div>
    );
  };

  const SalesTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        className="bg-white rounded-lg p-3 border shadow-lg"
        style={{
          borderColor: `rgba(79,70,229,0.3)`,
          fontSize: 12,
          minWidth: 150,
        }}
      >
        <div className="font-bold mb-2" style={{ color: colors.textPrimary }}>
          {label}
        </div>
        {payload.map((entry, i) => (
          <div key={i} style={{ color: entry.stroke }}>
            {entry.name}:{" "}
            {entry.dataKey === "amount"
              ? `₹${numberFormatter(entry.value)}`
              : entry.value}
          </div>
        ))}
      </div>
    );
  };

  const Spinner = () => (
    <div className="flex items-center justify-center h-48">
      <div
        className="animate-spin rounded-full border-4"
        style={{
          width: 36,
          height: 36,
          borderColor: colors.purpleSoft,
          borderTopColor: "transparent",
        }}
      />
    </div>
  );

  // ── Doc bar chart ─────────────────────────────────────────
  const renderDocChart = (data, idSuffix) => (
    <ResponsiveContainer width="100%" height={isMobile ? 200 : 320}>
      <BarChart
        data={data}
        margin={
          isMobile
            ? { top: 10, right: 8, left: -20, bottom: 0 }
            : { top: 10, right: 30, left: 0, bottom: 0 }
        }
        barCategoryGap="20%"
      >
        <defs>
          <linearGradient id={`g1-${idSuffix}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.pinkSoft} />
            <stop offset="100%" stopColor={colors.purpleSoft} />
          </linearGradient>
          <linearGradient id={`g2-${idSuffix}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.purpleSoft} />
            <stop offset="100%" stopColor={colors.redSoft} />
          </linearGradient>
          <linearGradient id={`g3-${idSuffix}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.pinkSoft} />
            <stop offset="100%" stopColor={colors.redSoft} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke={colors.textMuted}
          opacity={0.3}
        />
        <XAxis
          dataKey="month"
          tick={{ fontSize: isMobile ? 10 : 12, fill: colors.textPrimary }}
          interval={0}
        />
        <YAxis
          tick={{ fontSize: isMobile ? 10 : 12, fill: colors.textPrimary }}
          allowDecimals={false}
          width={isMobile ? 28 : 35}
          domain={[
            0,
            Math.max(
              ...data.map((d) =>
                Math.max(d.quotations, d.performas, d.purchaseOrders),
              ),
              10,
            ),
          ]}
        />
        <Tooltip
          content={<DocTooltip />}
          cursor={{ fill: `rgba(79,70,229,0.05)` }}
        />
        {!isMobile && (
          <Legend
            formatter={(v) => (
              <span style={{ color: colors.textPrimary }}>{v}</span>
            )}
          />
        )}
        <Bar
          dataKey="quotations"
          fill={`url(#g1-${idSuffix})`}
          radius={[5, 5, 0, 0]}
          name="Quotations"
        />
        <Bar
          dataKey="performas"
          fill={`url(#g2-${idSuffix})`}
          radius={[5, 5, 0, 0]}
          name="Performas"
        />
        <Bar
          dataKey="purchaseOrders"
          fill={`url(#g3-${idSuffix})`}
          radius={[5, 5, 0, 0]}
          name="Purchase Orders"
        />
      </BarChart>
    </ResponsiveContainer>
  );

  // ── Sales area chart ──────────────────────────────────────
  const renderSalesChart = (data, idSuffix) => (
    <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
      <AreaChart
        data={data}
        margin={
          isMobile
            ? { top: 10, right: 8, left: 10, bottom: 0 }
            : { top: 10, right: 30, left: 20, bottom: 0 }
        }
      >
        <defs>
          <linearGradient
            id={`salesGrad-${idSuffix}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="5%" stopColor={colors.pinkSoft} stopOpacity={0.3} />
            <stop offset="95%" stopColor={colors.pinkSoft} stopOpacity={0.02} />
          </linearGradient>
          <linearGradient
            id={`countGrad-${idSuffix}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="5%"
              stopColor={colors.purpleSoft}
              stopOpacity={0.25}
            />
            <stop
              offset="95%"
              stopColor={colors.purpleSoft}
              stopOpacity={0.02}
            />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke={colors.textMuted}
          opacity={0.3}
        />
        <XAxis
          dataKey="month"
          tick={{ fontSize: isMobile ? 10 : 12, fill: colors.textPrimary }}
          interval={0}
        />
        <YAxis
          yAxisId="amount"
          orientation="left"
          tick={{ fontSize: isMobile ? 9 : 11, fill: colors.pinkSoft }}
          tickFormatter={formatINR}
          width={isMobile ? 42 : 58}
        />
        <YAxis
          yAxisId="count"
          orientation="right"
          tick={{ fontSize: isMobile ? 9 : 11, fill: colors.purpleSoft }}
          allowDecimals={false}
          width={isMobile ? 24 : 32}
        />
        <Tooltip
          content={<SalesTooltip />}
          cursor={{ fill: `rgba(79,70,229,0.05)` }}
        />
        {!isMobile && (
          <Legend
            formatter={(v) => (
              <span style={{ color: colors.textPrimary }}>{v}</span>
            )}
          />
        )}
        <Area
          yAxisId="amount"
          type="monotone"
          dataKey="amount"
          stroke={colors.pinkSoft}
          strokeWidth={2.5}
          fill={`url(#salesGrad-${idSuffix})`}
          dot={{ r: 4, fill: colors.pinkSoft, strokeWidth: 0 }}
          activeDot={{ r: 6 }}
          name="Sales Amount (₹)"
        />
        <Area
          yAxisId="count"
          type="monotone"
          dataKey="count"
          stroke={colors.purpleSoft}
          strokeWidth={2}
          fill={`url(#countGrad-${idSuffix})`}
          dot={{ r: 3, fill: colors.purpleSoft, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
          name="Invoice Count"
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  const mobileLegendDoc = [
    { label: "Quotations", gradient: [colors.pinkSoft, colors.purpleSoft] },
    { label: "Performas", gradient: [colors.purpleSoft, colors.redSoft] },
    { label: "Purchase Orders", gradient: [colors.pinkSoft, colors.redSoft] },
  ];

  return (
    <>
      <style>{`
        .dash-chart-card {
          background: var(--gradient-soft);
          border: 1px solid rgba(79, 70, 229, 0.15);
          box-shadow: 0 4px 20px rgba(79, 70, 229, 0.08);
        }
        .dash-chart-card-sales {
          background: var(--gradient-soft);
          border: 1px solid rgba(79, 70, 229, 0.15);
          box-shadow: 0 4px 20px rgba(79, 70, 229, 0.08);
        }
        .sales-summary-tile {
          flex: 1;
          min-width: 110px;
          background: white;
          border-radius: 10px;
          padding: 10px 14px;
          border: 1px solid rgba(79, 70, 229, 0.15);
          box-shadow: 0 2px 8px rgba(79, 70, 229, 0.07);
        }
        .chart-year-picker {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }
      `}</style>

      {/* ── Chart 1: Documents ── */}
      <div className="dash-chart-card rounded-xl p-4 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div>
            <h3
              className="text-lg font-semibold"
              style={{ color: colors.textPrimary }}
            >
              Monthly Overview
            </h3>
            <div className="text-xs" style={{ color: colors.textSecondary }}>
              Quotations, Performas &amp; Purchase Orders · {docYear}
            </div>
          </div>
          {/* Doc year selector */}
          <div className="chart-year-picker">
            <span
              className="text-xs font-medium"
              style={{ color: colors.textPrimary }}
            >
              Year:
            </span>
            <DatePicker
              picker="year"
              value={dayjs(`${docYear}-01-01`)}
              onChange={(date) => {
                if (date && date.year() !== docYear) setDocYear(date.year());
              }}
              disabledDate={(current) =>
                current && current.year() > currentYear
              }
              allowClear={false}
              size="small"
              style={{ borderColor: "rgba(79,70,229,0.3)", width: 90 }}
            />
          </div>
        </div>

        {docLoading ? (
          <Spinner />
        ) : isMobile ? (
          <>
            <div className="flex flex-wrap gap-3 mb-3">
              {mobileLegendDoc.map((item) => (
                <div key={item.label} className="flex items-center gap-1">
                  <span
                    style={{
                      display: "inline-block",
                      width: 10,
                      height: 10,
                      borderRadius: 3,
                      background: `linear-gradient(to bottom, ${item.gradient[0]}, ${item.gradient[1]})`,
                    }}
                  />
                  <span style={{ fontSize: 11, color: colors.textPrimary }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-xs mb-1" style={{ color: colors.textMuted }}>
              Jan – Jun
            </div>
            {renderDocChart(docFirstHalf, "a")}
            <div
              className="text-xs mt-4 mb-1"
              style={{ color: colors.textMuted }}
            >
              Jul – Dec
            </div>
            {renderDocChart(docSecondHalf, "b")}
          </>
        ) : (
          renderDocChart(docChartData, "main")
        )}
      </div>

      {/* ── Chart 2: Sales ── */}
      <div className="dash-chart-card-sales rounded-xl p-4">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div>
            <h3
              className="text-lg font-semibold"
              style={{ color: colors.textPrimary }}
            >
              Sales Overview
            </h3>
            <div className="text-xs" style={{ color: colors.textSecondary }}>
              Monthly Sales Amount &amp; Invoice Count · {salesYear}
            </div>
          </div>
          {/* Sales year selector */}
          <div className="chart-year-picker">
            <span
              className="text-xs font-medium"
              style={{ color: colors.textPrimary }}
            >
              Year:
            </span>
            <DatePicker
              picker="year"
              value={dayjs(`${salesYear}-01-01`)}
              onChange={(date) => {
                if (date && date.year() !== salesYear)
                  setSalesYear(date.year());
              }}
              disabledDate={(current) =>
                current && current.year() > currentYear
              }
              allowClear={false}
              size="small"
              style={{ borderColor: "rgba(79,70,229,0.3)", width: 90 }}
            />
          </div>
        </div>

        {salesLoading ? (
          <Spinner />
        ) : isMobile ? (
          <>
            <div className="flex flex-wrap gap-3 mb-3">
              {[
                { label: "Sales Amount (₹)", color: colors.pinkSoft },
                { label: "Invoice Count", color: colors.purpleSoft },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1">
                  <span
                    style={{
                      display: "inline-block",
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: item.color,
                    }}
                  />
                  <span style={{ fontSize: 11, color: colors.textPrimary }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-xs mb-1" style={{ color: colors.textMuted }}>
              Jan – Jun
            </div>
            {renderSalesChart(salesFirstHalf, "sa")}
            <div
              className="text-xs mt-4 mb-1"
              style={{ color: colors.textMuted }}
            >
              Jul – Dec
            </div>
            {renderSalesChart(salesSecondHalf, "sb")}
          </>
        ) : (
          renderSalesChart(salesChartData, "smain")
        )}
      </div>
    </>
  );
};

export default DashboardCharts;