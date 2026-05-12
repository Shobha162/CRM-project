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


const persistConfig = {
    key: "root",
    storage,
    whitelist: [
        "auth",
        "customerMaster",
        "employeeMaster",
        
    ]
};
const rootReducer = combineReducers({
        auth: authReducer,
        dashboard: dashboardReducer,
        employeeMaster: employeeReducer,
        customerMaster: customerReducer,
     });

const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});


export const persistor = persistStore(store);









