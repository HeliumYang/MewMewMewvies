const express = require('express')
const app = express()
const port = 2999

app.use(function(req, res, next) {
  	res.header("Access-Control-Allow-Origin", "*");
  	//res.header("Access-Control-Allow-Methods", 'GET, POST, PUT, DELETE');
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'editable',
  password : 'kinda password',
  database : 'mewmewmewvies'
});

app.get('/', (req, res) => {
    let sampleObj = {connection:"test ping successful", requestQuery:req.query};
    res.send(sampleObj);
})

// everything user-related
/* Fields:
 * user_id - int
 * email - String
 * passwd - String (encrypted)
 * fname - String
 * lname - String
 * admin - boolean (tinyint)
 * phone - String
 * address_line_one - String
 * address_line_two - String
 * address_city - String
 * address_state - String
 * address_zip - String
 * user_state - boolean (tinyint)
 * promo - boolean (tinyint)
 */
app.get('/register/', (req, res) => {
	if (
		req.query.hasOwnProperty('fname') && req.query.fname != "" &&
		req.query.hasOwnProperty('lname') && req.query.lname != "" &&
		req.query.hasOwnProperty('email') && req.query.email.includes("@") && req.query.email.includes(".") &&
		req.query.hasOwnProperty('passwd') && req.query.passwd != "" &&
		req.query.hasOwnProperty('phone') && req.query.phone != ""
	) {
		connection.query("SELECT * FROM user WHERE email = ?", [req.query.email], function (error, results, fields) {
			if (results.length == 0) {
				connection.query("INSERT INTO user (fname, lname, email, passwd, phone) VALUES (?, ?, ?, ?, ?)", [req.query.fname, req.query.lname, req.query.email, req.query.passwd, req.query.phone], function (error, results, fields) {
                                	if (error) throw error;
                                	console.log('New user registered: ' + JSON.stringify(results));
                                	res.send(JSON.stringify(results));
                        	});
				
				if (req.query.hasOwnProperty('address_line_one')) {
				modifyUser('address_line_one', req.query.address_line_one, req.query.email);
				}

				if (req.query.hasOwnProperty('address_line_two')) {
                                modifyUser('address_line_two', req.query.address_line_two, req.query.email);
                                }

				if (req.query.hasOwnProperty('address_city')) {
                                modifyUser('address_city', req.query.address_line_city, req.query.email);
                                }

				if (req.query.hasOwnProperty('address_state')) {
                                modifyUser('address_state', req.query.address_state, req.query.email);
                                }

				if (req.query.hasOwnProperty('address_zip')) {
                                modifyUser('address_zip', req.query.address_zip, req.query.email);
                                }

				if (req.query.hasOwnProperty('address_promo')) {
                                modifyUser('address_promo', req.query.address_promo, req.query.email);
                                }
				
			} else {
				console.log("Signup attempted, email already in use.");
                		res.send('ERROR: Email already exists in the database.');
        		} // if
		});
	} else {
		console.log("Signup attempted, wrong parameters");
                       	res.send('ERROR: Make sure all queries are fulfilled: fname, lname, email, passwd, phone\nOptional queries: address_line_one, address_line_two, address_city, address_state, address_zip, address_promo')
               	} // if
  });

app.get("/verifylogin/", (req, res) => {
        if (req.query.hasOwnProperty('email') && req.query.hasOwnProperty('passwd')) {
		connection.query('SELECT * FROM user WHERE email = ? AND passwd = ?', [req.query.email, req.query.passwd], function (error, results, fields) {
			if (error) throw error;
			if (results.length == 0) {
				console.log("Login attempt failed, wrong credentials");
			} else {
				console.log("User logged in: " + JSON.stringify(results));
			} // if
			res.send(JSON.stringify(results));
		});		
	} else {
                res.send('ERROR: Make sure all queries are fulfilled: email, passwd')
        }
})

app.get("/updateprofile/", (req, res) => {
	if (req.query.test == 'success') {
        res.send('[{"user_id":1,"email":"test@test.com","passwd":"samplepassword","fname":"fname","lname":"lname","admin":0,"phone":"nophone","address_line_one":"","address_line_two":"","address_city":"","address_state":"","address_zip":"","user_state":0}]');
        } else if (req.query.test == 'failure') {
                res.send('1');
	} else if (req.query.hasOwnProperty('email') && req.query.hasOwnProperty('passwd')) {
		connection.query('SELECT * FROM user WHERE email = ? AND passwd = ?', [req.query.email, req.query.passwd], function (error, results, fields) {
                        if (error) throw error;
                        console.log("User logged in: " + JSON.stringify(results));
			//insert each modification
                        res.send(JSON.stringify(results));
                });
        } else {
                res.send("ERROR: Make sure all queries are fulfilled: email, passwd.\nOptional fields: newfname, newlname, newpasswd, newadmin, newphone, newaddressone, newaddresstwo, newcity, newstate, newzip, newuserstate");
        }

})

app.get('/getMewvies/', (req, res) => {
    res.send('list of movies')
  })

app.listen(port, () => {
  console.log(`MewMewBackend listening on port ${port}`)
  initSQL();
})

// External connections (MySQL, email server)

function initSQL() {
connection.connect();

connection.query('SELECT * FROM ??', ['user'], function (error, results, fields) {
  if (error) throw error;

  console.log('Here is a list of all current users: ' + JSON.stringify(results));
});

//connection.end();
} // initSQL

function modifyUser(type, newEntry, email) {
	connection.query("UPDATE user SET " + type + " = ? WHERE email = ?", [newEntry, email], function (error, results, fields) {
                                        if (error) throw error;
					console.log(type + " was modified for " + email + ":");
                                        console.log(results);
                                        });
} //modifyUser


function sendEmail(address, title, message) {
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 587,
    secure: false,
  auth: {
    user: 'mewvies@zohomail.com',
    pass: 'GMaApls4050'
  }
});
var emailBody = {
  from: 'mewvies@zohomail.com',
  to: address, //change who the to address per the db
  subject: title,
  text: message
};
transporter.sendMail(emailBody, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
} // sendEmail

