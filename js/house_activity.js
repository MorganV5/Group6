document.addEventListener("DOMContentLoaded", async () => {
  const activityList = document.getElementById("activityList");

  try {
    const res = await fetch("/house-activity");
    const activities = await res.json();

    activities.forEach(item => {
      const card = document.createElement("div");
      card.className = "activity-card";

      const stars = "★".repeat(item.score || 0) + "☆".repeat(5 - (item.score || 0));

      card.innerHTML = `
        <div class="user-info">
          <img src="${item.profile_picture || '/default.png'}" alt="${item.name}" />
          <div>
            <strong>${item.task_name}</strong><br>
            Who: ${item.name} &nbsp;&nbsp;
            Status: <span style="color:${item.status === 'Completed' ? 'green' : 'orange'}">${item.status}</span>
          </div>
        </div>
        ${item.photo_url ? `<img class="activity-image" src="${item.photo_url}" alt="task photo" />` : ""}
        ${item.completion_date ? `<p>${item.completion_date}</p>` : ""}
        <div class="stars">${stars}</div>
      `;

      activityList.appendChild(card);
    });
  } catch (err) {
    activityList.textContent = "❌ Failed to load activity.";
    console.error(err);
  }
});
