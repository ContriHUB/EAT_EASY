require("dotenv").config(); // Load environment variables

const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const REDIRECT_URI = "https://developers.google.com/oauthplayground";

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  REDIRECT_URI
);

// Log the environment variables for debugging
console.log("CLIENT_ID:", process.env.CLIENT_ID);
console.log("CLIENT_SECRET:", process.env.CLIENT_SECRET);
console.log("REFRESH_TOKEN:", process.env.REFRESH_TOKEN);

const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

if (!REFRESH_TOKEN) {
  throw new Error("REFRESH_TOKEN is not defined in the environment variables.");
}

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
console.log("oAuth2Client credentials set");

exports.mailSender = async (email, title, body) => {
  try {
    console.log("Before fetching access tokens");
    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: "gmail",
      port: 465,
      secure: true,
      auth: {
        type: "OAuth2",
        user: "sundram.smn@gmail.com", // Ensure this is your email
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: "sundram.smn@gmail.com",
      to: email,
      subject: title,
      html: body,
    };

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error("Error sending email:", error);
    return error; // Consider throwing the error instead of returning it for better error handling
  }
};
