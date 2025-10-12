const express = require('express');
const app = express();
const port = 3000;

// This line is essential. It allows our server to read the JSON data you send.
app.use(express.json());

// We create a route that ONLY listens for POST requests at the URL '/test'.
app.post('/test', (req, res) => {
  
  // Log the data we received to the terminal so we can see it.
  console.log('Data received from client:', req.body);
  
  // Get the message from the data.
  const messageFromClient = req.body.message;

  // Send a response back to the client confirming what we received.
  res.status(200).json({ 
    status: 'Success!',
    message_I_received: messageFromClient 
  });
});

// Start the server.
app.listen(port, () => {
  console.log(`🚀 Test server is listening at http://localhost:${port}`);
});
