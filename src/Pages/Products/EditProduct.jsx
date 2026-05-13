import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  getProductById,
  updateProduct,
  fetchProductImage,
} from "../../Redux/Product/productSlice";

import PageCount from "../../Common/PageCount";
import Heading from "../../Common/Heading";
import BackButton from "../../Common/fields/BackButton";
import ProductForm from "./ProductForm";
import GradientLoader from "../../Common/GradientLoader";

export default function EditProduct() {
  const { state } = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const role = useSelector((s) => s.auth.role);

  const [isUpdating, setIsUpdating] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [productData, setProductData] = useState(null); // ✅ Store API result

  const id = state?.id;

  useEffect(() => {
    const loadProduct = async () => {
      if (id) {
        setIsPageLoading(true);

        try {
          // 🔥 1. Get full product data (NO unwrap needed)
          const product = await dispatch(getProductById(id));

          // 🔥 2. Check if product loaded successfully
          if (product && product.id) {
            console.log("Product loaded:", product);
            setProductData({
              id: product.id,
              description: product.description || "",
              hsn: product.hsn || "",
              price: product.price || 0,
              uom: product.uom || "",
              currentStock: product.currentStock || 0,
              oldStock: product.oldStock || [], // ✅ oldStock included
              taxPercentage: product.taxPercentage || 0,
              imagePath: product.imagePath || null,
            });
          }

          // 🔥 3. Load image
          await dispatch(fetchProductImage(id));
        } catch (error) {
          console.error("Failed to load product:", error);
        } finally {
          setIsPageLoading(false);
        }
      }
    };

    loadProduct();
  }, [id, dispatch]);

  const handleSubmit = async (formData) => {
    console.log("📤 Update payload:", formData);
    setIsUpdating(true);
    try {
      const res = await dispatch(updateProduct({ id, data: formData }));

      if (res?.meta?.requestStatus === "fulfilled") {
        navigate(`/${role}/products`);
      }
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // ✅ Show loader until productData is ready
  if (isPageLoading || !productData?.id) {
    return (
      <PageCount>
        <div className="flex justify-center py-10">
          <GradientLoader size={30} />
        </div>
      </PageCount>
    );
  }

  return (
    <PageCount>
      <div className="flex items-center gap-3 mb-4">
        <BackButton />
        <Heading text="Edit Product" />
      </div>
      {/* ✅ Pass complete data with oldStock */}
      <ProductForm
        defaultValues={productData}
        onSubmit={handleSubmit}
        isEdit={true}
        isLoading={isUpdating}
      />
    </PageCount>
  );
}