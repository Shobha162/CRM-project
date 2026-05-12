import React, { useMemo } from "react";

// fields
import TextField from "./TextField";
import EmailField from "./EmailField";
import PasswordField from "./PasswordField";
import SelectField from "./SelectField";
import OptionField from "./OptionField";
import DateField from "./Datefield";        // ✅ Fix: DateField import add kiya
import UploadField from "./UploadField";
import DescriptionField from "./DescriptionField";
import UploadsField from "./UploadsField";
import NumericField from "./NumericField";
import TextareaField from "./TextareaField";
import TextEditorField from "./TextEditorField";

/**
 * @typedef {'text' | 'email' | 'password' | 'option' | 'select' | 'date' | 'file' | 'upload' | 'description' | 'desc' | 'number' | 'time' | 'datelocal-time' } InputType
 * @typedef {'multiple' | 'tags'} ModeType
 * @typedef {'date' | 'time' | 'month' | 'quarter' | 'time' | 'week' | 'year' } PickerType
 */

/**
 * @param {Object} props
 * @param {import('react-hook-form').Control} props.control
 * @param {Object} props.errors
 * @param {string} [props.name]
 * @param {InputType} [props.type]
 * @param {string} [props.placeholder]
 * @param {string} [props.label]
 * @param {string} [props.labelClass]
 * @param {Array} [props.options]
 * @param {string} [props.className]
 * @param {string} [props.parentClass]
 * @param {string} [props.accept]
 * @param {boolean} [props.disabled]
 * @param {ModeType} [props.mode]
 * @param {PickerType} [props.picker]
 * @param {function} [props.onSelectChange]
 * @param {string} [props.modalLabel]
 * @param {string} [props.modalHeadClass]
 * @param {string} [props.modalClass]
 * @param {string} [props.modalBodyClass]
 * @param {string} [props.modalLabelClass]
 * @param {number} [props.max]
 */
const InputField = ({
  control,
  rows,
  errors,
  name = "",
  type = "text",
  placeholder = "",
  label = "",
  labelClass = "",
  options = [],
  className = "",
  parentClass = "",
  accept = "*",
  disabled = false,
  mode = "multiple",
  onSelectChange = function () {},
  defaultValue,
  modalLabel = "",
  modalHeadClass = "",
  modalClass = "",
  modalBodyClass = "",
  modalLabelClass = "",
  max = 1,
  value,
  picker = "date",
}) => {
  const props = {
    value,
    control,
    errors,
    name,
    type,
    placeholder,
    defaultValue,
    label,
    labelClass,
    options,
    className,
    parentClass,
    rows,
    accept,
    disabled,
    mode,
    onSelectChange,
    modalLabel,
    modalHeadClass,
    modalClass,
    modalBodyClass,
    modalLabelClass,
    max,
    picker,
  };

  const FieldComponent = useMemo(() => {
    switch (type) {
      case "text":
        return <TextField {...props} />;
      case "number":
        return <NumericField {...props} />;
      case "email":
        return <EmailField {...props} />;
      case "password":
        return <PasswordField {...props} />;
      case "select":
        return <SelectField {...props} />;
      case "option":
        return <OptionField {...props} />;
      case "date":
        return <DateField {...props} />;       // ✅ Ab kaam karega
      case "file":
        return <UploadField {...props} />;
      case "upload":
        return <UploadsField {...props} />;
      case "texteditor":
        return <TextEditorField {...props} />;
      case "description":
        return <TextareaField {...props} />;
      case "desc":
        return <DescriptionField {...props} />;
      default:
        return <TextField {...props} />;
    }
  }, [type, props]);

  return FieldComponent;
};

export default InputField;