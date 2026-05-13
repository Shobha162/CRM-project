import { configureStore, combineReducers } from "@reduxjs/toolkit";

import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

import dashboardReducer from "./Dashboards/dashboardSlice";
import employeeReducer from "./Empoloyee/employeeSlice";
import authReducer from "./Auth/authSlice";
import customerReducer from "./Customer/customerSlice";
import productReducer from "./Product/productSlice";


const persistConfig = {
    key: "root",
    storage,
    // ✅ productMaster whitelist se hata diya — blob URLs persist nahi honi chahiye
    whitelist: [
        "auth",
        "customerMaster",
        "employeeMaster",
        "dashboard",
    ]
};

const rootReducer = combineReducers({
    auth: authReducer,
    dashboard: dashboardReducer,
    employeeMaster: employeeReducer,
    customerMaster: customerReducer,
    productMaster: productReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    // redux-persist ke actions
                    FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,
                    // ✅ image actions ignore karo (blob URL non-serializable hota hai)
                    "productMaster/setLocalImage",
                    "productMaster/uploadProductImage/fulfilled",
                    "productMaster/fetchProductImage/fulfilled",
                ],
                // ✅ images state path ignore karo
                ignoredPaths: [
                    "productMaster.images",
                ],
            },
        }),
});

export const persistor = persistStore(store);