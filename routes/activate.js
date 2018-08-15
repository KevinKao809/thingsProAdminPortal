var axios   = require('axios-jsonp-pro');
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	console.log(req.params.tenantId);
	res.render('activate', {});
});

router.get('/:tenantId', function(req, res, next) {
	console.log(req.params.tenantId);

	axios.put('http://0.0.0.0:8000/admin-api/v1/tenants/' + req.params.tenantId + '/approve', {})
    .then(function(response) {
    	console.log(response.data);
    	res.render('activate', {});
    })
    .catch(function(error) {
    	console.log(error);
    })
});

module.exports = router;