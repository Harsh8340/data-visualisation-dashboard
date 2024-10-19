const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');
const DataModel = require('./dashboarddatamodel');  // Adjust the path as necessary

// Connect to MongoDB
mongoose.connect('mongodb+srv://harshkushwaha159:RgEOdoKTGDrp7r8P@cluster0.d1taq.mongodb.net/dashboard_db?retryWrites=true&w=majority', {})
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);  // Exit the process if connection fails
  });

// Define the absolute path to the JSON file
const jsonFilePath = path.resolve(__dirname, 'dashboard_db.dashboard_data.json');

// Load and parse the JSON file
fs.readFile(jsonFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading JSON file:', err);
    mongoose.connection.close();  // Close connection on failure
    return;
  }

  try {
    // Parse the JSON data
    const jsonData = JSON.parse(data);

    // Sanitize the data (filter out invalid entries)
    const sanitizedData = jsonData
      .filter(item => item.country && item.country.trim())  // Ensure country exists and is not empty
      .map(item => {
        // Remove _id to generate new ones
        delete item._id; 
        // You can add more sanitization logic if needed here
        return item;
      });

    // Insert the sanitized data into MongoDB
    DataModel.insertMany(sanitizedData)
      .then(() => {
        console.log('Data successfully inserted');
        mongoose.connection.close();  // Close connection after success
      })
      .catch(err => {
        console.error('Error inserting data:', err);
        mongoose.connection.close();  // Close connection on error
      });
  } catch (err) {
    console.error('Error parsing JSON data:', err);
    mongoose.connection.close();  // Close connection on failure
  }
});
