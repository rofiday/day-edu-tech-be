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
  },
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
    test("should fail because cart already exists", async () => {
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
      db.Cart.findOne.mockResolvedValue({ id: 1 });
      console.error = jest.fn();
      await addCourseToCart(req, res);
      expect(db.Cart.findOne).toHaveBeenCalledWith({
        where: {
          userId: req.user.id,
          courseId: req.body.courseId,
        },
      });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Failed to add course to cart, course already exists",
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
    test("should fail because cart not found", async () => {
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
      db.Cart.findOne.mockResolvedValue(null);
      console.error = jest.fn();
      await deleteCourseFromCart(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Failed to delete course from cart",
      });
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
});
