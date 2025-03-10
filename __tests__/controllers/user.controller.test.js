import { describe, jest, beforeEach, afterEach, test } from "@jest/globals";

jest.unstable_mockModule("@/models/index.js", () => ({
  default: {
    User: {
      findOne: jest.fn(),
      create: jest.fn(),
      findAndCountAll: jest.fn(),
    },
    Role: {
      findOne: jest.fn(),
    },
    UserRole: {
      create: jest.fn(),
    },
    Profile: {
      create: jest.fn(),
    },
    UserCourse: {
      create: jest.fn(),
      destroy: jest.fn(),
      findAll: jest.fn(),
    },
    Course: {
      destroy: jest.fn(),
    },
    sequelize: {
      transaction: jest.fn().mockResolvedValue({
        commit: jest.fn(),
        rollback: jest.fn(),
      }),
      Op: {
        or: jest.fn(),
        like: jest.fn(),
      },
    },
  },
}));

jest.unstable_mockModule("bcrypt", () => ({
  default: {
    hash: jest.fn(),
  },
}));
jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    sign: jest.fn(),
  },
}));
jest.unstable_mockModule("handlebars", () => ({
  default: {
    compile: jest.fn().mockReturnValue(jest.fn()),
  },
}));
jest.unstable_mockModule("nodemailer", () => ({
  default: {
    createTransport: jest.fn().mockReturnValue({ sendMail: jest.fn() }),
  },
}));
jest.unstable_mockModule("fs", () => ({
  default: {
    readFileSync: jest.fn(),
  },
}));

describe("User Controller", () => {
  describe("getAllUser", () => {
    let db, getAllUser, req, res;

    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      getAllUser = (await import("@/controllers/user.controller.js"))
        .getAllUser;
      jest.clearAllMocks();

      req = {
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

    test("should successfully get all users with query params", async () => {
      req.query = {
        limit: "10",
        offset: "0",
        search: "",
      };

      const mockUsers = {
        count: 1,
        rows: [
          { id: "1", fullname: "Student", email: "student@dayedutech.com" },
        ],
      };

      db.User.findAndCountAll.mockResolvedValue(mockUsers);

      await getAllUser(req, res);

      expect(db.User.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
          offset: 0,
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        count: mockUsers.count,
        limit: "10",
        offset: "0",
        data: mockUsers.rows,
        message: "Users retrieved successfully",
      });
    });

    test("should successfully get all users without query params (use default values)", async () => {
      const mockUsers = {
        count: 1,
        rows: [
          { id: "1", fullname: "Student", email: "student@dayedutech.com" },
        ],
      };

      db.User.findAndCountAll.mockResolvedValue(mockUsers);

      await getAllUser(req, res);

      expect(db.User.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
          offset: 0,
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        count: mockUsers.count,
        limit: 10,
        offset: 0,
        data: mockUsers.rows,
        message: "Users retrieved successfully",
      });
    });

    test("should return an empty list when no users are found", async () => {
      db.User.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      await getAllUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        count: 0,
        limit: 10,
        offset: 0,
        data: [],
        message: "Users retrieved successfully",
      });
    });

    test("should return 500 on internal server error", async () => {
      db.User.findAndCountAll.mockImplementation(() => {
        throw new Error("Internal Server Error");
      });
      console.error = jest.fn();
      await getAllUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });
  describe("getUserById", () => {
    let db, getUserById, req, res;

    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      getUserById = (await import("@/controllers/user.controller.js"))
        .getUserById;
      jest.clearAllMocks();

      req = {
        params: { id: "1" },
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

    test("should successfully get user by id", async () => {
      const mockUser = {
        id: "1",
        fullname: "John Doe",
        email: "john@example.com",
      };

      db.User.findOne.mockResolvedValue(mockUser);

      await getUserById(req, res);

      expect(db.User.findOne).toHaveBeenCalledWith({
        where: { id: "1" },
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: mockUser,
        message: "User retrieved successfully",
      });
    });

    test("should return null if user is not found", async () => {
      db.User.findOne.mockResolvedValue(null);

      await getUserById(req, res);

      expect(db.User.findOne).toHaveBeenCalledWith({
        where: { id: "1" },
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: null,
        message: "User retrieved successfully",
      });
    });

    test("should return 500 on internal server error", async () => {
      db.User.findOne.mockImplementation(() => {
        throw new Error("Internal Server Error");
      });

      await getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });
  describe("createUser", () => {
    let db, createUser, req, res, bcrypt, jwt, nodemailer;

    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      createUser = (await import("@/controllers/user.controller.js"))
        .createUser;
      bcrypt = (await import("bcrypt")).default;
      jwt = (await import("jsonwebtoken")).default;
      nodemailer = (await import("nodemailer")).default;

      jest.clearAllMocks();

      req = {
        body: {
          fullname: "John Doe",
          username: "johndoe",
          phoneNumber: "123456789",
          email: "john@example.com",
          courses: [{ value: "course1" }, { value: "course2" }],
        },
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

    test("should successfully create a user", async () => {
      const mockTransaction = {
        commit: jest.fn().mockResolvedValue(),
        rollback: jest.fn().mockResolvedValue(),
      };
      db.sequelize.transaction.mockResolvedValue(mockTransaction);
      bcrypt.hash.mockResolvedValue("hashedPassword");
      jwt.sign.mockReturnValue("mockToken");
      nodemailer.createTransport.mockReturnValue({
        sendMail: jest.fn().mockResolvedValue(true),
      });

      db.User.create.mockResolvedValue({ id: "1", ...req.body });
      db.UserCourse.create.mockResolvedValue(true);
      db.Role.findOne.mockResolvedValue({ id: "role1" });
      db.UserRole.create.mockResolvedValue(true);
      db.Profile.create.mockResolvedValue(true);

      await createUser(req, res);

      expect(db.User.create).toHaveBeenCalledWith(
        expect.objectContaining({
          fullname: "John Doe",
          username: "johndoe",
          phoneNumber: "123456789",
          email: "john@example.com",
        }),
        { transaction: mockTransaction }
      );

      expect(db.UserCourse.create).toHaveBeenCalledTimes(2);
      expect(db.UserRole.create).toHaveBeenCalled();
      expect(db.Profile.create).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: expect.objectContaining({
          fullname: "John Doe",
          username: "johndoe",
        }),
        message: "User created successfully, waiting user to verify",
      });
    });

    test("should return 404 if role 'Student' is not found", async () => {
      db.sequelize.transaction.mockResolvedValue({
        commit: jest.fn().mockResolvedValue(),
        rollback: jest.fn().mockResolvedValue(),
      });

      bcrypt.hash.mockResolvedValue("hashedPassword");
      db.User.create.mockResolvedValue({ id: "1", ...req.body });

      // Mocking Role.findOne agar mengembalikan null
      db.Role.findOne.mockResolvedValue(null);

      console.error = jest.fn();

      await createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Role not found",
      });
    });

    test("should return 500 on internal server error", async () => {
      db.sequelize.transaction.mockResolvedValue({
        commit: jest.fn().mockResolvedValue(),
        rollback: jest.fn().mockResolvedValue(),
      });
      bcrypt.hash.mockResolvedValue("hashedPassword");

      db.User.create = jest.fn().mockImplementation(() => {
        throw new Error("Internal Server Error");
      });

      console.error = jest.fn();
      await createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });
  describe("updateUserById", () => {
    let db, updateUserById, req, res, bcrypt;

    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      updateUserById = (await import("@/controllers/user.controller.js"))
        .updateUserById;
      bcrypt = (await import("bcrypt")).default;
      jest.clearAllMocks();

      req = {
        params: { id: "1" },
        body: {
          fullname: null,
          username: null,
          phoneNumber: null,
          email: null,
          password: "newpassword",
          courses: [{ value: "course-1" }, { value: "course-2" }],
        },
      };

      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      };

      // Mock data pengguna
      db.User.findOne = jest.fn();
      db.UserCourse.findAll = jest.fn();
      db.UserCourse.create = jest.fn();
      bcrypt.hash = jest.fn();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test("should successfully update user and update courses", async () => {
      req = {
        params: { id: "1" },
        body: {
          fullname: "Updated Name",
          username: "updatedusername",
          phoneNumber: "123456789",
          email: "updated@example.com",
          password: "newpassword",
          courses: [{ value: "course-1" }, { value: "course-2" }],
        },
      };
      const mockUser = {
        id: "1",
        fullname: "Old Name",
        username: "oldusername",
        phoneNumber: "987654321",
        email: "old@example.com",
        password: "hashedOldPassword",
        courses: [],
        update: jest.fn().mockResolvedValue(),
      };

      const mockUserCourses = [
        { destroy: jest.fn().mockResolvedValue() },
        { destroy: jest.fn().mockResolvedValue() },
      ];

      db.User.findOne.mockResolvedValue(mockUser);
      db.UserCourse.findAll.mockResolvedValue(mockUserCourses);
      db.UserCourse.create.mockResolvedValue({});
      bcrypt.hash.mockResolvedValue("hashedNewPassword");

      await updateUserById(req, res);

      expect(mockUserCourses[0].destroy).toHaveBeenCalled();
      expect(mockUserCourses[1].destroy).toHaveBeenCalled();

      expect(db.UserCourse.create).toHaveBeenCalledWith({
        id: expect.any(String),
        userId: "1",
        courseId: "course-1",
        data: {},
      });
      expect(db.UserCourse.create).toHaveBeenCalledWith({
        id: expect.any(String),
        userId: "1",
        courseId: "course-2",
        data: {},
      });

      expect(mockUser.update).toHaveBeenCalledWith({
        username: "updatedusername",
        fullname: "Updated Name",
        phoneNumber: "123456789",
        email: "updated@example.com",
        courses: mockUser.courses,
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: mockUser,
        message: "User updated successfully",
      });
    });
    test("should successfully update user and update courses but without parameters", async () => {
      const mockUser = {
        id: "1",
        fullname: "Old Name",
        username: "oldusername",
        phoneNumber: "987654321",
        email: "old@example.com",
        password: "hashedOldPassword",
        courses: [],
        update: jest.fn().mockResolvedValue(),
      };

      const mockUserCourses = [
        { destroy: jest.fn().mockResolvedValue() },
        { destroy: jest.fn().mockResolvedValue() },
      ];

      db.User.findOne.mockResolvedValue(mockUser);
      db.UserCourse.findAll.mockResolvedValue(mockUserCourses);
      db.UserCourse.create.mockResolvedValue({});
      bcrypt.hash.mockResolvedValue("hashedNewPassword");

      await updateUserById(req, res);

      expect(mockUserCourses[0].destroy).toHaveBeenCalled();
      expect(mockUserCourses[1].destroy).toHaveBeenCalled();

      expect(db.UserCourse.create).toHaveBeenCalledWith({
        id: expect.any(String),
        userId: "1",
        courseId: "course-1",
        data: {},
      });
      expect(db.UserCourse.create).toHaveBeenCalledWith({
        id: expect.any(String),
        userId: "1",
        courseId: "course-2",
        data: {},
      });

      expect(mockUser.update).toHaveBeenCalledWith({
        fullname: "Old Name",
        username: "oldusername",
        phoneNumber: "987654321",
        email: "old@example.com",
        courses: mockUser.courses,
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: mockUser,
        message: "User updated successfully",
      });
    });

    test("should update user without changing password", async () => {
      req = {
        params: { id: "1" },
        body: {
          fullname: "Updated Name",
          username: "updatedusername",
          phoneNumber: "123456789",
          email: "updated@example.com",
          password: "newpassword",
          courses: [{ value: "course-1" }, { value: "course-2" }],
        },
      };
      req.body.password = null;

      const mockUser = {
        id: "1",
        fullname: "Old Name",
        username: "oldusername",
        phoneNumber: "987654321",
        email: "old@example.com",
        password: "hashedOldPassword",
        courses: [],
        update: jest.fn().mockResolvedValue(),
      };

      db.User.findOne.mockResolvedValue(mockUser);
      db.UserCourse.findAll.mockResolvedValue([]);
      db.UserCourse.create.mockResolvedValue({});

      await updateUserById(req, res);

      expect(bcrypt.hash).not.toHaveBeenCalled();

      expect(mockUser.update).toHaveBeenCalledWith({
        username: "updatedusername",
        fullname: "Updated Name",
        phoneNumber: "123456789",
        email: "updated@example.com",
        courses: mockUser.courses,
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: mockUser,
        message: "User updated successfully",
      });
    });

    test("should handle error when updating user", async () => {
      req = {
        params: { id: "1" },
        body: {
          fullname: "Updated Name",
          username: "updatedusername",
          phoneNumber: "123456789",
          email: "updated@example.com",
          password: "newpassword",
          courses: [{ value: "course-1" }, { value: "course-2" }],
        },
      };
      db.User.findOne.mockImplementation(() => {
        throw new Error("Internal Server Error");
      });

      console.error = jest.fn();

      await updateUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });

  describe("deleteUserById", () => {
    let db, deleteUserById, req, res;

    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      deleteUserById = (await import("@/controllers/user.controller.js"))
        .deleteUserById;
      jest.clearAllMocks();

      req = {
        params: { id: "1" },
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

    test("should successfully delete a user", async () => {
      const mockUser = {
        id: "1",
        destroy: jest.fn().mockResolvedValue(),
      };

      db.User.findOne = jest.fn().mockResolvedValue(mockUser);

      await deleteUserById(req, res);

      expect(db.User.findOne).toHaveBeenCalledWith({ where: { id: "1" } });
      expect(mockUser.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "User deleted successfully",
      });
    });

    test("should return 500 on internal server error", async () => {
      db.User.findOne = jest.fn().mockImplementation(() => {
        throw new Error("Internal Server Error");
      });

      console.error = jest.fn();
      await deleteUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });
});
