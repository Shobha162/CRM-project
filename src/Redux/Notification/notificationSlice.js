import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    visible: false,
    minimized: false,
    reminders: [], // ✅ always an array
};

const notificationSlice = createSlice({
    name: "notification",
    initialState,
    reducers: {
        showNotification: (state, action) => {
            // ✅ fallback if state.reminders somehow becomes undefined
            if (!Array.isArray(state.reminders)) {
                state.reminders = [];
            }

            const exists = state.reminders.find((r) => r.id === action.payload.id);
            if (!exists) {
                state.reminders.push(action.payload);
                state.visible = true;
                state.minimized = false;
            }
        },
        hideNotification: (state, action) => {
            state.reminders = state.reminders.filter((r) => r.id !== action.payload);
            if (state.reminders.length === 0) {
                state.visible = false;
            }
        },
        toggleMinimize: (state) => {
            state.minimized = !state.minimized;
        },
    },
});

export const { showNotification, hideNotification, toggleMinimize } =
    notificationSlice.actions;

export default notificationSlice.reducer;
