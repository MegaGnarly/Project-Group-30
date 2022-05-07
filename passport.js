const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
// Hardcode user for now
const User = require('./models/user')

const bodyParser = require('body-parser')
passport.use(bodyParser.urlencoded({ extended: false }));

// Updated serialize/deserialize functions
passport.serializeUser((user, done) => {
    done(undefined, user._id)
})
passport.deserializeUser((userId, done) => {
    User.findById(userId, { password: 0 }, (err, user) => {
        if (err) {
            return done(err, undefined)
        }
        return done(undefined, user)
    })
})
// Updated LocalStrategy function
passport.use(
    new LocalStrategy((username, password, done) => {
        User.findOne({ username }, {}, {}, (err, user) => {
            if (err) {
                return done(undefined, false, {
                    message: 'Unknown error has occurred'
                })
            }
            if (!user) {
                return done(undefined, false, {
                    message: 'Incorrect username or password',
                })
            }
            // Check password
            user.verifyPassword(password, (err, valid) => {
                if (err) {
                    return done(undefined, false, {
                        message: 'Unknown error has occurred'
                    })
                }
                if (!valid) {
                    return done(undefined, false, {
                        message: 'Incorrect username or password',
                    })
                }
                // If user exists and password matches the hash in the database
                return done(undefined, user)
            })
        })
    })
)

User.find({}, (err, users) => {
    if (users.length > 1) return;
    User.create({ username: 'Pat', password: 'Pat', secret: 'Pat' }, (err) => {
        if (err) { console.log(err); return; }
        console.log('Dummy user inserted')
    })
})

module.exports = passport