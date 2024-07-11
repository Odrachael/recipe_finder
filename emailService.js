const nodemailer = require('nodemailer');
require('dotenv').config();

const user = process.env.EMAIL_ADDRESS;
const pass = process.env.EMAIL_PASSWORD;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: user,
        pass: pass
    }
});

async function sendRecipeEmail(to, recipe) {
    const mailOptions = {
        from: user,
        to: to,
        subject: 'Your Purchased Recipe',
        html: `
            <h3>${recipe.label}</h3>
            <img src="${recipe.image}" alt="${recipe.label}">
            <p>Calories: ${recipe.calories.toFixed(2)}</p>
            <p>Ingredients: ${recipe.ingredientLines.join(', ')}</p>
            <a href="${recipe.url}" target="_blank">Full Recipe</a>
        `
    };

    return transporter.sendMail(mailOptions);
}

module.exports = sendRecipeEmail;
