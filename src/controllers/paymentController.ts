// src/controllers/paymentController.ts
import { Request, Response } from "express";
import { PaymentService } from "../services/paymentService";

export class PaymentController {
  static async payPro(req: Request, res: Response) {
    try {
      const session = await PaymentService.payPro();
      res.json(session);
    } catch (err) {
      res.status(500).json({ error: "Failed to create Pro checkout" });
    }
  }

  static async setTourPrice(req: Request, res: Response) {
    try {
      const { amount, tourName } = req.body;
      const session = await PaymentService.setTourPrice(amount, tourName);
      res.json(session);
    } catch (err) {
      res.status(500).json({ error: "Failed to set tour price" });
    }
  }

  static async payTourPrice(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const session = await PaymentService.payTourPrice(sessionId);
      res.json(session);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch tour payment" });
    }
  }

  static async webhook(req: Request, res: Response) {
    try {
      const event = req.body;
      await PaymentService.handleWebhook(event);
      res.sendStatus(200);
    } catch (err) {
      res.status(400).json({ error: "Webhook handling failed" });
    }
  }
}
