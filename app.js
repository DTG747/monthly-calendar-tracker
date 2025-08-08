// DOM Elements
const form = document.getElementById('taskForm');
const input = document.getElementById('taskInput');
const list = document.getElementById('taskList');

// Load saved tasks from localStorage
let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

// Initialize the app
renderAll();

// Event Listeners
form.addEventListener('submit', handleAddTask);
list.addEventListener('click', handleTaskClick);

// Handle form submission to add new task
function handleAddTask(e) {
  e.preventDefault();
  const text = input.value.trim();
  
  if (!text) return;
  
  const task = {
    id: Date.now(),
    text: text,
    completed: false
  };
  
  // Add task to beginning of array (newest first)
  tasks.unshift(task);
  saveTasks();
  
  // Clear input and add task to DOM
  input.value = '';
  list.prepend(renderItem(task));
  
  // Focus back to input for quick adding
  input.focus();
}

// Handle clicks on task items (check/uncheck and delete)
function handleTaskClick(e) {
  const check = e.target.closest('.check');
  const deleteBtn = e.target.closest('.delete-btn');
  
  if (check) {
    const li = check.parentElement;
    const id = Number(li.dataset.id);
    const task = tasks.find(t => t.id === id);
    
    if (!task) return;
    
    // Toggle completion status
    task.completed = !task.completed;
    saveTasks();
    
    // Update visual state
    li.classList.toggle('completed', task.completed);
  } else if (deleteBtn) {
    const li = deleteBtn.parentElement;
    const id = Number(li.dataset.id);
    
    // Remove task from array
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    
    // Remove from DOM with animation
    li.style.opacity = '0';
    li.style.transform = 'translateX(-20px)';
    setTimeout(() => {
      li.remove();
    }, 200);
  }
}

// Render all tasks
function renderAll() {
  list.innerHTML = '';
  tasks.forEach(task => {
    list.appendChild(renderItem(task));
  });
}

// Create DOM element for a single task
function renderItem(task) {
  const li = document.createElement('li');
  li.className = 'task' + (task.completed ? ' completed' : '');
  li.dataset.id = task.id;
  
  li.innerHTML = `
    <span class="check" role="button" tabindex="0" aria-label="${task.completed ? 'Mark as incomplete' : 'Mark as complete'}">
      <span class="checkmark">✓</span>
    </span>
    <span class="label">${escapeHtml(task.text)}</span>
    <button class="delete-btn" aria-label="Delete task">×</button>
  `;
  
  return li;
}

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Keyboard navigation support
list.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    const check = e.target.closest('.check');
    const deleteBtn = e.target.closest('.delete-btn');
    
    if (check) {
      e.preventDefault();
      check.click();
    } else if (deleteBtn) {
      e.preventDefault();
      deleteBtn.click();
    }
  }
}); 