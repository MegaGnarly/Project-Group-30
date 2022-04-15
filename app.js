// Import express and set server port
const express = require('express');
const app = express();
const PORT = 3000;
const exphbs = require('express-handlebars');
const { db } = require('./models/measuredValue');
require('./models')

// Lines that configure handlebars
app.engine('hbs', exphbs.engine({
    defaultlayout: 'main',
    extname: 'hbs'
}))

app.set('view engine', 'hbs')           // Set handlebars view engine
app.use(express.static('public'))       // Define where static assets live


// Debugging middleware to log a message each time a request arrives at the server - handy for debugging
app.use((req,res,next) => {
    console.log('Message arrived: ' + req.method + ' ' + req.path)
    next()
})

// link to our router
const appRouter = require('./routes/appRouter')

// the demo routes are added to the end of the '/test' path
app.use('/test', appRouter)

// Tells the app to send the string: "Our demo app is working!" when you hit the '/' endpoint.
app.get('/', (req,res) => {
    // Tip: you don't need to specify the .hbs extension
    console.log('SERVER: GET homepage')
    res.render('about_diabetes.hbs', {layout: 'main2'})
})

// Set some test routes. IMPORTANT: WE SHOULD MOVE THIS TO THE ROUTES FOLDER
app.get('/about_diabetes', (req,res) => {
    // Tip: you don't need to specify the .hbs extension
    console.log('SERVER: GET about_diabetes')
    res.render('about_diabetes.hbs', {layout: 'main2'})
})
app.get('/about_site', (req,res) => {
    res.render('about_site.hbs', {layout: 'main2'})
})
app.get('/test_data', (req,res) => {
    res.render('test_data.hbs')
})
app.get('/patient_dash', (req,res) => {
    res.render('patient_dashboard.hbs')
})

app.post('/post_values', (req,res) => {
    console.log('POST!!!')
    db.collection('info30005-project-group-30.measuredvalues').insertOne(req.body)
})

app.listen(process.env.PORT || PORT, () => {
    console.log('Diabetes@Home is running!')
    console.log('http://127.0.0.1:' + PORT + '/' + '\n')
})

