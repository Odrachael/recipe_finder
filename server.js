require('dotenv').config(); // Load environment variables

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');
const sendRecipeEmail = require('./emailService'); // Adjust the path if needed

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Flutterwave secret key
const flutterwaveSecretKey = process.env.FLUTTERWAVE_SECRET_KEY;
const edamamApiKey = process.env.EDAMAM_API_KEY;
const edamamAppId = process.env.EDAMAM_APP_ID;

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the cart HTML file
app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cart.html'));
});

// Payment verification endpoint
app.post('/verify-payment', async (req, res) => {
    const { transaction_id, recipe, email } = req.body;

    try {
        const response = await axios.get(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {
            headers: {
                Authorization: `Bearer ${flutterwaveSecretKey}`
            }
        });

        if (response.data.status === 'success') {
            const recipeResponse = await axios.get(`https://api.edamam.com/search?q=${recipe}&app_id=${edamamAppId}&app_key=${edamamApiKey}`);
            const recipeData = recipeResponse.data.hits[0]?.recipe;

            if (recipeData) {
                // Send the recipe details to the user's email
                await sendRecipeEmail(email, recipeData);
                res.json({ status: 'success', message: 'Payment verified and recipe sent successfully.' });
            } else {
                res.json({ status: 'failed', message: 'Recipe not found.' });
            }
        } else {
            res.json({ status: 'failed', message: 'Payment verification failed.' });
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'An error occurred during payment verification.' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
