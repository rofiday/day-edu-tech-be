import {
  midtransCancelTransaction,
  midtransCheckTransaction,
  midtransCreateSnapTransaction,
} from "../services/midtrans.service.js";
import db from "../models/index.js";
const { Cart, User, Course, Order, UserCourse } = db;
import { v4 as uuidv4 } from "uuid";
import { Op } from "sequelize";
export const createSnapTransaction = async (req, res) => {
  const { id, email } = req.user;
  const orderId = `${process.env.PREFIX_APP}-${Date.now()}`;
  try {
    const user = await User.findByPk(id, {
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

    const totalPrice = user.courses.reduce(
      (total, course) => total + course.price,
      0
    );
    const itemDetails = user.courses.map((course) => ({
      id: course.id,
      price: course.price,
      quantity: 1,
      name: course.name,
      image: course.urlImage,
    }));
    const transactionDetails = {
      transaction_details: {
        order_id: orderId,
        gross_amount: totalPrice,
      },
      customer_details: {
        email: email,
      },
      item_details: itemDetails,
    };

    const transaction = await midtransCreateSnapTransaction(transactionDetails);
    const order = await Order.create({
      id: uuidv4(),
      userId: id,
      totalPrice: totalPrice,
      email: email,
      status: "init",
      paymentStatus: "init",
      orderId: orderId,
      token: transaction.token,
      data: itemDetails,
      isActive: false,
    });
    order.dataValues.transaction = transaction;
    res.status(200).json({
      status: "success",
      data: order,
      message: "Success to create snap transaction",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

export const deleteSnapTransaction = async (req, res) => {
  const { id } = req.user;
  try {
    const orders = await Order.findAll({
      where: {
        [Op.and]: [{ userId: id }, { status: "init" }],
      },
    });
    await Promise.all(orders.map((order) => order.destroy()));
    res.status(200).json({
      status: "success",
      message: "Success to delete snap transaction",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

//check pembayaran dan update status(cek status pembayaran)
export const checkSnapTransaction = async (req, res) => {
  const { id } = req.user;
  const { orderId } = req.params;
  try {
    const transaction = await midtransCheckTransaction(orderId);
    const order = await Order.findOne({
      where: { orderId: orderId },
    });

    //melakukan pengecheckan dari midtrans
    let status = "pending";
    if (
      transaction.transaction_status === "settlement" ||
      transaction.transaction_status === "success"
    ) {
      status = "paid";
    }
    if (transaction.transaction_status === "cancel") status = "cancelled";
    if (transaction.transaction_status === "expire") status = "expired";
    //update sekaligus melakukan penghapusan terhadap order yang masih init
    await order.update(
      { paymentStatus: transaction.transaction_status, status: status },
      { where: { orderId: orderId } }
    );
    await Order.destroy({
      where: {
        [Op.and]: [{ userId: id }, { status: "init" }],
      },
    });
    res.status(200).json({
      status: "success",
      data: order,
      message: "Success to check snap transaction",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

export const getAllUserTransactions = async (req, res) => {
  const { id } = req.user;

  const { limit = 10, offset = 0, search = "" } = req.query;
  try {
    const orders = await Order.findAndCountAll({
      where: {
        userId: id,
        [Op.or]: [{ orderId: { [Op.like]: `%${search.toLowerCase()}%` } }],
      },
      limit: Number(limit),
      offset: Number(offset),
    });
    if (orders.rows.length > 0) {
      await Promise.all(
        orders.rows.map(async (order) => {
          const transaction = await midtransCheckTransaction(order.orderId);
          let status = "pending";
          if (
            transaction.transaction_status === "pending" ||
            transaction.transaction_status === "settlement"
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
                  await Promise.all(
                    carts.map(async (cart) => {
                      await cart.destroy();
                    })
                  );
                }
              })
            );
          }
          if (
            transaction.transaction_status === "settlement" ||
            transaction.transaction_status === "success"
          ) {
            status = "paid";
            await Promise.all(
              order.data.map(async (course) => {
                await UserCourse.findOrCreate({
                  where: {
                    userId: order.userId,
                    courseId: course.id,
                    data: {},
                  },
                });
              })
            );
          }
          if (transaction.transaction_status === "cancel") status = "cancelled";
          if (transaction.transaction_status === "expire") status = "expired";
          await order.update(
            { paymentStatus: transaction.transaction_status, status: status },
            { where: { orderId: order.orderId } }
          );
        })
      );
    }
    res.status(200).json({
      status: "success",
      count: orders.count,
      limit,
      data: orders.rows,
      message: "Transactions retrieved successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

//membuat endpoint untuk menghapus data cart ketika sudah di checkout
export const deleteCartIfCheckout = async (req, res) => {
  const { id } = req.user; // Ambil ID user dari token/auth
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
    return res
      .status(200)
      .json({ message: "Orders checked and deleted if paid" });
  } catch (error) {
    console.error("Error deleting cart:", error.message);
    res.status(500).json({ error: error.message });
  }
};

//membuat endpoint untuk mengcancel transaction yang pending
export const cancelTransaction = async (req, res) => {
  const { orderId } = req.params;
  try {
    const transaction = await midtransCancelTransaction(orderId);
    let order = await Order.findOne({ where: { orderId: orderId } });
    let status = "cancelled";
    order.paymentStatus = transaction.transaction_status;
    order.status = status;

    await order.save();

    return res.status(200).send({
      status: "success",
      code: 200,
      message: "Successfully cancel transaction",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      status: "failed",
      message: error.message,
      code: 500,
    });
  }
};
