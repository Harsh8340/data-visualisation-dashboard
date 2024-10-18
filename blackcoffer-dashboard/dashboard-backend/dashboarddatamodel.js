const mongoose = require('mongoose');

// Define schema
const DataSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true,  // Country field is required
  },
  intensity: {
    type: Number,
    min: 0,  // Ensure intensity is a non-negative number
  },
  likelihood: {
    type: Number,
    min: 0,  // Ensure likelihood is a non-negative number
  },
  relevance: {
    type: Number,
    min: 0,  // Ensure relevance is a non-negative number
  },
  region: String,
  city: String,
  end_year: {
    type: Number,
    min: 0,  // Ensure end_year is a non-negative number
  },
  topics: [String],  // Array of strings for topics
  sector: String,
  pestle: String,
  source: String,
  swot: String,
}, {
  timestamps: true,  // Add timestamps for createdAt and updatedAt fields
});

// Export the model
module.exports = mongoose.model('DataModel', DataSchema);
