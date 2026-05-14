import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import DataTable from "react-data-table-component";
import PageCount from "../../Common/PageCount";
import Heading from "../../Common/Heading";
import BackButton from "../../Common/fields/BackButton";
import { Plus } from "lucide-react";
import { tableStyle } from "../../Common/fields/tableStyle";
import { getTaskColumns } from "./getTaskColumns";
import { showNotification } from "../../Redux/Notification/notificationSlice.js";
import GradientButton from "../../Common/GradientButton";
import {
  fetchAllTasks,
  deleteTaskById,
  updateStatus,
} from "../../Redux/Task/taskSlice";
import GradientLoader from "../../Common/GradientLoader";
import DeleteConfirmAlert from "../../Common/DeleteConfirmAlert";
import { useForm } from "react-hook-form";
import InputField from "../../Common/fields/InputField";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import { FaFileExcel } from "react-icons/fa";

const AllTasks = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const tasks = useSelector((state) => state.taskMaster.tasks) || [];
  const todayReminders =
    useSelector((state) => state.taskMaster.todayReminders) || [];
  console.log("🔔 Today Reminders:", todayReminders);
  const loading = useSelector((state) => state.taskMaster.loading);
  const role = useSelector((state) => state.auth.role);

  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  // ✅ Fetch tasks on load
  useEffect(() => {
    dispatch(fetchAllTasks());
  }, [dispatch]);

  const {
    control,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      alertDate: "",
      fromDate: "",
      toDate: "",
    },
  });

  const alertDate = watch("alertDate");
  const fromDate = watch("fromDate");
  const toDate = watch("toDate");

  // ✅ Notification alert interval
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const today = now.toISOString().split("T")[0];
      const currentTime = now.toTimeString().slice(0, 5);

      const dueTasks = tasks.filter(
        (task) =>
          task.alertDate === today &&
          task.alertTime === currentTime &&
          task.status?.toLowerCase() === "active",
      );

      dueTasks.forEach((task) => {
        dispatch(showNotification(task));
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [tasks, dispatch]);

  // ✅ Handle Task Row Click (Tasks → edit-task)
  const handleTaskRowClick = (row) => {
    navigate(`/${role}/edit-task/${row._id}`, { state: row });
  };

  // ✅ Handle Reminder Row Click (Reminders → edit-tax-invoice)
  const handleReminderRowClick = (row) => {
    // Same navigation logic as previous TaxInvoice component
    navigate(`/${role}/edit-tax-invoice/${row._id}`, {
      state: {
        ...row,
        // Add product enrichment if products available
        productIds: row.products || row.productIds || [],
      },
    });
  };

  const handleDelete = async (id) => {
    const confirmed = await DeleteConfirmAlert({
      title: "Are you sure you want to delete this task?",
      text: "This action cannot be undone.",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "No, cancel",
    });

    if (confirmed) {
      await dispatch(deleteTaskById(id));
    }
  };

  // ✅ Filter Tasks (for table display)
  const searchFilteredTasks = tasks.filter((task) => {
    const nameMatch = (task.customer?.names?.[0] || "")
      .toLowerCase()
      .includes(searchText.toLowerCase());

    const dateMatch = alertDate
      ? task.alertDate?.split("T")[0] === alertDate
      : true;

    const typeMatch = typeFilter === "All" ? true : task.type === typeFilter;

    return nameMatch && dateMatch && typeMatch;
  });

  // ✅ Filter Today's Reminders
  const searchFilteredReminders = todayReminders.filter((reminder) => {
    const nameMatch = (
      reminder.customerId?.names?.[0] ||
      reminder.customer?.names?.[0] ||
      ""
    )
      .toLowerCase()
      .includes(searchText.toLowerCase());

    const dateMatch = alertDate
      ? reminder.remainderDate?.split("T")[0] === alertDate ||
        reminder.date?.split("T")[0] === alertDate
      : true;

    return nameMatch && dateMatch;
  });

  // ✅ Date Range Filter for both Tasks & Reminders
  const dateRangeFilteredTasks = tasks.filter((task) => {
    if (!fromDate && !toDate) return true;
    const taskDate = new Date(task.alertDate || task.createdAt);
    const from = fromDate ? new Date(fromDate + "T00:00:00") : null;
    const to = toDate ? new Date(toDate + "T23:59:59.999") : null;

    if (from && to) return taskDate >= from && taskDate <= to;
    if (from && !to) return taskDate >= from;
    if (!from && to) return taskDate <= to;
    return true;
  });

  const dateRangeFilteredReminders = todayReminders.filter((reminder) => {
    if (!fromDate && !toDate) return true;
    const reminderDate = new Date(
      reminder.remainderDate || reminder.createdAt || reminder.date,
    );
    const from = fromDate ? new Date(fromDate + "T00:00:00") : null;
    const to = toDate ? new Date(toDate + "T23:59:59.999") : null;

    if (from && to) return reminderDate >= from && reminderDate <= to;
    if (from && !to) return reminderDate >= from;
    if (!from && to) return reminderDate <= to;
    return true;
  });

  // ✅ Combined data for table with type indicator
  const tableData = [
    // Tasks first
    ...searchFilteredTasks
      .filter((task) => dateRangeFilteredTasks.includes(task))
      .map((task) => ({ ...task, dataType: "task" })),
    // Reminders after
    ...searchFilteredReminders
      .filter((reminder) => dateRangeFilteredReminders.includes(reminder))
      .map((reminder) => ({ ...reminder, dataType: "reminder" })),
  ].reverse();

  const calcColWidths = (rows, headers) => {
    const maxLens = headers.map((h) => h.length);
    rows.forEach((r) => {
      headers.forEach((h, i) => {
        const val = r[h] == null ? "" : String(r[h]);
        const len = val.length;
        if (len > maxLens[i]) maxLens[i] = len;
      });
    });
    return maxLens.map((l) => ({ wch: Math.max(10, Math.ceil(l + 2)) }));
  };

  const handleDownloadExcel = () => {
    if (tableData.length === 0) {
      toast.error("No data available for selected filters.");
      return;
    }

    const dataToExport = tableData.map((item) => {
      if (item.dataType === "task") {
        return {
          "Customer Name": Array.isArray(item.customer?.names)
            ? item.customer.names.join(", ")
            : item.customer?.names?.[0] || "-",
          "Task Type": item.type || "-",
          "Alert Date": item.alertDate
            ? new Date(item.alertDate).toLocaleDateString("en-GB")
            : "-",
          "Alert Time": item.alertTime || "-",
          Status: item.status || "Active",
          Note: item.note || "-",
          "Created Date": item.createdAt
            ? new Date(item.createdAt).toLocaleDateString("en-GB")
            : "-",
          Type: "Task", // ✅ Indicator
        };
      } else {
        // Reminder data
        return {
          "Customer Name": Array.isArray(item.customerId?.names)
            ? item.customerId.names.join(", ")
            : item.customer?.names?.join(", ") || "-",
          "Invoice No": item.invoiceNo || "-",
          "Alert Date": item.remainderDate
            ? new Date(item.remainderDate).toLocaleDateString("en-GB")
            : "-",
          Status: item.status || "Reminder",
          "Sales Person": item.salesPerson || "-",
          "Created Date": item.createdAt
            ? new Date(item.createdAt).toLocaleDateString("en-GB")
            : "-",
          Type: "Today Reminder", // ✅ Indicator
        };
      }
    });

   const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    worksheet["!cols"] = calcColWidths(
      dataToExport,
      Object.keys(dataToExport[0]),
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks & Reminders");

    const filename =
      fromDate || toDate
        ? `Tasks_Reminders_${fromDate || "start"}_to_${toDate || "end"}.xlsx`
        : `Tasks_Reminders_All.xlsx`;

    XLSX.writeFile(workbook, filename);
    toast.success("Excel downloaded successfully!");
  };

  const handleStatusToggle = async (row) => {
    console.log("🔍 Status Toggle:", row.dataType, row._id);

    const type = row.dataType === "task" ? "task" : "invoice";
    const newStatus =
      row.status?.toLowerCase() === "active" ? "inactive" : "active";

    try {
      await dispatch(updateStatus({ id: row._id, status: newStatus, type }));
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  return (
    <PageCount>
      <div className="flex flex-col gap-3 mb-4 p-1 sm:p-0">
        {/* First Row: Heading + Filters */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-3 flex-shrink-0">
            <BackButton />
            <Heading text="All Tasks & Reminders" />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Alert Date Filter */}
            <div className="w-full sm:w-[180px]">
              <InputField
                name="alertDate"
                label=""
                type="date"
                control={control}
                errors={errors}
              />
            </div>

            {/* Type Filter Dropdown */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-[9px] w-full sm:w-[140px] text-sm rounded-md border focus:outline-none focus:ring-2 transition-all"
              style={{
                borderColor: "var(--pink-soft)",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                color: "var(--text-primary)",
                boxShadow: "0 1px 6px rgba(249, 168, 212, 0.08)",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--purple-soft)";
                e.target.style.boxShadow =
                  "0 0 0 3px rgba(165, 180, 252, 0.15)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--pink-soft)";
                e.target.style.boxShadow =
                  "0 1px 6px rgba(249, 168, 212, 0.08)";
              }}
            >
              <option value="All">All</option>
              <option value="Quotation">Quotation</option>
              <option value="Normal">Normal</option>
            </select>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search by customer"
              className="px-3 py-[9px] w-full sm:w-[180px] text-sm rounded-md border focus:outline-none focus:ring-2 transition-all"
              style={{
                borderColor: "var(--pink-soft)",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                color: "var(--text-primary)",
                boxShadow: "0 1px 6px rgba(249, 168, 212, 0.08)",
              }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--purple-soft)";
                e.target.style.boxShadow =
                  "0 0 0 3px rgba(165, 180, 252, 0.15)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--pink-soft)";
                e.target.style.boxShadow =
                  "0 1px 6px rgba(249, 168, 212, 0.08)";
              }}
            />

            {/* Add Task Button */}
            <GradientButton
              onClick={() => navigate(`/${role}/add-task`)}
              className="w-full sm:w-auto py-[9px] px-4 min-h-[38px]"
            >
              <Plus size={18} className="mr-1" /> Add Task
            </GradientButton>
          </div>
        </div>

        {/* Second Row: Date Range + Excel - Mobile एक row */}
        <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 items-stretch lg:items-center justify-center lg:justify-end mb-4">
          {/* Date Range Container */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto bg-white/50 rounded-lg p-2 border border-gray-100">
            <label className="text-sm font-medium whitespace-nowrap">
              From:
            </label>
            <div className="w-[120px] flex-shrink-0">
              <InputField
                name="fromDate"
                label=""
                type="date"
                control={control}
                errors={errors}
              />
            </div>
            <label className="text-sm font-medium whitespace-nowrap">To:</label>
            <div className="w-[120px] flex-shrink-0">
              <InputField
                name="toDate"
                label=""
                type="date"
                control={control}
                errors={errors}
              />
            </div>
          </div>

          {/* Excel Button */}
          <GradientButton
            onClick={handleDownloadExcel}
            className="w-full lg:w-auto py-[9px] px-4 mt-2 lg:mt-0 min-h-[38px]"
          >
            <FaFileExcel size={16} className="mr-1" /> Download Excel
          </GradientButton>
        </div>
      </div>

      {/* 🌀 Loader */}
      {loading ? (
        <div className="flex justify-center py-12 min-h-[400px]">
          <GradientLoader size={40} />
        </div>
      ) : (
        <div className="my-5">
          <DataTable
            columns={getTaskColumns(handleDelete, handleStatusToggle, role)}
            data={tableData}
            onRowClicked={(row) =>
              row.dataType === "task"
                ? handleTaskRowClick(row)
                : handleReminderRowClick(row)
            }
            customStyles={tableStyle}
            pagination
            highlightOnHover
            responsive
            paginationPerPage={10}
            paginationRowsPerPageOptions={[5, 10, 15, 20]}
          />
        </div>
      )}
    </PageCount>
  );
};

export default AllTasks;
