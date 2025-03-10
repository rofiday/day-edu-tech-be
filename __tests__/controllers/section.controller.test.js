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
    Section: {
      findAndCountAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
    },
    Course: {
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

jest.unstable_mockModule("uuid", () => ({
  v4: jest.fn(() => "mocked-uuid"),
}));

describe("Section Controller", () => {
  describe("getAllAvailableSections", () => {
    let db, req, res, getAllAvailableSections;
    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      getAllAvailableSections = (
        await import("@/controllers/section.controller.js")
      ).getAllAvailableSections;
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

    test("should return all available sections", async () => {
      const mockSections = [
        { id: 1, name: "Section 1" },
        { id: 2, name: "Section 2" },
      ];

      db.Section.findAndCountAll.mockResolvedValue({
        rows: mockSections,
        count: mockSections.length,
      });

      await getAllAvailableSections(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        count: mockSections.length,
        data: mockSections,
        message: "Sections retrieved successfully",
      });
    });
    test("should return 500 on server error", async () => {
      db.Section.findAndCountAll.mockImplementation(() => {
        throw new Error("Internal Server Error");
      });
      console.error = jest.fn();
      await getAllAvailableSections(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });
  describe("getAllSection", () => {
    let db, req, res, getAllSection;
    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      getAllSection = (await import("@/controllers/section.controller.js"))
        .getAllSection;
      req = {
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

    test("should return all sections", async () => {
      req.query = {
        limit: 10,
        offset: 0,
        search: "",
      };
      const mockSections = [
        { id: 1, name: "Section 1" },
        { id: 2, name: "Section 2" },
      ];

      db.Section.findAndCountAll.mockResolvedValue({
        rows: mockSections,
        count: mockSections.length,
      });

      await getAllSection(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        count: mockSections.length,
        limit: 10,
        offset: 0,
        data: mockSections,
        message: "Sections retrieved successfully",
      });
    });
    test("should successfully get all course with query params", async () => {
      req.query = {
        limit: 10,
        offset: 0,
        search: "",
      };

      const mockSection = {
        count: 1,
        rows: [{ id: "1", title: "JavaScript Basics" }],
      };

      db.Section.findAndCountAll.mockResolvedValue(mockSection);

      await getAllSection(req, res);

      expect(db.Section.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
          offset: 0,
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        count: mockSection.count,
        limit: 10,
        offset: 0,
        data: mockSection.rows,
        message: "Sections retrieved successfully",
      });
    });

    test("Should successfully get all course without query params", async () => {
      const mockSection = {
        count: 1,
        rows: [{ id: "1", name: "JavaScript Basics" }],
      };

      db.Section.findAndCountAll.mockResolvedValue(mockSection);

      await getAllSection(req, res);

      expect(db.Section.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
          offset: 0,
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        count: mockSection.count,
        limit: 10,
        offset: 0,
        data: mockSection.rows,
        message: "Sections retrieved successfully",
      });
    });

    test("should return an empty list when no users are found", async () => {
      req.query = {
        limit: 10,
        offset: 0,
        search: "",
      };
      db.Section.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      await getAllSection(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        count: 0,
        limit: 10,
        offset: 0,
        data: [],
        message: "Sections retrieved successfully",
      });
    });
    test("should return 500 on server error", async () => {
      req.query = {
        limit: 10,
        offset: 0,
        search: "",
      };
      db.Section.findAndCountAll.mockImplementation(() => {
        throw new Error("Internal Server Error");
      });
      console.error = jest.fn();
      await getAllSection(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });
  describe("getSectionById", () => {
    let db, req, res, getSectionById;
    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      getSectionById = (await import("@/controllers/section.controller.js"))
        .getSectionById;
      req = {
        params: {
          id: "1",
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

    test("should return a section", async () => {
      const mockSection = {
        id: "1",
        name: "JavaScript Basics",
      };

      db.Section.findOne.mockResolvedValue(mockSection);

      await getSectionById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: mockSection,
        message: "Section retrieved successfully",
      });
    });
    test("should return 404 if section is not found", async () => {
      db.Section.findOne.mockResolvedValue(null);

      await getSectionById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Section not found",
      });
    });
    test("should return 500 on server error", async () => {
      db.Section.findOne.mockImplementation(() => {
        throw new Error("Internal Server Error");
      });
      console.error = jest.fn();
      await getSectionById(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });
  describe("createSection", () => {
    let db, req, res, createSection;
    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      createSection = (await import("@/controllers/section.controller.js"))
        .createSection;
      req = {
        body: {
          name: "JavaScript Basics",
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

    test("should create a section", async () => {
      const mockSection = {
        id: "1",
        name: "JavaScript Basics",
      };

      db.Section.create.mockResolvedValue(mockSection);

      await createSection(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: mockSection,
        message: "Create section successfully",
      });
    });
    test("should return 500 on server error", async () => {
      db.Section.create.mockImplementation(() => {
        throw new Error("Internal Server Error");
      });
      console.error = jest.fn();
      await createSection(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });
  describe("updateSectionById", () => {
    let db, req, res, updateSectionById;
    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      updateSectionById = (await import("@/controllers/section.controller.js"))
        .updateSectionById;
      req = {
        params: {
          id: "1",
        },
        body: {
          name: "JavaScript Basics",
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

    test("should update a section", async () => {
      const mockSection = {
        id: "1",
        name: "JavaScript Logic",
        update: jest.fn(),
      };

      db.Section.findOne.mockResolvedValue(mockSection);

      await updateSectionById(req, res);
      expect(mockSection.update).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: mockSection,
        message: "Section updated successfully",
      });
    });
    test("should return 404 if section is not found", async () => {
      db.Section.findOne.mockResolvedValue(null);

      await updateSectionById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Section not found",
      });
    });
    test("should return 500 on server error", async () => {
      db.Section.findOne.mockImplementation(() => {
        throw new Error("Internal Server Error");
      });
      console.error = jest.fn();
      await updateSectionById(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });
  describe("deleteSectionById", () => {
    let db, req, res, deleteSectionById;
    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      deleteSectionById = (await import("@/controllers/section.controller.js"))
        .deleteSectionById;
      req = {
        params: {
          id: "1",
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

    test("should delete a section", async () => {
      const mockSection = {
        id: "1",
        name: "JavaScript Basics",
        destroy: jest.fn(),
      };

      db.Section.findOne.mockResolvedValue(mockSection);

      await deleteSectionById(req, res);
      expect(mockSection.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Section deleted successfully",
      });
    });
    test("should return 404 if section is not found", async () => {
      db.Section.findOne.mockResolvedValue(null);

      await deleteSectionById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Section not found",
      });
    });
    test("should return 500 on server error", async () => {
      db.Section.findOne.mockImplementation(() => {
        throw new Error("Internal Server Error");
      });
      console.error = jest.fn();
      await deleteSectionById(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });
});
