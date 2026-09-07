const nodemailer = require('nodemailer');

let testAccount = null;

async function getTransporter() {
  // Use real credentials if provided in .env
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback to Ethereal Test Account for Development/Demos
  if (!testAccount) {
    console.log('📧 Generating Ethereal test account...');
    testAccount = await nodemailer.createTestAccount();
  }

  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });
}

/**
 * Send an OTP email to a user.
 * @param {string} toEmail - The recipient's email address.
 * @param {string} otp - The 6-digit OTP code.
 */
async function sendOtpEmail(toEmail, otp) {
  try {
    const transporter = await getTransporter();

    const info = await transporter.sendMail({
      from: '"HoneyChain Security" <noreply@honeychain.app>',
      to: toEmail,
      subject: 'Verify your HoneyChain Account',
      text: `Your HoneyChain verification code is: ${otp}\n\nThis code will expire in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-w-md; margin: auto; padding: 20px; text-align: center;">
          <h2 style="color: #d97706;">HoneyChain</h2>
          <p>Welcome to HoneyChain! Please use the verification code below to complete your registration.</p>
          <div style="margin: 30px 0; padding: 20px; background-color: #fef3c7; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #b45309;">
            ${otp}
          </div>
          <p style="color: #6b7280; font-size: 14px;">This code will expire in 10 minutes.</p>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 40px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `
    });

    // If using Ethereal, print the link so we can view the email in the console!
    if (!process.env.SMTP_HOST) {
      console.log('=============================================');
      console.log('📧 ETHEREAL TEST EMAIL SENT!');
      console.log(`✉️  Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      console.log(`🔑 OTP Code: ${otp}`);
      console.log('=============================================');
    }

    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
}

/**
 * Send an approval email to a beekeeper.
 */
async function sendApprovalEmail(toEmail, fullName) {
  try {
    const transporter = await getTransporter();
    await transporter.sendMail({
      from: '"HoneyChain Admin" <noreply@honeychain.app>',
      to: toEmail,
      subject: 'Your HoneyChain Account has been Approved!',
      text: `Hello ${fullName},\n\nYour beekeeper profile has been verified and approved by the admins. You can now log in and start registering your honey batches on the blockchain!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-w-md; margin: auto; padding: 20px; text-align: center;">
          <h2 style="color: #10b981;">Account Approved! 🎉</h2>
          <p>Hello ${fullName},</p>
          <p>Great news! Your beekeeper profile has been officially verified and approved by the HoneyChain admins.</p>
          <div style="margin: 30px 0;">
            <a href="http://localhost:3000/auth/login" style="background-color: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Log In Now</a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">You can now start adding your hives and registering your honey batches on the blockchain.</p>
        </div>
      `
    });
    return true;
  } catch (error) {
    console.error('Approval email sending failed:', error);
    return false;
  }
}

/**
 * Send a rejection email to a beekeeper.
 */
async function sendRejectionEmail(toEmail, fullName, reason = 'Did not meet compliance requirements.') {
  try {
    const transporter = await getTransporter();
    await transporter.sendMail({
      from: '"HoneyChain Admin" <noreply@honeychain.app>',
      to: toEmail,
      subject: 'Update on your HoneyChain Application',
      text: `Hello ${fullName},\n\nUnfortunately, your beekeeper profile application has been rejected. Reason: ${reason}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-w-md; margin: auto; padding: 20px; text-align: center;">
          <h2 style="color: #ef4444;">Application Update</h2>
          <p>Hello ${fullName},</p>
          <p>Unfortunately, your beekeeper profile application could not be approved at this time.</p>
          <div style="margin: 20px 0; padding: 15px; background-color: #fef2f2; color: #b91c1c; border-radius: 6px;">
            <strong>Reason:</strong> ${reason}
          </div>
          <p style="color: #6b7280; font-size: 14px;">Please contact support if you believe this was a mistake or to appeal the decision.</p>
        </div>
      `
    });
    return true;
  } catch (error) {
    console.error('Rejection email sending failed:', error);
    return false;
  }
}

module.exports = {
  sendOtpEmail,
  sendApprovalEmail,
  sendRejectionEmail
};
