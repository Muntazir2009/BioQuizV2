// Firebase configuration - REPLACE WITH YOUR OWN CONFIG
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
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
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// DOM elements
const chatBubble = document.getElementById('chatBubble');
const chatWindow = document.getElementById('chatWindow');
const closeChat = document.getElementById('closeChat');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const namePrompt = document.getElementById('namePrompt');
const nameInput = document.getElementById('nameInput');
const nameSubmit = document.getElementById('nameSubmit');

// User data
let userName = localStorage.getItem('chatUserName');

// Check if user has a name
if (!userName) {
  namePrompt.style.display = 'block';
} else {
  initializeChat();
}

// Name submit handler
nameSubmit.addEventListener('click', () => {
  const name = nameInput.value.trim();
  if (name) {
    userName = name;
    localStorage.setItem('chatUserName', userName);
    namePrompt.style.display = 'none';
    initializeChat();
  }
});

// Allow enter key for name input
nameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    nameSubmit.click();
  }
});

// Initialize chat
function initializeChat() {
  loadMessages();
  listenForMessages();
}

// Load existing messages
function loadMessages() {
  const messagesRef = database.ref('messages');
  messagesRef.once('value', (snapshot) => {
    const messages = snapshot.val();
    if (messages) {
      Object.values(messages).forEach(displayMessage);
    }
  });
}

// Listen for new messages
function listenForMessages() {
  const messagesRef = database.ref('messages');
  messagesRef.on('child_added', (snapshot) => {
    const message = snapshot.val();
    displayMessage(message);
  });
}

// Display message
function displayMessage(message) {
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
  const text = chatInput.value.trim();
  if (text && userName) {
    const message = {
      sender: userName,
      text: text,
      timestamp: Date.now()
    };
    
    const messagesRef = database.ref('messages');
    messagesRef.push(message);
    
    chatInput.value = '';
  }
}

// Event listeners
chatBubble.addEventListener('click', () => {
  chatWindow.classList.toggle('show');
});

closeChat.addEventListener('click', () => {
  chatWindow.classList.remove('show');
});

sendBtn.addEventListener('click', sendMessage);

chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

// Close chat when clicking outside (optional)
document.addEventListener('click', (e) => {
  if (!chatWindow.contains(e.target) && !chatBubble.contains(e.target)) {
    chatWindow.classList.remove('show');
  }
});
