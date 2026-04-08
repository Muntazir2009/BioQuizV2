# BioQuiz Real-Time Chat System Setup

This guide will help you set up the real-time chat system for your BioQuiz site using Firebase (free tier).

## Features
- Real-time messaging
- Sleek, modern UI
- Name prompt on first visit
- Responsive design
- Flagship performance with Firebase

## Prerequisites
- A Google account
- Basic knowledge of Firebase console

## Step 1: Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name (e.g., "bioquiz-chat")
4. Enable Google Analytics if desired (optional)
5. Choose default settings and create project

## Step 2: Enable Realtime Database
1. In your Firebase project, go to "Realtime Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location for your database
5. Click "Done"

## Step 3: Get Firebase Configuration
1. In Firebase console, click the gear icon → "Project settings"
2. Scroll down to "Your apps" section
3. Click "Add app" → Web app (</>)
4. Enter app nickname (e.g., "BioQuiz Chat")
5. Check "Also set up Firebase Hosting" if you want (optional)
6. Click "Register app"
7. Copy the config object (apiKey, authDomain, etc.)

## Step 4: Update Chat Configuration
1. Open `js/chat.js` in your project
2. Replace the `firebaseConfig` object with your actual config from Step 3
3. Save the file

## Step 5: Set Database Rules (Optional for Test Mode)
If you chose test mode, it's already permissive. For production:
1. Go to Realtime Database → Rules
2. Set rules to allow read/write:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
3. Click "Publish"

## Step 6: Test the Chat
1. Open your site (index.html or quiz.html)
2. Click the chat bubble in the bottom right
3. Enter your name when prompted
4. Send messages and test real-time updates in multiple browser tabs/windows

## Adding Chat to More Pages
The chat is currently added to `index.html` and `quiz.html`. To add to other pages:
1. Add `<link rel="stylesheet" href="css/chat.css">` in the `<head>`
2. Add the chat HTML and scripts before `</body>` (copy from index.html)

## Customization
- Modify `css/chat.css` for styling changes
- Update `js/chat.js` for additional features
- Change the chat header text in the HTML

## Security Notes
- Test mode allows anyone to read/write - suitable for development
- For production, implement Firebase Authentication for secure access
- Consider adding message validation and rate limiting

## Troubleshooting
- If chat doesn't load, check browser console for Firebase errors
- Ensure Firebase config is correct
- Verify internet connection for real-time features

## Support
Firebase provides excellent documentation at [firebase.google.com/docs](https://firebase.google.com/docs)