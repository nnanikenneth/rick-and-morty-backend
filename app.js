const express = require('express');
const fs = require('fs')
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const rateLimit = require("express-rate-limit");
const uniqid = require('uniqid');

const app = express();
const charactersRouter = require('./routes/charactersInfo')

dotenv.config();

app.use( (req, res, next) => {
	req.id = uniqid();
	next()
})

// create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
// uncomment for logging in file log int production
// app.use(morgan('combined', { stream: accessLogStream })) 
app.use(morgan('combined'))


// Node js is using port 3000/ and when pushed to heroku it will use process.env.PORT
const port = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
app.enable("trust proxy"); 
 
const limiter = rateLimit({
  windowMs: 150 * 600 * 10000, // previously 15 minutes
  max: 10000 // increasing for testing { limit each IP to 100 requests per window }
});

// apply to all requests for DOS attacks
app.use(limiter);

app.use(express.json());

// Router
app.use(charactersRouter);

app.get("/", (req, res) => {
    res.status(200).json("Welcome");
})

app.get("*", (req, res) => {
     res.status(404).json({"error" : "404"});
})

app.listen(port, () => {
     console.info(`Server is up on port ${port}`);
});

module.exports = app;
