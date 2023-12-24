const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "patelabhishek11012001@gmail.com",
    pass: "plkxfzixienttvic",
  },
});

module.exports = transporter;
