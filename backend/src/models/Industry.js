const mongoose = require('mongoose');

const IndustrySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Industry name is required'],
        unique: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Industry', IndustrySchema);
