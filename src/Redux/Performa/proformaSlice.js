// redux/performa/proformaSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../utils/axiosInstance";
import toast from "react-hot-toast";

// ─────────────────────────────────────────────────────────────
// 1. Get Invoice Settings
// ─────────────────────────────────────────────────────────────
export const getInvoiceSettings = createAsyncThunk(
    "proforma/getInvoiceSettings",
    async (_, { rejectWithValue }) => {
        try {
            const res = await API.get("/crystal-invoicesetting/get?module=performa");
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to get invoice settings");
        }
    }
);

// ─────────────────────────────────────────────────────────────
// 2. Set Invoice Settings
// ─────────────────────────────────────────────────────────────
export const setInvoiceSettings = createAsyncThunk(
    "proforma/setInvoiceSettings",
    async (settings, { rejectWithValue }) => {
        try {
            const res = await API.post("/crystal-invoicesetting/set", settings);
            toast.success(res.data.message);
            return res.data;
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update invoice settings");
            return rejectWithValue(err.response?.data?.message);
        }
    }
);

// ─────────────────────────────────────────────────────────────
// 3. Create Performa Invoice (PI)
// ─────────────────────────────────────────────────────────────
export const createPerforma = createAsyncThunk(
    "proforma/createPerforma",
    async (formData, { rejectWithValue }) => {
        try {
            const res = await API.post("/crystal-performa/create", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Error creating performa");
        }
    }
);

// ─────────────────────────────────────────────────────────────
// 4. Get All PIs
// ─────────────────────────────────────────────────────────────
export const getAllPerformas = createAsyncThunk(
    "proforma/getAllPerformas",
    async (_, { rejectWithValue }) => {
        try {
            const res = await API.get("/crystal-performa/getAll");
            return res.data.data;
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to fetch performa invoices");
            return rejectWithValue(err.response?.data?.message);
        }
    }
);

// ─────────────────────────────────────────────────────────────
// 5. Increment Invoice Number
// ─────────────────────────────────────────────────────────────
export const incrementInvoice = createAsyncThunk(
    "proforma/incrementInvoice",
    async (_, { rejectWithValue }) => {
        try {
            const res = await API.post("/crystal-performa/invoiceincrement");
            return res.data;
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to increment invoice number");
            return rejectWithValue(err.response?.data?.message);
        }
    }
);

// ─────────────────────────────────────────────────────────────
// 6. Get PDF File
// Used in: AllPurchaseOrders (View PDF / Download)
// Backend serves uploaded PDFs from: GET /uploads/<filename>
// ─────────────────────────────────────────────────────────────
export const getPdfFile = createAsyncThunk(
    "proforma/getPdfFile",
    async (filename, { rejectWithValue }) => {
        try {
            const res = await API.get(`/uploads/${filename}`, {
                responseType: "arraybuffer",
            });
            return res.data;
        } catch (err) {
            const msg = err?.response?.data?.message || "Failed to fetch PDF file";
            toast.error(msg);
            return rejectWithValue(msg);
        }
    }
);

// ─────────────────────────────────────────────────────────────
// 7. Get Single PI by ID
// ─────────────────────────────────────────────────────────────
export const getSinglePI = createAsyncThunk(
    "proforma/getSinglePI",
    async (id, { rejectWithValue }) => {
        try {
            const res = await API.get(`/crystal-performa/get/${id}`);
            return res.data.data;
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to fetch PI");
            return rejectWithValue(err.response?.data?.message);
        }
    }
);

// ─────────────────────────────────────────────────────────────
// 8. Update PI
// ─────────────────────────────────────────────────────────────
export const updatePerforma = createAsyncThunk(
    "proforma/updatePerforma",
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            if (!(formData instanceof FormData)) {
                const fd = new FormData();
                Object.entries(formData).forEach(([key, value]) => {
                    fd.append(key, value);
                });
                formData = fd;
            }
            formData.append("id", id);
            const res = await API.post(`/crystal-performa/update`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success(res.data?.message || "Performa updated successfully");
            return res.data;
        } catch (err) {
            console.error("❌ API Error:", err?.response || err);
            const errorMsg = err?.response?.data?.message || "Failed to update PI";
            toast.error(errorMsg);
            return rejectWithValue(errorMsg);
        }
    }
);

// ─────────────────────────────────────────────────────────────
// 9. Delete PI
// ─────────────────────────────────────────────────────────────
export const deletePI = createAsyncThunk(
    "proforma/deletePI",
    async (id, { rejectWithValue }) => {
        try {
            const res = await API.post(`/crystal-performa/delete`, { id });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to delete PI");
        }
    }
);

// ─────────────────────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────────────────────
const proformaSlice = createSlice({
    name: "proforma",
    initialState: {
        pis: [],
        singlePI: null,
        invoiceSettings: {
            prefix: "",
            startFrom: 1,
        },
        loading: false,
        error: null,
    },
    reducers: {
        setSinglePI: (state, action) => {
            state.singlePI = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // ── getInvoiceSettings ──────────────────────────────
            .addCase(getInvoiceSettings.fulfilled, (state, action) => {
                state.invoiceSettings = action.payload;
            })

            // ── getAllPerformas ─────────────────────────────────
            .addCase(getAllPerformas.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllPerformas.fulfilled, (state, action) => {
                state.pis = action.payload;
                state.loading = false;
            })
            .addCase(getAllPerformas.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ── createPerforma ─────────────────────────────────
            .addCase(createPerforma.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createPerforma.fulfilled, (state, action) => {
                state.pis.push(action.payload);
                state.loading = false;
            })
            .addCase(createPerforma.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ── getPdfFile ─────────────────────────────────────
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
            })

            // ── getSinglePI ────────────────────────────────────
            .addCase(getSinglePI.fulfilled, (state, action) => {
                state.singlePI = action.payload;
            })

            // ── updatePerforma ─────────────────────────────────
            .addCase(updatePerforma.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updatePerforma.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(updatePerforma.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ── deletePI ───────────────────────────────────────
            .addCase(deletePI.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deletePI.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(deletePI.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setSinglePI } = proformaSlice.actions;
export default proformaSlice.reducer;