import React from 'react';
import ContactForm from '../../components/features/ContactForm';

const Contact = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-gray-900">Get in Touch</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Have a question or want to work together? Send us a message!
                    </p>
                </div>
                <ContactForm />
            </div>
        </div>
    );
};

export default Contact;
