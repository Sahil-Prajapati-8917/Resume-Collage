const getShortlistTemplate = (candidateName, jobTitle) => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Application Update</h2>
            <p>Dear ${candidateName},</p>
            <p>We are pleased to inform you that you have been <strong>shortlisted</strong> for the position of <strong>${jobTitle}</strong>.</p>
            <p>Your profile stood out to our hiring team, and we would like to move forward with your application.</p>
            <p>Our HR team will contact you shortly regarding the next steps in the interview process.</p>
            <br>
            <p>Best regards,</p>
            <p><strong>HR Team</strong></p>
        </div>
    `;
};

const getRejectionTemplate = (candidateName, jobTitle) => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Application Update</h2>
            <p>Dear ${candidateName},</p>
            <p>Thank you for your interest in the <strong>${jobTitle}</strong> position and for taking the time to apply.</p>
            <p>After careful consideration of your application and qualifications, we have decided to move forward with other candidates who more closely match our current requirements for this role.</p>
            <p>We will keep your resume in our database and may reach out if a suitable opening arises in the future.</p>
            <p>We wish you the best in your job search.</p>
            <br>
            <p>Best regards,</p>
            <p><strong>HR Team</strong></p>
        </div>
    `;
};

module.exports = {
    getShortlistTemplate,
    getRejectionTemplate
};
