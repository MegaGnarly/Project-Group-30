const express = require('express')
const clinicianRouter = express.Router()
const appController = require('../controllers/appController.js')

clinicianRouter.get('/', (req, res) => appController.getAllDataClinician(req, res))

module.exports = clinicianRouter