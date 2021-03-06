const express = require('express')

/* CORS */
const cors = require('cors')

/* Body Parser */
const bodyParser = require('body-parser');
const multer = require('multer');

/* Logger */
const logger = require('morgan');
const winston = require('winston');

/* Utils */
const path = require('path')
const favicon = require('serve-favicon')
const compression = require('compression')
const util = require('util')
const uuidv4 = require('uuid/v4');

/* Session & Cookies */
const cookieParser = require('cookie-parser')
const session = require('express-session');

/* method-override: Override HTTP verbs. */
var methodOverride = require('method-override')

// Application
const app = express()

// Console
var colors = require('colors');

// JSONP
var axios = require('axios-jsonp-pro');

/**
 * Template Engine (EasyTemplatJS)
 */
var fs = require('fs')
var Et = require('easytemplatejs');
Et.enableScript = true; // enable <etj-script>
Et.enableStyle = true; // enable <etj-style>
//var cache = true;  // Use Cache?
var cache = process.env.NODE_ENV == 'production'; // Use Cache?
var cacheTpl = {}; 
app.engine('etj', function(filePath, data, callback) {
	fs.readFile(filePath, function(err, content) {
		if(err) return callback(err)
		var compiled;
		if(cache) {
			if(!cacheTpl[filePath]) {
				cacheTpl[filePath] = Et.template(content);
			}
			compiled = cacheTpl[filePath];
		} else {
			compiled = Et.template(content);
		}
		var rendered = compiled(data);
		return callback(null, rendered)
	})
})
app.set('views', './views') 
app.set('view engine', 'etj') 

// Logging
winston.level = 'debug'; // Winston logging level: error, warn, info, verbose, debug
app.use(logger('dev')); // Morgan logging level: combined, common, dev, short, tiny

app.use(compression()) // Compress
app.use(cors()) // CORS
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico'))) // favicon
app.use(cookieParser()) // Cookies
app.use('/static', express.static('public')) // static

// Memory Session temporary
/*
Warning: connect.session() MemoryStore is not
designed for a production environment, as it will leak
memory, and will not scale past a single process.
!!!Please use Redis Session presists!!!
*/
app.use(session({
	secret: 'se3r4t', 
	name: 'nsessionId', 
	resave: true, 
	rolling: true, 
	saveUninitialized: true, 
	cookie: {
		httpOnly: true,
		maxAge: 1000*60*30 
	}
}));
 
/* Body Parser */
app.use(bodyParser.json({type: 'application/*+json'}))
app.use(bodyParser.raw({type: 'application/vnd.custom-type'}))
app.use(bodyParser.text({type: 'text/html'}))
app.use(bodyParser.urlencoded({ extended: false }));  // create application/x-www-form-urlencoded parser  
app.use(bodyParser.json());  // create application/json parser 

/* Override HTTP verbs. */
// Support HTTP verbs request in form POST parmas `_method`
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}))

/* Router */
var login     = require('./routes/login');
var activate  = require('./routes/activate');
var dashboard = require('./routes/dashboard');
var list      = require('./routes/list');
var tenant    = require('./routes/tenant');

app.use('/', login);
app.use('/activate', activate);
app.use('/dashboard', dashboard);
app.use('/list', list);
app.use('/tenant', tenant);

app.post('/auth', function(req, res){
    console.log('req: ' + util.inspect(req.body));

    var data = {
    	"email" : req.body.email,
    	"password" : req.body.password
    }
    
    axios.post('http://0.0.0.0:8000/admin-api/v1/login', data)
    .then(function(response) {
    	console.log(response);
    	res.redirect(303, '/dashboard');
    })
    .catch(function(error) {
    	console.log(error);
    })
});

/* Exception Handler*/

// 404
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// Server Exception

app.use(function(err, req, res, next) {
	if(res.headersSent) {
		return next(err)
	}
	res.locals.msg = err.message;
	res.locals.err = process.env.NODE_ENV != 'production' ? err : {};
	err.status = err.status || 500;
	res.status(err.status);
	res.render('error');
});

/**
 * Start Server
 */
const PORT = 80;
app.listen(PORT, function() {
	console.log('')
	console.log(`=================================================`.yellow)
	console.log(`ThingsPro Admin Portal listening on port `+`${PORT}`.bgGreen+'!')
	console.log('')
	console.log(`process.env.NODE_ENV: `.cyan+(process.env.NODE_ENV||"").bold.bgGreen);
	console.log(`EasyTemplate Engine cache: `.cyan+(cache?'enabled':'disabled').bold.bgGreen);
	console.log('')
	console.log(`http://127.0.0.1`.green)
	console.log(`=================================================`.yellow)
	console.log('')
})

// Promise unhandled exception
process.on('unhandledRejection', (reason, p) => {
    console.log("Unhandled Rejection at: Promise ", p, " reason: ", reason);
});