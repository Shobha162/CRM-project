import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import API from "../../utils/axiosInstance";

// Fetch all suppliers
export const fetchSuppliers = createAsyncThunk(
    "supplier/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const res = await API.get("/w-supplier/getall");
            return res.data?.data || [];
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to fetch suppliers";
            toast.error(msg);
            return rejectWithValue(msg);
        }
    }
);

// Add supplier
export const addSupplier = createAsyncThunk(
    "supplier/add",
    async (supplierData, { rejectWithValue }) => {
        try {
            const res = await API.post("/w-supplier/", supplierData);
            // ✅ FIXED: res.data.data undefined ho sakta hai
            const created = res.data?.data || res.data;
            toast.success(res.data?.message || "Supplier added successfully");
            return created;
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to add supplier";
            toast.error(msg);
            return rejectWithValue(msg);
        }
    }
);

// Get supplier by ID
export const getSupplierById = createAsyncThunk(
    "supplier/getById",
    async (id, { rejectWithValue }) => {
        try {
            const res = await API.get(`/w-supplier/getID/${id}`);
            return res.data?.data || res.data;
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to fetch supplier";
            toast.error(msg);
            return rejectWithValue(msg);
        }
    }
);

// Update supplier
export const updateSupplier = createAsyncThunk(
    "supplier/update",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const res = await API.post(`/w-supplier/update/${id}`, data);
            // ✅ FIXED: res.data.data undefined ho sakta hai
            const updated = res.data?.data || res.data;
            toast.success(res.data?.message || "Supplier updated successfully");
            // ✅ FIXED: id bhi return karo fallback ke liye
            return { ...updated, _id: updated?._id || id };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to update supplier";
            toast.error(msg);
            return rejectWithValue(msg);
        }
    }
);

// Delete supplier
export const deleteSupplier = createAsyncThunk(
    "supplier/delete",
    async (id, { rejectWithValue }) => {
        try {
            await API.post(`/w-supplier/delete/${id}`);
            toast.success("Supplier deleted successfully");
            return id;
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to delete supplier";
            toast.error(msg);
            return rejectWithValue(msg);
        }
    }
);

const supplierSlice = createSlice({
    name: "supplier",
    initialState: {
        suppliers: [],
        currentSupplier: null,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchSuppliers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSuppliers.fulfilled, (state, action) => {
                state.loading = false;
                state.suppliers = Array.isArray(action.payload)
                    ? action.payload.filter(Boolean)
                    : [];
            })
            .addCase(fetchSuppliers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(addSupplier.fulfilled, (state, action) => {
                // ✅ FIXED: payload null/undefined check
                if (action.payload) {
                    state.suppliers.push(action.payload);
                }
            })
            .addCase(addSupplier.rejected, (state, action) => {
                state.error = action.payload;
            })

            .addCase(getSupplierById.fulfilled, (state, action) => {
                state.currentSupplier = action.payload;
            })

            .addCase(updateSupplier.fulfilled, (state, action) => {
                // ✅ FIXED: payload aur _id null check
                if (!action.payload?._id) return;
                const index = state.suppliers.findIndex(
                    (s) => s._id === action.payload._id
                );
                if (index !== -1) {
                    state.suppliers[index] = action.payload;
                }
            })
            .addCase(updateSupplier.rejected, (state, action) => {
                state.error = action.payload;
            })

            .addCase(deleteSupplier.fulfilled, (state, action) => {
                state.suppliers = state.suppliers.filter(
                    (s) => s._id !== action.payload
                );
            })
            .addCase(deleteSupplier.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export default supplierSlice.reducer;