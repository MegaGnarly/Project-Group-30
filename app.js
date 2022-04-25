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

// Define where static assets live
app.use(express.static('public'))       

// Used to expose body section for POST method
app.use(bodyParser.urlencoded({ extended: false }));

// Debugging middleware that prints when a request arrives at the server 
app.use((req,res,next) => {
    console.log('Message arrived: ' + req.method + ' ' + req.path)
    next()
})


// **** Application Endpoints ****  
// Endpoint: site index
app.get('/', (req,res) => {
    // Tip: you don't need to specify the .hbs extension
    console.log('SERVER: GET homepage')
    res.render('about_diabetes.hbs', {layout: 'main2'})
})

// Set some test routes. 
// TODO: We should move these to the routes folder.
app.get('/about_diabetes', (req,res) => {
    // Tip: you don't need to specify the .hbs extension
    console.log('SERVER: GET about_diabetes')
    res.render('about_diabetes.hbs', {layout: 'main2'})
})


app.get('/about_site', (req,res) => {
    res.render('about_site.hbs', {layout: 'main2'})
})


app.get('/record_health', (req,res) => {
    res.render('record_health.hbs', {userName:"Pat", userRole: "USER"})
})

app.get('/login_page', (req,res) => {
    res.render('login_page.hbs', {layout: 'main2'})
})

app.get('/thankyou_page', (req,res) => {
    res.render('thankyou_page.hbs', {userName:"Pat", userRole: "USER"})
})


app.get('/patient_dash', (req,res) => {
    // NOTE - As per the spec sheet, names are to be hard coded for this deliverable.
    res.render('patient_dashboard.hbs', {userName:"Pat", userRole: "USER"})
})


// app.get('/try2', (req,res) => {
//     // NOTE - As per the spec sheet, names are to be hard coded for this deliverable.
//     res.render('try_clinician_dash.hbs', {userName:"Chris", userRole: "CLINICIAN"})
// })

// **** Application POSTs ****  
// POST test - when the user fills the form, update the database.
app.post('/post_values', async (req,res) => {
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

app.post('/login', async (req,res) => {
    res.redirect('patient_dash')
})

// POST test - when the user creates an account, update the database.
app.post('/post_values_user', (req,res) => {
    console.log('SERVER: New POST (acc creation)')
    let newValue = new patient({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        // Generate a random ID for the user. Ideally we should be using the ID that mongoDB generates.
        id: Math.floor(Math.random() * 1000)
    })
    newValue.save()
    res.redirect('/test/users')
})


// Code to establish the server. 
app.listen(process.env.PORT || PORT, () => {
    console.log('Diabetes@Home is running! CTRL + Click the URL below to open a browser window. Press CTRL + C to shut down the server.')
    console.log('http://127.0.0.1:' + PORT + '/' + '\n')
})

var hbs = exphbs.create({});

hbs.handlebars.registerHelper('thresholdChecker', function(num, options) {
    if(num < 4.0 || num > 7.8) {
      return options.fn(this);
    }
    return options.inverse(this);
  });