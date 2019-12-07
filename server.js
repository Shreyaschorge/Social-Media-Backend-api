const express = require('express');
const connectDB = require('./config/db');
const app = express();

//DB connection
connectDB();

// InitMiddleware
app.use(express.json({ extended: false }));

//Declaring Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
