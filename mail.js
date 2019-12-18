const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
    "923180336524-uujqk35drt2u82f9qn9jeclgeie2ddda.apps.googleusercontent.com", // ClientID
    "7ftwvm_bD8nAPvCxMCNDhVTc", // Client Secret
    "https://developers.google.com/oauthplayground" // Redirect URL
);

oauth2Client.setCredentials({
    refresh_token: "1//04cyBaVqG5uoXCgYIARAAGAQSNwF-L9IrzzcuWO63nehRB6kiqENy-jEqrN9DPAsybZ7wi3U0JSM7N_zhvMWG6avIhDuCeZIPjFA"
});
const accessToken = oauth2Client.getAccessToken()

const smtpTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
         type: "OAuth2",
         user: "shubhammore.developer@gmail.com", 
         clientId: "923180336524-uujqk35drt2u82f9qn9jeclgeie2ddda.apps.googleusercontent.com",
         clientSecret: "7ftwvm_bD8nAPvCxMCNDhVTc",
         refreshToken: "1//04cyBaVqG5uoXCgYIARAAGAQSNwF-L9IrzzcuWO63nehRB6kiqENy-jEqrN9DPAsybZ7wi3U0JSM7N_zhvMWG6avIhDuCeZIPjFA",
         accessToken: accessToken
    }
});

const mailOptions = {
    from: "shubhammore.developer@gmail.com",
    to: "shubhammore1796@gmail.com",
    subject: "Node.js Email with Secure OAuth",
    generateTextFromHTML: true,
    html: "<b>test</b>"
};

smtpTransport.sendMail(mailOptions, (error, response) => {
    error ? console.log(error) : console.log(response);
    smtpTransport.close();
});