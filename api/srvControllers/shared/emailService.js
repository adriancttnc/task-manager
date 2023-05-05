/**
 * Helper file that facilitates the email sending process.
 * Designed to store the logic and the default values.
 */

const nodemailer = require('nodemailer');
const config = require('../../config');
const _ = require('underscore');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

// Ensure that we have SMTP details set.
_.each(config.smtp, (value, key) => {
  if (value === '' || typeof value === 'undefined')
    throw new Error(`${key} is not set!`);
});

let transporter  = nodemailer.createTransport({
  host: config.smtp.server,
  port: config.smtp.port,
  secure: false,
  service: config.smtp.service || '',
  auth: {
    type: (config.oAuth2.enabled === 'true')? 'OAuth2' : 'login',
    user: config.smtp.username,
    pass: config.smtp.password,
  },
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Nodemailer: Server ready to take our emails: ", success);
  }
});

async function send(emailObj) {
  // Get the directory of the server.
  const __dirname = path.resolve();
  // Build the filePath for our template.
  const filePath = path.join(__dirname, `/srvControllers/assets/html/${emailObj.htmlTemplate}.html`);
  // Load the template in memory.
  const source = fs.readFileSync(filePath, 'utf-8').toString();
  // Use Handlebars.js to compile the html file.
  const template = handlebars.compile(source);
  // Replace the handlebar variables inside the html template.
  let htmlToSend = template(emailObj.templateReplacements);

  // Send the email.
  const email = await transporter.sendMail({
    from: emailObj.from || config.smtp.username,
    to: config.email.receiverOverwrite || emailObj.to,
    subject: emailObj.subject,
    text: emailObj.textBody,
    html: htmlToSend
  }).catch((err) => {
    console.error(err);
  });
  console.log('Message sent! ', email);
  return email.messageId;
}

module.exports = { send }
