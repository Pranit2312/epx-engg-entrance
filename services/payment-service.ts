/**
 * Payment Service Abstraction
 *
 * Prepare for future integration with:
 * - Razorpay
 * - Stripe
 *
 * For now, implements mock subscription activation.
 */

export type PaymentProvider = "razorpay" | "stripe" | "mock"

export type PaymentRequest = {
  userId: string
  planId: string
  provider?: PaymentProvider
}

export type PaymentResult = {
  success: boolean
  orderId?: string
  error?: string
}

export const paymentService = {
  async createOrder(_request: PaymentRequest): Promise<PaymentResult> {
    // Mock: simulate payment success
    await new Promise((r) => setTimeout(r, 500))
    return {
      success: true,
      orderId: `mock_order_${Date.now()}`,
    }
  },

  async verifyPayment(_orderId: string, _paymentId: string): Promise<boolean> {
    // Mock: always verify
    return true
  },

  async initiateRefund(_userId: string, _planId: string): Promise<PaymentResult> {
    return { success: true }
  },
}
