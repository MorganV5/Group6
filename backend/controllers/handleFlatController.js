const flat = require("../models/flat");
const user = require("../models/user");
const jwt = require("jsonwebtoken");

exports.createFlat = async (req, res) => {
  try {
    const {name, invite_code} = req.body;
    const userId = req.user.user_id;

    // make the new flat
    await flat.createFlat({name, invite_code});

    // get the new flat information
    const [newFlat] = await flat.getFlatFromInviteCode(invite_code);
    const flatId = newFlat.id;
    
    // assign this user to the flat they just made
    await user.assignUserToFlat(userId, flatId);

    // had to make the jwt token again or it cant find their flat because it was null
    const token = jwt.sign(
      {user_id: userId, email: req.user.email, flat_id: flatId},
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

    res.status(201).json({message: "Flat created"});
  } catch (error) {
    console.error(error);
    res.status(500).json({error: "Unable to create flat"});
  }


};

exports.getFlatByInviteCode = async (req, res) => {
  try {
    const {code} = req.params;
    const flatInfo = await flat.getFlatFromInviteCode(code);
    const userId = req.user.user_id;
    const flatId = flatInfo[0].id;

    await user.assignUserToFlat(userId, flatId);
    console.log(userId)
    // had to make the jwt token again incase they changed flat because it will be outdated
    const token = jwt.sign(
      {user_id: userId, email: req.user.email, flat_id: flatId},
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

    res.json(flatInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({error: "Unable to retrieve flat"});
  }
};
