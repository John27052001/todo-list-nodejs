const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const Task = require('./models/Task');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/todo', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files like CSS

// Show all tasks with edit and delete buttons
app.get('/', async (req, res) => {
  const tasks = await Task.find();
  let list = tasks
    .map(t => `
      <li>
        ${t.text}
        <form action="/delete/${t._id}" method="POST" style="display:inline;">
          <button type="submit">❌</button>
        </form>
        <form action="/edit/${t._id}" method="GET" style="display:inline;">
          <button type="submit">✏️</button>
        </form>
      </li>
    `)
    .join('');

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>To-Do List</title>
      <link rel="stylesheet" href="/styles.css">
    </head>
    <body>
      <h1>To-Do List</h1>
      <form method="POST" action="/add">
        <input name="task" required>
        <button>Add</button>
      </form>
      <ul>${list}</ul>
    </body>
    </html>
  `);
});

// Add a new task
app.post('/add', async (req, res) => {
  const task = new Task({ text: req.body.task });
  await task.save();
  res.redirect('/');
});

// Delete a task
app.post('/delete/:id', async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.redirect('/');
});

// Show edit form
app.get('/edit/:id', async (req, res) => {
  const task = await Task.findById(req.params.id);
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Edit Task</title>
      <link rel="stylesheet" href="/styles.css">
    </head>
    <body>
      <h1>Edit Task</h1>
      <form method="POST" action="/edit/${task._id}">
        <input name="task" value="${task.text}" required>
        <button>Update</button>
      </form>
      <p><a href="/">⬅️ Back</a></p>
    </body>
    </html>
  `);
});

// Handle edit submission
app.post('/edit/:id', async (req, res) => {
  await Task.findByIdAndUpdate(req.params.id, { text: req.body.task });
  res.redirect('/');
});

// Start the server
app.listen(3000, () => {
  console.log('✅ Server running on http://localhost:3000');
});
