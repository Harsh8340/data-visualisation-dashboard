const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const DataModel = require('./dashboarddatamodel');  // Adjust the path as necessary

const app = express();

// Middleware
app.use(cors());
app.use(express.json());  // To parse JSON request bodies

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {})

  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('Error connecting to MongoDB:', err));

// Utility function to validate filters
const validateFilters = (filters) => {
  const validKeys = ['region', 'country', 'endYear', 'topics', 'sector', 'pest', 'source', 'swot'];
  for (const key of Object.keys(filters)) {
    if (!validKeys.includes(key)) {
      throw new Error(`Invalid filter: ${key}`);
    }
  }
};

// API Endpoint with flexible filters and pagination
app.get('/api/data', async (req, res) => {
  try {
    const { page = 1, limit = 10, ...filters } = req.query;

    // Validate filters
    validateFilters(filters);

    // Construct filter query based on incoming filters
    const query = {};
    if (filters.region) query.region = filters.region;
    if (filters.country) query.country = filters.country;
    if (filters.endYear) query.end_year = { $gte: filters.endYear };
    if (filters.topics) query.topic = { $in: filters.topics.split(',').map(topic => topic.trim()) }; // Split and trim topics
    if (filters.sector) query.sector = filters.sector;
    if (filters.pest) query.pestle = filters.pest;
    if (filters.source) query.source = filters.source;
    if (filters.swot) query.swot = filters.swot;

    // Fetch data with validation on necessary fields
    const data = await DataModel.find(query)
      .select('end_year intensity sector topic insight url region start_year impact added published country relevance pestle source title likelihood')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await DataModel.countDocuments(query);

    // Respond with structured JSON data
    res.json({
      data,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(400).json({ error: err.message || 'Failed to fetch data' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
