const express = require('express')

// create our Router object
const patientRouter = express.Router()

// import app controller functions
const appController = require('../controllers/appController')

// add a route to handle the GET request for all app data
// patientRouter.get('/', appController.getPatientName)

// Route currently not used
patientRouter.get('/:username', appController.getPatientName)
// example: http://127.0.0.1:3000/patient_dashboard/Pat   will show a patient dashboard with patient data for Pat


// export the router
module.exports = patientRouter
