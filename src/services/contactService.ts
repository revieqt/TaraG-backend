import nodemailer from 'nodemailer';

export interface ContactEmailData {
  name: string;
  email: string;
  contactNumber: string;
  subject: string;
  message: string;
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'revie.dev@gmail.com',
    pass: 'bzpl wuej ikqw jasf',
  },
});

export async function sendContactEmail(data: ContactEmailData) {
  const mailOptions = {
    from: data.email,
    to: 'revie.dev@gmail.com',
    subject: `[TaraG Contact] ${data.subject} from ${data.name} (${data.email})`,
    text: `Name: ${data.name}\nEmail: ${data.email}\nContact Number: ${data.contactNumber}\n\nMessage:\n${data.message}`,
    replyTo: data.email,
  };
  return transporter.sendMail(mailOptions);
} 