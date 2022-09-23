const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// @desc Login
// @route POST /auth
// @access Public
const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ msg: "username and password required" });

  const user = await User.findOne({ username }).exec();

  if (!user || !user.active)
    return res
      .status(401)
      .json({ msg: "This user is not active or not authorized" });

  const match = await bcrypt.compare(password, user.password);

  if (!match) return res.status(401).json({ msg: "Wrong Password" });

  const accessToken = jwt.sign(
    {
      UserInfo: { username, roles: user.roles },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { username },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("jwt", refreshToken, {
    httpOnly: true, // only accessable by web server
    // secure: true, // https
    SameSite: "None", // cross site cookie because we host the client on server and api on another server
    maxAge: 7 * 24 * 60 * 60 * 1000, // mush match the refresh token
  });

  res.json({ accessToken });
};

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
const refresh = async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.jwt)
    return res.status(401).json({
      msg: "There is no cookies contain jwt access token (Not authorized)",
    });

  const refreshToken = cookie.jwt;

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err)
        return res
          .status(403)
          .json({ message: "The Refresh Token has expired (Forbidden)" });

      const foundUser = await User.findOne({
        username: decoded.username,
      }).exec();
      if (!foundUser) return res.status(401).json({ msg: "Unauthorized" });

      const accessToken = jwt.sign(
        {
          UserInfo: { username: foundUser.username, roles: foundUser.roles },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      res.json({ accessToken });
    }
  );
};

// @desc Logout
// @route POST /auth/logout
// @access Public - just to clear cookie if exists
const logout = async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.jwt) return res.sendStatus(204); // No content

  res.clearCookie("jwt", {
    httpOnly: true,
    // sameSite: "None",
    // secure: true
  });
  res.json({ msg: "Cookie cleared" });
};

module.exports = { login, refresh, logout };
