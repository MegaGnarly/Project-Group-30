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

// link to our routers
const appRouter = require('./routes/appRouter')
const patientRouter = require('./routes/patientRouter')
const clinicianRouter = require('./routes/clinicianRouter.js')

const flash = require('express-flash')
const session = require('express-session')

// Routing - set paths
app.use('/test', appRouter)
app.use('/patient', patientRouter)
app.use('/clinician_dashboard', clinicianRouter)

// Configure handlebars
app.engine('hbs', exphbs.engine({
    defaultlayout: 'main',
    extname: 'hbs'
}))

// Set handlebars view engine
app.set('view engine', 'hbs')

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
// Endpoint: site index
app.get('/', (req, res) => {
    console.log('SERVER: GET homepage')
    res.render('about_diabetes.hbs', { layout: 'main2' })
})

// Set some test routes. 
app.get('/about_diabetes', (req, res) => {
    console.log('SERVER: GET about_diabetes')
    res.render('about_diabetes.hbs', { layout: 'main2' })
})

app.get('/about_site', (req, res) => {
    res.render('about_site.hbs', { layout: 'main2' })
})

app.get('/record_health', (req, res) => {
    res.render('record_health.hbs', { userName: "Pat", userRole: "USER", logoURL: "../patient_dashboard" })
})

app.get('/login_page', (req, res) => {
    res.render('login_page.hbs', { layout: 'main2' })
})

app.get('/thankyou_page', (req, res) => {
    res.render('thankyou_page.hbs', { userName: "Pat", userRole: "USER", logoURL: "../patient_dashboard" })
})

// app.get('/patient_dashboard', (req, res) => {
//     // NOTE - As per the spec sheet, names are to be hard coded for this deliverable.
//     res.render('patient_dashboard.hbs', { userName: "Pat", userRole: "USER" })
// })

app.get('/register_page', (req, res) => {
    res.render('register_page.hbs', { layout: 'main2' })
})

// **** Application POSTs ****  
// POST test - when the user fills the form, update the database.
app.post('/post_values', async (req, res) => {
    // Check is BloodGlucose is Selected else do nothing
    if (req.body.Selector == "BloodGlucoseSelector") {
        let newValue = new measuredValue({
            // Hardcoded PatientName for now
            name: "Pat",
            dateTime: new Date().toLocaleTimeString('en-AU', { timeZone: 'Australia/Melbourne' }) + "\n" + new Date().toLocaleDateString('en-AU', { timeZone: 'Australia/Melbourne' }),
            measured_value: req.body.measurement,
            comment: req.body.comment
        })
        await newValue.save()
        // TODO redirect to thank you page
        await res.redirect('thankyou_page')
    } else {
        res.redirect('record_health')
    }
})


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
const authRouter = require('./routes/auth');
const user = require('./models/user');
app.use(authRouter)

//----------------------------------------------------------------------------------------------------
const User = require('./models/user')
app.post('/register', (req, res) => {
    if (req.body.password != req.body.password2) { return; }
    User.create({ username: req.body.username, password: req.body.password, secret: 'INFO30005' }, (err) => {
        if (err) { console.log(err); return; }
        console.log('User inserted')
    })
    res.render('about_diabetes', { layout: 'main2' })
})

// Login - currently serves as a redirect as per the spec
// app.post('/login', async (req,res) => {
//     res.redirect('patient_dashboard')
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
