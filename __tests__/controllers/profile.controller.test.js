import { describe, jest, beforeEach, afterEach, test } from "@jest/globals";

jest.unstable_mockModule("uuid", () => ({
  v4: jest.fn(() => "mocked-uuid"),
}));
jest.unstable_mockModule("@/models/index.js", () => ({
  default: {
    Profile: {
      findAll: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
    },
    User: {
      include: jest.fn(),
    },
  },
}));

describe("Profile Controller", () => {
  describe("getAllProfile", () => {
    let db, req, res, getAllProfile;
    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      getAllProfile = (await import("@/controllers/profile.controller.js"))
        .getAllProfile;
      req = {};
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

    test("should return all profiles", async () => {
      const mockProfiles = [
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ];

      db.Profile.findAll.mockResolvedValue(mockProfiles);

      await getAllProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: mockProfiles,
        message: "Profiles retrieved successfully",
      });
    });
    test("should return 500 on server error", async () => {
      db.Profile.findAll.mockImplementation(() => {
        throw new Error("Internal Server Error");
      });
      console.error = jest.fn();
      await getAllProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });
  describe("getProfileById", () => {
    let db, req, res, getProfileById;
    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      getProfileById = (await import("@/controllers/profile.controller.js"))
        .getProfileById;
      req = {
        user: { id: 1 },
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

    test("should return a profile", async () => {
      const mockProfile = { id: 1, name: "John Doe" };

      db.Profile.findOne.mockResolvedValue(mockProfile);

      await getProfileById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: mockProfile,
        message: "Profile retrieved successfully",
      });
    });

    test("should return 404 if profile not found", async () => {
      db.Profile.findOne.mockResolvedValue(null);

      await getProfileById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Profile not found",
      });
    });
    test("should return 500 on server error", async () => {
      db.Profile.findOne.mockImplementation(() => {
        throw new Error("Internal Server Error");
      });
      console.error = jest.fn();
      await getProfileById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });
  describe("createProfile", () => {
    let req, res, db, createProfile;

    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      const profileController = await import(
        "@/controllers/profile.controller.js"
      );

      createProfile = profileController.createProfile;

      req = {
        body: {
          userId: "user-123",
          bio: "Software Engineer",
          profileImage: "/images/profile.jpg",
          address: "Jakarta, Indonesia",
          gender: "Male",
          birthDate: "1995-08-15",
          socialLinks: [
            "https://github.com/user",
            "https://linkedin.com/in/user",
          ],
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

    test("should create a profile successfully", async () => {
      const mockProfile = {
        id: "1",
        ...req.body,
      };

      db.Profile.create.mockResolvedValue(mockProfile);

      await createProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: mockProfile,
        message: "Profile created successfully",
      });
    });

    test("should return 500 on server error in createProfile", async () => {
      db.Profile.create.mockImplementation(() => {
        throw new Error("Internal Server Error");
      });
      console.error = jest.fn();
      await createProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });
  describe("updateProfileById", () => {
    let req, res, db, updateProfileById;

    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      const profileController = await import(
        "@/controllers/profile.controller.js"
      );

      updateProfileById = profileController.updateProfileById;

      req = {
        user: { id: "user-123" },
        body: {
          socialLinks: JSON.stringify([
            "https://github.com/user",
            "https://linkedin.com/in/user",
          ]),
          bio: "This is my bio",
        },
        file: { filename: "new-profile.jpg" },
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
    test("should update profile with new image and parse socialLinks", async () => {
      const mockProfile = {
        id: "profile-123",
        update: jest.fn(),
      };

      db.Profile.findOne.mockResolvedValue(mockProfile);

      await updateProfileById(req, res);

      expect(mockProfile.update).toHaveBeenCalledWith({
        socialLinks: [
          "https://github.com/user",
          "https://linkedin.com/in/user",
        ],
        bio: "This is my bio",
        profileImage: "/assets/images/profiles/new-profile.jpg",
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: mockProfile,
        message: "Profile updated successfully",
      });
    });

    test("should return a profile not including socialLinks", async () => {
      req = {
        user: { id: "user-123" },
        body: {
          socialLinks: null,
          bio: "This is my bio",
        },
        file: { filename: "new-profile.jpg" },
      };
      const mockProfile = {
        id: "profile-123",
        userId: "user-123",
        bio: "This is my bio",
        profileImage: "/assets/images/profiles/new-profile.jpg",
        address: "Jakarta, Indonesia",
        gender: "Male",
        birthDate: "1995-08-15",
        socialLinks: null,
        update: jest.fn(),
      };

      db.Profile.findOne.mockResolvedValue(mockProfile);

      await updateProfileById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: mockProfile,
        message: "Profile updated successfully",
      });
    });

    test("should update profile without new image", async () => {
      req.file = null; // Tidak ada gambar baru

      const mockProfile = {
        id: "profile-123",
        update: jest.fn(),
      };

      db.Profile.findOne.mockResolvedValue(mockProfile);

      await updateProfileById(req, res);

      expect(mockProfile.update).toHaveBeenCalledWith({
        socialLinks: [
          "https://github.com/user",
          "https://linkedin.com/in/user",
        ],
        bio: "This is my bio",
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: mockProfile,
        message: "Profile updated successfully",
      });
    });

    test("should return 500 on server error", async () => {
      db.Profile.findOne.mockImplementation(() => {
        throw new Error("Internal Server Error");
      });

      await updateProfileById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });
  describe("deleteProfileById", () => {
    let db, req, res, deleteProfileById;
    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      deleteProfileById = (await import("@/controllers/profile.controller.js"))
        .deleteProfileById;
      req = {
        params: {
          id: 1,
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

    test("should delete a profile successfully", async () => {
      let mockProfile = { id: 1, name: "John Doe", destroy: jest.fn() };

      db.Profile.findOne.mockResolvedValue(mockProfile);
      db.Profile.destroy.mockResolvedValue(mockProfile);

      await deleteProfileById(req, res);
      expect(mockProfile.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Profile deleted successfully",
      });
    });
    test("should return 500 on server error", async () => {
      db.Profile.findOne.mockImplementation(() => {
        throw new Error("Internal Server Error");
      });

      await deleteProfileById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });
});
