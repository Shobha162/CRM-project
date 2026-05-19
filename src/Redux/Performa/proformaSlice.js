// src/Redux/Performa/proformaSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../utils/axiosInstance";
import toast from "react-hot-toast";

// ─────────────────────────────────────────────────────────────
// getPdfFile  –  fetches a stored PDF binary by filename
// Used in: AllPurchaseOrders (View PDF / Download)
// The backend serves uploaded PDF files from:
//   GET /uploads/<filename>   →  arraybuffer response
// ─────────────────────────────────────────────────────────────
export const getPdfFile = createAsyncThunk(
  "performa/getPdfFile",
  async (filename, { rejectWithValue }) => {
    try {
      const res = await API.get(`/uploads/${filename}`, {
        responseType: "arraybuffer",
      });
      return res.data;
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Failed to fetch PDF file";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// ─────────────────────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────────────────────
const proformaSlice = createSlice({
  name: "performa",
  initialState: {
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPdfFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPdfFile.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(getPdfFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default proformaSlice.reducer;