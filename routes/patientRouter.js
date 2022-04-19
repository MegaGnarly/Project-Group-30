const express = require('express')

// create our Router object
const patientRouter = express.Router()

// import app controller functions
const appController = require('../controllers/appController')

// add a route to handle the GET request for all app data
// patientRouter.get('/', appController.getPatientName)


patientRouter.get('/:id', appController.getPatientName)
// example: http://127.0.0.1:3000/patient/849   will show a patient dashboard with patient data for id 849


// export the router
module.exports = patientRouter
