document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();
  
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
  
    try {
      const res = await fetch("/users/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email, password})
      });
  
      const data = await res.json();
  
      if (res.ok) {
        document.cookie = `authToken=${data.token}; path=/`;
        window.location.href = "/dashboard";
      } else {
        alert("Login failed: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  });
  