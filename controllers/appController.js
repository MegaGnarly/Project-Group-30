// Import people and patient model
const measuredValue = require('../models/measuredValue')
const user = require('../models/user')


// Get *all* patient data (used for the clinician dashboard)
const getAllDataClinician = async (req, res, next) => {
    console.log('Inside getAllDataClinician')
    try {
        const values = await measuredValue.find().lean()
        const patientValues = await user.find().lean()
        // The user values being passed are for the site header on the top right.
        return res.render('clinician_dashboard', { data: values, data2: patientValues, userName: 'Chris', userRole: "Clinician", logoURL: "../clinician_dashboard" })
    } catch (err) {
        return next(err)
    }
}


// Get all data for a *specific* patient (used when you click a patient in the clin dashboard)
// Example: http://127.0.0.1:3000/clinician_dashboard/Bob would reveal data for Bob
const getPatientDataClinician = async (req, res, next) => {
    console.log("DEBUG: inside getPatientDataClinician")
    try {
        // Get basic information about the patient (first name, last name etc)
        // Also serves as a way to check whether the user actually exists. If not, the try block will fail.
        const currentUser = await user.findOne({ username: req.params.username }).lean()
        if (currentUser == null) {
            // Throw page not found error
            return res.render('error_page', { errorHeading: "404 Error - Page Not Found", errorText: "Data for this patient could not be retrieved.", logoURL: "../clinician_dashboard" })
        }

        // Get all measurement values about the patient
        const userValues = await measuredValue.find({ username: req.params.username }).lean()

        // On the front end we have a table of entries. This code populates the table with rows of data. Each row is a measuredValue entry in the db.
        // For each entry, construct a row of data which stores date, data type, data value and patient comment.
        const tableRowArray = [];
        userValues.forEach(function (arrayItem) {
            const rowOfData = {
                dateTime: arrayItem.dateTime,
                dataType: "",
                value: "",
                comment: arrayItem.comment
            }

            // Determine the data type and data value for the row.
            if (arrayItem.measured_glucose != "-") {
                rowOfData.dataType = "Blood Glucose";
                rowOfData.value = arrayItem.measured_glucose;
            }
            else if (arrayItem.measured_weight != "-") {
                rowOfData.dataType = "Weight";
                rowOfData.value = arrayItem.measured_weight;
            }
            else if (arrayItem.measured_insulin != "-") {
                rowOfData.dataType = "Insulin Doses";
                rowOfData.value = arrayItem.measured_insulin;
            }
            else if (arrayItem.measured_exercise != "-") {
                rowOfData.dataType = "Exercise (steps)";
                rowOfData.value = arrayItem.measured_exercise;
            }

            // Append to array
            tableRowArray.push(rowOfData)
        })

        return res.render('patient_specifics', { profileData: currentUser, patientValues: tableRowArray, logoURL: "../clinician_dashboard" })

    } catch (err) {
        console.log(err)
        console.log("ERROR in getPatientDataClinician. Perhaps the user does not exist?")
        return res.render('error_page', { errorHeading: "404 Error - Page Not Found", errorText: "Data for this patient could not be retrieved.", logoURL: "../clinician_dashboard" })
    }
}


const getRecordHealthPage = async (req, res, userData, next) => {
    try {
        // See if user exists in the database
        const currentUser = await user.findOne({ username: userData.username }).lean()
        
        // Check if patient is permitted to record blood glucose data
        var allowGlucose = currentUser.threshold_bg.prescribed;
        console.log(allowGlucose)

        // Check if patient is permitted to record weight data
        var allowWeight = currentUser.threshold_weight.prescribed;

        // Check if patient is permitted to record exercise data
        var allowExercise = currentUser.threshold_exercise.prescribed;

        // Check if patient is permitted to record insulin data
        var allowInsulin = currentUser.threshold_insulin.prescribed;

        // Render page
        console.log("Rendering page")
        res.render('record_health.hbs',  { logoURL: "../patient_dashboard", user: userData, allowGlucose: allowGlucose, allowWeight: allowWeight, allowExercise: allowExercise, allowInsulin, allowInsulin})
        console.log("page rendered")

    } catch (error) {
        console.log(error)
    }

}



// Handle request to get patient data (name, rank etc)
const getAllPatientData = async (req, res, next) => {
    console.log('Inside getAllPatientData')
    try {
        const values = await patient.find().lean()
        return res.render('test_data.hbs', { data2: values, userName: patientName, userRole: patientRole })
    } catch (err) {
        return next(err)
    }
}

// Currently not used
const getPatientName = async (req, res, next) => {
    console.log('Inside getPatientName')
    try {
        const current_user = await User.findOne({ username: req.params.username }).lean()
        const username = current_user.username
        const role = current_user.role
        return res.render('patient_dashboard', { patientData: username, userName: username, role: role, logoURL: "../patient_dashboard" })
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
        return res.render('oneData', { oneItem: value })
    } catch (err) {
        return next(err)
    }
}


// Export objects so that they may be used by other files
module.exports = {
    getAllPatientData,
    //getAllData,
    getAllDataClinician,
    getPatientDataClinician,
    getPatientName,
    getRecordHealthPage,
    // getDataById
}
