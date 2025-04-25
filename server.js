console.log("✅ This is the 2.0 version of server.js");

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use('/cs7026', express.static('/home/ubuntu/cs7026'));


// MySQL connection
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "lishufeng.",
    database: "task_management",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  


// Multer storage for profile picture upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads");
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'image/bmp',
      'image/heic' // ✅ 支持 HEIC
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      console.error("❌ Rejected file type:", file.mimetype);
      cb(new Error("Only image files (JPG, PNG, WEBP, GIF, SVG, HEIC) are allowed"), false);
    }
  }
});

// ===================
// 📌 API Routes
// ===================

// 👉 Registration with file upload
app.post("/register", upload.single("profile_picture"), (req, res) => {
    const {
        name,
        email,
        password,
        phone,
        flatCode,
        aboutMe
    } = req.body;

    const profile_picture = req.file ? `/uploads/${req.file.filename}` : null;

    const sql = `
        INSERT INTO Users (name, email, password, phone, flat_code, about_me, profile_picture)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [name, email, password, phone, flatCode, aboutMe, profile_picture], (err, result) => {
        if (err) {
            console.error("❌ Registration failed:", err);
            return res.status(500).json({ message: "Registration failed. Try a different email?" });
        }
        console.log("✅ Registered new user:", email);
        res.json({ message: "Registration successful!" });
    });
});

// 👉 Login
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM Users WHERE email = ? AND password = ?";
    db.query(sql, [email, password], (err, results) => {
        if (err) {
            console.error("❌ Login query failed:", err);
            return res.status(500).json({ success: false, message: "Server error" });
        }

        if (results.length > 0) {
            console.log("✅ Login successful:", email);
            const user = results[0];
            res.json({
                success: true,
                message: "Login successful",
                user: {
                    id: user.id,
                    email: user.email,
                    flat_code: user.flat_code,
                    name: user.name,
                    profile_picture: user.profile_picture
                }
            });
        } else {
            res.json({ success: false, message: "Invalid email or password" });
        }
    });
});

// 👉 Get tasks assigned to user
app.get("/api/tasks/:userId", (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT 
      Tasks.id AS task_id,
      Tasks.name,
      Tasks.due_date,
      Progress_Tasks.id AS progress_task_id,
      Progress_Tasks.status_id
    FROM Progress_Tasks
    JOIN Tasks ON Progress_Tasks.task_id = Tasks.id
    WHERE Progress_Tasks.user_id = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("❌ Failed to fetch tasks:", err);
      return res.status(500).json({ message: "Failed to fetch tasks" });
    }
    res.json(results);
  });
});


// 👉 Add new task
app.post("/tasks", (req, res) => {
  const {
    name,
    description,
    due_date,
    repeat_frequency,
    area_id,
    creator_id,
    assigned_to_id
  } = req.body;

  if (!name || !creator_id) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const sql = `
    INSERT INTO Tasks 
    (name, description, due_date, repeat_frequency, area_id, creator_id, assigned_to_id) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [name, description, due_date, repeat_frequency, area_id, creator_id, assigned_to_id || null], (err, result) => {
    if (err) {
      console.error("❌ Failed to add task:", err);
      return res.status(500).json({ message: "Failed to add task" });
    }

    const taskId = result.insertId;

    // 👉 插入 Progress_Tasks（初始状态为未完成 status_id = 1）
    if (assigned_to_id) {
      const progressSql = `
        INSERT INTO Progress_Tasks (task_id, user_id, status_id)
        VALUES (?, ?, 1)
      `;
      db.query(progressSql, [taskId, assigned_to_id], (err2, result2) => {
        if (err2) {
          console.error("⚠️ Failed to insert into Progress_Tasks:", err2);
          return res.status(500).json({ message: "Task added but progress tracking failed" });
        }

        console.log("✅ Task and Progress_Tasks created");
        res.status(201).json({ message: "Task and progress created" });
      });
    } else {
      console.log("✅ Task created (unassigned)");
      res.status(201).json({ message: "Task created without assignment" });
    }
  });
});

app.post("/api/progress-tasks/status/:id", (req, res) => {
  const progressTaskId = req.params.id;
  const { status_id } = req.body;

  const sql = `
    UPDATE Progress_Tasks 
    SET 
      status_id = ?, 
      completion_date = CURDATE(), 
      completion_time = CURTIME()
    WHERE id = ?
  `;

  db.query(sql, [status_id, progressTaskId], (err, result) => {
    if (err) {
      console.error("❌ Failed to update task:", err);
      return res.status(500).json({ message: "Failed to update task status" });
    }
    res.json({ message: "✅ Task completed and time recorded." });
  });
});

// 👉 Get all users (for assigning tasks)
app.get("/users", (req, res) => {
    const sql = "SELECT id, name FROM Users";

    db.query(sql, (err, results) => {
        if (err) {
            console.error("❌ Failed to get users:", err);
            return res.status(500).json({ message: "Error fetching users" });
        }
        res.json(results); // 返回用户 ID 和名字
    });
});
// 👉 Get all areas
app.get("/areas", (req, res) => {
    const sql = "SELECT id, name FROM Area";
  
    db.query(sql, (err, results) => {
      if (err) {
        console.error("❌ Failed to get areas:", err);
        return res.status(500).json({ message: "Error fetching areas" });
      }
      res.json(results);
    });
  });
  
  // 👉 Get all task frequencies
  app.get("/frequencies", (req, res) => {
    const sql = "SELECT id, frequency FROM Task_Frequency";
  
    db.query(sql, (err, results) => {
      if (err) {
        console.error("❌ Failed to get frequencies:", err);
        return res.status(500).json({ message: "Error fetching frequencies" });
      }
      res.json(results);
    });
  });
  

  app.post("/tasks/update", (req, res) => {
    const {
      id,
      name,
      description,
      due_date,
      repeat_frequency,
      area_id,
      assigned_to_id
    } = req.body;
  
    const sql = `
      UPDATE Tasks SET
        name = ?,
        description = ?,
        due_date = ?,
        repeat_frequency = ?,
        area_id = ?,
        assigned_to_id = ?
      WHERE id = ?
    `;
  
    db.query(sql, [name, description, due_date, repeat_frequency, area_id, assigned_to_id || null, id], (err, result) => {
      if (err) {
        console.error("❌ Failed to update task:", err);
        return res.status(500).json({ message: "Update failed" });
      }
      res.json({ message: "Task updated!" });
    });
  });
  // 👉 Get a single task by ID (for editing)
app.get("/task/:id", (req, res) => {
    const taskId = req.params.id;
    const sql = "SELECT * FROM Tasks WHERE id = ?";
    db.query(sql, [taskId], (err, results) => {
      if (err) {
        console.error("❌ Failed to fetch task:", err);
        return res.status(500).json({ message: "Error fetching task" });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(results[0]);
    });
  });

  // 👉 Delete a task by ID
app.delete("/tasks/delete/:id", (req, res) => {
    const taskId = req.params.id;
    const sql = "DELETE FROM Tasks WHERE id = ?";
    db.query(sql, [taskId], (err, result) => {
      if (err) {
        console.error("❌ Failed to delete task:", err);
        return res.status(500).json({ message: "Failed to delete task" });
      }
      res.json({ message: "Task deleted successfully" });
    });
  });

// 👉 Get a user's profile info and average score
app.get("/api/user-profile/:userId", (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT 
      u.name, u.phone, u.about_me, u.profile_picture,
      ROUND(AVG(r.score), 1) AS average_score
    FROM Users u
    LEFT JOIN Ratings r ON r.rated_user_id = u.id
    WHERE u.id = ?
    GROUP BY u.id
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("❌ Failed to fetch user profile:", err);
      return res.status(500).json({ message: "Error fetching profile" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(results[0]);
  });
});
// 👉 Get all flatmates with average ratings
app.get("/api/flatmates", (req, res) => {
  const sql = `
    SELECT u.id, u.name, u.profile_picture, ROUND(AVG(r.score), 1) AS average_score
    FROM Users u
    LEFT JOIN Ratings r ON r.rated_user_id = u.id
    GROUP BY u.id
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Failed to fetch flatmates:", err);
      return res.status(500).json({ message: "Error fetching flatmates" });
    }
    res.json(results);
  });
});

// 👉 Get all tasks with assigned user and frequency
app.get("/api/flat-tasks", (req, res) => {
  const sql = `
    SELECT t.id, t.name AS task_name, tf.frequency, u.id AS user_id, u.name AS user_name, u.profile_picture
    FROM Tasks t
    LEFT JOIN Task_Frequency tf ON t.repeat_frequency = tf.id
    LEFT JOIN Users u ON t.assigned_to_id = u.id
    ORDER BY t.id DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Failed to fetch tasks:", err);
      return res.status(500).json({ message: "Error fetching tasks" });
    }
    res.json(results);
  });
});

  
// 👉 Get all house activity
app.get("/house-activity", (req, res) => {
  const sql = `
    SELECT 
      Tasks.name AS task_name,
      Users.name,
      Users.profile_picture,
      Status.name AS status,
      Progress_Tasks.completion_date,
      Task_Photos.photo_url,
      Ratings.score
    FROM Progress_Tasks
    JOIN Tasks ON Progress_Tasks.task_id = Tasks.id
    JOIN Users ON Progress_Tasks.user_id = Users.id
    JOIN Status ON Progress_Tasks.status_id = Status.id
    LEFT JOIN Task_Photos ON Task_Photos.progress_task_id = Progress_Tasks.id
    LEFT JOIN Ratings ON Ratings.progress_task_id = Progress_Tasks.id
    ORDER BY Progress_Tasks.completion_date DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Failed to fetch house activity:", err);
      return res.status(500).json({ message: "Error fetching activity" });
    }
    res.json(results);
  });
});

app.get("/api/user-profile/:id", (req, res) => {
  const userId = req.params.id;

  const sql = `
    SELECT 
      u.id, u.name, u.phone, u.about_me, u.profile_picture,
      ROUND(AVG(r.score), 2) AS average_score
    FROM Users u
    LEFT JOIN Ratings r ON u.id = r.rated_user_id
    WHERE u.id = ?
    GROUP BY u.id
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("❌ Failed to get user profile:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(results[0]);
  });
});
app.post("/api/user-profile/:id", (req, res) => {
  const userId = req.params.id;
  const { phone, about_me } = req.body;

  const sql = `UPDATE Users SET phone = ?, about_me = ? WHERE id = ?`;

  db.query(sql, [phone, about_me, userId], (err, result) => {
    if (err) {
      console.error("❌ Failed to update profile:", err);
      return res.status(500).json({ message: "Server error" });
    }

    res.json({ message: "Profile updated successfully" });
  });
});
app.post("/api/user-profile/upload/:id", upload.single("avatar"), (req, res) => {
  const userId = req.params.id;

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const profile_picture = `/uploads/${req.file.filename}`;

  const sql = `UPDATE Users SET profile_picture = ? WHERE id = ?`;

  db.query(sql, [profile_picture, userId], (err, result) => {
    if (err) {
      console.error("❌ Failed to update avatar:", err);
      return res.status(500).json({ message: "Failed to update avatar" });
    }

    res.json({ message: "Avatar updated", profile_picture });
  });
});
app.get("/api/tasks/details/:id", (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  const userId = parseInt(req.query.user, 10);

  if (isNaN(taskId) || isNaN(userId)) {
    return res.status(400).json({ message: "Invalid task or user ID" });
  }

  console.log("🔍 Task detail request", { taskId, userId });

  const sql = `
    SELECT 
      t.id, t.name, t.description, t.due_date,
      u1.name AS assigned_to_name,
      u1.profile_picture AS assigned_to_avatar,
      u2.name AS current_user_name,
      pt.status_id, s.name AS status_name,
      pt.id AS progress_task_id
    FROM Tasks t
    JOIN Users u1 ON t.assigned_to_id = u1.id
    JOIN Users u2 ON u2.id = ?
    LEFT JOIN Progress_Tasks pt ON pt.task_id = t.id AND pt.user_id = ?
    LEFT JOIN Status s ON pt.status_id = s.id
    WHERE t.id = ?
  `;

  db.query(sql, [userId, userId, taskId], (err, results) => {
    if (err) {
      console.error("❌ Failed to get task detail:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    console.log("✅ Task detail result:", results[0]);
    res.json(results[0]);
  });
});
app.get("/api/task-photos/:taskId", (req, res) => {
  const taskId = req.params.taskId;

  const sql = `
    SELECT tp.photo_url AS image_url, tp.description
    FROM Task_Photos tp
    JOIN Progress_Tasks pt ON pt.id = tp.progress_task_id
    WHERE pt.task_id = ?
  `;

  db.query(sql, [taskId], (err, results) => {
    if (err) {
      console.error("❌ Failed to fetch task photos:", err);
      return res.status(500).json({ message: "Server error" });
    }

    res.json(results);
  });
});
app.post("/api/task-photos/upload/:taskId", upload.single("photo"), (req, res) => {
  const taskId = req.params.taskId;
  const { user_id } = req.body;
  const photo_url = "/uploads/" + req.file.filename;

  const findProgressId = `
    SELECT id FROM Progress_Tasks WHERE task_id = ? AND user_id = ?
  `;
  db.query(findProgressId, [taskId, user_id], (err, results) => {
    if (err || results.length === 0) {
      console.error("❌ No progress task found:", err);
      return res.status(404).json({ message: "No progress found" });
    }

    const progress_task_id = results[0].id;

    const insertSql = `
      INSERT INTO Task_Photos (progress_task_id, photo_url)
      VALUES (?, ?)
    `;

    db.query(insertSql, [progress_task_id, photo_url], (err2) => {
      if (err2) {
        console.error("❌ Failed to insert photo:", err2);
        return res.status(500).json({ message: "Insert failed" });
      }

      res.json({ message: "✅ Photo uploaded", photo_url });
    });
  });
});
app.post("/api/task-photos/comment/:taskId", (req, res) => {
  const taskId = req.params.taskId;
  const { user_id, comment } = req.body;

  const findProgressId = `
    SELECT id FROM Progress_Tasks WHERE task_id = ? AND user_id = ?
  `;
  db.query(findProgressId, [taskId, user_id], (err, results) => {
    if (err || results.length === 0) {
      console.error("❌ No progress task found:", err);
      return res.status(404).json({ message: "No progress found" });
    }

    const progress_task_id = results[0].id;

    const updateSql = `
      UPDATE Progress_Tasks
      SET comment = ?
      WHERE id = ?
    `;

    db.query(updateSql, [comment, progress_task_id], (err2) => {
      if (err2) {
        console.error("❌ Failed to update comment:", err2);
        return res.status(500).json({ message: "Update failed" });
      }

      res.json({ message: "✅ Comment updated" });
    });
  });
});


app.post("/api/task-photos/upload", upload.array("photos"), (req, res) => {
  console.log("🔥 Upload triggered");
  console.log("📥 Body:", req.body);
  console.log("📸 Files:", req.files);

  const { task_id, progress_task_id } = req.body;

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No files uploaded" });
  }

  const photoValues = req.files.map(file => [progress_task_id, `/uploads/${file.filename}`]);

  const sql = "INSERT INTO Task_Photos (progress_task_id, photo_url) VALUES ?";
  db.query(sql, [photoValues], (err, result) => {
    if (err) {
      console.error("❌ Failed to insert photos:", err);
      return res.status(500).json({ message: "Upload failed" });
    }

    res.json({ message: "Photos uploaded successfully", count: result.affectedRows });
  });
});
app.get("/api/progress-task-photos/:progressId", (req, res) => {
  const progressId = Number(req.params.progressId); // 保证是数字

  const sql = `
    SELECT id, photo_url, description 
    FROM Task_Photos 
    WHERE progress_task_id = ? 
    ORDER BY id ASC
  `;

  db.query(sql, [progressId], (err, results) => {
    if (err) {
      console.error("❌ SQL 查询出错:", err);
      return res.status(500).json({ message: "Server error", error: err });
    }

    res.json(results);
  });
});


// 更新某张图片的评论
app.post("/api/progress-task-photos/comment/:photoId", (req, res) => {
  const photoId = req.params.photoId;
  const { description } = req.body;

  const sql = "UPDATE Task_Photos SET description = ? WHERE id = ?";
  db.query(sql, [description, photoId], (err, result) => {
    if (err) return res.status(500).json({ message: "Update failed" });
    res.json({ message: "Comment saved" });
  });
});
app.get("/api/task-exchange/:taskId", (req, res) => {
  const taskId = req.params.taskId;
  const sql = `
    SELECT 
      t.id, t.name, t.due_date,
      u.name AS assigned_name,
      u.profile_picture
    FROM Tasks t
    LEFT JOIN Users u ON t.assigned_to_id = u.id
    WHERE t.id = ?
  `;
  db.query(sql, [taskId], (err, results) => {
    if (err) {
      console.error("❌ Failed to fetch task exchange info:", err);
      return res.status(500).json({ message: "Error fetching task info" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(results[0]);
  });
});
app.post("/api/task-exchange/:taskId", (req, res) => {
  const taskId = req.params.taskId;
  const { assigned_to_id } = req.body;

  const sql = `UPDATE Tasks SET assigned_to_id = ? WHERE id = ?`;
  db.query(sql, [assigned_to_id, taskId], (err, result) => {
    if (err) {
      console.error("❌ Failed to update assignee:", err);
      return res.status(500).json({ message: "Failed to update assignee" });
    }
    res.json({ message: "✅ Task assignee updated" });
  });
});
app.get("/users", (req, res) => {
  const sql = "SELECT id, name FROM Users";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Failed to get users:", err);
      return res.status(500).json({ message: "Error fetching users" });
    }
    res.json(results);
  });
});

app.get("/api/all-task-photos", (req, res) => {
  const sql = `
    SELECT 
      tp.id AS photo_id,
      tp.photo_url,
      pt.completion_date,
      pt.completion_time,
      t.name AS task_name,
      u.name AS user_name,
      u.profile_picture,
      s.name AS status,
      (
        SELECT AVG(score) FROM Ratings r
        WHERE r.progress_task_id = pt.id
      ) AS score
    FROM (
      SELECT MIN(id) AS id
      FROM Task_Photos
      GROUP BY progress_task_id
    ) AS first_photos
    JOIN Task_Photos tp ON tp.id = first_photos.id
    JOIN Progress_Tasks pt ON tp.progress_task_id = pt.id
    JOIN Tasks t ON pt.task_id = t.id
    JOIN Users u ON pt.user_id = u.id
    JOIN Status s ON pt.status_id = s.id
    ORDER BY pt.completion_date DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Failed to fetch task photos:", err);
      return res.status(500).json({ message: "Server error" });
    }

    res.json(results);
  });
});

app.get("/api/task-detail/:photoId", (req, res) => {
  const photoId = req.params.photoId;

  const sql = `
    SELECT 
      tp2.id AS image_id,
      tp2.photo_url,
      tp2.description AS photo_description,
      pt.id AS progress_task_id,
      pt.completion_date,
      pt.completion_time,
      t.name AS task_name,
      t.description AS task_description,
      t.due_date,
      s.name AS status,
      u.name AS assigned_to_name,
      u.profile_picture AS assigned_to_avatar
    FROM Task_Photos tp
    JOIN Progress_Tasks pt ON tp.progress_task_id = pt.id
    JOIN Tasks t ON pt.task_id = t.id
    JOIN Status s ON pt.status_id = s.id
    JOIN Users u ON t.assigned_to_id = u.id
    JOIN Task_Photos tp2 ON tp2.progress_task_id = pt.id
    WHERE tp.id = ?
  `;

  db.query(sql, [photoId], (err, results) => {
    if (err) {
      console.error("❌ Error fetching task detail:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }

    // 拿第一条做主信息
    const base = results[0];
    const images = results.map(row => ({
      id: row.image_id,
      url: row.photo_url,
      description: row.photo_description
    }));

    const response = {
      task_name: base.task_name,
      task_description: base.task_description,
      due_date: base.due_date,
      completion_date: base.completion_date,
      completion_time: base.completion_time,
      status: base.status,
      assigned_to_name: base.assigned_to_name,
      assigned_to_avatar: base.assigned_to_avatar,
      images
    };

    res.json(response);
  });
});

app.post("/api/add-comment", (req, res) => {
  const { photoId, userId, comment } = req.body;

  const getProgressIdSQL = "SELECT progress_task_id FROM Task_Photos WHERE id = ?";
  db.query(getProgressIdSQL, [photoId], (err, result) => {
    if (err || result.length === 0) {
      console.error("❌ Cannot find progress_task_id:", err);
      return res.status(500).json({ message: "Task not found" });
    }

    const progressTaskId = result[0].progress_task_id;
    const insertSQL = `
      INSERT INTO Ratings (progress_task_id, rater_id, comment, rating_date)
      VALUES (?, ?, ?, NOW())
    `;
    db.query(insertSQL, [progressTaskId, userId, comment], (err, result) => {
      if (err) {
        console.error("❌ Failed to insert comment:", err);
        return res.status(500).json({ message: "Insert failed" });
      }
      res.json({ message: "Comment added" });
    });
  });
});

app.get("/api/comments/:photoId", (req, res) => {
  const photoId = req.params.photoId;
  const sql = `
    SELECT r.comment, r.rating_date, u.name AS rater_name, u.profile_picture
    FROM Ratings r
    JOIN Users u ON r.rater_id = u.id
    WHERE r.progress_task_id = (
      SELECT progress_task_id FROM Task_Photos WHERE id = ?
    )
    ORDER BY r.rating_date DESC
  `;

  db.query(sql, [photoId], (err, results) => {
    if (err) {
      console.error("❌ Failed to fetch comments:", err);
      return res.status(500).json({ message: "Server error" });
    }
    res.json(results);
  });
});

// ===================
// ✅ Start the server
// ===================
app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
});