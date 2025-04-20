document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
  
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();
  
      localStorage.setItem("email", document.getElementById("email").value);
      localStorage.setItem("password", document.getElementById("password").value);
      localStorage.setItem("flatCode", document.getElementById("flatCode").value);
  
      window.location.href = "/register-step2"; 
    });
  });
  