document.addEventListener('DOMContentLoaded', async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('user');
  const currentUserId = localStorage.getItem("userId");
  const isOwner = userId === currentUserId;

  let editing = false;

  if (!userId) return;

  const nameElem = document.querySelector(".profile-name");
  const phoneElem = document.querySelector(".info-content.phone");
  const aboutElem = document.querySelector(".info-content.about");
  const avatarImg = document.getElementById("avatarPreview");
  const avatarInput = document.getElementById("avatarInput");
  const editBtn = document.getElementById("editToggleBtn");
  const saveBtn = document.getElementById("saveBtn");
  const uploadAvatarBtn = document.getElementById("uploadAvatarBtn");

  try {
    const res = await fetch(`/api/user-profile/${userId}`);
    const user = await res.json();

    nameElem.textContent = user.name || "Unknown";
    avatarImg.src = user.profile_picture || "img/default.png";

    phoneElem.innerHTML = `<p>${user.phone || "N/A"}</p>`;
    aboutElem.innerHTML = `<p>${user.about_me || "No introduction yet."}</p>`;

    // 默认隐藏编辑相关内容
    avatarInput.style.display = "none";
    uploadAvatarBtn.style.display = "none";
    avatarImg.style.cursor = "default";
    avatarImg.title = "";

    if (isOwner) {
      editBtn.style.display = "inline-block";

      editBtn.addEventListener("click", () => {
        editing = true;
        editBtn.style.display = "none";
        saveBtn.style.display = "inline-block";
        uploadAvatarBtn.style.display = "inline-block";

        phoneElem.innerHTML = `<input id="edit-phone" type="tel" value="${user.phone || ''}" placeholder="Phone number" />`;
        aboutElem.innerHTML = `<textarea id="edit-about" rows="4">${user.about_me || ''}</textarea>`;
      });

      uploadAvatarBtn.addEventListener("click", () => {
        avatarInput.click(); // 触发文件选择器
      });

      avatarInput.addEventListener("change", async () => {
        const file = avatarInput.files[0];
        if (!file) return alert("Please choose a file first!");

        const formData = new FormData();
        formData.append("avatar", file);

        try {
          const res = await fetch(`/api/user-profile/upload/${userId}`, {
            method: "POST",
            body: formData
          });

          const result = await res.json();
          if (result.profile_picture) {
            avatarImg.src = result.profile_picture;
            alert("✅ Avatar updated!");
          } else {
            alert("⚠️ Upload failed.");
          }
        } catch (err) {
          console.error("❌ Error uploading avatar:", err);
          alert("Upload failed.");
        }
      });

      saveBtn.addEventListener("click", async () => {
        const updatedPhone = document.getElementById("edit-phone").value;
        const updatedAbout = document.getElementById("edit-about").value;

        try {
          const res = await fetch(`/api/user-profile/${userId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: updatedPhone, about_me: updatedAbout }),
          });

          const result = await res.json();
          if (res.ok) {
            alert("✅ Profile updated!");

            editing = false;
            saveBtn.style.display = "none";
            uploadAvatarBtn.style.display = "none";
            editBtn.style.display = "inline-block";

            phoneElem.innerHTML = `<p>${updatedPhone}</p>`;
            aboutElem.innerHTML = `<p>${updatedAbout}</p>`;
          }
        } catch (err) {
          console.error("❌ Save failed:", err);
          alert("Failed to save changes.");
        }
      });
    }
  } catch (err) {
    console.error("❌ Failed to load profile:", err);
    alert("Failed to load user data.");
  }
});
