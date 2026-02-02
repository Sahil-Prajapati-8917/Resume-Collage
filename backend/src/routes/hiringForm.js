const express = require('express');
const { createHiringForm, getAllHiringForms, getHiringForm, updateHiringForm } = require('../controllers/hiringFormController');

const router = express.Router();

router.route('/')
    .post(createHiringForm)
    .get(getAllHiringForms);

router.route('/:id')
    .get(getHiringForm) // You need to import this!
    .put(updateHiringForm); // You need to import this!

module.exports = router;
