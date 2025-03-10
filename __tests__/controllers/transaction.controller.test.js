import {
  describe,
  jest,
  beforeEach,
  afterEach,
  test,
  expect,
} from "@jest/globals";
jest.unstable_mockModule("@/models/index.js", () => ({
  default: {
    Cart: {
      findAll: jest.fn(),
    },
    User: {
      findByPk: jest.fn(),
    },
    Course: {
      include: jest.fn(),
    },
    Order: {
      findAll: jest.fn(),
      findAndCountAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
    },
    UserCourse: {
      findOrCreate: jest.fn(),
    },
    sequelize: {
      Op: {
        or: Symbol("or"),
        like: Symbol("like"),
        and: Symbol("and"),
      },
    },
  },
}));

jest.unstable_mockModule("@/services/midtrans.service.js", () => ({
  midtransCreateSnapTransaction: jest.fn(),
  midtransCheckTransaction: jest.fn(),
  midtransCancelTransaction: jest.fn(),
}));

jest.unstable_mockModule("uuid", () => ({
  v4: jest.fn(() => "mocked-uuid"),
}));

describe("transaction controller", () => {
  describe("createSnapTransaction", () => {
    let db, createSnapTransaction, req, res, midtransCreateSnapTransaction;

    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      createSnapTransaction = (
        await import("@/controllers/transaction.controller.js")
      ).createSnapTransaction;
      midtransCreateSnapTransaction = (
        await import("@/services/midtrans.service.js")
      ).midtransCreateSnapTransaction;
      req = {
        user: {
          id: 1,
          email: "example@example",
        },
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      };
      jest.clearAllMocks();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test("should create a snap transaction successfully", async () => {
      const mockUser = {
        id: 1,
        email: "example@example",
        courses: [
          { id: 1, name: "Course 1", price: 100, urlImage: "image1.jpg" },
          { id: 2, name: "Course 2", price: 200, urlImage: "image2.jpg" },
        ],
      };

      const mockTransaction = {
        token: "mocked-token",
      };

      db.User.findByPk.mockResolvedValue(mockUser);
      db.Order.create.mockResolvedValue({
        id: "mocked-uuid",
        userId: 1,
        totalPrice: 300,
        email: "example@example",
        status: "init",
        paymentStatus: "init",
        orderId: `${process.env.PREFIX_APP}-${Date.now()}`,
        token: "mocked-token",
        data: [
          {
            id: 1,
            price: 100,
            quantity: 1,
            name: "Course 1",
            image: "image1.jpg",
          },
          {
            id: 2,
            price: 200,
            quantity: 1,
            name: "Course 2",
            image: "image2.jpg",
          },
        ],
        isActive: false,
        dataValues: {}, // Tambahkan ini untuk memastikan `dataValues` ada
      });

      midtransCreateSnapTransaction.mockResolvedValue(mockTransaction);

      await createSnapTransaction(req, res);

      expect(db.User.findByPk).toHaveBeenCalledWith(1, {
        include: [
          {
            model: db.Course,
            as: "courses",
            attributes: ["id", "name", "price", "urlImage"],
            through: {
              model: db.Cart,
              attributes: [],
            },
          },
        ],
      });

      expect(midtransCreateSnapTransaction).toHaveBeenCalledWith({
        transaction_details: {
          order_id: expect.any(String),
          gross_amount: 300,
        },
        customer_details: {
          email: "example@example",
        },
        item_details: [
          {
            id: 1,
            price: 100,
            quantity: 1,
            name: "Course 1",
            image: "image1.jpg",
          },
          {
            id: 2,
            price: 200,
            quantity: 1,
            name: "Course 2",
            image: "image2.jpg",
          },
        ],
      });

      expect(db.Order.create).toHaveBeenCalledWith({
        id: "mocked-uuid",
        userId: 1,
        totalPrice: 300,
        email: "example@example",
        status: "init",
        paymentStatus: "init",
        orderId: expect.any(String),
        token: "mocked-token",
        data: [
          {
            id: 1,
            price: 100,
            quantity: 1,
            name: "Course 1",
            image: "image1.jpg",
          },
          {
            id: 2,
            price: 200,
            quantity: 1,
            name: "Course 2",
            image: "image2.jpg",
          },
        ],
        isActive: false,
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: expect.any(Object),
        message: "Success to create snap transaction",
      });
    });
    test("should return 500 on internal server error", async () => {
      db.User.findByPk.mockImplementation(() => {
        throw new Error("Internal Server Error");
      });
      console.error = jest.fn();
      await createSnapTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });
  describe("deleteSnapTransaction", () => {
    let req, res, db, deleteSnapTransaction;

    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      deleteSnapTransaction = (
        await import("@/controllers/transaction.controller.js")
      ).deleteSnapTransaction;
      req = {
        user: {
          id: 1, // Mock user ID
        },
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      };
      jest.clearAllMocks();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test("should delete all init transactions for the user and return success", async () => {
      // Mock data untuk Order.findAll
      const mockOrders = [
        { id: 1, userId: 1, status: "init", destroy: jest.fn() },
        { id: 2, userId: 1, status: "init", destroy: jest.fn() },
      ];

      // Mock Order.findAll untuk mengembalikan data orders
      db.Order.findAll.mockResolvedValue(mockOrders);

      // Jalankan fungsi controller
      await deleteSnapTransaction(req, res);

      // Pastikan semua order dihapus
      mockOrders.forEach((order) => {
        expect(order.destroy).toHaveBeenCalled();
      });

      // Pastikan response sukses dikirim
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Success to delete snap transaction",
      });
    });

    test("should return 500 on internal server error", async () => {
      db.Order.findAll.mockImplementation(() => {
        throw new Error("Internal Server Error");
      });
      console.error = jest.fn();
      await deleteSnapTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });
  describe("checkSnapTransaction", () => {
    let req, res, mockOrder, db, checkSnapTransaction, midtransCheckTransaction;

    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      checkSnapTransaction = (
        await import("@/controllers/transaction.controller.js")
      ).checkSnapTransaction;
      midtransCheckTransaction = (
        await import("@/services/midtrans.service.js")
      ).midtransCheckTransaction;
      req = {
        user: { id: 1 },
        params: { orderId: "mock-order-id" },
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      };

      mockOrder = {
        orderId: "mock-order-id",
        update: jest.fn(),
      };

      jest.clearAllMocks();
    });

    test("should update order status to 'paid' if transaction is settled", async () => {
      midtransCheckTransaction.mockResolvedValue({
        transaction_status: "settlement",
      });
      db.Order.findOne = jest.fn().mockResolvedValue(mockOrder);
      db.Order.destroy = jest.fn();

      await checkSnapTransaction(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: mockOrder,
        message: "Success to check snap transaction",
      });
    });

    test("should update order status to 'cancelled' if transaction is cancelled", async () => {
      midtransCheckTransaction.mockResolvedValue({
        transaction_status: "cancel",
      });
      db.Order.findOne = jest.fn().mockResolvedValue(mockOrder);

      await checkSnapTransaction(req, res);
    });

    test("should update order status to 'expired' if transaction is expired", async () => {
      midtransCheckTransaction.mockResolvedValue({
        transaction_status: "expire",
      });
      db.Order.findOne = jest.fn().mockResolvedValue(mockOrder);

      await checkSnapTransaction(req, res);
    });

    test("should return 500 on internal server error", async () => {
      midtransCheckTransaction.mockRejectedValue(
        new Error("Internal Server Error")
      );

      await checkSnapTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });
  describe("getAllUserTransactions", () => {
    let req, res, db, midtransCheckTransaction, getAllUserTransactions;

    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      midtransCheckTransaction = (
        await import("@/services/midtrans.service.js")
      ).midtransCheckTransaction;
      getAllUserTransactions = (
        await import("@/controllers/transaction.controller.js")
      ).getAllUserTransactions;

      req = {
        user: { id: 1 },
        query: {},
      };

      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      };

      jest.clearAllMocks();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test("should return transactions successfully with query params", async () => {
      req.query = {
        search: "",
        limit: "10",
        offset: "0",
      };

      db.Order.findAndCountAll = jest.fn().mockResolvedValue({
        count: 2,
        rows: [
          {
            orderId: "order-123",
            userId: 1,
            data: [{ id: 101 }, { id: 102 }],
            update: jest.fn(),
          },
          {
            orderId: "order-456",
            userId: 1,
            data: [{ id: 103 }],
            update: jest.fn(),
          },
        ],
      });

      midtransCheckTransaction.mockResolvedValue({
        transaction_status: "settlement",
      });

      db.Cart.findAll = jest.fn().mockResolvedValue([{ destroy: jest.fn() }]);
      db.UserCourse.findOrCreate = jest.fn().mockResolvedValue([]);

      await getAllUserTransactions(req, res);

      expect(db.Order.findAndCountAll).toHaveBeenCalled();
      expect(midtransCheckTransaction).toHaveBeenCalledWith("order-123");
      expect(midtransCheckTransaction).toHaveBeenCalledWith("order-456");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: "success", count: 2 })
      );
    });
    test("should return transactions successfully with query params but cancel", async () => {
      req.query = {
        search: "",
        limit: "10",
        offset: "0",
      };

      db.Order.findAndCountAll = jest.fn().mockResolvedValue({
        count: 2,
        rows: [
          {
            orderId: "order-123",
            userId: 1,
            data: [{ id: 101 }, { id: 102 }],
            update: jest.fn(),
          },
          {
            orderId: "order-456",
            userId: 1,
            data: [{ id: 103 }],
            update: jest.fn(),
          },
        ],
      });

      midtransCheckTransaction.mockResolvedValue({
        transaction_status: "cancel",
      });

      db.Cart.findAll = jest.fn().mockResolvedValue([{ destroy: jest.fn() }]);
      db.UserCourse.findOrCreate = jest.fn().mockResolvedValue([]);

      await getAllUserTransactions(req, res);

      expect(db.Order.findAndCountAll).toHaveBeenCalled();
      expect(midtransCheckTransaction).toHaveBeenCalledWith("order-123");
      expect(midtransCheckTransaction).toHaveBeenCalledWith("order-456");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: "success", count: 2 })
      );
    });
    test("should return transactions successfully with query params but expire", async () => {
      req.query = {
        search: "",
        limit: "10",
        offset: "0",
      };

      db.Order.findAndCountAll = jest.fn().mockResolvedValue({
        count: 2,
        rows: [
          {
            orderId: "order-123",
            userId: 1,
            data: [{ id: 101 }, { id: 102 }],
            update: jest.fn(),
          },
          {
            orderId: "order-456",
            userId: 1,
            data: [{ id: 103 }],
            update: jest.fn(),
          },
        ],
      });

      midtransCheckTransaction.mockResolvedValue({
        transaction_status: "expire",
      });

      db.Cart.findAll = jest.fn().mockResolvedValue([{ destroy: jest.fn() }]);
      db.UserCourse.findOrCreate = jest.fn().mockResolvedValue([]);

      await getAllUserTransactions(req, res);

      expect(db.Order.findAndCountAll).toHaveBeenCalled();
      expect(midtransCheckTransaction).toHaveBeenCalledWith("order-123");
      expect(midtransCheckTransaction).toHaveBeenCalledWith("order-456");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: "success", count: 2 })
      );
    });
    test("should return transactions successfully with query params but order rows is empty", async () => {
      req.query = {
        search: "",
        limit: "10",
        offset: "0",
      };

      db.Order.findAndCountAll = jest.fn().mockResolvedValue({
        count: 2,
        rows: [],
      });

      midtransCheckTransaction.mockResolvedValue({
        transaction_status: "settlement",
      });

      db.Cart.findAll = jest.fn().mockResolvedValue([{ destroy: jest.fn() }]);
      db.UserCourse.findOrCreate = jest.fn().mockResolvedValue([]);

      await getAllUserTransactions(req, res);

      expect(db.Order.findAndCountAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: "success", count: 2 })
      );
    });

    test("should return transactions successfully with query params but unknown status transaction", async () => {
      req.query = {
        search: "",
        limit: "10",
        offset: "0",
      };

      db.Order.findAndCountAll = jest.fn().mockResolvedValue({
        count: 2,
        rows: [
          {
            orderId: "order-123",
            userId: 1,
            data: [{ id: 101 }, { id: 102 }],
            update: jest.fn(),
          },
          {
            orderId: "order-456",
            userId: 1,
            data: [{ id: 103 }],
            update: jest.fn(),
          },
        ],
      });

      midtransCheckTransaction.mockResolvedValue({
        transaction_status: "unknown",
      });

      db.Cart.findAll = jest.fn().mockResolvedValue([{ destroy: jest.fn() }]);
      db.UserCourse.findOrCreate = jest.fn().mockResolvedValue([]);

      await getAllUserTransactions(req, res);

      expect(db.Order.findAndCountAll).toHaveBeenCalled();
      expect(midtransCheckTransaction).toHaveBeenCalledWith("order-123");
      expect(midtransCheckTransaction).toHaveBeenCalledWith("order-456");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: "success", count: 2 })
      );
    });

    test("should return transactions successfully with query params but carts is null", async () => {
      req.query = {
        search: "",
        limit: "10",
        offset: "0",
      };

      db.Order.findAndCountAll = jest.fn().mockResolvedValue({
        count: 2,
        rows: [
          {
            orderId: "order-123",
            userId: 1,
            data: [{ id: 101 }, { id: 102 }],
            update: jest.fn(),
          },
          {
            orderId: "order-456",
            userId: 1,
            data: [{ id: 103 }],
            update: jest.fn(),
          },
        ],
      });

      midtransCheckTransaction.mockResolvedValue({
        transaction_status: "settlement",
      });

      db.Cart.findAll = jest.fn().mockResolvedValue([]);
      db.UserCourse.findOrCreate = jest.fn().mockResolvedValue([]);

      await getAllUserTransactions(req, res);

      expect(db.Order.findAndCountAll).toHaveBeenCalled();
      expect(midtransCheckTransaction).toHaveBeenCalledWith("order-123");
      expect(midtransCheckTransaction).toHaveBeenCalledWith("order-456");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: "success", count: 2 })
      );
    });

    test("should handle errors and return status 500", async () => {
      db.Order.findAndCountAll.mockImplementation(() => {
        throw new Error("Database Error");
      });

      await getAllUserTransactions(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Database Error");
    });
  });

  describe("deleteCartIfCheckout", () => {
    let req, res, db, deleteCartIfCheckout, midtransCheckTransaction;

    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      deleteCartIfCheckout = (
        await import("@/controllers/transaction.controller.js")
      ).deleteCartIfCheckout;
      midtransCheckTransaction = (
        await import("@/services/midtrans.service.js")
      ).midtransCheckTransaction;

      req = {
        user: { id: 1 },
      };

      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      jest.clearAllMocks();
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });
    test("should return 200 if no orders are found", async () => {
      db.Order.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      await deleteCartIfCheckout(req, res);

      expect(db.Order.findAndCountAll).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Orders checked and deleted if paid",
      });
    });

    test("should delete carts if transaction is 'pending', 'settlement', or 'success'", async () => {
      const mockOrder = {
        orderId: "mock-order-id",
        data: [{ id: 101 }, { id: 102 }],
      };
      const mockCart = { destroy: jest.fn() };

      db.Order.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [mockOrder],
      });
      midtransCheckTransaction.mockResolvedValueOnce({
        transaction_status: "settlement",
      });

      db.Cart.findAll.mockResolvedValue([mockCart]);

      await deleteCartIfCheckout(req, res);

      expect(midtransCheckTransaction).toHaveBeenCalledWith("mock-order-id");
      expect(db.Cart.findAll).toHaveBeenCalledWith({
        where: { userId: 1, courseId: 101 },
      });
      expect(db.Cart.findAll).toHaveBeenCalledWith({
        where: { userId: 1, courseId: 102 },
      });
      expect(mockCart.destroy).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Orders checked and deleted if paid",
      });
    });

    test("should delete carts if transaction is 'pending', 'settlement', or 'success' but carts is empty", async () => {
      const mockOrder = {
        orderId: "mock-order-id",
        data: [{ id: 101 }, { id: 102 }],
      };
      const mockCart = { destroy: jest.fn() };

      db.Order.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [mockOrder],
      });
      midtransCheckTransaction.mockResolvedValueOnce({
        transaction_status: "settlement",
      });

      db.Cart.findAll.mockResolvedValue([]);

      await deleteCartIfCheckout(req, res);

      expect(midtransCheckTransaction).toHaveBeenCalledWith("mock-order-id");

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Orders checked and deleted if paid",
      });
    });

    test("should delete carts if transaction is 'cancel'", async () => {
      const mockOrder = {
        orderId: "mock-order-id",
        data: [{ id: 101 }, { id: 102 }],
      };
      const mockCart = { destroy: jest.fn() };

      db.Order.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [mockOrder],
      });
      midtransCheckTransaction.mockResolvedValueOnce({
        transaction_status: "cancel",
      });

      db.Cart.findAll.mockResolvedValue([mockCart]);

      await deleteCartIfCheckout(req, res);

      expect(midtransCheckTransaction).toHaveBeenCalledWith("mock-order-id");

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Orders checked and deleted if paid",
      });
    });

    test("should return 500 if an error occurs", async () => {
      db.Order.findAndCountAll.mockRejectedValue(new Error("Database error"));

      await deleteCartIfCheckout(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
    });
  });
  describe("cancelTransaction Controller", () => {
    let req, res, midtransCancelTransaction, db, cancelTransaction;

    beforeEach(async () => {
      // Reset mocks before each test
      jest.clearAllMocks();
      cancelTransaction = (
        await import("@/controllers/transaction.controller.js")
      ).cancelTransaction;
      db = (await import("@/models/index.js")).default;
      midtransCancelTransaction = (
        await import("@/services/midtrans.service.js")
      ).midtransCancelTransaction;

      // Mock request and response objects
      req = {
        params: {
          orderId: "ORDER-123",
        },
      };

      res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
        json: jest.fn(),
      };
    });

    test("should successfully cancel a transaction", async () => {
      // Mock successful midtrans response
      const mockTransaction = {
        transaction_status: "cancel",
        order_id: "ORDER-123",
        // tambahkan field lain yang diperlukan dari response midtrans
      };

      // Mock successful order finding
      const mockOrder = {
        orderId: "ORDER-123",
        paymentStatus: "pending",
        status: "pending",
        save: jest.fn().mockResolvedValue(true),
      };

      // Setup mocks
      midtransCancelTransaction.mockResolvedValue(mockTransaction);
      db.Order.findOne.mockResolvedValue(mockOrder);

      // Execute function
      await cancelTransaction(req, res);

      // Assertions
      expect(midtransCancelTransaction).toHaveBeenCalledWith("ORDER-123");
      expect(db.Order.findOne).toHaveBeenCalledWith({
        where: { orderId: "ORDER-123" },
      });
      expect(mockOrder.paymentStatus).toBe("cancel");
      expect(mockOrder.status).toBe("cancelled");
      expect(mockOrder.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        status: "success",
        code: 200,
        message: "Successfully cancel transaction",
        data: mockOrder,
      });
    });

    test("should handle error when midtrans cancellation fails", async () => {
      // Mock midtrans error
      const mockError = new Error("Midtrans cancellation failed");

      // Setup mocks
      midtransCancelTransaction.mockRejectedValue(mockError);

      // Execute function
      await cancelTransaction(req, res);

      // Assertions
      expect(midtransCancelTransaction).toHaveBeenCalledWith("ORDER-123");
      expect(db.Order.findOne).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "failed",
        message: "Midtrans cancellation failed",
        code: 500,
      });
    });

    test("should handle error when order is not found", async () => {
      // Mock successful midtrans response
      const mockTransaction = {
        transaction_status: "cancel",
        order_id: "ORDER-123",
      };

      // Mock order not found
      const mockError = new Error("Order not found");

      // Setup mocks
      midtransCancelTransaction.mockResolvedValue(mockTransaction);
      db.Order.findOne.mockResolvedValue(null);
      // Simulasi error ketika mencoba mengakses property dari null
      db.Order.findOne.mockImplementation(() => {
        throw mockError;
      });

      // Execute function
      await cancelTransaction(req, res);

      // Assertions
      expect(midtransCancelTransaction).toHaveBeenCalledWith("ORDER-123");
      expect(db.Order.findOne).toHaveBeenCalledWith({
        where: { orderId: "ORDER-123" },
      });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "failed",
        message: "Order not found",
        code: 500,
      });
    });

    test("should handle error when order.save() fails", async () => {
      // Mock successful midtrans response
      const mockTransaction = {
        transaction_status: "cancel",
        order_id: "ORDER-123",
      };

      // Mock order save failure
      const mockError = new Error("Database error");
      const mockOrder = {
        orderId: "ORDER-123",
        paymentStatus: "pending",
        status: "pending",
        save: jest.fn().mockRejectedValue(mockError),
      };

      // Setup mocks
      midtransCancelTransaction.mockResolvedValue(mockTransaction);
      db.Order.findOne.mockResolvedValue(mockOrder);

      // Execute function
      await cancelTransaction(req, res);

      // Assertions
      expect(midtransCancelTransaction).toHaveBeenCalledWith("ORDER-123");
      expect(db.Order.findOne).toHaveBeenCalledWith({
        where: { orderId: "ORDER-123" },
      });
      expect(mockOrder.paymentStatus).toBe("cancel");
      expect(mockOrder.status).toBe("cancelled");
      expect(mockOrder.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "failed",
        message: "Database error",
        code: 500,
      });
    });
  });
});
