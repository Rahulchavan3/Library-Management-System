const axios = require('axios');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const dbUrl = process.env.DB_URL;

const signup = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

 
        const existingUsersResponse = await axios.get(`${dbUrl}/users`);
        const userExists = existingUsersResponse.data.find(user => user.email === email);
        
        if (userExists) {
            return res.status(409).json({ message: 'User Already Exists, please login', success: false });
        }

        const newUser = {
            username,
            email,
            password: await bcrypt.hash(password, 10), 
            role,
            isDeleted: false
        };

        
        await axios.post(`${dbUrl}/users`, newUser);
        res.status(200).json({ message: "SignUp successful", success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server Error' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

    
        const existingUsersResponse = await axios.get(`${dbUrl}/users`);
        const user = existingUsersResponse.data.find(user => user.email === email);

        const errorMsg = "Invalid email or password";
        if (!user) {
            return res.status(403).json({ message: errorMsg, success: false });
        }

        const isPassEqual = await bcrypt.compare(password, user.password);
        if (!isPassEqual) {
            return res.status(403).json({ message: errorMsg, success: false });
        }

        const jwtToken = jwt.sign(
            { email: user.email, id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: "Login successful",
            success: true,
            jwtToken,
            username: user.username,
            email,
            role: user.role 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server Error' });
    }
};

module.exports = {
    signup,
    login,
};
