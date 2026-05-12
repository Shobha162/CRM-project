import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import DataTable from "react-data-table-component";
import { useSelector, useDispatch } from "react-redux";
import GradientLoader from "../../Common/GradientLoader";
import {
  fetchCustomers,
  deleteCustomer,
} from "../../Redux/Customer/customerSlice";
import { getCustomerColumns } from "./getCustomerColumns";
import PageCount from "../../Common/PageCount";
import Heading from "../../Common/Heading";
import BackButton from "../../Common/fields/BackButton";
import { tableStyle } from "../../Common/fields/tableStyle";
import GradientButton from "../../Common/GradientButton";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import DeleteConfirmAlert from "../../Common/DeleteConfirmAlert";

const AllCustomers = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { customers, loading } = useSelector((state) => state.customerMaster);
  const role = useSelector((state) => state.auth.role);
  const token = localStorage.getItem("token");

  const [searchText, setSearchText] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [sortedData, setSortedData] = useState([]);

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  // Filter and sort initially by Name A-Z
  const filteredCustomers = useMemo(() => {
    const query = searchText.toLowerCase();

    return customers
      .filter((customer) => {
        const names = Array.isArray(customer.names)
          ? customer.names.join(" ").toLowerCase()
          : "";
        const phones = Array.isArray(customer.phones)
          ? customer.phones.join(" ")
          : "";
        const createdByName = customer.createdBy?.name
          ? customer.createdBy.name.toLowerCase()
          : "";

        return (
          names.includes(query) ||
          phones.includes(query) ||
          createdByName.includes(query)
        );
      })
      .sort((a, b) => {
        const nameA = a.names?.[0]?.toLowerCase() || "";
        const nameB = b.names?.[0]?.toLowerCase() || "";
        return nameA.localeCompare(nameB);
      });
  }, [customers, searchText]);

  // Sync sortedData with filteredCustomers initially and after search
  useEffect(() => {
    setSortedData(filteredCustomers);
  }, [filteredCustomers]);

  const handleNavigate = () => {
    navigate(`/${role}/add-customer`);
  };

  const handleDeleteClick = async (row) => {
    const confirmed = await DeleteConfirmAlert({
      title: "Are you sure you want to delete this customer?",
      text: "This action cannot be undone.",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "No, cancel",
    });

    if (confirmed) {
      dispatch(deleteCustomer(row._id || row.id));
    }
  };

  const handleRowClick = (row) => {
    const customerId = row._id || row.id;
    if (!customerId) {
      toast.error("Customer ID missing!");
      return;
    }
    navigate(`/${role}/edit-customer/${customerId}`, { state: row });
  };

  const stripTags = (html) =>
    html
      ?.replace(/<[^>]*>?/gm, "")
      .replace(/&nbsp;/g, " ")
      .trim() || "";

  // Custom sort handler for DataTable
  // Sorting handler
  const handleSort = (column, sortDirection) => {
    const sorted = [...filteredCustomers].sort((a, b) => {
      const aValue = column.selector ? column.selector(a) : "";
      const bValue = column.selector ? column.selector(b) : "";

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });

    setSortedData(sorted);
  };

  const handleDownloadReport = async () => {
    try {
      setIsDownloading(true);

      // ✅ Use sortedData so that search + sorting both are respected
      const exportData = sortedData.map((customer, index) => {
        const firstName = Array.isArray(customer.names)
          ? customer.names[0] || ""
          : "";
        const contactPersons = Array.isArray(customer.names)
          ? customer.names.slice(1).join(", ")
          : "";

        return {
          "S.No": index + 1,
          "Name of the Party": firstName,
          "Contact Person": contactPersons,
          "Contact No.": Array.isArray(customer.phones)
            ? customer.phones.join(", ")
            : customer.phones || "",
          "Email Id": Array.isArray(customer.emails)
            ? customer.emails.join(", ")
            : customer.emails || "",
          "Created By": customer.createdBy?.name || "",
          Address: customer.billTo ? stripTags(customer.billTo) : "",
          "GST No.": customer.gstNo || "",
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData);

      const columnWidths = Object.keys(exportData[0] || {}).map((key) => ({
        wch: Math.max(
          key.length,
          ...exportData.map((row) =>
            row[key] ? row[key].toString().length : 10,
          ),
        ),
      }));
      worksheet["!cols"] = columnWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Customer Report");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      });

      saveAs(blob, "Customer_Report.xlsx");
    } catch (error) {
      console.error("Failed to download report", error);
      toast.error("Failed to download report");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <PageCount>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 p-1 sm:p-0">
        <div className="flex items-center gap-3 flex-shrink-0">
          <BackButton />
          <Heading text="All Customers" />
        </div>

        <div className="flex flex-wrap flex-col sm:flex-row gap-3 w-full sm:w-auto items-end sm:items-center">
          {/* Search - Mobile full, Desktop fixed */}
          <input
            type="text"
            placeholder="Search by name or mobile or createdBy"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="px-3 py-[9px] w-full sm:w-[250px] text-sm rounded-md border focus:outline-none focus:ring-2 transition-all"
            style={{
              borderColor: "var(--pink-soft)",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              color: "var(--text-primary)",
              boxShadow: "0 2px 8px rgba(249, 168, 212, 0.1)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--purple-soft)";
              e.target.style.boxShadow = "0 0 0 3px rgba(165, 180, 252, 0.2)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--pink-soft)";
              e.target.style.boxShadow = "0 2px 8px rgba(249, 168, 212, 0.1)";
            }}
          />

          {/* Buttons - Mobile full width, same height */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <GradientButton
              onClick={handleDownloadReport}
              disabled={isDownloading}
              className="w-full sm:w-auto py-[9px] px-4 min-h-[38px]"
            >
              {isDownloading ? (
                <GradientLoader size={16} />
              ) : (
                "Download Reports"
              )}
            </GradientButton>

            <GradientButton
              onClick={handleNavigate}
              className="w-full sm:w-auto py-[9px] px-4 min-h-[38px]"
            >
              <Plus size={18} className="mr-1" />
              Add Customer
            </GradientButton>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12 min-h-[400px]">
          <GradientLoader size={40} />
        </div>
      ) : (
        <div className="my-5">
          <DataTable
            columns={getCustomerColumns(handleDeleteClick, role)}
            data={sortedData}
            onSort={handleSort}
            sortServer={true}
            onRowClicked={handleRowClick}
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

export default AllCustomers;
