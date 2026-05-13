import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import DataTable from "react-data-table-component";
import { useSelector, useDispatch } from "react-redux";
import GradientLoader from "../../Common/GradientLoader";

import PageCount from "../../Common/PageCount";
import Heading from "../../Common/Heading";
import BackButton from "../../Common/fields/BackButton";
import { tableStyle } from "../../Common/fields/tableStyle";
import GradientButton from "../../Common/GradientButton";
import DeleteConfirmAlert from "../../Common/DeleteConfirmAlert";

import {
  fetchSuppliers,
  deleteSupplier,
} from "../../Redux/Supplier/supplierSlice";

import { getSupplierColumns } from "./getSupplierColumns";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const AllSupplier = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { suppliers, loading } = useSelector((state) => state.supplierMaster);
  const role = useSelector((state) => state.auth.role);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    dispatch(fetchSuppliers());
  }, [dispatch]);

  const handleNavigate = () => {
    navigate(`/${role}/add-supplier`);
  };

  const handleDeleteClick = async (row) => {
    if (!row?._id) return;

    const confirmed = await DeleteConfirmAlert({
      title: "Are you sure you want to delete this supplier?",
      text: "This action cannot be undone.",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "No, cancel",
    });

    if (confirmed) {
      dispatch(deleteSupplier(row._id)).then((res) => {
        if (res.meta.requestStatus !== "fulfilled") {
          console.error("Failed to delete supplier:", res.payload);
        }
      });
    }
  };

  const handleRowClick = (row) => {
    if (!row?._id) return toast.error("Supplier ID missing!");
    navigate(`/${role}/edit-supplier/${row._id}`, { state: row });
  };

  const stripTags = (html) =>
    html?.replace(/<\/?[^>]+(>|$)/g, "").replace(/&nbsp;/g, " ") || "";

  const handleDownloadReport = () => {
    const exportData = suppliers.map(
      ({ names, phones, address, shipTo, billTo }) => ({
        "Name of the Party": names || "",
        "Phone No.": phones || "",
        Address: address || "",
        "Ship To": shipTo ? stripTags(shipTo) : "",
        "Bill To": billTo ? stripTags(billTo) : "",
      }),
    );

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    worksheet["!cols"] = [
      { wch: 25 },
      { wch: 15 },
      { wch: 40 },
      { wch: 40 },
      { wch: 40 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Suppliers");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(blob, "Supplier_Report.xlsx");
  };

  return (
    <PageCount>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
        <div className="flex flex-row items-center gap-3">
          <BackButton />
          <Heading text="All Suppliers" />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by name"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="px-3 py-[8px] w-full sm:w-[200px] text-sm rounded-md border focus:outline-none focus:ring-2 transition-all"
            style={{
              borderColor: "var(--pink-soft)",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              color: "var(--text-primary)",
              boxShadow: "0 1px 6px rgba(249, 168, 212, 0.08)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--purple-soft)";
              e.target.style.boxShadow = "0 0 0 3px rgba(165, 180, 252, 0.15)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--pink-soft)";
              e.target.style.boxShadow = "0 1px 6px rgba(249, 168, 212, 0.08)";
            }}
          />

          {/* {role === "superAdmin" && ( */}
          <GradientButton onClick={handleDownloadReport}>
            Download Reports
          </GradientButton>
          {/* )} */}

          <GradientButton onClick={handleNavigate}>
            <Plus size={18} />
            Add Supplier
          </GradientButton>
        </div>
      </div>

      <div className="my-5">
        <DataTable
          columns={getSupplierColumns(handleDeleteClick, role)}
          data={useMemo(() => {
            const query = searchText.toLowerCase();
            return [...suppliers]
              .filter(Boolean)
              .filter((supplier) => {
                const nameStr = Array.isArray(supplier.names)
                  ? supplier.names.join(" ").toLowerCase()
                  : "";
                return nameStr.includes(query);
              })
              .sort((a, b) => {
                const getTimestamp = (item) =>
                  item.createdAt
                    ? new Date(item.createdAt).getTime()
                    : parseInt(item._id?.toString().substring(0, 8), 16) * 1000;

                return getTimestamp(b) - getTimestamp(a);
              });
          }, [suppliers, searchText])}
          onRowClicked={handleRowClick}
          customStyles={tableStyle}
          pagination
          highlightOnHover
          responsive
          paginationPerPage={10}
          paginationRowsPerPageOptions={[5, 10, 15, 20]}
          progressPending={loading}
          progressComponent={
            <div className="flex justify-center py-5 min-h-[400px]">
              <GradientLoader size={40} />
            </div>
          }
        />
      </div>
    </PageCount>
  );
};

export default AllSupplier;
