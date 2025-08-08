// Core Application State
let appState = {
  currentMonth: new Date(),
  participants: ['Amit', 'Ben', 'Brian', 'Chris', 'Ilya', 'Krystian', 'Tom'],
  selections: {},
  lastUpdated: new Date(),
  personOfTheMonth: null
};

// Firebase real-time sync
let isInitialLoad = true;
let currentUser = null;

// DOM Elements
const monthDisplay = document.getElementById('monthDisplay');
const personOfMonthDisplay = document.getElementById('personOfMonthDisplay');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const participantInputs = document.getElementById('participantInputs');
const calendarGrid = document.getElementById('calendarGrid');
const topDates = document.getElementById('topDates');
const saveBtn = document.getElementById('saveBtn');
const clearBtn = document.getElementById('clearBtn');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const connectionStatus = document.getElementById('connectionStatus');

// Initialize Application
function initializeApp() {
  console.log('Initializing calendar app...');
  
  calculatePersonOfTheMonth();
  renderParticipants();
  renderCalendar();
  updateSummary();
  updatePersonOfMonthDisplay();
  setupEventListeners();
  
  // Only try Firebase if it's available
  if (window.firebaseAvailable && typeof firebase !== 'undefined') {
    console.log('Firebase available, initializing sync...');
    initializeFirebaseSync();
  } else {
    console.log('Firebase not available, using local storage only');
    // Load from localStorage instead
    loadFromLocalStorage();
  }
  
  // Update connection status
  updateConnectionStatus();
  
  // Debug: Check Firebase status after initialization
  setTimeout(() => {
    console.log('Firebase status check:');
    console.log('- Firebase loaded:', typeof firebase !== 'undefined');
    console.log('- Firebase available flag:', window.firebaseAvailable);
    console.log('- Calendar database:', typeof window.calendarDatabase);
    console.log('- Connection status:', connectionStatus ? connectionStatus.textContent : 'Element not found');
  }, 2000);
}

// Event Listeners
function setupEventListeners() {
  console.log('Setting up event listeners');
  console.log('Save button:', saveBtn);
  
  prevMonthBtn.addEventListener('click', () => changeMonth(-1));
  nextMonthBtn.addEventListener('click', () => changeMonth(1));
  
  if (saveBtn) {
    saveBtn.addEventListener('click', saveSelections);
    console.log('Save button event listener added');
  } else {
    console.error('Save button not found!');
  }
  
  if (clearBtn) {
    clearBtn.addEventListener('click', clearAllData);
  }
  
  if (exportBtn) {
    exportBtn.addEventListener('click', exportSummary);
  }
  
  if (importBtn) {
    importBtn.addEventListener('click', importData);
  }
}

// Calendar Management
function renderCalendar() {
  const month = appState.currentMonth;
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  
  // Update month display
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  monthDisplay.textContent = `${monthNames[monthIndex]} ${year}`;
  
  // Get calendar data
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();
  
  // Clear grid
  calendarGrid.innerHTML = '';
  
  // Add day headers
  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dayHeaders.forEach(day => {
    const header = document.createElement('div');
    header.className = 'calendar-day header';
    header.textContent = day;
    header.style.fontWeight = '600';
    header.style.textAlign = 'center';
    header.style.padding = '0.5rem';
    header.style.backgroundColor = '#f8f9fa';
    header.style.borderBottom = '1px solid #e0e0e0';
    calendarGrid.appendChild(header);
  });
  
  // Add empty cells for days before month starts
  for (let i = 0; i < startDayOfWeek; i++) {
    const emptyDay = document.createElement('div');
    emptyDay.className = 'calendar-day other-month';
    calendarGrid.appendChild(emptyDay);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayElement = createDayElement(day, monthIndex, year);
    calendarGrid.appendChild(dayElement);
  }
  
  // Add empty cells to complete the grid
  const totalCells = 7 * 6; // 7 columns × 6 rows
  const filledCells = startDayOfWeek + daysInMonth + 7; // +7 for headers
  for (let i = filledCells; i < totalCells; i++) {
    const emptyDay = document.createElement('div');
    emptyDay.className = 'calendar-day other-month';
    calendarGrid.appendChild(emptyDay);
  }
}

function createDayElement(day, month, year) {
  const dayElement = document.createElement('div');
  const date = new Date(year, month, day);
  const currentDate = new Date();
  
  // Check if this date is in the past (excluding today)
  const todayStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  const isPastDate = date < todayStart;
  
  // Check if this is today
  const isToday = date.toDateString() === currentDate.toDateString();
  
  // Debug logging for today's date
  if (isToday) {
    console.log('=== TODAY\'S DATE DEBUG ===');
    console.log('Today\'s date found:', date.toDateString());
    console.log('Date object:', date);
    console.log('Current date:', currentDate);
    console.log('Today start:', todayStart);
    console.log('Is past date:', isPastDate);
    console.log('Date comparison:', date < todayStart);
    console.log('Date time:', date.getTime());
    console.log('Today start time:', todayStart.getTime());
    console.log('========================');
  }
  
  dayElement.className = `calendar-day ${isPastDate ? 'past-date' : ''} ${isToday ? 'today' : ''}`;
  dayElement.dataset.date = formatDate(date);
  
  const dayNumber = document.createElement('div');
  dayNumber.className = 'day-number';
  dayNumber.textContent = day;
  
  const participantInitials = document.createElement('div');
  participantInitials.className = 'participant-initials';
  
  dayElement.appendChild(dayNumber);
  dayElement.appendChild(participantInitials);
  
  // Add click and touch handlers for today and future dates (allow today to be selected)
  if (!isPastDate) {
    dayElement.addEventListener('click', () => {
      console.log('Date clicked:', formatDate(date), 'Is today:', isToday, 'Is past date:', isPastDate);
      handleDateClick(dayElement);
    });
    dayElement.addEventListener('touchend', (e) => {
      e.preventDefault();
      console.log('Date touched:', formatDate(date), 'Is today:', isToday, 'Is past date:', isPastDate);
      handleDateClick(dayElement);
    });
  } else if (isToday) {
    console.log('❌ Today\'s date is marked as past date - this is wrong!');
    console.log('Adding click handler anyway for today\'s date...');
    // Force add click handler for today's date
    dayElement.addEventListener('click', () => {
      console.log('Today\'s date clicked (forced):', formatDate(date));
      handleDateClick(dayElement);
    });
    dayElement.addEventListener('touchend', (e) => {
      e.preventDefault();
      console.log('Today\'s date touched (forced):', formatDate(date));
      handleDateClick(dayElement);
    });
  }
  
  // Update visual state
  updateDayVisualState(dayElement);
  
  return dayElement;
}

function updateDayVisualState(dayElement) {
  const dateKey = dayElement.dataset.date;
  const selections = appState.selections[dateKey] || [];
  
  // Clear previous state
  dayElement.classList.remove('selected', 'top-date');
  dayElement.querySelector('.participant-initials').innerHTML = '';
  
  // Remove selection count if exists
  const existingCount = dayElement.querySelector('.selection-count');
  if (existingCount) {
    existingCount.remove();
  }
  
  if (selections.length > 0) {
    dayElement.classList.add('selected');
    
    // Add participant initials
    const initialsContainer = dayElement.querySelector('.participant-initials');
    selections.forEach(participant => {
      const initial = document.createElement('span');
      initial.className = 'participant-initial';
      initial.textContent = getInitials(participant);
      initial.title = participant;
      initialsContainer.appendChild(initial);
    });
    
    // Add selection count
    const countElement = document.createElement('div');
    countElement.className = 'selection-count';
    countElement.textContent = selections.length;
    dayElement.appendChild(countElement);
  }
}

// Participant Management
function renderParticipants() {
  participantInputs.innerHTML = '';
  
  for (let i = 0; i < 7; i++) {
    const participant = appState.participants[i];
    const isPersonOfTheMonth = participant === appState.personOfTheMonth;
    
    const participantContainer = document.createElement('div');
    participantContainer.className = 'participant-container';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = `participant-input ${isPersonOfTheMonth ? 'person-of-month' : ''}`;
    input.placeholder = `Participant ${i + 1}`;
    input.value = participant || '';
    input.dataset.index = i;
    
    input.addEventListener('input', handleParticipantInput);
    input.addEventListener('blur', validateParticipantNames);
    
    participantContainer.appendChild(input);
    
    if (isPersonOfTheMonth) {
      const badge = document.createElement('span');
      badge.className = 'person-of-month-badge';
      badge.textContent = '👑 HNIC';
      participantContainer.appendChild(badge);
    }
    
    participantInputs.appendChild(participantContainer);
  }
}

function handleParticipantInput(e) {
  const index = parseInt(e.target.dataset.index);
  const name = e.target.value.trim();
  
  // Update app state
  if (name) {
    appState.participants[index] = name;
  } else {
    appState.participants[index] = '';
  }
  
  // Remove empty entries
  appState.participants = appState.participants.filter(p => p.trim() !== '');
  
  saveToLocalStorage();
  updateSummary();
}

function validateParticipantNames() {
  const inputs = document.querySelectorAll('.participant-input');
  const names = Array.from(inputs).map(input => input.value.trim()).filter(name => name);
  
  inputs.forEach(input => {
    const name = input.value.trim();
    if (name && names.filter(n => n === name).length > 1) {
      input.classList.add('duplicate');
    } else {
      input.classList.remove('duplicate');
    }
  });
}

// Date Selection Logic
function handleDateClick(dayElement) {
  console.log('=== HANDLE DATE CLICK ===');
  console.log('Day element:', dayElement);
  console.log('Element dataset:', dayElement.dataset);
  
  // Check if this is a past date (excluding today)
  const dateKey = dayElement.dataset.date;
  const date = new Date(dateKey);
  const currentDate = new Date();
  const todayStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  
  console.log('Date key:', dateKey);
  console.log('Date object:', date);
  console.log('Current date:', currentDate);
  console.log('Today start:', todayStart);
  console.log('Date time:', date.getTime());
  console.log('Today start time:', todayStart.getTime());
  console.log('Is past date:', date < todayStart);
  console.log('Date comparison result:', date < todayStart);
  
  // Check if this is today
  const isToday = date.toDateString() === currentDate.toDateString();
  console.log('Is today:', isToday);
  
  // Allow today and future dates, block only past dates
  if (date < todayStart && !isToday) {
    console.log('❌ Past date clicked, showing notification');
    showNotification('Cannot select past dates!');
    return;
  }
  
  const currentSelections = appState.selections[dateKey] || [];
  console.log('Current selections for this date:', currentSelections);
  
  console.log('✅ Opening participant selector...');
  // Show participant selection dialog
  showParticipantSelector(dateKey, currentSelections, dayElement);
}

function showParticipantSelector(dateKey, currentSelections, dayElement) {
  console.log('=== SHOW PARTICIPANT SELECTOR ===');
  console.log('Date key:', dateKey);
  console.log('Current selections:', currentSelections);
  console.log('Day element:', dayElement);
  console.log('Participants:', appState.participants);
  
  // Create modal overlay
  const modal = document.createElement('div');
  modal.className = 'participant-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h3>Select participants for ${formatDisplayDate(dateKey)}</h3>
      <div class="participant-checkboxes">
        ${appState.participants.map(participant => {
          const isSelected = currentSelections.includes(participant);
          return `
            <label class="participant-checkbox">
              <input type="checkbox" value="${participant}" ${isSelected ? 'checked' : ''}>
              <span class="checkbox-label">${participant}</span>
            </label>
          `;
        }).join('')}
      </div>
      <div class="modal-actions">
        <button class="modal-btn cancel">Cancel</button>
        <button class="modal-btn save">Save</button>
      </div>
    </div>
  `;
  
  console.log('Modal HTML created, appending to body...');
  document.body.appendChild(modal);
  console.log('✅ Modal added to body');
  
  // Add event listeners
  const cancelBtn = modal.querySelector('.cancel');
  const saveBtn = modal.querySelector('.save');
  const checkboxes = modal.querySelectorAll('input[type="checkbox"]');
  
  cancelBtn.addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  saveBtn.addEventListener('click', () => {
    const selectedParticipants = Array.from(checkboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value);
    
    // Update state
    if (selectedParticipants.length > 0) {
      appState.selections[dateKey] = selectedParticipants;
    } else {
      delete appState.selections[dateKey];
    }
    
      saveToFirebase();
  updateDayVisualState(dayElement);
  updateSummary();
  document.body.removeChild(modal);
  });
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
}

// Top 3 Calculation
function updateSummary() {
  const topDatesData = calculateTopDates();
  
  if (topDatesData.length === 0) {
    topDates.innerHTML = '<div class="no-selections">No dates selected yet. Click on calendar days to make selections.</div>';
    return;
  }
  
  topDates.innerHTML = '';
  
  topDatesData.forEach((item, index) => {
    const dateItem = document.createElement('div');
    dateItem.className = 'top-date-item';
    
    const date = new Date(item.date);
    const formattedDate = date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
    
    dateItem.innerHTML = `
      <div class="top-date-header">
        <span class="top-date-date">${formattedDate}</span>
        <span class="top-date-count">${item.count} ${item.count === 1 ? 'person' : 'people'}</span>
      </div>
      <div class="top-date-participants">
        ${item.participants.join(', ')}
      </div>
    `;
    
    topDates.appendChild(dateItem);
  });
  
  // Update visual state for top dates
  updateTopDatesVisualState(topDatesData);
}

function calculateTopDates() {
  const dateCounts = Object.entries(appState.selections)
    .map(([date, participants]) => ({
      date,
      count: participants.length,
      participants: [...participants].sort()
    }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
  
  return dateCounts;
}

function updateTopDatesVisualState(topDatesData) {
  // Remove previous top-date classes
  document.querySelectorAll('.calendar-day').forEach(day => {
    day.classList.remove('top-date');
  });
  
  // Add top-date class to top 3 dates
  topDatesData.forEach(item => {
    const dayElement = document.querySelector(`[data-date="${item.date}"]`);
    if (dayElement) {
      dayElement.classList.add('top-date');
    }
  });
}

// Person of the Month Calculation
function calculatePersonOfTheMonth() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Start with Ben in August 2024 (month 7, 0-indexed)
  const startMonth = 7; // August (0-indexed)
  const startYear = 2024;
  
  // Calculate months since start
  const monthsSinceStart = (currentYear - startYear) * 12 + (currentMonth - startMonth);
  
  // For August 2024, we want Ben (index 1)
  // For September 2024, we want Brian (index 2)
  // For October 2024, we want Chris (index 3)
  // For November 2024, we want Ilya (index 4)
  // For December 2024, we want Krystian (index 5)
  // For January 2025, we want Tom (index 6)
  // For February 2025, we want Amit (index 0)
  // For March 2025, we want Ben (index 1) - cycle repeats
  // For August 2025, we want Ben (index 1) - 12 months later
  
  // Calculate which participant should be highlighted
  // For August 2025, we want Ben (index 1)
  // Since we're in August 2025, we want Ben regardless of the year
  // We'll use the month to determine the cycle position
  const monthInCycle = currentMonth % appState.participants.length;
  const participantIndex = (monthInCycle + 1) % appState.participants.length;
  
  appState.personOfTheMonth = appState.participants[participantIndex];
}

function updatePersonOfMonthDisplay() {
  if (appState.personOfTheMonth) {
    personOfMonthDisplay.innerHTML = `👑 ${appState.personOfTheMonth} - HNIC`;
  } else {
    personOfMonthDisplay.innerHTML = '';
  }
}

function updateConnectionStatus() {
  try {
    console.log('Checking Firebase connection...');
    console.log('Firebase object:', typeof firebase);
    console.log('Firebase apps:', firebase?.apps);
    console.log('Calendar database:', typeof window.calendarDatabase);
    
    // Check if connection status element exists
    if (!connectionStatus) {
      console.log('Connection status element not found');
      return;
    }
    
    // Check if Firebase is available
    if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0 && window.calendarDatabase) {
      connectionStatus.innerHTML = '🟢 Connected';
      connectionStatus.className = 'connection-status connected';
      console.log('Firebase is connected');
    } else {
      connectionStatus.innerHTML = '🔴 Offline (Local)';
      connectionStatus.className = 'connection-status disconnected';
      console.log('Firebase is not available');
    }
  } catch (error) {
    console.error('Connection status error:', error);
    if (connectionStatus) {
      connectionStatus.innerHTML = '🔴 Offline (Local)';
      connectionStatus.className = 'connection-status disconnected';
    }
  }
}

// Month Navigation
function changeMonth(direction) {
  const newMonth = new Date(appState.currentMonth);
  newMonth.setMonth(newMonth.getMonth() + direction);
  
  // Prevent navigation to past months
  const currentDate = new Date();
  const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  
  if (newMonth < currentMonth) {
    showNotification('Cannot navigate to past months!');
    return;
  }
  
  appState.currentMonth = newMonth;
  
  calculatePersonOfTheMonth();
  renderParticipants();
  renderCalendar();
  updateSummary();
  updatePersonOfMonthDisplay();
  saveToFirebase();
}

// Firebase Real-time Sync
function initializeFirebaseSync() {
  console.log('Initializing Firebase sync...');
  
  try {
    // Check if Firebase is properly loaded
    if (typeof firebase === 'undefined') {
      console.error('Firebase is not loaded!');
      loadFromLocalStorage();
      return;
    }
    
    // Check if Firebase is initialized
    if (!firebase.apps.length) {
      console.error('Firebase not initialized!');
      loadFromLocalStorage();
      return;
    }
    
    // Get database reference directly from Firebase
    let db;
    try {
      db = firebase.database();
      console.log('Database reference created successfully');
    } catch (dbError) {
      console.error('Database reference error:', dbError);
      loadFromLocalStorage();
      return;
    }
    
    // Get current month key for database
    const monthKey = getMonthKey(appState.currentMonth);
    console.log('Month key:', monthKey);
    
    // Listen for real-time updates
    db.ref(`calendar/${monthKey}`).on('value', (snapshot) => {
      console.log('Firebase data received:', snapshot.val());
      const data = snapshot.val();
      if (data && !isInitialLoad) {
        // Update app state with data from Firebase
        appState.selections = data.selections || {};
        appState.participants = data.participants || appState.participants;
        
        // Re-render the calendar and summary
        renderCalendar();
        updateSummary();
        showNotification('Calendar updated from team!');
      }
      isInitialLoad = false;
    }, (error) => {
      console.error('Firebase read error:', error);
      // Fallback to localStorage if Firebase fails
      loadFromLocalStorage();
    });
    
    // Store database reference globally for other functions
    window.calendarDatabase = db;
    
    // Load initial data
    loadFromFirebase();
  } catch (error) {
    console.error('Firebase initialization error:', error);
    // Fallback to localStorage if Firebase fails
    loadFromLocalStorage();
  }
}

function loadFromFirebase() {
  const monthKey = getMonthKey(appState.currentMonth);
  
  // Get database reference
  const db = window.calendarDatabase || firebase.database();
  
  db.ref(`calendar/${monthKey}`).once('value')
    .then((snapshot) => {
      const data = snapshot.val();
      if (data) {
        appState.selections = data.selections || {};
        appState.participants = data.participants || appState.participants;
        renderCalendar();
        updateSummary();
      } else {
        // No Firebase data, try localStorage
        loadFromLocalStorage();
      }
    })
    .catch((error) => {
      console.error('Firebase load error:', error);
      // Fallback to localStorage
      loadFromLocalStorage();
    });
}

function saveToFirebase() {
  console.log('Attempting to save to Firebase...');
  
  try {
    // Check if Firebase is available
    if (typeof firebase === 'undefined') {
      console.error('Firebase is not loaded!');
      saveToLocalStorage();
      showNotification('Saved locally (Firebase not loaded)');
      return;
    }
    
    // Get database reference
    const db = window.calendarDatabase || firebase.database();
    if (!db) {
      console.error('Database is not initialized!');
      saveToLocalStorage();
      showNotification('Saved locally (Database not initialized)');
      return;
    }
    
    const monthKey = getMonthKey(appState.currentMonth);
    appState.lastUpdated = new Date();
    
    console.log('Saving to Firebase with month key:', monthKey);
    console.log('Data to save:', {
      selections: appState.selections,
      participants: appState.participants,
      lastUpdated: appState.lastUpdated.toISOString()
    });
    
    db.ref(`calendar/${monthKey}`).set({
      selections: appState.selections,
      participants: appState.participants,
      lastUpdated: appState.lastUpdated.toISOString()
    }).then(() => {
      console.log('Data saved to Firebase successfully');
    }).catch((error) => {
      console.error('Firebase save error:', error);
      // Fallback to localStorage
      saveToLocalStorage();
      showNotification('Saved locally (Firebase unavailable)');
    });
  } catch (error) {
    console.error('Firebase save error:', error);
    // Fallback to localStorage
    saveToLocalStorage();
    showNotification('Saved locally (Firebase unavailable)');
  }
}

function getMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

// Data Persistence (fallback)
function saveToLocalStorage() {
  appState.lastUpdated = new Date();
  localStorage.setItem('calendarTracker', JSON.stringify(appState));
}

function loadFromLocalStorage() {
  const saved = localStorage.getItem('calendarTracker');
  if (saved) {
    const parsed = JSON.parse(saved);
    appState = {
      ...parsed,
      currentMonth: new Date(parsed.currentMonth),
      lastUpdated: new Date(parsed.lastUpdated)
    };
  } else {
    // Initialize with default participants if no saved data
    appState.participants = ['Amit', 'Ben', 'Brian', 'Chris', 'Ilya', 'Krystian', 'Tom'];
  }
}

// Action Handlers
function saveSelections() {
  console.log('Save button clicked');
  console.log('Current selections:', appState.selections);
  
  // Visual feedback
  saveBtn.style.backgroundColor = '#28a745';
  saveBtn.textContent = 'Saving...';
  
  setTimeout(() => {
    saveBtn.style.backgroundColor = '';
    saveBtn.textContent = 'Save Selections';
  }, 1000);
  
  try {
    saveToFirebase();
    showNotification('Selections saved and shared with team!');
  } catch (error) {
    console.error('Save error:', error);
    // Fallback to localStorage
    saveToLocalStorage();
    showNotification('Saved locally (Firebase unavailable)');
  }
}

function clearAllData() {
  if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
    appState.selections = {};
    appState.participants = [];
    saveToFirebase();
    renderParticipants();
    renderCalendar();
    updateSummary();
    showNotification('All data cleared and shared with team!');
  }
}

function exportSummary() {
  const topDatesData = calculateTopDates();
  
  if (topDatesData.length === 0) {
    alert('No selections to export.');
    return;
  }
  
  let exportText = `Calendar Summary - ${monthDisplay.textContent}\n\n`;
  exportText += `Top ${Math.min(topDatesData.length, 3)} Dates:\n\n`;
  
  topDatesData.forEach((item, index) => {
    const date = new Date(item.date);
    const formattedDate = date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
    
    exportText += `${index + 1}. ${formattedDate} (${item.count} ${item.count === 1 ? 'person' : 'people'})\n`;
    exportText += `   Participants: ${item.participants.join(', ')}\n\n`;
  });
  
  // Add all selections for manual sharing
  exportText += `\nAll Selections:\n`;
  exportText += `==============\n`;
  
  Object.entries(appState.selections).forEach(([date, participants]) => {
    if (participants.length > 0) {
      const dateObj = new Date(date);
      const formattedDate = dateObj.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      });
      exportText += `${formattedDate}: ${participants.join(', ')}\n`;
    }
  });
  
  // Create and download file
  const blob = new Blob([exportText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `calendar-summary-${formatDate(new Date())}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showNotification('Summary exported successfully!');
}

function importData() {
  // Create file input
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.txt';
  
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        // For now, just show the content for manual review
        alert('Import feature coming soon! For now, please manually enter the data from the exported files.');
        console.log('Import content:', content);
      } catch (error) {
        alert('Error reading file. Please try again.');
      }
    };
    reader.readAsText(file);
  });
  
  fileInput.click();
}

// Utility Functions
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function formatDisplayDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });
}

function getInitials(name) {
  return name.split(' ').map(word => word.charAt(0).toUpperCase()).join('').slice(0, 2);
}

function showNotification(message) {
  // Simple notification - could be enhanced with a proper toast library
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #28a745;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 6px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Auto-refresh to current month on month change
function checkMonthChange() {
  const now = new Date();
  const currentMonth = appState.currentMonth;
  
  if (now.getMonth() !== currentMonth.getMonth() || now.getFullYear() !== currentMonth.getFullYear()) {
    // Only update to current month if we're in a past month
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    if (currentMonth < currentMonthStart) {
      appState.currentMonth = currentMonthStart;
      calculatePersonOfTheMonth();
      renderParticipants();
      renderCalendar();
      updateSummary();
      updatePersonOfMonthDisplay();
      saveToFirebase();
      showNotification('Calendar updated to current month!');
    }
  }
}

// Wait for Firebase to load, with fallback
function waitForFirebase(callback, maxAttempts = 10) {
  let attempts = 0;
  
  function checkFirebase() {
    attempts++;
    console.log(`Checking Firebase (attempt ${attempts}/${maxAttempts})...`);
    
    if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
      console.log('✅ Firebase loaded successfully');
      callback(true); // Firebase is available
    } else if (attempts >= maxAttempts) {
      console.log('❌ Firebase failed to load after maximum attempts');
      console.log('Continuing with local storage only...');
      callback(false); // Firebase is not available
    } else {
      console.log('Firebase not ready yet, retrying...');
      setTimeout(checkFirebase, 500);
    }
  }
  
  checkFirebase();
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing app immediately...');
  
  // Initialize app immediately with local storage
  window.firebaseAvailable = false;
  initializeApp();
  
  // Check for month change every hour
  setInterval(checkMonthChange, 60 * 60 * 1000);
  
  // Also check on page focus
  window.addEventListener('focus', checkMonthChange);
  
  // Add manual functions to window for debugging
  window.manualSave = saveSelections;
  window.debugAppState = () => console.log('App State:', appState);
  window.testFirebase = () => {
    console.log('Testing Firebase write...');
    if (typeof firebase !== 'undefined') {
      const db = window.calendarDatabase || firebase.database();
      if (db) {
        db.ref('test').set({timestamp: Date.now()}).then(() => {
          console.log('✅ Firebase write test successful');
        }).catch((error) => {
          console.error('❌ Firebase write test failed:', error);
        });
      } else {
        console.log('❌ Database not available for test');
      }
    } else {
      console.log('❌ Firebase not loaded');
    }
  };
  window.forceFirebaseSave = () => {
    console.log('Force saving to Firebase...');
    saveToFirebase();
  };
  window.checkTodayDate = () => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    console.log('=== TODAY\'S DATE TEST ===');
    console.log('Today:', today.toDateString());
    console.log('Today object:', today);
    console.log('Today start:', todayStart);
    console.log('Today time:', today.getTime());
    console.log('Today start time:', todayStart.getTime());
    console.log('Is today past date?', today < todayStart);
    console.log('Today < TodayStart:', today < todayStart);
    console.log('Today === TodayStart:', today.getTime() === todayStart.getTime());
    console.log('========================');
  };
  
  window.findTodayElement = () => {
    const today = new Date();
    const todayString = today.toDateString();
    console.log('Looking for today\'s element...');
    console.log('Today string:', todayString);
    
    const allDays = document.querySelectorAll('.calendar-day');
    allDays.forEach((day, index) => {
      const dateKey = day.dataset.date;
      if (dateKey) {
        const date = new Date(dateKey);
        if (date.toDateString() === todayString) {
          console.log(`Found today's element at index ${index}:`, day);
          console.log('Element classes:', day.className);
          console.log('Element dataset:', day.dataset);
          return day;
        }
      }
    });
    console.log('Today\'s element not found');
    return null;
  };
  
  window.loadFirebaseManually = () => {
    console.log('Attempting to load Firebase manually...');
    if (typeof firebase === 'undefined') {
      console.log('Firebase not available, trying to load scripts...');
      // Try to load Firebase scripts manually
      const script1 = document.createElement('script');
      script1.src = 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js';
      script1.onload = () => {
        console.log('Firebase app script loaded');
        const script2 = document.createElement('script');
        script2.src = 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database-compat.js';
        script2.onload = () => {
          console.log('Firebase database script loaded');
          // Load firebase-config.js
          const script3 = document.createElement('script');
          script3.src = 'firebase-config.js';
          script3.onload = () => {
            console.log('Firebase config loaded');
            // Re-initialize Firebase
            window.firebaseAvailable = true;
            initializeFirebaseSync();
            updateConnectionStatus();
          };
          document.head.appendChild(script3);
        };
        document.head.appendChild(script2);
      };
      document.head.appendChild(script1);
    } else {
      console.log('Firebase already loaded, re-initializing...');
      window.firebaseAvailable = true;
      initializeFirebaseSync();
      updateConnectionStatus();
    }
  };
  
  window.reloadApp = () => {
    console.log('Reloading app...');
    location.reload();
  };
  
  // Try to load Firebase in the background
  setTimeout(() => {
    console.log('Attempting to load Firebase in background...');
    waitForFirebase((firebaseAvailable) => {
      if (firebaseAvailable) {
        console.log('Firebase loaded in background, updating app...');
        window.firebaseAvailable = true;
        initializeFirebaseSync();
        updateConnectionStatus();
      }
    });
  }, 1000);
}); 