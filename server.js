const express = require('express');
const connectDB = require('./config/db');

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

const app = express();

//DB connection
connectDB();

//Routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

app.get('/', (req, res) => res.send('Hello...!!!'));

const PORT = process.env.PORT || 9000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
