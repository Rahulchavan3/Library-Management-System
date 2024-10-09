    const express = require('express');
    const {signupValidation, loginValidation} = require('../Middlewares/userAuth');
    const { signup, login } = require('../Controllers/user.controller');
    const router = express.Router();

    router.post('/signup',signupValidation,signup);
    router.post('/login',loginValidation,login);

    module.exports = router;