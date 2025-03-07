import { describe, jest, beforeEach, afterEach, test } from "@jest/globals";

// Mocking database models
jest.unstable_mockModule("@/models/index.js", () => ({
  default: {
    Curriculum: {
      create: jest.fn(),
      findAndCountAll: jest.fn(),
      findOne: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
    },
    Section: {
      include: jest.fn(),
      findOne: jest.fn(),
    },
  },
}));
jest.unstable_mockModule("uuid", () => ({
  v4: jest.fn(() => "mocked-uuid"),
}));

describe("Curriculum Controller", () => {
  describe("getAllCurriculum", () => {
    let db, getAllCurriculum, req, res;

    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      getAllCurriculum = (
        await import("@/controllers/curriculum.controller.js")
      ).getAllCurriculum;
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

    test("should successfully get all curriculum with query params", async () => {
      req.query = {
        limit: "10",
        offset: "0",
        search: "",
      };
      const mockCurriculum = {
        count: 1,
        rows: [
          {
            id: "1",
            title: "Curriculum 1",
            description: "Description 1",
            sections: [
              { id: "1", title: "Section 1" },
              { id: "2", title: "Section 2" },
            ],
          },
        ],
      };

      // Mock database call
      db.Curriculum.findAndCountAll.mockResolvedValue(mockCurriculum);

      await getAllCurriculum(req, res);

      // Pastikan findAndCountAll dipanggil dengan parameter yang benar
      expect(db.Curriculum.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
          offset: 0,
        })
      );

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "success",
          count: mockCurriculum.count,
          limit: "10",
          offset: "0",
          data: mockCurriculum.rows,
          message: "Curriculums retrieved successfully",
        })
      );
    });
    test("should successfully get all curriculum without query params (use default values)", async () => {
      const mockCurriculum = {
        count: 1,
        rows: [
          { id: "1", fullname: "Student", email: "student@dayedutech.com" },
        ],
      };

      db.Curriculum.findAndCountAll.mockResolvedValue(mockCurriculum);

      await getAllCurriculum(req, res);

      expect(db.Curriculum.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
          offset: 0,
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        count: mockCurriculum.count,
        limit: 10,
        offset: 0,
        data: mockCurriculum.rows,
        message: "Curriculums retrieved successfully",
      });
    });

    test("should return an empty list when no curriculums are found", async () => {
      db.Curriculum.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      await getAllCurriculum(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        count: 0,
        limit: 10,
        offset: 0,
        data: [],
        message: "Curriculums retrieved successfully",
      });
    });
    test("should return 500 on internal server error", async () => {
      db.Curriculum.findAndCountAll.mockImplementation(() => {
        throw new Error("Internal Server Error");
      });

      console.error = jest.fn();

      await getAllCurriculum(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });
  describe("getCurriculumById", () => {
    let db, getCurriculumById, req, res;

    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      getCurriculumById = (
        await import("@/controllers/curriculum.controller.js")
      ).getCurriculumById;
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

    test("should successfully get curriculum by id", async () => {
      const mockCurriculum = {
        count: 1,
        rows: [
          {
            id: "1",
            title: "Curriculum 1",
            description: "Description 1",
            sections: [
              { id: "1", title: "Section 1" },
              { id: "2", title: "Section 2" },
            ],
          },
        ],
      };
      db.Curriculum.findOne.mockResolvedValue(mockCurriculum);

      await getCurriculumById(req, res);

      expect(db.Curriculum.findOne).toHaveBeenCalledWith({
        where: { id: "1" },
        include: expect.arrayContaining([
          expect.objectContaining({
            model: db.Section,
            as: "section",
            attributes: ["title"],
          }),
        ]),
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: mockCurriculum,
        message: "Curriculum retrieved successfully",
      });
    });
    test("should failed because internal server error", async () => {
      db.Curriculum.findOne.mockImplementation(() => {
        throw new Error("Internal Server Error");
      });
      console.error = jest.fn();
      await getCurriculumById(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });
  describe("createCurriculum", () => {
    let req, res, db, createCurriculum;

    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      createCurriculum = (
        await import("@/controllers/curriculum.controller.js")
      ).createCurriculum;
      req = {
        body: {
          title: "New Curriculum",
          description: "This is a test curriculum",
        },
      };

      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      };

      jest.clearAllMocks();
    });

    test("should successfully create a new curriculum", async () => {
      const mockCurriculum = {
        id: "mocked-uuid",
        title: "New Curriculum",
        description: "This is a test curriculum",
      };

      db.Curriculum.create.mockResolvedValue(mockCurriculum);

      await createCurriculum(req, res);

      // Pastikan `create` dipanggil dengan benar
      expect(db.Curriculum.create).toHaveBeenCalledWith({
        id: "mocked-uuid",
        ...req.body,
      });

      // Pastikan response 201 dan json sesuai
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: mockCurriculum,
        message: "Create curriculum successfully",
      });
    });
    test("should failed because internal server error", async () => {
      db.Curriculum.create.mockImplementation(() => {
        throw new Error("Internal Server Error");
      });
      console.error = jest.fn();
      await createCurriculum(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });
  describe("updateCurriculumById", () => {
    let req, res, mockCurriculum, db, updateCurriculumById;

    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      updateCurriculumById = (
        await import("@/controllers/curriculum.controller.js")
      ).updateCurriculumById;
      req = {
        params: { id: "1" },
        body: {
          title: "Updated Curriculum",
          description: "Updated Description",
        },
      };

      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      };

      mockCurriculum = {
        id: "1",
        title: "Old Curriculum",
        description: "Old Description",
        update: jest.fn().mockResolvedValue(),
      };

      jest.clearAllMocks();
    });

    test("should successfully update curriculum", async () => {
      db.Curriculum.findOne.mockResolvedValue(mockCurriculum);

      await updateCurriculumById(req, res);

      expect(db.Curriculum.findOne).toHaveBeenCalledWith({
        where: { id: "1" },
      });

      expect(mockCurriculum.update).toHaveBeenCalledWith(req.body);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: mockCurriculum,
        message: "Curriculum updated successfully",
      });
    });

    test("should return 400 if curriculum not found", async () => {
      db.Curriculum.findOne.mockResolvedValue(null);

      await updateCurriculumById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Curriculum not found",
      });
    });

    test("should return 500 if an error occurs", async () => {
      db.Curriculum.findOne.mockImplementation(() => {
        throw new Error("Database error");
      });

      await updateCurriculumById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Database error");
    });
  });
  describe("deleteCurriculumById", () => {
    let req, res, mockCurriculum, db, deleteCurriculumById;

    beforeEach(async () => {
      db = (await import("@/models/index.js")).default;
      deleteCurriculumById = (
        await import("@/controllers/curriculum.controller.js")
      ).deleteCurriculumById;
      req = { params: { id: "1" } };

      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      };

      mockCurriculum = {
        id: "1",
        title: "Test Curriculum",
        destroy: jest.fn().mockResolvedValue(),
      };

      jest.clearAllMocks();
    });

    test("should successfully delete curriculum", async () => {
      db.Curriculum.findOne.mockResolvedValue(mockCurriculum);

      await deleteCurriculumById(req, res);

      // ✅ Pastikan `findOne` dipanggil dengan benar
      expect(db.Curriculum.findOne).toHaveBeenCalledWith({
        where: { id: "1" },
      });

      // ✅ Pastikan `destroy` dipanggil
      expect(mockCurriculum.destroy).toHaveBeenCalled();

      // ✅ Pastikan response sukses
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Curriculum deleted successfully",
      });
    });

    test("should return 400 if curriculum not found", async () => {
      db.Curriculum.findOne.mockResolvedValue(null);

      await deleteCurriculumById(req, res);

      // ✅ Pastikan response error 400
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Curriculum not found",
      });
    });

    test("should return 500 if an error occurs", async () => {
      db.Curriculum.findOne.mockImplementation(() => {
        throw new Error("Database error");
      });

      await deleteCurriculumById(req, res);

      // ✅ Pastikan response error 500
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Database error");
    });
  });
});
