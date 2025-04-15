const user = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// register user
exports.registerUser = async (req, res) => {
  try {
    // get the name email and password from the post request body
    let {name, email, password} = req.body;

    // just for testing
    if (!name || !email || !password) {
      name = "Test User";
      email = "testuser@example.com";
      password = "testpassword123";
    }

    // if user exists send an error back saying it is registered
    const existingUser = await user.getUserByEmail(email);
    if (existingUser.length > 0) {
      return res.status(400).json({error: "Email already registered"});
    }

    // encrypt the password
    const encryptedPassword = await bcrypt.hash(password, 10);

    // query to insert user details
    await user.createUser({name, email, password: encryptedPassword});

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
    const username = await user.getUserByEmail(email);
    if (username.length === 0) {
      // if not send an error
      return res.status(401).json({error: "Invalid email or password"});
    }

    // check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, username[0].password);

    if (!isPasswordValid) {
      // if not then return an error
      return res.status(401).json({error: "Invalid email or password"});
    }

    // generate jwt token for login
    console.log(username[0])
    const token = jwt.sign(
      {user_id: username[0].id, email: username[0].email, flat_id: username[0].flat_id},
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
