// Contains all the routes for the clinician.
// Setup clinician router
const express = require('express')
const clinicianRouter = express.Router()

// Used to expose body section for POST method
const bodyParser = require('body-parser')
clinicianRouter.use(bodyParser.urlencoded({ extended: false }));

clinicianRouter.use('/', express.static('public'))


const appController = require('../controllers/appController.js')

clinicianRouter.get('/', (req, res) => {
    appController.getAllDataClinician(req, res)
})

clinicianRouter.get('/patient/:username', (req, res) => {
    appController.getPatientDataClinician(req, res)
})

clinicianRouter.get('/edit', (req, res) => {
    console.log("INSIDE Edit profile")
    appController.getClinicianEditProfile(req, res)
})

clinicianRouter.get('/settings', (req, res) => {
    console.log("INSIDE Profile Settings");
    appController.getClinicianProfileSettings(req, res)
})


clinicianRouter.get('/comments', (req, res) => {
    appController.getAllPatientComments(req, res)
})

clinicianRouter.get('/entry/:entryid', (req, res) => {
    appController.getPatientEntryData(req, res)
})

// clinicianRouter.get('/edit'), (req, res) => {
//     console.log("INSIDE Edit profile")
//     appController.getClinicianEditProfile(req, res)
// }

clinicianRouter.post('/post_submit_msg/:id', async (req, res) => {
    appController.submitSupportMessage(req, res)
})

clinicianRouter.post('/post_time_series/:id', async (req, res) => {
    appController.setPatientTimeSeries(req, res)
})

// // Post Clinician Notes
clinicianRouter.post('/submit_note/:id', async (req, res) => {
    appController.setClinicianNote(req, res)
})


module.exports = clinicianRouter