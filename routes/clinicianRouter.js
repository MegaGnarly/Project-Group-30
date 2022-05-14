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

// clinicianRouter.get('/:username/patient_message', (req, res) => {
//     console.log("Support message route")
//     console.log("Support message route")
//     console.log("Support message route")
// })

clinicianRouter.post('/post_submit_msg/:id', async (req, res) => {
    // console.log("Values: ")
    // console.log(req.body);
    // console.log(req.body.cMsg)
    appController.submitSupportMessage(req, res)
})


module.exports = clinicianRouter