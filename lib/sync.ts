/**
 * Cross-tab synchronization utility
 * Keeps data in sync across multiple tabs/windows using BroadcastChannel API
 */

let channel: BroadcastChannel | null = null;

const initChannel = () => {
  if (typeof window !== 'undefined' && !channel) {
    try {
      channel = new BroadcastChannel('fitflow-sync');
    } catch (err) {
      // BroadcastChannel not supported, fallback to storage events
      console.log('BroadcastChannel not supported, using storage events');
    }
  }
};

export const syncStorage = {
  /**
   * Broadcast a storage update to other tabs
   */
  broadcast: (key: string, value: any) => {
    if (!channel) initChannel();

    if (channel) {
      channel.postMessage({
        type: 'storage-update',
        key,
        value,
        timestamp: Date.now(),
      });
    }

    // Also use storage event as fallback
    if (typeof window !== 'undefined') {
      const event = new StorageEvent('storage', {
        key,
        newValue: JSON.stringify(value),
        storageArea: localStorage,
      });
      window.dispatchEvent(event);
    }
  },

  /**
   * Listen for storage updates from other tabs
   */
  onUpdate: (callback: (key: string, value: any) => void) => {
    if (!channel) initChannel();

    if (channel) {
      channel.onmessage = (event) => {
        if (event.data.type === 'storage-update') {
          callback(event.data.key, event.data.value);
        }
      };
    }

    // Also listen to storage events for fallback
    if (typeof window !== 'undefined') {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.newValue && e.key) {
          try {
            callback(e.key, JSON.parse(e.newValue));
          } catch {
            callback(e.key, e.newValue);
          }
        }
      };

      window.addEventListener('storage', handleStorageChange);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  },

  /**
   * Cleanup channel on page unload
   */
  cleanup: () => {
    if (channel) {
      channel.close();
      channel = null;
    }
  },
};
