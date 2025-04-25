const express = require('express');
const morgan = require('morgan');
const mariadb = require('mariadb');
const bcrypt = require('bcrypt');  // 用于加密密码

const app = express();
const port = 3000;

app.use(morgan('dev'));
app.use(express.json());  // 解析 JSON 数据
app.use(express.urlencoded({ extended: true }));  // 解析表单数据

// MariaDB 数据库连接池
const pool = mariadb.createPool({
  host: 'mariadb_2425-cs7025-group6',      
  user: '2425-cs7025-group6',
  password: 'Q4tWR3b8vT9FmhdZ',
  database: '2425-cs7025-group6_db',
  connectionLimit: 5
});

// 📌 注册 API：存储 flat_code, email, password
app.post('/register', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        
        const { flatCode, email, password } = req.body;

        // 检查 email 是否已存在
        const existingUser = await conn.query("SELECT id FROM users WHERE email = ?", [email]);
        if (existingUser.length > 0) {
            return res.json({ message: "Email already registered!" });
        }

        // 加密密码（防止明文存储）
        const hashedPassword = await bcrypt.hash(password, 10);

        // 插入用户数据
        await conn.query("INSERT INTO users (flat_code, email, password) VALUES (?, ?, ?)", 
                         [flatCode, email, hashedPassword]);

        res.json({ message: "Registration successful!" });

    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ message: "Database error" });
    } finally {
        if (conn) conn.release();
    }
});

// 启动服务器
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
