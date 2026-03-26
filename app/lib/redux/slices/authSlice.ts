import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'mentor' | 'intern';
  avatar?: string;
  isOnline: boolean;
  lastLogin?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  rememberMe: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  rememberMe: false,
};

/**
 * Manages authentication state, including the current user profile and session status.
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    setUserOnlineStatus: (state, action: PayloadAction<boolean>) => {
      if (state.user) state.user.isOnline = action.payload;
    },
    setRememberMe: (state, action: PayloadAction<boolean>) => {
      state.rememberMe = action.payload;
    },
    updateLastLogin: (state) => {
      if (state.user) state.user.lastLogin = new Date().toISOString();
    },
  },
});

export const {
  setUser,
  clearUser,
  setUserOnlineStatus,
  setRememberMe,
  updateLastLogin,
} = authSlice.actions;

export default authSlice.reducer;