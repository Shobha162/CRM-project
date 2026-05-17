import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@material-tailwind/react";
import { Plus, Hash, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { pdf } from "@react-pdf/renderer";

import PageCont from "../../Common/PageCont";
import Heading from "../../Common/Heading";
import BackButton from "../../Common/fields/BackButton";
import { tableStyle } from "../../Common/fields/tableStyle";
import InputField from "../../Common/fields/InputField";
import DataTable from "react-data-table-component";
import PurchaseOrderPDF from "./PurchaseOrderPDF";

import GradientButton from "../../Common/GradientButton";
import GradientLoader from "../../Common/GradientLoader";
import VoucherModal from "./VoucherModal";
import {
  FaFilePdf,
  FaFileExcel,
  FaTimesCircle,
  FaDownload,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";

import {
  getAllPurchaseOrders,
  getVoucherSettings,
  setVoucherSettings,
  deletePurchaseOrder,
} from "../../Redux/PurchaseOrder/purchaseOrderSlice";
import { getPdfFile } from "../../Redux/Performa/proformaSlice";
import DeleteConfirmAlert from "../../Common/DeleteConfirmAlert";

const AllPurchaseOrders = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const role = useSelector((state) => state.auth.role);
  const purchaseOrders = useSelector(
    (state) => state.purchaseOrder.allPurchaseOrders,
  );
  const products = useSelector((state) => state.productMaster.products);
  const loading = useSelector((state) => state.purchaseOrder.loading);
  const {
    control,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { fromDate: "", toDate: "" } });
  const fromDate = watch("fromDate");
  const toDate = watch("toDate");

  const [voucherModal, setVoucherModal] = useState(false);
  const [prefix, setPrefix] = useState("");
  const [startFrom, setStartFrom] = useState("");
  const [currentVoucherNo, setCurrentVoucherNo] = useState("");
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    dispatch(getAllPurchaseOrders());
  }, [dispatch]);

  const handleOpenVoucherModal = () => {
    setVoucherModal(true);
    setCurrentVoucherNo("Loading...");
    dispatch(getVoucherSettings())
      .then((res) => {
        const data = res.payload;
        if (data?.invoiceNo) {
          const [prefixPart, numberPart] = data.invoiceNo.split("-");
          setPrefix(prefixPart || "");
          setStartFrom(numberPart || "");
          setCurrentVoucherNo(data.invoiceNo);
        } else {
          setPrefix("");
          setStartFrom("");
          setCurrentVoucherNo("Not Set");
        }
      })
      .catch(() => {
        setCurrentVoucherNo("Error");
        setPrefix("");
        setStartFrom("");
      });
  };

  const handleVoucherUpdate = () => {
    const newSettings = {
      module: "purchase",
      prefix: prefix.trim(),
      startFrom: Number(startFrom),
    };
    dispatch(setVoucherSettings(newSettings)).then(() => {
      const newInvoiceNo = `${newSettings.prefix}-${newSettings.startFrom}`;
      setCurrentVoucherNo(newInvoiceNo);
      setVoucherModal(false);
    });
  };

  const filteredData = Array.isArray(purchaseOrders)
    ? purchaseOrders.filter((order) => {
        if (!searchText || searchText.trim() === "") return true;

        const lowerSearch = searchText.trim().toLowerCase();

        // ✅ SUPPLIER NAME SEARCH (already working)
        const supplierName = (order?.supplierId?.names || [])
          .join(" ")
          .toLowerCase()
          .trim();

        // ✅ SUPPLIER PHONE SEARCH (already working)
        const supplierPhone = (order?.supplierId?.phones || [])
          .join(" ")
          .toLowerCase()
          .trim();

        // ✅ PRODUCT DESCRIPTION SEARCH (already working)
        const productDescStr = (order.products || order.productIds || [])
          .map(
            (product) =>
              (
                product.description ||
                product.descriptions ||
                product.productName ||
                ""
              ).replace(/<[^>]*>/g, ""), // Strip HTML tags
          )
          .join(" ")
          .toLowerCase()
          .trim();

        return (
          supplierName.includes(lowerSearch) ||
          supplierPhone.includes(lowerSearch) ||
          productDescStr.includes(lowerSearch) // ✅ Products searchable
        );
      })
    : [];

  const dateFilteredData = filteredData.filter((row) => {
    if (!fromDate && !toDate) return true;
    const rowDate = new Date(row.date);
    const from = fromDate ? new Date(fromDate + "T00:00:00") : null;
    const to = toDate ? new Date(toDate + "T23:59:59.999") : null;
    if (from && to) return rowDate >= from && rowDate <= to;
    if (from && !to) return rowDate >= from;
    if (!from && to) return rowDate <= to;
    return true;
  });

  const calcColWidths = (rows, headers) => {
    const maxLens = headers.map((h) => h.length);
    rows.forEach((r) => {
      headers.forEach((h, i) => {
        const val = r[h] == null ? "" : String(r[h]);
        const len = val.length;
        if (len > maxLens[i]) maxLens[i] = len;
      });
    });
    return maxLens.map((l) => ({
      wch: Math.min(50, Math.max(10, Math.ceil(l + 2))),
    }));
  };

  const handleDownloadExcel = () => {
    // Intersection of date and search filtered data
    const finalFiltered = dateFilteredData.filter((row) =>
      filteredData.some((f) => f._id === row._id),
    );

    if (finalFiltered.length === 0) {
      return toast.error("No data available for selected filters.");
    }

    const dataToExport = finalFiltered.map((row) => ({
      "Supplier Name": Array.isArray(row.supplierId?.names)
        ? row.supplierId.names.join(", ")
        : row.supplierId?.names || "-",
      Contact: Array.isArray(row.supplierId?.phones)
        ? row.supplierId.phones.join(", ")
        : row.supplierId?.phones || "-",
      "Voucher No": row.voucherNo || "-",
      "Sales Person": row.salesPerson || "-",
      Date: new Date(row.date).toLocaleDateString("en-GB"),
    }));

    const headers = [
      "Supplier Name",
      "Contact",
      "Voucher No",
      "Sales Person",
      "Date",
    ];

    const worksheet = XLSX.utils.json_to_sheet(dataToExport, {
      header: headers,
    });
    worksheet["!cols"] = calcColWidths(dataToExport, headers);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase Orders");

    const filename =
      fromDate || toDate
        ? `PurchaseOrders_${fromDate || "start"}_to_${toDate || "end"}.xlsx`
        : "PurchaseOrders_All.xlsx";

    XLSX.writeFile(workbook, filename);
    toast.success("Excel downloaded");
  };

  const handleDelete = async (row) => {
    const confirmDelete = await DeleteConfirmAlert({
      title: "Are you sure?",
      text: `Delete Purchase Order for ${
        row.supplierId?.names?.join(", ") || "this supplier"
      }?`,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      icon: "warning",
    });

    if (!confirmDelete) return;

    try {
      await dispatch(deletePurchaseOrder(row._id)).unwrap();
      dispatch(getAllPurchaseOrders());
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleView = async (row) => {
    try {
      if (!row.pdfFile)
        return toast.error("No PDF file found for this purchase order");
      const res = await dispatch(getPdfFile(row.pdfFile)).unwrap();
      const blob = new Blob([res], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (error) {
      toast.error("Failed to view PDF. Please try again.");
    }
  };

  const handleDownload = async (row) => {
    try {
      if (!row.pdfFile)
        return toast.error("No PDF file found for this purchase order");
      const res = await dispatch(getPdfFile(row.pdfFile)).unwrap();
      const blob = new Blob([res], { type: "application/pdf" });

      const supplierName = row.supplierId?.names?.[0] || "Supplier";
      const voucherNo = row.voucherNo || "PO";
      const date = row.date
        ? new Date(row.date).toLocaleDateString("en-GB").replace(/\//g, "-")
        : "";
      const fileName = `${voucherNo}-${supplierName}-${date}.pdf`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Failed to download PDF. Please try again.");
    }
  };

  const columns = [
    {
      name: "Supplier Name",
      selector: (row) =>
        Array.isArray(row.supplierId?.names)
          ? row.supplierId.names.join(", ")
          : row.supplierId?.names || "-",
      sortable: true,
      wrap: true,
    },
    {
      name: "Voucher No",
      selector: (row) => row.voucherNo || "-",
      sortable: true,
    },
    {
      name: "Mode of Payment",
      selector: (row) => row.modeOfPayment || "-",
      sortable: true,
      wrap: true,
    },
    {
      name: "Date",
      selector: (row) =>
        row.date ? new Date(row.date).toLocaleDateString("en-GB") : "-",
      sortable: true,
    },
    {
      name: "Created Date",
      selector: (row) => new Date(row.createdAt).toLocaleDateString("en-GB"),
      sortable: true,
    },
    {
      name: "Created By",
      selector: (row) => row.createdBy?.name || "",
      sortable: true,
    },
    {
      name: "Actions",
      center: true,
      cell: (row) => (
        <div
          className="flex gap-2 items-center justify-center w-full whitespace-nowrap"
          style={{ minWidth: "320px" }}
        >
          {/* ✅ View Button */}
          <Button
            onClick={() => handleView(row)}
            className="flex items-center gap-2 text-white text-xs sm:text-sm px-3 py-2 font-semibold cursor-pointer hover:scale-105 transition-all"
            style={{
              background: "var(--gradient-primary)",
              border: "1px solid var(--purple-soft)",
              boxShadow: "0 2px 8px rgba(249, 168, 212, 0.3)",
            }}
          >
            <FaFilePdf size={14} /> View PDF
          </Button>

          {/* ✅ Download Button */}
          <Button
            onClick={() => handleDownload(row)}
            className="flex items-center gap-2 text-white text-xs sm:text-sm px-3 py-2 font-semibold cursor-pointer hover:scale-105 transition-all"
            style={{
              background: "linear-gradient(135deg, #0b57d0, #1a73e8)",
              border: "1px solid #4f94ef",
              boxShadow: "0 2px 8px rgba(11, 87, 208, 0.3)",
            }}
          >
            <FaDownload size={14} /> Download
          </Button>

          {/* Delete Button */}
          <Button
            onClick={() => handleDelete(row)}
            className="flex items-center gap-2 bg-red-500 text-white text-xs sm:text-sm px-3 py-2 font-semibold"
          >
            <Trash2 size={20} />
          </Button>
        </div>
      ),
      width: "320px",
      wrap: false,
      reorder: true,
    },
  ];

  const handleRowClicked = (row) => {
    console.log("row", row);
    console.log("row.productIds", row.productIds);
    console.log("row.products", row.products);
    const fullProducts = Array.isArray(row.productIds)
      ? row.productIds.map((prod) => {
          const product = products.find(
            (p) => p._id === prod._id || p.id === prod._id,
          );
          return {
            ...product,
            qty: prod.qty || 1,
            rate: prod.rate || product?.price || 0,
          };
        })
      : [];

    navigate(`/${role}/edit-purchase-order/${row._id}`, {
      state: {
        ...row,
        productIds: fullProducts,
      },
    });
  };

  return (
    <PageCont>
      <div className="flex flex-col gap-3 mb-3">
        {/* First Row: Heading + Search + Buttons */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-3 flex-shrink-0">
            <BackButton />
            <Heading text="All Purchase Orders" />
          </div>

          <div className="flex flex-wrap items-end lg:items-center gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search name, phone or product..."
              className="px-3 py-[9px] w-full sm:w-[200px] text-sm rounded-md border focus:outline-none focus:ring-2 transition-all"
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

            {/* Set Voucher No. Button */}
            <GradientButton
              onClick={handleOpenVoucherModal}
              className="w-full sm:w-auto py-[9px] px-4 min-h-[38px]"
            >
              <Hash size={18} className="mr-1" />
              Set Voucher No.
            </GradientButton>

            {/* Create Purchase Order Button */}
            <GradientButton
              onClick={() => navigate(`/${role}/create-purchase-order`)}
              className="w-full sm:w-auto py-[9px] px-4 min-h-[38px]"
            >
              <Plus size={18} className="mr-1" />
              Create Purchase Order
            </GradientButton>
          </div>
        </div>

        {/* Second Row: Date Range + Excel */}
        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3">
          <label className="text-sm font-medium whitespace-nowrap">From:</label>
          <div className="w-[120px] sm:w-[200px] flex-shrink-0">
            <InputField
              name="fromDate"
              label=""
              type="date"
              control={control}
              errors={errors}
            />
          </div>

          <label className="text-sm font-medium whitespace-nowrap">To:</label>
          <div className="w-[120px] sm:w-[200px] flex-shrink-0">
            <InputField
              name="toDate"
              label=""
              type="date"
              control={control}
              errors={errors}
            />
          </div>

          <GradientButton
            onClick={handleDownloadExcel}
            className="w-full sm:w-auto py-[9px] px-4 min-h-[38px]"
          >
            <FaFileExcel size={16} className="mr-1" /> Download Excel
          </GradientButton>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <GradientLoader size={40} />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={[...dateFilteredData].reverse()}
          customStyles={tableStyle}
          pagination
          highlightOnHover
          onRowClicked={handleRowClicked}
        />
      )}

      <VoucherModal
        open={voucherModal}
        onClose={() => setVoucherModal(false)}
        currentVoucherNo={currentVoucherNo}
        prefix={prefix}
        setPrefix={setPrefix}
        startFrom={startFrom}
        setStartFrom={setStartFrom}
        onSave={handleVoucherUpdate}
      />
      {/* <PurchaseOrderPDF /> */}
    </PageCont>
  );
};

export default AllPurchaseOrders;
