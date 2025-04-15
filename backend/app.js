const express = require("express");
const cookieParser = require("cookie-parser");
require("dotenv").config();

// define the routes
const userRoutes = require("./routes/userAccounts");
const taskRoutes = require("./routes/taskLists");
const flatRoutes = require("./routes/flat");
const roomRoutes = require("./routes/room");
const progressTaskRoutes = require("./routes/progressTasks");

const app = express();

app.use(express.json());
// get the cookies to use the jwt token
app.use(cookieParser()); 

// add routes to base URLs
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/flats", flatRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/progress", progressTaskRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
