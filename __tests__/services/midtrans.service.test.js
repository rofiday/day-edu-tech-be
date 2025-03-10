import {
  describe,
  jest,
  beforeEach,
  afterEach,
  test,
  expect,
} from "@jest/globals";

jest.unstable_mockModule("axios", () => ({
  default: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

describe("Midtrans Service", () => {
  describe("midtransCreateSnapTransaction", () => {
    let transactionDetails,
      mockResponse,
      snapUrl,
      serverKey,
      res,
      axios,
      midtransCreateSnapTransaction;

    beforeEach(async () => {
      midtransCreateSnapTransaction = (
        await import("@/services/midtrans.service.js")
      ).midtransCreateSnapTransaction;
      axios = (await import("axios")).default;
      snapUrl = "https://api.sandbox.midtrans.com/v2";
      serverKey = "SB-Mid-server-123456"; // contoh server key

      res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
      transactionDetails = {
        transaction_details: {
          order_id: "order-12345",
          gross_amount: 150000,
        },
        customer_details: {
          email: "customer@example.com",
        },
      };

      mockResponse = {
        data: {
          token: "snap-token-123",
          redirect_url: "https://app.sandbox.midtrans.com/snap/v2/order-12345",
        },
      };

      jest.clearAllMocks();
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });

    test("should return transaction data when request is successful", async () => {
      axios.post.mockResolvedValue(mockResponse);

      const result = await midtransCreateSnapTransaction(transactionDetails);

      expect(result).toEqual(mockResponse.data);
    });

    test("should throw error with Midtrans error message when response contains error_messages", async () => {
      const mockError = {
        response: {
          data: {
            error_messages: ["Transaction failed due to insufficient balance"],
          },
        },
      };
      console.error = jest.fn();
      axios.post.mockRejectedValue(mockError);

      await expect(
        midtransCreateSnapTransaction(transactionDetails)
      ).rejects.toThrow("Transaction failed due to insufficient balance");

      expect(axios.post).toHaveBeenCalled();
    });
    test("should throw error with Midtrans error message when response not contains error_messages", async () => {
      const mockError = {
        response: {
          data: {
            error_messages: null,
          },
        },
      };
      console.error = jest.fn();
      axios.post.mockRejectedValue(mockError);

      await expect(
        midtransCreateSnapTransaction(transactionDetails)
      ).rejects.toThrow("Failed to create snap transaction");

      expect(axios.post).toHaveBeenCalled();
    });
  });
  describe("midtransCheckTransaction", () => {
    let baseUrl, serverKey, orderId, axios, midtransCheckTransaction;
    beforeEach(async () => {
      midtransCheckTransaction = (
        await import("@/services/midtrans.service.js")
      ).midtransCheckTransaction;
      axios = (await import("axios")).default;
      baseUrl = "https://api.sandbox.midtrans.com/v2";
      serverKey = "dummy-server-key";
      orderId = "ORDER-123";
      jest.clearAllMocks();
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });
    test("should return transaction data when request is successful", async () => {
      const mockResponse = {
        data: {
          transaction_status: "settlement",
          order_id: orderId,
          gross_amount: 100000,
        },
      };

      axios.get.mockResolvedValue(mockResponse);

      const result = await midtransCheckTransaction(orderId);

      expect(result).toEqual(mockResponse.data);
      expect(axios.get).toHaveBeenCalledWith(
        `${baseUrl}/${orderId}/status`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringContaining("Basic"),
          }),
        })
      );
    });

    test("should throw error with Midtrans error message when response contains error_messages", async () => {
      const mockError = {
        response: {
          data: {
            error_messages: ["Transaction ID is invalid"],
          },
        },
      };

      axios.get.mockRejectedValue(mockError);

      await expect(midtransCheckTransaction(orderId)).rejects.toThrow(
        "Transaction ID is invalid"
      );

      expect(axios.get).toHaveBeenCalled();
    });

    test("should throw default error message when Midtrans response is missing error_messages", async () => {
      const mockError = {
        response: {
          data: {},
        },
      };
      console.error = jest.fn();
      axios.get.mockRejectedValue(mockError);

      await expect(midtransCheckTransaction(orderId)).rejects.toThrow(
        "Failed to check transaction status"
      );
    });

    test("should throw default error message when error.response is undefined (e.g., network error)", async () => {
      const mockError = new Error("Network Error");

      axios.get.mockRejectedValue(mockError);

      await expect(midtransCheckTransaction(orderId)).rejects.toThrow(
        "Failed to check transaction status"
      );
    });
  });
  describe("midtransCancelTransaction", () => {
    let baseUrl, serverKey, orderId, axios, midtransCancelTransaction;

    beforeEach(async () => {
      midtransCancelTransaction = (
        await import("@/services/midtrans.service.js")
      ).midtransCancelTransaction;
      axios = (await import("axios")).default;
      baseUrl = "https://api.sandbox.midtrans.com/v2";
      serverKey = "dummy-server-key";
      orderId = "ORDER-123";
      jest.clearAllMocks();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test("should return transaction data when cancellation is successful", async () => {
      const mockResponse = {
        data: {
          status_code: "200",
          order_id: orderId,
          transaction_status: "cancel",
        },
      };

      axios.post.mockResolvedValue(mockResponse);

      const result = await midtransCancelTransaction(orderId);

      expect(result).toEqual(mockResponse.data);
      expect(axios.post).toHaveBeenCalledWith(
        `${baseUrl}/${orderId}/cancel`,
        {},
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringContaining("Basic"),
          }),
        })
      );
    });

    test("should throw error with Midtrans error message when response contains error_messages", async () => {
      const mockError = {
        response: {
          data: {
            error_messages: ["Order cannot be canceled"],
          },
        },
      };

      axios.post.mockRejectedValue(mockError);

      await expect(midtransCancelTransaction(orderId)).rejects.toThrow(
        "Order cannot be canceled"
      );

      expect(axios.post).toHaveBeenCalled();
    });

    test("should throw default error message when Midtrans response is missing error_messages", async () => {
      const mockError = {
        response: {
          data: {},
        },
      };

      axios.post.mockRejectedValue(mockError);

      await expect(midtransCancelTransaction(orderId)).rejects.toThrow(
        "Failed to Cancel Transaction"
      );
    });

    test("should throw default error message when error.response is undefined (e.g., network error)", async () => {
      const mockError = new Error("Network Error");
      mockError.response = undefined; // Simulasi error tanpa response

      axios.post.mockRejectedValue(mockError);
      console.error = jest.fn();
      await expect(midtransCancelTransaction(orderId)).rejects.toThrow(
        "Failed to Cancel Transaction"
      );
    });
  });
});
