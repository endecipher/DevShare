const express = require('express');
const connectDB = require('./config/db');
const app = express();
//Listen to an environment variable called PORT (For Heroku), else default to 5000.
const PORT = process.env.PORT || 5000;

connectDB();

//Initialize Middleware
app.use(express.json({extended: false}));

app.get('/', (req, res)=> res.send('Api Running'));

//Define Routes (Notice first param endpoint starts with /)
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

//Want something to happenw hen it connects? Define a cb()̥
app.listen(PORT, ()=>{
    console.log(`Server started on ${PORT}`);
});