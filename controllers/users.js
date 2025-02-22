const express = require('express')
const router = express.Router()
const db = require ('../models')

// GET /users/new -- renders a form to create a new user
router.get('/new', (req,res) => {
    res.render('users/new.ejs', {msg: null})
})


// POST /users --creates a new user and redirects to index
router.post('/', async (req, res) => {
    try {
        //try to create the user
        //TODO: hash password
        const [user, created] = await db.user.findOrCreate({
            where: { email: req.body.email},
            defaults: { password: req.body.password}
        })

        // if the user is new
        if (created) {
            //log them in by giving them cookie
            // res.cookie('cookie name', cookie data)
            //TODO: encrypt id
            res.cookie('userId', user.id)
            //redirect to the homepage (in the future this could redirect elsewhere)
            res.redirect('/')
        } else {
            //if the user was not created
            //re render the login form with a message for the user
            console.log('that email already exists')
            res.render('users/new.ejs', {msg: 'email already taken, idiot'})
        }
    } catch(err) {
        console.log(err)
    }
})


// GET /users/login -- renders a login form
router.get('/login', (req, res) => {
    res.render('users/login.ejs', {msg: null})
})


// POST /users/login -- authenticates user credentials against the database
router.post('/login', async (req, res) => {
    try {
        //look up the user in the db based on their email
        const foundUser = await db.user.findOne({
            where: {email: req.body.email}
        })
        const msg = 'bad login credentials, ur not authenticated'
        //if the user is not found -- display the login form and give them a message
        if (!foundUser) {
            console.log('email not found on login')
            res.render('users/login.ejs', {msg})
            return //do not continue with the function
        }
        
        //otherwise, check the provided password against the password in the database
        //hash the password from the req.boy and compare it to the db password
        if (foundUser.password === req.body.password) {
            //if they match -- send the user a cookie! to log them in 
            res.cookie('userId', foundUser.id)
            //TODO: redirect to profile
            res.redirect('/')
        } else {
            // if not -- render the login form with a message
            res.render('users/login.ejs', {msg})
        }
    } catch (err) {
        console.log(err)
    }
})


// GET /users/logout -- clear the cookie to log the user out
router.get('/logout', (req, res) => {
    //clear the cookie from storage
    res.clearCookie('userId')
    //redirect to root
    res.redirect('/')
})



module.exports = router