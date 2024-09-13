const axios = require('axios');

exports.parseText = async (req, res) => {
  const inputText = req.body;
  
  if (!inputText || typeof inputText !== 'object') {
    return res.status(400).json({ error: "Invalid or missing JSON data" });
  }

  try {
    // Convert the JSON object to an array of objects with 'clause' and 'section'
    const dataToSend = Object.entries(inputText).map(([section, clause]) => ({
      section,
      clause
    }));

    // Log the total amount of data and length
    console.log('Total number of items to be sent:', dataToSend.length);
    console.log('Total data size (in bytes):', JSON.stringify(dataToSend).length);

    // Send data to the database
    const sendPromises = dataToSend.map(async (item) => {
      // Ensure that item has 'clause' and 'section' properties
      if (!item.section || !item.clause) {
        throw new Error("Missing required fields: clause or section");
      }
      
      try {
        // Log each item size
        console.log(`Sending item with section "${item.section}" (size: ${JSON.stringify(item).length} bytes)`);
        
        // Send POST request to addData endpoint
        const response = await axios.post('http://localhost:3002/addData', item);
        
        // Log the response
        console.log('Successfully saved item with section:', item.section);
        console.log('Response from database:', response.data);
        
        return response;
      } catch (error) {
        // Log the error for this item
        console.error('Failed to send item with section:', item.section, 'Error:', error.message);
        throw error; // Re-throw the error to be caught by the outer try-catch
      }
    });

    const results = await Promise.allSettled(sendPromises);

    // Count successful and failed requests
    const successfulRequests = results.filter(result => result.status === 'fulfilled').length;
    const failedRequests = results.filter(result => result.status === 'rejected').length;

    console.log('Total successful requests:', successfulRequests);
    console.log('Total failed requests:', failedRequests);

    res.json({ message: "Data successfully sent to the database", successfulRequests, failedRequests });
  } catch (error) {
    console.error("Error in parseText:", error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};
