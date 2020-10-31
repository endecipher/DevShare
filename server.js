const express = require('express');
const app = express();

//Listen to an environment variable called PORT (For Heroku), else default to 5000.
const PORT = process.env.PORT || 5000;


app.get('/', (req, res)=> res.send('Api Running'));

//Want something to happenw hen it connects? Define a cb()
app.listen(PORT, ()=>console.log(`Server started on ${PORT}`));