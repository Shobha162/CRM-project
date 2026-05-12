// utils/dateUtils.js
// moment hata ke dayjs use kiya — moment package.json mein nahi tha

import dayjs from "./dayjsSetup";

// Convert date to 'DD/MM/YYYY' format (display ke liye)
export const formatDateForDisplay = (date) => {
  if (!date) return null;
  // Handle multiple input formats
  const parsed = dayjs(date, ["YYYY-MM-DD", "DD/MM/YYYY", "DD-MM-YYYY"], true);
  return parsed.isValid() ? parsed.format("DD/MM/YYYY") : null;
};

// Convert date to 'YYYY-MM-DD' format (form state / API ke liye)
export const formatDateForSubmit = (date) => {
  if (!date) return null;
  const parsed = dayjs(date, ["DD/MM/YYYY", "DD-MM-YYYY", "YYYY-MM-DD"], true);
  return parsed.isValid() ? parsed.format("YYYY-MM-DD") : null;
};