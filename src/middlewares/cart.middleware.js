import db from "../models/index.js";
const { Cart } = db;

export const middlewareAddToCart = async (req, res, next) => {
  const { id } = req.user;
  try {
    const cart = await Cart.findOne({
      where: { userId: id, courseId: req.body.courseId },
    });
    if (cart) {
      return res.status(400).json({
        status: "error",
        message: "Failed to add course to cart, course already exists",
      });
    }
    next();
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

export const middlewareDeleteFromCart = async (req, res, next) => {
  const { id } = req.user;
  try {
    const cart = await Cart.findOne({
      where: { userId: id, courseId: req.body.courseId },
    });
    if (!cart) {
      return res.status(400).json({
        status: "error",
        message: "Failed to delete course from cart",
      });
    }
    next();
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};
