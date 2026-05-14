import { Trash2 } from "lucide-react";
import React from "react";

export const getTaskColumns = (onDelete, onStatusToggle, role) => {
  const columns = [
    {
      name: "Type",
      selector: (row) => {
        if (row.dataType === "reminder") {
          return `Reminder (${row.invoiceNo || "-"})`;
        }
        return row.type || "-";
      },
    },
    {
      name: "Customer Name",
      selector: (row) => {
        return Array.isArray(row.customer?.names)
          ? row.customer.names.join(", ")
          : Array.isArray(row.customerId?.names)
            ? row.customerId.names.join(", ")
            : row.customer?.name || "-";
      },
      sortable: true,
    },
    {
      name: "Alert Date",
      selector: (row) => {
        const dateField = row.alertDate || row.remainderDate || row.date;
        return dateField
          ? new Date(dateField).toLocaleDateString("en-GB")
          : "-";
      },
      sortable: true,
    },
    {
      name: "Alert Time",
      selector: (row) => {
        if (row.dataType === "task" && row.alertTime) {
          const [hours, minutes] = row.alertTime.split(":").map(Number);
          const period = hours >= 12 ? "PM" : "AM";
          const hour12 = hours % 12 || 12;
          return `${String(hour12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
        }
        return "-";
      },
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => row.status || "Active",
      // ✅ FIX: center:true hata diya — react-data-table v7 mein center prop
      // DOM pe directly jaata hai jisse React warning aati hai
      // Ab cell mein justify-center CSS se centering ki hai
      cell: (row) => {
        const isActive = row.status?.toLowerCase() === "active";
        return (
          <div className="flex items-center justify-center w-full p-1 border border-gray-300 rounded">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => {
                  e.stopPropagation();
                  onStatusToggle(row);
                }}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 peer-checked:border-green-600"></div>
              <span className="ml-1 text-xs font-medium p-1 rounded-full bg-gray-100">
                {isActive ? "🟢 ACTIVE" : "🔴 INACTIVE"}
              </span>
            </label>
          </div>
        );
      },
      width: "180px",
      ignoreRowClick: true,
    },
    {
      name: "Note / Invoice Info",
      selector: (row) => {
        if (row.dataType === "reminder") {
          return `${row.invoiceNo || "-"} | ${row.salesPerson || "-"}`;
        }
        return row.note || "-";
      },
      wrap: true,
    },
    {
      name: "Created",
      selector: (row) =>
        row.createdAt
          ? new Date(row.createdAt).toLocaleDateString("en-GB")
          : "-",
      sortable: true,
    },
  ];

  if (role === "superAdmin") {
    columns.push({
      name: "Actions",
      // ✅ FIX: center:true hata diya yahan bhi
      cell: (row) => (
        <div className="flex items-center justify-center w-full">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(row._id);
            }}
            className="text-red-600 hover:text-red-800 hover:underline text-sm p-1 transition-colors"
            title={`Delete ${row.dataType === "reminder" ? "Reminder" : "Task"}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      width: "80px",
    });
  }

  return columns;
};