// Import people and patient model
const measuredValue = require('../models/measuredValue')
const patient = require('../models/patient')

// Patient identities are hardcoded for this deliverable (see spec sheet)
patientName = "Pat"
patientRole = "USER"


// Handle request to get all people data instances
const getAllData = async (req, res, next) => {

    try {
        const values = await measuredValue.find().lean()
        const patientValues = await patient.find().lean()
        // The user values being passed are for the site header on the top right.
        return res.render('test_data', {data: values, data2: patientValues, userName: patientName, userRole: patientRole})
    } catch (err) {
        return next(err)
    }
}

// Handle request to get patient data (name, rank etc)
const getAllPatientData = async (req, res, next) => {
    console.log('Inside getAllPatientData')
    try {
        const values = await patient.find().lean()
        return res.render('test_data.hbs', {data2: values, userName: patientName, userRole: patientRole})
    } catch (err) {
        return next(err)
    }
}


const getPatientName = async (req, res, next) => {
    console.log('Inside getPatientName')
    try {
        const patientName = await patient.findOne( {id: req.params.id} ).lean()
        return res.render('patient_dashboard', {patientData: patientName, userName: patientName, userRole: patientRole})
    } catch (err) {
        return next(err)
    }
}


// Handle request to get one data instance - not in use!
const getDataById = async (req, res, next) => {
    console.log("Inside getdatabyID")
    // search the database by ID
    try {
        const value = await measuredValue.findById(req.params.measuredValue_id).lean() 
        if (!value) {
        // no value found in database return res.sendStatus(404)
            return res.sendStatus(404)
        }
        // found person
        return res.render('oneData', {oneItem: value})
    } catch (err) { 
        return next(err)
    }        
}


// Export objects so that they may be used by other files
module.exports = {
    getAllPatientData,
    getAllData,
    getPatientName,
    // getDataById
}
