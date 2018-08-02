var express = require('express');
var router = express.Router();

var Books = require('../models').Books;
var Loans = require('../models').Loans;
var Patrons = require('../models').Patrons;
var Sequelize = require("sequelize");
const Op = Sequelize.Op;

router.get('/', function(req, res, next) {

	var filter = req.query.filter;
	var searchTitle = req.query.searchTitle;

	if(filter === 'overdue') {
		Loans.belongsTo(Books, {foreignKey: 'book_id'});

		Loans.findAll({
			where: {
				returned_on: null, 
				return_by: {
					[Op.lt]: new Date()
				}
			},
			include: [{model: Books, required: true}]
		}).then(function(loans) {
			res.render('books/overdue_books', {loans: loans});
		}).catch(function(err) {
    		res.sendStatus(500);
  		});

	} else if(filter === 'checked_out') {
		Loans.belongsTo(Books, {foreignKey: 'book_id'});
		Loans.findAll({
			where: {returned_on: null},
			include: [{model: Books, required: true}]
		}).then(function(loans) {
			res.render('books/checked_books', {loans: loans});
		}).catch(function(err) {
    		res.sendStatus(500);
  		});
	} else if(searchTitle !== undefined ) {
		Books.findAll({
			where: {
				[Op.or]: [
					{
						title: {
							[Op.like]: '%' + searchTitle + '%'
						}
					}
				]
			}
		}).then(function(books) {
			res.render('books/all_books', {books : books});
		}).catch(function(err) {
    		res.sendStatus(500);
  		});

	} else {
		Books.findAll().then(function(books) {
			res.render('books/all_books', {books : books});
		}).catch(function(err) {
    		res.sendStatus(500);
  		});
	}
});

// GET /books/new - New Book
router.get('/new', function(req, res, next) {
	res.render('books/new_book', {book: Books.build()});
});

// POST /books - Create New Book
router.post('/', function(req, res, next) {
	Books.create(req.body).then(function(book) {
		res.redirect('/books');
	}).catch(function(err) {
		if(err.name === "SequelizeValidationError") {
			res.render('books/new_book', {
				book: Books.build(req.body),
				errors: err.errors
			});
		} else {
			throw err;
		}
	}).catch(function(err) {
		res.sendStatus(500);
	})
});

router.get('/:id', function(req, res, next) {

		/*
		 * SELECT * FROM BOOKS WHERE ID = REQ.PARAMS.ID;
		 */
	Books.findById(req.params.id).then(function(book) {
		Loans.belongsTo(Books, {foreignKey: 'book_id'});
		Loans.belongsTo(Patrons, {foreignKey: 'patron_id'});
		Loans.findAll({
			include: [
					  {model: Books,required: true}, 
					  {model: Patrons,required: true}
					 ],
			where: {
				book_id: req.params.id
			}
		}).then(function(data) {
			res.render('books/book_detail', {book: book, loans: data});
		}).catch(function(err) {
    		res.sendStatus(500);
  		});
	});
});


router.put('/:id', function(req, res, next) {
	
	Books.findById(req.params.id).then(function(book) {
		return book.update(req.body);
	}).then(function() {
		res.redirect('/books');
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
					book_id: req.params.id
				}
			}).then(function(data) {
		
				req.body.id = req.params.id;
				res.render('books/book_detail', {
					book: req.body, 
					loans: data,
					errors: err.errors
				});  
			}).catch(function(err) {
    			res.sendStatus(500);
  			});
		} else {
			throw err;
		}

	}).catch(function(err) {
		res.sendStatus(500);
	});
});

module.exports = router;