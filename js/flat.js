document.addEventListener('DOMContentLoaded', async function () {
    const flatmatesScroll = document.querySelector('.flatmates-scroll');
    const tasksContainer = document.querySelector('.tasks-container');
    const currentUserId = localStorage.getItem("userId");
  
    // Load flatmates
    try {
      const res = await fetch("/api/flatmates");
      const flatmates = await res.json();
    
      flatmatesScroll.innerHTML = "";
      flatmates.forEach(user => {
        const card = document.createElement("div");
        card.className = "flatmate-card";
    
        // 判断是否是自己，跳转加 edit 参数
        card.onclick = () => {
          const targetUrl = user.id == currentUserId
            ? `profile.html?user=${user.id}&edit=true`
            : `profile.html?user=${user.id}`;
          location.href = targetUrl;
        };
    
        card.innerHTML = `
          <div class="flatmate-photo">
            <img src="${user.profile_picture || 'img/default.png'}" alt="${user.name}">
          </div>
          <h3>${user.name}</h3>
        `;
        flatmatesScroll.appendChild(card);
      });
    } catch (err) {
      console.error("❌ Failed to load flatmates:", err);
    }
    
  
    // Load tasks
    try {
      const res = await fetch("/api/flat-tasks");
      const tasks = await res.json();
  
      tasksContainer.innerHTML = "";
      tasks.forEach(task => {
        const card = document.createElement("div");
        card.className = "task-card";
        card.setAttribute("data-id", task.id);
        card.innerHTML = `
          <div class="task-info">
            <h3>${task.task_name}</h3>
            <p class="task-frequency">${task.frequency || 'One-time'}</p>
          </div>
          <div class="assigned-flatmate">
            <img src="${task.profile_picture || 'img/default.png'}" alt="${task.user_name}"
              onclick="event.stopPropagation(); location.href='profile.html?user=${task.user_id}'">
          </div>
        `;
        // ✅ 跳转到编辑任务页面
        card.onclick = () => location.href = `edit_task.html?id=${task.id}&user=${currentUserId}`;
        tasksContainer.appendChild(card);
      });
      
    } catch (err) {
      console.error("❌ Failed to load tasks:", err);
    }
  });
  