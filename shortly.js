var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var session = require('express-session');

var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var app = express();

app.use(session({
  secret: 'keyboard cat',
}));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

//var sess;

app.get('/signup', 
function(req, res) {
  if (true) {
    res.render('signup');
  } else {
    res.render('index');
  }
});

//submit sends a post request
app.post('/signup', function(req, res) {
  //check valid inputs for un and pw
  var un = req.body.username;
  var pw = req.body.password;
  if (util.isValidSignUp(un, pw)) {
    //post to db
    new User({ username: un, password: pw }).fetch().then(function(found) {
      if (found) {
        //user exists in db, so send to homepage
        res.redirect('/');
      } else { //else not found, 
        //create new user
        Users.create({
          username: un,
          password: pw
        })
        .then(function(newUser) {
          console.log('new user added to the system');
          //res.status(200).send(newUser);
          //start session
          req.session.regenerate(function() {
            req.session.user = un;  
            //redirect to home page
            res.redirect('/');          
          });
          
        })
        .catch(function(error) {
          console.log('error adding user: ' + error);
        });
      }
    });
  } else {
      //stay on page
    console.log('either password or username are not valid. Change them/it.');
  }
   
});

app.get('/logout', function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
});

//goes to main page w/o login
app.get('/', 
function(req, res) {
  //user is not signed up or logged in
  if (!req.session.user) {
    //redirect to /login
    res.redirect('/login');
  } else {
    res.render('index');  
  }
});

//creates new link on main page
app.get('/create', 
function(req, res) {
  if (true) {
    res.redirect('/login');
  } else {
    res.render('index');  
  }
});

app.get('/login', function(req, res) {
  res.render('login');
});

//if user is not signed in, redirect to login page
app.post('/login', function(req, res) {
  var un = req.body.username;
  var pw = req.body.password;
  if (util.isValidSignUp(un, pw)) {
    //post to db
    new User({ username: un, password: pw }).fetch().then(function(found) {
      if (found) {
        req.session.regenerate(function(err) {
          if (err) {
            console.log(err);
          } else {
            req.session.user = un;
            res.redirect('/');
          }
        });
      } else {
        res.render('login');
      }
    });
  } 

  // console.log(un, pw, 'un and pw');
  // if (req.session.user) {
  //   req.session.regenerate(function(err) {
  //     if (err) {
  //       console.log('error: ', err);
  //       return;
  //     }
  //     req.session.user = un;
  //     res.redirect('/');  
  //   });
    
  // } else {
  //   res.render('login');  
  // }
});

app.get('/links', 
function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.status(200).send(links.models);
  });
});

app.post('/links', 
function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.status(200).send(found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.sendStatus(404);
        }

        Links.create({
          url: uri,
          title: title,
          baseUrl: req.headers.origin
        })
        .then(function(newLink) {
          res.status(200).send(newLink);
        });
      });
    }
  });
});



/************************************************************/
// Write your authentication routes here
/************************************************************/



/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        linkId: link.get('id')
      });

      click.save().then(function() {
        link.set('visits', link.get('visits') + 1);
        link.save().then(function() {
          return res.redirect(link.get('url'));
        });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);
