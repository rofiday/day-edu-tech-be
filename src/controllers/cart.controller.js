import { v4 as uuidv4 } from "uuid";
import db from "../models/index.js";
import { midtransCheckTransaction } from "../services/midtrans.service.js";
const { Cart, User, Course, Order } = db;

export const getAllCourseFromCart = async (req, res) => {
  const { id } = req.user;
  try {
    const user = await User.findOne({
      where: { id },
      attributes: [],
      include: [
        {
          model: Course,
          as: "courses",
          attributes: ["id", "name", "price", "urlImage"],
          through: {
            model: Cart,
            attributes: [],
          },
        },
      ],
    });
    res.status(200).json({
      status: "success",
      data: user,
      message: "Successfully get user cart",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

export const addCourseToCart = async (req, res) => {
  const { id } = req.user;
  try {
    await Cart.findOne({
      where: { userId: id, courseId: req.body.courseId },
    });
    await Cart.create({
      id: uuidv4(),
      userId: id,
      courseId: req.body.courseId,
    });
    res.status(200).json({
      status: "success",
      message: "Successfully add course to cart",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

export const deleteCourseFromCart = async (req, res) => {
  const { id } = req.user;
  try {
    const cart = await Cart.findOne({
      where: { userId: id, courseId: req.body.courseId },
    });

    await cart.destroy();
    res.status(200).json({
      status: "success",
      message: "Successfully delete course from cart",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

export const updateUserCart = async (req, res) => {
  const { id } = req.user;
  let isUpdatingCart = false;
  try {
    const orders = await Order.findAndCountAll({
      where: {
        userId: id,
      },
    });
    if (orders.rows.length > 0) {
      await Promise.all(
        orders.rows.map(async (order) => {
          const transaction = await midtransCheckTransaction(order.orderId);
          if (
            transaction.transaction_status === "pending" ||
            transaction.transaction_status === "settlement" ||
            transaction.transaction_status === "success"
          ) {
            await Promise.all(
              order.data.map(async (course) => {
                const carts = await Cart.findAll({
                  where: {
                    userId: id,
                    courseId: course.id,
                  },
                });
                if (carts && carts.length > 0) {
                  isUpdatingCart = true;
                  await Promise.all(
                    carts.map(async (cart) => {
                      await cart.destroy();
                    })
                  );
                }
              })
            );
          }
        })
      );
    }
    res.status(200).json({
      status: "success",
      message: "Successfully update user cart",
      isUpdatingCart: isUpdatingCart,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};
