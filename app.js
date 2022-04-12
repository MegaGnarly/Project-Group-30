// Import express and set server port
const express = require('express');
const app = express();
const PORT = 8080;
const exphbs = require('express-handlebars')

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


// Tells the app to send the string: "Our demo app is working!" when you hit the '/' endpoint.
app.get('/', (req,res) => {
    // Tip: you don't need to specify the .hbs extension
    console.log('SERVER: GET homepage')
    res.render('about_diabetes.hbs')
})

// Set some test routes. IMPORTANT: WE SHOULD MOVE THIS TO THE ROUTES FOLDER
app.get('/about_diabetes', (req,res) => {
    // Tip: you don't need to specify the .hbs extension
    console.log('SERVER: GET about_diabetes')
    res.render('about_diabetes.hbs')
})
app.get('/about_site', (req,res) => {
    // Tip: you don't need to specify the .hbs extension
    console.log('SERVER: GET about_diabetes')
    res.render('about_site.hbs')
})


app.listen(PORT, () => {
    console.log('SERVER: app.js is listening on port ', PORT);
    console.log('http://localhost:'+ PORT + '/' + '\n')
})