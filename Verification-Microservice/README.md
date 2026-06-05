# Verification-Microservice

## Description

The Verification Microservice is a Node.js service responsible for monitoring a shared text file and processing verification requests. When a verification request is detected, the service automatically updates the request status to indicate that it has been verified.

This microservice is designed to work independently from other services and demonstrates event-driven communication through file monitoring.

## Purpose
The purpose of this microservice is to:

* Monitor a shared text file for changes.
* Detect verification requests.
* Process requests automatically without user intervention.
* Demonstrate communication between independent services.
  
Applications that contain forms or buttons requiring security verification can send a request string to a verification text file when a user interacts with them. The verification microservice monitors this file, processes the request, and writes a response back to the file, which can then be read and used by the requesting application.

---
## How to Run

Install NPM:

```bash
npm install
```

Start the microservice:

```bash
npm start
```

The microservice will run locally at:

```text
http://localhost:3000
```
---
# How to Send Requests

To request verification, a client application must write a string to the shared text file. The verification microservice monitors this file and processes requests when it detects the expected verification string.

In the current implementation, the string:

```text
verify
```

is used to indicate that verification is being requested.

### Example Request Using JavaScript

The following Express route demonstrates how another application can send a verification request by writing the string `"verify"` to `example.txt`:

```javascript
app.post('/write-to-file', (req, res) => {
    fs.writeFile('example.txt', 'verify', (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error writing to file');
        }

        res.send('File written successfully!');
    });
});
```

### Request Flow

1. A client sends a POST request to the application's endpoint.
2. The application writes the string `"verify"` to `example.txt`.
3. The verification microservice detects the file change.
4. The microservice processes the request and updates the file with the verification result.


---

# How to RECIEVE Data from the Microservice
This microservice receives data indirectly through the shared file `example.txt`.

### Example Input

Contents of `example.txt`:

```text
verify
```

The file may be updated by another application or microservice.


Once the primary application writes into the text file, the microservice will respond by replacing what is written with a separate string.

To receive this string from the text file, you can use a JavaScript function that looks like this:

```javascript
app.get('/read-file', (req, res) => {
    fs.readFile('example.txt', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading file');
        }
        res.send(data); 
    });
});
```

### Data Returned

This microservice does not return data directly to clients. Instead, it writes the processed result back into `example.txt`.

#### Example Output

Before processing:

```text
verify
```

After processing:

```text
verified
```

Other services can then read the updated file to determine whether the verification request has been completed.


### Error Response

If the microservice encounters an error while attempting to write to the verification text file, it will return an HTTP 500 (Internal Server Error) response. This indicates that the verification request could not be processed successfully, typically due to issues such as missing file permissions, an inaccessible file, or other filesystem-related errors.

#### Example Error Response

```javascript
res.status(500).send('Error writing to file');
```

#### Example Client Output

```text
Error writing to file
```

Applications using this microservice should check for a 500 status code and handle the error appropriately, such as notifying the user, logging the failure, or retrying the request.

---
## UML Sequence Diagram

<img width="960" height="720" alt="Untitled drawing" src="https://github.com/user-attachments/assets/6d6ef80a-9b25-46d4-adc6-a379131484ac" />


