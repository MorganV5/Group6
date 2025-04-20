document.getElementById("step2Form").addEventListener("submit", async function (e) {
    e.preventDefault();
  
    const formData = new FormData();
  
    formData.append("email", localStorage.getItem("email"));
    formData.append("password", localStorage.getItem("password"));
    formData.append("flatCode", localStorage.getItem("flatCode"));
  
    formData.append("name", document.getElementById("name").value);
    formData.append("phone", document.getElementById("phone").value || '');
    formData.append("aboutMe", document.getElementById("aboutMe").value || '');
  
    const fileInput = document.getElementById("profile_picture");
    if (fileInput.files.length > 0) {
      formData.append("profile_picture", fileInput.files[0]);
    }
  
    try {
      const response = await fetch("/users/register", {
        method: "POST",
        body: formData
      });
  
      const result = await response.json();
      if (response.ok) {
        localStorage.removeItem("email");
        localStorage.removeItem("password");
        localStorage.removeItem("flatCode");
        alert("✅ Registration successful!");
        window.location.href = "/dashboard";
      } else {
        alert("❌ Registration failed: " + result.message);
      }
    } catch (err) {
      alert("❌ Something went wrong.");
      console.error(err);
    }
  });
  
  document.getElementById("profile_picture").addEventListener("change", function () {
    const file = this.files[0];
    const previewImg = document.getElementById("previewImg");
    const uploadText = document.getElementById("uploadText");
  
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        previewImg.src = e.target.result;
        previewImg.style.display = "block";
        uploadText.style.display = "none";
      };
      reader.readAsDataURL(file);
    }
  });
  