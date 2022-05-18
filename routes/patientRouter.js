const express = require('express')
const sessionStorage = require('sessionstorage')

// create our Router object
const patientRouter = express.Router()

// import app controller functions
const appController = require('../controllers/appController')

// add a route to handle the GET request for all app data
patientRouter.get('/patient_dashboard', (req, res) => {
    console.log("IN PATIENT ROUTER - DBOARD")
    res.render('patient_dashboard.hbs', { layout: 'main' })
})

patientRouter.get('/history', (req, res) => {
    console.log("IN PATIENT ROUTER - HISTORY")
    appController.getPatientHistory(req, res)
})


patientRouter.get('/record_health',  (req, res) => {
    console.log("IN PATIENT ROUTER - REC HEALTH")
    appController.getRecordHealthPage(req, res)
    // res.render('record_health.hbs', { userName: "Pat", userRole: "USER", logoURL: "../patient_dash" })
})

patientRouter.get('/leaderboard',  (req, res) => {
    console.log("IN PATIENT ROUTER - LEADERBOARD")
    appController.getLeaderboard(req, res)
})

patientRouter.get('/settings',  (req, res) => {
    console.log("Debug: Inside Patient Settings Route")
    appController.getPatientSettings(req, res)
})

patientRouter.get('/patient_change_pwd', (req, res) => {
    console.log("Debug: Inside Patient Settings Change Password Route")
    appController.getPatientChangePass(req, res);
})

patientRouter.post('/change_pwd', async (req, res) => {
    appController.setNewPatientPass(req, res)
})

// export the router
module.exports = patientRouter
