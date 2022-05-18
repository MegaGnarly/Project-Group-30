// Contains general application routes not included in clinicianRouter or patientRouter.
const express = require('express')
const appRouter = express.Router()

// import app controller functions
const appController = require('../controllers/appController')

// *** Application Endpoints ***
appRouter.get('/', (req, res) => {
    console.log('SERVER: GET homepage')
    res.render('about_diabetes.hbs', { layout: 'main2' })
})

appRouter.get('/about_diabetes', (req, res) => {
    console.log('SERVER: GET about_diabetes')
    res.render('about_diabetes.hbs', { layout: 'main2' })
})

appRouter.get('/about_site', (req, res) => {
    console.log('SERVER: GET about_site')
    res.render('about_site.hbs', { layout: 'main2' })
})

// Send to registration page
// Note - logins (/login) is handled in auth.js
appRouter.get('/register', (req, res) => {
    res.render('register_page.hbs', { layout: 'main2' })
})


// Export the router
module.exports = appRouter
