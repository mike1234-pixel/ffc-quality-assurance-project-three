'use strict';

const expect = require('chai').expect;
const mongoose = require('mongoose');
const dotenv = require('dotenv').config({ path: '../.env'});
//connection:
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false}).then((con) => {
    console.log("DB connection successful.");
  }).catch((err) => console.log(err));
mongoose.set('debug', true);

module.exports = function (app) {

  const bookSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true
    },
    commentcount: {
      type: Number,
      required: true
    },
    comments: {
      type: Array,
      required: true
    }
  })

  const Book = mongoose.model(`books`, bookSchema);

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
        Book.find({}, null, (err, docs) => {
          if (err) {
            console.log(err);
          } else {
            res.send(docs)
          }
        })
      })
    
    .post(function (req, res){
      var title = req.body.title;

      console.log(`REQ.TITLE: ${title}`)
      if (title === "" || title === undefined) {
        res.send("missing title")
      } else {

      const newBook = new Book({
        title: title,
        commentcount: 0,
        comments: [],
      })
      newBook.save((err, savedBook) => {
        if (!err && savedBook) {
            return res.json(savedBook)
        }
      });
      }
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      Book.deleteMany({}, function(err, booksDeleted) {
        if (err) {
          console.log(err);
          res.send("could not delete at this time, please try again.")
        } else {
          res.send("complete delete successful")
        }
      })
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      Book.findById(bookid, function(err, doc) {
        if (err) {
          console.log(err)
          res.send('no book exists')
        } else {
          res.json(doc);
        }
      })
    }) 
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;

      Book.findByIdAndUpdate(bookid, {$inc:{commentcount: 1}},function(err, incrementeddoc) {
        if (err) {
          console.log(err)
        } else {
          Book.findByIdAndUpdate(bookid, {$push:{comments: comment}}, {returnOriginal: false}, function(err, pusheddoc) {
              Book.findById(bookid, function(err, finaldoc) {
                if (err) {
                  console.log(err)
                } else {
                  res.json(finaldoc)
                }
              })
          })   
        }
      })
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      console.log(bookid)
      //if successful response will be 'delete successful'
      Book.findByIdAndDelete(bookid, function(err, objectDeleted) {
        if (err) {
          console.log(err);
          res.send("sorry could not delete at this time. please try again")
        } else {
          res.send("delete successful");
        }
      })
    });
  
};
