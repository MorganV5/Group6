const taskId = new URLSearchParams(window.location.search).get("id");

document.addEventListener("DOMContentLoaded", async () => {
  if (!taskId) return alert("Missing task ID");

  try {
    const res = await fetch(`/tasks/getTask/${taskId}`, {
      headers: authHeader()
    });
    const task = await res.json();

    document.getElementById("task_name").value = task.name || "";
    document.getElementById("description").value = task.description || "";

    if (task.due_date) {
      const dt = new Date(task.due_date);
      document.getElementById("due_date").value = dt.toISOString().slice(0, 16);
    }

    await populateSelect("repeat_frequency", "/frequencies/frequency", "id", task.repeat_frequency);
    await populateSelect("area_id", "/areas/areas", "id", task.area_id);
    await populateSelect("assigned_to_id", "/users/allusers", "id", task.assigned_to_id);

  } catch (err) {
    console.error("Failed to load task:", err);
    alert("Failed to load task.");
  }
});

document.getElementById("editForm").addEventListener("submit", async e => {
  e.preventDefault();

  const updatedTask = {
    description: document.getElementById("description").value,
    due_date: document.getElementById("due_date").value,
    repeat_frequency: document.getElementById("repeat_frequency").value || null,
    area_id: document.getElementById("area_id").value || null,
    assigned_to_id: document.getElementById("assigned_to_id").value || null
  };

  try {
    const res = await fetch(`/tasks/update/${taskId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeader()
      },
      body: JSON.stringify(updatedTask)
    });

    const result = await res.json();
    if (res.ok) {
      alert("ask updated!");
      window.location.href = "/dashboard";
    } else {
      alert("Update failed: " + result.message);
    }
  } catch (err) {
    console.error("Update error:", err);
    alert("Failed to update task.");
  }
});

document.getElementById("deleteBtn").addEventListener("click", async () => {
  if (!confirm("Delete this task?")) return;

  try {
    const res = await fetch(`/tasks/delete/${taskId}`, {
      method: "DELETE",
      headers: authHeader()
    });

    if (res.ok) {
      alert("Task deleted");
      window.location.href = "/dashboard";
    } else {
      alert("Failed to delete task");
    }
  } catch (err) {
    console.error("Delete error:", err);
    alert("Server error.");
  }
});

async function populateSelect(id, endpoint, valueField, selectedValue) {
  const res = await fetch(endpoint, {headers: authHeader()});
  const data = await res.json();
  const select = document.getElementById(id);
  select.innerHTML = `<option value="">-- Select --</option>`;
  data.forEach(item => {
    const opt = document.createElement("option");
    opt.value = item[valueField];
    opt.textContent = item.name || item.frequency;
    if (String(opt.value) === String(selectedValue)) opt.selected = true;
    select.appendChild(opt);
  });
}

function authHeader() {
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('authToken='))
    ?.split('=')[1];
    
  return token ? { "Authorization": `Bearer ${token}` } : {};
}
