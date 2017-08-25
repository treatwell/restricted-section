var path = require('path')

var express = require('express')
var passport = require('passport')
var GoogleStrategy = require('passport-google-oauth20').Strategy

var config = require('./config.json')
require('dotenv').config()
require('require-environment-variables')(['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'SESSION_SECRET', 'ALLOWED_DOMAINS'])
var allowedDomains = process.env.ALLOWED_DOMAINS.split(",").map(function(domain) { return domain.trim() })

passport.serializeUser(function(user, done) { done(null, user) })
passport.deserializeUser(function(obj, done) { done(null, obj) })

var app = express()

app.engine('html', require('ejs').renderFile)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/public'))

app.set('port', (process.env.PORT || 3000))
app.set('host', (process.env.HOSTNAME || "localhost"))
app.set('protocol', (process.env.HOSTPROTOCOL || "http"))
app.set('env', (process.env.NODE_ENV || "development"))

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${ app.get("protocol") }://${ app.get("host") }${ 
      app.get("env") == "development" ? `:${ app.get("port") }` : "" 
    }/authenticate/google/callback`
  },
  function(accessToken, refreshToken, profile, done) {
    if (allowedDomains.indexOf(profile._json.domain) > -1) {
      console.log(`${ profile.emails[0].value } just authenticated`)
      return done(null, profile)
    } else {
      return done(`Unauthorised email domain. Allowed domains are <strong>${ allowedDomains.join(", ") }</strong>`)
    }
  }
))

var logger = require('morgan')
var cookieParser = require('cookie-parser')
var session = require('express-session')

app.use(logger('dev'))
app.use(cookieParser())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // One month
}))

app.use(passport.initialize())
app.use(passport.session())

// Ensure HTTPS
app.all('*', function(req, res, next) {
  if (app.get('protocol') === "https" 
    && req.headers['x-forwarded-proto'] != 'https' && app.get("env") !== 'development') {
    res.redirect('https://' + app.get("host") + req.url)
  } else {
    next()
  }
})

app.all('*', function(req, res, next) {
  if (config.unauthenticatedPaths.indexOf(req.path) > -1) {
    next()
  } else {
    ensureAuthenticated(req, res, next)
  }
})

app.use(express.static(__dirname + '/public'))

// Application routes

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next() }
  res.status(401).redirect('/authenticate')
}

app.get('/authenticate', function(req, res) { 
  if (req.isAuthenticated()) { res.redirect('/')  }
  res.render('authenticate.html') 
})
app.get('/authenticate/logout', function(req, res) { 
  req.logout()
  res.redirect('/') 
})
app.get('/authenticate/google', passport.authenticate('google', { scope: ['profile email'] }))

app.get('/authenticate/google/callback', function(req, res, next) {
  passport.authenticate('google', function(err, user, info) {
    if (err) { 
      res.status(401).send(err);
      return next(err);
    }
    if (!user) { 
      return res.redirect('/authenticate'); 
    }
    req.logIn(user, function(err) {
      if (err) { 
        return next(err); 
      }
      res.redirect('/');
    });
  })(req, res, next);
});

app.listen(app.get('port'), function() { 
  console.log(`Listening on http://${ app.get('host') }:${ app.get('port') }`) 
})
