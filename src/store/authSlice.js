import { createSlice } from "@reduxjs/toolkit";

// Remove the manual localStorage logic since Redux Persist handles it
const initialState = {
    status: false,
    userData: null,
    salesRepData: null
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action) => {
            state.status = true;
            state.userData = action.payload;
        },
        logout: (state) => {
            state.status = false;
            state.userData = null;
        },
        salesRepLogin: (state, action) => {
            state.status = true;
            state.salesRepData = action.payload;
        },
        salesRepLogout: (state) => {
            state.status = false;
            state.salesRepData = null;
        },
    },
});

export const { login, logout, salesRepLogin, salesRepLogout } = authSlice.actions;
export default authSlice.reducer;