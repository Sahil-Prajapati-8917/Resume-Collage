const mongoose = require('mongoose');

const PromptSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Prompt name is required'],
        trim: true
    },
    industryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Industry',
        required: [true, 'Industry is required']
    },
    prompt: {
        type: String,
        required: [true, 'Prompt content is required']
    },
    version: {
        type: String,
        default: '1.0'
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    isSystem: {
        type: Boolean,
        default: false // true for default industry prompts that cannot be edited
    },
    usageCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Ensure one default prompt per industry
PromptSchema.pre('save', async function (next) {
    if (this.isDefault) {
        await this.constructor.updateMany(
            {
                industryId: this.industryId,
                _id: { $ne: this._id }
            },
            { isDefault: false }
        );
    }
    next();
});

module.exports = mongoose.model('Prompt', PromptSchema);
