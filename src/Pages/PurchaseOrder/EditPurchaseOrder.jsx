import React, { useEffect, useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import ReactQuill from "react-quill";
import PurchaseOrderPDF from "./PurchaseOrderPDF";
import { updatePurchaseOrder } from "../../Redux/PurchaseOrder/purchaseOrderSlice";
import PageCount from "../../Common/PageCount";
import Heading from "../../Common/Heading";
import BackButton from "../../Common/fields/BackButton";
import InputField from "../../Common/fields/InputField";
import GradientButton from "../../Common/GradientButton";
import GradientLoader from "../../Common/GradientLoader";
import NumericField from "../../Common/fields/NumericField";
import { quillModules, quillFormats } from "./CreatePurchaseOrder";
import { pdf } from "@react-pdf/renderer";
import { FiMapPin } from "react-icons/fi";
import { fetchProducts } from "../../Redux/Product/productSlice";
import { fetchSuppliers } from "../../Redux/Supplier/supplierSlice";

const stripTags = (html) => html?.replace(/<\/?[^>]+(>|$)/g, "") || "";

const EditPurchaseOrder = () => {
  const { id } = useParams();
  const location = useLocation();
  const purchaseOrderData = location.state;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const products = useSelector((state) => state.productMaster.products);
  const suppliers = useSelector((state) => state.supplierMaster.suppliers);
  const role = useSelector((state) => state.auth.role);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    register,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchSuppliers());
  }, [dispatch]);

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

  useEffect(() => {
    if (!purchaseOrderData || !suppliers?.length || !products?.length) return;

    const defaultProducts =
      purchaseOrderData.products?.map((p) => p.id?._id || p.id || p._id) || [];

    const defaultQtyRates = {};
    purchaseOrderData.products?.forEach((p) => {
      const productId = p.id?._id || p.id || p._id;
      defaultQtyRates[`qty_${productId}`] = p.qty || 1;
      defaultQtyRates[`rate_${productId}`] = p.rate || p.price || 0;
      defaultQtyRates[`desc_${productId}`] = p.description || "";
      defaultQtyRates[`tax_${productId}`] = p.taxPercentage || 0; // ✅ DB se populate
    });

    const supplierIdToUse =
      purchaseOrderData.supplierId?._id || purchaseOrderData.supplierId || "";

    reset({
      supplierId: supplierIdToUse,
      supplierName: purchaseOrderData.supplierId?.names?.[0] || "",
      supplierPhone: purchaseOrderData.supplierId?.phones?.[0] || "",
      supplierGstNumber:
        purchaseOrderData.gstNumber ||
        purchaseOrderData.supplierId?.gstNumber ||
        "",
      selectedProducts: defaultProducts,
      date: purchaseOrderData.date?.slice(0, 10) || "",
      paymentMethod: purchaseOrderData.modeOfPayment || "",
      salesPerson: purchaseOrderData.salesPerson || "",
      dispatchedThrough: purchaseOrderData.dispatchedThrough || "",
      shipTo:
        purchaseOrderData.supplier?.shipTo || purchaseOrderData.shipTo || "",
      billTo:
        purchaseOrderData.supplier?.billTo || purchaseOrderData.billTo || "",
      termsOfDelivery: purchaseOrderData.termsOfDelivery || "",
      voucherNo: purchaseOrderData.voucherNo || "",
      gstType: purchaseOrderData.gstType || "",
      selectedShipAddress: "",
      selectedBillAddress: "",
      ...defaultQtyRates,
    });
  }, [purchaseOrderData, suppliers, products, reset]);

  // Supplier change — sirf naam/phone update, addresses reset
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

    setValue("selectedShipAddress", "");
    setValue("selectedBillAddress", "");
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

  // ✅ Product rate + tax auto-fill (sirf naye products ke liye — existing already populated)
  useEffect(() => {
    if (!Array.isArray(selectedProducts) || selectedProducts.length === 0)
      return;

    const timeoutId = setTimeout(() => {
      selectedProducts.forEach((productId) => {
        const product = products.find(
          (p) => p._id === productId || p.id === productId,
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
      !data.dispatchedThrough ||
      !data.termsOfDelivery
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!id) {
      toast.error("Purchase order ID not found");
      return;
    }

    let paymentMethodToSubmit = data.paymentMethod;
    if (data.paymentMethod === "Manual") {
      if (!data.manualPayment || !data.manualPayment.trim()) {
        toast.error("Please enter manual payment method");
        return;
      }
      paymentMethodToSubmit = data.manualPayment.trim();
    }

    setIsSubmitting(true);

    try {
      const voucherNo = data.voucherNo || "";

      // ✅ taxPercentage included in fullProducts
      const fullProducts = data.selectedProducts.map((productId) => {
        const product = products.find(
          (p) => p._id === productId || p.id === productId,
        );
        if (!product) throw new Error(`Product not found for id: ${productId}`);
        return {
          ...product,
          description: data[`desc_${productId}`] || product?.description || "",
          qty: Number(data[`qty_${productId}`]) || 1,
          rate: Number(data[`rate_${productId}`]) || product?.price || 0,
          taxPercentage: Number(data[`tax_${productId}`]) || 0, // ✅
        };
      });

      const supplier = suppliers.find((s) => s._id === data.supplierId);
      if (!supplier) throw new Error("Supplier not found");

      const po = {
        date: data.date,
        paymentMethod: paymentMethodToSubmit,
        salesPerson: data.salesPerson,
        dispatchedThrough: data.dispatchedThrough,
        termsOfDelivery: data.termsOfDelivery,
        gstNumber: data.supplierGstNumber,
        gstType: data.gstType || "",
        supplier: {
          _id: supplier._id,
          name: supplier.names?.[0] || supplier.name || "",
          phone: supplier.phones?.[0] || supplier.phone || "",
          billTo: data.billTo || "",
          shipTo: data.shipTo || "",
        },
        products: fullProducts,
        voucherNo,
      };

      const blob = await pdf(<PurchaseOrderPDF pi={po} />).toBlob();
      const pdfFile = new File([blob], `purchase_order_${voucherNo}.pdf`, {
        type: "application/pdf",
      });

      const formData = new FormData();
      formData.append("supplierId", po.supplier._id);
      formData.append("date", po.date);
      formData.append("modeOfPayment", po.paymentMethod);
      formData.append("dispatchedThrough", po.dispatchedThrough);
      formData.append("destination", "abc");
      formData.append("termsOfDelivery", po.termsOfDelivery);
      formData.append("voucherNo", voucherNo);
      formData.append("shipTo", data.shipTo || "");
      formData.append("billTo", data.billTo || "");
      formData.append("supplier", JSON.stringify(po.supplier));
      formData.append("productIds", JSON.stringify(fullProducts)); // ✅ taxPercentage included
      formData.append("gstNumber", data.supplierGstNumber || "");
      formData.append("gstType", data.gstType || "");
      formData.append("pdfFile", pdfFile);

      await dispatch(updatePurchaseOrder({ id, formData })).unwrap();
      toast.success("Purchase Order updated successfully");
      navigate(`/${role}/purchase-order`);
    } catch (error) {
      console.error("PO update error:", error);
      toast.error(error.message || "Update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addressOptions =
    selectedSupplier?.addresses?.map((a) => ({
      value: a.address,
      label: a.address?.replace(/<[^>]*>?/gm, "").slice(0, 80) || "Address",
    })) || [];

  return (
    <PageCount>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <BackButton />
          <Heading text="Edit Purchase Order" />
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

        <InputField
          name="date"
          label="Date"
          type="date"
          control={control}
          errors={errors}
        />

        <InputField
          name="voucherNo"
          label="PO No"
          type="text"
          control={control}
          errors={errors}
          placeholder="Enter PO Number"
        />

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
                  render={({ field }) => (
                    <ReactQuill
                      {...field}
                      onChange={field.onChange}
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
                <label
                  className="block font-semibold text-sm mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  Ship To Address (Our Company)
                </label>
                <Controller
                  name="shipTo"
                  control={control}
                  render={({ field }) => (
                    <ReactQuill
                      {...field}
                      onChange={(val) => field.onChange(val)}
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
                  value: p._id || p.id,
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
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {selectedProducts.map((productId) => {
                  const product = products.find(
                    (p) => p._id === productId || p.id === productId,
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
                              {...field}
                              onChange={field.onChange}
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
                          defaultValue={product?.rate || product?.price || 0}
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
            render={({ field }) => (
              <div>
                <label
                  className="block font-semibold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Terms of Delivery
                </label>
                <ReactQuill
                  {...field}
                  onChange={(val) => field.onChange(val)}
                  theme="snow"
                  modules={quillModules}
                  formats={quillFormats}
                  className="rounded-md overflow-y-auto"
                  style={{
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

        <input type="hidden" {...register("voucherNo")} />

        <div className="col-span-full">
          <GradientButton
            type="submit"
            disabled={isSubmitting}
            className={isSubmitting ? "cursor-not-allowed opacity-70" : ""}
          >
            {isSubmitting ? (
              <div className="flex justify-center items-center gap-2">
                <GradientLoader size={20} /> Updating Purchase Order...
              </div>
            ) : (
              "Update Purchase Order"
            )}
          </GradientButton>
        </div>
      </form>
    </PageCount>
  );
};

export default EditPurchaseOrder;
