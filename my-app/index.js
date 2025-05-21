const express = require('express');
const app = express();
const dotenv = require('dotenv').config();
const cors = require('cors');

app.use(cors());
app.use(express.json());


app.listen(3000, console.log('Server is running on port 3000'));