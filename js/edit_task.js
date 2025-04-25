document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const taskId = params.get("id");
  const userId = localStorage.getItem("userId");

  if (!taskId || !userId) {
    alert("Task ID or user ID missing.");
    return;
  }

  try {
    const res = await fetch(`/api/tasks/details/${taskId}?user=${userId}`);
    if (!res.ok) throw new Error("Failed to fetch task details");

    const data = await res.json();

    // ✅ 填充页面内容
    document.getElementById("taskTitle").textContent = data.name;
    document.getElementById("assignedTo").textContent =
      data.assigned_to_name === data.current_user_name ? "You" : data.assigned_to_name;
    document.getElementById("assignedAvatar").src =
      data.assigned_to_avatar || "img/default.png";
    document.getElementById("statusText").textContent = data.status_name || "Unknown";
    document.getElementById("dueDate").textContent = new Date(data.due_date).toLocaleDateString();
    document.getElementById("descriptionText").textContent = data.description || "No description.";

    // ✅ 点击“Mark as Done”前弹出确认框
    document.querySelector(".btn.filled").addEventListener("click", async () => {
      const confirmed = confirm("Are you sure you want to mark this task as completed?");
      if (!confirmed) return;

      try {
        const updateRes = await fetch(`/api/progress-tasks/status/${data.progress_task_id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status_id: 2 })
        });

        if (updateRes.ok) {
          // ✅ 跳转上传图片页面（可多选上传）
          const uploadUrl = `taskDone_Gallery.html?task=${taskId}&progress=${data.progress_task_id}`;
          window.location.href = uploadUrl;
        } else {
          alert("❌ Failed to update task status.");
        }
      } catch (err) {
        console.error("❌ Error updating task:", err);
        alert("Error occurred while completing task.");
      }
    });

    // ✅ 跳转到任务交换页面
    document.querySelector(".btn.outline").addEventListener("click", () => {
      window.location.href = `task_exchange.html?task=${taskId}`;
    });

  } catch (err) {
    console.error("❌ Failed to load task:", err);
    alert("Unable to load task details.");
  }
});
