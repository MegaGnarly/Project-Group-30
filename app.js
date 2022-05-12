// Set server port and import required modules
const PORT = 3000;
const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const exphbs = require('express-handlebars');

// Load database schemas
const measuredValue = require('./models/measuredValue');
const patient = require('./models/patient')
require('./models')

const flash = require('express-flash')
const session = require('express-session')

// link to our routers
const appRouter = require('./routes/appRouter')                 // Handle general routes (e.g. about_site)
const patientRouter = require('./routes/patientRouter')         // Handle patient routes (e.g. record_health)
const clinicianRouter = require('./routes/clinicianRouter.js')  // Handle clinician routes (e.g. clinician_dashboard)

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
app.get('/record_health', isAuthenticated, (req, res) => {
    res.render('record_health.hbs', { logoURL: "../patient_dashboard", user: req.user.toJSON() })
})

// Sahil - I commented this out because it seemed redundant (we already have /login in auth.js)
// app.get('/login_page', (req, res) => {
//     res.render('login_page.hbs', { layout: 'main2' })
// })

app.get('/thankyou_page', (req, res) => {
    res.render('thankyou_page.hbs', { user: req.user.toJSON(), logoURL: "../patient_dashboard" })
})

app.get('/leaderboard', (req, res) => {
    res.render('leaderboard.hbs', { user: req.user.toJSON(), logoURL: "../patient_dashboard" })
})


// **** Application POSTs ****  
// POST test - when the user fills the form, update the database.
app.post('/post_values', async (req, res) => {
    const valid_measurements = ["measured_glucose", "measured_weight", "measured_insulin", "measured_exercise"];
    const measuredType = req.body.Selector
    const valueIsEmpty = !req.body.measurement;

    // Check if the value recieved is a valid measurement type and that it is not empty.
    if ( (valid_measurements.includes(measuredType)) && (!valueIsEmpty) ) {
        console.log("DEBUG: Within measured type");

        // The old code below had a problem where new entries weren't being inserted into the database.
            // exists = await measuredValue.collection.countDocuments({ "username": req.user.username }, { limit: 1 })
            // if (!exists) {
            //     console.log("DEBUG: Within exists");
            //     let newValue = new measuredValue({
            //         username: req.user.username,
            //         dateTime: new Date().toLocaleTimeString('en-AU', { timeZone: 'Australia/Melbourne' }) + "\n" + new Date().toLocaleDateString('en-AU', { timeZone: 'Australia/Melbourne' }),
            //         measured_glucose: "-",
            //         measured_weight: "-",
            //         measured_insulin: "-",
            //         measured_exercise: "-",
            //         comment: req.body.comment
            //     })
            //     await newValue.save()
            // }
            // measuredValue.collection.updateOne({ "username": req.user.username }, { $set: { [measuredType]: req.body.measurement } })


        // New code that constructs and entry that will be inserted into the database.
        // Note that all measured values are blank for now.
        const doc = {
            username: req.user.username,
            dateTime: new Date().toLocaleTimeString('en-AU', { timeZone: 'Australia/Melbourne' }) + "\n" + new Date().toLocaleDateString('en-AU', { timeZone: 'Australia/Melbourne' }),
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

        // Insert the final entry into the database and redirect user.
        measuredValue.collection.insertOne(doc);
        console.log("DEBUG: Ran insertion")
        await res.redirect('thankyou_page')

    } else {
        console.log("POST ERROR: Health value from client is not acceptable (either invalid measurement type or empty string). Value will not be inserted into db.")
        res.redirect('record_health')
    }
})

// TODO: MOVE THIS TO THE PATIENT ROUTER AND ADD FIRSTNAME/LASTNAME TO REGISTRATION PAGE
const User = require('./models/user')
app.post('/register', (req, res) => {
    if (req.body.password != req.body.password2) { return; }
    // IMPORTANT!!!!! firstName and lastName is temporarily hardcoded because the registration page doesn't have input for these fields.
    User.create({ username: req.body.username, password: req.body.password, firstName: "John", lastName: "Doe", secret: 'INFO30005' }, (err) => {
        if (err) { console.log(err); return; }
        console.log('User inserted')
    })
    res.render('about_diabetes', { layout: 'main2' })
})

// Login - currently serves as a redirect as per the spec
// app.post('/login', async (req,res) => {
//     res.redirect('patient_dash')
// })

// Testing account registration. Not in use for this deliverable. 
// app.post('/post_values_user', (req,res) => {
//     console.log('SERVER: New POST (acc creation)')
//     let newValue = new patient({
//         firstName: req.body.firstName,
//         lastName: req.body.lastName,
//         // Generate a random ID for the user. Ideally we should be using the ID that mongoDB generates.
//         id: Math.floor(Math.random() * 1000)
//     })
//     newValue.save()
//     res.redirect('/test/users')
// })


// **** Main server code that launches the server ****  
app.listen(process.env.PORT || PORT, () => {
    console.log('Diabetes@Home is running! CTRL + Click the URL below to open a browser window. Press CTRL + C to shut down the server.')
    console.log('http://127.0.0.1:' + PORT + '/' + '\n')
})
