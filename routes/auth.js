const passport = require('passport')
const express = require('express')
const router = express.Router()
// Authentication middleware
const isAuthenticated = (req, res, next) => {
    // If user is not authenticated via passport, redirect to login page
    if (!req.isAuthenticated()) {
        return res.redirect('/login')
    }
    // Otherwise, proceed to next middleware function
    return next()
}
// Main page which requires login to access
// Note use of authentication middleware here
router.get('/a', isAuthenticated, (req, res) => {
    console.log("1111111111111111111")
    res.render('patient_dashboard', { title: 'Express', user: req.user.toJSON() })
})
// Login page (with failure message displayed upon login failure)
router.get('/login', (req, res) => {
    console.log("0000000000000000")
    res.render('about_diabetes', { flash: req.flash('error'), title: 'Login' , layout:'main2'})
})
// Handle login
router.post('/login',
    passport.authenticate('local', {
        successRedirect: '/a', failureRedirect: '/login', failureFlash: true
    })
)
// Handle logout
router.post('/logout', (req, res) => {
    req.logout()
    res.redirect('/')
})
module.exports = router