const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// register user
exports.registerUser = async (req, res) => {
  try {
    // get the name email and password from the post request body
    let {name, email, password} = req.body;

    // if user exists send an error back saying it is registered
    const [existingUser] = await db.query("SELECT email FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Email already registered"});
    }

    // encrypt the password
    const encryptPassword = await bcrypt.hash(password, 10);

    // query to insert user details
    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    // add the values into the query and then use it
    await db.query(sql, [name, email, encryptPassword]);
    // sebd a message back 
    res.status(201).json({message: "Test user registered successfully", name, email});
  } catch (error) {
    console.error(error);
    // if something wrong send error back
    res.status(500).json({error: "Error please try again"});
  }
};

exports.loginUser = async (req, res) => {
  try {
    // get email and password from post body
    const {email, password} = req.body;

    if (!email || !password) {
      return res.status(400).json({error: "Email and password are required"});
    }

    // check to see if email is registered
    const [user] = await db.query("SELECT * FROM users WHERE email = ?", email);
    if (user.length === 0) {
      // if not send an error
      return res.status(401).json({error: "Invalid email or password"});
    }

    // check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user[0].password);

    if (!isPasswordValid) {
      // if not then return an error
      return res.status(401).json({error: "Invalid email or password"});
    }

    // generate jwt token for login
    console.log(user[0])
    const token = jwt.sign(
      {user_id: user[0].id, email: user[0].email},
      process.env.JWT_SECRET
    );

    // store the token as a cookie
    res.cookie("authToken", token, {
      httpOnly: true,   
      secure: true,     
      sameSite: "Strict", 
      // last for 1 hour
      maxAge: 3600000  
    });

    // send successful response back with jwt token
    res.json({message: "Login successful", token});
  } catch (error) {
    console.error(error);
    res.status(500).json({error: "Login error"});
  }
};
