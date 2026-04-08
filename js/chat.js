// Import Firebase SDK (modular)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import { getDatabase, ref, push, onChildAdded, get } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js';

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

  // Check if user has a name
  if (!userName) {
    if (namePrompt) namePrompt.style.display = 'block';
  } else {
    initializeChat();
  }

  // Name submit handler
  if (nameSubmit) {
    nameSubmit.addEventListener('click', () => {
      const name = nameInput.value.trim();
      if (name) {
        userName = name;
        localStorage.setItem('chatUserName', userName);
        if (namePrompt) namePrompt.style.display = 'none';
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

  // Chat bubble toggle
  if (chatBubble) {
    chatBubble.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent click from triggering outside click handler
      if (chatWindow) chatWindow.classList.toggle('show');
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

  // Close chat when clicking outside (skip if clicking bubble or window)
  document.addEventListener('click', (e) => {
    if (chatWindow && !chatWindow.contains(e.target) && !chatBubble.contains(e.target)) {
      chatWindow.classList.remove('show');
    }
  });
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeChatUI);
} else {
  initializeChatUI();
}

// Initialize chat
function initializeChat() {
  if (database) {
    loadMessages();
    listenForMessages();
  } else {
    console.warn('Firebase database not initialized - messages disabled');
  }
}

// Load existing messages
function loadMessages() {
  if (!database) return;
  
  const messagesRef = ref(database, 'messages');
  get(messagesRef)
    .then((snapshot) => {
      const messages = snapshot.val();
      if (messages && chatMessages) {
        Object.values(messages).forEach(displayMessage);
      }
    })
    .catch(err => {
      console.warn('Error loading messages:', err);
    });
}

// Listen for new messages
function listenForMessages() {
  if (!database) return;
  
  const messagesRef = ref(database, 'messages');
  onChildAdded(messagesRef, (snapshot) => {
    const message = snapshot.val();
    displayMessage(message);
  }, (error) => {
    console.warn('Error listening for messages:', error);
  });
}

// Display message
function displayMessage(message) {
  if (!chatMessages) return;
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${message.sender === userName ? 'sent' : 'received'}`;
  
  const senderDiv = document.createElement('div');
  senderDiv.className = 'sender';
  senderDiv.textContent = message.sender;
  
  const textDiv = document.createElement('div');
  textDiv.textContent = message.text;
  
  messageDiv.appendChild(senderDiv);
  messageDiv.appendChild(textDiv);
  
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send message
function sendMessage() {
  if (!database) {
    alert('Chat is not configured yet.');
    return;
  }
  
  const text = chatInput.value.trim();
  if (text && userName) {
    const message = {
      sender: userName,
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