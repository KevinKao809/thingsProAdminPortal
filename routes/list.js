var axios   = require('axios-jsonp-pro');
var express = require('express');
var router  = express.Router();

/* GET test users get by userid. */
router.get('/', function(req, res, next) {
	var session = req.session;

	axios.get('http://0.0.0.0:8000/admin-api/v1/tenants', {})
    .then(function(response) {
    	console.log(response.data);
    	res.render('list', {
			id: req.params.userid,
			sid: session.id,
			list: response.data
		});
    })
    .catch(function(error) {
    	console.log(error);
    })
});

module.exports = router;