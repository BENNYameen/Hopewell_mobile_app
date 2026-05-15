import { createSlice } from "@reduxjs/toolkit";

type AuthState = {
  isAuthenticated: boolean;
  sessionHydrated: boolean;
};

const initialState: AuthState = {
  isAuthenticated: false,
  sessionHydrated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state) => {
      state.isAuthenticated = true;
      state.sessionHydrated = true;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.sessionHydrated = true;
    },
    restoreSession: (state, action: { payload: boolean }) => {
      state.isAuthenticated = action.payload;
      state.sessionHydrated = true;
    },
  },
});

export const { loginSuccess, logout, restoreSession } = authSlice.actions;
export default authSlice.reducer;
