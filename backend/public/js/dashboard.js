document.addEventListener("DOMContentLoaded", async () => {
    try {
      const res = await fetch("/tasks/userTasks", {
        headers: {
          "Authorization": `Bearer ${getToken()}`
        }
      });
  
      const tasks = await res.json();
      const container = document.getElementById("taskListContainer");
  
      if (!tasks.length) {
        container.innerHTML = "<p>No tasks assigned to you.</p>";
        return;
      }
  
      tasks.forEach(task => {
        const card = document.createElement("div");
        card.className = "task-card";
        card.innerHTML = `
          <h3>${task.name}</h3>
          <p>${task.description}</p>
          <p>Due: ${new Date(task.due_date).toLocaleString()}</p>
          <button onclick="editTask(${task.id})">✏️ Edit</button>
        `;
        container.appendChild(card);
      });
    } catch (err) {
      console.error("Error loading tasks:", err);
    }
  });
  
  function getToken() {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('authToken='))
      ?.split('=')[1];
    return token || '';
  }
  
  function editTask(id) {
    window.location.href = `/edit_task?id=${id}`;
  }
  
  document.getElementById("logoutBtn").addEventListener("click", () => {
    window.location.href = "/logout";
  });
  
  