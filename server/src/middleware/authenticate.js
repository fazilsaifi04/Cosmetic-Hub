const jwtProvider = require("../config/jwtProvider");
const userService = require("../services/user.service");

const authenticate = async (req, res, next) => {
  try {
    // Extract the token from the Authorization header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(404).send({ error: "Token not found." });
    }

    // Decode the userId from the token
    let userId;
    try {
      userId = jwtProvider.getUserIdFromToken(token);
    } catch (error) {
      return res.status(401).send({ error: "Invalid or expired token." });
    }

    // Fetch the user from the database
    const user = await userService.findUserById(userId);

    if (!user) {
      return res.status(404).send({ error: "User not found." });
    }

    // Attach the user to the request
    req.user = user;

    // Proceed to the next middleware or controller
    next();
  } catch (error) {
    return res.status(500).send({ error: `Authentication error: ${error.message}` });
  }
};

module.exports = authenticate;
