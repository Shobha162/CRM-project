import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import {
  fetchProducts,
  deleteProduct,
  fetchProductImage,
} from "../../Redux/Product/productSlice";
import { getProductColumns } from "./getProductColumns";

import PageCount from "../../Common/PageCount";
import Heading from "../../Common/Heading";
import BackButton from "../../Common/fields/BackButton";
import GradientButton from "../../Common/GradientButton";
import GradientLoader from "../../Common/GradientLoader";
import { tableStyle } from "../../Common/fields/tableStyle";
import DeleteConfirmAlert from "../../Common/DeleteConfirmAlert";

export default function AllProducts() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, images, loading } = useSelector((s) => s.productMaster);
  const role = useSelector((s) => s.auth.role);

  const [searchText, setSearchText] = useState("");

  // Track current page and rows per page
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Initial product fetch
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const filteredAndSortedProducts = useMemo(() => {
    const query = searchText.toLowerCase();

    return products
      .filter((product) => {
        const uom = product.uom?.toLowerCase() || "";
        const description = product.description
          ? product.description.replace(/<[^>]*>?/gm, "").toLowerCase()
          : "";
        return uom.includes(query) || description.includes(query);
      })
      .sort((a, b) => {
        const descA = a.description?.toLowerCase() || "";
        const descB = b.description?.toLowerCase() || "";
        return descA.localeCompare(descB);
      });
  }, [products, searchText]);

  // Calculate current page data slice for pagination
  const currentPageData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredAndSortedProducts.slice(startIndex, endIndex);
  }, [filteredAndSortedProducts, currentPage, rowsPerPage]);

  // Fetch images only for current page products
  useEffect(() => {
    currentPageData.forEach((product) => {
      if (product.id || product._id) {
        dispatch(fetchProductImage(product.id || product._id));
      }
    });
  }, [currentPageData, dispatch]);

  const handleDelete = async (row) => {
    const confirmed = await DeleteConfirmAlert({
      title: "Are you sure you want to delete this product?",
      text: "This action cannot be undone.",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "No, cancel",
    });

    if (confirmed) {
      dispatch(deleteProduct(row.id));
    }
  };

  return (
    <PageCount>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
        <div className="flex items-center gap-3 flex-shrink-0">
          <BackButton />
          <Heading text="All Products" />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-end sm:items-center">
          {/* Search - Mobile full width, Desktop fixed */}
          <input
            type="text"
            placeholder="Search products..."
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
              e.target.style.boxShadow =
                "0 0 0 3px rgba(165, 180, 252, 0.15), 0 1px 6px rgba(249, 168, 212, 0.08)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--pink-soft)";
              e.target.style.boxShadow = "0 1px 6px rgba(249, 168, 212, 0.08)";
            }}
          />

          {/* Add Button - Mobile full width */}
          <GradientButton
            onClick={() => navigate(`/${role}/add-product`)}
            className="w-full sm:w-auto py-[8px] px-4 min-h-[38px]"
          >
            <Plus size={18} className="mr-1" />
            Add Product
          </GradientButton>
        </div>
      </div>

      <DataTable
        columns={getProductColumns(handleDelete, images, role)}
        data={currentPageData}
        onRowClicked={(row) =>
          navigate(`/${role}/edit-product/${row.id}`, { state: row })
        }
        customStyles={tableStyle}
        progressPending={loading}
        progressComponent={
          <div className="flex justify-center py-5 min-h-[400px]">
            <GradientLoader size={40} />
          </div>
        }
        pagination
        paginationServer={true} // to control pagination on client side fully
        paginationTotalRows={filteredAndSortedProducts.length}
        paginationPerPage={rowsPerPage}
        paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 50]}
        onChangePage={(page) => setCurrentPage(page)}
        onChangeRowsPerPage={(newPerPage) => {
          setRowsPerPage(newPerPage);
          setCurrentPage(1); // reset page to 1 on per-page change
        }}
        highlightOnHover
        pointerOnHover
      />
    </PageCount>
  );
}
