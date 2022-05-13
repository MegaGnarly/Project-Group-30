// Set server port and import required modules
const PORT = 3000;
const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const exphbs = require('express-handlebars');

// Load database schemas
const measuredValue = require('./models/measuredValue');
const clinicalNote = require('./models/clinicalNote');
const patient = require('./models/patient')
require('./models')

const flash = require('express-flash')
const session = require('express-session')

// link to our routers
const appRouter = require('./routes/appRouter')                 // Handle general routes (e.g. about_site)
const patientRouter = require('./routes/patientRouter')         // Handle patient routes (e.g. record_health)
const clinicianRouter = require('./routes/clinicianRouter.js')  // Handle clinician routes (e.g. clinician_dashboard)


const appController = require('./controllers/appController')


// Routing - set paths
app.use('/', appRouter)
app.use('/patient', patientRouter)
app.use('/clinician_dashboard', clinicianRouter)

// Configure handlebars
app.engine('hbs', exphbs.engine({
    defaultlayout: 'main',
    extname: 'hbs'
}))

// Set handlebars view engine
app.set('view engine', 'hbs')

//----------------------------------------------------------------------------------------------------

// Flash messages for failed logins, and (possibly) other success/error messages
app.use(flash())
// Track authenticated users through login sessions
app.use(
    session({
        // The secret used to sign session cookies (ADD ENV VAR)
        secret: process.env.SESSION_SECRET || 'keyboard cat',
        name: 'demo', // The cookie name (CHANGE THIS)
        saveUninitialized: false,
        resave: false,
        cookie: {
            sameSite: 'strict',
            httpOnly: true,
            secure: app.get('env') === 'production',
            maxAge: 600000
        },
    })
)
if (app.get('env') === 'production') {
    app.set('trust proxy', 1); // Trust first proxy
}
// Initialise Passport.js
const passport = require('./passport')
app.use(passport.authenticate('session'))
// Load authentication router
const authRouter = require('./routes/authRouter');
const user = require('./models/user');
app.use(authRouter)

const isAuthenticated = (req, res, next) => {
    // If user is not authenticated via passport, redirect to login page
    if (!req.isAuthenticated()) {
        return res.redirect('/login_page')
    }
    // Otherwise, proceed to next middleware function
    return next()
}

//----------------------------------------------------------------------------------------------------
// Clinician Dashboard helper - red outline on user if they violate a safety threshold
var hbs = exphbs.create({});
hbs.handlebars.registerHelper('thresholdChecker', function (num, options) {
    if (num < 4.0 || num > 7.8) {
        return options.fn(this);
    }
    return options.inverse(this);
});

// Define where static assets live
app.use(express.static('public'))

// Used to expose body section for POST method
app.use(bodyParser.urlencoded({ extended: false }));

// Debugging middleware that prints when a request arrives at the server 
app.use((req, res, next) => {
    console.log('Message arrived: ' + req.method + ' ' + req.path)
    next()
})


// **** Application Endpoints ****  
// app.get('/patient/record_health', isAuthenticated, (req, res) => {
//     const userData = req.user.toJSON();

//     // res.render('record_health.hbs', { logoURL: "../patient_dashboard", user: req.user.toJSON() })
//     appController.getRecordHealthPage(req, res, userData)
// })

app.get('/patient_history', isAuthenticated, (req, res) => {
    res.render('patient_history.hbs', { logoURL: "../patient_dashboard", user: req.user.toJSON() })
})

app.get('/thankyou_page', (req, res) => {
    res.render('thankyou_page.hbs', { user: req.user.toJSON(), logoURL: "../patient_dashboard" })
})

app.get('/leaderboard', (req, res) => {
    console.log("IN LEADERBOARD")
    res.render('leaderboard.hbs', { user: req.user.toJSON(), logoURL: "../patient_dashboard" })
})


// **** Application POSTs ****  
// POST test - when the user fills the form, update the database.
app.post('/post_values', async (req, res) => {
    const valid_measurements = ["measured_glucose", "measured_weight", "measured_insulin", "measured_exercise"];
    const measuredType = req.body.Selector
    const valueIsEmpty = !req.body.measurement;

    // Check if the value recieved is a valid meaurement type and that it is not empty.
    if ((valid_measurements.includes(measuredType)) && (!valueIsEmpty)) {
        try {
            // New code that constructs and entry that will be inserted into the database.
            // Note that all measured values are blank for now.
            const doc = {
                username: req.user.username,
                date: new Date().toLocaleDateString('en-AU', { timeZone: 'Australia/Melbourne' }),
                time: new Date().toLocaleTimeString('en-AU', { timeZone: 'Australia/Melbourne' }),
                measured_glucose: "-",
                measured_weight: "-",
                measured_insulin: "-",
                measured_exercise: "-",
                comment: req.body.comment
            }

            // Determine what type of data the user has inserted and update the above entry accordingly.
            if (measuredType == "measured_glucose") {
                doc.measured_glucose = req.body.measurement;
            }
            else if (measuredType == "measured_weight") {
                doc.measured_weight = req.body.measurement;
            }
            else if (measuredType == "measured_insulin") {
                doc.measured_insulin = req.body.measurement;
            }
            else if (measuredType == "measured_exercise") {
                doc.measured_exercise = req.body.measurement;
            }

            //Insert the final entry into the database and redirect user.
            measuredValue.collection.insertOne(doc);

            console.log("DEBUG: Ran insertion")
            await res.redirect('thankyou_page')
        } catch (error) {
            console.log(error);
            return res.render('error_page', { buttonURL: "/login_page", buttonText: "Login Page", errorHeading: "An error occurred", errorText: "An error occurred when performing your request. This may occur if you are not logged in.", logoURL: "../patient_dashboard" })
        }


    } else {
        console.log("POST ERROR: Health value from client is not acceptable (either invalid measurement type or empty string). Value will not be inserted into db.")
        return res.render('error_page', { buttonURL: req.header('Referer'), buttonText: "Go Back", errorHeading: "An error occurred when recording your data. Please try again!", errorText: "Please ensure that you have selected the correct measurement type and that you are entering acceptable values.", logoURL: "../patient_dashboard" })
    }
})

// Post Clinician Notes
app.post('/submit_note/:id', async (req, res) => {
    
    try {
        // New code that constructs and entry that will be inserted into the database.
        // Note that all measured values are blank for now.
        const doc = {
            username: req.params.id,
            date: new Date().toLocaleDateString('en-AU', { timeZone: 'Australia/Melbourne' }),
            time: new Date().toLocaleTimeString('en-AU', { timeZone: 'Australia/Melbourne' }),
            note: req.body.cNote
        }

        //Insert the final entry into the database and redirect user.
        clinicalNote.collection.insertOne(doc);

        await res.redirect('/clinician_dashboard/' + req.params.id)
    } catch (error) {
        console.log(error);
        return res.render('error_page', { buttonURL: "/login_page", buttonText: "Login Page", errorHeading: "An error occurred", errorText: "An error occurred when posting to clinicalNote database", logoURL: "../patient_dashboard" })
    }
})


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

app.post('/post_time_series/:id', async (req, res) => {
    try {
        // Get username of sender
        const username = req.params.id

        // Read each checkbox selection and progressively update the allowed measurable values 
        if (req.body.checkbox.includes("blood_glucose")) {
            // Check if user submitted values are valid (numerical or numerical with decimal)
            if (isValidNumber(req.body.lower_bg) || (isValidNumber(req.body.upper_bg))) {
                // Update permission and safety thresholds
                user.collection.updateOne({ "username": username }, { $set: { threshold_bg: { prescribed: true, lower: req.body.lower_bg, upper: req.body.upper_bg } } })
                console.log("Updated blood glucose safety threshold")
            }
            else {
                return res.render('error_page', { buttonURL: req.header('Referer'), buttonText: "Go Back", errorHeading: "Invalid data error", errorText: "The data entered for blood glucose was not accepted by the server. Please try again.", logoURL: "../clinician_dashboard" })
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
                return res.render('error_page', { buttonURL: req.header('Referer'), buttonText: "Go Back", errorHeading: "Invalid data error", errorText: "The data entered for weight was not accepted by the server. Please try again.", logoURL: "../clinician_dashboard" })
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
                return res.render('error_page', { buttonURL: req.header('Referer'), buttonText: "Go Back", errorHeading: "Invalid data error", errorText: "The data entered for exercise (steps) was not accepted by the server. Please try again.", logoURL: "../clinician_dashboard" })
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
                return res.render('error_page', { buttonURL: req.header('Referer'), buttonText: "Go Back", errorHeading: "Invalid data error", errorText: "The data entered for insulin (doses) was not accepted by the server. Please try again.", logoURL: "../clinician_dashboard" })
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
})



// TODO: MOVE THIS TO THE PATIENT ROUTER AND ADD FIRSTNAME/LASTNAME TO REGISTRATION PAGE
const User = require('./models/user');
app.post('/register', (req, res) => {
    if (req.body.password != req.body.password2) { return; }
    User.create({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.fname,
        lastName: req.body.lname,
        secret: 'INFO30005',

        // Set permissions and default values for safety thresholds - these can be modified by the clinician
        threshold_bg: { prescribed: true, lower: 4.0, upper: 7.8 },
        threshold_weight: { prescribed: true, lower: 0, upper: 1000 },
        threshold_exercise: { prescribed: true, lower: 0, upper: 10000 },
        threshold_insulin: { prescribed: true, lower: 0, upper: 10 }

    }, (err) => {
        if (err) { console.log(err); return; }
        console.log('User inserted')
    })
    res.render('login_page', { layout: 'main2' })
})


// **** Main server code that launches the server ****  
app.listen(process.env.PORT || PORT, () => {
    console.log('Diabetes@Home is running! CTRL + Click the URL below to open a browser window. Press CTRL + C to shut down the server.')
    console.log('http://127.0.0.1:' + PORT + '/' + '\n')
})
