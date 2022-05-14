// Contains all the routes for the clinician.
// Setup clinician router
const express = require('express')
const clinicianRouter = express.Router()

// Used to expose body section for POST method
const bodyParser = require('body-parser')
clinicianRouter.use(bodyParser.urlencoded({ extended: false }));

const appController = require('../controllers/appController.js')


clinicianRouter.get('/', (req, res) => {
    appController.getAllDataClinician(req, res)
})

clinicianRouter.get('/:username', (req, res) => {
    appController.getPatientDataClinician(req, res)
})


clinicianRouter.post('/post_submit_msg/:id', async (req, res) => {
    appController.submitSupportMessage(req, res)
})

clinicianRouter.post('/post_time_series/:id', async (req, res) => {
    appController.setPatientTimeSeries(req, res)
})




module.exports = clinicianRouter