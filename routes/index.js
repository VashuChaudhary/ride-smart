const express = require('express');
const router = express.Router();
const Ride = require('../models/Ride');
const Search = require('../models/Search');

const ensureAuth = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.redirect('/auth/login');
};

router.get('/', ensureAuth, async (req, res) => {
    const recentSearches = await Search.find({ user: req.user._id }).sort({ updatedAt: -1 }).limit(5);
    const recentRides = await Ride.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(3);
    res.render('home', { user: req.user, recentSearches, recentRides });
});



router.get('/booking', ensureAuth, async (req, res) => {
    res.render('booking', { user: req.user, googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY });
});

router.post('/api/search', ensureAuth, async (req, res) => {
    try {
        const { fromAddress, toAddress } = req.body;
        if (!fromAddress || !toAddress) return res.json({ success: false });

        // Use findOneAndUpdate with upsert to move duplicates to the top instead of creating new ones
        await Search.findOneAndUpdate(
            { user: req.user._id, fromAddress, toAddress },
            { $set: { updatedAt: new Date() } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

router.get('/history', ensureAuth, async (req, res) => {
    const rides = await Ride.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.render('history', { user: req.user, rides });
});

router.get('/profile', ensureAuth, (req, res) => {
    res.render('profile', { user: req.user, error: null, success: null });
});

router.post('/profile/change-password', ensureAuth, async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    if (newPassword !== confirmPassword) {
        return res.render('profile', { user: req.user, error: 'New passwords do not match', success: null });
    }
    
    if (newPassword.length < 6) {
        return res.render('profile', { user: req.user, error: 'Password must be at least 6 characters', success: null });
    }

    try {
        const User = require('../models/User');
        const user = await User.findById(req.user._id);
        
        // If user already has a password, verify the current one
        if (user.password) {
            if (!currentPassword) {
                return res.render('profile', { user: req.user, error: 'Current password is required', success: null });
            }
            const isMatch = await user.matchPassword(currentPassword);
            if (!isMatch) {
                return res.render('profile', { user: req.user, error: 'Incorrect current password', success: null });
            }
        }
        
        // Set new password (the pre-save hook will hash it)
        user.password = newPassword;
        await user.save();
        
        res.render('profile', { user: req.user, error: null, success: 'Password updated successfully!' });
    } catch (err) {
        console.error(err);
        res.render('profile', { user: req.user, error: 'An error occurred', success: null });
    }
});

router.post('/api/book', ensureAuth, async (req, res) => {
    try {
        const ride = await Ride.create({ ...req.body, user: req.user._id });
        res.json({ success: true, ride });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

router.delete('/api/ride/:id', ensureAuth, async (req, res) => {
    try {
        await Ride.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
