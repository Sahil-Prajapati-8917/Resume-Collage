const nodemailer = require('nodemailer');

// Create reusable transporter object using the default SMTP transport
const createTransporter = async () => {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
        },
    });

    return transporter;
};

const sendEmail = async (to, subject, html) => {
    try {
        const transporter = await createTransporter();

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: '"HR System" <hr@example.com>', // sender address
            to: to, // list of receivers
            subject: subject, // Subject line
            html: html, // html body
        });

        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        return null; // Don't crash the app if email fails
    }
};

const sendShortlistEmail = async (candidateName, candidateEmail, jobTitle) => {
    const subject = `Update on your application for ${jobTitle}`;
    const html = `
        <p>Dear ${candidateName},</p>
        <p>We are pleased to inform you that you have been shortlisted for the position of <strong>${jobTitle}</strong>.</p>
        <p>Our HR team will contact you shortly regarding the next steps.</p>
        <br>
        <p>Best regards,</p>
        <p>HR Team</p>
    `;
    return await sendEmail(candidateEmail, subject, html);
};

const sendRejectionEmail = async (candidateName, candidateEmail, jobTitle) => {
    const subject = `Update on your application for ${jobTitle}`;
    const html = `
        <p>Dear ${candidateName},</p>
        <p>Thank you for your interest in the <strong>${jobTitle}</strong> position.</p>
        <p>After careful consideration, we have decided to move forward with other candidates who more closely match our current requirements.</p>
        <p>We wish you the best in your job search.</p>
        <br>
        <p>Best regards,</p>
        <p>HR Team</p>
    `;
    return await sendEmail(candidateEmail, subject, html);
};

module.exports = {
    sendShortlistEmail,
    sendRejectionEmail
};
