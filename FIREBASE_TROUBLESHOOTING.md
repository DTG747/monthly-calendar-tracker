# Firebase Troubleshooting Guide

## 🔍 **Step 1: Check Console Messages**

Open the calendar app and press **F12** to open developer tools. Look for these messages:

### ✅ **Good Messages:**
```
Firebase initialized successfully
Database reference created successfully
✅ Firebase is loaded and initialized
✅ Database reference is available
```

### ❌ **Bad Messages:**
```
Firebase is not loaded!
Database is not initialized!
❌ Firebase is not properly loaded
❌ Database reference is not available
```

## 🔧 **Step 2: Test Firebase Connection**

In the browser console, run:
```javascript
testFirebase()
```

This will test if Firebase can write data.

## 🛠️ **Step 3: Check Firebase Project**

1. **Go to [Firebase Console](https://console.firebase.google.com/)**
2. **Select your project:** `monthlycalendartracker`
3. **Check these settings:**

### **Realtime Database:**
- Go to **Realtime Database** in the left sidebar
- Make sure it's **enabled**
- Check the **rules** tab - should allow read/write:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### **Project Settings:**
- Go to **Project Settings** (gear icon)
- Check that your **API key** matches the one in `firebase-config.js`
- Verify **database URL** is correct

## 🌐 **Step 4: Network Issues**

### **Try these:**
- **Different browser** (Chrome, Firefox, Safari)
- **Mobile device** (different network)
- **Disable VPN** if using one
- **Clear browser cache**

## 📱 **Step 5: Test on Different Device**

Try opening the app on:
- **Phone** (mobile browser)
- **Tablet**
- **Different computer**

## 🚨 **Common Issues:**

### **1. Database Rules Too Restrictive**
- Firebase rules blocking read/write
- Solution: Set rules to allow all access (for testing)

### **2. Project Not Enabled**
- Realtime Database not enabled
- Solution: Enable in Firebase Console

### **3. Network/Firewall**
- Corporate firewall blocking Firebase
- Solution: Try different network

### **4. Browser Extensions**
- Ad blockers or privacy extensions
- Solution: Disable extensions temporarily

## 🧪 **Manual Test:**

If nothing works, try this in console:
```javascript
// Test basic Firebase functionality
if (typeof firebase !== 'undefined') {
  console.log('Firebase loaded');
  const testRef = firebase.database().ref('test');
  testRef.set({test: 'data'}).then(() => {
    console.log('Write successful');
    testRef.remove();
  }).catch(error => {
    console.error('Write failed:', error);
  });
} else {
  console.log('Firebase not loaded');
}
```

## 📞 **Next Steps:**

1. **Check console messages** first
2. **Run the test functions** in console
3. **Verify Firebase project settings**
4. **Try different device/network**

Let me know what you see in the console! 