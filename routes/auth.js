const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');

// Get signup page
router.get('/signup', (req, res) => {
    if (req.isAuthenticated()) return res.redirect('/');
    res.render('signup', { user: req.user, error: null });
});

// Local signup
router.post('/signup', async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.render('signup', { error: 'User already exists', user: req.user });
        
        user = await User.create({ name, email, password });
        req.login(user, err => {
            if (err) return next(err);
            res.redirect('/');
        });
    } catch (err) {
        console.error("Signup Error:", err);
        res.render('signup', { error: 'Error creating account: ' + err.message, user: req.user });
    }
});

// Get login page
router.get('/login', (req, res) => {
    if (req.isAuthenticated()) return res.redirect('/');
    res.render('login', { user: req.user, error: null });
});

// Local login
router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: false // Add flash messages later if needed
}));

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/auth/login' }), (req, res) => {
    res.redirect('/');
});

// Logout
router.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

module.exports = router;
