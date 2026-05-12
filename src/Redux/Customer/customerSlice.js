import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import API from "../../utils/axiosInstance";

// 🚀 Fetch all customers
export const fetchCustomers = createAsyncThunk(
  "customerMaster/fetchCustomers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get("/w-customer/getall");
      return res.data?.data || [];
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to fetch customers";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// 🚀 Get customer by ID
export const getCustomerById = createAsyncThunk(
  "customerMaster/getCustomerById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await API.get(`/w-customer/getID/${id}`);
      return res.data?.data || res.data;
    } catch (err) {
      toast.error("Failed to get customer");
      return rejectWithValue(err?.response?.data?.message);
    }
  }
);

// 🚀 Create customer
export const addCustomer = createAsyncThunk(
  "customerMaster/addCustomer",
  async (data, { rejectWithValue }) => {
    try {
      const res = await API.post("/w-customer/", data);
      toast.success(res.data?.message || "Customer added successfully");
      return res.data?.data || res.data;
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to add customer";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// 🚀 Update customer
export const updateCustomer = createAsyncThunk(
  "customerMaster/updateCustomer",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const res = await API.post(`/w-customer/update/${id}`, payload);
      toast.success(res.data?.message || "Customer updated successfully");
      return res.data?.data || res.data;
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to update";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// 🚀 Delete customer
export const deleteCustomer = createAsyncThunk(
  "customerMaster/deleteCustomer",
  async (id, { rejectWithValue }) => {
    try {
      const res = await API.post(`/w-customer/delete/${id}`);
      toast.success(res.data?.message || "Customer deleted successfully");
      return id; // deleted id return karo taaki state update ho sake
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to delete";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const customerSlice = createSlice({
  name: "customerMaster",
  initialState: {
    customers: [],
    selectedCustomer: null,
    tasksCustomers: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearCustomerError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // fetchCustomers
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getCustomerById
      .addCase(getCustomerById.fulfilled, (state, action) => {
        state.selectedCustomer = action.payload;
      })

      // addCustomer
      .addCase(addCustomer.fulfilled, (state, action) => {
        state.customers.push(action.payload);
      })

      // updateCustomer
      .addCase(updateCustomer.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.customers.findIndex(
          (c) => c._id === updated._id || c.id === updated.id
        );
        if (index !== -1) state.customers[index] = updated;
      })

      // deleteCustomer
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        const id = action.payload;
        state.customers = state.customers.filter(
          (c) => c._id !== id && c.id !== id
        );
      });
  },
});

export const { clearCustomerError } = customerSlice.actions;
export default customerSlice.reducer;