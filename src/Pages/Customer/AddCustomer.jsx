import React, { useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { addCustomer } from "../../Redux/Customer/customerSlice"
import PageCount from "../../Common/PageCount";
import Heading from "../../Common/Heading";
import BackButton from "../../Common/fields/BackButton";
import InputField from "../../Common/fields/InputField";
import GradientButton from "../../Common/GradientButton";
import GradientLoader from "../../Common/GradientLoader";

const AddCustomer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const role = useSelector((state) => state.auth.role);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    handleSubmit,
    formState: { errors },
    control,
    register,
  } = useForm({
    defaultValues: {
      names: [{ name: "" }],
      phones: [{ number: "" }],
      emails: [{ email: "" }],
      addresses: [{ address: "" }],
      status: "",
      gstNo: "",
    },
  });

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

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const payload = {
      names: data.names.map((item) => item.name).filter(Boolean),
      phones: data.phones.map((item) => item.number).filter(Boolean),
      emails: data.emails.map((item) => item.email).filter(Boolean),
      addresses: data.addresses
        .map((item) => ({ address: item.address }))
        .filter((a) => a.address.trim() !== ""),
      status: data.status,
      gstNo: data.gstNo,
    };

    try {
      await dispatch(addCustomer(payload));
      navigate(`/${role}/customers`);
    } catch (error) {
      console.error("Failed to add customer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // CSS variable based styles — index.css ke :root se match karte hain
  const sectionStyle = {
    border: "1px solid var(--pink-soft)",   // #057561 green border
    borderRadius: "0.5rem",
    padding: "1rem",
  };

  const rowStyle = {
    backgroundColor: "rgba(5, 117, 97, 0.06)",  // --pink-soft ka light tint
    border: "1px solid var(--pink-soft)",
    borderRadius: "0.375rem",
    padding: "0.5rem",
    marginBottom: "0.5rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  };

  const inputStyle = {
    flex: 1,
    padding: "0.5rem 0.75rem",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    border: "1px solid var(--pink-soft)",
    color: "var(--text-primary)",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    outline: "none",
  };

  const removeStyle = {
    backgroundColor: "rgba(151, 6, 203, 0.08)", // --red-soft ka light tint
    color: "var(--red-soft)",                    // #9706cb purple
    border: "1px solid var(--red-soft)",
    borderRadius: "9999px",
    padding: "0.25rem 0.5rem",
    fontSize: "0.75rem",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "transform 0.15s",
    flexShrink: 0,
  };

  const headingStyle = {
    fontSize: "1.125rem",
    fontWeight: "700",
    color: "var(--text-primary)",  // #1e293b dark text
  };

  return (
    <PageCount>
      <div className="flex items-center gap-3 mb-4">
        <BackButton />
        <Heading text="Add Customer" />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {/* Names */}
        <div className="col-span-full" style={sectionStyle}>
          <div className="flex items-center justify-between mb-3">
            <h2 style={headingStyle}>Name of the Party</h2>
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
                onMouseEnter={(e) => (e.target.style.transform = "scale(1.1)")}
                onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Phones */}
        <div className="col-span-full mt-6" style={sectionStyle}>
          <div className="flex items-center justify-between mb-3">
            <h2 style={headingStyle}>Phone Numbers</h2>
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
                onMouseEnter={(e) => (e.target.style.transform = "scale(1.1)")}
                onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Emails */}
        <div className="col-span-full mt-6" style={sectionStyle}>
          <div className="flex items-center justify-between mb-3">
            <h2 style={headingStyle}>Email Addresses</h2>
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
                style={inputStyle}
                type="email"
              />
              <button
                type="button"
                onClick={() => removeEmail(index)}
                style={removeStyle}
                onMouseEnter={(e) => (e.target.style.transform = "scale(1.1)")}
                onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Addresses */}
        <div className="col-span-full mt-6" style={sectionStyle}>
          <div className="flex items-center justify-between mb-3">
            <h2 style={headingStyle}>Addresses</h2>
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
              <Controller
                name={`addresses.${index}.address`}
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={3}
                    placeholder={`Enter address ${index + 1}`}
                    style={{ ...inputStyle, resize: "none" }}
                  />
                )}
              />
              <button
                type="button"
                onClick={() => removeAddress(index)}
                style={{ ...removeStyle, marginTop: "0.5rem" }}
                onMouseEnter={(e) => (e.target.style.transform = "scale(1.1)")}
                onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Source */}
        <InputField
          type="select"
          label="Source"
          name="status"
          mode="single"
          placeholder="Select Source"
          control={control}
          errors={errors}
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

        {/* GST */}
        <InputField
          type="text"
          label="GST No."
          name="gstNo"
          placeholder="Enter GST Number"
          control={control}
          errors={errors}
        />

        {/* Submit */}
        <div className="col-span-full">
          <GradientButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <GradientLoader size={16} />
                Adding...
              </div>
            ) : (
              "Add Customer"
            )}
          </GradientButton>
        </div>
      </form>
    </PageCount>
  );
};

export default AddCustomer;