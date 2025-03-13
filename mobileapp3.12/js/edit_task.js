document.addEventListener("DOMContentLoaded", function () {
    // Retrieve task to edit from localStorage
    let task = JSON.parse(localStorage.getItem("editingTask"));
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    if (!task) {
        window.location.href = "dashboard.html"; // Redirect if no task found
        return;
    }

    // Populate form fields with task details
    document.getElementById("taskName").value = task.name;
    document.getElementById("taskDescription").value = task.description || "";
    document.getElementById("startDate").value = task.startDate || "2025-03-14";
    document.getElementById("dueDate").value = task.dueDate || "2025-03-19";
    document.getElementById("assignedTo").value = task.assignedTo || "Sanny";

    // Handle important toggle
    if (task.urgent) {
        document.getElementById("importantYes").classList.add("active");
    } else {
        document.getElementById("importantNo").classList.add("active");
    }

    document.getElementById("importantYes").addEventListener("click", function () {
        task.urgent = true;
        document.getElementById("importantYes").classList.add("active");
        document.getElementById("importantNo").classList.remove("active");
    });

    document.getElementById("importantNo").addEventListener("click", function () {
        task.urgent = false;
        document.getElementById("importantNo").classList.add("active");
        document.getElementById("importantYes").classList.remove("active");
    });

    // Save changes
    document.getElementById("save").addEventListener("click", function () {
        task.name = document.getElementById("taskName").value;
        task.description = document.getElementById("taskDescription").value;
        task.startDate = document.getElementById("startDate").value;
        task.dueDate = document.getElementById("dueDate").value;
        task.assignedTo = document.getElementById("assignedTo").value;

        // Find and update task in task list
        let taskIndex = tasks.findIndex(t => t.id === task.id);
        if (taskIndex > -1) {
            tasks[taskIndex] = task;
        }

        // Save updated tasks to localStorage
        localStorage.setItem("tasks", JSON.stringify(tasks));

        // Redirect back to dashboard
        window.location.href = "dashboard.html";
    });

    // Cancel and go back to dashboard
    document.getElementById("cancel").addEventListener("click", function () {
        window.location.href = "dashboard.html";
    });
});
document.addEventListener("DOMContentLoaded", function () {
    let task = JSON.parse(localStorage.getItem("editingTask"));
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    // Check if it's a new task
    let isNewTask = task.id === null;

    if (isNewTask) {
        task.id = Date.now(); // Assign a unique ID
    }

    document.getElementById("taskName").value = task.name;
    document.getElementById("dueDate").value = task.dueDate || "2025-03-19";

    document.getElementById("save").addEventListener("click", function () {
        task.name = document.getElementById("taskName").value;
        task.dueDate = document.getElementById("dueDate").value;

        if (isNewTask) {
            tasks.push(task);
        } else {
            let index = tasks.findIndex(t => t.id === task.id);
            if (index !== -1) {
                tasks[index] = task;
            }
        }

        localStorage.setItem("tasks", JSON.stringify(tasks));
        window.location.href = "dashboard.html";
    });

    document.getElementById("cancel").addEventListener("click", function () {
        window.location.href = "dashboard.html";
    });
});
