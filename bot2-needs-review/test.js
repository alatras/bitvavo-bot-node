const fs = require('fs');
const path = require('path');

// Construct the path to book.json in the same directory
const filePath = path.join(__dirname, 'book.json');

// Read the file
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the file:', err);
    return;
  }
  
  try {
    // Parse the JSON data
    const bookData = JSON.parse(data);

    console.log('bids:', bookData.bids.length);
    console.log('asks:', bookData.asks.length);
    
    // Log the contents
    // console.log('Contents of book.json:');
    // console.log(bookData);
  } catch (parseError) {
    console.error('Error parsing JSON:', parseError);
  }
});