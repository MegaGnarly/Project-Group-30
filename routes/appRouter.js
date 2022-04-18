// TODO - SETUP ROUTER
const express = require('express')

// create our Router object
const appRouter = express.Router()

// import app controller functions
const appController = require('../controllers/appController')

// add a route to handle the GET request for all app data
appRouter.get('/', appController.getAllData)
appRouter.get('/users', appController.getAllPatientData)

// add a route to handle the GET request for one data instance
//appRouter.get('/:measuredValue_id', appController.getDataById)

// add a new JSON object to the database
// peopleRouter.post('/', peopleController.insertData)

// export the router
module.exports = appRouter
