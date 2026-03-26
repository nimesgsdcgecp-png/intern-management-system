import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UIState {
  sidebarCollapsed: boolean;
  animationsEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  glassIntensity: 'low' | 'medium' | 'high';
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

const initialState: UIState = {
  sidebarCollapsed: false,
  animationsEnabled: true,
  theme: 'light',
  glassIntensity: 'medium',
  deviceType: 'desktop',
};

/**
 * Manages global UI state, including sidebar visibility, theme preferences, and visual effect intensities.
 */
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    toggleAnimations: (state) => {
      state.animationsEnabled = !state.animationsEnabled;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'auto'>) => {
      state.theme = action.payload;
    },
    setGlassIntensity: (state, action: PayloadAction<'low' | 'medium' | 'high'>) => {
      state.glassIntensity = action.payload;
    },
    setDeviceType: (state, action: PayloadAction<'mobile' | 'tablet' | 'desktop'>) => {
      state.deviceType = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  toggleAnimations,
  setTheme,
  setGlassIntensity,
  setDeviceType,
} = uiSlice.actions;

export default uiSlice.reducer;