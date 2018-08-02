'use strict';

var express = require('express');

var Books = require('../models').Books;
var Loans = require('../models').Loans;
var Patrons = require('../models').Patrons;

var router = express.Router();


router.get('/', function(req, res, next) {
	Patrons.findAll().then(function(patrons) {
		res.render('patrons/all_patrons', {
			patrons: patrons
		});
	});
});


router.get('/new', function(req, res, next) {
	res.render('patrons/new_patron', {patron : Patrons.build()});
});

router.post('/', function(req, res, next) {
	Patrons.create(req.body).then(function(patron) {
		res.redirect('/patrons');
	}).catch(function(err) {
		if(err.name === "SequelizeValidationError") {
			res.render('patrons/new_patron', {
				patron: Patrons.build(req.body),
				errors: err.errors
			});
		} else {
			throw err;
		}
	});
});


router.get('/:id', function(req, res, next) {
	Patrons.findById(req.params.id).then(function(patron) {
		Loans.belongsTo(Books, {foreignKey: 'book_id'});
		Loans.belongsTo(Patrons, {foreignKey: 'patron_id'});
		Loans.findAll({
			include: [
					  {model: Books,required: true}, 
					  {model: Patrons,required: true}
			],
			where: {
				patron_id: req.params.id
			}
		}).then(function(data) {
			res.render('patrons/patron_detail', {patron: patron, loans: data});
		}).catch(function(err) {
    		res.sendStatus(500);
  		});
		
	});
});


router.put('/:id', function(req, res, next) {
	Patrons.findById(req.params.id).then(function(patron) {
		return patron.update(req.body);
	}).then(function() {
		res.redirect('/patrons');
	}).catch(function(err) {
		if(err.name === "SequelizeValidationError") {
			Loans.belongsTo(Books, {foreignKey: 'book_id'});
			Loans.belongsTo(Patrons, {foreignKey: 'patron_id'});
			Loans.findAll({
				include: [
					{model: Books,required: true}, 
					{model: Patrons,required: true}
				],
				where: {
					patron_id: req.params.id
				}
			}).then(function(data) {
				req.body.id = req.params.id;
				res.render('patrons/patron_detail', {
					patron: req.body, 
					loans: data,
					errors: err.errors
				});
			}).catch(function(err) {
    			res.sendStatus(500);
  			}); 
		} else {
			throw err;
		} 
	});
});
module.exports = router;