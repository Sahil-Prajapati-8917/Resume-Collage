const pdf = require('pdf-parse');
const fs = require('fs');

async function testPdfParse(filePath) {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        console.log('Text extracted:', data.text.substring(0, 100) + '...');
        console.log('Pages:', data.numpages);
    } catch (error) {
        console.error('Error parsing PDF:', error.message);
    }
}

// Check if a file was provided
const file = process.argv[2];
if (file) {
    testPdfParse(file);
} else {
    console.log('Please provide a path to a PDF file.');
}
