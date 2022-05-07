const passport = require('passport')
const express = require('express')
const authRouter = express.Router()
const bodyParser = require('body-parser')
authRouter.use(bodyParser.urlencoded({ extended: false }));
// Authentication middleware
const isAuthenticated = (req, res, next) => {
    // If user is not authenticated via passport, redirect to login page
    if (!req.isAuthenticated()) {
        return res.redirect('/login_page')
    }
    // Otherwise, proceed to next middleware function
    return next()
}

// Main page which requires login to access
// Note use of authentication middleware here
authRouter.get('/patient_dashboard', isAuthenticated, (req, res) => {
    console.log("1111111111111111111")
    res.render('patient_dashboard', { user: req.user.toJSON() })
})

// Login page (with failure message displayed upon login failure)
authRouter.get('/login_page', (req, res) => {
    res.render('login_page', { flash: req.flash('error'), title: 'Login', layout: 'main2' })
})

// Handle login
// authRouter.post('/login',
//     passport.authenticate('local', {
//         successRedirect: '/patient_dash', failureRedirect: '/login', failureFlash: true
//     })
// )
authRouter.post('/login',
    passport.authenticate('local', {
        successRedirect: '/patient_dashboard', failureRedirect: '/login_page', failureFlash: true
    })
    // (req, res) => {
    //     console.log('user ' + req.user.username + ' logged in with role ' + req.user.role)     // for debugging
    //     res.redirect('/patient_dash')   // login was successful, send user to home page
    // }
)

// Handle logout
authRouter.post('/logout', (req, res) => {
    req.logout()
    res.redirect('/')
})
module.exports = authRouter