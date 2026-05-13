import React, { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import CircularProgress from "@mui/material/CircularProgress";

import {
  getSupplierById,
  updateSupplier,
  fetchSuppliers,
} from "../../Redux/Supplier/supplierSlice";
import PageCount from "../../Common/PageCount";
import Heading from "../../Common/Heading";
import BackButton from "../../Common/fields/BackButton";
import GradientButton from "../../Common/GradientButton";

const EditSupplier = () => {
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const role = useSelector((state) => state.auth.role);
  const [supplierData, setSupplierData] = useState(null);

  useEffect(() => {
    if (state) {
      setSupplierData(state);
    } else {
      dispatch(getSupplierById(id))
        .unwrap()
        .then((data) => setSupplierData(data?.data || data))
        .catch(() => toast.error("Failed to fetch supplier"));
    }
  }, [state, dispatch, id]);

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
      addresses: [{ address: "" }],
      gstNumber: "",
    },
  });

  useEffect(() => {
    if (supplierData) {
      reset({
        _id: supplierData._id || supplierData.id,
        names: supplierData.names?.map((n) => ({ name: n })) || [{ name: "" }],
        phones: supplierData.phones?.map((p) => ({ number: p })) || [
          { number: "" },
        ],
        addresses: supplierData.addresses?.length
          ? supplierData.addresses.map((a) => ({ address: a.address || "" }))
          : [{ address: "" }],
        gstNumber: supplierData.gstNumber || "",
      });
    }
  }, [supplierData, reset]);

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

  const onSubmit = (data) => {
    const supplierId = data._id;
    if (!supplierId) return toast.error("Supplier ID is missing!");

    const payload = {
      names: data.names.map((n) => n.name).filter(Boolean),
      phones: data.phones.map((p) => p.number).filter(Boolean),
      addresses: data.addresses
        .map((item) => ({ address: item.address }))
        .filter((a) => a.address.trim() !== "" && a.address !== "<p><br></p>"),
      gstNumber: data.gstNumber,
    };

    dispatch(updateSupplier({ id: supplierId, data: payload })).then((res) => {
      if (!res.error) {
        toast.success("Supplier updated successfully!");
        dispatch(fetchSuppliers());
        navigate(`/${role}/suppliers`);
      } else {
        toast.error(res.payload || "Failed to update supplier");
      }
    });
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

  if (!supplierData) {
    return (
      <PageCount>
        <div className="flex justify-center py-10">
          <CircularProgress />
        </div>
      </PageCount>
    );
  }

  return (
    <PageCount>
      <div className="flex items-center gap-3 mb-4">
        <BackButton />
        <Heading text="Edit Supplier" />
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
          <div className="flex justify-between mb-2">
            <h2
              className="font-bold text-lg"
              style={{ color: "var(--text-primary)" }}
            >
              Names
            </h2>
            <GradientButton
              type="button"
              onClick={() => appendName({ name: "" })}
              className="text-sm"
            >
              + Add Name
            </GradientButton>
          </div>
          {nameFields.map((field, index) => (
            <div
              key={field.id}
              className="flex gap-2 mb-2 p-2 rounded"
              style={rowStyle}
            >
              <input
                {...register(`names.${index}.name`)}
                placeholder={`Name ${index + 1}`}
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
          className="col-span-full border rounded-lg p-4"
          style={sectionStyle}
        >
          <div className="flex justify-between mb-2">
            <h2
              className="font-bold text-lg"
              style={{ color: "var(--text-primary)" }}
            >
              Phone Numbers
            </h2>
            <GradientButton
              type="button"
              onClick={() => appendPhone({ number: "" })}
              className="text-sm"
            >
              + Add Phone
            </GradientButton>
          </div>
          {phoneFields.map((field, index) => (
            <div
              key={field.id}
              className="flex gap-2 mb-2 p-2 rounded"
              style={rowStyle}
            >
              <input
                {...register(`phones.${index}.number`)}
                placeholder={`Phone ${index + 1}`}
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
          className="col-span-full border rounded-lg p-4"
          style={sectionStyle}
        >
          <div className="flex justify-between mb-2">
            <h2
              className="font-bold text-lg"
              style={{ color: "var(--text-primary)" }}
            >
              Addresses
            </h2>
            <GradientButton
              type="button"
              onClick={() => appendAddress({ address: "" })}
              className="text-sm"
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
          <GradientButton type="submit">Update Supplier</GradientButton>
        </div>
      </form>
    </PageCount>
  );
};

export default EditSupplier;
