import { describe, jest, beforeEach, afterEach, test } from "@jest/globals";
jest.unstable_mockModule("@/models/index.js", () => ({
  default: {
    User: {
      findOne: jest.fn(),
      create: jest.fn(),
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
    sequelize: {
      transaction: jest.fn().mockResolvedValue({
        commit: jest.fn(),
        rollback: jest.fn(),
      }),
    },
  },
}));

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    sign: jest.fn(),
    verify: jest.fn(),
  },
}));

jest.unstable_mockModule("dotenv", () => ({
  default: {
    config: jest.fn(),
  },
}));

jest.unstable_mockModule("bcrypt", () => ({
  default: {
    compare: jest.fn(),
    hash: jest.fn(),
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
jest.unstable_mockModule("handlebars", () => ({
  default: {
    compile: jest.fn().mockReturnValue(jest.fn()),
  },
}));

describe("Auth Controller", () => {
  describe("register", () => {
    let db, register, bcrypt;
    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      register = (await import("@/controllers/auth.controller.js")).register;
      bcrypt = (await import("bcrypt")).default;
      jest.clearAllMocks();
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });
    test("Should fail to Role not Found", async () => {
      const req = {
        body: {
          roleName: "Student",
        },
      };
      const data = {
        status: "error",
        message: "Role not found",
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      db.Role.findOne = jest.fn().mockResolvedValue(null);
      await register(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(data);
    });
    test("Should success to register user", async () => {
      const req = {
        body: {
          fullname: "test",
          username: "test",
          phoneNumber: "081234567890",
          email: "test@example.com",
          password: "password",
          isActive: true,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      bcrypt.hash.mockResolvedValue("hashPassword");
      db.User.create.mockResolvedValue({
        id: 1,
        fullname: "test",
        username: "test",
        phoneNumber: "081234567890",
        email: "test@example.com",
        password: "hashPassword",
        isActive: true,
      });
      db.Role.findOne.mockResolvedValue({
        id: 1,
      });
      db.UserRole.create.mockResolvedValue({
        userId: 1,
        roleId: 1,
      });
      db.Profile.create.mockResolvedValue({
        userId: 1,
      });
      await register(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        data: {
          id: 1,
          fullname: "test",
          username: "test",
          phoneNumber: "081234567890",
          email: "test@example.com",
          password: "hashPassword",
          isActive: true,
        },
        status: "success",
        message: "User registered successfully, please check your email",
      });
    });
    test("Should fail to register user", async () => {
      const req = {
        body: {
          fullname: "test",
          username: "test",
          phoneNumber: "081234567890",
          email: "test@example.com",
          password: "password",
          isActive: true,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      };
      db.User.create.mockImplementation(async () => {
        throw new Error("Failed to Register");
      });
      console.error = jest.fn();
      await register(req, res);
      expect(console.error).toHaveBeenCalledWith("Failed to Register");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Failed to Register");
    });
  });
  describe("login", () => {
    let db, login, bcrypt, jwt;
    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      login = (await import("@/controllers/auth.controller.js")).login;
      bcrypt = (await import("bcrypt")).default;
      jwt = (await import("jsonwebtoken")).default;
      jest.clearAllMocks();
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });
    test("Should fail to login because user is not found", async () => {
      const req = {
        body: {
          email: "test@example.com",
          password: "password",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      };
      db.User.findOne.mockResolvedValue(null);
      await login(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "invalid email or password or user activation",
      });
    });
    test("Should fail to login because user isNotActived", async () => {
      /** mock data*/
      const req = {
        body: {
          email: "test@example.com",
          password: "password",
          isActive: false,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      };
      db.User.findOne.mockResolvedValue({
        name: "test",
        email: "test@example.com",
        isActive: false,
      });
      await login(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "invalid email or password or user activation",
      });
    });
    test("Should fail to login because password not match", async () => {
      const req = {
        body: {
          email: "test@example.com",
          password: "password",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      };
      db.User.findOne.mockResolvedValue({
        id: 1,
        fullname: "test",
        username: "test",
        phoneNumber: "081234567890",
        email: "test@example.com",
        password: "hashPassword",
        isActive: true,
      });
      bcrypt.compare.mockResolvedValue(false);
      await login(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "invalid email or password",
      });
    });
    test("Should success to login", async () => {
      const req = {
        body: {
          email: "test@example.com",
          password: "password",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
        cookie: jest.fn(),
      };
      db.User.findOne.mockResolvedValue({
        id: 1,
        username: "test",
        email: "test@example.com",
        isActive: true,
        roles: [
          {
            roleName: "Student",
          },
        ],
      });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("token");
      await login(req, res);
      expect(res.cookie).toHaveBeenCalledWith("day-edutech", "token", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: "token",
        status: "success",
        message: "Login successfully",
      });
    });
    test("Should failed because internal server error", async () => {
      const req = {
        body: {
          email: "test@example.com",
          password: "password",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      };
      db.User.findOne.mockImplementation(async () => {
        throw new Error("Internal Server Error");
      });
      await login(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });
});
