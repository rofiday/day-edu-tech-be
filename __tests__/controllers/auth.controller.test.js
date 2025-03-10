import { describe, jest, beforeEach, afterEach, test } from "@jest/globals";
jest.unstable_mockModule("@/models/index.js", () => ({
  default: {
    User: {
      findOne: jest.fn(),
      create: jest.fn(),
    },
    Role: {
      findOne: jest.fn(),
      include: jest.fn(),
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
jest.mock("@/services/firebase.service.js", () => ({
  auth: jest.fn().mockReturnValue({
    verifyIdToken: jest.fn(),
  }),
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
    sendMail: jest.fn(),
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

jest.unstable_mockModule("firebase-admin", () => ({
  default: {
    auth: jest.fn().mockReturnValue({
      verifyIdToken: jest.fn().mockResolvedValue({
        email: "test@example.com",
        name: "Test User",
      }),
    }),
    initializeApp: jest.fn(),
    credential: {
      cert: jest.fn(),
    },
  },
}));
jest.unstable_mockModule("@/services/generateCharacter.js", () => ({
  generatePassword: jest.fn(),
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
  describe("continueWithGoogle Controller", () => {
    let req,
      res,
      db,
      continueWithGoogle,
      bcrypt,
      jwt,
      admin,
      sequelize,
      generatePassword;
    let mockTransaction;

    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      continueWithGoogle = (await import("@/controllers/auth.controller.js"))
        .continueWithGoogle;
      bcrypt = (await import("bcrypt")).default;
      jwt = (await import("jsonwebtoken")).default;
      admin = (await import("firebase-admin")).default;
      generatePassword = (await import("@/services/generateCharacter.js"))
        .generatePassword;
      process.env.JWT_SECRET = "test-secret";
      process.env.COOKIE_NAME = "auth_token";

      jest.clearAllMocks();

      req = {
        body: {
          idToken: "google-id-token-123",
        },
      };

      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
        cookie: jest.fn(),
      };

      mockTransaction = {
        commit: jest.fn(),
        rollback: jest.fn(),
      };

      sequelize = { transaction: jest.fn().mockResolvedValue(mockTransaction) };

      console.log = jest.fn();
      console.error = jest.fn();
    });

    test("should log in existing user with Google", async () => {
      const mockDecodedToken = {
        email: "test@example.com",
        name: "Test User",
      };

      const mockUser = {
        id: "user-123",
        fullname: "Test User",
        username: "testuser",
        email: "test@example.com",
        dataValues: { roles: [{ roleName: "Student" }] },
      };

      const mockToken = "jwt-token-xyz";

      jest
        .spyOn(admin.auth(), "verifyIdToken")
        .mockResolvedValue(mockDecodedToken);
      jest.spyOn(db.User, "findOne").mockResolvedValue(mockUser);
      jest.spyOn(jwt, "sign").mockReturnValue(mockToken);

      await continueWithGoogle(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: expect.any(String),
        message: "Login successfully",
      });
    });

    test("should create new user when logging in with Google for the first time", async () => {
      const mockDecodedToken = {
        email: "newuser@example.com",
        name: "New User",
      };

      const mockUserId = "new-user-123";
      const mockRole = { id: "role-456" };

      const mockNewUser = {
        id: mockUserId,
        fullname: "New User",
        username: "newuser",
        email: "newuser@example.com",
        phoneNumber: "08XXXXXXXXXX",
        password: "hashed-password",
        dataValues: { roles: [] },
      };

      const mockToken = "jwt-token-for-new-user";
      const mockGeneratedPassword = "random-password";
      const mockHashedPassword = "hashed-password";

      jest
        .spyOn(admin.auth(), "verifyIdToken")
        .mockResolvedValue(mockDecodedToken);
      jest.spyOn(db.User, "findOne").mockResolvedValue(null);
      generatePassword.mockReturnValue(mockGeneratedPassword);
      jest.spyOn(bcrypt, "hash").mockResolvedValue(mockHashedPassword);
      jest.spyOn(db.User, "create").mockResolvedValue(mockNewUser);
      jest.spyOn(db.Role, "findOne").mockResolvedValue(mockRole);
      jest.spyOn(db.UserRole, "create").mockResolvedValue({});
      jest.spyOn(db.Profile, "create").mockResolvedValue({});
      jest.spyOn(jwt, "sign").mockReturnValue(mockToken);

      await continueWithGoogle(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: mockToken,
        message: "Login successfully",
      });
    });

    test("should handle error during Google authentication", async () => {
      const mockError = new Error("Invalid token");
      jest.spyOn(admin.auth(), "verifyIdToken").mockRejectedValue(mockError);

      await continueWithGoogle(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Invalid token");
    });

    test("should handle error during user creation", async () => {
      const mockDecodedToken = {
        email: "newuser@example.com",
        name: "New User",
      };

      const mockError = new Error("Database error during user creation");

      jest
        .spyOn(admin.auth(), "verifyIdToken")
        .mockResolvedValue(mockDecodedToken);
      jest.spyOn(db.User, "findOne").mockResolvedValue(null);
      generatePassword.mockReturnValue("random-password");
      jest.spyOn(bcrypt, "hash").mockResolvedValue("hashed-random-password");
      jest.spyOn(db.User, "create").mockRejectedValue(mockError);

      await continueWithGoogle(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(
        "Database error during user creation"
      );
    });
  });
  describe("Logout Controller", () => {
    let req, res, logout;

    beforeEach(async () => {
      logout = (await import("@/controllers/auth.controller.js")).logout;
      req = {};
      res = {
        clearCookie: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      };

      jest.clearAllMocks();
    });

    test("should clear cookie and return success response", async () => {
      await logout(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith("day-edutech");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Logout successfully",
      });
    });

    test("should handle errors correctly", async () => {
      const mockError = new Error("Something went wrong");
      res.clearCookie.mockImplementation(() => {
        throw mockError;
      });

      await logout(req, res);

      expect(console.error).toHaveBeenCalledWith("Something went wrong");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Something went wrong");
    });
  });
  describe("Forgot Password Controller", () => {
    let req,
      res,
      mockUser,
      mockToken,
      mockTransporter,
      db,
      forgotPassword,
      jwt,
      handlebars,
      nodemailer,
      fs;

    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      forgotPassword = (await import("@/controllers/auth.controller.js"))
        .forgotPassword;
      jwt = (await import("jsonwebtoken")).default;
      fs = (await import("fs")).default;
      nodemailer = (await import("nodemailer")).default;
      handlebars = (await import("handlebars")).default;
      req = {
        body: {
          email: "test@example.com",
        },
      };

      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      };

      mockUser = {
        id: "user-123",
        fullname: "Test User",
        email: "test@example.com",
      };

      mockToken = "jwt-reset-token";

      jest.clearAllMocks();
    });

    test("should send reset password email if user exists", async () => {
      // Mock database findOne
      db.User.findOne = jest.fn().mockResolvedValue(mockUser);

      // Mock JWT sign
      jwt.sign.mockReturnValue(mockToken);

      // Mock email template processing
      fs.readFileSync.mockReturnValue("{{fullname}} reset your password.");
      handlebars.compile.mockReturnValue(
        () => "Test User reset your password."
      );

      // Mock nodemailer transporter
      mockTransporter = {
        sendMail: jest.fn().mockResolvedValue(true),
      };
      nodemailer.createTransport.mockReturnValue(mockTransporter);

      // Execute function
      await forgotPassword(req, res);

      // Check if user was searched
      expect(db.User.findOne).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });

      // Check if JWT was created
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: "user-123", email: "test@example.com" },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Check if email was sent
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: "dayedutech@gmail.com",
        to: "test@example.com",
        subject: "please reset your password!!",
        html: "Test User reset your password.",
      });

      // Check response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message:
          "Forgot password successfully sent to email, please check your inbox!",
      });
    });

    test("should return 400 if user is not found", async () => {
      db.User.findOne = jest.fn().mockResolvedValue(null);

      await forgotPassword(req, res);

      expect(db.User.findOne).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "can't reset your password",
      });
    });

    test("should handle errors correctly", async () => {
      const mockError = new Error("Database connection failed");
      db.User.findOne = jest.fn().mockRejectedValue(mockError);

      await forgotPassword(req, res);

      expect(console.error).toHaveBeenCalledWith("Database connection failed");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Database connection failed");
    });
  });
  describe("Verify Email Controller", () => {
    let req, res, mockUser, mockToken, db, verifyEmail, jwt;

    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      verifyEmail = (await import("@/controllers/auth.controller.js"))
        .verifyEmail;
      jwt = (await import("jsonwebtoken")).default;
      req = {
        query: {
          token: "valid-jwt-token",
        },
      };

      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
        redirect: jest.fn(),
      };

      mockUser = {
        id: "user-123",
        isActive: false,
        save: jest.fn().mockResolvedValue(true),
      };

      mockToken = { id: "user-123" };

      jest.clearAllMocks();
    });

    test("should return 400 if token is missing", async () => {
      req.query.token = undefined;

      await verifyEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Invalid to verify",
      });
    });

    test("should return 400 if token is invalid", async () => {
      jwt.verify.mockReturnValue(null);

      await verifyEmail(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Invalid to verify",
      });
    });

    test("should return 400 if user is not found", async () => {
      jwt.verify.mockReturnValue(mockToken);
      db.User.findOne = jest.fn().mockResolvedValue(null);

      await verifyEmail(req, res);

      expect(db.User.findOne).toHaveBeenCalledWith({
        where: { id: "user-123" },
      });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Invalid to verify",
      });
    });

    test("should activate user and redirect to login if user is found", async () => {
      jwt.verify.mockReturnValue(mockToken);
      db.User.findOne = jest.fn().mockResolvedValue(mockUser);

      await verifyEmail(req, res);

      expect(mockUser.isActive).toBe(true);
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(process.env.APP_URL + "/login");
    });

    test("should handle errors and return 500", async () => {
      const mockError = new Error("Database error");
      jwt.verify.mockReturnValue(mockToken);
      db.User.findOne = jest.fn().mockRejectedValue(mockError);

      await verifyEmail(req, res);

      expect(console.error).toHaveBeenCalledWith("Database error");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Database error");
    });
  });
  describe("Reset Password Controller", () => {
    let req, res, mockUser, mockToken, db, jwt, bcrypt;

    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      resetPassword = (await import("@/controllers/auth.controller.js"))
        .resetPassword;
      jwt = (await import("jsonwebtoken")).default;
      bcrypt = (await import("bcrypt")).default;
      req = {
        body: { password: "newPassword123" },
        query: { token: "valid-jwt-token" },
      };

      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      };

      mockUser = {
        id: "user-123",
        password: "oldHashedPassword",
        save: jest.fn().mockResolvedValue(true),
      };

      mockToken = { id: "user-123" };

      jest.clearAllMocks();
    });

    test("should return 400 if token is missing", async () => {
      req.query.token = undefined;

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Invalid to reset password",
      });
    });

    test("should return 400 if token is invalid", async () => {
      jwt.verify.mockReturnValue(null);

      await resetPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Invalid to reset password",
      });
    });

    test("should return 400 if user is not found", async () => {
      jwt.verify.mockReturnValue(mockToken);
      db.User.findOne = jest.fn().mockResolvedValue(null);

      await resetPassword(req, res);

      expect(db.User.findOne).toHaveBeenCalledWith({
        where: { id: "user-123" },
      });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Invalid to reset password",
      });
    });

    test("should hash password, update user and return 200", async () => {
      jwt.verify.mockReturnValue(mockToken);
      db.User.findOne = jest.fn().mockResolvedValue(mockUser);
      bcrypt.hash.mockResolvedValue("hashedNewPassword");

      await resetPassword(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith("newPassword123", 10);
      expect(mockUser.password).toBe("hashedNewPassword");
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Reset password successfully!",
      });
    });

    test("should handle errors and return 500", async () => {
      const mockError = new Error("Database error");
      jwt.verify.mockReturnValue(mockToken);
      db.User.findOne = jest.fn().mockRejectedValue(mockError);

      await resetPassword(req, res);

      expect(console.error).toHaveBeenCalledWith("Database error");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Database error");
    });
  });
});
