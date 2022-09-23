const User = require("../models/User");
const Note = require("../models/Note");
const bcrypt = require("bcrypt");

//@desc Get all users
//@route GET /users
// @access Private
const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password").lean();
  if (!users?.length) {
    return res.status(400).json({ msg: "No users found" });
  }

  res.json(users);
};

//@desc Create new user
//@route POST /users
//@access Private
const createNewuser = async (req, res) => {
  const { username, password, roles } = req.body;

  //Confirm data
  if (!username || !password) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  //   Check for duplicate
  const duplicate = await User.findOne({ username })
    .collation({ locale: "en", strength: 2 }) // check for case sensitive data (lower case or upper case)
    .lean()
    .exec();
  if (duplicate) {
    return res.status(409).json({ msg: "Duplicate username" }); // 409 conflict
  }

  //Hash password
  const hashPwd = await bcrypt.hash(password, 10);

  const userObj =
    !Array.isArray(roles) || !roles?.length
      ? { username, password: hashPwd }
      : { username, password: hashPwd, roles };

  //Create and store new user
  const user = await User.create(userObj);

  if (user) {
    res.status(201).json({ msg: `New user ${username} created` });
  } else {
    res.status(400).json({ msg: "Invalid user data received" });
  }
};

//@desc Update a user
//@route PATCH /users
//@access Private
const updateuser = async (req, res) => {
  const { id, username, roles, active, password } = req.body;

  //Confirm data
  if (
    !id ||
    !username ||
    !roles?.length ||
    !Array.isArray(roles) ||
    typeof active !== "boolean"
  ) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ msg: "User not found" });
  }

  //Check for duplicate
  const duplicate = await User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  // Allow updates to the original user
  if (duplicate && duplicate._id.toString() !== id) {
    return res.status(409).json({ msg: "Duplicate username" });
  }

  user.username = username;
  user.roles = roles;
  user.active = active;

  if (password) {
    // Hash password
    user.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = await user.save();

  res.json({ msg: `${updatedUser.username} updated` });
};

//@desc delete a user
//@route DELETE /users
//@access Private
const deleteuser = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ msg: "User ID Required" });
  }

  const note = await Note.findOne({ user: id }).lean().exec();

  if (note) {
    return res.status(400).json({ msg: "User has assigned notes " });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ msg: "User not found " });
  }

  const result = await user.deleteOne();

  const reply = `Username ${result.username} with Id ${result._id} deleted`;

  res.json({ msg: reply });
};

module.exports = { getAllUsers, createNewuser, updateuser, deleteuser };
