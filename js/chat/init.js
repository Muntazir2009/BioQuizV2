/**
 * Chat System Initializer
 * This file initializes the entire chat system globally
 */

// Import all chat modules
import AuthManager from './auth.js';
import ProfileManager from './profile.js';
import MessagingManager from './messaging.js';
import StorageManager from './storage.js';
import ThemeManager from './theme.js';
import AuthHandler from './auth-handler.js';
import MessagingHandler from './messaging-handler.js';
import GroupsHandler from './groups-handler.js';

/**
 * Initialize chat system
 */
async function initializeChat() {
  console.log('[Chat Init] Starting chat system initialization...');

  try {
    // Get Supabase client from global
    if (!window.supabase || !window.supabase.createClient) {
      console.error('[Chat Init] Supabase not available');
      return;
    }

    const { createClient } = window.supabase;
    const url = localStorage.getItem('SUPABASE_URL');
    const key = localStorage.getItem('SUPABASE_ANON_KEY');

    if (!url || !key) {
      console.error('[Chat Init] Missing Supabase credentials');
      return;
    }

    const supabase = createClient(url, key);

    // Initialize managers
    const authManager = new AuthManager(supabase);
    const profileManager = new ProfileManager(supabase, authManager);
    const messagingManager = new MessagingManager(supabase, authManager);
    const storageManager = new StorageManager(supabase);
    const themeManager = new ThemeManager();

    // Initialize UI
    const ChatUI = (await import('./chat-ui.js')).ChatUI;
    const chatUI = new ChatUI();
    chatUI.init();

    // Initialize handlers
    const authHandler = new AuthHandler(authManager, profileManager, themeManager, chatUI);
    const messagingHandler = new MessagingHandler(messagingManager, storageManager, authManager, chatUI);
    const groupsHandler = new GroupsHandler(supabase, authManager, chatUI);

    // Make available globally
    window.chatSystem = {
      auth: authManager,
      profile: profileManager,
      messaging: messagingManager,
      storage: storageManager,
      theme: themeManager,
      ui: chatUI,
      handlers: {
        auth: authHandler,
        messaging: messagingHandler,
        groups: groupsHandler
      },
      supabase: supabase
    };

    // Initialize groups handler
    groupsHandler.init();

    console.log('[Chat Init] ✓ All managers initialized');

    // Check if user is already logged in
    const currentUser = authManager.getCurrentUser();
    if (currentUser) {
      console.log('[Chat Init] ✓ User logged in:', currentUser.username);
      chatUI.showChatMain();
      
      // Check if this is a local guest
      if (currentUser.isLocalGuest) {
        window.chatSystem.handlers.auth.displayGuestProfile(currentUser);
      }
    } else {
      console.log('[Chat Init] No logged-in user detected');
      chatUI.showAuthPanel();
    }

    // Chat starts closed by default - user clicks the floating button to open
    console.log('[Chat Init] ✓ Chat system fully initialized! Click the chat icon to open.');
  } catch (error) {
    console.error('[Chat Init] Initialization error:', error);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeChat);
} else {
  initializeChat();
}

console.log('[Chat Init] Chat system loader ready');
