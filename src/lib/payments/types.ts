export type PaymentResult = { success: true; reference: string } | { success: false };

export type PaymentAttempt = {
  amountPaise: number;
  simulateSuccess: boolean;
};

// Behind an interface so a real gateway (e.g. Razorpay) can replace the
// simulation later without touching placeOrder's callers.
export interface PaymentProvider {
  readonly name: string;
  charge(attempt: PaymentAttempt): Promise<PaymentResult>;
}
