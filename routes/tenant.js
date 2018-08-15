var axios   = require('axios-jsonp-pro');
var express = require('express');
var router = express.Router();

router.get('/:id', function(req, res, next) {
	var session = req.session;

	console.log(req.params.id);

	axios.get('http://0.0.0.0:8000/admin-api/v1/tenants/' + req.params.id, {})
    .then(function(response) {
    	console.log(response.data);
    	res.render('tenant', {
			id: req.params.id,
			sid: session.id,
			tenant: response.data
		});
    })
    .catch(function(error) {
    	console.log(error);
    })
});

module.exports = router;