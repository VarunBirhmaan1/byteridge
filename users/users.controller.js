const express = require('express');
const { findOne } = require('mongodb/lib/operations/collection_ops');
const router = express.Router();
const userService = require('./user.service');

// routes
router.post('/authenticate', authenticate);
router.post('/register', register);
router.get('/audit', audit)
router.get('/', getAll);
router.get('/current', getCurrent);
router.get('/:id', getById);
router.put('/:id', update);
router.delete('/:id', _delete);
router.post('/logout', logOut)

module.exports = router;

function authenticate(req, res, next) {

    userService.authenticate(req.body)
        .then(user => user ? res.json(user) : res.status(400).json({ message: 'Username or password is incorrect' }))
        .catch(err => next(err));
}

async function register(req, res, next) {
    let clientIP = req.ip
    console.log(clientIP)
    userService.create(req.body, clientIP)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function getAll(req, res, next) {
    userService.getAll()
        .then(users => res.json(users))
        .catch(err => next(err));
}

function getCurrent(req, res, next) {
    userService.getById(req.user.sub)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function getById(req, res, next) {
    userService.getById(req.params.id)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function update(req, res, next) {
    userService.update(req.params.id, req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function _delete(req, res, next) {
    userService.delete(req.params.id)
        .then(() => res.json({}))
        .catch(err => next(err));
}

async function audit(req, res, next) {
    userService.audit(req.query.username).then(user => user ? res.json(user) : res.status(401).json({ message: ' User not valid' }))
        .catch(err => next(err));
}

function logOut(req, res, next) {
    userService.logout(req.body.username, req.body.loginID).then(user => user ? res.json(user) : res.status(400).json({ message: 'logout unsuccessful' }))
        .catch(err => next(err));
}