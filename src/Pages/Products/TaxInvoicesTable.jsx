// TaxInvoicesTable.jsx
import React, { useState, useMemo } from "react";
import DataTable from "react-data-table-component";
import { FiFileText, FiCalendar, FiDollarSign, FiEye } from "react-icons/fi";
import GradientLoader from "../../Common/GradientLoader";
import { tableStyle } from "../../Common/fields/tableStyle";

const TaxInvoicesTable = ({ invoices = [], productId, loading = false }) => {
  const [searchText, setSearchText] = useState("");

  // Search & Filter
  const filteredInvoices = useMemo(() => {
    if (!searchText) return invoices;

    const query = searchText.toLowerCase();
    return invoices.filter((invoice) => {
      // ✅ Safe customer name extraction for search
      const customerName =
        invoice.customer?.name ||
        invoice.customer?.customerName ||
        (typeof invoice.customer === "string" ? invoice.customer : "") ||
        invoice.customerName ||
        "";

      return (
        (invoice.invoiceNumber || "").toLowerCase().includes(query) ||
        customerName.toLowerCase().includes(query)
      );
    });
  }, [invoices, searchText]);

  const columns = [
    {
      name: "Customer Name",
      selector: (row) =>
        Array.isArray(row.customerId?.names)
          ? row.customerId.names.join(", ")
          : row.customerId?.names || "-",
      sortable: true,
      wrap: true,
    },
    {
      name: "Stock Used",
      selector: (row) => {
        const firstProduct = row.products?.[0];
        if (firstProduct?.stockUsed) {
          return firstProduct.stockUsed;
        }
        return row.qtyUsed || 0;
      },
      sortable: true,
    },
    {
      name: "tax Invoice Number",
      selector: (row) => row.invoiceNo || "-",
      sortable: true,
    },
    {
      name: "Mobile No",
      selector: (row) =>
        Array.isArray(row.customerId?.phones)
          ? row.customerId.phones.join(", ")
          : row.customerId?.phones || "-",
      sortable: true,
      wrap: true,
    },
    {
      name: "Sales Person",
      selector: (row) => row.salesPerson || "-",
      sortable: true,
      wrap: true,
    },
    {
      name: "Created Date",
      selector: (row) => new Date(row.createdAt).toLocaleDateString("en-GB"),
      sortable: true,
    },
  ];

  if (loading) {
    return (
      <div className="md:col-span-2">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8">
          <div className="flex justify-center py-12">
            <GradientLoader size={32} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="md:col-span-2">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-blue-100">
          <div className="p-2.5 bg-blue-100 rounded-xl">
            <FiFileText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Tax Invoices</h3>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full max-w-md px-4 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 transition-all"
            style={{
              borderColor: "var(--pink-soft)",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
            }}
          />
        </div>

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={filteredInvoices}
          customStyles={tableStyle}
          pagination
          paginationPerPage={5}
          paginationRowsPerPageOptions={[5, 10, 15]}
          highlightOnHover
          pointerOnHover
          noDataComponent={
            <div className="py-12 text-center">
              <FiFileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Invoices Found
              </h3>
              <p className="text-gray-500">
                {searchText
                  ? "No invoices match your search."
                  : "This product hasn't been used in any tax invoices yet."}
              </p>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default TaxInvoicesTable;
