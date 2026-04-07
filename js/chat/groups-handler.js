/**
 * Groups Handler Module
 * Handles group creation, management, and UI interactions
 */

export class GroupsHandler {
  constructor(supabaseClient, authManager, ui) {
    this.supabase = supabaseClient;
    this.auth = authManager;
    this.ui = ui;
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Create group button
    const createGroupBtn = document.getElementById('new-group-btn');
    if (createGroupBtn) {
      createGroupBtn.addEventListener('click', () => this.showCreateGroupModal());
    }
  }

  // Show create group modal
  showCreateGroupModal() {
    // Remove existing modal
    const existingModal = document.getElementById('create-group-modal');
    if (existingModal) existingModal.remove();

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
          <form id="create-group-form">
            <div class="form-group">
              <label for="group-name">Group Name <span class="required-label">*</span></label>
              <input type="text" id="group-name" placeholder="Enter group name..." required>
            </div>
            <div class="form-group">
              <label for="group-description">Description</label>
              <textarea id="group-description" placeholder="What's this group about?" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label>Add Members</label>
              <input type="text" id="member-search" placeholder="Search users to add...">
              <div id="member-search-results" class="search-results"></div>
              <div id="selected-members" class="selected-members"></div>
            </div>
            <button type="submit" class="btn-primary" style="width: 100%;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Create Group
            </button>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Setup event listeners
    this.setupModalEvents(modal);
  }

  setupModalEvents(modal) {
    // Close modal
    const closeBtn = document.getElementById('close-create-group');
    const overlay = modal.querySelector('.modal-overlay');
    
    closeBtn?.addEventListener('click', () => modal.remove());
    overlay?.addEventListener('click', () => modal.remove());

    // Member search
    const memberSearch = document.getElementById('member-search');
    let searchTimeout;
    memberSearch?.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => this.searchUsers(e.target.value), 300);
    });

    // Form submit
    const form = document.getElementById('create-group-form');
    form?.addEventListener('submit', (e) => this.handleCreateGroup(e, modal));

    // Track selected members
    this.selectedMembers = [];
  }

  // Search users
  async searchUsers(query) {
    if (!query || query.length < 2) {
      document.getElementById('member-search-results').innerHTML = '';
      return;
    }

    try {
      const { data, error } = await this.supabase
        .from('chat_users')
        .select('id, username, display_name, avatar_url')
        .ilike('username', `%${query}%`)
        .limit(5);

      if (error) throw error;

      const currentUser = this.auth.getCurrentUser();
      const results = data.filter(u => u.id !== currentUser?.id && !this.selectedMembers.find(m => m.id === u.id));

      this.displaySearchResults(results);
    } catch (err) {
      console.error('[GroupsHandler] Search error:', err);
    }
  }

  displaySearchResults(users) {
    const container = document.getElementById('member-search-results');
    if (!container) return;

    if (users.length === 0) {
      container.innerHTML = '<div class="no-results">No users found</div>';
      return;
    }

    container.innerHTML = users.map(user => `
      <div class="search-result-item" data-user-id="${user.id}" data-username="${user.username}" data-display-name="${user.display_name || user.username}">
        <div class="search-result-avatar">${(user.display_name || user.username).charAt(0).toUpperCase()}</div>
        <div class="search-result-info">
          <div class="search-result-name">${user.display_name || user.username}</div>
          <div class="search-result-username">@${user.username}</div>
        </div>
        <button type="button" class="btn-add-member">Add</button>
      </div>
    `).join('');

    // Add click handlers
    container.querySelectorAll('.btn-add-member').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const item = e.target.closest('.search-result-item');
        this.addMember({
          id: item.dataset.userId,
          username: item.dataset.username,
          display_name: item.dataset.displayName
        });
      });
    });
  }

  addMember(user) {
    if (this.selectedMembers.find(m => m.id === user.id)) return;

    this.selectedMembers.push(user);
    this.updateSelectedMembersDisplay();
    document.getElementById('member-search').value = '';
    document.getElementById('member-search-results').innerHTML = '';
  }

  removeMember(userId) {
    this.selectedMembers = this.selectedMembers.filter(m => m.id !== userId);
    this.updateSelectedMembersDisplay();
  }

  updateSelectedMembersDisplay() {
    const container = document.getElementById('selected-members');
    if (!container) return;

    container.innerHTML = this.selectedMembers.map(m => `
      <div class="selected-member" data-user-id="${m.id}">
        <span>${m.display_name || m.username}</span>
        <button type="button" class="remove-member">&times;</button>
      </div>
    `).join('');

    container.querySelectorAll('.remove-member').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const memberId = e.target.closest('.selected-member').dataset.userId;
        this.removeMember(memberId);
      });
    });
  }

  // Create group
  async handleCreateGroup(e, modal) {
    e.preventDefault();

    const name = document.getElementById('group-name').value.trim();
    const description = document.getElementById('group-description').value.trim();

    if (!name) {
      this.ui?.showToast('Please enter a group name', 'error');
      return;
    }

    const currentUser = this.auth.getCurrentUser();
    if (!currentUser) {
      this.ui?.showToast('Please log in first', 'error');
      return;
    }

    try {
      // Create conversation
      const { data: conversation, error: convError } = await this.supabase
        .from('conversations')
        .insert([{
          type: 'group',
          name: name,
          description: description,
          created_by: currentUser.id
        }])
        .select()
        .single();

      if (convError) throw convError;

      // Add creator as admin
      const participants = [
        { conversation_id: conversation.id, user_id: currentUser.id, role: 'admin' },
        ...this.selectedMembers.map(m => ({
          conversation_id: conversation.id,
          user_id: m.id,
          role: 'member'
        }))
      ];

      const { error: partError } = await this.supabase
        .from('conversation_participants')
        .insert(participants);

      if (partError) throw partError;

      // Send system message
      await this.supabase
        .from('messages')
        .insert([{
          conversation_id: conversation.id,
          sender_id: currentUser.id,
          content: `${currentUser.display_name || currentUser.username} created the group "${name}"`,
          message_type: 'system'
        }]);

      this.ui?.showToast('Group created successfully!', 'success');
      modal.remove();

      // Refresh groups list
      await this.loadGroups();
    } catch (err) {
      console.error('[GroupsHandler] Create group error:', err);
      this.ui?.showToast('Failed to create group: ' + err.message, 'error');
    }
  }

  // Load user's groups
  async loadGroups() {
    const currentUser = this.auth.getCurrentUser();
    if (!currentUser) return;

    try {
      // Get conversations where user is participant
      const { data: participations, error: partError } = await this.supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', currentUser.id);

      if (partError) throw partError;

      const convIds = participations.map(p => p.conversation_id);
      
      if (convIds.length === 0) {
        this.displayEmptyGroups();
        return;
      }

      // Get group conversations
      const { data: groups, error: groupError } = await this.supabase
        .from('conversations')
        .select('*')
        .in('id', convIds)
        .eq('type', 'group')
        .order('updated_at', { ascending: false });

      if (groupError) throw groupError;

      this.displayGroups(groups);
    } catch (err) {
      console.error('[GroupsHandler] Load groups error:', err);
    }
  }

  displayGroups(groups) {
    const list = document.getElementById('group-list');
    if (!list) return;

    if (groups.length === 0) {
      this.displayEmptyGroups();
      return;
    }

    list.innerHTML = groups.map(group => `
      <div class="conversation-item" data-conversation-id="${group.id}">
        <div class="conversation-avatar group-avatar">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <div class="conversation-info">
          <div class="conversation-name">${group.name}</div>
          <div class="conversation-preview">${group.description || 'No description'}</div>
        </div>
      </div>
    `).join('');

    // Add click handlers
    list.querySelectorAll('.conversation-item').forEach(item => {
      item.addEventListener('click', () => {
        const convId = item.dataset.conversationId;
        const name = item.querySelector('.conversation-name').textContent;
        this.openGroup(convId, name);
      });
    });
  }

  displayEmptyGroups() {
    const list = document.getElementById('group-list');
    if (!list) return;

    list.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        <h4>No Groups Yet</h4>
        <p>Create a group to start chatting with multiple people</p>
      </div>
    `;
  }

  async openGroup(conversationId, name) {
    if (this.ui) {
      this.ui.showConversation(name);
    }

    // Emit event for messaging handler to load messages
    const event = new CustomEvent('openConversation', {
      detail: { conversationId, name, type: 'group' }
    });
    document.dispatchEvent(event);
  }
}

export default GroupsHandler;
