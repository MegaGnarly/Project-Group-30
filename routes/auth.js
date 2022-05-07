const passport = require('passport')
const express = require('express')
const authRouter = express.Router()

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
authRouter.get('/patient_dashboard', isAuthenticated, (req, res) => {
    console.log("1111111111111111111")
    res.render('patient_dashboard', { username: req.user.username })
})

// Login page (with failure message displayed upon login failure)
authRouter.get('/login', (req, res) => {
    console.log("0000000000000000")
    res.render('login_page', { flash: req.flash('error'), title: 'Login' , layout:'main2'})
})

// Handle login
authRouter.post('/login',
    passport.authenticate('local', {
        successRedirect: '/patient_dashboard', failureRedirect: '/login', failureFlash: true
    })
)

// Handle logout
authRouter.post('/logout', (req, res) => {
    req.logout()
    res.redirect('/')
})
module.exports = authRouter