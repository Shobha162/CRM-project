import React, { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import CircularProgress from "@mui/material/CircularProgress";

import {
  updateCustomer,
  getCustomerById,
} from "../../Redux/Customer/customerSlice";
import PageCount from "../../Common/PageCount";
import Heading from "../../Common/Heading";
import BackButton from "../../Common/fields/BackButton";
import InputField from "../../Common/fields/InputField";
import GradientButton from "../../Common/GradientButton";
import GradientLoader from "../../Common/GradientLoader";
import AllTaskCustomer from "./AllTasksCustomer";

const EditCustomer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading } = useSelector((state) => state.customerMaster);
  const role = useSelector((state) => state.auth.role);

  const [customerData, setCustomerData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(getCustomerById(id)).then((data) => {
      if (data) setCustomerData(data);
      else toast.error("Failed to fetch customer");
    });
  }, [id, dispatch]);

  const {
    handleSubmit,
    formState: { errors },
    control,
    register,
    reset,
  } = useForm({
    defaultValues: {
      _id: "",
      names: [{ name: "" }],
      phones: [{ number: "" }],
      emails: [{ email: "" }],
      addresses: [{ address: "" }],
      status: "",
      gstNo: "",
    },
  });

  useEffect(() => {
    if (customerData) {
      reset({
        _id: customerData._id || customerData.id,
        names: customerData.names?.map((n) => ({ name: n })) || [{ name: "" }],
        phones: customerData.phones?.map((p) => ({ number: p })) || [
          { number: "" },
        ],
        emails: customerData.emails?.map((e) => ({ email: e })) || [
          { email: "" },
        ],
        addresses: customerData.addresses?.length
          ? customerData.addresses.map((a) => ({ address: a.address || "" }))
          : [{ address: "" }],
        status: customerData.status || "",
        gstNo: customerData.gstNo || "",
      });
    }
  }, [customerData, reset]);

  const {
    fields: nameFields,
    append: appendName,
    remove: removeName,
  } = useFieldArray({ control, name: "names" });

  const {
    fields: phoneFields,
    append: appendPhone,
    remove: removePhone,
  } = useFieldArray({ control, name: "phones" });

  const {
    fields: emailFields,
    append: appendEmail,
    remove: removeEmail,
  } = useFieldArray({ control, name: "emails" });

  const {
    fields: addressFields,
    append: appendAddress,
    remove: removeAddress,
  } = useFieldArray({ control, name: "addresses" });

  const onSubmit = async (updatedData) => {
    const customerId = updatedData._id;
    if (!customerId) {
      toast.error("Customer ID is missing");
      return;
    }

    const payload = {
      names: updatedData.names.map((item) => item.name).filter(Boolean),
      phones: updatedData.phones.map((item) => item.number).filter(Boolean),
      emails: updatedData.emails.map((item) => item.email).filter(Boolean),
      addresses: updatedData.addresses
        .map((item) => ({ address: item.address }))
        .filter((a) => a.address.trim() !== ""),
      status: updatedData.status,
      gstNo: updatedData.gstNo,
    };

    try {
      setIsSubmitting(true);
      const res = await dispatch(updateCustomer({ id: customerId, payload }));
      if (!res.error) navigate(`/${role}/customers`);
    } catch (error) {
      toast.error("Failed to update customer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      [{ color: [] }, { background: [] }],
      ["clean"],
    ],
  };

  // ── Theme styles (App.css variables se) ──────────────────────
  const sectionStyle = {
    border: "1px solid var(--pink-soft)",
    borderRadius: "0.5rem",
    padding: "1rem",
  };

  const rowStyle = {
    backgroundColor: "rgba(5, 117, 97, 0.05)",
    border: "1px solid var(--pink-soft)",
    borderRadius: "0.375rem",
    padding: "0.5rem",
    marginBottom: "0.5rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  };

  const inputStyle = {
    border: "1px solid var(--pink-soft)",
    color: "var(--text-primary)",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: "0.5rem 0.75rem",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    flex: 1,
    outline: "none",
  };

  const removeStyle = {
    background: "var(--red-soft)",
    color: "#fff",
    border: "none",
    borderRadius: "9999px",
    padding: "0.25rem 0.5rem",
    fontSize: "0.75rem",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "transform 0.15s",
  };

  const sectionHeadingStyle = {
    color: "var(--text-primary)",
    fontSize: "1.125rem",
    fontWeight: "700",
  };

  const quillStyle = {
    border: "1px solid var(--pink-soft)",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: "0.375rem",
  };
  // ─────────────────────────────────────────────────────────────

  if (loading && !customerData) {
    return (
      <PageCount>
        <div className="flex justify-center py-10">
          <CircularProgress style={{ color: "var(--pink-soft)" }} />
        </div>
      </PageCount>
    );
  }

  if (!customerData) {
    return (
      <div className="flex justify-center h-screen">
        <GradientLoader size={30} />
      </div>
    );
  }

  return (
    <PageCount>
      <div className="flex items-center gap-3 mb-4">
        <BackButton />
        <Heading text="Edit Customer" />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {/* ── Names ── */}
        <div className="col-span-full" style={sectionStyle}>
          <div className="flex items-center justify-between mb-3">
            <h2 style={sectionHeadingStyle}>Name of the Party</h2>
            <GradientButton
              type="button"
              onClick={() => appendName({ name: "" })}
              className="text-sm px-3 py-1"
            >
              + Add Name
            </GradientButton>
          </div>
          {nameFields.map((field, index) => (
            <div key={field.id} style={rowStyle}>
              <input
                {...register(`names.${index}.name`)}
                placeholder={`Enter name ${index + 1}`}
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => removeName(index)}
                style={removeStyle}
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* ── Phones ── */}
        <div className="col-span-full mt-4" style={sectionStyle}>
          <div className="flex items-center justify-between mb-3">
            <h2 style={sectionHeadingStyle}>Phone Numbers</h2>
            <GradientButton
              type="button"
              onClick={() => appendPhone({ number: "" })}
              className="text-sm px-3 py-1"
            >
              + Add Phone
            </GradientButton>
          </div>
          {phoneFields.map((field, index) => (
            <div key={field.id} style={rowStyle}>
              <input
                {...register(`phones.${index}.number`)}
                placeholder={`Enter phone number ${index + 1}`}
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => removePhone(index)}
                style={removeStyle}
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* ── Emails ── */}
        <div className="col-span-full mt-4" style={sectionStyle}>
          <div className="flex items-center justify-between mb-3">
            <h2 style={sectionHeadingStyle}>Email Addresses</h2>
            <GradientButton
              type="button"
              onClick={() => appendEmail({ email: "" })}
              className="text-sm px-3 py-1"
            >
              + Add Email
            </GradientButton>
          </div>
          {emailFields.map((field, index) => (
            <div key={field.id} style={rowStyle}>
              <input
                {...register(`emails.${index}.email`)}
                placeholder={`Enter email ${index + 1}`}
                type="email"
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => removeEmail(index)}
                style={removeStyle}
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* ── Addresses ── */}
        <div className="col-span-full mt-4" style={sectionStyle}>
          <div className="flex items-center justify-between mb-3">
            <h2 style={sectionHeadingStyle}>Addresses</h2>
            <GradientButton
              type="button"
              onClick={() => appendAddress({ address: "" })}
              className="text-sm px-3 py-1"
            >
              + Add Address
            </GradientButton>
          </div>
          {addressFields.map((field, index) => (
            <div
              key={field.id}
              style={{ ...rowStyle, alignItems: "flex-start" }}
            >
              <div style={{ flex: 1 }}>
                <Controller
                  name={`addresses.${index}.address`}
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <ReactQuill
                      {...field}
                      theme="snow"
                      modules={quillModules}
                      placeholder={`Enter address ${index + 1}`}
                      style={quillStyle}
                    />
                  )}
                />
              </div>
              <button
                type="button"
                onClick={() => removeAddress(index)}
                style={{ ...removeStyle, marginTop: "0.5rem" }}
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* ── Source ── */}
        <InputField
          type="select"
          label="Source"
          name="status"
          placeholder="Select Source"
          control={control}
          errors={errors}
          mode="single"
          options={[
            { value: "Regular Client", label: "Regular Client" },
            { value: "Just Dial", label: "Just Dial" },
            { value: "IndiaMart", label: "IndiaMart" },
            { value: "Exhibition", label: "Exhibition" },
            { value: "Exporters India", label: "Exporters India" },
            { value: "Trade India", label: "Trade India" },
            { value: "Google", label: "Google" },
            { value: "Email", label: "Email" },
            { value: "Call", label: "Call" },
          ]}
        />

        {/* ── GST ── */}
        <InputField
          type="text"
          label="GST No."
          name="gstNo"
          placeholder="Enter GST Number"
          control={control}
          errors={errors}
        />

        {/* ── Submit ── */}
        <div className="col-span-full">
          <GradientButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <GradientLoader size={16} />
                Updating...
              </div>
            ) : (
              "Update Customer"
            )}
          </GradientButton>
        </div>
      </form>

      <AllTaskCustomer />
    </PageCount>
  );
};

export default EditCustomer;