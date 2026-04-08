// Import Firebase SDK (modular)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import { getDatabase, ref, push, onChildAdded, get, query, limitToLast } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js';

// Firebase configuration - Updated with your credentials
const firebaseConfig = {
  apiKey: "AIzaSyBvsLNXMGsr-XQF-GE-EET1YOnICSMicOA",
  authDomain: "bioquiz-chat.firebaseapp.com",
  databaseURL: "https://bioquiz-chat-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bioquiz-chat",
  storageBucket: "bioquiz-chat.firebasestorage.app",
  messagingSenderId: "616382882153",
  appId: "1:616382882153:web:9c8a32401be847468d1df8"
};

// Initialize Firebase
let database = null;
try {
  const app = initializeApp(firebaseConfig);
  database = getDatabase(app);
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// DOM elements
let chatBubble, chatWindow, closeChat, chatMessages, chatInput, sendBtn, namePrompt, nameInput, nameSubmit;

// User data
let userName = localStorage.getItem('chatUserName');
let userId = localStorage.getItem('chatUserId');
let userColor = localStorage.getItem('chatUserColor');
let loadedMessageIds = new Set(); // Track loaded message IDs to prevent duplicates
let isListening = false;

// Helper functions
function generateUserId() {
  return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

function getRandomColor() {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Initialize DOM and event listeners
function initializeChatUI() {
  chatBubble = document.getElementById('chatBubble');
  chatWindow = document.getElementById('chatWindow');
  closeChat = document.getElementById('closeChat');
  chatMessages = document.getElementById('chatMessages');
  chatInput = document.getElementById('chatInput');
  sendBtn = document.getElementById('sendBtn');
  namePrompt = document.getElementById('namePrompt');
  nameInput = document.getElementById('nameInput');
  nameSubmit = document.getElementById('nameSubmit');

  if (!chatBubble) {
    console.error('Chat elements not found in DOM');
    return;
  }

  // Don't show name prompt on init - only show when chat bubble is clicked
  if (namePrompt) namePrompt.style.display = 'none';

  // Name submit handler
  if (nameSubmit) {
    nameSubmit.addEventListener('click', () => {
      const name = nameInput.value.trim();
      if (name && name.length > 0) {
        userName = name;
        userId = generateUserId();
        userColor = getRandomColor();
        
        localStorage.setItem('chatUserName', userName);
        localStorage.setItem('chatUserId', userId);
        localStorage.setItem('chatUserColor', userColor);
        
        if (namePrompt) namePrompt.style.display = 'none';
        if (chatWindow) chatWindow.classList.add('show');
        
        // Clear input for next use
        nameInput.value = '';
        
        // Load and listen for messages
        initializeChat();
      }
    });
  }

  // Allow enter key for name input
  if (nameInput) {
    nameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        if (nameSubmit) nameSubmit.click();
      }
    });
  }

  // Chat bubble toggle - SHOW NAME PROMPT IF NO USERNAME
  if (chatBubble) {
    chatBubble.addEventListener('click', (e) => {
      e.stopPropagation();
      
      if (!userName) {
        // Show name prompt if user doesn't have a name yet
        if (namePrompt) {
          namePrompt.style.display = 'block';
          if (nameInput) nameInput.focus();
        }
      } else {
        // Toggle chat window if user already has a name
        if (chatWindow) {
          chatWindow.classList.toggle('show');
          if (chatWindow.classList.contains('show') && chatInput) {
            chatInput.focus();
          }
        }
      }
    });
  }

  // Close chat button
  if (closeChat) {
    closeChat.addEventListener('click', (e) => {
      e.stopPropagation();
      if (chatWindow) chatWindow.classList.remove('show');
    });
  }

  // Send message button
  if (sendBtn) {
    sendBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sendMessage();
    });
  }

  // Enter key to send
  if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  // Close chat when clicking outside
  document.addEventListener('click', (e) => {
    if (chatWindow && !chatWindow.contains(e.target) && !chatBubble.contains(e.target)) {
      chatWindow.classList.remove('show');
    }
  });

  // Load messages if user already exists
  if (userName) {
    if (!isListening) {
      initializeChat();
    }
  }
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeChatUI);
} else {
  initializeChatUI();
}

// Initialize chat
function initializeChat() {
  if (database && userName) {
    loadMessages();
    listenForMessages();
  } else if (database && !userName) {
    console.warn('User name not set - messages not loaded');
  } else {
    console.warn('Firebase database not initialized - messages disabled');
  }
}

// Load existing messages (only fetch last 50 to avoid duplication)
function loadMessages() {
  if (!database) return;
  
  const messagesRef = ref(database, 'messages');
  const latestMessagesQuery = query(messagesRef, limitToLast(50));
  
  get(latestMessagesQuery)
    .then((snapshot) => {
      const messages = snapshot.val();
      if (messages) {
        Object.entries(messages).forEach(([messageId, message]) => {
          if (!loadedMessageIds.has(messageId)) {
            loadedMessageIds.add(messageId);
            displayMessage(message, messageId);
          }
        });
      }
    })
    .catch(err => {
      console.warn('Error loading messages:', err);
    });
}

// Listen for new messages
function listenForMessages() {
  if (!database || isListening) return;
  
  isListening = true;
  const messagesRef = ref(database, 'messages');
  
  onChildAdded(messagesRef, (snapshot) => {
    const messageId = snapshot.key;
    const message = snapshot.val();
    
    // Only add if we haven't already loaded it
    if (!loadedMessageIds.has(messageId)) {
      loadedMessageIds.add(messageId);
      displayMessage(message, messageId);
    }
  }, (error) => {
    console.warn('Error listening for messages:', error);
    isListening = false;
  });
}

// Display message with enhanced styling
function displayMessage(message) {
  if (!chatMessages) return;
  
  const isOwnMessage = message.senderId === userId;
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isOwnMessage ? 'sent' : 'received'}`;
  
  // Message container
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  
  // Sender info
  const senderDiv = document.createElement('div');
  senderDiv.className = 'message-sender';
  
  const senderNameSpan = document.createElement('span');
  senderNameSpan.className = 'sender-name';
  senderNameSpan.textContent = message.sender;
  senderNameSpan.style.color = message.senderColor || '#0070d1';
  
  const senderIdSpan = document.createElement('span');
  senderIdSpan.className = 'sender-id';
  senderIdSpan.textContent = ' #' + (message.senderId || '').substring(0, 8);
  
  senderDiv.appendChild(senderNameSpan);
  senderDiv.appendChild(senderIdSpan);
  
  // Message text
  const textDiv = document.createElement('div');
  textDiv.className = 'message-text';
  textDiv.textContent = message.text;
  
  // Timestamp
  const timeDiv = document.createElement('div');
  timeDiv.className = 'message-time';
  timeDiv.textContent = formatTime(message.timestamp || Date.now());
  
  contentDiv.appendChild(senderDiv);
  contentDiv.appendChild(textDiv);
  contentDiv.appendChild(timeDiv);
  
  messageDiv.appendChild(contentDiv);
  chatMessages.appendChild(messageDiv);
  
  // Auto scroll to latest message
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send message
function sendMessage() {
  if (!database) {
    console.warn('Chat is not configured yet.');
    return;
  }
  
  if (!chatInput || !chatMessages) {
    console.error('Chat DOM elements not found');
    return;
  }
  
  const text = chatInput.value.trim();
  if (text && userName && userId) {
    const message = {
      sender: userName,
      senderId: userId,
      senderColor: userColor,
      text: text,
      timestamp: Date.now()
    };
    
    const messagesRef = ref(database, 'messages');
    push(messagesRef, message)
      .then(() => {
        chatInput.value = '';
      })
      .catch(err => {
        console.error('Error sending message:', err);
      });
  }
}