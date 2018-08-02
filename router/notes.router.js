'use strict';

const express = require('express');
const router = express.Router();
const data = require('../db/notes');
const simDB = require('../db/simDB');  // <<== add this
const notes = simDB.initialize(data);

router.use(express.json());

// Get the list filtered by searchTerm
router.get('/', (req, res, next) => {
  const {searchTerm} = req.query;

  notes.filter(searchTerm)
    .then(list => {
      list ? res.json(list) : next();
    })
    .catch(err => next(err));
});

// Get a specific item
router.get('/:id', (req, res, next) => {
  const id = req.params.id;
  notes.find(id)
    .then(item => {
      item ? res.json(item) : next();
    })
    .catch(err => next(err));
}); 

// Put (update) an item
router.put('/:id', (req, res, next) => {
  const id = req.params.id;

  /***** Never trust users - validate input *****/
  const updateObj = {};
  const updateFields = ['title', 'content'];

  updateFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  if (!updateObj.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  notes.update(id, updateObj)
    .then(item =>{
      item ? res.json(item) : next();
    })
    .catch(err => next(err));
});

// Post (insert) an item
router.post('/', (req, res, next) => {
  const { title, content } = req.body;

  const newItem = { title, content };
  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  notes.create(newItem) 
    .then(item => {
      item ? res.location(`http://${req.headers.host}/notes/${item.id}`).status(201).json(item) : next();
    })
    .catch(err => next(err));
});

//Delete (remove) an item
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;
  notes.delete(id)
    .then(id => {
      id ? res.sendStatus(204) : next();})
    .catch(err => next(err));
});


module.exports = router;