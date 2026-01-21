const HiringForm = require('../models/HiringForm');

exports.createHiringForm = async (req, res, next) => {
    try {
        const hiringForm = await HiringForm.create(req.body);

        res.status(201).json({
            success: true,
            data: hiringForm
        });
    } catch (err) {
        next(err);
    }
};

exports.getAllHiringForms = async (req, res, next) => {
    try {
        const hiringForms = await HiringForm.find();

        res.status(200).json({
            success: true,
            count: hiringForms.length,
            data: hiringForms
        });
    } catch (err) {
        next(err);
    }
};
