import React, { useEffect, useState, useCallback } from "react";
import {
  FiUsers,
  FiClipboard,
  FiFilePlus,
  FiFileText,
  FiBell,
  FiDollarSign,
  FiRefreshCw,
  FiCalendar,
} from "react-icons/fi";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDashboardStats,
  fetchDashboardTasks,
} from "../../Redux/Dashboards/dashboardSlice";
import DataTable from "react-data-table-component";

import BackButton from "../../Common/fields/BackButton";
import Heading from "../../Common/Heading";
import PageCount from "../../Common/PageCount";
import { tableStyle } from "../../Common/fields/tableStyle";
import GradientLoader from "../../Common/GradientLoader";
// import DashboardCharts from "./DashboardCharts";
import { IndianRupee } from "lucide-react";

const PERIODS = [
  { key: "today", label: "Today" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "yearly", label: "Yearly" },
  { key: "all", label: "All" },
];

const Dashboard = () => {
  const dispatch = useDispatch();
  const { stats, myTasks, loading } = useSelector((state) => state.dashboard);
  const user = useSelector((state) => state.auth);

  const [activePeriod, setActivePeriod] = useState("today");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const buildFilters = useCallback(
    (period = activePeriod, from = fromDate, to = toDate) => {
      const filters = { period };
      if (period === "custom" && from && to) {
        filters.fromDate = from.format("DD-MM-YYYY");
        filters.toDate = to.format("DD-MM-YYYY");
      }
      return filters;
    },
    [activePeriod, fromDate, toDate],
  );

  useEffect(() => {
    dispatch(fetchDashboardStats(buildFilters("today")));
    dispatch(fetchDashboardTasks());
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePeriodClick = (key) => {
    setActivePeriod(key);
    setFromDate(null);
    setToDate(null);
    dispatch(fetchDashboardStats({ period: key }));
  };

  const handleReset = () => {
    setActivePeriod("today");
    setFromDate(null);
    setToDate(null);
    dispatch(fetchDashboardStats({ period: "today" }));
  };

  const handleApply = () => {
    if (fromDate && toDate) {
      const filters = buildFilters("custom", fromDate, toDate);
      setActivePeriod("custom");
      dispatch(fetchDashboardStats(filters));
    }
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return "Good Morning";
    if (h >= 12 && h < 17) return "Good Afternoon";
    if (h >= 17 && h < 21) return "Good Evening";
    return "Good Night";
  };

  const taskColumns = [
    {
      name: "Customer Name",
      selector: (row) => row.customer?.names?.join(", ") || "-",
      sortable: true,
    },
    {
      name: "Alert Date",
      selector: (row) =>
        row.alertDate
          ? new Date(row.alertDate).toLocaleDateString("en-GB")
          : "-",
      sortable: true,
    },
    {
      name: "Alert Time",
      selector: (row) => {
        if (!row.alertTime) return "-";
        const [hours, minutes] = row.alertTime.split(":").map(Number);
        const period = hours >= 12 ? "PM" : "AM";
        const hour12 = hours % 12 || 12;
        return `${String(hour12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
      },
      sortable: true,
    },
    { name: "Note", selector: (row) => row.note || "-", wrap: true },
  ];

  const tiles = [
    {
      icon: <FiClipboard />,
      title: "Quotations",
      value: stats?.tiles?.quotations ?? 0,
    },
    {
      icon: <FiFileText />,
      title: "Proforma Invoices",
      value: stats?.tiles?.performas ?? 0,
    },
    {
      icon: <FiFilePlus />,
      title: "Purchase Orders",
      value: stats?.tiles?.purchaseOrders ?? 0,
    },
    {
      icon: <IndianRupee />,
      title: "Total Sales",
      value: `₹${(stats?.tiles?.totalSales ?? 0).toLocaleString("en-IN")}`,
    },
    {
      icon: <FiFileText />,
      title: "Invoice Count",
      value: stats?.tiles?.invoiceCount ?? 0,
    },
    {
      icon: <FiUsers />,
      title: "Total Customers",
      value: stats?.tiles?.totalCustomers ?? 0,
    },
    {
      icon: <FiBell />,
      title: "Today's Reminders",
      value: stats?.tiles?.reminders?.today ?? 0,
    },
  ];

  const activeLabel =
    activePeriod === "custom" && fromDate && toDate
      ? `${fromDate.format("DD/MM/YYYY")} – ${toDate.format("DD/MM/YYYY")}`
      : PERIODS.find((p) => p.key === activePeriod)?.label || activePeriod;

  return (
    <>
      <style>{`
        /* ── Welcome card ── */
        .welcome-card {
          background: var(--gradient-soft);
          border: 1px solid rgba(129, 140, 248, 0.2);
          color: var(--text-primary);
        }

        /* ── Stat cards ── */
        .stat-card {
          background: white;
          color: black;
          transition: all 0.3s ease;
        }
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 24px rgba(79, 70, 229, 0.25);
        }

        /* ── Generic white card ── */
        .chart-card {
          background: white;
          color: var(--text-primary);
          border: 1px solid rgba(129, 140, 248, 0.15);
        }

        /* ── Filter bar card ── */
        .filter-card {
          background: var(--gradient-soft);
          border: 1px solid rgba(129, 140, 248, 0.2);
        }
        .filter-bar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
        }

        /* Period buttons */
        .period-btn {
          padding: 5px 16px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border: 1.5px solid rgba(79, 70, 229, 0.25);
          background: white;
          color: var(--text-primary, #000);
          transition: all 0.2s;
          white-space: nowrap;
        }
        .period-btn:hover {
          border-color: var(--purple-soft, #4f46e5);
          color: var(--purple-soft, #4f46e5);
          background: rgba(79, 70, 229, 0.04);
        }
        .period-btn.active {
          background: var(--gradient-primary);
          border-color: transparent;
          color: white;
          box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
        }

        /* Reset button */
        .reset-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 5px 14px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border: 1.5px solid rgba(79, 70, 229, 0.3);
          background: white;
          color: var(--purple-soft, #4f46e5);
          transition: all 0.2s;
          white-space: nowrap;
        }
        .reset-btn:hover {
          background: rgba(79, 70, 229, 0.05);
        }

        /* Divider */
        .filter-divider {
          width: 1px;
          height: 26px;
          background: rgba(79, 70, 229, 0.18);
          flex-shrink: 0;
        }

        /* Date group */
        .date-group {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .date-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary, #000);
          display: flex;
          align-items: center;
          gap: 3px;
          white-space: nowrap;
        }

        /* Apply button */
        .apply-btn {
          padding: 5px 18px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          background: var(--gradient-primary);
          color: white;
          transition: opacity 0.2s, box-shadow 0.2s;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(79, 70, 229, 0.28);
        }
        .apply-btn:hover:not(:disabled) { opacity: 0.87; }
        .apply-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          box-shadow: none;
        }

        /* Ant DatePicker overrides */
        .ant-picker {
          border-radius: 6px !important;
          border-color: rgba(79, 70, 229, 0.28) !important;
          font-size: 13px !important;
          height: 32px !important;
          background: white !important;
        }
        .ant-picker:hover,
        .ant-picker-focused {
          border-color: var(--purple-soft, #4f46e5) !important;
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1) !important;
        }

        /* Active filter badge */
        .active-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          margin-top: 10px;
          padding: 2px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          background: rgba(79, 70, 229, 0.08);
          color: var(--purple-soft, #4f46e5);
          border: 1px solid rgba(79, 70, 229, 0.18);
        }
        .active-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--purple-soft, #4f46e5);
          flex-shrink: 0;
        }
      `}</style>

      <PageCount>
        {/* ── Welcome Card ── */}
        <div className="w-full welcome-card p-4 rounded-xl shadow-sm mb-6">
          <h1
            className="text-xl font-medium mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            {getGreeting()}, {user?.name || user?.username || "User"}!
          </h1>
          <h2
            className="text-sm font-semibold mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            Welcome to Shobha's CRM Dashboard!
          </h2>
         <p
       className="text-xs leading-snug font-medium"
      style={{
     background:
      "linear-gradient(90deg, var(--pink-soft), var(--purple-soft))",
     WebkitBackgroundClip: "text",
     WebkitTextFillColor: "transparent",
       }}
>
      "Small consistent actions create massive success — stay focused,
       keep growing, and build the future you dream of."
     </p>
        </div>

        {/* ── Header ── */}
        <div className="flex items-center gap-3 mb-5">
          <BackButton />
          <Heading text="Dashboard" />
        </div>

        {/* ── Filter Bar ── */}
        <div className="filter-card p-4 rounded-xl shadow-sm mb-6">
          <div className="filter-bar">
            <button className="reset-btn" onClick={handleReset}>
              <FiRefreshCw size={12} />
              Reset
            </button>

            <div className="filter-divider" />

            {PERIODS.map(({ key, label }) => (
              <button
                key={key}
                className={`period-btn ${activePeriod === key ? "active" : ""}`}
                onClick={() => handlePeriodClick(key)}
              >
                {label}
              </button>
            ))}

            <div className="filter-divider" />

            <div className="date-group">
              <span className="date-label">
                <FiCalendar size={11} /> From
              </span>
              <DatePicker
                placeholder="DD-MM-YYYY"
                value={fromDate}
                onChange={(date) => setFromDate(date)}
                format="DD-MM-YYYY"
                allowClear
                style={{ width: 125 }}
              />
              <span className="date-label">To</span>
              <DatePicker
                placeholder="DD-MM-YYYY"
                value={toDate}
                onChange={(date) => setToDate(date)}
                format="DD-MM-YYYY"
                allowClear
                disabledDate={(d) =>
                  fromDate && d && d.isBefore(fromDate, "day")
                }
                style={{ width: 125 }}
              />
              <button
                className="apply-btn"
                onClick={handleApply}
                disabled={!fromDate || !toDate}
              >
                Apply
              </button>
            </div>
          </div>

          {stats?.filter && (
            <div>
              <span className="active-badge">
                <span className="active-dot" />
                Showing: <strong>{activeLabel}</strong>
              </span>
            </div>
          )}
        </div>

        {/* ── Main Content ── */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <GradientLoader size={40} />
          </div>
        ) : (
          <>
            {/* Stat Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {tiles.map((tile, idx) => (
                <StatCard key={idx} {...tile} />
              ))}
            </div>

            {/* Charts */}
            {/* <div className="my-8">
              <DashboardCharts />
            </div> */}

            {/* Tasks Table */}
            <div className="chart-card p-3 md:p-5 rounded-xl shadow-md mb-4">
              <h2
                className="text-lg font-semibold mb-4"
               style={{ color: "var(--text-primary)" }}
               >
               Recent {myTasks.length}{" "}
                {myTasks.length === 1 ? "Task" : "Tasks"} Added
              </h2>
              <DataTable
                columns={taskColumns}
                data={myTasks}
                customStyles={tableStyle}
                highlightOnHover
                striped
                dense
                noHeader
              />
            </div>
          </>
        )}
      </PageCount>
    </>
  );
};

// ── Sub-components ────────────────────────────────────────────

const StatCard = ({ icon, title, value }) => (
  <div className="stat-card p-5 rounded-xl shadow-md flex items-center gap-4">
    <div
      className="text-2xl p-3 rounded-xl flex-shrink-0"
      style={{ background: "var(--gradient-primary)", color: "white" }}
    >
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div
        className="text-xs font-semibold mb-1 truncate uppercase tracking-wide"
        style={{ color: "black" }}
      >
        {title}
      </div>
      <div className="text-2xl font-bold truncate" style={{ color: "black" }}>
        {value}
      </div>
    </div>
  </div>
);

export default Dashboard;