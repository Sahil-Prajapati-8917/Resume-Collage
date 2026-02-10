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
        const hiringForms = await HiringForm.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: hiringForms.length,
            data: hiringForms
        });
    } catch (err) {
        next(err);
    }
};

exports.getHiringForm = async (req, res, next) => {
    try {
        const hiringForm = await HiringForm.findById(req.params.id);
        if (!hiringForm) {
            return res.status(404).json({ success: false, message: 'Hiring Form not found' });
        }
        res.status(200).json({ success: true, data: hiringForm });
    } catch (err) {
        next(err);
    }
};

exports.updateHiringForm = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const form = await HiringForm.findById(id);
        if (!form) {
            return res.status(404).json({ success: false, message: 'Hiring Form not found' });
        }

        // Prevent industry change if locked (which is always true after creation in this logic)
        // We can check if it was previously set.
        if (form.industry && updates.industry && form.industry !== updates.industry) {
            return res.status(400).json({ success: false, message: 'Industry cannot be changed once set.' });
        }

        // Increment version
        updates.version = (form.version || 1) + 1;

        // Track edit history
        if (!updates.editHistory) updates.editHistory = [];
        // append to existing history from DB? Mongoose .create() or .findByIdAndUpdate() 
        // We are using findById then save pattern to ensure hooks/logic run if needed, but simple update is okay here too.
        // Actually, let's just push to the array.

        const changeRecord = {
            editedBy: req.user?._id,
            editedAt: new Date(),
            changes: updates
        };

        const updatedForm = await HiringForm.findByIdAndUpdate(id, {
            $set: updates,
            $push: { editHistory: changeRecord }
        }, { new: true, runValidators: true });

        res.status(200).json({
            success: true,
            data: updatedForm
        });
    } catch (err) {
        next(err);
    }
};

exports.getJobApplications = async (req, res, next) => {
    try {
        const { id } = req.params;
        const Resume = require('../models/Resume');

        // Ensure job exists
        const job = await HiringForm.findById(id);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        const applications = await Resume.find({ jobId: id }).sort({ uploadedAt: -1 });

        res.status(200).json({
            success: true,
            count: applications.length,
            data: applications
        });
    } catch (err) {
        next(err);
    }
};
