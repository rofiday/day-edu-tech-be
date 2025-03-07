import db from "../models/index.js";
const { Order } = db;

export const middlewareCheckSnap = async (req, res, next) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findOne({
      where: { orderId: orderId },
    });
    if (!order) {
      return res.status(400).json({
        status: "error",
        message: "Order not found",
      });
    }
    req.order = order;
    next();
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};
