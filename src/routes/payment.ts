// src/routes/paymentRoutes.ts
import { Router } from "express";
import { PaymentController } from "../controllers/paymentController";

const router = Router();

router.post("/pay/traveller-pro", PaymentController.payPro);
router.post("/set/tour", PaymentController.setTourPrice);
router.get("/pay/tour/:sessionId", PaymentController.payTourPrice);
router.post("/webhook", PaymentController.webhook);

export default router;
