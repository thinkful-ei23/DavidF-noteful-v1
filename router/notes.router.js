'use strict';

const express = require('express');
const router = express.Router();
const data = require('../db/notes');
const simDB = require('../db/simDB');  // <<== add this
const notes = simDB.initialize(data);

router.use(express.json());


router.get('/', (req, res, next) => {
  const {searchTerm} = req.query;

  notes.filter(searchTerm, (err, list) => {
    err ? next(err) : res.json(list);
  });
});


router.get('/:id', (req, res, next) => {
  const id = req.params.id;
  notes.find(id, (err, item) => {
    if (err) {
      return next(err);
    }
    item ? res.json(item) : next();
  });
});  

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

  notes.update(id, updateObj, (err, item) => {
    if (err) {
      return next(err);
    }
    item ? res.json(item) : next();
  });
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

  notes.create(newItem, (err, item) => {
    if (err) {
      return next(err);
    }
    item ? res.location(`http://${req.headers.host}/notes/${item.id}`).status(201).json(item) : next();
  });
});

router.delete('/:id', (req, res, next) => {
  const id = req.params.id;
  notes.delete(id, err => {
    err ? next(err) : res.sendStatus(204);
  });
});
module.exports = router;