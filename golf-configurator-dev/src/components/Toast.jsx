import { useState, useEffect } from 'preact/hooks';
import { cn } from '../lib/utils';

let toastId = 0;
const toastQueue = [];
let showToastFunction = null;

// Global toast function matching vanilla JS
export function showToast(message, type = 'info', duration = 3000) {
  const id = ++toastId;
  const toast = { id, message, type, duration };
  
  console.log(`📢 Toast: ${type.toUpperCase()} - ${message}`);
  
  if (showToastFunction) {
    showToastFunction(toast);
  } else {
    toastQueue.push(toast);
  }
}

export function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Set global toast function
    showToastFunction = (toast) => {
      setToasts(current => [...current, toast]);
      
      // Auto remove
      setTimeout(() => {
        setToasts(current => current.filter(t => t.id !== toast.id));
      }, toast.duration);
    };

    // Process queued toasts
    toastQueue.forEach(toast => showToastFunction(toast));
    toastQueue.length = 0;

    return () => {
      showToastFunction = null;
    };
  }, []);

  const removeToast = (id) => {
    setToasts(current => current.filter(t => t.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <ToastItem 
          key={toast.id}
          toast={toast}
          onRemove={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger show animation
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(onRemove, 300);
  };

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-black';
      default:
        return 'bg-card text-card-foreground border';
    }
  };

  const getToastIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div
      className={cn(
        'toast max-w-sm p-4 rounded-lg shadow-lg transition-all duration-300',
        getToastStyles(),
        isVisible 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getToastIcon()}</span>
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
        <button 
          onClick={handleRemove}
          className="ml-3 hover:opacity-70 transition-opacity"
        >
          ×
        </button>
      </div>
    </div>
  );
}

// Export for use in other components
window.showToast = showToast;