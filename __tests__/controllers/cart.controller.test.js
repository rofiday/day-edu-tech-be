import { describe, jest, beforeEach, afterEach, test } from "@jest/globals";

jest.unstable_mockModule("@/models/index.js", () => ({
  default: {
    Cart: {
      create: jest.fn(),
      findOne: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
    },
    User: {
      include: jest.fn(),
      findOne: jest.fn(),
    },
    Course: {
      include: jest.fn(),
      findOne: jest.fn(),
    },
    Order: {
      findAndCountAll: jest.fn(),
    },
  },
}));
jest.unstable_mockModule("@/services/midtrans.service.js", () => ({
  midtransCheckTransaction: jest.fn(),
}));

describe("Cart Controller", () => {
  describe("getAllCourseFromCart", () => {
    let db, getAllCourseFromCart;
    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      getAllCourseFromCart = (await import("@/controllers/cart.controller.js"))
        .getAllCourseFromCart;
      jest.clearAllMocks();
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });
    test("should successfully get all course from cart", async () => {
      const req = {
        user: {
          id: 1,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      };
      db.User.findOne.mockResolvedValue({ id: 1 });
      console.error = jest.fn();
      await getAllCourseFromCart(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "success",
          message: "Successfully get user cart",
          data: expect.objectContaining({
            id: 1,
          }),
        })
      );
    });
    test("should fail because internal server error", async () => {
      const req = {
        user: {
          id: 1,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      };
      db.User.findOne.mockImplementation(() => {
        throw new Error("Internal Server Error");
      });
      await getAllCourseFromCart(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });
  describe("addCourseToCart", () => {
    let db, addCourseToCart;
    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      addCourseToCart = (await import("@/controllers/cart.controller.js"))
        .addCourseToCart;
      jest.clearAllMocks();
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });
    test("should to find one user", async () => {
      const req = {
        user: {
          id: 1,
        },
        body: {
          courseId: 1,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      };
      console.error = jest.fn();
      await addCourseToCart(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "success",
          message: "Successfully add course to cart",
        })
      );
    });

    test("should fail because internal server error", async () => {
      const req = {
        user: {
          id: 1,
        },
        body: {
          courseId: 1,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      };
      db.Cart.findOne.mockImplementation(() => {
        throw new Error("Internal Server Error");
      });
      console.error = jest.fn();
      await addCourseToCart(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });
  describe("deleteCourseFromCart", () => {
    let db, deleteCourseFromCart;
    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      deleteCourseFromCart = (await import("@/controllers/cart.controller.js"))
        .deleteCourseFromCart;
      jest.clearAllMocks();
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });

    test("should successfully delete course from cart", async () => {
      const req = {
        user: {
          id: 1,
        },
        body: {
          courseId: 1,
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(), // Chainable status
        json: jest.fn(), // Mock json method
      };

      const mockCart = { userId: 1, destroy: jest.fn() };
      db.Cart.findOne.mockResolvedValue(mockCart);
      await deleteCourseFromCart(req, res);
      expect(db.Cart.findOne).toHaveBeenCalledWith({
        where: {
          userId: req.user.id,
          courseId: req.body.courseId,
        },
      });

      expect(mockCart.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Successfully delete course from cart",
      });
    });
    test("should fail because internal server error", async () => {
      const req = {
        user: {
          id: 1,
        },
        body: {
          courseId: 1,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      };
      db.Cart.findOne.mockImplementation(() => {
        throw new Error("Internal Server Error");
      });
      console.error = jest.fn();
      await deleteCourseFromCart(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });
  describe("updateUserCart", () => {
    let req, res, db, updateUserCart, midtransCheckTransaction;

    beforeEach(async () => {
      midtransCheckTransaction = (
        await import("@/services/midtrans.service.js")
      ).midtransCheckTransaction;
      db = (await import("@/models/index.js")).default;
      updateUserCart = (await import("@/controllers/cart.controller.js"))
        .updateUserCart;
      req = { user: { id: 1 } };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      };
    });

    it("should successfully update user cart when transaction is completed", async () => {
      db.Order.findAndCountAll.mockResolvedValue({
        rows: [{ orderId: "123", data: [{ id: 1 }] }],
      });
      midtransCheckTransaction.mockResolvedValue({
        transaction_status: "success",
      });
      db.Cart.findAll.mockResolvedValue([{ destroy: jest.fn() }]);

      await updateUserCart(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Successfully update user cart",
        isUpdatingCart: true,
      });
    });

    it("should successfully update user cart when transaction is completed but carts is empty", async () => {
      db.Order.findAndCountAll.mockResolvedValue({
        rows: [{ orderId: "123", data: [{ id: 1 }] }],
      });
      midtransCheckTransaction.mockResolvedValue({
        transaction_status: "success",
      });
      db.Cart.findAll.mockResolvedValue([]);

      await updateUserCart(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Successfully update user cart",
        isUpdatingCart: false,
      });
    });

    it("should successfully update user cart when transaction is cancelled", async () => {
      db.Order.findAndCountAll.mockResolvedValue({
        rows: [{ orderId: "123", data: [{ id: 1 }] }],
      });
      midtransCheckTransaction.mockResolvedValue({
        transaction_status: "cancel",
      });
      db.Cart.findAll.mockResolvedValue([{ destroy: jest.fn() }]);

      await updateUserCart(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Successfully update user cart",
        isUpdatingCart: false,
      });
    });

    it("should not successfully update user cart when rows is empty", async () => {
      db.Order.findAndCountAll.mockResolvedValue({
        rows: [],
      });
      midtransCheckTransaction.mockResolvedValue({
        transaction_status: "success",
      });
      db.Cart.findAll.mockResolvedValue([{ destroy: jest.fn() }]);

      await updateUserCart(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Successfully update user cart",
        isUpdatingCart: false,
      });
    });

    it("should return 500 on error", async () => {
      db.Order.findAndCountAll.mockRejectedValue(new Error("Database error"));

      await updateUserCart(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Database error");
    });
  });
});
