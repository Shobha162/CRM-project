import React from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

import {
  addSupplier,
  fetchSuppliers,
} from "../../Redux/Supplier/supplierSlice";
import PageCount from "../../Common/PageCount";
import Heading from "../../Common/Heading";
import BackButton from "../../Common/fields/BackButton";
import GradientButton from "../../Common/GradientButton";

const AddSupplier = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const role = useSelector((state) => state.auth.role);

  const {
    handleSubmit,
    formState: { errors },
    control,
    register,
    reset,
  } = useForm({
    defaultValues: {
      names: [{ name: "" }],
      phones: [{ number: "" }],
      addresses: [{ address: "" }],
      gstNumber: "",
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
    fields: addressFields,
    append: appendAddress,
    remove: removeAddress,
  } = useFieldArray({ control, name: "addresses" });

  const onSubmit = async (data) => {
    const payload = {
      names: data.names.map((item) => item.name).filter(Boolean),
      phones: data.phones.map((item) => item.number).filter(Boolean),
      addresses: data.addresses
        .map((item) => ({ address: item.address }))
        .filter((a) => a.address.trim() !== "" && a.address !== "<p><br></p>"),
      gstNumber: data.gstNumber,
    };

    try {
      const res = await dispatch(addSupplier(payload));
      if (res.meta.requestStatus === "fulfilled") {
        toast.success("Supplier added successfully!");
        dispatch(fetchSuppliers());
        reset();
        navigate(`/${role}/suppliers`);
      } else {
        toast.error(res.payload || "Failed to add supplier");
      }
    } catch (err) {
      toast.error("Something went wrong.");
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

  const sectionStyle = { borderColor: "var(--pink-soft)" };
  const rowStyle = {
    backgroundColor: "rgba(255, 241, 242, 0.5)",
    border: "1px solid var(--pink-soft)",
  };
  const inputStyle = {
    border: "1px solid var(--pink-soft)",
    color: "var(--text-primary)",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  };
  const removeStyle = {
    backgroundColor: "var(--red-soft)",
    color: "var(--text-primary)",
    border: "1px solid var(--red-soft)",
  };

  return (
    <PageCount>
      <div className="flex items-center gap-3 mb-4">
        <BackButton />
        <Heading text="Add Supplier" />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {/* Names */}
        <div
          className="col-span-full border rounded-lg p-4"
          style={sectionStyle}
        >
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-lg font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Name of the Party
            </h2>
            <GradientButton
              type="button"
              onClick={() => appendName({ name: "" })}
              className="text-sm px-3 py-1"
            >
              + Add Name
            </GradientButton>
          </div>
          {nameFields.map((field, index) => (
            <div
              key={field.id}
              className="flex items-center gap-2 mb-2 p-2 rounded"
              style={rowStyle}
            >
              <input
                {...register(`names.${index}.name`)}
                placeholder={`Enter name ${index + 1}`}
                className="flex-1 px-3 py-2 rounded text-sm"
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => removeName(index)}
                className="font-bold text-xs px-2 py-1.5 rounded-full hover:scale-105 transition"
                style={removeStyle}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Phones */}
        <div
          className="col-span-full border rounded-lg p-4 mt-6"
          style={sectionStyle}
        >
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-lg font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Phone Numbers
            </h2>
            <GradientButton
              type="button"
              onClick={() => appendPhone({ number: "" })}
              className="text-sm px-3 py-1"
            >
              + Add Phone
            </GradientButton>
          </div>
          {phoneFields.map((field, index) => (
            <div
              key={field.id}
              className="flex items-center gap-2 mb-2 p-2 rounded"
              style={rowStyle}
            >
              <input
                {...register(`phones.${index}.number`)}
                placeholder={`Enter phone number ${index + 1}`}
                className="flex-1 px-3 py-2 rounded text-sm"
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => removePhone(index)}
                className="font-bold text-xs px-2 py-1.5 rounded-full hover:scale-105 transition"
                style={removeStyle}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* GST */}
        <div className="col-span-1">
          <label
            className="block font-semibold text-sm mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            GST Number
          </label>
          <input
            {...register("gstNumber")}
            type="text"
            placeholder="Enter GST Number"
            className="w-full px-3 py-2 rounded text-sm"
            style={inputStyle}
          />
        </div>

        {/* Addresses Array */}
        <div
          className="col-span-full border rounded-lg p-4 mt-6"
          style={sectionStyle}
        >
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-lg font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Addresses
            </h2>
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
              className="flex items-start gap-2 mb-2 p-2 rounded"
              style={rowStyle}
            >
              <div className="flex-1">
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
                      style={{
                        border: "1px solid var(--pink-soft)",
                        backgroundColor: "rgba(255,255,255,0.9)",
                      }}
                    />
                  )}
                />
              </div>
              <button
                type="button"
                onClick={() => removeAddress(index)}
                className="font-bold text-xs px-2 py-1.5 rounded-full hover:scale-105 transition mt-2"
                style={removeStyle}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="col-span-full">
          <GradientButton type="submit">Add Supplier</GradientButton>
        </div>
      </form>
    </PageCount>
  );
};

export default AddSupplier;
