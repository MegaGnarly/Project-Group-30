const express = require('express')

// create our Router object
const patientRouter = express.Router()

// import app controller functions
const appController = require('../controllers/appController')

// add a route to handle the GET request for all app data
patientRouter.get('/', (req, res) => {
    console.log("IN PATIENT ROUTER - DBOARD")
    res.render('patient_dashboard.hbs', { layout: 'main2' })
})

patientRouter.get('/history', (req, res) => {
    appController.getPatientHistory(req, res)
})

// patientRouter.get('/:id', appController.getPatientName)
// example: http://127.0.0.1:3000/patient/849   will show a patient dashboard with patient data for id 849


// patientRouter.get('/record_health',  (req, res) => {
//     console.log("IN PATIENT ROUTER - REC HEALTH")
//     appController.getRecordHealthPage(req, res)
//     // res.render('record_health.hbs', { userName: "Pat", userRole: "USER", logoURL: "../patient_dash" })
// })

// patientRouter.get('/thankyou_page', (req, res) => {
//     console.log("IN PATIENT ROUTER - TY PAGE")
//     res.render('thankyou_page.hbs', { userName: "Pat", userRole: "USER", logoURL: "../patient_dash" })
// })


// export the router
module.exports = patientRouter
