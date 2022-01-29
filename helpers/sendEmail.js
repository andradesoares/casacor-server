const nodemailer = require("nodemailer");

module.exports = {
  sendEmail: async (email, subject, payload) => {
    try {
      // create reusable transporter object using the default SMTP transport
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD, // naturally, replace both with your real credentials or an application-specific password
        },
      });

      const options = () => {
        return {
          from: process.env.FROM_EMAIL,
          to: email,
          subject: subject,
          html: payload
        };
      };

      // Send email
      transporter.sendMail(options(), (error, info) => {
        if (error) {
          return error;
        } else {
          return res.status(200).json({
            success: true,
          });
        }
      });
    } catch (error) {
      return error;
    }
  }
}

/*
Example:
sendEmail(
  "youremail@gmail.com,
  "Email subject",
  { name: "Eze" },
  "./templates/layouts/main.handlebars"
);
*/


