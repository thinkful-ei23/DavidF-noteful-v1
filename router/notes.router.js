'use strict';

const express = require('express');
const router = express.Router();

const data = require('../db/notes');

// const simDB = require('./db/simDB');


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

module.exports = router;