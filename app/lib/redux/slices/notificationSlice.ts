import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: number;
}

export interface NotificationState {
  notifications: Notification[];
}

const initialState: NotificationState = {
  notifications: [],
};

/**
 * Manages the stack of system notifications, supporting various types and automatic cleanup.
 */
const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Math.random().toString(36).substring(2, 11),
        timestamp: Date.now(),
        duration: action.payload.duration ?? 3000,
      };
      state.notifications.unshift(notification);
      if (state.notifications.length > 5) state.notifications.pop();
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
    // Simplified helper actions
    addSuccess: (state, action: PayloadAction<{ title: string; message: string; duration?: number }>) => {
      notificationSlice.caseReducers.addNotification(state, { payload: { ...action.payload, type: 'success' }, type: 'notifications/addNotification' });
    },
    addError: (state, action: PayloadAction<{ title: string; message: string; duration?: number }>) => {
      notificationSlice.caseReducers.addNotification(state, { payload: { ...action.payload, type: 'error' }, type: 'notifications/addNotification' });
    },
    addWarning: (state, action: PayloadAction<{ title: string; message: string; duration?: number }>) => {
      notificationSlice.caseReducers.addNotification(state, { payload: { ...action.payload, type: 'warning' }, type: 'notifications/addNotification' });
    },
    addInfo: (state, action: PayloadAction<{ title: string; message: string; duration?: number }>) => {
      notificationSlice.caseReducers.addNotification(state, { payload: { ...action.payload, type: 'info' }, type: 'notifications/addNotification' });
    },
  },
});

export const {
  addNotification,
  removeNotification,
  clearAllNotifications,
  addSuccess,
  addError,
  addWarning,
  addInfo,
} = notificationSlice.actions;

export default notificationSlice.reducer;