// Import people and patient model
const measuredValue = require('../models/measuredValue')
const user = require('../models/user')

// Patient identities are hardcoded for this deliverable (see spec sheet)
// var patientName = "Pat"
// var patientRole = "USER"


// // Handle request to get all people data instances
// const getAllData = async (req, res, next) => {

//     try {
//         const values = await measuredValue.find().lean()
//         const patientValues = await patient.find().lean()
//         // The user values being passed are for the site header on the top right.
//         return res.render('test_data', {data: values, data2: patientValues, userName: patientName, userRole: patientRole})
//     } catch (err) {
//         return next(err)
//     }
// }

// Get *all* patient data (used for the clinician dashboard)
const getAllDataClinician = async (req, res, next) => {
    console.log('Inside getAllDataClinician')
    try {
        const values = await measuredValue.find().lean()
        const patientValues = await user.find().lean()
        // The user values being passed are for the site header on the top right.
        return res.render('clinician_dashboard', {data: values, data2: patientValues, userName: 'Chris', userRole: "Clinician", logoURL:"../clinician_dashboard"})
    } catch (err) {
        return next(err)
    }
}


// Get all data for a *specific* patient (used when you click a patient in the clin dashboard)
const getPatientDataClinician = async (req, res, next) => {
    // TODO
    console.log("inside getPatientDataClinician")
    return res.render('patient_specifics')
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

// Currently not used
const getPatientName = async (req, res, next) => {
    console.log('Inside getPatientName')
    try {
        const current_user = await User.findOne( {username: req.params.username} ).lean()
        const username = current_user.username
        const role = current_user.role
        return res.render('patient_dashboard', {patientData: username, userName: username, role: role, logoURL: "../patient_dashboard"})
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
    getAllDataClinician,
    getPatientDataClinician,
    getPatientName,
    // getDataById
}
