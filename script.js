// ==============================
// Todo App State
// ==============================

let tasks = [];
let currentFilter = "all";
let searchText = "";
let editingTaskId = null;

const STORAGE_KEY = "todoAppTasks";
const THEME_KEY = "todoAppTheme";


// ==============================
// Get HTML Elements
// ==============================

const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");

const prioritySelect = document.getElementById("prioritySelect");
const dueDate = document.getElementById("dueDate");
const categoryInput = document.getElementById("categoryInput");

const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");

const totalCount = document.getElementById("totalCount");
const completedCount = document.getElementById("completedCount");
const activeCount = document.getElementById("activeCount");
const taskSummary = document.getElementById("taskSummary");

const searchInput = document.getElementById("searchInput");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const themeToggle = document.getElementById("themeToggle");

const filterButtons = document.querySelectorAll(".filter-btn");

// Edit modal elements
const editModal = document.getElementById("editModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const saveEditBtn = document.getElementById("saveEditBtn");

const editTaskInput = document.getElementById("editTaskInput");
const editPriority = document.getElementById("editPriority");
const editDueDate = document.getElementById("editDueDate");
const editCategory = document.getElementById("editCategory");


// ==============================
// Load Saved Data
// ==============================

function loadTasks() {
    const savedTasks = localStorage.getItem(STORAGE_KEY);

    if (savedTasks) {
        try {
            tasks = JSON.parse(savedTasks);
        } catch (error) {
            tasks = [];
        }
    }
}

function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}


// ==============================
// Generate Task ID
// ==============================

function generateId() {
    return Date.now().toString() + Math.random().toString(16).slice(2);
}


// ==============================
// Add Task
// ==============================

function addTask() {
    const title = taskInput.value.trim();

    if (!title) {
        taskInput.focus();
        return;
    }

    const newTask = {
        id: generateId(),
        title: title,
        priority: prioritySelect.value,
        dueDate: dueDate.value,
        category: categoryInput.value.trim(),
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.unshift(newTask);

    saveTasks();
    renderTasks();

    taskInput.value = "";
    dueDate.value = "";
    categoryInput.value = "";
    prioritySelect.value = "medium";

    taskInput.focus();
}


// ==============================
// Delete Task
// ==============================

function deleteTask(id) {
    tasks = tasks.filter(function (task) {
        return task.id !== id;
    });

    saveTasks();
    renderTasks();
}


// ==============================
// Toggle Task Completion
// ==============================

function toggleTask(id) {
    tasks = tasks.map(function (task) {

        if (task.id === id) {
            return {
                ...task,
                completed: !task.completed
            };
        }

        return task;
    });

    saveTasks();
    renderTasks();
}


// ==============================
// Open Edit Modal
// ==============================

function editTask(id) {
    const task = tasks.find(function (item) {
        return item.id === id;
    });

    if (!task) {
        return;
    }

    editingTaskId = id;

    editTaskInput.value = task.title;
    editPriority.value = task.priority;
    editDueDate.value = task.dueDate;
    editCategory.value = task.category;

    editModal.classList.add("show");

    setTimeout(function () {
        editTaskInput.focus();
        editTaskInput.select();
    }, 50);
}


// ==============================
// Close Edit Modal
// ==============================

function closeEditModal() {
    editModal.classList.remove("show");

    editingTaskId = null;
}


// ==============================
// Save Edited Task
// ==============================

function saveEditedTask() {

    if (!editingTaskId) {
        return;
    }

    const updatedTitle = editTaskInput.value.trim();

    if (!updatedTitle) {
        editTaskInput.focus();
        return;
    }

    const task = tasks.find(function (item) {
        return item.id === editingTaskId;
    });

    if (!task) {
        return;
    }

    task.title = updatedTitle;
    task.priority = editPriority.value;
    task.dueDate = editDueDate.value;
    task.category = editCategory.value.trim();

    saveTasks();

    closeEditModal();

    renderTasks();
}


// ==============================
// Filter Tasks
// ==============================

function getFilteredTasks() {

    let filteredTasks = [...tasks];

    if (currentFilter === "active") {

        filteredTasks = filteredTasks.filter(function (task) {
            return !task.completed;
        });

    }

    if (currentFilter === "completed") {

        filteredTasks = filteredTasks.filter(function (task) {
            return task.completed;
        });

    }

    if (searchText) {

        const search = searchText.toLowerCase();

        filteredTasks = filteredTasks.filter(function (task) {

            return (
                task.title.toLowerCase().includes(search) ||
                task.category.toLowerCase().includes(search) ||
                task.priority.toLowerCase().includes(search)
            );

        });
    }

    return filteredTasks;
}


// ==============================
// Format Due Date
// ==============================

function formatDueDate(dateString) {

    if (!dateString) {
        return "";
    }

    const date = new Date(dateString + "T00:00:00");

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}


// ==============================
// Create Task Card
// ==============================

function createTaskCard(task) {

    const card = document.createElement("article");

    card.className = "task-card";

    if (task.completed) {
        card.classList.add("completed");
    }


    const main = document.createElement("div");

    main.className = "task-main";


    const completeButton = document.createElement("button");

    completeButton.className = "complete-btn";
    completeButton.type = "button";

    completeButton.title = task.completed
        ? "Mark as active"
        : "Mark as completed";


    if (task.completed) {

        completeButton.textContent = "✓";

        completeButton.style.background = "var(--primary)";
        completeButton.style.borderColor = "var(--primary)";
        completeButton.style.color = "white";
    }


    completeButton.addEventListener("click", function () {
        toggleTask(task.id);
    });


    const content = document.createElement("div");

    content.className = "task-content";


    const title = document.createElement("div");

    title.className = "task-title";
    title.textContent = task.title;


    const meta = document.createElement("div");

    meta.className = "task-meta";


    const priorityBadge = document.createElement("span");

    priorityBadge.className =
        "badge priority-" + task.priority;

    priorityBadge.textContent =
        task.priority.charAt(0).toUpperCase() +
        task.priority.slice(1) +
        " Priority";

    meta.appendChild(priorityBadge);


    if (task.category) {

        const categoryBadge = document.createElement("span");

        categoryBadge.className = "badge";

        categoryBadge.textContent =
            "📁 " + task.category;

        meta.appendChild(categoryBadge);
    }


    if (task.dueDate) {

        const dateBadge = document.createElement("span");

        dateBadge.className = "badge";

        dateBadge.textContent =
            "📅 " + formatDueDate(task.dueDate);

        meta.appendChild(dateBadge);
    }


    content.appendChild(title);
    content.appendChild(meta);


    const actions = document.createElement("div");

    actions.className = "task-actions";


    const editButton = document.createElement("button");

    editButton.className = "task-action-btn";
    editButton.type = "button";

    editButton.textContent = "✏️";
    editButton.title = "Edit task";


    editButton.addEventListener("click", function () {
        editTask(task.id);
    });


    const deleteButton = document.createElement("button");

    deleteButton.className =
        "task-action-btn delete";

    deleteButton.type = "button";

    deleteButton.textContent = "🗑";
    deleteButton.title = "Delete task";


    deleteButton.addEventListener("click", function () {
        deleteTask(task.id);
    });


    actions.appendChild(editButton);
    actions.appendChild(deleteButton);


    main.appendChild(completeButton);
    main.appendChild(content);
    main.appendChild(actions);

    card.appendChild(main);

    return card;
}


// ==============================
// Render Tasks
// ==============================

function renderTasks() {

    taskList.innerHTML = "";

    const filteredTasks = getFilteredTasks();


    if (filteredTasks.length === 0) {

        emptyState.style.display = "block";

    } else {

        emptyState.style.display = "none";

        filteredTasks.forEach(function (task) {

            const card = createTaskCard(task);

            taskList.appendChild(card);

        });
    }

    updateStatistics();
}


// ==============================
// Update Statistics
// ==============================

function updateStatistics() {

    const total = tasks.length;

    const completed = tasks.filter(function (task) {
        return task.completed;
    }).length;

    const active = total - completed;


    totalCount.textContent = total;
    completedCount.textContent = completed;
    activeCount.textContent = active;


    taskSummary.textContent =
        total === 1
            ? "1 task"
            : `${total} tasks`;
}


// ==============================
// Filter Buttons
// ==============================

filterButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        filterButtons.forEach(function (item) {
            item.classList.remove("active");
        });


        button.classList.add("active");

        currentFilter = button.dataset.filter;

        renderTasks();
    });
});


// ==============================
// Search
// ==============================

searchInput.addEventListener("input", function () {

    searchText =
        searchInput.value.trim();

    renderTasks();
});


// ==============================
// Add Task Events
// ==============================

addTaskBtn.addEventListener("click", addTask);


taskInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {
        addTask();
    }
});


// ==============================
// Clear Completed
// ==============================

clearCompletedBtn.addEventListener("click", function () {

    tasks = tasks.filter(function (task) {
        return !task.completed;
    });

    saveTasks();

    renderTasks();
});


// ==============================
// Edit Modal Events
// ==============================

saveEditBtn.addEventListener(
    "click",
    saveEditedTask
);


cancelEditBtn.addEventListener(
    "click",
    closeEditModal
);


closeModalBtn.addEventListener(
    "click",
    closeEditModal
);


// Close modal when clicking outside it

editModal.addEventListener(
    "click",
    function (event) {

        if (event.target === editModal) {
            closeEditModal();
        }

    }
);


// Save edited task using Enter

editTaskInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {
            saveEditedTask();
        }

        if (event.key === "Escape") {
            closeEditModal();
        }

    }
);


// ==============================
// Theme
// ==============================

function loadTheme() {

    const savedTheme =
        localStorage.getItem(THEME_KEY);


    if (savedTheme === "dark") {

        document.body.classList.add("dark");

        themeToggle.textContent = "☀️";

    } else {

        document.body.classList.remove("dark");

        themeToggle.textContent = "🌙";
    }
}


function toggleTheme() {

    document.body.classList.toggle("dark");

    const darkMode =
        document.body.classList.contains("dark");


    if (darkMode) {

        localStorage.setItem(
            THEME_KEY,
            "dark"
        );

        themeToggle.textContent = "☀️";

    } else {

        localStorage.setItem(
            THEME_KEY,
            "light"
        );

        themeToggle.textContent = "🌙";
    }
}


themeToggle.addEventListener(
    "click",
    toggleTheme
);


// ==============================
// Start App
// ==============================

loadTasks();
loadTheme();
renderTasks();