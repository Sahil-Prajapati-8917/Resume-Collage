const Contact = require('../models/Contact');
const logger = require('../utils/logger'); // Assuming logger exists based on authController

// @desc    Create new contact message
// @route   POST /api/public/contact
// @access  Public
exports.createContact = async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and message'
            });
        }

        const contact = await Contact.create({
            name,
            email,
            message
        });

        res.status(201).json({
            success: true,
            data: contact,
            message: 'Message sent successfully'
        });
    } catch (err) {
        console.error('Create contact error:', err);
        res.status(500).json({
            success: false,
            message: 'Server Error: Failed to send message',
            error: err.message
        });
    }
};

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private (Admin)
exports.getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: contacts.length,
            data: contacts
        });
    } catch (err) {
        console.error('Get contacts error:', err);
        res.status(500).json({
            success: false,
            message: 'Server Error: Failed to fetch messages',
            error: err.message
        });
    }
};

// @desc    Delete contact message
// @route   DELETE /api/contact/:id
// @access  Private (Admin)
exports.deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        await contact.deleteOne();

        res.status(200).json({
            success: true,
            data: {},
            message: 'Message deleted'
        });
    } catch (err) {
        console.error('Delete contact error:', err);
        res.status(500).json({
            success: false,
            message: 'Server Error: Failed to delete message',
            error: err.message
        });
    }
};
