import type { PaymentProvider } from "@/lib/payments/types";

export const mockPaymentProvider: PaymentProvider = {
  name: "mock",
  async charge({ simulateSuccess }) {
    if (simulateSuccess) {
      return { success: true, reference: `mock_${crypto.randomUUID()}` };
    }
    return { success: false };
  },
};
