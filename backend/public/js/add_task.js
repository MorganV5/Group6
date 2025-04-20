document.addEventListener("DOMContentLoaded", async () => {
    await loadFrequencies();
    await loadAreas();
    await loadUsers();
  });
  
  document.getElementById("addTaskForm").addEventListener("submit", async function (e) {
    e.preventDefault();
  
    const task = {
      name: document.getElementById("name").value,
      description: document.getElementById("description").value,
      due_date: document.getElementById("due_date").value,
      repeat_frequency: document.getElementById("repeat_frequency").value || null,
      area_id: document.getElementById("area_id").value || null,
      assigned_to_id: document.getElementById("assigned_to_id").value || null
    };
  
    try {
      const res = await fetch("/tasks/createTask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(task)
      });
  
      const result = await res.json();
      if (res.ok) {
        alert("✅ Task added.");
        window.location.href = "/dashboard";
      } else {
        alert("❌ " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Failed to create task.");
    }
  });
  
  async function loadFrequencies() {
    const res = await fetch("/frequencies/frequency", { credentials: "include" });
    const freqs = await res.json();
    const select = document.getElementById("repeat_frequency");
    freqs.forEach(freq => {
      const opt = document.createElement("option");
      opt.value = freq.id;
      opt.textContent = freq.frequency;
      select.appendChild(opt);
    });
  }
  
  async function loadAreas() {
    const res = await fetch("/areas/areas", { credentials: "include" });
    const areas = await res.json();
    const select = document.getElementById("area_id");
    areas.forEach(area => {
      const opt = document.createElement("option");
      opt.value = area.id;
      opt.textContent = area.name;
      select.appendChild(opt);
    });
  }
  
  async function loadUsers() {
    const res = await fetch("/users/allUsers", { credentials: "include" });
    const users = await res.json();
    const select = document.getElementById("assigned_to_id");
    users.forEach(user => {
      const opt = document.createElement("option");
      opt.value = user.id;
      opt.textContent = user.name;
      select.appendChild(opt);
    });
  }
  