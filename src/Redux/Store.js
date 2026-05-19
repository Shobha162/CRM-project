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
import supplierReducer from "./Supplier/supplierSlice";
import taskReducer from "./Task/taskSlice";
import notificationReducer from "./Notification/notificationSlice";
import purchaseOrderReducer from "./PurchaseOrder/purchaseOrderSlice";
import proformaReducer from "./Performa/proformaSlice";

const persistConfig = {
    key: "root",
    storage,
    whitelist: [
        "auth",
        "customerMaster",
        "employeeMaster",
        "dashboard",
        "supplierMaster",
        
    ],
};

const rootReducer = combineReducers({
    auth: authReducer,
    dashboard: dashboardReducer,
    employeeMaster: employeeReducer,
    customerMaster: customerReducer,
    productMaster: productReducer,
    supplierMaster: supplierReducer,
    taskMaster: taskReducer,
    notification: notificationReducer,
    purchaseOrder: purchaseOrderReducer,
    performa: proformaReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,
                    "productMaster/setLocalImage",
                    "productMaster/uploadProductImage/fulfilled",
                    "productMaster/fetchProductImage/fulfilled",
                ],
                ignoredPaths: [
                    "productMaster.images",
                ],
            },
        }),
});

export const persistor = persistStore(store);