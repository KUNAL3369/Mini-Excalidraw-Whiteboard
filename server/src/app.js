const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
let shapes = [];
let pages = [
  {
    id: 'page1',
    name: 'Page 1',
    shapes: []
  }
];

// Helper functions
const generateId = () => Math.random().toString(36).substr(2, 9);

// API Routes

// Shapes endpoints
app.get('/api/shapes', (req, res) => {
  res.json(shapes);
});

app.get('/api/shapes/:id', (req, res) => {
  const { id } = req.params;
  const shape = shapes.find(s => s.id === id);
  if (!shape) {
    return res.status(404).json({ error: 'Shape not found' });
  }
  res.json(shape);
});

app.post('/api/shapes', (req, res) => {
  const shape = {
    id: generateId(),
    ...req.body,
    pageId: req.body.pageId || 'page1'
  };
  shapes.push(shape);
  res.status(201).json(shape);
});

app.put('/api/shapes/:id', (req, res) => {
  const { id } = req.params;
  const shapeIndex = shapes.findIndex(s => s.id === id);
  if (shapeIndex === -1) {
    return res.status(404).json({ error: 'Shape not found' });
  }
  shapes[shapeIndex] = { ...shapes[shapeIndex], ...req.body };
  res.json(shapes[shapeIndex]);
});

app.delete('/api/shapes/:id', (req, res) => {
  const { id } = req.params;
  const shapeIndex = shapes.findIndex(s => s.id === id);
  if (shapeIndex === -1) {
    return res.status(404).json({ error: 'Shape not found' });
  }
  shapes.splice(shapeIndex, 1);
  res.status(204).send();
});

// Pages endpoints
app.get('/api/pages', (req, res) => {
  res.json(pages);
});

app.post('/api/pages', (req, res) => {
  const page = {
    id: generateId(),
    name: req.body.name || `Page ${pages.length + 1}`,
    shapes: []
  };
  pages.push(page);
  res.status(201).json(page);
});

// Update page (e.g., rename)
app.put('/api/pages/:id', (req, res) => {
  const { id } = req.params;
  const pageIndex = pages.findIndex(p => p.id === id);
  if (pageIndex === -1) {
    return res.status(404).json({ error: 'Page not found' });
  }
  pages[pageIndex] = { ...pages[pageIndex], ...req.body };
  res.json(pages[pageIndex]);
});

app.get('/api/pages/:id/shapes', (req, res) => {
  const { id } = req.params;
  const page = pages.find(p => p.id === id);
  if (!page) {
    return res.status(404).json({ error: 'Page not found' });
  }
  const pageShapes = shapes.filter(s => s.pageId === id);
  res.json(pageShapes);
});

app.delete('/api/pages/:id', (req, res) => {
  const { id } = req.params;
  const pageIndex = pages.findIndex(p => p.id === id);
  if (pageIndex === -1) {
    return res.status(404).json({ error: 'Page not found' });
  }
  // Remove all shapes for this page
  shapes = shapes.filter(s => s.pageId !== id);
  pages.splice(pageIndex, 1);
  res.status(204).send();
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
