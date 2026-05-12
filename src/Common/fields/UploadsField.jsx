import React, { useState } from "react";
import { Dialog, DialogBody, DialogHeader } from "@material-tailwind/react";
import { Upload as AntUpload, Button, message } from "antd";
import { FiTrash2, FiUpload } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import { Controller } from "react-hook-form";
import { GoUpload } from "react-icons/go";

import "./styles/UploadsStyles.css";

const { Dragger } = AntUpload;

const UploadsField = ({
  control,
  errors,
  placeholder = "",
  className = "",
  label = "",
  parentClass = "",
  name = "",
  labelClass = "",
  disabled = "",
  modalLabel = "",
  modalHeadClass = "",
  modalClass = "",
  modalBodyClass = "",
  modalLabelClass = "",
  max = 1,
}) => {
  const [fileList, setFileList] = useState([]);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleShowModal = () => {
    setShowModal(!showModal);
  };

  const handleDeleteFile = (file) => {
    const updatedFileList = fileList.filter((f) => f.uid !== file.uid);
    setFileList(updatedFileList);
    setError("");
  };

  return (
    <>
      <div className={`flex flex-col w-full gap-2 ${parentClass}`}>
        {label && (
          <label
            htmlFor={name}
            className={`font-medium ml-0.5 ${labelClass}`}
            style={{ color: "var(--text-primary)" }}
          >
            {label}
          </label>
        )}
        <div
          className={`flex items-center border relative w-full py-2 border-solid overflow-hidden rounded-sm transition-all ${disabled ? "cursor-not-allowed" : "cursor-pointer hover:shadow-md"}`}
          style={{
            borderColor: "var(--pink-soft)",
            backgroundColor: disabled
              ? "rgba(255, 241, 242, 0.5)"
              : "rgba(255, 255, 255, 0.9)",
            boxShadow: "0 1px 6px rgba(249, 168, 212, 0.08)",
          }}
          onClick={disabled ? () => {} : handleShowModal}
        >
          <h2
            className={`w-full px-2.5 text-sm font-poppins not-italic leading-normal font-medium bg-transparent outline-none border-none ${className}`}
            style={{ color: "var(--text-primary)" }}
          >
            {fileList.length > 0
              ? `Selected Files: ${fileList.length}`
              : placeholder}
          </h2>
          <GoUpload
            size={"18px"}
            style={{
              color: "var(--pink-soft)",
              marginRight: "12px",
            }}
          />
        </div>
        {errors[name] && (
          <p style={{ color: "var(--red-soft)" }}>{errors[name]?.message}</p>
        )}
      </div>

      <Dialog
        open={showModal}
        handler={handleShowModal}
        className={`overflow-hidden rounded-xl w-full scroll-remove max-w-lg ${modalClass}`}
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          border: "1px solid var(--pink-soft)",
          boxShadow: "0 20px 40px rgba(249, 168, 212, 0.2)",
        }}
      >
        <DialogHeader
          className={`rounded-t-xl poppins-font ${modalHeadClass}`}
          style={{
            background: "var(--gradient-primary)",
            color: "white",
            borderBottom: "1px solid var(--purple-soft)",
          }}
        >
          <div className="flex w-full justify-between font-poppins not-italic leading-normal text-[16px] items-center">
            <span className={modalLabelClass} style={{ color: "white" }}>
              {modalLabel}
            </span>
            <button
              onClick={handleShowModal}
              className="transition-all hover:scale-110 p-1 rounded-full"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(5px)",
              }}
            >
              <RxCross2 size={"20px"} style={{ color: "white" }} />
            </button>
          </div>
        </DialogHeader>
        <DialogBody
          className={`lg:p-3 overflow-y-scroll h-72 uploads-field rounded-b-xl ${modalBodyClass}`}
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            border: "1px solid var(--pink-soft)",
          }}
        >
          <form className="flex flex-col gap-y-4 p-4">
            <Controller
              name={name}
              control={control}
              rules={{ required: "Please upload at least one file." }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Dragger
                  name={name}
                  multiple={true}
                  beforeUpload={() => false}
                  onChange={(info) => {
                    const { fileList } = info;
                    if (fileList.length > max) {
                      message.error(`You can only upload up to ${max} files.`);
                      return;
                    }
                    setFileList(fileList);
                    setError("");
                    onChange(fileList);
                  }}
                  fileList={fileList}
                  onRemove={(file) => {
                    handleDeleteFile(file);
                    onChange(fileList.filter((f) => f.uid !== file.uid));
                  }}
                  className="bg-transparent h-auto border-none rounded-lg"
                  style={{
                    border: "2px dashed var(--pink-soft)",
                    backgroundColor: "rgba(255, 241, 242, 0.3)",
                  }}
                >
                  <p className="w-full flex justify-center items-center my-3">
                    <FiUpload
                      size={"50px"}
                      style={{ color: "var(--pink-soft)" }}
                    />
                  </p>
                  <p
                    className="ant-upload-text font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Click or drag file to this area to upload
                  </p>
                  <p style={{ color: "var(--pink-soft)", fontWeight: "500" }}>
                    Upload up to {max} files. Strictly prohibited from uploading
                    company data or other banned files.
                  </p>
                </Dragger>
              )}
            />
            {errors[name] && (
              <p
                className="text-red-500 mt-2"
                style={{ color: "var(--red-soft)" }}
              >
                {errors[name]?.message}
              </p>
            )}
            {error && (
              <p
                className="text-red-500 mt-2"
                style={{ color: "var(--red-soft)" }}
              >
                {error}
              </p>
            )}
          </form>
        </DialogBody>
      </Dialog>
    </>
  );
};

export default UploadsField;
