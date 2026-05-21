import React, { useEffect, useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { pdf } from "@react-pdf/renderer";
import PurchaseOrderPDF from "./PurchaseOrderPDF";
import {
  createPurchaseOrder,
  incrementVoucher,
} from "../../Redux/PurchaseOrder/purchaseOrderSlice";
import PageCount from "../../Common/PageCount";
import Heading from "../../Common/Heading";
import BackButton from "../../Common/fields/BackButton";
import InputField from "../../Common/fields/InputField";
import GradientButton from "../../Common/GradientButton";
import GradientLoader from "../../Common/GradientLoader";
import NumericField from "../../Common/fields/NumericField";
import { fetchProducts } from "../../Redux/Product/productSlice";
import { fetchSuppliers } from "../../Redux/Supplier/supplierSlice";
import { FiMapPin } from "react-icons/fi";

export const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ color: [] }, { background: [] }],
    ["link", "image", "code-block"],
    ["clean"],
  ],
};

export const quillFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "color",
  "background",
  "link",
  "image",
  "code-block",
];

const stripTags = (html) => html?.replace(/<\/?[^>]+(>|$)/g, "") || "";

// ✅ HTML entities bhi decode karta hai — &nbsp; &amp; etc.
const decodeHtml = (html) => {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, "")   // HTML tags hata do
    .replace(/&nbsp;/g, " ")   // non-breaking space → normal space
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")      // multiple spaces → single space
    .trim();
};

const CreatePurchaseOrder = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const role = useSelector((state) => state.auth.role);
  const products = useSelector((state) => state.productMaster.products);
  const suppliers = useSelector((state) => state.supplierMaster.suppliers);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchSuppliers());
  }, [dispatch]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      selectedProducts: [],
      supplierId: "",
      supplierName: "",
      supplierPhone: "",
      supplierGstNumber: "",
      date: new Date().toISOString().split("T")[0],
      paymentMethod: "",
      salesPerson: "",
      dispatchedThrough: "",
      termsOfDelivery: "",
      gstType: "",
      shipTo: "",
      billTo: "",
      selectedShipAddress: "",
      selectedBillAddress: "",
    },
  });

  const selectedSupplierId = useWatch({ control, name: "supplierId" });
  const selectedSupplier = suppliers.find((s) => s._id === selectedSupplierId);
  const selectedProducts = useWatch({ control, name: "selectedProducts" });
  const selectedPaymentMethod = watch("paymentMethod");
  const selectedShipAddress = useWatch({
    control,
    name: "selectedShipAddress",
  });
  const selectedBillAddress = useWatch({
    control,
    name: "selectedBillAddress",
  });

  // Default ship to — sirf ek baar set karo (getValues use karo, watch nahi)
  useEffect(() => {
    const defaultShipTo = `<p><strong>Crystal Ion Engineers</strong></p>
<p>Plot No.-138</p>
<p>Sector-3</p>
<p>Ballabhgarh, Faridabad</p>
<p>Haryana</p>
<p>GSTIN/UIN : 06AAHPJ5618GIZT</p>
<p>India - 121004</p>`;

    const current = control._getWatch("shipTo");
    if (!current || current.trim() === "" || current === "<p><br></p>") {
      setValue("shipTo", defaultShipTo);
    }
  }, []); // ✅ sirf mount pe ek baar

  // Supplier change — autofill name, phone, gst, reset address dropdowns
  useEffect(() => {
    if (!selectedSupplier) return;

    if (
      Array.isArray(selectedSupplier.names) &&
      selectedSupplier.names.length > 0
    ) {
      setValue(
        "supplierName",
        selectedSupplier.names.length > 1
          ? selectedSupplier.names[1]
          : selectedSupplier.names[0],
      );
    }

    if (
      Array.isArray(selectedSupplier.phones) &&
      selectedSupplier.phones.length > 0
    ) {
      setValue(
        "supplierPhone",
        selectedSupplier.phones.length > 1
          ? selectedSupplier.phones[1]
          : selectedSupplier.phones[0],
      );
    }

    if (selectedSupplier.gstNumber) {
      setValue("supplierGstNumber", selectedSupplier.gstNumber);
    } else if (
      Array.isArray(selectedSupplier.gstNumbers) &&
      selectedSupplier.gstNumbers.length > 0
    ) {
      setValue(
        "supplierGstNumber",
        selectedSupplier.gstNumbers.length > 1
          ? selectedSupplier.gstNumbers[1]
          : selectedSupplier.gstNumbers[0],
      );
    }

    setValue("selectedShipAddress", "");
    setValue("selectedBillAddress", "");
    setValue("billTo", "");
  }, [selectedSupplier, setValue]);

  // Ship address dropdown → fill Quill
  useEffect(() => {
    if (!selectedShipAddress) return;
    setValue("shipTo", selectedShipAddress);
  }, [selectedShipAddress, setValue]);

  // Bill address dropdown → fill Quill
  useEffect(() => {
    if (!selectedBillAddress) return;
    setValue("billTo", selectedBillAddress);
  }, [selectedBillAddress, setValue]);

  // ✅ Product rate + tax auto-fill (sirf agar field empty ho)
  useEffect(() => {
    if (!Array.isArray(selectedProducts) || selectedProducts.length === 0)
      return;

    const timeoutId = setTimeout(() => {
      selectedProducts.forEach((productId) => {
        const product = products.find(
          (p) => p.id === productId || p._id === productId,
        );
        if (product) {
          const currentRate = watch(`rate_${productId}`);
          if (
            currentRate === undefined ||
            currentRate === null ||
            currentRate === ""
          ) {
            setValue(`rate_${productId}`, product.price || 0, {
              shouldValidate: false,
              shouldDirty: true,
              shouldTouch: false,
            });
          }

          // ✅ Tax auto-fill
          const currentTax = watch(`tax_${productId}`);
          if (
            currentTax === undefined ||
            currentTax === null ||
            currentTax === ""
          ) {
            setValue(`tax_${productId}`, product.taxPercentage || 0, {
              shouldValidate: false,
              shouldDirty: true,
              shouldTouch: false,
            });
          }
        }
      });
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [selectedProducts, products, setValue, watch]);

  const onSubmit = async (data) => {
    if (
      !data.supplierId ||
      !data.selectedProducts?.length ||
      !data.date ||
      !data.paymentMethod ||
      !data.gstType ||
      !data.dispatchedThrough ||
      !data.termsOfDelivery
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    let paymentMethodToSubmit = data.paymentMethod;
    if (paymentMethodToSubmit === "Manual") {
      if (!data.manualPayment || !data.manualPayment.trim()) {
        toast.error("Please enter manual payment method");
        return;
      }
      paymentMethodToSubmit = data.manualPayment.trim();
    }

    try {
      setIsSubmitting(true);

      const voucherResponse = await dispatch(incrementVoucher()).unwrap();
      const voucherNo = voucherResponse?.currentNumber
        ? `${voucherResponse.currentNumber.prefix}-${voucherResponse.currentNumber.currentNumber}`
        : "INV-ERROR";
      const voucherId = voucherResponse?.voucherId || "";

      const supplier = suppliers.find((s) => s._id === data.supplierId);

      // ✅ taxPercentage included in fullProducts
      const fullProducts = data.selectedProducts.map((productId) => {
        const product = products.find(
          (p) => p.id === productId || p._id === productId,
        );
        return {
          ...product,
          description: data[`desc_${productId}`] || product?.description || "",
          qty: Number(data[`qty_${productId}`]) || 1,
          rate: Number(data[`rate_${productId}`]) || product?.price || 0,
          taxPercentage: Number(data[`tax_${productId}`]) || 0, // ✅
        };
      });

      const pi = {
        voucherNo,
        date: data.date,
        paymentMethod: paymentMethodToSubmit,
        gstType: data.gstType,
        dispatchedThrough: data.dispatchedThrough,
        termsOfDelivery: data.termsOfDelivery,
        gstNumber: data.supplierGstNumber,
        supplier: {
          _id: supplier._id,
          name: supplier.name,
          phone: supplier.phone,
          billTo: data.billTo,
          shipTo: data.shipTo,
        },
        products: fullProducts,
        billTo: data.billTo,
      };

      const blob = await pdf(<PurchaseOrderPDF pi={pi} />).toBlob();
      const pdfFile = new File([blob], `${voucherNo}.pdf`, {
        type: "application/pdf",
      });

      const formData = new FormData();
      formData.append("supplierId", pi.supplier._id);
      formData.append("voucherNo", voucherNo);
      formData.append("voucherId", voucherId);
      formData.append("date", pi.date);
      formData.append("modeOfPayment", pi.paymentMethod);
      formData.append("gstType", pi.gstType);
      formData.append("dispatchedThrough", pi.dispatchedThrough);
      formData.append("destination", "abc");
      formData.append("termsOfDelivery", pi.termsOfDelivery);
      formData.append("supplier", JSON.stringify(pi.supplier));
      formData.append("productIds", JSON.stringify(fullProducts)); // ✅ taxPercentage included
      formData.append("shipTo", data.shipTo || "");
      formData.append("billTo", data.billTo || "");
      formData.append("gstNumber", data.supplierGstNumber || "");
      formData.append("pdfFile", pdfFile);

      for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      await dispatch(createPurchaseOrder(formData)).unwrap();
      navigate(`/${role}/purchase-order`);
    } catch (error) {
      console.error("PO creation error:", error);
      toast.error(error.message || "Failed to create Purchase Order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addressOptions =
    selectedSupplier?.addresses?.map((a) => ({
      value: a.address,
      label: decodeHtml(a.address).slice(0, 80) || "Address",
    })) || [];

  return (
    <PageCount>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <BackButton />
          <Heading text="Create Purchase Order" />
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <InputField
          name="supplierId"
          label="Select Supplier"
          type="select"
          mode="single"
          control={control}
          errors={errors}
          options={suppliers.map((s) => ({
            value: s._id,
            label: s.names?.join(", ") || "Unnamed",
          }))}
        />

        {Array.isArray(selectedSupplier?.names) &&
          selectedSupplier.names.length > 0 && (
            <InputField
              name="supplierName"
              label="Select Name"
              type="select"
              mode="single"
              control={control}
              errors={errors}
              options={selectedSupplier.names.map((name) => ({
                value: name,
                label: name,
              }))}
            />
          )}

        {Array.isArray(selectedSupplier?.phones) &&
          selectedSupplier.phones.length > 0 && (
            <InputField
              name="supplierPhone"
              label="Select Phone"
              type="select"
              mode="single"
              control={control}
              errors={errors}
              options={selectedSupplier.phones.map((phone) => ({
                value: phone,
                label: phone,
              }))}
            />
          )}

        {(selectedSupplier?.gstNumber ||
          (Array.isArray(selectedSupplier?.gstNumbers) &&
            selectedSupplier.gstNumbers.length > 0)) && (
          <InputField
            name="supplierGstNumber"
            label="GST Number"
            type="text"
            control={control}
            errors={errors}
          />
        )}

        {/* Address Card */}
        {selectedSupplier && (
          <div
            className="col-span-full border rounded-xl p-5"
            style={{
              borderColor: "var(--pink-soft)",
              backgroundColor: "rgba(255,241,242,0.2)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "var(--gradient-primary)" }}
              >
                <FiMapPin className="text-white" size={16} />
              </div>
              <h3
                className="font-bold text-base"
                style={{ color: "var(--text-primary)" }}
              >
                Shipping & Supplier Address
              </h3>
            </div>

            {addressOptions.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-wide mb-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Bill From (Supplier Address){" "}
                    <span style={{ color: "var(--red-soft)" }}>*</span>
                  </label>
                  <InputField
                    name="selectedBillAddress"
                    type="select"
                    mode="single"
                    control={control}
                    errors={errors}
                    options={addressOptions}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className="block font-semibold text-sm mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  Bill To Address (Supplier)
                </label>
                <Controller
                  name="billTo"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <ReactQuill
                      value={field.value || ""}
                      onChange={(val) => field.onChange(val)}
                      onBlur={field.onBlur}
                      theme="snow"
                      modules={quillModules}
                      formats={quillFormats}
                      className="rounded-md overflow-y-auto"
                      style={{
                        minHeight: "140px",
                        maxHeight: "260px",
                        border: "1px solid var(--pink-soft)",
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        borderRadius: "8px",
                      }}
                    />
                  )}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label
                    className="block font-semibold text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Ship To Address (Our Company)
                  </label>
                  {/* ✅ Reset to default button */}
                  <button
                    type="button"
                    onClick={() =>
                      setValue(
                        "shipTo",
                        `<p><strong>Crystal Ion Engineers</strong></p><p>Plot No.-138</p><p>Sector-3</p><p>Ballabhgarh, Faridabad</p><p>Haryana</p><p>GSTIN/UIN : 06AAHPJ5618GIZT</p><p>India - 121004</p>`,
                      )
                    }
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      color: "var(--text-secondary)",
                      border: "1px solid var(--pink-soft)",
                      backgroundColor: "transparent",
                      cursor: "pointer",
                    }}
                  >
                    ↺ Reset Default
                  </button>
                </div>
                <Controller
                  name="shipTo"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <ReactQuill
                      value={field.value || ""}
                      onChange={(val) => field.onChange(val)}
                      onBlur={field.onBlur}
                      theme="snow"
                      modules={quillModules}
                      formats={quillFormats}
                      className="rounded-md overflow-y-auto"
                      style={{
                        minHeight: "140px",
                        maxHeight: "260px",
                        border: "1px solid var(--pink-soft)",
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        borderRadius: "8px",
                      }}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        )}

        {/* Date */}
        <InputField
          name="date"
          label="Date"
          type="date"
          control={control}
          errors={errors}
        />

        {/* Products */}
        <div className="col-span-full">
          <label
            className="block font-semibold text-sm mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            Product(s), Quantity
          </label>

          <div
            className="rounded-md p-4 shadow-sm space-y-4"
            style={{
              border: "1px solid var(--pink-soft)",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
            }}
          >
            <div className="w-full">
              <InputField
                name="selectedProducts"
                label="Product Description"
                type="select"
                mode="multiple"
                control={control}
                errors={errors}
                options={products.map((p) => ({
                  value: p.id,
                  label: stripTags(p.description),
                }))}
              />
            </div>

            {/* ✅ Header row — Tax % column added */}
            {Array.isArray(selectedProducts) && selectedProducts.length > 0 && (
              <div
                className="hidden md:grid grid-cols-12 gap-2 text-sm font-semibold px-1"
                style={{ color: "var(--text-primary)" }}
              >
                <div className="col-span-5">Product</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-2">Rate</div>
                <div className="col-span-2">Tax %</div>
              </div>
            )}

            {Array.isArray(selectedProducts) && selectedProducts.length > 0 ? (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {selectedProducts.map((productId) => {
                  const product = products.find(
                    (p) => p.id === productId || p._id === productId,
                  );

                  return (
                    <div
                      key={productId}
                      className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-3 rounded"
                      style={{
                        backgroundColor: "rgba(255, 241, 242, 0.5)",
                        border: "1px solid var(--pink-soft)",
                      }}
                    >
                      {/* ✅ col-span-8 → col-span-5 */}
                      <div className="md:col-span-5">
                        <Controller
                          name={`desc_${productId}`}
                          control={control}
                          defaultValue={product?.description || ""}
                          render={({ field }) => (
                            <ReactQuill
                              value={field.value || ""}
                              onChange={(val) => field.onChange(val)}
                              onBlur={field.onBlur}
                              theme="snow"
                              modules={quillModules}
                              formats={quillFormats}
                              className="rounded-sm overflow-y-auto"
                              style={{
                                minHeight: "80px",
                                maxHeight: "150px",
                                border: "1px solid var(--pink-soft)",
                                backgroundColor: "rgba(255, 255, 255, 0.95)",
                              }}
                            />
                          )}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <NumericField
                          name={`qty_${productId}`}
                          placeholder="Qty"
                          control={control}
                          errors={errors}
                          defaultValue={1}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <NumericField
                          name={`rate_${productId}`}
                          placeholder="Rate"
                          control={control}
                          errors={errors}
                          defaultValue={product?.price || 0}
                        />
                      </div>

                      {/* ✅ Tax % field */}
                      <div className="md:col-span-2">
                        <NumericField
                          name={`tax_${productId}`}
                          placeholder="Tax %"
                          control={control}
                          errors={errors}
                          defaultValue={product?.taxPercentage || 0}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm" style={{ color: "var(--pink-soft)" }}>
                Select products to set quantity
              </p>
            )}
          </div>
        </div>

        <InputField
          name="paymentMethod"
          label="Mode/Terms of Payment"
          type="select"
          mode="single"
          control={control}
          errors={errors}
          options={[
            { value: "Advance", label: "Advance" },
            { value: "NEFT", label: "NEFT" },
            { value: "RTGS", label: "RTGS" },
            { value: "UPI", label: "UPI" },
            { value: "Free of Cost", label: "Free of Cost" },
            { value: "Manual", label: "Manual (Enter below)" },
          ]}
        />

        {selectedPaymentMethod === "Manual" && (
          <InputField
            name="manualPayment"
            label="Enter Manual Payment Method"
            type="text"
            control={control}
            errors={errors}
          />
        )}

        <InputField
          name="dispatchedThrough"
          label="Dispatched Through"
          type="text"
          control={control}
          errors={errors}
        />

        <InputField
          name="gstType"
          label="GST Type"
          type="select"
          mode="single"
          control={control}
          errors={errors}
          options={[
            { value: "inter", label: "Inter-state (IGST)" },
            { value: "intra", label: "Intra-state (CGST + SGST)" },
          ]}
        />

        <div className="col-span-full">
          <Controller
            name="termsOfDelivery"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <div>
                <label
                  className="block font-semibold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Terms of Delivery
                </label>
                <ReactQuill
                  value={field.value || ""}
                  onChange={(val) => field.onChange(val)}
                  onBlur={field.onBlur}
                  theme="snow"
                  modules={quillModules}
                  formats={quillFormats}
                  className="rounded-md overflow-y-auto"
                  style={{
                    minHeight: "120px",
                    maxHeight: "300px",
                    border: "1px solid var(--pink-soft)",
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                  }}
                />
                {errors.termsOfDelivery && (
                  <p
                    className="text-sm mt-1"
                    style={{ color: "var(--red-soft)" }}
                  >
                    {errors.termsOfDelivery.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>

        <div className="col-span-full">
          <GradientButton
            type="submit"
            disabled={isSubmitting}
            className={isSubmitting ? "cursor-not-allowed opacity-70" : ""}
          >
            {isSubmitting ? (
              <div className="flex justify-center items-center gap-2">
                <GradientLoader size={20} /> Creating Purchase Order...
              </div>
            ) : (
              "Create Purchase Order"
            )}
          </GradientButton>
        </div>
      </form>
    </PageCount>
  );
};

export default CreatePurchaseOrder;