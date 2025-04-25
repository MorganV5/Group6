document.addEventListener("DOMContentLoaded", function () {
  const userName = localStorage.getItem("userName");
    if (userName) {
      document.getElementById("welcomeMessage").textContent = `Hello, ${userName}!`;
    }

  const taskList = document.querySelector(".task-list");
  const completedTasks = document.querySelector(".completed-tasks");
  const weekFilter = document.getElementById("weekFilter");
  const monthFilter = document.getElementById("monthFilter");
  const addTaskButton = document.getElementById("addTask");

  let userId = localStorage.getItem("userId") || 1;
  let tasks = [];
  let currentFilter = localStorage.getItem("taskFilter") || "week";

  function getDaysRemaining(dueDate) {
    if (!dueDate) return Infinity;
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  async function fetchTasks() {
    try {
      const response = await fetch(`/api/tasks/${userId}`);
      tasks = await response.json();
      renderTasks();
    } catch (err) {
      console.error("❌ Failed to fetch tasks:", err);
    }
  }

  async function toggleTaskStatus(progressTaskId, currentStatusId) {
    const newStatusId = currentStatusId === 1 ? 2 : 1;
    try {
      await fetch(`/api/progress-tasks/status/${progressTaskId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status_id: newStatusId }),
      });
      fetchTasks();
    } catch (err) {
      console.error("❌ Failed to toggle task status:", err);
    }
  }

  function renderTasks() {
    taskList.innerHTML = "";
    completedTasks.innerHTML = "";

    const filteredTasks = tasks.filter(task => {
      const daysRemaining = getDaysRemaining(task.due_date);
      if (daysRemaining === Infinity) return false;
      return currentFilter === "week" ? daysRemaining <= 7 : daysRemaining <= 31;
    });

    filteredTasks.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

    filteredTasks.forEach(task => {
      const li = document.createElement("li");
      li.className = "task-item";
      if (task.status_id === 2) li.classList.add("completed");

      const circle = document.createElement("div");
      circle.className = "circle";
      if (task.status_id === 2) circle.classList.add("completed");

      circle.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleTaskStatus(task.progress_task_id, task.status_id);
      });

      const textContainer = document.createElement("div");
      textContainer.className = "task-text";

      const taskName = document.createElement("span");
      taskName.className = "task-name";
      taskName.textContent = task.name;

      const dueText = document.createElement("div");
      dueText.className = "due-text";
      const remaining = getDaysRemaining(task.due_date);
      dueText.textContent = `Due in ${remaining} days`;
      if (remaining < 0) dueText.classList.add("overdue");

      textContainer.appendChild(taskName);
      textContainer.appendChild(dueText);

      const chevron = document.createElement("span");
      chevron.className = "chevron";
      chevron.innerHTML = "&#8250;";

      li.appendChild(circle);
      li.appendChild(textContainer);
      li.appendChild(chevron);
      
      li.addEventListener("click", () => {
        const userId = localStorage.getItem("userId");
        window.location.href = `edit_task.html?id=${task.task_id}&user=${userId}`;
      });
      

      if (task.status_id === 2) {
        completedTasks.appendChild(li);
      } else {
        taskList.appendChild(li);
      }
    });
  }

  weekFilter.addEventListener("click", () => {
    currentFilter = "week";
    localStorage.setItem("taskFilter", "week");
    weekFilter.classList.add("active");
    monthFilter.classList.remove("active");
    renderTasks();
  });

  monthFilter.addEventListener("click", () => {
    currentFilter = "month";
    localStorage.setItem("taskFilter", "month");
    monthFilter.classList.add("active");
    weekFilter.classList.remove("active");
    renderTasks();
  });

  addTaskButton.addEventListener("click", () => {
    window.location.href = "add_task.html";
  });

  if (currentFilter === "week") {
    weekFilter.classList.add("active");
  } else {
    monthFilter.classList.add("active");
  }

  fetchTasks();
});
