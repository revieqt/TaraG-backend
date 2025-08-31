// src/services/paymentService.ts
import { paymongoClient } from "../config/paymongo";

export class PaymentService {
  // a. PayPro - Fixed product
  static async payPro() {
    const payload = {
      data: {
        attributes: {
          amount: 25000, // 250 pesos (PayMongo uses centavos)
          currency: "PHP",
          description: "TaraG Traveller Pro",
          redirect: {
            success: "https://your-app.com/success",
            failed: "https://your-app.com/failed",
          },
        },
      },
    };

    const res = await paymongoClient.post("/checkout_sessions", payload);
    return res.data;
  }

  // b. SetTourPrice - Travel agency creates a custom checkout
  static async setTourPrice(amount: number, tourName: string) {
    const payload = {
      data: {
        attributes: {
          amount: amount * 100, // convert PHP to centavos
          currency: "PHP",
          description: `Tour Package: ${tourName}`,
          redirect: {
            success: "https://your-app.com/success",
            failed: "https://your-app.com/failed",
          },
        },
      },
    };

    const res = await paymongoClient.post("/checkout_sessions", payload);
    return res.data;
  }

  // c. PayTourPrice - Use checkout session id to complete payment
  static async payTourPrice(sessionId: string) {
    const res = await paymongoClient.get(`/checkout_sessions/${sessionId}`);
    return res.data;
  }

  // d. Handle webhook
  static async handleWebhook(event: any) {
    const { type, data } = event;

    switch (type) {
      case "checkout_session.payment.paid":
        console.log("✅ Payment successful:", data.id);
        // TODO: Update DB, mark booking as paid
        break;
      case "checkout_session.payment.failed":
        console.log("❌ Payment failed:", data.id);
        break;
      default:
        console.log("Unhandled webhook:", type);
    }
  }
}
