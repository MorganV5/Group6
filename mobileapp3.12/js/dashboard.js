document.addEventListener("DOMContentLoaded", function () {
    const taskList = document.querySelector(".task-list");
    const completedTasks = document.querySelector(".completed-tasks");
    const weekFilter = document.getElementById("weekFilter");
    const monthFilter = document.getElementById("monthFilter");
    const addTaskButton = document.getElementById("addTask");

    let tasks = JSON.parse(localStorage.getItem("tasks")) || [
        { id: 1, name: "Clean common area", dueDate: "2025-02-25" },
        { id: 2, name: "Take out trash", dueDate: "2025-02-27"},
        { id: 3, name: "Do laundry", dueDate: "2025-02-28" },
        { id: 4, name: "Buy toilet paper", dueDate: "2025-03-25" },
    ];

    let completed = JSON.parse(localStorage.getItem("completedTasks")) || [];

    // 默认筛选方式，记住用户上次选择
    let currentFilter = localStorage.getItem("taskFilter") || "week";

    function getDaysRemaining(dueDate) {
        if (!dueDate) return Infinity; // 避免无效日期
        const due = new Date(dueDate);
        if (isNaN(due)) return Infinity; // 确保日期有效
        const today = new Date();
        const diffTime = due.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    function renderTasks() {
        taskList.innerHTML = "";
        completedTasks.innerHTML = "";

        let filteredTasks = tasks.filter(task => {
            let daysRemaining = getDaysRemaining(task.dueDate);
            if (daysRemaining === Infinity) return false; // 过滤无效任务
            return currentFilter === "week" ? daysRemaining <= 7 : daysRemaining <= 31;
        });

        // 按截止日期排序
        filteredTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        filteredTasks.forEach(task => {
            const taskItem = document.createElement("li");
            taskItem.classList.add("task-item");
            taskItem.setAttribute("data-id", task.id);


            taskItem.innerHTML = `
                <button class="remove-btn" data-id="${task.id}">❌</button>
                <span class="task-name">${task.name}</span>
                <span class="due-text">Due in ${getDaysRemaining(task.dueDate)} days</span>
                <button class="edit-btn" data-id="${task.id}">➜</button>
            `;

            taskItem.querySelector(".edit-btn").addEventListener("click", function (event) {
                event.stopPropagation();
                const taskId = parseInt(this.dataset.id);
                localStorage.setItem("editingTask", JSON.stringify(tasks.find(t => t.id === taskId)));
                window.location.href = "edit_task.html";
            });

            taskItem.querySelector(".remove-btn").addEventListener("click", function (event) {
                event.stopPropagation();
                removeTask(task.id);
            });

            taskItem.addEventListener("click", function () {
                markTaskAsCompleted(task.id);
            });

            taskList.appendChild(taskItem);
        });

        completed.forEach(task => {
            const taskItem = document.createElement("li");
            taskItem.classList.add("task-item", "completed");
            taskItem.innerHTML = `
                ✔️ <s>${task.name}</s>
                <button class="remove-btn" data-id="${task.id}">❌</button>
            `;

            taskItem.querySelector(".remove-btn").addEventListener("click", function () {
                removeCompletedTask(task.id);
            });

            taskItem.addEventListener("click", function () {
                moveTaskBackToActive(task.id);
            });

            completedTasks.appendChild(taskItem);
        });

        localStorage.setItem("tasks", JSON.stringify(tasks));
        localStorage.setItem("completedTasks", JSON.stringify(completed));
    }

    function markTaskAsCompleted(taskId) {
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex > -1) {
            completed.push(tasks[taskIndex]);
            tasks.splice(taskIndex, 1);
            renderTasks();
        }
    }

    function moveTaskBackToActive(taskId) {
        const taskIndex = completed.findIndex(t => t.id === taskId);
        if (taskIndex > -1) {
            tasks.push(completed[taskIndex]);
            completed.splice(taskIndex, 1);
            renderTasks();
        }
    }

    function removeTask(taskId) {
        tasks = tasks.filter(task => task.id !== taskId);
        renderTasks();
    }

    function removeCompletedTask(taskId) {
        completed = completed.filter(task => task.id !== taskId);
        renderTasks();
    }

    // 过滤按钮事件
    weekFilter.addEventListener("click", function () {
        currentFilter = "week";
        localStorage.setItem("taskFilter", "week");
        weekFilter.classList.add("active");
        monthFilter.classList.remove("active");
        renderTasks();
    });

    monthFilter.addEventListener("click", function () {
        currentFilter = "month";
        localStorage.setItem("taskFilter", "month");
        monthFilter.classList.add("active");
        weekFilter.classList.remove("active");
        renderTasks();
    });

    // 添加任务事件（跳转到 edit_task.html 进行任务编辑）
    addTaskButton.addEventListener("click", function () {
        // 存储一个空的任务，表示新建任务
        localStorage.setItem("editingTask", JSON.stringify({ id: null, name: "", dueDate: "", urgent: false }));

        // 跳转到 edit_task.html 进行任务编辑
        window.location.href = "edit_task.html";
    });

    // **确保页面加载时默认显示 "This Week"**
    if (currentFilter === "week") {
        weekFilter.classList.add("active");
        monthFilter.classList.remove("active");
    } else {
        monthFilter.classList.add("active");
        weekFilter.classList.remove("active");
    }

    renderTasks(); // 初始渲染
});
