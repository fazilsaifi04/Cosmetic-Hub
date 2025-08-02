const userService = require("../services/user.service.js");
const jwtProvider = require("../config/jwtProvider.js");
const bcrypt = require("bcrypt");
const cartService = require("../services/cart.service.js"); 

const register = async (req, res) => {
    try {
        const user = await userService.createUser(req.body); 
        const jwt = jwtProvider.generateToken(user._id); 

        await cartService.createCart(user); 

        return res.status(200).send({
            jwt,
            message: "Registration successful",
            user: { id: user._id, email: user.email, name: user.name }, 
        });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};

const login = async (req, res) => {
    const { password, email } = req.body;

    try {
      
        const user = await userService.getUserByEmail(email);

        if (!user) {
            return res.status(404).send({ message: `User not found with email: ${email}` }); // Fixed email interpolation
        }

        const isPasswordValid = await bcrypt.compare(password, user.password); // Fixed typo and reversed logic
        if (!isPasswordValid) {
            return res.status(401).send({ message: "Invalid Password..." }); // Invalid password
        }

        // Generate JWT and return success response
        const jwt = jwtProvider.generateToken(user._id);
        return res.status(200).send({
            jwt,
            message: "Login successful",
            user: { id: user._id, email: user.email, name: user.name }, // Return user data
        });
    } catch (error) {
        return res.status(500).send({ error: error.message }); // Catch and send error
    }
};

module.exports = { register, login };
