const user = require("../models/user");
const flat = require("../models/flat");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const multer = require("multer");

const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({storage});

exports.registerUser = [
  upload.single('profile_picture'),
  async (req, res) => {
    try {
      const {name, email, password, flatCode, phone, aboutMe} = req.body;
      const profile_picture = req.file ? `/uploads/${req.file.filename}` : null;

      // check al values arent empty
      if (!name || !email || !password || !flatCode) {
        return res.status(400).json({message: "All required fields must be filled."});
      }

      // check for existing user
      const existing = await user.getUserByEmail(email);
      if (existing && existing.length > 0) {
        return res.status(400).json({message: "Email is already registered."});
      }

      // check if flat with this invite code exists
      let flatDetails = await flat.getFlatFromInviteCode(flatCode); 

      if (!flatDetails || flatDetails.length === 0) {

        // if not then make new flat with users name
        const flatName = `${name}'s Flat`;
        const [createdFlat] = await flat.createFlat(flatName, flatCode);

        flatDetails = [{id: createdFlat.id}];
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      // create the usder and assign them to exisiting or new flat
      const [newUser] = await user.createUser({
        name,
        email,
        password: hashedPassword,
        flat_id: flatDetails[0].id,
        phone,
        about_me: aboutMe,
        profile_picture
      });


      const token = jwt.sign({
        user_id: newUser.insertId,
        email,
        flat_id: flatDetails[0].id,
        userName: name  
      }, process.env.JWT_SECRET);
      // set cookie
      res.cookie("authToken", token, {
        httpOnly: true,   
        secure: true,     
        sameSite: "Strict", 
        // last for 1 hour
        maxAge: 3600000  
      });
      res.status(201).json({message: "Registration successful."});
    } catch (err) {
      console.error(err);
      res.status(500).json({message: "Server error during registration."});
    }
  }
];


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

    const token = jwt.sign(
      {user_id: username[0].id, email: username[0].email, flat_id: username[0].flat_id, userName: username[0].name},
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

exports.getallUsers = async (req, res) => {
  try {
    const flatId = req.user.flat_id;

    if (!flatId) {
      return res.status(400).json({message: "User is not assigned to a flat"});
    }

    const users = await user.getallUsers(flatId);
    res.json(users);
  } catch (error) {
    console.error("Error fetching users in flat:", error);
    res.status(500).json({message: "Server error"});
  }
};



