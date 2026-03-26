"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch, useLoading, useUI } from '../lib/redux/hooks';
import {
  addSuccess,
  addError,
  addWarning,
  addInfo,
  clearAllNotifications
} from '../lib/redux/slices/notificationSlice';
import {
  startOperation,
  stopOperation,
  setGlobalLoading
} from '../lib/redux/slices/loadingSlice';
import {
  toggleAnimations,
  setTheme,
  setGlassIntensity
} from '../lib/redux/slices/uiSlice';
import { Button } from './Button';
import {
  Bell,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Info,
  Loader2,
  Settings,
  Palette,
  Zap
} from 'lucide-react';

export const ReduxDemoPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { globalLoading, operations } = useLoading();
  const { animationsEnabled, theme, glassIntensity } = useUI();

  const showSuccessNotification = () => {
    dispatch(addSuccess({
      title: 'Success!',
      message: 'Your action was completed successfully.',
      duration: 4000
    }));
  };

  const showErrorNotification = () => {
    dispatch(addError({
      title: 'Error occurred',
      message: 'Something went wrong. Please try again.',
      duration: 6000
    }));
  };

  const showWarningNotification = () => {
    dispatch(addWarning({
      title: 'Warning',
      message: 'Please review your settings before continuing.',
      duration: 5000
    }));
  };

  const showInfoNotification = () => {
    dispatch(addInfo({
      title: 'Information',
      message: 'Here is some useful information for you.',
      duration: 4000
    }));
  };

  const simulateLoading = () => {
    const operationKey = `demo_operation_${Date.now()}`;
    dispatch(startOperation({
      key: operationKey,
      message: 'Processing your request...',
      canCancel: false
    }));

    setTimeout(() => {
      dispatch(stopOperation(operationKey));
      dispatch(addSuccess({
        title: 'Operation completed',
        message: 'Your request has been processed successfully.',
      }));
    }, 3000);
  };

  const toggleGlobalLoading = () => {
    dispatch(setGlobalLoading(!globalLoading));
  };

  const clearNotifications = () => {
    dispatch(clearAllNotifications());
  };

  const toggleAnimationPreference = () => {
    dispatch(toggleAnimations());
    dispatch(addInfo({
      title: 'Animation preference updated',
      message: `Animations are now ${!animationsEnabled ? 'enabled' : 'disabled'}.`,
      duration: 3000
    }));
  };

  const cycleTheme = () => {
    const themes: Array<'light' | 'dark' | 'auto'> = ['light', 'dark', 'auto'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];

    dispatch(setTheme(nextTheme));
    dispatch(addInfo({
      title: 'Theme changed',
      message: `Theme set to ${nextTheme} mode.`,
      duration: 3000
    }));
  };

  const cycleGlassIntensity = () => {
    const intensities: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
    const currentIndex = intensities.indexOf(glassIntensity);
    const nextIntensity = intensities[(currentIndex + 1) % intensities.length];

    dispatch(setGlassIntensity(nextIntensity));
    dispatch(addInfo({
      title: 'Glass effect updated',
      message: `Glass intensity set to ${nextIntensity}.`,
      duration: 3000
    }));
  };

  return (
    <motion.div
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1, duration: 0.5 }}
    >
      <div className="glass-card p-4 max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Redux Demo Panel</h3>
          <div className="flex items-center gap-2">
            {globalLoading && (
              <motion.div
                className="flex items-center text-blue-600"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                <span className="text-sm">Loading...</span>
              </motion.div>
            )}
            <span className="text-sm text-gray-600">
              Operations: {Object.keys(operations).length}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {/* Notification Buttons */}
          <Button
            onClick={showSuccessNotification}
            variant="ghost"
            size="sm"
            icon={<CheckCircle className="w-4 h-4" />}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
          >
            Success
          </Button>

          <Button
            onClick={showErrorNotification}
            variant="ghost"
            size="sm"
            icon={<AlertCircle className="w-4 h-4" />}
            className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
          >
            Error
          </Button>

          <Button
            onClick={showWarningNotification}
            variant="ghost"
            size="sm"
            icon={<AlertTriangle className="w-4 h-4" />}
            className="bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
          >
            Warning
          </Button>

          <Button
            onClick={showInfoNotification}
            variant="ghost"
            size="sm"
            icon={<Info className="w-4 h-4" />}
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
          >
            Info
          </Button>

          {/* Loading Buttons */}
          <Button
            onClick={simulateLoading}
            variant="ghost"
            size="sm"
            icon={<Loader2 className="w-4 h-4" />}
            className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
          >
            Simulate Load
          </Button>

          <Button
            onClick={clearNotifications}
            variant="ghost"
            size="sm"
            icon={<Bell className="w-4 h-4" />}
            className="bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
          >
            Clear All
          </Button>

          {/* UI State Buttons */}
          <Button
            onClick={toggleAnimationPreference}
            variant="ghost"
            size="sm"
            icon={<Zap className="w-4 h-4" />}
            className={`${
              animationsEnabled
                ? "bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
            }`}
          >
            Animations
          </Button>

          <Button
            onClick={cycleTheme}
            variant="ghost"
            size="sm"
            icon={<Palette className="w-4 h-4" />}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200"
          >
            {theme}
          </Button>

          <Button
            onClick={cycleGlassIntensity}
            variant="ghost"
            size="sm"
            icon={<Settings className="w-4 h-4" />}
            className="bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border-cyan-200"
          >
            Glass: {glassIntensity}
          </Button>
        </div>

        <p className="text-xs text-gray-500 mt-3 text-center">
          This panel demonstrates Redux state management for UI preferences, notifications, and loading states.
        </p>
      </div>
    </motion.div>
  );
};