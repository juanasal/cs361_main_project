const http = require('node:http');

const hostname = '127.0.0.1';
const port = 3000;

const express = require('express');   
const app = express();  

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))

const { engine } = require('express-handlebars');
const exphbs = require('express-handlebars');     
app.engine('.hbs', engine({extname: ".hbs"}));  
app.set('view engine', '.hbs');                 

const cors = require('cors');
app.use(cors());

app.get('/', function(req, res){
    res.render('test'); 
    });

const path = require("path");
const fs = require("fs");

const httpServer = http.createServer(app);

const multer = require("multer");
const { readdir } = require('node:fs/promises');
const { readdirSync } = require('node:fs');

const handleError = (err, res) => {
  res
    .status(500)
    .contentType("text/plain")
    .end("Oops! Something went wrong!");
};

app.get('/read-file', (req, res) => {
    fs.readFile('example.txt', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading file');
        }
        res.send(data); 
    });
});

app.post('/write-to-file', (req, res) => {
    fs.writeFile('example.txt', 'verify', (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error writing to file');
        }
        res.send('File written successfully!');
    });
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
