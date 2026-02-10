const express = require('express');
const { createHiringForm, getAllHiringForms, getHiringForm, updateHiringForm, getJobApplications } = require('../controllers/hiringFormController');
const { authenticateToken: auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.route('/')
    .post(createHiringForm)
    .get(getAllHiringForms);

router.route('/:id')
    .get(getHiringForm)
    .put(updateHiringForm);

router.get('/:id/applications', getJobApplications);

module.exports = router;
