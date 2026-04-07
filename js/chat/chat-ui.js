/**
 * Chat UI Module - Handles rendering and UI interactions
 */

export class ChatUI {
  constructor() {
    this.container = null;
    this.isOpen = false;
  }

  // Create floating button HTML
  createFloatingButton() {
    return `
      <button id="chat-floating-btn" class="chat-floating-btn" title="Open Chat">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span id="chat-notification-badge" class="chat-badge" style="display: none;">0</span>
      </button>
    `;
  }

  // Create chat panel HTML
  createChatPanel() {
    const html = `
      <div id="chat-panel" class="chat-panel" style="display: none;">
        <!-- Header -->
        <div class="chat-header">
          <div class="chat-title-bar">
            <div class="chat-header-left">
              <div class="chat-logo">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <h2>Messages</h2>
            </div>
            <div class="header-actions">
              <button class="header-btn" id="theme-toggle" title="Toggle theme">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              </button>
              <button class="header-btn close-btn" id="close-chat" title="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Auth Panel -->
        <div id="auth-panel" class="chat-section auth-section">
          <div class="auth-welcome">
            <div class="auth-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h3 class="auth-title">Welcome to Chat</h3>
            <p class="auth-subtitle">Connect with others, share ideas, and collaborate in real-time</p>
          </div>
          
          <div class="auth-forms">
            <!-- Login Form -->
            <form id="login-form" class="auth-form">
              <div class="form-group">
                <label for="login-username">Username</label>
                <input type="text" id="login-username" placeholder="Enter your @username" required>
              </div>
              <div class="form-group">
                <label for="login-password">Password <span class="optional-label">(optional)</span></label>
                <input type="password" id="login-password" placeholder="Enter password if set">
              </div>
              <button type="submit" class="btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
                Sign In
              </button>
              <div class="auth-divider">
                <span>or</span>
              </div>
              <button type="button" id="guest-login-btn" class="btn-secondary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Continue as Guest
              </button>
              <button type="button" id="switch-to-register" class="btn-link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <line x1="20" y1="8" x2="20" y2="14"></line>
                  <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
                Create New Account
              </button>
            </form>

            <!-- Register Form -->
            <form id="register-form" class="auth-form" style="display: none;">
              <div class="form-group">
                <label for="register-username">Username <span class="required-label">*</span></label>
                <input type="text" id="register-username" placeholder="Choose a unique @username" required>
              </div>
              <div class="form-group">
                <label for="register-display-name">Display Name</label>
                <input type="text" id="register-display-name" placeholder="Your public name">
              </div>
              <div class="form-group">
                <label for="register-password">Password <span class="optional-label">(optional)</span></label>
                <input type="password" id="register-password" placeholder="Secure your account">
              </div>
              <div class="form-group">
                <label for="register-about">Bio</label>
                <textarea id="register-about" placeholder="Tell us about yourself..." maxlength="200"></textarea>
                <span class="char-count">0/200</span>
              </div>
              <button type="submit" class="btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <line x1="20" y1="8" x2="20" y2="14"></line>
                  <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
                Create Account
              </button>
              <button type="button" id="switch-to-login" class="btn-link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
                Already have an account? Sign In
              </button>
            </form>
          </div>
        </div>

        <!-- Chat Panel (after auth) -->
        <div id="chat-main" class="chat-section" style="display: none;">
          <!-- Tabs -->
          <div class="chat-tabs">
            <button class="tab-btn active" data-tab="dms">Direct Messages</button>
            <button class="tab-btn" data-tab="groups">Groups</button>
            <button class="tab-btn" data-tab="profile">Profile</button>
          </div>

          <!-- DMs Tab -->
          <div id="dms-tab" class="tab-content active">
            <div class="new-dm-button">
              <button id="new-dm-btn" class="btn-primary">+ New Message</button>
            </div>
            <div id="dm-list" class="conversation-list"></div>
          </div>

          <!-- Groups Tab -->
          <div id="groups-tab" class="tab-content">
            <div class="new-group-button">
              <button id="new-group-btn" class="btn-primary">+ Create Group</button>
            </div>
            <div id="group-list" class="conversation-list"></div>
          </div>

          <!-- Profile Tab -->
          <div id="profile-tab" class="tab-content">
            <div id="profile-view" class="profile-section"></div>
            <button id="logout-btn" class="btn-danger">Logout</button>
          </div>

          <!-- Conversation View -->
          <div id="conversation-view" class="conversation-container" style="display: none;">
            <div class="conversation-header">
              <button id="back-to-list" class="back-btn">← Back</button>
              <div id="conv-title" class="conv-title"></div>
            </div>
            <div id="messages-container" class="messages-container"></div>
            <div class="message-input-area">
              <input type="text" id="message-input" placeholder="Type a message..." class="message-input">
              <button id="send-btn" class="btn-send">Send</button>
              <button id="file-upload-btn" class="btn-attachment" title="Attach file">📎</button>
              <input type="file" id="file-input" style="display: none;">
            </div>
          </div>
        </div>
      </div>
    `;
    return html;
  }

  // Initialize UI
  init() {
    // Check if already initialized
    if (document.getElementById('chat-panel')) {
      return;
    }

    // Create and append floating button
    const btnWrapper = document.createElement('div');
    btnWrapper.innerHTML = this.createFloatingButton();
    document.body.appendChild(btnWrapper.firstElementChild);

    // Create and append panel
    const panel = document.createElement('div');
    panel.innerHTML = this.createChatPanel();
    document.body.appendChild(panel.firstElementChild);

    // Setup floating button click handler
    this.setupFloatingButton();

    console.log('[ChatUI] UI initialized');
  }

  // Setup floating button
  setupFloatingButton() {
    const floatingBtn = document.getElementById('chat-floating-btn');
    if (floatingBtn) {
      floatingBtn.addEventListener('click', () => this.toggleChat());
    }
  }

  // Toggle chat panel
  toggleChat() {
    const panel = document.getElementById('chat-panel');
    const floatingBtn = document.getElementById('chat-floating-btn');
    
    if (panel) {
      this.isOpen = !this.isOpen;
      
      if (this.isOpen) {
        panel.style.display = 'flex';
        panel.classList.add('open');
        if (floatingBtn) floatingBtn.classList.add('active');
      } else {
        panel.classList.remove('open');
        if (floatingBtn) floatingBtn.classList.remove('active');
        // Add a delay before hiding to allow animation
        setTimeout(() => {
          if (!this.isOpen) {
            panel.style.display = 'none';
          }
        }, 300);
      }
    }
  }

  // Close chat panel
  closeChat() {
    const panel = document.getElementById('chat-panel');
    const floatingBtn = document.getElementById('chat-floating-btn');
    
    this.isOpen = false;
    
    if (panel) {
      panel.classList.remove('open');
      if (floatingBtn) floatingBtn.classList.remove('active');
      setTimeout(() => {
        panel.style.display = 'none';
      }, 300);
    }
  }

  // Open chat panel
  openChat() {
    const panel = document.getElementById('chat-panel');
    const floatingBtn = document.getElementById('chat-floating-btn');
    
    this.isOpen = true;
    
    if (panel) {
      panel.style.display = 'flex';
      panel.classList.add('open');
      if (floatingBtn) floatingBtn.classList.add('active');
    }
  }

  // Update notification badge
  updateNotificationBadge(count) {
    const badge = document.getElementById('chat-notification-badge');
    if (badge) {
      if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'block';
      } else {
        badge.style.display = 'none';
      }
    }
  }

  // Show conversation
  showConversation(conversationName) {
    const mainView = document.getElementById('conversation-view');
    const listView = document.getElementById('chat-main').querySelector('.tab-content.active');
    if (mainView && listView) {
      listView.style.display = 'none';
      mainView.style.display = 'block';
      document.getElementById('conv-title').textContent = conversationName;
    }
  }

  // Go back to list
  backToList() {
    const mainView = document.getElementById('conversation-view');
    const tabs = document.querySelectorAll('#chat-main .tab-content');
    if (mainView) {
      mainView.style.display = 'none';
    }
    if (tabs.length > 0) {
      tabs[0].style.display = 'block';
    }
  }

  // Show auth panel
  showAuthPanel() {
    const authPanel = document.getElementById('auth-panel');
    const chatMain = document.getElementById('chat-main');
    if (authPanel) authPanel.style.display = 'block';
    if (chatMain) chatMain.style.display = 'none';
  }

  // Show chat main
  showChatMain() {
    const authPanel = document.getElementById('auth-panel');
    const chatMain = document.getElementById('chat-main');
    if (authPanel) authPanel.style.display = 'none';
    if (chatMain) chatMain.style.display = 'block';
  }

  // Add message to conversation
  addMessage(username, text, isOwn = false, fileData = null) {
    const container = document.getElementById('messages-container');
    if (!container) return;

    const messageEl = document.createElement('div');
    messageEl.className = `message ${isOwn ? 'own' : 'other'}`;
    
    let fileHtml = '';
    if (fileData) {
      if (fileData.type.startsWith('image/')) {
        fileHtml = `<img src="${fileData.url}" class="message-image" alt="image">`;
      } else if (fileData.type.startsWith('video/')) {
        fileHtml = `<video class="message-video" controls><source src="${fileData.url}" type="${fileData.type}"></video>`;
      } else {
        fileHtml = `<a href="${fileData.url}" class="file-link" download>📥 ${fileData.name}</a>`;
      }
    }

    messageEl.innerHTML = `
      <div class="message-content">
        <div class="message-author">${username}</div>
        <div class="message-text">${text}</div>
        ${fileHtml}
      </div>
    `;

    container.appendChild(messageEl);
    container.scrollTop = container.scrollHeight;
  }

  // Clear messages
  clearMessages() {
    const container = document.getElementById('messages-container');
    if (container) {
      container.innerHTML = '';
    }
  }

  // Add conversation to list
  addConversationToList(id, name, lastMessage, unreadCount, tab = 'dms') {
    const list = document.getElementById(`${tab}-list`);
    if (!list) return;

    const convEl = document.createElement('div');
    convEl.className = 'conversation-item';
    convEl.dataset.conversationId = id;
    
    convEl.innerHTML = `
      <div class="conversation-info">
        <div class="conversation-name">${name}</div>
        <div class="conversation-preview">${lastMessage}</div>
      </div>
      ${unreadCount > 0 ? `<div class="unread-badge">${unreadCount}</div>` : ''}
    `;

    list.appendChild(convEl);
  }

  // Clear conversation list
  clearConversationList(tab = 'dms') {
    const list = document.getElementById(`${tab}-list`);
    if (list) {
      list.innerHTML = '';
    }
  }

  // Show typing indicator
  showTypingIndicator(username) {
    const container = document.getElementById('messages-container');
    if (!container) return;

    // Remove existing typing indicator
    this.hideTypingIndicator();

    const typingEl = document.createElement('div');
    typingEl.id = 'typing-indicator';
    typingEl.className = 'typing-indicator';
    typingEl.innerHTML = `
      <div class="typing-content">
        <span class="typing-user">${username}</span> is typing
        <span class="typing-dots">
          <span></span><span></span><span></span>
        </span>
      </div>
    `;

    container.appendChild(typingEl);
    container.scrollTop = container.scrollHeight;
  }

  // Hide typing indicator
  hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  // Show toast notification
  showToast(message, type = 'info') {
    // Remove existing toast
    const existingToast = document.querySelector('.chat-toast');
    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `chat-toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after delay
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Show loading state
  showLoading(container = 'messages-container') {
    const el = document.getElementById(container);
    if (!el) return;

    el.innerHTML = `
      <div class="chat-loading">
        <div class="chat-spinner"></div>
      </div>
    `;
  }

  // Show empty state
  showEmptyState(container, icon, title, description) {
    const el = document.getElementById(container);
    if (!el) return;

    el.innerHTML = `
      <div class="empty-state">
        ${icon}
        <h4>${title}</h4>
        <p>${description}</p>
      </div>
    `;
  }

  // Add message with timestamp and reactions
  addMessageEnhanced(username, text, isOwn = false, timestamp = null, reactions = [], fileData = null) {
    const container = document.getElementById('messages-container');
    if (!container) return;

    const messageEl = document.createElement('div');
    messageEl.className = `message ${isOwn ? 'own' : 'other'}`;
    
    const time = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    
    let fileHtml = '';
    if (fileData) {
      if (fileData.type && fileData.type.startsWith('image/')) {
        fileHtml = `<img src="${fileData.url}" class="message-image" alt="image">`;
      } else if (fileData.type && fileData.type.startsWith('video/')) {
        fileHtml = `<video class="message-video" controls><source src="${fileData.url}" type="${fileData.type}"></video>`;
      } else if (fileData.url) {
        fileHtml = `<a href="${fileData.url}" class="file-link" download>${fileData.name || 'Download'}</a>`;
      }
    }

    let reactionsHtml = '';
    if (reactions && reactions.length > 0) {
      reactionsHtml = `<div class="message-reactions">${reactions.map(r => `<span class="reaction">${r.emoji} ${r.count}</span>`).join('')}</div>`;
    }

    messageEl.innerHTML = `
      <div class="message-content">
        <div class="message-header">
          <span class="message-author">${username}</span>
          ${time ? `<span class="message-time">${time}</span>` : ''}
        </div>
        <div class="message-text">${this.formatMessageText(text)}</div>
        ${fileHtml}
        ${reactionsHtml}
      </div>
    `;

    container.appendChild(messageEl);
    container.scrollTop = container.scrollHeight;
  }

  // Format message text (links, mentions, etc.)
  formatMessageText(text) {
    if (!text) return '';
    
    // Escape HTML
    let formatted = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // Convert URLs to links
    formatted = formatted.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="message-link">$1</a>'
    );
    
    // Convert @mentions
    formatted = formatted.replace(
      /@([a-zA-Z0-9_]+)/g,
      '<span class="message-mention">@$1</span>'
    );
    
    // Convert line breaks
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
  }

  // Show user search modal for new DM
  showUserSearchModal() {
    const modal = document.createElement('div');
    modal.id = 'user-search-modal';
    modal.className = 'chat-modal';
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>New Message</h3>
          <button class="modal-close" id="close-user-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <input type="text" id="user-search-input" placeholder="Search for a user..." class="search-input">
          <div id="user-search-results" class="search-results"></div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Setup close
    document.getElementById('close-user-search').addEventListener('click', () => modal.remove());
    modal.querySelector('.modal-overlay').addEventListener('click', () => modal.remove());
  }

  // Show create group modal
  showCreateGroupModal() {
    const modal = document.createElement('div');
    modal.id = 'create-group-modal';
    modal.className = 'chat-modal';
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>Create Group</h3>
          <button class="modal-close" id="close-create-group">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Group Name</label>
            <input type="text" id="group-name-input" placeholder="Enter group name..." class="search-input">
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea id="group-desc-input" placeholder="What's this group about?" class="search-input" rows="3"></textarea>
          </div>
          <button class="btn-primary" id="create-group-submit" style="width: 100%;">Create Group</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Setup close
    document.getElementById('close-create-group').addEventListener('click', () => modal.remove());
    modal.querySelector('.modal-overlay').addEventListener('click', () => modal.remove());
  }

  // Update online status indicator
  updateOnlineStatus(isOnline) {
    const statusDot = document.getElementById('online-status-dot');
    if (statusDot) {
      statusDot.className = `status-dot ${isOnline ? 'online' : 'offline'}`;
    }
  }
}

// Export singleton
export const chatUI = new ChatUI();
export default ChatUI;
