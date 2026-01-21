const express = require('express');
const { createHiringForm, getAllHiringForms } = require('../controllers/hiringFormController');

const router = express.Router();

router.route('/')
    .post(createHiringForm)
    .get(getAllHiringForms);

module.exports = router;
