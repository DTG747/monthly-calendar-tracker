// Core Application State
let appState = {
  currentMonth: new Date(),
  participants: ['Amit', 'Ben', 'Brian', 'Chris', 'Ilya', 'Krystian', 'Tom'],
  selections: {},
  lastUpdated: new Date()
};

// DOM Elements
const monthDisplay = document.getElementById('monthDisplay');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const participantInputs = document.getElementById('participantInputs');
const calendarGrid = document.getElementById('calendarGrid');
const topDates = document.getElementById('topDates');
const saveBtn = document.getElementById('saveBtn');
const clearBtn = document.getElementById('clearBtn');
const exportBtn = document.getElementById('exportBtn');

// Initialize Application
function initializeApp() {
  loadFromLocalStorage();
  renderParticipants();
  renderCalendar();
  updateSummary();
  setupEventListeners();
}

// Event Listeners
function setupEventListeners() {
  prevMonthBtn.addEventListener('click', () => changeMonth(-1));
  nextMonthBtn.addEventListener('click', () => changeMonth(1));
  saveBtn.addEventListener('click', saveSelections);
  clearBtn.addEventListener('click', clearAllData);
  exportBtn.addEventListener('click', exportSummary);
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
  dayElement.className = 'calendar-day';
  dayElement.dataset.date = formatDate(new Date(year, month, day));
  
  const dayNumber = document.createElement('div');
  dayNumber.className = 'day-number';
  dayNumber.textContent = day;
  
  const participantInitials = document.createElement('div');
  participantInitials.className = 'participant-initials';
  
  dayElement.appendChild(dayNumber);
  dayElement.appendChild(participantInitials);
  
  // Add click handler
  dayElement.addEventListener('click', () => handleDateClick(dayElement));
  
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
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'participant-input';
    input.placeholder = `Participant ${i + 1}`;
    input.value = appState.participants[i] || '';
    input.dataset.index = i;
    
    input.addEventListener('input', handleParticipantInput);
    input.addEventListener('blur', validateParticipantNames);
    
    participantInputs.appendChild(input);
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
  const dateKey = dayElement.dataset.date;
  const currentSelections = appState.selections[dateKey] || [];
  
  // Show participant selection dialog
  showParticipantSelector(dateKey, currentSelections, dayElement);
}

function showParticipantSelector(dateKey, currentSelections, dayElement) {
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
  
  document.body.appendChild(modal);
  
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
    
    saveToLocalStorage();
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

// Month Navigation
function changeMonth(direction) {
  const newMonth = new Date(appState.currentMonth);
  newMonth.setMonth(newMonth.getMonth() + direction);
  appState.currentMonth = newMonth;
  
  renderCalendar();
  updateSummary();
  saveToLocalStorage();
}

// Data Persistence
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
  saveToLocalStorage();
  showNotification('Selections saved successfully!');
}

function clearAllData() {
  if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
    appState.selections = {};
    appState.participants = [];
    saveToLocalStorage();
    renderParticipants();
    renderCalendar();
    updateSummary();
    showNotification('All data cleared successfully!');
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
    appState.currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    renderCalendar();
    updateSummary();
    saveToLocalStorage();
    showNotification('Calendar updated to current month!');
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  
  // Check for month change every hour
  setInterval(checkMonthChange, 60 * 60 * 1000);
  
  // Also check on page focus
  window.addEventListener('focus', checkMonthChange);
}); 