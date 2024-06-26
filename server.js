require('dotenv').config();
const {connection:sql} = require("./app/models/db.js");
const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const utils = require('./utils');

const app = express();
const port = process.env.PORT || 8000;
//const userData[] = require('./userdata');


const storage = multer.diskStorage({
  destination: function (req, file, cb){
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb){
    cb(null, file.filename + '-' + Date.now() + path.extname(file.originalname));
  }
});

// static user details
const userData = {
  userId: "789789",
  password: "1234",
  name: "Maybe Shah",
  username: "a@a.com",
  isAdmin: true
};

// enable CORS
app.use(cors());
// parse application/json
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));





// const fetch =  (req, res, next) => {

//     let query =  `SELECT * FROM categories WHERE name = ?`;
//       connection.query(query, (err, results) => {
//         if (!err) {
//           return res.status(200).json(results);
//         } else {
//           return res.status(500).json(err);
//         }
//       });
//     };

//     exports.fetch = fetch;
  




//middleware that checks if JWT token exists and verifies it if it does exist.
//In all future routes, this helps to know if the request is authenticated or not.


// app.use(function (req, res, next) {
//   // check header or url parameters or post parameters for token
//   var token = req.headers['authorization'];
//   if (!token) return next(); //if no token, continue

//   token = token.replace('Bearer ', '');
//   jwt.verify(token, process.env.JWT_SECRET, function (err, user) {
//     if (err) {
//       return res.status(401).json({
//         error: true,
//         message: "Invalid user."
//       });
//     } else {
//       req.user = user; //set the user to req so other routes can use it
//       next();
//     }
//   });
// });


// request handlers
app.get('/', (req, res) => {
  // if (!req.user) return res.status(401).json({ success: false, message: 'Invalid user to access it.' });
  res.send('Welcome to the E-commerce REST API - ');
});


const upload = multer({storage: storage});

// Combined endpoint for file upload and saving image path to the database
app.post('/upload-and-save', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { productId } = req.body; // Assuming you send productId from frontend
  
  const imagePath = req.file.path;
  console.log('image ----------- ', imagePath)

  const insertQuery = 'INSERT INTO images (product_id, path) VALUES (?, ?)'; 
  sql.query(insertQuery, [productId, imagePath], (err, res) => {
    if (err) {
      console.error('Error inserting image path:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    res.json({ message: 'Image uploaded and path saved to database' });
  });
});


// validate the user credentials
/*app.post('/users/signin', function (req, res) {
  const user = req.body.username;
  const pwd = req.body.password;

  // return 400 status if username/password is not exist
  if (!user || !pwd) {
    return res.status(400).json({
      error: true,
      message: "Username or Password required."
    });
  }


  sql.query(`SELECT * FROM users WHERE email = '${user}'`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      //result(err, null);
      return res.status(400).json({
        error: true,
        message: "Username Not Found."
      });
    }

    if (res.length) {
      console.log("found sensor: ", res[0]);
      if (user !== res[0].email || pwd !== res[0].password) {
        return res.status(401).json({
          error: true,
          message: "Username or Password is Wrong."
        });
      }
      //result(null, res[0]);
      //return;
    }

    // not found Sensor with the id
    //result({ kind: "not_found" }, null);
    return res.json({ user: res[0], token: res[0].token });
  });


  // return 401 status if the credential is not match.
  

  // generate token
  //const token = utils.generateToken(userData);
  // get basic user details
  //const userObj = utils.getCleanUser(userData);
  // return the token along with user details
  
  
});*/


// verify the token and return it if it's valid
app.get('/verifyToken', function (req, res) {
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token;
  

  if (!token) {
    return res.status(400).json({
      error: true,
      message: "Token is required."
    });
  }
  // check token that was passed by decoding token using secret
  jwt.verify(token, process.env.JWT_SECRET, function (err, user) {
    if (err) return res.status(401).json({
      error: true,
      message: "Invalid token."
    });

    // return 401 status if the userId does not match.
    {/*if (user.userId !== userData.userId) {
      return res.status(401).json({
        error: true,
        message: "Invalid user."
      });
    }
    // get basic user details
  var userObj = utils.getCleanUser(userData);*/}
    //return res.json({ user: userObj, token });
    return;
  });
});

// verify the F token and return it if it's valid
/*
app.post('/verifyFtoken', function (req, res) {
  // check header or url parameters or post parameters for token
  const token = req.body.token || req.query.token; //this is F Token from user
  const username = req.body.user.email || req.query.user.email;
  if (!token) {
    return res.status(400).json({
      error: true,
      message: "Token is required."
    });
  }
  console.log("see here");
  console.log(req.body);
    sql.query(`select token from user_token where username = '${username}'`, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
      console.log(res.length);
      if (res.length > 0) {
        // not found Sensor with the id
        console.log("DB Token is::::", res[0].token);
        if(res[0].token !== token){
          return res.status(401).json({
            error: true,
            message: "Token is invalid."
          });
        }
        
      }
      return;

    });
    
});*/
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

require("./app/routes/sensor.routes.js")(app);
app.listen(port, () => {
  console.log('Server started on: ' + port);
});
