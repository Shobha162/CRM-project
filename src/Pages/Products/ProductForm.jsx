import React, { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { FiUpload, FiTrash, FiSave, FiPackage } from "react-icons/fi";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { toast } from "react-hot-toast";
import InputField from "../../Common/fields/InputField";
import GradientButton from "../../Common/GradientButton";
import GradientLoader from "../../Common/GradientLoader";
import TaxInvoicesTable from "./TaxInvoicesTable";
import {
  uploadProductImage,
  deleteProductImage,
  setLocalImage,
  deleteLocalImage,
  updateProductStock,
  getProductTaxInvoices,
} from "../../Redux/Product/productSlice";

const ProductForm = ({
  onSubmit,
  defaultValues = {},
  isEdit = false,
  isLoading = false,
  onImageSelect = null,
}) => {
  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({ defaultValues });

  const dispatch = useDispatch();
  const inputRef = useRef(null);

  const productId = defaultValues?.id || "temp";

  // Get image url from Redux
  const imageData = useSelector(
    (state) => state.productMaster.images?.[productId]
  );
  const image = imageData?.url || null;

  const existingCurrentStock = defaultValues?.currentStock || 0;
  const oldStockHistory = defaultValues?.oldStock || [];
  const currentStockValue = watch("currentStock");

  const [updatingStock, setUpdatingStock] = useState(false);
  const [taxInvoices, setTaxInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  const loadTaxInvoices = async () => {
    if (!productId || productId === "temp") return;
    setLoadingInvoices(true);
    try {
      const result = await dispatch(getProductTaxInvoices(productId));
      setTaxInvoices(result?.payload?.invoices || []);
    } catch (error) {
      console.error("Failed to load tax invoices:", error);
      toast.error("Failed to load tax invoices");
      setTaxInvoices([]);
    } finally {
      setLoadingInvoices(false);
    }
  };

  useEffect(() => {
    if (isEdit && productId && productId !== "temp") {
      loadTaxInvoices();
    }
  }, [isEdit, productId]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    if (isEdit) {
      dispatch(uploadProductImage({ id: productId, file }));
    } else {
      // ✅ FIXED: file mat bhejo — sirf url store karo
      dispatch(setLocalImage({ id: productId, url }));
      // ✅ Parent ko file do (AddProduct imageFileRef mein store karega)
      if (onImageSelect) onImageSelect(file);
    }
  };

  const handleImageDelete = () => {
    if (isEdit) {
      dispatch(deleteProductImage(productId));
    } else {
      dispatch(setLocalImage({ id: productId, url, file }));
      if (onImageSelect) onImageSelect(file);
    }
  };

  const handleStockUpdate = async () => {
    const newStock = Number(currentStockValue) || 0;
    if (newStock === existingCurrentStock) {
      toast.info("No stock change detected");
      return;
    }
    setUpdatingStock(true);
    try {
      // ✅ FIXED: object format { id, stock } — thunk yahi expect karta hai
     await dispatch(updateProductStock({ id: productId, stock: newStock }));
      toast.success(`Stock updated to ${newStock}! Page reloading...`, {
        duration: 2000,
      });
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      toast.error("Stock update failed");
    } finally {
      setUpdatingStock(false);
    }
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ align: [] }],
      [{ color: [] }, { background: [] }],
      ["link", "image", "video"],
      ["clean"],
    ],
  };

  const handleFormSubmit = async (formData) => {
    console.log("📤 Raw formData:", formData);

    const payload = {
      description: formData.description || "",
      hsn: formData.hsn || "",
      // ✅ FIXED: formData.price (form field naam "price" hai)
      rate: Number(formData.price) || 0,
      uom: formData.uom || "",
      currentStock: Number(formData.currentStock) || 0,
      taxPercentage: Number(formData.taxPercentage) || 0,
    };

    console.log("📤 Final JSON payload to thunk:", payload);

    try {
      await onSubmit(payload);
    } catch (error) {
      console.error("Form submission failed:", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      {/* 1. Image Upload */}
      <div
        className="col-span-full border p-4 rounded-lg"
        style={{
          backgroundColor: "rgba(255, 241, 242, 0.6)",
          borderColor: "var(--pink-soft)",
          boxShadow: "0 2px 8px rgba(249, 168, 212, 0.1)",
        }}
      >
        <label
          className="block text-sm font-medium mb-1"
          style={{ color: "var(--text-primary)" }}
        >
          Upload Image
        </label>
        <div className="flex items-center gap-4">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          <button
            type="button"
            onClick={() => inputRef.current.click()}
            className="px-4 py-2 rounded-md flex items-center gap-2 font-semibold text-white hover:scale-105 transition-all"
            style={{
              background: "var(--gradient-primary)",
              border: "1px solid var(--purple-soft)",
            }}
          >
            <FiUpload />
            {image ? "Change Image" : "Choose File"}
          </button>

          {image && (
            <button
              type="button"
              onClick={handleImageDelete}
              className="flex items-center gap-1 font-medium text-sm hover:scale-105 transition-all"
              style={{
                color: "var(--red-soft)",
                backgroundColor: "rgba(254, 202, 202, 0.2)",
                padding: "4px 8px",
                borderRadius: "6px",
                border: "1px solid var(--red-soft)",
              }}
            >
              <FiTrash /> Delete
            </button>
          )}
        </div>

        <div className="mt-4">
          {image ? (
            <img
              src={image}
              alt="Product"
              className="w-32 h-32 object-cover rounded-lg"
              style={{
                border: "2px solid var(--pink-soft)",
                boxShadow: "0 4px 12px rgba(249, 168, 212, 0.2)",
              }}
            />
          ) : (
            <p className="text-sm" style={{ color: "var(--pink-soft)" }}>
              No image found for this product.
            </p>
          )}
        </div>
      </div>

      {/* 2. Description - React Quill */}
      <div className="col-span-full">
        <label
          className="block text-sm font-medium mb-1"
          style={{ color: "var(--text-primary)" }}
        >
          Description
        </label>
        <Controller
          name="description"
          control={control}
          defaultValue={defaultValues?.description || ""}
          render={({ field }) => (
            <ReactQuill
              theme="snow"
              value={field.value}
              onChange={field.onChange}
              modules={quillModules}
              className="rounded-md"
              style={{
                border: "1px solid var(--pink-soft)",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
              }}
            />
          )}
        />
        {errors.description && (
          <p className="text-sm mt-1" style={{ color: "var(--red-soft)" }}>
            {errors.description.message}
          </p>
        )}
      </div>

      {/* 3. HSN, Rate, UOM, Tax */}
      <InputField
        name="hsn"
        label="HSN/UOM"
        type="text"
        control={control}
        errors={errors}
      />
      <InputField
        name="price"
        label="Rate"
        type="number"
        control={control}
        errors={errors}
      />

      <InputField
        name="uom"
        label="UOM"
        type="select"
        options={[
          { label: "Nos", value: "Nos" },
          { label: "Cubic Meter", value: "Cubic Meter" },
          { label: "Square Meter", value: "Square Meter" },
          { label: "Bag", value: "Bag" },
          { label: "Litre", value: "Litre" },
          { label: "Kg", value: "Kg" },
          { label: "Pcs", value: "Pcs" },
          { label: "Meter", value: "Meter" },
          { label: "Set", value: "Set" },
        ]}
        control={control}
        errors={errors}
      />

      <InputField
        name="taxPercentage"
        label="Tax Percentage (%)"
        type="number"
        control={control}
        errors={errors}
      />

      {/* 4. Current Stock */}
      <div className="md:col-span-2">
        <label
          className="block text-sm font-medium mb-1"
          style={{ color: "var(--text-primary)" }}
        >
          Current Stock
        </label>
        <Controller
          name="currentStock"
          control={control}
          defaultValue={existingCurrentStock}
          render={({ field }) => (
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <input
                  {...field}
                  type="number"
                  step="1"
                  min="0"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-200"
                  style={{
                    borderColor: "var(--pink-soft)",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                  }}
                />
              </div>
              {isEdit && (
                <GradientButton
                  type="button"
                  onClick={handleStockUpdate}
                  disabled={
                    updatingStock ||
                    Number(currentStockValue) === existingCurrentStock ||
                    currentStockValue === "" ||
                    currentStockValue === undefined
                  }
                  size="sm"
                >
                  {updatingStock ? (
                    <GradientLoader size={16} />
                  ) : (
                    <>
                      <FiPackage size={16} /> Update Stock
                    </>
                  )}
                </GradientButton>
              )}
            </div>
          )}
        />
      </div>

      {/* 5. Old Stock History */}
      {oldStockHistory.length > 0 && (
        <div className="md:col-span-2">
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Old Stock History ({oldStockHistory.length} changes)
          </label>
          <div className="max-h-60 overflow-y-auto bg-gray-50 p-4 rounded-lg border border-gray-200">
            {oldStockHistory
              .slice()
              .reverse()
              .map((stockEntry, index) => {
                const borderColor =
                  stockEntry.invoiceNo || stockEntry.invoiceId
                    ? "border-green-400"
                    : "border-blue-400";

                const stockInfo = stockEntry.from
                  ? `${stockEntry.from} → ${stockEntry.to}`
                  : `${stockEntry.stock} units`;

                const actionInfo = stockEntry.invoiceNo
                  ? `Invoice: ${stockEntry.invoiceNo}`
                  : `Manual`;

                return (
                  <div
                    key={stockEntry._id || index}
                    className={`text-xs bg-white p-3 mb-2 rounded-lg border-l-4 ${borderColor} flex justify-between items-start shadow-sm hover:shadow-md transition-all`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 truncate">
                        {stockInfo}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 truncate">
                        {actionInfo}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(
                          stockEntry.addedAt || stockEntry.date
                        ).toLocaleString("en-IN", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 6. Tax Invoices Table */}
      {isEdit && productId !== "temp" && (
        <TaxInvoicesTable
          invoices={taxInvoices}
          productId={productId}
          loading={loadingInvoices}
        />
      )}

      {/* 7. Submit Button */}
      <div className="col-span-full flex gap-3">
        <GradientButton type="submit" disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <GradientLoader size={20} />
              <span>Saving...</span>
            </div>
          ) : isEdit ? (
            <>
              <FiSave />
              Update Product
            </>
          ) : (
            <>
              <FiSave />
              Save Product
            </>
          )}
        </GradientButton>
      </div>
    </form>
  );
};

export default ProductForm;