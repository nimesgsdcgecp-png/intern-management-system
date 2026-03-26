"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useNotifications } from '../lib/redux/hooks';
import { removeNotification } from '../lib/redux/slices/notificationSlice';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const NotificationToast: React.FC<{ notification: any }> = ({ notification }) => {
  const dispatch = useAppDispatch();

  // Auto remove non-persistent notifications
  useEffect(() => {
    if (!notification.persistent && notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        dispatch(removeNotification(notification.id));
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification, dispatch]);

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case 'success':
        return 'border-l-emerald-500';
      case 'error':
        return 'border-l-red-500';
      case 'warning':
        return 'border-l-amber-500';
      case 'info':
        return 'border-l-blue-500';
      default:
        return 'border-l-gray-500';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={`
        relative overflow-hidden max-w-sm w-full
        glass-card border-l-4 ${getBorderColor()}
        shadow-lg hover:shadow-xl
        transition-all duration-200
        group cursor-pointer
      `}
      onClick={() => dispatch(removeNotification(notification.id))}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      {/* Progress bar for timed notifications */}
      {notification.duration && notification.duration > 0 && (
        <motion.div
          className="absolute top-0 left-0 h-1 bg-linear-to-r from-blue-500 to-emerald-500 rounded-full"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: notification.duration / 1000, ease: 'linear' }}
        />
      )}

      <div className="p-4">
        <div className="flex items-start">
          <div className="shrink-0 mr-3 mt-0.5">
            {getIcon()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  {notification.title}
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {notification.message}
                </p>

                {notification.action && (
                  <motion.button
                    className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      notification.action.onClick();
                      dispatch(removeNotification(notification.id));
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {notification.action.label}
                  </motion.button>
                )}
              </div>

              <motion.button
                className="ml-4 text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch(removeNotification(notification.id));
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const NotificationCenter: React.FC = () => {
  const { notifications } = useNotifications();

  // Fixed position since position setting was removed during simplification
  const positionClasses = 'fixed top-4 right-4 z-50';

  return (
    <div className={positionClasses}>
      <AnimatePresence mode="popLayout">
        <div className="flex flex-col gap-3">
          {notifications.map((notification) => (
            <NotificationToast
              key={notification.id}
              notification={notification}
            />
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
};