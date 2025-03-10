import { describe, jest, beforeEach, afterEach, test } from "@jest/globals";

jest.unstable_mockModule("@/models/index.js", () => ({
  default: {
    Order: {
      findAndCountAll: jest.fn(),
    },
    User: {
      include: jest.fn(),
    },
    sequelize: {
      Op: {
        or: Symbol("or"),
        like: Symbol("like"),
      },
    },
  },
}));

describe("Order Controller", () => {
  describe("getUserOrder", () => {
    let req, res, db, getUserOrder;

    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      getUserOrder = (await import("@/controllers/order.controller.js"))
        .getUserOrder;
      req = {
        user: { id: "mocked-user-id" },
        query: {},
      };

      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      };
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test("should get user orders without query params successfully", async () => {
      const mockOrders = {
        count: 2,
        rows: [
          { orderId: "ORD001", userId: "mocked-user-id", total: 50000 },
          { orderId: "ORD002", userId: "mocked-user-id", total: 75000 },
        ],
      };

      db.Order.findAndCountAll.mockResolvedValue(mockOrders);

      await getUserOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        count: 2,
        limit: 10,
        data: mockOrders.rows,
        message: "Orders retrieved successfully",
      });
    });

    test("should get user orders with query params successfully", async () => {
      req = {
        user: { id: "mocked-user-id" },
        query: { limit: "10", offset: "0", search: "" },
      };
      const mockOrders = {
        count: 2,
        rows: [
          { orderId: "ORD001", userId: "mocked-user-id", total: 50000 },
          { orderId: "ORD002", userId: "mocked-user-id", total: 75000 },
        ],
      };

      db.Order.findAndCountAll.mockResolvedValue(mockOrders);

      await getUserOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        count: 2,
        limit: "10",
        data: mockOrders.rows,
        message: "Orders retrieved successfully",
      });
    });

    test("should return empty if user has no orders", async () => {
      const mockOrders = { count: 0, rows: [] };

      db.Order.findAndCountAll.mockResolvedValue(mockOrders);

      await getUserOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        count: 0,
        limit: 10,
        data: [],
        message: "Orders retrieved successfully",
      });
    });

    test("should return 500 on server error in getUserOrder", async () => {
      db.Order.findAndCountAll.mockRejectedValue(
        new Error("Internal Server Error")
      );

      console.error = jest.fn();
      await getUserOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });
  describe("getAllOrders", () => {
    let req, res, db, getAllOrders;

    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      getAllOrders = (await import("@/controllers/order.controller.js"))
        .getAllOrders;
      req = {
        user: { id: "mocked-user-id" },
        query: {},
      };

      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      };
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });
    test("should get all orders successfully", async () => {
      const mockOrders = {
        count: 3,
        rows: [
          { orderId: "ORD001", userId: "user1", total: 50000 },
          { orderId: "ORD002", userId: "user2", total: 75000 },
          { orderId: "ORD003", userId: "user3", total: 120000 },
        ],
      };

      db.Order.findAndCountAll.mockResolvedValue(mockOrders);

      await getAllOrders(req, res);

      expect(db.Order.findAndCountAll).toHaveBeenCalledWith({
        where: expect.anything(),
        include: expect.anything(),
        order: [["createdAt", "DESC"]],
        limit: 10,
        offset: 0,
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        count: 3,
        limit: 10,
        data: mockOrders.rows,
        message: "Orders retrieved successfully",
      });
    });

    test("should return empty if no orders exist", async () => {
      const mockOrders = { count: 0, rows: [] };

      db.Order.findAndCountAll.mockResolvedValue(mockOrders);

      await getAllOrders(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        count: 0,
        limit: 10,
        data: [],
        message: "Orders retrieved successfully",
      });
    });

    test("should return 500 on server error in getAllOrders", async () => {
      db.Order.findAndCountAll.mockRejectedValue(
        new Error("Internal Server Error")
      );
      console.error = jest.fn();
      await getAllOrders(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });
});

// describe("Order Controller", () => {
//   describe("getUserOrder", () => {

//   })
//   let req, res, db, getUserOrder, getAllOrders;

//   beforeEach(async () => {
//     db = (await import("@/models/index.js")).default;
//     const orderController = await import("@/controllers/order.controller.js");

//     getUserOrder = orderController.getUserOrder;
//     getAllOrders = orderController.getAllOrders;

//     req = {
//       user: { id: "mocked-user-id" },
//       query: { limit: "10", offset: "0", search: "" },
//     };

//     res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//       send: jest.fn(),
//     };
//   });

//   afterEach(() => {
//     jest.restoreAllMocks();
//   });

//   test("should get user orders successfully", async () => {
//     const mockOrders = {
//       count: 2,
//       rows: [
//         { orderId: "ORD001", userId: "mocked-user-id", total: 50000 },
//         { orderId: "ORD002", userId: "mocked-user-id", total: 75000 },
//       ],
//     };

//     db.Order.findAndCountAll.mockResolvedValue(mockOrders);

//     await getUserOrder(req, res);

//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith({
//       status: "success",
//       count: 2,
//       limit: "10",
//       data: mockOrders.rows,
//       message: "Orders retrieved successfully",
//     });
//   });

//   test("should return empty if user has no orders", async () => {
//     const mockOrders = { count: 0, rows: [] };

//     db.Order.findAndCountAll.mockResolvedValue(mockOrders);

//     await getUserOrder(req, res);

//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith({
//       status: "success",
//       count: 0,
//       limit: "10",
//       data: [],
//       message: "Orders retrieved successfully",
//     });
//   });

//   test("should return 500 on server error in getUserOrder", async () => {
//     db.Order.findAndCountAll.mockImplementation(() => {
//       throw new Error("Internal Server Error");
//     });
//     console.error = jest.fn();
//     await getUserOrder(req, res);
//     expect(res.status).toHaveBeenCalledWith(500);
//     expect(res.send).toHaveBeenCalledWith("Internal Server Error");
//   });

//   test("should get all orders successfully", async () => {
//     const mockOrders = {
//       count: 3,
//       rows: [
//         { orderId: "ORD001", userId: "user1", total: 50000 },
//         { orderId: "ORD002", userId: "user2", total: 75000 },
//         { orderId: "ORD003", userId: "user3", total: 120000 },
//       ],
//     };

//     db.Order.findAndCountAll.mockResolvedValue(mockOrders);

//     await getAllOrders(req, res);

//     expect(db.Order.findAndCountAll).toHaveBeenCalledWith({
//       where: expect.anything(),
//       include: expect.anything(),
//       order: [["createdAt", "DESC"]],
//       limit: 10,
//       offset: 0,
//     });

//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith({
//       status: "success",
//       count: 3,
//       limit: "10",
//       data: mockOrders.rows,
//       message: "Orders retrieved successfully",
//     });
//   });

//   test("should return empty if no orders exist", async () => {
//     const mockOrders = { count: 0, rows: [] };

//     db.Order.findAndCountAll.mockResolvedValue(mockOrders);

//     await getAllOrders(req, res);

//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith({
//       status: "success",
//       count: 0,
//       limit: "10",
//       data: [],
//       message: "Orders retrieved successfully",
//     });
//   });

//   test("should return 500 on server error in getAllOrders", async () => {
//     db.Order.findAndCountAll.mockImplementation(() => {
//       throw new Error("Internal Server Error");
//     });

//     console.error = jest.fn();
//     await getAllOrders(req, res);

//     expect(res.status).toHaveBeenCalledWith(500);
//     expect(res.send).toHaveBeenCalledWith("Internal Server Error");
//   });
// });
