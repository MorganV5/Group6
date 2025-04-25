document.addEventListener("DOMContentLoaded", async () => {
    const taskId = new URLSearchParams(window.location.search).get("task");
    const progressId = new URLSearchParams(window.location.search).get("progress");
  
    const photoDisplay = document.getElementById("photoDisplay");
    const photoTime = document.getElementById("photoTime");
    const commentBox = document.getElementById("commentInput");
    const dotsContainer = document.getElementById("dotsContainer");
    const saveBtn = document.getElementById("saveBtn");
  
    if (!taskId || !progressId) {
      alert("Missing task or progress ID");
      return;
    }
  
    let photos = [];
    let current = 0;
  
    async function loadPhotos() {
      try {
        console.log("✅ 请求的 progressId:", progressId);
        const res = await fetch(`/api/progress-task-photos/${progressId}`);
        photos = await res.json();
        console.log("✅ 返回的 photos:", photos);
  
        if (!photos.length) {
          photoDisplay.style.display = "none";
          photoTime.textContent = "No photo";
          return;
        }
  
        photoDisplay.style.display = "block";
        updatePhoto(0);
        renderDots();
      } catch (err) {
        console.error("Failed to load photos:", err);
      }
    }
  
    function updatePhoto(index) {
        const photo = photos[index];
      
        console.log("📸 当前图片对象:", photo);
        console.log("📸 当前图片 URL:", photo.photo_url);
      
        if (photo && photo.photo_url) {
          photoDisplay.src = photo.photo_url;
          photoDisplay.style.display = "block";
        } else {
          photoDisplay.src = "";
          photoDisplay.style.display = "none";
        }
      
        photoTime.textContent = ""; // 暂不显示时间
      
        current = index;
      
        [...dotsContainer.children].forEach((dot, i) => {
          dot.classList.toggle("active", i === index);
        });
      
        commentBox.value = photo.description || "";
      }
      
  
    function renderDots() {
      dotsContainer.innerHTML = "";
      photos.forEach((_, i) => {
        const dot = document.createElement("div");
        dot.className = "dot";
        if (i === current) dot.classList.add("active");
        dot.addEventListener("click", () => updatePhoto(i));
        dotsContainer.appendChild(dot);
      });
    }
  
    saveBtn.addEventListener("click", async () => {
      const comment = commentBox.value;
      if (!photos[current]) return;
  
      try {
        const res = await fetch(`/api/progress-task-photos/comment/${photos[current].id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: comment }),
        });
  
        if (res.ok) {
          alert("✅ Comment saved");
          photos[current].description = comment;
          window.location.href = "dashboard.html";
        } else {
          alert("❌ Save failed");
        }
      } catch (err) {
        console.error("Failed to save comment:", err);
      }
    });
  
    await loadPhotos();
  });
  