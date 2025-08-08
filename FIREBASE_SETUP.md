# Firebase Setup for Real-time Collaboration

## Step 1: Create Firebase Project

1. **Go to [Firebase Console](https://console.firebase.google.com/)**
2. **Click "Create a project"**
3. **Enter project name**: `calendar-tracker-xxxxx` (replace xxxxx with random numbers)
4. **Click "Continue"**
5. **Disable Google Analytics** (optional, for simplicity)
6. **Click "Create project"**

## Step 2: Enable Realtime Database

1. **In Firebase Console**, click **"Realtime Database"** in the left sidebar
2. **Click "Create database"**
3. **Choose location**: Select closest to your team
4. **Start in test mode** (for now, we'll secure it later)
5. **Click "Enable"**

## Step 3: Get Configuration

1. **Click the gear icon** (⚙️) next to "Project Overview"
2. **Select "Project settings"**
3. **Scroll down to "Your apps"** section
4. **Click the web icon** (</>)
5. **Register app** with name: "Calendar Tracker"
6. **Copy the config object**

## Step 4: Update Configuration

1. **Open `firebase-config.js`** in your project
2. **Replace the placeholder config** with your actual Firebase config
3. **Save the file**

## Step 5: Test Real-time Collaboration

1. **Open the calendar app** in multiple browser tabs/windows
2. **Make selections** in one tab
3. **Watch them appear** in real-time in other tabs
4. **Share the app URL** with your team

## Security Rules (Optional)

In Firebase Console → Realtime Database → Rules:

```json
{
  "rules": {
    "calendar": {
      "$month": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

## Free Tier Limits

- **1GB storage** (plenty for calendar data)
- **10GB/month bandwidth** (more than enough)
- **50,000 reads/day** and **20,000 writes/day**
- **Real-time updates** included

## Troubleshooting

- **Check browser console** for errors
- **Verify Firebase config** is correct
- **Ensure database rules** allow read/write
- **Check network connection**

## Team Usage

1. **Share the app URL** with your team
2. **Everyone can see** real-time updates
3. **No login required** (for simplicity)
4. **Data persists** across sessions 