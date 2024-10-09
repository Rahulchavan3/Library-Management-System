const joi = require('joi');

const signupValidation = (req, res, next) => {
    const schema = joi.object({
        username: joi.string().min(3).max(100).required(),
        email: joi.string().email().required(),
        password: joi.string().min(4).max(20).required(),
        role: joi.string().valid('LIBRARIAN', 'MEMBER').required()
    });
    
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: "Internal server error", error: error.details[0].message });
    }
    next();
};

const loginValidation = (req, res, next) => {
    const schema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().min(4).max(20).required()
    });
    
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: "Internal server error", error: error.details[0].message });
    }
    next();
};

module.exports = { signupValidation, loginValidation };
