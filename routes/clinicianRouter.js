// Contains all the routes for the clinician.
// Setup clinician router
const express = require('express')
const clinicianRouter = express.Router()

const appController = require('../controllers/appController.js')


clinicianRouter.get('/', (req, res) => {
    appController.getAllDataClinician(req, res)
})

clinicianRouter.get('/:username', (req, res) => {
    appController.getPatientDataClinician(req, res)
})


module.exports = clinicianRouter