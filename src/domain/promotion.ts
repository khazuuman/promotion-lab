// ============================================================================
//  TẦNG DOMAIN (Clean Architecture)
//  Logic nghiệp vụ THUẦN — không phụ thuộc framework, DB, HTTP.
//  Đây chính là nơi test đơn vị (unit test) có giá trị cao nhất.
// ----------------------------------------------------------------------------
//  ⚠️  Bản này do "AGENT" viết. Nó đã có sẵn một bộ test XANH (promotion.test.ts).
//      Việc của BẠN là đóng vai người review/kiểm chứng và bắt lỗi nó.
//      ĐỪNG đọc lỗi ở đâu vội — hãy tự viết test ca biên để phát hiện.
// ============================================================================

export type Promotion =
  | { type: 'percent'; value: number; minOrderAmount: number; maxDiscount: number }
  | { type: 'fixed'; value: number; minOrderAmount: number };

export interface Order {
  /** Tổng tiền hàng, đơn vị VND, luôn là số nguyên (VND không có phần lẻ). */
  subtotal: number;
}

export interface PromotionResult {
  eligible: boolean;
  discount: number; // VND
  total: number;    // VND, sau khi trừ giảm giá
}

/**
 * Áp một khuyến mãi lên đơn hàng và trả về kết quả.
 *
 * Luật nghiệp vụ (theo đặc tả):
 *  - Đơn phải ĐẠT ngưỡng tối thiểu `minOrderAmount` mới được giảm.
 *    (Đạt = lớn hơn HOẶC BẰNG ngưỡng.)
 *  - percent: giảm = làm tròn(subtotal * value / 100), nhưng không vượt `maxDiscount`.
 *  - fixed:   giảm = value.
 *  - Tổng sau giảm KHÔNG BAO GIỜ được âm (thấp nhất là 0).
 */
export function applyPromotion(order: Order, promo: Promotion): PromotionResult {
  if (order.subtotal >= promo.minOrderAmount) {
    let discount: number;

    if (promo.type === 'percent') {
      discount = Math.round((order.subtotal * promo.value) / 100);
      if (discount > promo.maxDiscount) {
        discount = promo.maxDiscount;
      }
    } else {
      discount = promo.value;
    }

    const total = Math.max(0, order.subtotal - discount);
    // const total = order.subtotal - discount;
    return { eligible: true, discount, total };
  }

  return { eligible: false, discount: 0, total: order.subtotal };
}
