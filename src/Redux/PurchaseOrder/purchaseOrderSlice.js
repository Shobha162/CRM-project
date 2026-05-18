// src/redux/purchaseOrder/purchaseOrderSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../utils/axiosInstance";
import toast from "react-hot-toast";

// 1. Get all Purchase Orders
export const getAllPurchaseOrders = createAsyncThunk(
  "purchaseOrder/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get("/w-purchase/getall");
      console.log("📦 All Purchase Orders:", res.data);
      return res.data.data;
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to fetch purchase orders"
      );
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// 2. Create Purchase Order
export const createPurchaseOrder = createAsyncThunk(
  "purchaseOrder/create",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await API.post("/w-purchase/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Purchase Order Created");
      return res.data;
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to create purchase order"
      );
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// 3. Get Voucher Settings
export const getVoucherSettings = createAsyncThunk(
  "purchaseOrder/getVoucherSettings",
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get("/crystal-quotation/get?module=purchase");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to get voucher settings"
      );
    }
  }
);

// 4. Set Voucher Settings
export const setVoucherSettings = createAsyncThunk(
  "purchaseOrder/setVoucherSettings",
  async (settings, { rejectWithValue }) => {
    try {
      const res = await API.post("/crystal-invoicesetting/set", settings);
      toast.success(res.data.message);
      return res.data;
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update voucher settings"
      );
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// 5. Increment Voucher Number
export const incrementVoucher = createAsyncThunk(
  "purchaseOrder/incrementVoucher",
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.post("/crystal-purchase/invoice-increment");
      return res.data;
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to increment voucher number"
      );
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// ✅ 6. Get Single Purchase Order by ID
export const getSinglePurchaseOrder = createAsyncThunk(
  "purchaseOrder/getSingle",
  async (id, { rejectWithValue }) => {
    try {
      const res = await API.get(`/w-purchase/getID/${id}`);
      return res.data.data;
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to fetch purchase order"
      );
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// Update Purchase Order (like updatePerforma)
export const updatePurchaseOrder = createAsyncThunk(
  "/w-purchase/update/:id",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      // Ensure formData is FormData instance
      if (!(formData instanceof FormData)) {
        const fd = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          fd.append(key, value);
        });
        formData = fd;
      }

      // Append id to formData (if needed by backend)
      formData.append("id", id);

      const res = await API.post(`/crystal-purchase/update`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("✅ Purchase Order updated:", res.data);
      toast.success(res.data?.message || "Purchase Order updated successfully");
      return res.data;
    } catch (err) {
      console.error("❌ API Error:", err?.response || err);
      const errorMsg =
        err?.response?.data?.message || "Failed to update purchase order";
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

// ✅ 8. Delete Purchase Order
export const deletePurchaseOrder = createAsyncThunk(
  "purchaseOrder/delete",
  async (id, { rejectWithValue }) => {
    try {
      const res = await API.post(`/w-purchase/delete/${id}`, { id });
      toast.success(res.data?.message || "Purchase Order deleted successfully");
      return id;
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to delete purchase order"
      );
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// Slice
const purchaseOrderSlice = createSlice({
  name: "purchaseOrder",
  initialState: {
    allPurchaseOrders: [],
    singlePurchaseOrder: null,
    voucherSettings: {
      prefix: "",
      startFrom: 1,
    },
    loading: false,
    error: null,
  },
  reducers: {
    setSinglePurchaseOrder: (state, action) => {
      state.singlePurchaseOrder = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllPurchaseOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllPurchaseOrders.fulfilled, (state, action) => {
        state.allPurchaseOrders = action.payload;
        state.loading = false;
      })
      .addCase(getAllPurchaseOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createPurchaseOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPurchaseOrder.fulfilled, (state, action) => {
        state.allPurchaseOrders.push(action.payload);
        state.loading = false;
      })
      .addCase(createPurchaseOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getVoucherSettings.fulfilled, (state, action) => {
        state.voucherSettings = action.payload;
      })

      // ✅ getSingle
      .addCase(getSinglePurchaseOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSinglePurchaseOrder.fulfilled, (state, action) => {
        state.singlePurchaseOrder = action.payload;
        state.loading = false;
      })
      .addCase(getSinglePurchaseOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ update
      .addCase(updatePurchaseOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePurchaseOrder.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updatePurchaseOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ delete
      .addCase(deletePurchaseOrder.fulfilled, (state, action) => {
        state.allPurchaseOrders = state.allPurchaseOrders.filter(
          (po) => po._id !== action.payload
        );
      });
  },
});

export const { setSinglePurchaseOrder } = purchaseOrderSlice.actions;
export default purchaseOrderSlice.reducer;
