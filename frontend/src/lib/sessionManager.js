// Session Manager for Chat System
// Handles session-based storage for chat data that gets cleared when tab is closed

class SessionManager {
  constructor() {
    this.prefix = 'jharkhand_chat_';
  }

  // Set item in sessionStorage
  setItem(key, value) {
    try {
      const prefixedKey = this.prefix + key;
      sessionStorage.setItem(prefixedKey, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error setting session item:', error);
      return false;
    }
  }

  // Get item from sessionStorage
  getItem(key, defaultValue = null) {
    try {
      const prefixedKey = this.prefix + key;
      const item = sessionStorage.getItem(prefixedKey);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error getting session item:', error);
      return defaultValue;
    }
  }

  // Remove item from sessionStorage
  removeItem(key) {
    try {
      const prefixedKey = this.prefix + key;
      sessionStorage.removeItem(prefixedKey);
      return true;
    } catch (error) {
      console.error('Error removing session item:', error);
      return false;
    }
  }

  // Clear all chat-related session data
  clearAll() {
    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          sessionStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Error clearing session data:', error);
      return false;
    }
  }

  // Check if session storage is available
  isAvailable() {
    try {
      const testKey = this.prefix + 'test';
      sessionStorage.setItem(testKey, 'test');
      sessionStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get all chat-related keys
  getAllKeys() {
    try {
      const keys = Object.keys(sessionStorage);
      return keys.filter(key => key.startsWith(this.prefix));
    } catch (error) {
      console.error('Error getting session keys:', error);
      return [];
    }
  }

  // Get storage size (approximate)
  getStorageSize() {
    try {
      const keys = this.getAllKeys();
      let size = 0;
      keys.forEach(key => {
        size += sessionStorage.getItem(key).length;
      });
      return size;
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return 0;
    }
  }
}

// Create singleton instance
const sessionManager = new SessionManager();

// Export both the class and instance
export { SessionManager, sessionManager };
export default sessionManager;
