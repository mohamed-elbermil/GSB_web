const jwt = require('jsonwebtoken');
const User = require('../models/user_model');
const sha256 = require('js-sha256')
// Login method that will check if the user exists and if the password is correct returns a token
const login = async (req, res) => {
    const { email, password } = req.body
    
    const user = await User.findOne({ email })
    if (!user) {
       return res.status(401).json({ message: 'Invalid email or password 1' })
    }
    if (user.password !== sha256(password + process.env.SALT)) {
       return res.status(401).json({ message: 'Invalid email or password' })
    }
    const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' })
    res.status(200).json({ token })
}

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    console.log("--- Tentative de vérification du Token ---");
    
    if (!req.headers.authorization) {
        return res.status(401).json({ message: 'No token provided' })
    }
    const token = req.headers.authorization.split(' ')[1]
    if (!token) {
        return res.status(401).json({ message: 'No token provided' })
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' })
        }
        req.user = decoded
        next()
    })
}

module.exports = { login, verifyToken }