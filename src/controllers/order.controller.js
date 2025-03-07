import db from "../models/index.js";
const { Order, User } = db;
import { Op } from "sequelize";

export const getUserOrder = async (req, res) => {
  const { id } = req.user;
  const { limit = 10, offset = 0, search = "" } = req.query;
  try {
    const orders = await Order.findAndCountAll({
      where: {
        userId: id,
        [Op.or]: [{ orderId: { [Op.like]: `%${search.toLowerCase()}%` } }],
      },
      include: [
        {
          model: User,
          as: "users",
          attributes: ["id", "username", "email", "phoneNumber"],
        },
      ],
      orderBy: [["createdAt", "DESC"]],
      limit: Number(limit),
      offset: Number(offset),
    });
    res.status(200).json({
      status: "success",
      count: orders.count,
      limit,
      data: orders.rows,
      message: "Orders retrieved successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

export const getAllOrders = async (req, res) => {
  const { limit = 10, offset = 0, search = "" } = req.query;
  try {
    const orders = await Order.findAndCountAll({
      where: {
        [Op.or]: [
          { orderId: { [Op.like]: `%${search.toLowerCase()}%` } },
          { userId: { [Op.like]: `%${search.toLowerCase()}%` } },
          { "$user.username$": { [Op.like]: `%${search.toLowerCase()}%` } },
        ],
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "email", "phoneNumber"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: Number(limit),
      offset: Number(offset),
    });
    res.status(200).json({
      status: "success",
      count: orders.count,
      limit,
      data: orders.rows,
      message: "Orders retrieved successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};
