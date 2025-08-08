// Simple Firebase Test - Copy and paste this into your browser console

console.log('=== FIREBASE CONNECTION TEST ===');

// Test 1: Check if Firebase is loaded
console.log('1. Checking Firebase SDK...');
if (typeof firebase !== 'undefined') {
    console.log('✅ Firebase SDK is loaded');
} else {
    console.log('❌ Firebase SDK is not loaded');
    console.log('Make sure you have the Firebase scripts in your HTML');
}

// Test 2: Check if database is available
console.log('2. Checking database...');
if (typeof database !== 'undefined' && database !== null) {
    console.log('✅ Database reference is available');
} else {
    console.log('❌ Database reference is not available');
}

// Test 3: Manual Firebase test
console.log('3. Testing Firebase manually...');
if (typeof firebase !== 'undefined') {
    try {
        // Test configuration
        const config = {
            apiKey: "AIzaSyBNEGMwnn075RYYxXc9NQNCGoYtrhq_Q_0",
            authDomain: "monthlycalendartracker.firebaseapp.com",
            databaseURL: "https://monthlycalendartracker-default-rtdb.firebaseio.com",
            projectId: "monthlycalendartracker",
            storageBucket: "monthlycalendartracker.firebasestorage.app",
            messagingSenderId: "151202130765",
            appId: "1:151202130765:web:563379d60ebb44a0bce504",
            measurementId: "G-E3RBH9FV5Q"
        };
        
        // Initialize Firebase
        firebase.initializeApp(config);
        console.log('✅ Firebase initialized');
        
        // Get database
        const db = firebase.database();
        console.log('✅ Database reference created');
        
        // Test write
        const testRef = db.ref('console-test');
        testRef.set({
            message: 'Test from console',
            timestamp: Date.now()
        }).then(() => {
            console.log('✅ Write test successful');
            
            // Test read
            return testRef.once('value');
        }).then((snapshot) => {
            const data = snapshot.val();
            console.log('✅ Read test successful');
            console.log('Data:', data);
            
            // Clean up
            return testRef.remove();
        }).then(() => {
            console.log('✅ Cleanup successful');
            console.log('🎉 ALL TESTS PASSED! Firebase is working correctly.');
        }).catch((error) => {
            console.error('❌ Test failed:', error);
            console.log('Error code:', error.code);
            console.log('Error message:', error.message);
        });
        
    } catch (error) {
        console.error('❌ Firebase test failed:', error);
    }
} else {
    console.log('❌ Cannot test Firebase - SDK not loaded');
}

console.log('=== TEST COMPLETE ==='); 