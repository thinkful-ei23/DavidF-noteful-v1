'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Reality check', function() {
  it('true should be true', function() {
    expect(true).to.be.true;
  });

  it('2 + 2 should equal 4', function() {
    expect(2 + 2).to.equal(4);
  });
});

describe('Express static', function() {
  it('GET request "/" should return the index page', function() {
    return chai
      .request(app)
      .get('/')
      .then(function(res) {
        expect(res).to.exist;
        expect(res).to.have.status(200);
        expect(res).to.be.html;
      });
  });
});

describe('404 handler', function() {
  it('should respond with 404 when given a bad path', function() {
    return chai
      .request(app)
      .get('/DOES/NOT/EXIST')
      .then(res => {
        expect(res).to.have.status(404);
      });
  });
});

describe('Get /api/notes', function() {
  it('should return the default of 10 notes as an array', function() {
    return chai
      .request(app)
      .get('/api/notes')
      .then(res => {
        expect(res.body).to.exist;
        expect(res.body)
          .to.be.an('array')
          .to.have.lengthOf(10);
      });
  });
  it('should return array of objects with id, title, and content', function() {
    return chai
      .request(app)
      .get('/api/notes')
      .then(res => {
        res.body.forEach(note => {
          expect(note).has.keys('id', 'title', 'content');
        });
      });
  });
  it('should return correct search results for a valid query', function() {
    return chai
      .request(app)
      .get('/api/notes?searchTerm=about%20cats')
      .then(res => {
        res.body.forEach(note => {
          expect(note.title).to.include('about cats');
        });
      });
  });
  it('should return an empty array for an incorrect query', function() {
    return chai
      .request(app)
      .get('/api/notes?searchTerm=Invalid%20Search')
      .then(res => {
        expect(res.body.length).to.equal(0);
      });
  });
});

describe('GET/api/notes/:id', function() {
  it('should return correct note object with id, title, content', function() {
    return chai
      .request(app)
      .get('/api/notes/1003')
      .then(res => {
        expect(res.body)
          .to.be.an('object')
          .to.have.keys('id', 'title', 'content');
        expect(res.body.id).to.equal(1003);
      });
  });
  it('should respond with a 404 for an invalid id', function() {
    return chai
      .request(app)
      .get('/api/notes/1840')
      .then(res => {
        expect(res).to.have.status(404);
      });
  });
});

describe('Post/api/notes', function() {
  it('should create and return a new item with location header when provided valid data', function() {
    const newItem = {
      title: 'Test post',
      content: 'Test content'
    };
    return chai
      .request(app)
      .post('/api/notes')
      .send(newItem)
      .then(res => {
        expect(res).to.be.status(201);
        expect(res.body.title).to.equal(newItem.title);
        expect(res).to.have.header('location');
      });
  });
  it('should return an object with a message property "Missing title in the request body" when missing "title" field', function() {
    const newItem = {
      content: 'Missing a title'
    };
    return chai
      .request(app)
      .post('/api/notes')
      .send(newItem)
      .then(res => {
        expect(res).to.be.status(400);
        expect(res.body).to.be.an('object');
        expect(res.body.message).to.equal('Missing `title` in request body');
      });
  });
});

describe('PUT /api/notes/:id', function() {
  it('should update and return a note object when given valid data', function() {
    const updatedItem = {
      title: 'I\'ve been updated',
      content: 'Updated content'
    };
    return chai
      .request(app)
      .put('/api/notes/1000')
      .send(updatedItem)
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body).to.include.keys('id', 'title', 'content');
        expect(res.body.id).to.equal(1000);
        expect(res.body.title).to.equal(updatedItem.title);
        expect(res.body.content).to.equal(updatedItem.content);
      });
  });
  it('should respond with a 404 for an invalid id', function() {
    const updatedItem = {
      title: 'I\'ve been updated',
      content: 'Updated content'
    };
    return chai
      .request(app)
      .put('/api/notes/1851')
      .send(updatedItem)
      .then(res => {
        expect(res).has.status(404);
      });
  });
  it('should return an object with a message property "Missing title in request body" when missing the "title" field', function() {
    const updatedItem = {
      content: 'Updated content'
    };
    return chai
      .request(app)
      .put('/api/notes/1000')
      .send(updatedItem)
      .then(res => {
        expect(res).to.have.status(400);
        expect(res.body).to.be.an('object');
        expect(res.body.message).to.equal('Missing `title` in request body');
      });
  });
});

describe('DELETE /api/notes/:id', function() {
  it('should delete an item by id', function() {
    return chai
      .request(app)
      .delete('/api/notes/1000')
      .then(res => {
        expect(res).to.have.status(204);
      });
  });
});
