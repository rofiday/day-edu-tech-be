import { describe, jest, beforeEach, afterEach, test } from "@jest/globals";

// Mock database models
jest.mock("uuid", () => ({
  v4: jest.fn(() => "mocked-uuid"),
}));
jest.unstable_mockModule("@/models/index.js", () => ({
  default: {
    Course: {
      findAndCountAll: jest.fn(),
      include: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
    },
    User: {
      include: jest.fn(),
      findByPk: jest.fn(),
    },
    Section: {
      include: jest.fn(),
    },
    Curriculum: {
      include: jest.fn(),
    },
    UserCourse: {
      findAll: jest.fn(),
      find: jest.fn(),
    },
    Cart: {
      findOne: jest.fn(),
      findOneOrCreate: jest.fn(),
    },
    Order: {
      findAll: jest.fn(),
    },
    sequelize: {
      Op: {
        or: Symbol("or"),
        like: Symbol("like"),
      },
    },
  },
}));

describe("course controller", () => {
  describe("getAllAvailableCourses", () => {
    let req, res, db, getAllAvailableCourses, Op, sequelize;

    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      getAllAvailableCourses = (
        await import("@/controllers/course.controller.js")
      ).getAllAvailableCourses;
      sequelize = (await import("@/models/index.js")).default.sequelize;
      Op = sequelize.Op;

      req = { query: { q: "javascript" } };
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

    test("should return courses successfully", async () => {
      db.Course.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: [
          { id: 1, name: "JavaScript Basics" },
          { id: 2, name: "Advanced JavaScript" },
        ],
      });

      await getAllAvailableCourses(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        count: 2,
        data: [
          { id: 1, name: "JavaScript Basics" },
          { id: 2, name: "Advanced JavaScript" },
        ],
        message: "Courses retrieved successfully",
      });
    });

    test("should return 500 on internal server error", async () => {
      db.Course.findAndCountAll.mockImplementation(() => {
        throw new Error("Internal Server Error");
      });

      console.error = jest.fn();
      await getAllAvailableCourses(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });
  describe("getUserCourses", () => {
    let req, res, db, getUserCourses;

    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      getUserCourses = (await import("@/controllers/course.controller.js"))
        .getUserCourses;

      req = { user: { id: 1 } }; // Mock user ID
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      };

      jest.clearAllMocks();
    });

    test("should return user courses successfully", async () => {
      db.User.findByPk.mockResolvedValue({
        courses: [
          {
            id: 101,
            name: "Fullstack JavaScript",
            code: "FSJS101",
            description: "Learn fullstack development",
            urlImage: "https://example.com/fsjs.jpg",
            isActive: true,
          },
        ],
      });

      await getUserCourses(req, res);

      expect(db.User.findByPk).toHaveBeenCalledWith(1, {
        include: [
          {
            model: expect.anything(),
            as: "courses",
            attributes: [
              "id",
              "name",
              "code",
              "description",
              "urlImage",
              "isActive",
            ],
            through: { attributes: [] },
          },
        ],
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: [
          {
            id: 101,
            name: "Fullstack JavaScript",
            code: "FSJS101",
            description: "Learn fullstack development",
            urlImage: "https://example.com/fsjs.jpg",
            isActive: true,
          },
        ],
        message: "Courses retrieved successfully",
      });
    });

    test("should return an empty array if user has no courses", async () => {
      db.User.findByPk.mockResolvedValue({ courses: [] });

      await getUserCourses(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: [],
        message: "Courses retrieved successfully",
      });
    });

    test("should return 500 on internal server error", async () => {
      db.User.findByPk.mockRejectedValue(new Error("Internal Server Error"));

      await getUserCourses(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });
  describe("getAllCourse", () => {
    let req, res, db, Op, getAllCourse, sequelize;

    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;

      getAllCourse = (await import("@/controllers/course.controller.js"))
        .getAllCourse;
      sequelize = (await import("@/models/index.js")).default.sequelize;
      Op = sequelize.Op;

      req = { query: {} };
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

    test("should successfully get all course with query params", async () => {
      req.query = {
        limit: 10,
        offset: 0,
        search: "",
      };

      const mockCourse = {
        count: 1,
        rows: [{ id: "1", name: "JavaScript Basics" }],
      };

      db.Course.findAndCountAll.mockResolvedValue(mockCourse);

      await getAllCourse(req, res);

      expect(db.Course.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
          offset: 0,
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        count: mockCourse.count,
        limit: 10,
        offset: 0,
        data: mockCourse.rows,
        message: "Courses retrieved successfully",
      });
    });

    test("Should successfully get all course without query params", async () => {
      const mockCourse = {
        count: 1,
        rows: [{ id: "1", name: "JavaScript Basics" }],
      };

      db.Course.findAndCountAll.mockResolvedValue(mockCourse);

      await getAllCourse(req, res);

      expect(db.Course.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
          offset: 0,
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        count: mockCourse.count,
        limit: 10,
        offset: 0,
        data: mockCourse.rows,
        message: "Courses retrieved successfully",
      });
    });

    test("should return an empty list when no users are found", async () => {
      req.query = {
        limit: 10,
        offset: 0,
        search: "",
      };
      db.Course.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      await getAllCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        count: 0,
        limit: 10,
        offset: 0,
        data: [],
        message: "Courses retrieved successfully",
      });
    });

    test("should return courses successfully", async () => {
      req.query = {
        limit: 10,
        offset: 0,
        search: "",
      };
      db.Course.findAndCountAll.mockResolvedValue({
        count: 1,
        limit: 10,
        offset: 0,
        rows: [
          {
            id: 101,
            name: "JavaScript for Beginners",
          },
        ],
      });

      await getAllCourse(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        limit: 10,
        offset: 0,
        count: 1,
        data: [
          {
            id: 101,
            name: "JavaScript for Beginners",
          },
        ],
        message: "Courses retrieved successfully",
      });
    });

    test("Should return 500 on internal server error", async () => {
      req.query = {
        limit: 10,
        offset: 0,
        search: "",
      };
      db.Course.findAndCountAll.mockRejectedValue(
        new Error("Internal Server Error")
      );

      await getAllCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });
  describe("getCourseByIdPublic Controller", () => {
    let req, res, db, getCourseByIdPublic;

    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      getCourseByIdPublic = (await import("@/controllers/course.controller.js"))
        .getCourseByIdPublic;
      req = { params: { id: "1" } }; // Default ID
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      };
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });

    test("should return course data when found", async () => {
      const mockCourse = {
        id: "1",
        name: "JavaScript Basics",
        toJSON: jest.fn().mockReturnValue({
          id: "1",
          name: "JavaScript Basics",
        }),
      };

      db.Course.findOne.mockResolvedValue(mockCourse);

      await getCourseByIdPublic(req, res);

      expect(db.Course.findOne).toHaveBeenCalledWith({
        where: { id: "1" },
        include: expect.any(Array),
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: {
          id: "1",
          name: "JavaScript Basics",
          isAvailableCourse: true,
        },
        message: "Course retrieved successfully",
      });
    });

    test("should return 400 if course is not found", async () => {
      db.Course.findOne.mockResolvedValue(null);

      await getCourseByIdPublic(req, res);

      expect(db.Course.findOne).toHaveBeenCalledWith({
        where: { id: "1" },
        include: expect.any(Array),
      });

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Course not found",
      });
    });

    test("should return 500 on internal server error", async () => {
      db.Course.findOne.mockImplementation(() => {
        throw new Error("Internal Server Error");
      });

      await getCourseByIdPublic(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });

  describe("getCourseByIdProtected Controller", () => {
    let req, res, db, getCourseByIdProtected;

    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      getCourseByIdProtected = (
        await import("@/controllers/course.controller.js")
      ).getCourseByIdProtected;

      req = {
        params: { id: "1" },
        user: { id: "123" },
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
    const mockCourse = {
      id: "1",
      name: "JavaScript Basics",
      toJSON: jest.fn().mockReturnValue({
        id: "1",
        name: "JavaScript Basics",
      }),
    };
    test("should return course as available when not in cart, not purchased, and no pending orders", async () => {
      db.Course.findOne.mockResolvedValue(mockCourse);
      db.Cart.findOne.mockResolvedValue(null);
      db.UserCourse.findAll.mockResolvedValue([]);
      db.Order.findAll.mockResolvedValue([]);

      await getCourseByIdProtected(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: {
          id: "1",
          name: "JavaScript Basics",
          isAvailableCourse: true,
        },
        message: "Course retrieved successfully",
      });
    });

    test("should return course as unavailable when in cart", async () => {
      db.Course.findOne.mockResolvedValue(mockCourse);
      db.Cart.findOne.mockResolvedValue({ id: "cart123" });
      db.UserCourse.findAll.mockResolvedValue([]);
      db.Order.findAll.mockResolvedValue([]);

      await getCourseByIdProtected(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ isAvailableCourse: false }),
        })
      );
    });

    test("should return course as unavailable when user already purchased it", async () => {
      db.Course.findOne.mockResolvedValue(mockCourse);
      db.Cart.findOne.mockResolvedValue(null);
      db.UserCourse.findAll.mockResolvedValue([{ id: "userCourse123" }]);
      db.Order.findAll.mockResolvedValue([]);

      await getCourseByIdProtected(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ isAvailableCourse: false }),
        })
      );
    });

    test("should return course as unavailable when in pending order", async () => {
      db.Course.findOne.mockResolvedValue(mockCourse);
      db.Cart.findOne.mockResolvedValue(null);
      db.UserCourse.findAll.mockResolvedValue([]);
      db.Order.findAll.mockResolvedValue([
        {
          data: [{ id: "1" }],
        },
      ]);

      await getCourseByIdProtected(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ isAvailableCourse: false }),
        })
      );
    });

    test("should return course as unavailable when in pending order with different course", async () => {
      db.Course.findOne.mockResolvedValue(mockCourse);
      db.Cart.findOne.mockResolvedValue(null);
      db.UserCourse.findAll.mockResolvedValue([]);
      db.Order.findAll.mockResolvedValue([
        {
          data: [{ id: "2" }],
        },
      ]);

      await getCourseByIdProtected(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("should return 400 if course not found", async () => {
      db.Course.findOne.mockResolvedValue(null);

      await getCourseByIdProtected(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Course not found",
      });
    });

    test("should return 500 on server error", async () => {
      db.Course.findOne.mockImplementation(() => {
        throw new Error("Internal Server Error");
      });

      await getCourseByIdProtected(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });

  describe("getCourseByIdLms Controller", () => {
    let req, res, db, getCourseByIdLms;

    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      getCourseByIdLms = (await import("@/controllers/course.controller.js"))
        .getCourseByIdLms;
      req = {
        params: { id: "1" },
        user: { id: "123" }, // Mock user ID
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      };
    });

    test("should return course if user has access", async () => {
      const mockUserCourses = [{ courseId: "1" }];
      const mockCourse = {
        id: "1",
        name: "JavaScript Basics",
      };

      db.UserCourse.findAll.mockResolvedValue(mockUserCourses);
      db.Course.findOne.mockResolvedValue(mockCourse);

      await getCourseByIdLms(req, res);

      expect(db.UserCourse.findAll).toHaveBeenCalledWith({
        attributes: ["courseId"],
        where: { userId: "123" },
      });

      expect(db.Course.findOne).toHaveBeenCalledWith({
        where: { id: "1" },
        include: expect.any(Array),
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: {
          id: "1",
          name: "JavaScript Basics",
        },
        message: "Successfully get course lms by Id",
      });
    });

    test("should return 404 if user does not have access to the course", async () => {
      db.UserCourse.findAll.mockResolvedValue([]); // User tidak memiliki akses

      await getCourseByIdLms(req, res);

      expect(db.UserCourse.findAll).toHaveBeenCalledWith({
        attributes: ["courseId"],
        where: { userId: "123" },
      });

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Course not available for this user!",
      });
    });

    test("should return 500 on server error", async () => {
      db.UserCourse.findAll.mockImplementation(() => {
        throw new Error("Internal Server Error");
      });

      await getCourseByIdLms(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });

  describe("createCourse Controller", () => {
    let req, res, db, createCourse;

    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      createCourse = (await import("@/controllers/course.controller.js"))
        .createCourse;
      req = {
        file: { filename: "course-image.jpg" },
        body: {
          id: "mocked-uuid",
          name: "JavaScript Basics",
          description: "Learn JS from scratch",
        },
      };

      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      };
      db.Course.create = jest.fn();
      jest.clearAllMocks();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test("should create a course successfully", async () => {
      const mockCourse = {
        id: "mocked-uuid",
        name: "JavaScript Basics",
        description: "Learn JS from scratch",
        urlImage: "/assets/images/courses/course-image.jpg",
      };

      db.Course.create.mockResolvedValue(mockCourse);

      await createCourse(req, res);

      expect(db.Course.create).toHaveBeenCalledWith({
        id: "mocked-uuid",
        ...req.body,
        urlImage: "/assets/images/courses/course-image.jpg",
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: mockCourse,
        message: "Create course successfully",
      });
    });

    test("should return 400 if no image is uploaded", async () => {
      req.file = null;

      await createCourse(req, res);

      expect(db.Course.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "No image uploaded" });
    });

    test("should return 500 on server error", async () => {
      db.Course.create.mockImplementation(() => {
        throw new Error("Internal Server Error");
      });

      await createCourse(req, res);
      expect(db.Course.create).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });

  describe("updateCourseById Controller", () => {
    let req, res, db, updateCourseById;

    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      updateCourseById = (await import("@/controllers/course.controller.js"))
        .updateCourseById;

      req = {
        params: { id: "mocked-course-id" },
        file: { filename: "updated-course-image.jpg" },
        body: {
          name: "Advanced JavaScript",
          description: "Deep dive into JavaScript",
        },
      };

      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      };

      db.Course.findOne = jest.fn();

      jest.clearAllMocks();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test("should update a course successfully with image", async () => {
      const mockCourse = {
        id: "mocked-course-id",
        name: "Old Course Name",
        description: "Old description",
        urlImage: "/assets/images/courses/old-image.jpg",
        update: jest.fn(),
      };

      db.Course.findOne.mockResolvedValue(mockCourse);

      await updateCourseById(req, res);

      expect(db.Course.findOne).toHaveBeenCalledWith({
        where: { id: "mocked-course-id" },
      });

      expect(mockCourse.update).toHaveBeenCalledWith({
        ...req.body,
        urlImage: "/assets/images/courses/updated-course-image.jpg",
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: mockCourse,
        message: "Course updated successfully",
      });
    });

    test("should update a course successfully without image", async () => {
      req.file = null;

      const mockCourse = {
        id: "mocked-course-id",
        name: "Old Course Name",
        description: "Old description",
        urlImage: "/assets/images/courses/old-image.jpg",
        update: jest.fn(),
      };

      db.Course.findOne.mockResolvedValue(mockCourse);

      await updateCourseById(req, res);

      expect(mockCourse.update).toHaveBeenCalledWith({
        ...req.body,
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: mockCourse,
        message: "Course updated successfully",
      });
    });

    test("should return 400 if course is not found", async () => {
      db.Course.findOne.mockResolvedValue(null);

      await updateCourseById(req, res);

      expect(db.Course.findOne).toHaveBeenCalledWith({
        where: { id: "mocked-course-id" },
      });

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Course not found",
      });
    });

    test("should return 500 on server error", async () => {
      db.Course.findOne.mockImplementation(() => {
        throw new Error("Internal Server Error");
      });

      await updateCourseById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });

  describe("deleteCourseById Controller", () => {
    let req, res, db, deleteCourseById;

    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      deleteCourseById = (await import("@/controllers/course.controller.js"))
        .deleteCourseById;

      req = {
        params: { id: "mocked-course-id" },
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

    test("should delete a course successfully", async () => {
      const mockCourse = {
        id: "mocked-course-id",
        name: "JavaScript Course",
        destroy: jest.fn(),
      };

      db.Course.findOne.mockResolvedValue(mockCourse);

      await deleteCourseById(req, res);

      expect(db.Course.findOne).toHaveBeenCalledWith({
        where: { id: "mocked-course-id" },
      });

      expect(mockCourse.destroy).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Course deleted successfully",
      });
    });

    test("should return 400 if course is not found", async () => {
      db.Course.findOne.mockResolvedValue(null);

      await deleteCourseById(req, res);

      expect(db.Course.findOne).toHaveBeenCalledWith({
        where: { id: "mocked-course-id" },
      });

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Course not found",
      });
    });

    test("should return 500 on server error", async () => {
      db.Course.findOne.mockImplementation(() => {
        throw new Error("Internal Server Error");
      });

      await deleteCourseById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });
});
