// Import people and patient model
const measuredValue = require('../models/measuredValue')
const user = require('../models/user')
const clinicalNote = require('../models/clinicalNote')
const sessionStorage = require('sessionstorage')


// Get a patients medical history
const getPatientHistory = async (req, res, next) => {
    console.log('getPatientHistory')
    if (sessionStorage.getItem('role') != 'patient') {
        return res.render('error_page', { buttonURL: "../login_page", buttonText: "Login Page", errorHeading: "Authorization Error", errorText: "You do not have permission to access this page. Make sure you are logged in.", logoURL: "../" })
    }
    try {
        const userValues = await measuredValue.find({ username: sessionStorage.getItem('username') }).sort({ date: -1, time: -1 }).lean()
        const currentUser = await user.findOne({ username: sessionStorage.getItem('username') }).lean()

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
        return res.render('patient_history', { user: currentUser, data: tableRowArray, logoURL: "../patient_dashboard", userName: sessionStorage.getItem('username'), userRole: sessionStorage.getItem('role') })
    } catch (err) {
        return res.render('error_page', { errorHeading: "404 Error - Page Not Found", errorText: "Data for this patient could not be retrieved.", logoURL: "../" })
    }
}

// Used for clinician dashboard - get patient data
const getAllDataClinician = async (req, res, next) => {
    console.log('Inside getAllDataClinician')
    if (sessionStorage.getItem('role') != 'clinician') {
        return res.render('error_page', { buttonURL: "../login_page", buttonText: "Login Page", errorHeading: "Authorization Error", errorText: "You do not have permission to access this page. Make sure you are logged in.", logoURL: "../" })
    }
    try {

        const userValuesArray = await measuredValue.collection.distinct("username")
        const tableRowArray = [];
        const patientValues = await user.find().lean()


        for (const user of userValuesArray) {
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
                glucoseExceeded: false,
                weightExceeded: false,
                insulinExceeded: false,
                exerciseExceeded: false,
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

                    if (patientValues.username == user) {
                        // console.log(user)
                    }
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

        // Do saftey threshold validation
        // For whatever reason doing a direct lookup of the user in the above loop won't work (mongo db error)
        // so i'm forced to do it in a separate loop.
        for (const row of tableRowArray) {
            const currentUser = await user.findOne({ username: row.username }).lean()
            if (row.username == currentUser.username) {
                if (row.measured_glucose != "-") {
                    if ((parseFloat(row.measured_glucose) < parseFloat(currentUser.threshold_bg.lower)) || (parseFloat(row.measured_glucose) > parseFloat(currentUser.threshold_bg.upper))) {
                        row.glucoseExceeded = true;
                    }
                }
                if (row.measured_weight != "-") {
                    if ((parseFloat(row.measured_weight) < parseFloat(currentUser.threshold_weight.lower)) || (parseFloat(row.measured_weight) > parseFloat(currentUser.threshold_weight.upper))) {
                        row.weightExceeded = true;
                    }
                }
                if (row.measured_insulin != "-") {
                    if ((parseFloat(row.measured_insulin) < parseFloat(currentUser.threshold_insulin.lower)) || (parseFloat(row.measured_insulin) > parseFloat(currentUser.threshold_insulin.upper))) {
                        row.insulinExceeded = true;
                    }
                }
                if (row.measured_exercise != "-") {
                    if ((parseFloat(row.measured_exercise) < parseFloat(currentUser.threshold_exercise.lower)) || (parseFloat(row.measured_exercise) > parseFloat(currentUser.threshold_exercise.upper))) {
                        row.exerciseExceeded = true;
                    }
                }

            }
        }




        // Append new users that have zero measurement entries into the array
        const patients = await user.find({role: "patient"}).sort({ datesince: -1 }).lean()
        for (const patient of patients) {
            if (!userValuesArray.includes(patient.username)) {
                const rowOfData = {
                    username: patient.username,
                    time: "N/A (new user)",
                    date: "N/A (new user)",
                    measured_glucose: "-",
                    measured_weight: "-",
                    measured_insulin: "-",
                    measured_exercise: "-",
                    comment: "NOTE: This is a new user that has not submitted any records. Ensure that they have been allocated a time series.",
                }
                tableRowArray.push(rowOfData)
            }
        }

        // console.log(tableRowArray)

        // The user values being passed are for the site header on the top right.
        return res.render('clinician_dashboard', { data: tableRowArray, data2: patientValues, userName: sessionStorage.getItem('username'), userRole: sessionStorage.getItem('role'), logoURL: "../" })
    } catch (err) {
        console.log(err)
        console.log("ERROR in getAllDataClinician.")
        return res.render('error_page', { errorHeading: "404 Error - Page Not Found", errorText: "Data for this patient could not be retrieved.", logoURL: "../" })
    }
}


const getAllPatientComments = async (req, res, next) => {
    if (sessionStorage.getItem('role') != 'clinician') {
        return res.render('error_page', { buttonURL: "../login_page", buttonText: "Login Page", errorHeading: "Authorization Error", errorText: "You do not have permission to access this page. Make sure you are logged in.", logoURL: "../" })
    }
    try {
        // Load database and get all measured values
        const userValues = await measuredValue.find().sort({ date: -1, time: -1 }).lean();

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
        return res.render('comments', { patientValues: userValues, logoURL: "./", userName: sessionStorage.getItem('username'), userRole: sessionStorage.getItem('role') })

    } catch (error) {
        console.log(error)
        return res.render('error_page', { errorHeading: "Error", errorText: "Could not load patient comment data. Is your URL correct?", logoURL: "./" })
    }
}


const getPatientEntryData = async (req, res, next) => {
    if (sessionStorage.getItem('role') != 'clinician') {
        return res.render('error_page', { buttonURL: "../login_page", buttonText: "Login Page", errorHeading: "Authorization Error", errorText: "You do not have permission to access this page. Make sure you are logged in.", logoURL: "../" })
    }
    try {
        // Get entryID
        var entryID = req.params.entryid

        // Get data for the specific entry
        const userValues = await measuredValue.findOne({ _id: entryID })
        // console.log(userValues)

        // Get data about the user (what type of measurements they are permitted to record)
        const currentUser = await user.findOne({ username: userValues.username }).lean()

        var date = userValues.date;
        var time = userValues.time;
        var username = userValues.username;
        var fName = currentUser.firstName;
        var lName = currentUser.lastName;
        var comment = userValues.comment;
        var glucose = userValues.measured_glucose;
        var weight = userValues.measured_weight;
        var exercise = userValues.measured_exercise;
        var insulin = userValues.measured_insulin;
        var dob = userValues.dob;

        return res.render('attached_data', {
            patientValues: userValues, date: date, time: time, username: username, comment: comment, dob,
            glucose: glucose, weight: weight, exercise: exercise, insulin: insulin, fName: fName, lName: lName, logoURL: "../",
            userName: sessionStorage.getItem('username'), userRole: sessionStorage.getItem('role')
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
    if (sessionStorage.getItem('role') != 'clinician') {
        return res.render('error_page', { buttonURL: "../login_page", buttonText: "Login Page", errorHeading: "Authorization Error", errorText: "You do not have permission to access this page. Make sure you are logged in.", logoURL: "../" })
    }
    try {
        // Get basic information about the patient (first name, last name etc)
        // Also serves as a way to check whether the user actually exists. If not, the try block will fail.
        const currentUser = await user.findOne({ username: req.params.username }).lean()

        if (currentUser == null) {
            // Throw page not found error
            return res.render('error_page', { errorHeading: "404 Error - Page Not Found", errorText: "Data for this patient could not be retrieved.", logoURL: "../" })
        }

        // Get all measurement values about the patient
        const userValues = await measuredValue.find({ username: req.params.username }).sort({ date: -1, time: -1 }).lean()

        // On the front end we have a table of entries. This code populates the table with rows of data. Each row is a measuredValue entry in the db.
        // For each entry, construct a row of data which stores date, data type, data value and patient comment.
        const tableRowArray = [];
        userValues.forEach(function (arrayItem) {
            const rowOfData = {
                date: arrayItem.date,
                time: arrayItem.time,
                dataType: "",
                value: "",
                threshExceeded: false,
                comment: arrayItem.comment
            }

            // Determine the data type and data value for the row. Check for safety threshold violations.
            if (arrayItem.measured_glucose != "-") {
                rowOfData.dataType = "Blood Glucose";
                rowOfData.value = arrayItem.measured_glucose;

                if ((parseFloat(arrayItem.measured_glucose) < parseFloat(currentUser.threshold_bg.lower)) || (parseFloat(arrayItem.measured_glucose) > parseFloat(currentUser.threshold_bg.upper))) {
                    rowOfData.threshExceeded = true;
                }
            }
            else if (arrayItem.measured_weight != "-") {
                rowOfData.dataType = "Weight";
                rowOfData.value = arrayItem.measured_weight;

                if ((parseFloat(arrayItem.measured_weight) < parseFloat(currentUser.threshold_weight.lower)) || (parseFloat(arrayItem.measured_weight) > parseFloat(currentUser.threshold_weight.upper))) {
                    rowOfData.threshExceeded = true;
                }
            }
            else if (arrayItem.measured_insulin != "-") {
                rowOfData.dataType = "Insulin Doses";
                rowOfData.value = arrayItem.measured_insulin;

                if ((parseFloat(arrayItem.measured_insulin) < parseFloat(currentUser.threshold_insulin.lower)) || (parseFloat(arrayItem.measured_insulin) > parseFloat(currentUser.threshold_insulin.upper))) {
                    rowOfData.threshExceeded = true;
                }
            }
            else if (arrayItem.measured_exercise != "-") {
                rowOfData.dataType = "Exercise (steps)";
                rowOfData.value = arrayItem.measured_exercise;

                if ((parseFloat(arrayItem.measured_exercise) < parseFloat(currentUser.threshold_exercise.lower)) || (parseFloat(arrayItem.measured_exercise) > parseFloat(currentUser.threshold_exercise.upper))) {
                    rowOfData.threshExceeded = true;
                }
            }

            // Append to array
            tableRowArray.push(rowOfData)
        })

        // Check if patient is permitted to record blood glucose data
        var allowGlucose = currentUser.threshold_bg.prescribed;

        // Check if patient is permitted to record weight data
        var allowWeight = currentUser.threshold_weight.prescribed;

        // Check if patient is permitted to record exercise data
        var allowExercise = currentUser.threshold_exercise.prescribed;

        // Check if patient is permitted to record insulin data
        var allowInsulin = currentUser.threshold_insulin.prescribed;

        // Check if the patient is permitted to record anything at all...
        var permittedToRecordAnything = true;
        if (!allowGlucose && !allowWeight && !allowExercise && !allowInsulin) {
            permittedToRecordAnything = false;
        }

        // Get clinical Notes
        const allNotes = await clinicalNote.find({ username: req.params.username }).sort({ date: -1, time: -1 }).lean()

        return res.render('patient_specifics', { profileData: currentUser, patientValues: tableRowArray, allowGlucose, allowWeight, allowExercise, allowInsulin, permittedToRecordAnything, clinicianNote: allNotes, logoURL: "../", userName: sessionStorage.getItem('username'), userRole: sessionStorage.getItem('role') })

    } catch (err) {
        console.log(err)
        console.log("ERROR in getPatientDataClinician. Perhaps the user does not exist?")
        return res.render('error_page', { errorHeading: "404 Error - Page Not Found", errorText: "Data for this patient could not be retrieved.", logoURL: "../" })
    }
}


//

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

const getPatientSettings = async (req, res, next) => {
    try {
        const current_user = await user.findOne({ username: sessionStorage.getItem('username') }).lean()

        if (current_user === undefined || current_user === null) {
            return res.render('error_page', { buttonURL: "../login_page", buttonText: "Login Page", errorHeading: "Authorization Error", errorText: "You do not have permission to access this page. Make sure you are logged in.", logoURL: "../" })
       }
        return res.render('patient_acc_setting', { user: current_user, logoURL: "../patient_dashboard", userName: sessionStorage.getItem('username'), userRole: sessionStorage.getItem('role') })
    } catch (error) {
        console.log(error)
    }
}

const getPatientChangePass = async (req, res, next) => {
    try {
        return res.render('patient_change_pwd', { user: sessionStorage.getItem('username'), logoURL: "../patient_dashboard" })
    } catch (error) {
        console.log(error)
    }
}


// Check if string only contains numbers
function stringValidation(str) {
    return /^\d+$/.test(str);
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
            return res.render('error_page', { buttonURL: req.header('Referer'), buttonText: "Go Back to Patient", errorHeading: "Success!", errorText: "The time series was successfully updated. Note that you did not select any checkboxes, therefore the patient is not eligible to make any recordings.", logoURL: "../" })
            // return res.redirect(req.get('referer'));
        }

        // Read each checkbox selection and progressively update the allowed measurable values 
        if (req.body.checkbox.includes("blood_glucose")) {
            // Check if user submitted values are valid (numerical or numerical with decimal)
            if (isValidNumber(req.body.lower_bg) || (isValidNumber(req.body.upper_bg))) {
                var acceptedValues = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "."];
                // Validate input. Note that decimal places are allowed for blood glucose entries
                for (const char of req.body.lower_bg) {
                    if (!acceptedValues.includes(char)) {
                        console.log("Invalid input for blood glucose")
                        return res.render('error_page', { buttonURL: req.header('Referer'), buttonText: "Go Back", errorHeading: "Invalid data error", errorText: "The data entered for blood glucose was not accepted by the server. Please enter numeric characters (decimals permitted) and try again.", logoURL: "patient_dashboard" })
                    }
                    // Decimal places are permitted but we need to handle the edge case of input like this: "5...6"
                    // Only allow one decimal overall. Just pop the last element of the array as this element is the decimal.
                    if (char === ".") {
                        acceptedValues.pop();
                    }
                }
                acceptedValues = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "."];
                for (const char of req.body.upper_bg) {
                    if (!acceptedValues.includes(char)) {
                        console.log("Invalid input for blood glucose")
                        return res.render('error_page', { buttonURL: req.header('Referer'), buttonText: "Go Back", errorHeading: "Invalid data error", errorText: "The data entered for blood glucose was not accepted by the server. Please enter numeric characters (decimals permitted) and try again.", logoURL: "patient_dashboard" })
                    }
                    if (char === ".") {
                        acceptedValues.pop();
                    }
                }

                // Make sure lower value is less than/equal to upper value
                if (parseInt(req.body.lower_bg) > (parseInt(req.body.upper_bg))) {
                    return res.render('error_page', { buttonURL: req.header('Referer'), buttonText: "Go Back", errorHeading: "Invalid data error", errorText: "The data entered for blood glucose was not accepted by the server. Lower safety threshold cannot exceed higher threshold. Please try again", logoURL: "../" })
                }

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
                var acceptedValues = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "."]

                // Validate input. Note that decimal places are allowed for weight entries
                for (const char of req.body.lower_weight) {
                    if (!acceptedValues.includes(char)) {
                        console.log("Invalid input for measured weight")
                        return res.render('error_page', { buttonURL: req.header('Referer'), buttonText: "Go Back", errorHeading: "Invalid data error", errorText: "The data entered for weight was not accepted by the server. Please enter numeric characters (decimals permitted) and try again.", logoURL: "../" })
                    }
                    if (char === ".") {
                        acceptedValues.pop();
                    }
                }
                acceptedValues = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "."]
                for (const char of req.body.upper_weight) {
                    if (!acceptedValues.includes(char)) {
                        console.log("Invalid input for measured weight")
                        return res.render('error_page', { buttonURL: req.header('Referer'), buttonText: "Go Back", errorHeading: "Invalid data error", errorText: "The data entered for weight was not accepted by the server. Please enter numeric characters (decimals permitted) and try again.", logoURL: "../" })
                    }
                    if (char === ".") {
                        acceptedValues.pop();
                    }
                }

                // Make sure lower value is less than/equal to upper value
                if (parseInt(req.body.lower_weight) > (parseInt(req.body.upper_weight))) {
                    return res.render('error_page', { buttonURL: req.header('Referer'), buttonText: "Go Back", errorHeading: "Invalid data error", errorText: "The data entered for weight was not accepted by the server. Lower safety threshold cannot exceed higher threshold. Please try again", logoURL: "../" })
                }


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
                if (!stringValidation((req.body.lower_steps))) {
                    return res.render('error_page', { buttonURL: req.header('Referer'), buttonText: "Go Back", errorHeading: "Invalid data error", errorText: "The data entered for exercise (steps) was not accepted by the server. Only numeric characters are permitted. Please try again.", logoURL: "../" })
                }
                if (!stringValidation((req.body.upper_steps))) {
                    return res.render('error_page', { buttonURL: req.header('Referer'), buttonText: "Go Back", errorHeading: "Invalid data error", errorText: "The data entered for exercise (steps) was not accepted by the server. Only numeric characters are permitted. Please try again.", logoURL: "../" })
                }

                // Make sure lower value is less than/equal to upper value
                if (parseInt(req.body.lower_steps) > (parseInt(req.body.upper_steps))) {
                    return res.render('error_page', { buttonURL: req.header('Referer'), buttonText: "Go Back", errorHeading: "Invalid data error", errorText: "The data entered for exercise (steps) was not accepted by the server. Lower safety threshold cannot exceed higher threshold. Please try again.", logoURL: "../" })
                }

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
                if (!stringValidation(req.body.lower_doses)) {
                    return res.render('error_page', { buttonURL: req.header('Referer'), buttonText: "Go Back", errorHeading: "Invalid data error", errorText: "The data entered for insulin doses was not accepted by the server. Only numeric characters are permitted. Please try again.", logoURL: "../" })
                }
                if (!stringValidation(req.body.upper_doses)) {
                    return res.render('error_page', { buttonURL: req.header('Referer'), buttonText: "Go Back", errorHeading: "Invalid data error", errorText: "The data entered for insulin doses was not accepted by the server. Only numeric characters are permitted. Please try again.", logoURL: "../" })
                }

                // Make sure lower value is less than/equal to upper value
                if (parseInt(req.body.lower_doses) > (parseInt(req.body.upper_doses))) {
                    return res.render('error_page', { buttonURL: req.header('Referer'), buttonText: "Go Back", errorHeading: "Invalid data error", errorText: "The data entered for insulin was not accepted by the server. Lower safety threshold cannot exceed higher threshold. Please try again", logoURL: "../" })
                }

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
        return res.render('error_page', { buttonURL: req.header('Referer'), buttonText: "Go Back to Patient", errorHeading: "Success!", errorText: "The time series was successfully updated.", logoURL: "../" })
        // res.redirect(req.get('referer'));

    } catch (error) {
        console.log(error)
    }
}

// Used for clinician -> patient specifics page.
const setClinicianNote = async (req, res, next) => {
    if (sessionStorage.getItem('role') != 'clinician') {
        return res.render('error_page', { buttonURL: "../login_page", buttonText: "Login Page", errorHeading: "Authorization Error", errorText: "You do not have permission to access this page. Make sure you are logged in.", logoURL: "../" })
    }
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
    if (sessionStorage.getItem('role') != 'patient') {
        return res.render('error_page', { buttonURL: "../login_page", buttonText: "Login Page", errorHeading: "Authorization Error", errorText: "You do not have permission to access this page. Make sure you are logged in.", logoURL: "../" })
    }
    try {
        const allUsers = await user.collection.distinct("username", { role: "patient" })
        var rankingRowArray = []
        const currentUser = await user.findOne({ username: sessionStorage.getItem('username') }).lean()

        for (const currUser of allUsers) {
            const rowOfData = {
                username: currUser,
                daysRegistered: "",
                daysEngaged: "",
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
            const engagementRate = (daysOfEngagement / totalDaysRegistered) * 100;
            // This rounds the rate to 1 decimal place
            // Converts all NaN to 0 for sorting purposes
            rowOfData.engagementRate = (Math.round(engagementRate * 10) / 10) || 0
            rowOfData.daysRegistered = totalDaysRegistered || 0
            rowOfData.daysEngaged = daysOfEngagement || 0

            rankingRowArray.push(rowOfData)
        }

        // Reverse sort based on the engagement rate
        rankingRowArray.sort((a, b) => b.engagementRate - a.engagementRate);
        // Get top 5
        rankingRowArray = rankingRowArray.slice(0,5);

        // Used to display top 3
        var first = rankingRowArray[0].username
        var second = rankingRowArray[1].username
        var third = rankingRowArray[2].username

        res.render('leaderboard', { user: currentUser, rank: rankingRowArray, first: first, second: second, third: third, logoURL: "../patient_dashboard", userName: sessionStorage.getItem('username'), userRole: sessionStorage.getItem('role') })

    } catch (error) {
        console.log(error)
        return res.render('error_page', { errorHeading: "Error when displaying getLeaderboard", errorText: "Error when displaying getLeaderboard", logoURL: "../patient_dashboard" })
    }

}


// Helper function used for patient dashboard
// Compare argument date with current date
function dateComparison(date) {
    try {
        let currentDate = new Date().toLocaleDateString('en-AU', { timeZone: 'Australia/Melbourne' });
        return currentDate > date;

    } catch (error) {
        console.log("Error")
        return false
    }
}



// Patient Dashboard logic
const getPatientDashboard = async (req, res, next) => {
    if (sessionStorage.getItem('role') != 'patient') {
        return res.render('error_page', { buttonURL: "../login_page", buttonText: "Login Page", errorHeading: "Authorization Error", errorText: "You do not have permission to access this page. Make sure you are logged in.", logoURL: "../" })
    }
    try {

        // Get Engagement Rate
        const currentUser = await user.findOne({ username: sessionStorage.getItem('username') }).lean()

        const engagementData = {
            daysRegistered: "",
            daysEngaged: "",
            engagementRate: ""
        }
        // For every user, count their distinct dates
        const daysOfEngagement = (await measuredValue.find({ username: currentUser.username }).distinct("date")).length
        const sinceDate = await user.findOne({ username: currentUser.username }, { _id: 0, dateSince: 1 })
        const registeredDate = sinceDate.dateSince
        const today = new Date()
        const todaysDate = new Date(today.getTime())
        // To calculate the time difference of two dates
        const differenceInTime = todaysDate - registeredDate;
        // To calculate the no. of days between two dates
        const totalDaysRegistered = Math.ceil(differenceInTime / (1000 * 3600 * 24));
        // Engagement rate as per spec - For example, if a patient has been registered for 20 days, 
        // and entered some data on 16 of those days, their current engagement rate is 80%.
        const engagementRate = (daysOfEngagement / totalDaysRegistered) * 100;
        // This rounds the rate to 1 decimal place
        // Converts all NaN to 0 for sorting purposes
        engagementData.engagementRate = (Math.round(engagementRate * 10) / 10) || 0
        engagementData.daysRegistered = totalDaysRegistered || 0
        engagementData.daysEngaged = daysOfEngagement || 0

        // Determine whether we should display the measurement values for the client
        var isPermittedBg = currentUser.threshold_bg.prescribed;
        var isPermittedWeight = currentUser.threshold_weight.prescribed;
        var isPermittedExercise = currentUser.threshold_exercise.prescribed;
        var isPermittedInsulin = currentUser.threshold_insulin.prescribed;
        var displayBg, displayWeight, displayExercise, displayInsulin;

        const userValues = await measuredValue.find({ username: sessionStorage.getItem('username') },
            { measured_glucose: 1, measured_weight: 1, measured_exercise: 1, measured_insulin: 1, date: 1 }).sort({ date: -1 }).lean();
        for (const entry of userValues) {
            // Basically - does the patient have permission for this measurement type? Is the entry for this field empty?
            if (isPermittedBg && entry.measured_glucose != "-" && displayBg === undefined) {
                // Compare the date this entry was made with the current date
                displayBg = dateComparison(entry.date);
                // console.log("bg vals:", entry.date, entry.measured_glucose, displayBg)
            }

            if (isPermittedWeight && entry.measured_weight != "-" && displayWeight === undefined) {
                displayWeight = dateComparison(entry.date);
            }

            if (isPermittedExercise && entry.measured_exercise != "-" && displayExercise === undefined) {
                displayExercise = dateComparison(entry.date);
            }

            if (isPermittedInsulin && entry.measured_insulin != "-" && displayInsulin === undefined) {
                displayInsulin = dateComparison(entry.date);
            }
        }

        // If a patient has zero entries for a field by the end of the loop AND 
        // if they have permission for the field then set display status to true
        if (displayBg === undefined && isPermittedBg) {
            displayBg = true;
        }
        if (displayWeight === undefined && isPermittedWeight) {
            displayWeight = true;
        }
        if (displayExercise === undefined && isPermittedExercise) {
            displayExercise = true;
        }
        if (displayInsulin === undefined && isPermittedInsulin) {
            displayInsulin = true;
        }

        // If the user has entered all the required data for today
        var enteredAllData = false;
        if (!displayBg && !displayWeight && !displayExercise && !displayInsulin) {
            enteredAllData = true;
        }

        res.render('patient_dashboard', { user: req.user.toJSON(), engagementData: engagementData, profileData: currentUser, displayBg, displayExercise, displayInsulin, displayWeight, enteredAllData, userName: sessionStorage.getItem('username'), userRole: sessionStorage.getItem('role') })
    } catch (error) {
        console.log(error)
        return res.render('error_page', { errorHeading: "Error when displaying dashboard", errorText: "Please ensure that you are logged in", logoURL: "../login" })
    }
}


// Used for patient -> record health page.
const getRecordHealthPage = async (req, res, next) => {
    if (sessionStorage.getItem('role') != 'patient') {
        return res.render('error_page', { buttonURL: "../login_page", buttonText: "Login Page", errorHeading: "Authorization Error", errorText: "You do not have permission to access this page. Make sure you are logged in.", logoURL: "../" })
    }
    try {
        // See if user exists in the database
        const currentUser = await user.findOne({ username: sessionStorage.getItem('username') }).lean()

        console.log(currentUser)

        // Check if patient is permitted to record blood glucose data
        var allowGlucose = currentUser.threshold_bg.prescribed;

        // Check if patient is permitted to record weight data
        var allowWeight = currentUser.threshold_weight.prescribed;

        // Check if patient is permitted to record exercise data
        var allowExercise = currentUser.threshold_exercise.prescribed;

        // Check if patient is permitted to record insulin data
        var allowInsulin = currentUser.threshold_insulin.prescribed;

        // Check if the patient is permitted to record anything at all...
        var permittedToRecordAnything = true;
        if (!allowGlucose && !allowWeight && !allowExercise && !allowInsulin) {
            permittedToRecordAnything = false;
        }

        res.render('record_health.hbs', {
            logoURL: "../patient_dashboard", user: currentUser, allowGlucose: allowGlucose, allowWeight: allowWeight,
            allowExercise: allowExercise, allowInsulin: allowInsulin, permittedToRecordAnything: permittedToRecordAnything,
            userName: sessionStorage.getItem('username'), userRole: sessionStorage.getItem('role')
        })

    } catch (error) {
        console.log(error)
        return res.render('error_page', { errorHeading: "An error occurred", errorText: "An error occurred when performing your request. This may occur if you are not logged in.", logoURL: "../patient_dashboard" })
    }
}


// Handle request to get patient data (name, rank etc)
// Currently not used
const getAllPatientData = async (req, res, next) => {
    console.log('Inside getAllPatientData')
    try {
        const values = await patient.find().lean()
        return res.render('test_data.hbs', { data2: values, userName: patientName, userRole: patientRole, userName: sessionStorage.getItem('username'), userRole: sessionStorage.getItem('role') })
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

const getPatientRole = (req, res) => {
    return req.user.role
}


const getClinicianEditProfile = async (req, res, next) => {
    if (sessionStorage.getItem('role') != 'clinician') {
        return res.render('error_page', { buttonURL: "../login_page", buttonText: "Login Page", errorHeading: "Authorization Error", errorText: "You do not have permission to access this page. Make sure you are logged in.", logoURL: "../" })
    }
    try {
        const current_user = await user.findOne({ username: sessionStorage.getItem('username') }).lean()
        return res.render('clinician_edit_profile', { logoURL: "./", user: current_user })

    } catch (error) {
        console.log(error)
    }
}

const getClinicianProfileSettings = async (req, res, next) => {
    if (sessionStorage.getItem('role') != 'clinician') {
        return res.render('error_page', { buttonURL: "../login_page", buttonText: "Login Page", errorHeading: "Authorization Error", errorText: "You do not have permission to access this page. Make sure you are logged in.", logoURL: "../" })
    }
    const current_user = await user.findOne({ username: sessionStorage.getItem('username') }).lean()

    try {
        return res.render('clinician_profile_settings', { logoURL: "./", userName: sessionStorage.getItem('username'), userRole: sessionStorage.getItem('role'), user: current_user })

    } catch (error) {
        console.log(error)
    }
}

const doesUserExist = async (req, res, next) => {
    console.log(req.body.username)
    try {
        const currentUser = await user.findOne({ username: req.body.username }).lean()
        // always true
        if (currentUser.username == req.body.username) {
            console.log("Registration (appController doesUserExist function): User already exists! ")
            return true;
        }
        else {
            return false;
        }
    } catch (error) {
        console.log("Registration (appController doesUserExist function): User does not already exist. ")
        return false;
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
    setClinicianNote,
    getPatientSettings,
    getPatientChangePass,
    getClinicianEditProfile,
    getClinicianProfileSettings,
    getPatientRole,
    doesUserExist
    // getDataById
}
