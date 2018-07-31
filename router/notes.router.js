'use strict';

const express = require('express');
const router = express.Router();

const data = require('../db/notes');
const simDB = require('../db/simDB');  // <<== add this
const notes = simDB.initialize(data);


router.get('/notes', (req, res) => {
  if (req.query.searchTerm){
    return res.json(data.filter(element => element.title.includes(req.query.searchTerm)));
  } else {
    return res.json(data);
  }
});

router.get('/notes/:id', (req, res) => {
  
  res.json(data.find(element => element.id === parseInt(req.params.id)));
});

// Post (insert) an item
router.post('/notes', (req, res, next) => {
  console.log('Oh hellloooo!');
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
    if (item) {
      res.location(`http://${req.headers.host}/notes/${item.id}`).status(201).json(item);
    } else {
      next();
    }
  });
});

module.exports = router;