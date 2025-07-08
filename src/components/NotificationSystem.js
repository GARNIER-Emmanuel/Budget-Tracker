import React, { useEffect } from 'react';
import { useBudget, BUDGET_ACTIONS } from '../contexts/BudgetContext';

const NotificationSystem = () => {
  const { state, dispatch } = useBudget();

  useEffect(() => {
    // Auto-remove notifications after their duration
    const timeouts = state.notifications.map(notification => {
      if (notification.duration) {
        return setTimeout(() => {
          dispatch({
            type: BUDGET_ACTIONS.REMOVE_NOTIFICATION,
            payload: notification.id
          });
        }, notification.duration);
      } 
      return null;
    });

    return () => {
      timeouts.forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, [state.notifications, dispatch]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  const getNotificationClass = (type) => {
    switch (type) {
      case 'success':
        return 'notification-success';
      case 'error':
        return 'notification-error';
      case 'warning':
        return 'notification-warning';
      case 'info':
        return 'notification-info';
      default:
        return 'notification-default';
    }
  };

  const handleRemoveNotification = (id) => {
    dispatch({
      type: BUDGET_ACTIONS.REMOVE_NOTIFICATION,
      payload: id
    });
  };

  if (state.notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-container">
      {state.notifications.map(notification => (
        <div
          key={notification.id}
          className={`notification ${getNotificationClass(notification.type)}`}
          style={{
            animation: 'slideInRight 0.3s ease-out'
          }}
        >
          <div className="notification-content">
            <span className="notification-icon">
              {getNotificationIcon(notification.type)}
            </span>
            <span className="notification-message">
              {notification.message}
            </span>
          </div>
          <button
            onClick={() => handleRemoveNotification(notification.id)}
            className="notification-close"
            title="Close notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationSystem; 