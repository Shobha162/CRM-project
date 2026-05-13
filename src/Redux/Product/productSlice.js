import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import API from "../../utils/axiosInstance";

// ============================
// 🚀 ASYNC THUNKS
// ============================

// 1. Fetch all products
export const fetchProducts = createAsyncThunk(
  "productMaster/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get("/w-products/getall");

      const transformed = res.data?.data.map((p) => {
        const filename = p.imagePath?.split("\\").pop();
        return {
          id: p._id,
          imagePath: filename ? `uploads/images/${filename}` : null,
          description: p.description,
          hsn: p.hsn_uom,
          uom: p.uom,
          price: p.rate,
          currentStock: p.currentStock || 0,
          taxPercentage: p.taxPercentage || 0,
        };
      });

      return transformed;
    } catch (err) {
      const msg =
        err?.response?.data?.error || err.message || "Failed to fetch products";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// 2. Create product
// ✅ FIXED: FormData → JSON (backend image support nahi karta)
// ✅ FIXED: uom array safety (SelectField kabhi kabhi array return karta hai)
export const createProduct = createAsyncThunk(
  "productMaster/createProduct",
  async (data, { rejectWithValue }) => {
    try {
      const body = {
        description: data.description,
        hsn_uom: data.hsn_uom || data.hsn,
        rate: Number(data.rate || data.price) || 0,
        // ✅ uom array aaye toh string lo
        uom: Array.isArray(data.uom) ? data.uom[0] || "" : data.uom || "",
        currentStock: Number(data.currentStock) || 0,
        taxPercentage: Number(data.taxPercentage) || 0,
      };

      const res = await API.post("/w-products/", body);

      const created = res.data?.data || res.data;

      const transformed = {
        id: created._id,
        description: created.description,
        hsn: created.hsn_uom,
        uom: created.uom,
        price: created.rate,
        currentStock: created.currentStock || 0,
        taxPercentage: created.taxPercentage || 0,
        imagePath: null,
      };

      toast.success(res.data?.message || "Product created successfully");
      return transformed;
    } catch (err) {
      const msg =
        err?.response?.data?.error || err.message || "Create failed";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// 3. Update product
export const updateProduct = createAsyncThunk(
  "productMaster/updateProduct",
  async ({ id, data }, { getState, rejectWithValue }) => {
    try {
      // ✅ uom array safety
      const payload = {
        ...data,
        uom: Array.isArray(data.uom) ? data.uom[0] || "" : data.uom || "",
      };

      const res = await API.post(`/w-products/update/${id}`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getState().auth.token}`,
        },
      });

      const updated = res.data?.data || res.data;

      const transformed = {
        id: updated._id,
        imagePath: updated.imagePath,
        description: updated.description,
        hsn: updated.hsn_uom,
        uom: updated.uom,
        price: updated.rate,
        currentStock: updated.currentStock || 0,
        taxPercentage: updated.taxPercentage || 0,
      };

      toast.success("Product updated successfully!");
      return { id, transformed };
    } catch (err) {
      const msg = err?.response?.data?.error || "Update failed";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// 4. Update Stock Only
// ✅ FIXED: stock → newStock (backend "newStock" key expect karta hai)
export const updateProductStock = createAsyncThunk(
  "productMaster/updateProductStock",
  async ({ id, stock }, { rejectWithValue }) => {
    try {
      const res = await API.post(`/w-products/updatestock/${id}`, {
        newStock: Number(stock),
      });

      if (res.status === 200) {
        return { id, stock: Number(stock) };
      }
    } catch (err) {
      const msg =
        err?.response?.data?.error || err.message || "Stock update failed";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// 5. Delete product
export const deleteProduct = createAsyncThunk(
  "productMaster/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      const res = await API.post(`/w-products/delete/${id}`);
      toast.success(res.data?.message || "Product deleted successfully");
      return id;
    } catch (err) {
      const msg =
        err?.response?.data?.error || err.message || "Delete failed";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// 6. Get product by ID
export const getProductById = createAsyncThunk(
  "productMaster/getProductById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await API.get(`/w-products/getID/${id}`);
      const product = res.data?.data || res.data;

      let imagePath = "";
      if (product.imagePath) {
        const filename = product.imagePath.split("\\").pop();
        imagePath = `uploads/images/${filename}`;
      }

      return {
        id: product._id,
        description: product.description,
        hsn: product.hsn_uom,
        price: product.rate,
        uom: product.uom,
        currentStock: product.currentStock || 0,
        oldStock: product.oldStock || [],
        taxPercentage: product.taxPercentage || 0,
        imagePath,
      };
    } catch (err) {
      toast.error("Fetch by ID failed");
      return rejectWithValue("Fetch by ID failed");
    }
  }
);

// 7. Search products by name
export const searchProducts = createAsyncThunk(
  "productMaster/searchProducts",
  async (query, { rejectWithValue }) => {
    try {
      const res = await API.get(`/w-products/search`, {
        params: { q: query },
      });

      const results = res.data?.data || res.data || [];

      const transformed = results.map((p) => {
        const filename = p.imagePath?.split("\\").pop();
        return {
          id: p._id,
          imagePath: filename ? `uploads/images/${filename}` : null,
          description: p.description,
          hsn: p.hsn_uom,
          uom: p.uom,
          price: p.rate,
          currentStock: p.currentStock || 0,
          taxPercentage: p.taxPercentage || 0,
        };
      });

      return transformed;
    } catch (err) {
      const msg =
        err?.response?.data?.error || err.message || "Search failed";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// 8. Upload / Replace product image
export const uploadProductImage = createAsyncThunk(
  "productMaster/uploadProductImage",
  async ({ id, file }, { rejectWithValue }) => {
    try {
      const form = new FormData();
      form.append("image", file);

      const res = await API.post(`/w-products/replaceImage/${id}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const imgRes = await API.get(`/w-products/getImage/${id}`, {
        responseType: "blob",
      });

      const url = URL.createObjectURL(imgRes.data);
      toast.success(res.data?.message || "Image uploaded successfully");
      return { id, url };
    } catch (err) {
      const msg =
        err?.response?.data?.error || err.message || "Upload image failed";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// 9. Fetch product image
export const fetchProductImage = createAsyncThunk(
  "productMaster/fetchProductImage",
  async (id, { rejectWithValue }) => {
    try {
      const res = await API.get(`/w-products/getImage/${id}`, {
        responseType: "blob",
      });

      const url = URL.createObjectURL(res.data);
      return { id, url };
    } catch (err) {
      console.error("Image fetch failed:", err);
      return rejectWithValue("Image fetch failed");
    }
  }
);

// 10. Delete product image
export const deleteProductImage = createAsyncThunk(
  "productMaster/deleteProductImage",
  async (id, { rejectWithValue }) => {
    try {
      const res = await API.post(`/w-products/deleteImage/${id}`);
      toast.success(res.data?.message || "Image deleted successfully");
      return id;
    } catch (err) {
      toast.error("Delete image failed");
      return rejectWithValue("Delete image failed");
    }
  }
);

// 11. Get Tax Invoices by product
export const getProductTaxInvoices = createAsyncThunk(
  "productMaster/getProductTaxInvoices",
  async (id, { rejectWithValue }) => {
    try {
      const res = await API.get(`/w-products/getProductTaxInvoice/${id}`);
      const invoices = res.data?.data || res.data || [];

      return {
        productId: id,
        invoices: invoices,
        totalInvoices: invoices.length,
      };
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err.message ||
        "Failed to fetch tax invoices";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// ============================
// 🗂️ INITIAL STATE
// ============================

const initialState = {
  products: [],
  searchResults: [],
  images: {},
  loading: false,
  searchLoading: false,
  error: null,
};

// ============================
// 🔪 SLICE
// ============================

const productSlice = createSlice({
  name: "productMaster",
  initialState,
  reducers: {
    setLocalImage: (state, action) => {
      const { id, url, file } = action.payload;
      state.images[id] = { url, file };
    },
    deleteLocalImage: (state, action) => {
      delete state.images[action.payload.id || action.payload];
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },

  extraReducers: (builder) => {

    // 1. Fetch all products
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // 2. Create product
    builder
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.push(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.error = action.payload;
      });

    // 3. Update product
    builder
      .addCase(updateProduct.fulfilled, (state, action) => {
        const { id, transformed } = action.payload;
        state.products = state.products.map((p) =>
          p.id === id || p._id === id ? { ...p, ...transformed } : p
        );
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.error = action.payload;
      });

    // 4. Update stock
    builder
      .addCase(updateProductStock.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProductStock.fulfilled, (state, action) => {
        state.loading = false;
        const { id, stock } = action.payload;
        state.products = state.products.map((p) =>
          p.id === id || p._id === id ? { ...p, currentStock: stock } : p
        );
      })
      .addCase(updateProductStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // 5. Delete product
    builder
      .addCase(deleteProduct.fulfilled, (state, action) => {
        const id = action.payload;
        state.products = state.products.filter(
          (p) => p.id !== id && p._id !== id
        );
        delete state.images[id];
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.error = action.payload;
      });

    // 6. Get product by ID
    builder
      .addCase(getProductById.rejected, (state, action) => {
        state.error = action.payload;
      });

    // 7. Search products
    builder
      .addCase(searchProducts.pending, (state) => {
        state.searchLoading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload;
      });

    // 8. Upload image
    builder
      .addCase(uploadProductImage.fulfilled, (state, action) => {
        const { id, url } = action.payload;
        state.images[id] = { url };
      })
      .addCase(uploadProductImage.rejected, (state, action) => {
        state.error = action.payload;
      });

    // 9. Fetch image
    builder
      .addCase(fetchProductImage.fulfilled, (state, action) => {
        const { id, url } = action.payload;
        state.images[id] = { url };
      });

    // 10. Delete image
    builder
      .addCase(deleteProductImage.fulfilled, (state, action) => {
        delete state.images[action.payload];
      })
      .addCase(deleteProductImage.rejected, (state, action) => {
        state.error = action.payload;
      });

    // 11. Tax invoices
    builder
      .addCase(getProductTaxInvoices.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { setLocalImage, deleteLocalImage, clearSearchResults } =
  productSlice.actions;

export default productSlice.reducer;