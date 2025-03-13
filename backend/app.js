const express = require("express");
const cookieParser = require("cookie-parser");
require("dotenv").config();

// define the routes
const userRoutes = require("./routes/userAccounts");
const taskRoutes = require("./routes/taskLists");

const app = express();

app.use(express.json());
// get the cookies to use the jwt token
app.use(cookieParser()); 

// add routes to base URLs
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
