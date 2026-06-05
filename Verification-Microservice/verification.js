const http = require('node:http');

const hostname = '127.0.0.1';
const port = 3004;

const express = require('express');
const app = express();

app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))

const path = require("path");
const fs = require("fs");

// waits until the string 'verify' has been written into the txt file and then changes it to 'verified'
fs.watch('example.txt', (eventType, filename) => {
    if (eventType === 'change') {
        const data = fs.readFileSync('example.txt', 'utf8');
        if (data === 'verify') {
            fs.writeFile('example.txt', 'verified', (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Error writing to file');
                }
            });
        }
    }
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
