import { auth } from "../middlewares/auth.middleware.js";
import {
  cancelTransaction,
  checkSnapTransaction,
  createSnapTransaction,
  deleteCartIfCheckout,
  deleteSnapTransaction,
  getAllUserTransactions,
} from "../controllers/transaction.controller.js";
import express from "express";
import { getAllOrders, getUserOrder } from "../controllers/order.controller.js";
import { middlewareCheckSnap } from "../middlewares/transaction.middleware.js";
const router = express.Router();

router.get("/cancel-order/:orderId", auth, cancelTransaction);
router.get("/orders", auth, getAllOrders);
router.get("/user-orders", auth, getUserOrder);
router.get("/", auth, getAllUserTransactions);
router.delete("/delete-cart", auth, deleteCartIfCheckout);
router.post("/snap-transaction", auth, createSnapTransaction);
router.delete("/cancel-snap-transaction", auth, deleteSnapTransaction);
router.get(
  "/check-snap-transaction/:orderId",
  auth,
  middlewareCheckSnap,
  checkSnapTransaction
);
export default router;
