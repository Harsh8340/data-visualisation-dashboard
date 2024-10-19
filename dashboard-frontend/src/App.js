import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import * as d3 from 'd3';
import './App.css';

function App() {
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('World');
  const [selectedCountry, setSelectedCountry] = useState('All Countries');
  const [selectedEndYear, setSelectedEndYear] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedPest, setSelectedPest] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [selectedSwot, setSelectedSwot] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({});
  const [showNotification, setShowNotification] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [chartType, setChartType] = useState('bar');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const fetchData = useCallback(async (page, filters) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('https://data-visualisation-dashboard-backend-u5uy.onrender.com', {
        params: { ...filters, page, limit: 10 },
      });
      setFilteredData(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      setError('Error fetching data, please try again later.');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(page, filters);
  }, [fetchData, page, filters]);

  const applyFilters = () => {
    const newFilters = {
      region: selectedRegion !== 'World' ? selectedRegion : undefined,
      country: selectedCountry !== 'All Countries' ? selectedCountry : undefined,
      endYear: selectedEndYear || undefined,
      topics: selectedTopic || undefined,
      sector: selectedSector || undefined,
      pest: selectedPest || undefined,
      source: selectedSource || undefined,
      swot: selectedSwot || undefined,
    };
    setFilters(newFilters);
    setPage(1);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  return (
    <div className="container">
      <h1>Data Visualization Dashboard</h1>

      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === 'light' ? (
          <span role="img" aria-label="dark-mode">🌙</span>
        ) : (
          <span role="img" aria-label="light-mode">☀️</span>
        )}
      </button>

      {loading && <p>Loading data...</p>}
      {error && <p className="error">{error}</p>}
      {showNotification && <div className="notification">Filters applied successfully!</div>}

      <div className="filters">
        <Filter label="Filter by Region:" value={selectedRegion} onChange={setSelectedRegion} options={["World", "Northern America", "Central America", "Western Asia"]} />
        <Filter label="Filter by Country:" value={selectedCountry} onChange={setSelectedCountry} options={["All Countries", "United States of America", "Mexico", "Nigeria"]} />
        <FilterInput label="End Year:" value={selectedEndYear} onChange={setSelectedEndYear} />
        <FilterInput label="Topics:" value={selectedTopic} onChange={setSelectedTopic} />
        <FilterInput label="Sector:" value={selectedSector} onChange={setSelectedSector} />
        <FilterInput label="PEST:" value={selectedPest} onChange={setSelectedPest} />
        <FilterInput label="Source:" value={selectedSource} onChange={setSelectedSource} />
        <FilterInput label="SWOT:" value={selectedSwot} onChange={setSelectedSwot} />
        <button onClick={applyFilters}>Apply Filters</button>
      </div>

      <div className="chart-controls">
        <button onClick={() => setChartType('bar')}>Bar Chart</button>
        <button style={{ marginLeft: '10px', marginRight: '10px' }} onClick={() => setChartType('pie')}>Pie Chart</button>
      </div>

      <div className="chart-container">
        <Visualization data={filteredData} chartType={chartType} />
      </div>

      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
        <span>Page {page} of {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}

// Filter Component for dropdowns
function Filter({ label, value, onChange, options }) {
  return (
    <div>
      <label>{label}</label>
      <select onChange={(e) => onChange(e.target.value)} value={value}>
        {options.map((option, index) => (
          <option value={option} key={index}>{option}</option>
        ))}
      </select>
    </div>
  );
}

// FilterInput Component for text inputs
function FilterInput({ label, value, onChange }) {
  return (
    <div>
      <label>{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

// Visualization Component with D3
function Visualization({ data, chartType }) {
  useEffect(() => {
    const svg = d3.select('#chart');
    svg.selectAll('*').remove(); // Clear previous chart

    const margin = { top: 40, right: 20, bottom: 60, left: 80 };
    const width = 960 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    svg.attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Create tooltip div
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background', 'white')
      .style('border', '1px solid #ccc')
      .style('padding', '5px')
      .style('border-radius', '5px');

    if (chartType === 'bar') {
      const x = d3.scaleBand().range([0, width]).padding(0.1);
      const y = d3.scaleLinear().range([height, 0]);

      x.domain(data.map(d => d.country || 'No Country'));
      y.domain([0, d3.max(data, d => d.intensity)]);

      g.append('g')
        .attr('class', 'axis axis-x')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .append('text')
        .attr('y', 50)
        .attr('x', width / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', 'black')
        .text('Country');

      g.append('g')
        .attr('class', 'axis axis-y')
        .call(d3.axisLeft(y))
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -50)
        .attr('x', -height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', 'black')
        .text('Intensity');

      const bars = g.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.country || 'No Country'))
        .attr('y', d => y(d.intensity))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(d.intensity))
        .attr('fill', 'steelblue')
        .on('mouseover', function (event, d) {
          d3.select(this).attr('fill', 'green');
          tooltip.transition().duration(200).style('opacity', 0.9);
          tooltip.html(`<strong>Country:</strong> ${d.country || 'No Country'}<br><strong>Intensity:</strong> ${d.intensity}<br><em>(Intensity indicates the level of impact)</em>`)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 28}px`);
        })
        .on('mouseout', function () {
          d3.select(this).attr('fill', 'steelblue');
          tooltip.transition().duration(500).style('opacity', 0);
        });

      bars.exit().remove();

    } else if (chartType === 'pie') {
      const radius = Math.min(width, height) / 2;
      const color = d3.scaleOrdinal(d3.schemeCategory10);
      const pie = d3.pie().value(d => d.intensity);
      const arc = d3.arc().innerRadius(0).outerRadius(radius);

      const arcs = g.selectAll('.arc')
        .data(pie(data))
        .enter().append('g')
        .attr('class', 'arc')
        .attr('transform', `translate(${width / 2}, ${height / 2})`);

      arcs.append('path')
        .attr('d', arc)
        .style('fill', (d, i) => color(i))
        .on('mouseover', function (event, d) {
          tooltip.transition().duration(200).style('opacity', 0.9);
          tooltip.html(`<strong>Country:</strong> ${data[d.index].country || 'No Country'}<br><strong>Intensity:</strong> ${d.data.intensity}`)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 28}px`);
        })
        .on('mouseout', function () {
          tooltip.transition().duration(500).style('opacity', 0);
        });

      // Adjust the label positioning for better clarity
      arcs.append('text')
        .attr('transform', d => {
          const centroid = arc.centroid(d);
          // Position labels slightly outside the arcs
          const x = centroid[0] * 1.5; // Adjust multiplier for distance
          const y = centroid[1] * 1.5; // Adjust multiplier for distance
          return `translate(${x}, ${y})`;
        })
        .attr('dy', '.35em')
        .attr('text-anchor', 'middle')
        .text(d => data[d.index].country || 'No Country')
        .style('font-size', '12px')
        .style('fill', 'black');

      // Cleanup tooltip on component unmount
      return () => {
        tooltip.remove();
      };

    }

  }, [data, chartType]);

  return (
    <svg id="chart"></svg>
  );
}


export default App;
