import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuid } from "uuid";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { createProduct } from "../../Redux/Product/productSlice";
import ProductForm from "./ProductForm";
import PageCount from "../../Common/PageCount";
import Heading from "../../Common/Heading";
import BackButton from "../../Common/fields/BackButton";
import GradientLoader from "../../Common/GradientLoader";

export default function AddProduct() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const role = useSelector((s) => s.auth.role);

  const tempIDRef = useRef(uuid());
  const tempID = tempIDRef.current;

    const imageFileRef = useRef(null); 

  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (formData) => {
    // ✅ FIXED: formData.rate use karo (ProductForm payload mein 'rate' key bhejta hai)
    const payload = {
      description: formData.description,
      hsn_uom: formData.hsn,
      rate: Number(formData.rate) || 0,
      uom: formData.uom,
      currentStock: Number(formData.currentStock) || 0,
      taxPercentage: Number(formData.taxPercentage) || 0,
      image: imageFileRef.current, // file ref se lo
    };

    console.log("📦 AddProduct payload:", payload);

    setIsCreating(true);
    try {
      const result = await dispatch(createProduct(payload));
      if (result?.meta?.requestStatus === "fulfilled") {
        toast.success("Product created successfully!");
        navigate(`/${role}/products`);
      }
    } catch (err) {
      toast.error(err?.message || "Product creation failed");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <PageCount>
      <div className="flex items-center gap-3 mb-4">
        <BackButton />
        <Heading text="Add Product" />
      </div>

      <ProductForm
        defaultValues={{ id: tempID }}
        onSubmit={handleSubmit}
        isEdit={false}
        isLoading={isCreating}
        onImageSelect={(f) => { imageFileRef.current = f; }}
      />
    </PageCount>
  );
}