import { Request, Response } from 'express';
import { sendContactEmail} from '../services/contactService';

export async function postContact(req: Request, res: Response) {
  const { name, email, contactNumber, subject, message } = req.body;
  if (!name || !email || !contactNumber || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  try {
    await sendContactEmail({ name, email, contactNumber, subject, message });
    res.status(200).json({ message: 'Email sent successfully.' });
  } catch (error) {
    console.error('Error sending contact email:', error);
    res.status(500).json({ error: 'Failed to send email.' });
  }
} 