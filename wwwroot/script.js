/**
 * Todo List Application
 * Main JavaScript functionality
 */

// Configuration
const API_URL = 'https://localhost:5001/api';

// DOM Element References
const elements = {
    // Lists
    todosList: document.getElementById('todosList'),
    categoriesList: document.getElementById('categoriesList'),
    
    // State elements
    emptyState: document.getElementById('emptyState'),
    
    // Buttons
    addTodoBtn: document.getElementById('addTodoBtn'),
    addCategoryBtn: document.getElementById('addCategoryBtn'),
    saveTodoBtn: document.getElementById('saveTodoBtn'),
    saveCategoryBtn: document.getElementById('saveCategoryBtn'),
    cancelTodoBtn: document.getElementById('cancelTodoBtn'),
    cancelCategoryBtn: document.getElementById('cancelCategoryBtn'),
    
    // Modals
    todoModal: document.getElementById('todoModal'),
    categoryModal: document.getElementById('categoryModal'),
    closeTodoModal: document.getElementById('closeTodoModal'),
    closeCategoryModal: document.getElementById('closeCategoryModal'),
    
    // Forms
    todoForm: document.getElementById('todoForm'),
    categoryForm: document.getElementById('categoryForm'),
    
    // Titles
    todoModalTitle: document.getElementById('todoModalTitle'),
    categoryModalTitle: document.getElementById('categoryModalTitle'),
    
    // Filters
    priorityFilter: document.getElementById('priorityFilter'),
    statusFilter: document.getElementById('statusFilter'),
    
    // Form inputs
    todoCategory: document.getElementById('todoCategory'),
    colorPicker: document.getElementById('colorPicker'),
    categoryColor: document.getElementById('categoryColor')
};

// Application State
const state = {
    todos: [],
    categories: [],
    currentCategoryId: 'all',
    currentPriorityFilter: 'all',
    currentStatusFilter: 'all',
    isEditing: false
};

// Priority Mapping
const priorityMap = {
    'low': 0,
    'medium': 1,
    'high': 2,
    'urgent': 3
};

// Priority Values in reverse (for display)
const priorityValues = ['low', 'medium', 'high', 'urgent'];

/**
 * Initialize the application
 */
async function init() {
    try {
        await fetchCategories();
        await fetchTodos();
        renderCategorySelect();
        updateCategoryCount();
    } catch (error) {
        console.error('Initialization failed:', error);
        alert('Failed to initialize the application. Please refresh the page.');
    }
}

/**
 * Fetch todos from the API
 */
async function fetchTodos() {
    try {
        const response = await fetch(`${API_URL}/TodoItems`);
        if (!response.ok) {
            throw new Error('Failed to fetch todos');
        }
        state.todos = await response.json();
        renderTodos();
    } catch (error) {
        console.error('Error fetching todos:', error);
        alert('Failed to load todos. Please try again.');
    }
}

/**
 * Fetch categories from the API
 */
async function fetchCategories() {
    try {
        const response = await fetch(`${API_URL}/Categories`);
        if (!response.ok) {
            throw new Error('Failed to fetch categories');
        }
        state.categories = await response.json();
        renderCategories();
    } catch (error) {
        console.error('Error fetching categories:', error);
        alert('Failed to load categories. Please try again.');
    }
}

/**
 * Render todos based on current filters
 */
function renderTodos() {
    // Filter todos based on current filters
    let filteredTodos = state.todos;
    
    // Filter by category
    if (state.currentCategoryId !== 'all') {
        filteredTodos = filteredTodos.filter(todo => todo.categoryId === parseInt(state.currentCategoryId));
    }
    
    // Filter by priority
    if (state.currentPriorityFilter !== 'all') {
        filteredTodos = filteredTodos.filter(todo => todo.priority === priorityMap[state.currentPriorityFilter]);
    }
    
    // Filter by status
    if (state.currentStatusFilter === 'active') {
        filteredTodos = filteredTodos.filter(todo => !todo.isComplete);
    } else if (state.currentStatusFilter === 'completed') {
        filteredTodos = filteredTodos.filter(todo => todo.isComplete);
    }
    
    // Check if there are todos to display
    if (filteredTodos.length === 0) {
        elements.todosList.innerHTML = '';
        elements.emptyState.style.display = 'block';
        return;
    }
    
    elements.emptyState.style.display = 'none';
    
    // Sort todos: completed at the bottom, then by priority, then by due date
    filteredTodos.sort((a, b) => {
        // First sort by completion status
        if (a.isComplete !== b.isComplete) {
            return a.isComplete ? 1 : -1;
        }
        
        // Then sort by priority (highest first)
        if (a.priority !== b.priority) {
            return b.priority - a.priority;
        }
        
        // Then sort by due date (soonest first)
        if (a.dueDate && b.dueDate) {
            return new Date(a.dueDate) - new Date(b.dueDate);
        }
        
        // If one has a due date and the other doesn't
        if (a.dueDate && !b.dueDate) return -1;
        if (!a.dueDate && b.dueDate) return 1;
        
        // Finally sort by creation date (newest first)
        return new Date(b.createdDate) - new Date(a.createdDate);
    });
    
    // Render todos
    elements.todosList.innerHTML = filteredTodos.map(todo => {
        const category = state.categories.find(cat => cat.id === todo.categoryId) || { name: 'Unknown', color: '#ccc' };
        
        const priorityClass = ['priority-low', 'priority-medium', 'priority-high', 'priority-urgent'][todo.priority];
        const completedClass = todo.isComplete ? 'completed' : '';
        
        // Format due date if exists
        let dueDateStr = '';
        if (todo.dueDate) {
            const dueDate = new Date(todo.dueDate);
            dueDateStr = `<span><i class="far fa-clock"></i> ${dueDate.toLocaleString()}</span>`;
        }
        
        return `
            <li class="todo-item ${priorityClass} ${completedClass}" data-id="${todo.id}">
                <div class="todo-content">
                    <div class="todo-title">${todo.title}</div>
                    <div class="todo-details">
                        <span class="todo-category" style="background-color: ${category.color}">${category.name}</span>
                        ${dueDateStr}
                    </div>
                </div>
                <div class="todo-actions">
                    ${todo.isComplete ? '' : 
                        `<button class="todo-action-btn complete" data-id="${todo.id}" title="Mark as Complete">
                            <i class="fas fa-check"></i>
                        </button>`
                    }
                    <button class="todo-action-btn edit" data-id="${todo.id}" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="todo-action-btn delete" data-id="${todo.id}" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </li>
        `;
    }).join('');
    
    // Add event listeners to action buttons
    attachTodoActionListeners();
}

/**
 * Attach event listeners to todo action buttons
 */
function attachTodoActionListeners() {
    // Complete button listeners
    document.querySelectorAll('.todo-action-btn.complete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            completeTodo(btn.getAttribute('data-id'));
        });
    });
    
    // Edit button listeners
    document.querySelectorAll('.todo-action-btn.edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            editTodo(btn.getAttribute('data-id'));
        });
    });
    
    // Delete button listeners
    document.querySelectorAll('.todo-action-btn.delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteTodo(btn.getAttribute('data-id'));
        });
    });
    
    // Todo item click for viewing details
    document.querySelectorAll('.todo-item').forEach(item => {
        item.addEventListener('click', () => {
            const todoId = item.getAttribute('data-id');
            viewTodoDetails(todoId);
        });
    });
}

/**
 * Render categories in the sidebar
 */
function renderCategories() {
    elements.categoriesList.innerHTML = `
        <li class="category-item ${state.currentCategoryId === 'all' ? 'active' : ''}" data-id="all">
            <span class="category-name">All</span>
            <span class="category-count">0</span>
        </li>
    `;
    
    state.categories.forEach(category => {
        elements.categoriesList.innerHTML += `
            <li class="category-item ${state.currentCategoryId == category.id ? 'active' : ''}" data-id="${category.id}">
                <span class="category-name">
                    <span class="category-color" style="background-color: ${category.color}"></span>
                    ${category.name}
                </span>
                <span class="category-count">0</span>
            </li>
        `;
    });
    
    // Add event listeners to category items
    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.category-item').forEach(cat => cat.classList.remove('active'));
            item.classList.add('active');
            state.currentCategoryId = item.getAttribute('data-id');
            renderTodos();
        });
    });
}

/**
 * Render category select dropdown
 */
function renderCategorySelect() {
    elements.todoCategory.innerHTML = '';
    state.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        elements.todoCategory.appendChild(option);
    });
}

/**
 * Update category counts
 */
function updateCategoryCount() {
    // Count all todos
    const allCount = state.todos.length;
    document.querySelector(`.category-item[data-id="all"] .category-count`).textContent = allCount;
    
    // Count todos by category
    state.categories.forEach(category => {
        const count = state.todos.filter(todo => todo.categoryId === category.id).length;
        const countElement = document.querySelector(`.category-item[data-id="${category.id}"] .category-count`);
        if (countElement) {
            countElement.textContent = count;
        }
    });
}

/**
 * Filter todos based on selected filters
 */
function filterTodos() {
    state.currentPriorityFilter = elements.priorityFilter.value;
    state.currentStatusFilter = elements.statusFilter.value;
    renderTodos();
}

/**
 * Show add todo modal
 */
function showAddTodoModal() {
    elements.todoModalTitle.textContent = 'Add New Todo';
    document.getElementById('todoId').value = '';
    elements.todoForm.reset();
    state.isEditing = false;
    elements.todoModal.style.display = 'block';
}

/**
 * Show add category modal
 */
function showAddCategoryModal() {
    elements.categoryModalTitle.textContent = 'Add New Category';
    document.getElementById('categoryId').value = '';
    elements.categoryForm.reset();
    document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
    document.querySelector('.color-option[data-color="#ff6b6b"]').classList.add('selected');
    elements.categoryColor.value = '#ff6b6b';
    state.isEditing = false;
    elements.categoryModal.style.display = 'block';
}

/**
 * Hide todo modal
 */
function hideTodoModal() {
    elements.todoModal.style.display = 'none';
}

/**
 * Hide category modal
 */
function hideCategoryModal() {
    elements.categoryModal.style.display = 'none';
}

/**
 * Save todo
 */
async function saveTodo() {
    try {
        // Get form values
        const todoId = document.getElementById('todoId').value;
        const title = document.getElementById('todoTitle').value.trim();
        const description = document.getElementById('todoDescription').value.trim();
        const categoryId = parseInt(elements.todoCategory.value);
        const dueDate = document.getElementById('todoDueDate').value || null;
        const priorityValue = document.querySelector('input[name="priority"]:checked').value;
        
        // Validate input
        if (!title) {
            alert('Please enter a title for the todo');
            return;
        }
        
        // Prepare todo object
        const todoData = {
            title,
            description,
            isComplete: false,
            createdDate: new Date().toISOString(),
            dueDate: dueDate ? new Date(dueDate).toISOString() : null,
            priority: priorityMap[priorityValue],
            categoryId
        };
        
        let response;
        
        if (state.isEditing) {
            // Update existing todo
            todoData.id = parseInt(todoId);
            todoData.isComplete = state.todos.find(t => t.id === parseInt(todoId)).isComplete;
            
            response = await fetch(`${API_URL}/TodoItems/${todoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(todoData)
            });
        } else {
            // Create new todo
            response = await fetch(`${API_URL}/TodoItems`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(todoData)
            });
        }
        
        if (!response.ok) {
            throw new Error('Failed to save todo');
        }
        
        // Refresh todos
        await fetchTodos();
        updateCategoryCount();
        hideTodoModal();
        
    } catch (error) {
        console.error('Error saving todo:', error);
        alert('Failed to save todo. Please try again.');
    }
}

/**
 * Save category
 */
async function saveCategory() {
    try {
        // Get form values
        const categoryId = document.getElementById('categoryId').value;
        const name = document.getElementById('categoryName').value.trim();
        const color = elements.categoryColor.value;
        
        // Validate input
        if (!name) {
            alert('Please enter a name for the category');
            return;
        }
        
        // Prepare category object
        const categoryData = {
            name,
            color
        };
        
        let response;
        
        if (state.isEditing) {
            // Update existing category
            categoryData.id = parseInt(categoryId);
            
            response = await fetch(`${API_URL}/Categories/${categoryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(categoryData)
            });
        } else {
            // Create new category
            response = await fetch(`${API_URL}/Categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(categoryData)
            });
        }
        
        if (!response.ok) {
            throw new Error('Failed to save category');
        }
        
        // Refresh categories
        await fetchCategories();
        renderCategorySelect();
        hideCategoryModal();
        
    } catch (error) {
        console.error('Error saving category:', error);
        alert('Failed to save category. Please try again.');
    }
}

/**
 * Mark todo as complete
 */
async function completeTodo(todoId) {
    try {
        const response = await fetch(`${API_URL}/TodoItems/${todoId}/complete`, {
            method: 'PUT'
        });
        
        if (!response.ok) {
            throw new Error('Failed to complete todo');
        }
        
        // Refresh todos
        await fetchTodos();
        
    } catch (error) {
        console.error('Error completing todo:', error);
        alert('Failed to mark todo as complete. Please try again.');
    }
}

/**
 * Edit todo
 */
function editTodo(todoId) {
    const todo = state.todos.find(t => t.id === parseInt(todoId));
    if (!todo) return;
    
    // Set modal title
    elements.todoModalTitle.textContent = 'Edit Todo';
    
    // Fill form with todo data
    document.getElementById('todoId').value = todo.id;
    document.getElementById('todoTitle').value = todo.title;
    document.getElementById('todoDescription').value = todo.description || '';
    elements.todoCategory.value = todo.categoryId;
    
    // Set due date if exists
    if (todo.dueDate) {
        const dueDateLocal = new Date(todo.dueDate).toISOString().slice(0, 16);
        document.getElementById('todoDueDate').value = dueDateLocal;
    } else {
        document.getElementById('todoDueDate').value = '';
    }
    
    // Set priority
    document.querySelector(`input[name="priority"][value="${priorityValues[todo.priority]}"]`).checked = true;
    
    state.isEditing = true;
    elements.todoModal.style.display = 'block';
}

/**
 * Delete todo
 */
async function deleteTodo(todoId) {
    if (!confirm('Are you sure you want to delete this todo?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/TodoItems/${todoId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete todo');
        }
        
        // Refresh todos
        await fetchTodos();
        updateCategoryCount();
        
    } catch (error) {
        console.error('Error deleting todo:', error);
        alert('Failed to delete todo. Please try again.');
    }
}

/**
 * View todo details
 */
function viewTodoDetails(todoId) {
    const todo = state.todos.find(t => t.id === parseInt(todoId));
    if (!todo) return;
    
    // Fill modal with todo details for viewing
    editTodo(todoId);
}

// Initialize color picker event listeners
document.querySelectorAll('.color-option').forEach(option => {
    option.addEventListener('click', () => {
        document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        elements.categoryColor.value = option.getAttribute('data-color');
    });
});

// Set up event listeners
document.addEventListener('DOMContentLoaded', init);
elements.addTodoBtn.addEventListener('click', showAddTodoModal);
elements.addCategoryBtn.addEventListener('click', showAddCategoryModal);
elements.closeTodoModal.addEventListener('click', hideTodoModal);
elements.closeCategoryModal.addEventListener('click', hideCategoryModal);
elements.saveTodoBtn.addEventListener('click', saveTodo);
elements.saveCategoryBtn.addEventListener('click', saveCategory);
elements.cancelTodoBtn.addEventListener('click', hideTodoModal);
elements.cancelCategoryBtn.addEventListener('click', hideCategoryModal);
elements.priorityFilter.addEventListener('change', filterTodos);
elements.statusFilter.addEventListener('change', filterTodos);