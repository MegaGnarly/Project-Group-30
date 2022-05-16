// Import people and patient model
const measuredValue = require('../models/measuredValue')
const user = require('../models/user')
const clinicalNote = require('../models/clinicalNote')
const sessionStorage = require('sessionstorage')


// Get a patients medical history
const getPatientHistory = async (req, res, next) => {
    console.log('getPatientHistory')
    try {
        const userValues = await measuredValue.find({ username: sessionStorage.getItem('username') }).lean()

        const tableRowArray = [];
        userValues.forEach(function (arrayItem) {
            const rowOfData = {
                date: arrayItem.date,
                time: arrayItem.time,
                dataType: "",
                value: "",
                comment: arrayItem.comment,
                pic: ""
            }
            // Determine the data type and data value for the row.
            if (arrayItem.measured_glucose != "-") {
                rowOfData.dataType = "Blood Glucose";
                rowOfData.value = arrayItem.measured_glucose;
                rowOfData.pic = "../assets/blood glucose.png"
            }
            else if (arrayItem.measured_weight != "-") {
                rowOfData.dataType = "Weight";
                rowOfData.value = arrayItem.measured_weight;
                rowOfData.pic = "../assets/Weight White ver.png"

            }
            else if (arrayItem.measured_insulin != "-") {
                rowOfData.dataType = "Insulin Doses";
                rowOfData.value = arrayItem.measured_insulin;
                rowOfData.pic = "../assets/insulin icon.png"
            }
            else if (arrayItem.measured_exercise != "-") {
                rowOfData.dataType = "Exercise (steps)";
                rowOfData.value = arrayItem.measured_exercise;
                rowOfData.pic = "../assets/exercise icon.png"
            }

            // Append to array
            tableRowArray.push(rowOfData)
        })

        // The user values being passed are for the site header on the top right.
        return res.render('patient_history', { data: tableRowArray, logoURL: "../patient_dashboard" })
    } catch (err) {
        return res.render('error_page', { errorHeading: "404 Error - Page Not Found", errorText: "Data for this patient could not be retrieved.", logoURL: "../" })
    }
}

// Used for clinician dashboard - get patient data
const getAllDataClinician = async (req, res, next) => {
    console.log('Inside getAllDataClinician')
    try {

        const userArray = await measuredValue.collection.distinct("username")

        const tableRowArray = [];

        const patientValues = await user.find().lean()

        for (const user of userArray) {
            // Queries the DB and returns all data of 1 user
            const currentUser = await measuredValue.find({ username: user }).lean()
            const rowOfData = {
                username: user,
                time: "",
                date: "",
                measured_glucose: "-",
                measured_weight: "-",
                measured_insulin: "-",
                measured_exercise: "-",
                comment: "",
            }
            currentUser.forEach(function (arrayItem) {

                // Update the date and time
                rowOfData.time = arrayItem.time
                rowOfData.date = arrayItem.date
                rowOfData.comment = arrayItem.comment

                // Update the measurement, if it exists
                if (arrayItem.measured_glucose != "-") {
                    rowOfData.measured_glucose = arrayItem.measured_glucose;
                }
                if (arrayItem.measured_weight != "-") {
                    rowOfData.measured_weight = arrayItem.measured_weight;
                }
                if (arrayItem.measured_insulin != "-") {
                    rowOfData.measured_insulin = arrayItem.measured_insulin;
                }
                if (arrayItem.measured_exercise != "-") {
                    rowOfData.measured_exercise = arrayItem.measured_exercise;
                }
            })
            // Append to array
            tableRowArray.push(rowOfData)
        }

        // The user values being passed are for the site header on the top right.
        return res.render('clinician_dashboard', { data: tableRowArray, data2: patientValues, userName: 'Chris', userRole: "Clinician", logoURL: "../" })
    } catch (err) {
        console.log(err)
        console.log("ERROR in getAllDataClinician.")
        return res.render('error_page', { errorHeading: "404 Error - Page Not Found", errorText: "Data for this patient could not be retrieved.", logoURL: "../" })
    }
}


const getAllPatientComments = async (req, res, next) => {
    try {
        // Load database and get all measured values
        const userValues = await measuredValue.find().sort({ date: -1 }).lean();

        // Extract the entry ID from the rest of the string
        // Example of string: new ObjectId("6281c2556cc848bf7a19edbf")
        // So we are only interested in the numbers within the quotations.
        for (const user of userValues) {
            // Get entryID
            var entryID = user._id;
            entryID = entryID.toString();
            user._id = entryID;
            // console.log(user);
        }

        // Return values to client
        return res.render('comments', { patientValues: userValues, logoURL: "../" })

    } catch (error) {
        console.log(error)
        return res.render('error_page', { errorHeading: "Error", errorText: "Could not load patient comment data. Is your URL correct?", logoURL: "../" })
    }
}


const getPatientEntryData = async (req, res, next) => {
    try {
        // Get entryID
        var entryID = req.params.entryid

        // Get data for the specific entry
        const userValues = await measuredValue.findOne({ _id: entryID })
        console.log(userValues)

        // Get data about the user (what type of measurements they are permitted to record)
        // const currentUser = await user.findOne({ username: userValues.username }).lean()
        // var isPermittedBg = currentUser.threshold_bg.prescribed;
        // var isPermittedWeight = currentUser.threshold_weight.prescribed;
        // var isPermittedExercise = currentUser.threshold_exercise.prescribed;
        // var isPermittedInsulin = currentUser.threshold_insulin.prescribed;
        // console.log(isPermittedBg, isPermittedExercise, isPermittedInsulin, isPermittedWeight)


        var date = userValues.date;
        var time = userValues.time;
        var username = userValues.username;
        var comment = userValues.comment;
        var glucose = userValues.measured_glucose;
        var weight = userValues.measured_weight;
        var exercise = userValues.measured_exercise;
        var insulin = userValues.measured_insulin;

        return res.render('attached_data', {
            patientValues: userValues, date: date, time: time, username: username, comment: comment,
            glucose: glucose, weight: weight, exercise: exercise, insulin: insulin, logoURL: "../"
        })

    } catch (error) {
        console.log(error)
        return res.render('error_page', { errorHeading: "Error", errorText: "Could not load entry data. Is your URL correct?", logoURL: "../" })
    }
}


// Used in clinician dashboard -> click on patient name
// Function that pulls data to create a 'patient specifics' page. Get all data for a specific* patient.
// Example: http://127.0.0.1:3000/clinician_dashboard/Bob would reveal data for Bob
const getPatientDataClinician = async (req, res, next) => {
    console.log("DEBUG: inside getPatientDataClinician")
    try {
        // Get basic information about the patient (first name, last name etc)
        // Also serves as a way to check whether the user actually exists. If not, the try block will fail.
        const currentUser = await user.findOne({ username: req.params.username }).lean()

        if (currentUser == null) {
            // Throw page not found error
            return res.render('error_page', { errorHeading: "404 Error - Page Not Found", errorText: "Data for this patient could not be retrieved.", logoURL: "../" })
        }

        // Get all measurement values about the patient
        const userValues = await measuredValue.find({ username: req.params.username }).lean()

        // On the front end we have a table of entries. This code populates the table with rows of data. Each row is a measuredValue entry in the db.
        // For each entry, construct a row of data which stores date, data type, data value and patient comment.
        const tableRowArray = [];
        userValues.forEach(function (arrayItem) {
            const rowOfData = {
                date: arrayItem.date,
                time: arrayItem.time,
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

        // Get clinical Notes
        const allNotes = await clinicalNote.find({ username: req.params.username }).lean()

        return res.render('patient_specifics', { profileData: currentUser, patientValues: tableRowArray, clinicianNote: allNotes, logoURL: "../" })

    } catch (err) {
        console.log(err)
        console.log("ERROR in getPatientDataClinician. Perhaps the user does not exist?")
        return res.render('error_page', { errorHeading: "404 Error - Page Not Found", errorText: "Data for this patient could not be retrieved.", logoURL: "../" })
    }
}

/*
Check if input string is a valid number. Supports strings that contain decimal places.
*/
function isValidNumber(input) {
    if (!input || input.length === 0) {
        console.log("isValidNumber: Not a valid number.");
        return false;
    }

    // If string does not contain a decimal point AND there is not a number
    if ((input.indexOf(".")) && (isNaN(input))) {
        console.log("isValidNumber: Not a valid number.");
        return false;
    }
    else {
        return true;
    }
}

// Used for clinician -> patient specifics page.
const setPatientTimeSeries = async (req, res, next) => {
    try {
        // Get username of sender
        const username = req.params.id

        // If no checkboxes have been selected then set 'prescribed' to false on all measurements and return.
        if (req.body.checkbox === undefined) {
            user.collection.updateOne({ "username": username }, { $set: { threshold_bg: { prescribed: false, lower: 0, upper: 0 } } })
            user.collection.updateOne({ "username": username }, { $set: { threshold_weight: { prescribed: false, lower: 0, upper: 0 } } })
            user.collection.updateOne({ "username": username }, { $set: { threshold_exercise: { prescribed: false, lower: 0, upper: 0 } } })
            user.collection.updateOne({ "username": username }, { $set: { threshold_insulin: { prescribed: false, lower: 0, upper: 0 } } })

            // Refresh the page
            return res.redirect(req.get('referer'));
        }

        // Read each checkbox selection and progressively update the allowed measurable values 
        if (req.body.checkbox.includes("blood_glucose")) {
            // Check if user submitted values are valid (numerical or numerical with decimal)
            if (isValidNumber(req.body.lower_bg) || (isValidNumber(req.body.upper_bg))) {
                // Update permission and safety thresholds
                user.collection.updateOne({ "username": username }, { $set: { threshold_bg: { prescribed: true, lower: req.body.lower_bg, upper: req.body.upper_bg } } })
                console.log("Updated blood glucose safety threshold")
            }
            else {
                return res.render('error_page', { buttonURL: req.header('Referer'), buttonText: "Go Back", errorHeading: "Invalid data error", errorText: "The data entered for blood glucose was not accepted by the server. Please try again.", logoURL: "../" })
            }
        }
        else {
            // If the checkbox is not selected then set prescribed to false so that the patient cannot record data for this measurement type.
            user.collection.updateOne({ "username": username }, { $set: { threshold_bg: { prescribed: false, lower: 0, upper: 0 } } })
        }

        if (req.body.checkbox.includes("weight")) {
            if (isValidNumber(req.body.lower_weight) || (isValidNumber(req.body.upper_weight))) {
                // Update permission and safety thresholds
                user.collection.updateOne({ "username": username }, { $set: { threshold_weight: { prescribed: true, lower: req.body.lower_weight, upper: req.body.upper_weight } } })
                console.log("Updated weight safety threshold")
            }
            else {
                return res.render('error_page', { buttonURL: req.header('Referer'), buttonText: "Go Back", errorHeading: "Invalid data error", errorText: "The data entered for weight was not accepted by the server. Please try again.", logoURL: "../" })
            }
        }
        else {
            user.collection.updateOne({ "username": username }, { $set: { threshold_weight: { prescribed: false, lower: 0, upper: 0 } } })
        }

        if (req.body.checkbox.includes("steps")) {
            if (isValidNumber(req.body.lower_steps) || (isValidNumber(req.body.upper_steps))) {
                // Update permission and safety thresholds
                user.collection.updateOne({ "username": username }, { $set: { threshold_exercise: { prescribed: true, lower: req.body.lower_steps, upper: req.body.upper_steps } } })
                console.log("Updated exercise (steps) safety threshold")
            }
            else {
                return res.render('error_page', { buttonURL: req.header('Referer'), buttonText: "Go Back", errorHeading: "Invalid data error", errorText: "The data entered for exercise (steps) was not accepted by the server. Please try again.", logoURL: "../" })
            }
        }
        else {
            user.collection.updateOne({ "username": username }, { $set: { threshold_exercise: { prescribed: false, lower: 0, upper: 0 } } })
        }

        if (req.body.checkbox.includes("insulin")) {
            if (isValidNumber(req.body.lower_doses) || (isValidNumber(req.body.upper_doses))) {
                // Update permission and safety thresholds
                user.collection.updateOne({ "username": username }, { $set: { threshold_insulin: { prescribed: true, lower: req.body.lower_doses, upper: req.body.upper_doses } } })
                console.log("Updated insulin doseage safety threshold")
            }
            else {
                return res.render('error_page', { buttonURL: req.header('Referer'), buttonText: "Go Back", errorHeading: "Invalid data error", errorText: "The data entered for insulin (doses) was not accepted by the server. Please try again.", logoURL: "../" })
            }
        }
        else {
            user.collection.updateOne({ "username": username }, { $set: { threshold_insulin: { prescribed: false, lower: 0, upper: 0 } } })
        }

        // Refresh the page
        res.redirect(req.get('referer'));

    } catch (error) {
        console.log(error)
    }
}

// Used for clinician -> patient specifics page.
const setClinicianNote = async (req, res, next) => {
    try {
        // New code that constructs and entry that will be inserted into the database.
        // Note that all measured values are blank for now.
        const doc = {
            username: req.params.id,
            date: new Date().toLocaleDateString('en-AU', { timeZone: 'Australia/Melbourne' }),
            time: new Date().toLocaleTimeString('en-AU', { timeZone: 'Australia/Melbourne', hour: '2-digit', minute: '2-digit' }),
            note: req.body.cNote
        }

        //Insert the final entry into the database and redirect user.
        clinicalNote.collection.insertOne(doc);
        await res.redirect('/clinician_dashboard/patient/' + req.params.id)

    } catch (error) {
        console.log(error);
        return res.render('error_page', { buttonURL: "/login_page", buttonText: "Login Page", errorHeading: "An error occurred", errorText: "An error occurred when posting to clinicalNote database", logoURL: "../patient_dashboard" })
    }
}

// Used for clinician -> patient specifics page.
const submitSupportMessage = async (req, res, next) => {
    try {
        const username = req.params.id;
        const clinician_supportMsg = req.body.cMsg;

        // Access the database for this user and update the support message field
        user.collection.updateOne({ username: username }, { $set: { support_msg: clinician_supportMsg } });
        console.log("Updated support message for", username);
        await res.redirect('/clinician_dashboard/patient/' + req.params.id)

    } catch (error) {
        console.log(error)
        return res.render('error_page', { errorHeading: "Error when submitting clinician message", errorText: "Please try again.", logoURL: "../" })
    }
}

const getLeaderboard = async (req, res, next) => {
    try {
        const allUsers = await user.collection.distinct("username")
        const rankingRowArray = []

        for (const currUser of allUsers) {
            const rowOfData = {
                username: currUser,
                engagementRate: ""
            }
            // For every user, count their distinct dates
            const daysOfEngagement = (await measuredValue.find({ username: [currUser] }).distinct("date")).length
            const sinceDate = await user.findOne({ username: [currUser] }, { _id: 0, dateSince: 1 })
            const registeredDate = sinceDate.dateSince
            const today = new Date()
            const todaysDate = new Date(today.getTime())
            // To calculate the time difference of two dates
            const differenceInTime = todaysDate - registeredDate;
            // To calculate the no. of days between two dates
            const totalDaysRegistered = Math.ceil(differenceInTime / (1000 * 3600 * 24));

            // Engagement rate as per spec - For example, if a patient has been registered for 20 days, 
            // and entered some data on 16 of those days, their current engagement rate is 80%.
            rowOfData.engagementRate = (daysOfEngagement / totalDaysRegistered) * 100;
            rankingRowArray.push(rowOfData)
        }

        res.render('leaderboard', { rank: rankingRowArray, logoURL: "../patient_dashboard" })

    } catch (error) {
        console.log(error)
        return res.render('error_page', { errorHeading: "Error when displaying getLeaderboard", errorText: "Error when displaying getLeaderboard", logoURL: "../patient_dashboard" })
    }

}


// Used for patient dashboard 
const getPatientDashboard = async (req, res, next) => {
    try {
        const currentUser = await user.findOne({ username: sessionStorage.getItem('username') }).lean()


        res.render('patient_dashboard', { user: req.user.toJSON(), profileData: currentUser })

    } catch (error) {
        console.log(error)
        return res.render('error_page', { errorHeading: "Error when displaying dashboard", errorText: "Please ensure that you are logged in", logoURL: "../login" })
    }
}


// Used for patient -> record health page.
const getRecordHealthPage = async (req, res, next) => {
    try {
        // const userValues = await measuredValue.find({username: sessionStorage.getItem('username')}).lean()

        // See if user exists in the database
        const currentUser = await user.findOne({ username: sessionStorage.getItem('username') }).lean()

        // Check if patient is permitted to record blood glucose data
        var allowGlucose = currentUser.threshold_bg.prescribed;

        // Check if patient is permitted to record weight data
        var allowWeight = currentUser.threshold_weight.prescribed;

        // Check if patient is permitted to record exercise data
        var allowExercise = currentUser.threshold_exercise.prescribed;

        // Check if patient is permitted to record insulin data
        var allowInsulin = currentUser.threshold_insulin.prescribed;

        // Render page
        res.render('record_health.hbs', { logoURL: "../patient_dashboard", user: currentUser, allowGlucose: allowGlucose, allowWeight: allowWeight, allowExercise: allowExercise, allowInsulin, allowInsulin })

    } catch (error) {
        console.log(error)
        return res.render('error_page', { errorHeading: "An error occurred", errorText: "An error occurred when performing your request. This may occur if you are not logged in.", logoURL: "../patient_dashboard" })
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


// Export objects so that they may be used by other files
module.exports = {
    getAllPatientData,
    getAllDataClinician,
    getPatientDataClinician,
    getAllPatientComments,
    getPatientEntryData,
    getPatientName,
    getPatientDashboard,
    getLeaderboard,
    getRecordHealthPage,
    getPatientHistory,
    submitSupportMessage,
    setPatientTimeSeries,
    setClinicianNote
    // getDataById
}
