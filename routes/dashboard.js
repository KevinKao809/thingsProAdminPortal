var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	var session = req.session;

	res.render('dashboard', {
		id: req.params.userid,
		sid: session.id
	});
});

module.exports = router;