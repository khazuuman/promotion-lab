// ============================================================================
//  Bộ test do "AGENT" viết kèm khi nộp tính năng.
//  Chạy `npm test` — bạn sẽ thấy TẤT CẢ ĐỀU XANH ✅.
//  Chạy `npm run coverage` — bạn sẽ thấy coverage = 100% ở MỌI chỉ số
//  (statements, branch, functions, lines). Vậy mà 2 bug vẫn ẩn bên trong.
//
//  Câu hỏi mấu chốt của Module 1:
//      "Xanh hết + coverage cao => code ĐÚNG?  KHÔNG chắc."
//
//  Bộ test này chỉ kiểm các đường đi 'đẹp' (happy path). Nó chạy qua gần như
//  mọi DÒNG code (nên line-coverage cao), nhưng bỏ sót những TÌNH HUỐNG mà
//  giá trị đầu vào đẩy logic tới ca biên. Đó là chỗ bug đang ẩn.
// ============================================================================

import { describe, it, expect } from 'vitest';
import { applyPromotion } from './promotion';

describe('applyPromotion (bộ test do agent viết — happy path)', () => {
  it('áp giảm giá phần trăm cho đơn đủ điều kiện', () => {
    const res = applyPromotion(
      { subtotal: 500_000 },
      { type: 'percent', value: 10, minOrderAmount: 200_000, maxDiscount: 100_000 },
    );
    expect(res.eligible).toBe(true);
    expect(res.discount).toBe(50_000);
    expect(res.total).toBe(450_000);
  });

  it('giới hạn giảm giá theo maxDiscount', () => {
    const res = applyPromotion(
      { subtotal: 2_000_000 },
      { type: 'percent', value: 50, minOrderAmount: 200_000, maxDiscount: 300_000 },
    );
    expect(res.discount).toBe(300_000);
    expect(res.total).toBe(1_700_000);
  });

  it('áp giảm giá cố định', () => {
    const res = applyPromotion(
      { subtotal: 500_000 },
      { type: 'fixed', value: 100_000, minOrderAmount: 200_000 },
    );
    expect(res.discount).toBe(100_000);
    expect(res.total).toBe(400_000);
  });

  it('đơn không đủ điều kiện thì không được giảm', () => {
    const res = applyPromotion(
      { subtotal: 100_000 },
      { type: 'fixed', value: 50_000, minOrderAmount: 200_000 },
    );
    expect(res.eligible).toBe(false);
    expect(res.total).toBe(100_000);
  });
});

// ============================================================================
//  👇  KHU VỰC CỦA BẠN  👇
//  Viết ít nhất 3 test CA BIÊN vào đây để cố "phá" applyPromotion.
//  Gợi ý: nghĩ theo các LỚP giá trị đầu vào mà bộ test trên chưa hề chạm tới.
//  (Nếu bí, xem phần "GỢI Ý" trong README. Đáp án ở cuối README.)
// ============================================================================

describe('applyPromotion (test kiểm chứng do BẠN viết)', () => {
  it('giảm giá cố định lớn hơn subtotal thì tổng phải kẹp về 0', () => {
    const res = applyPromotion(
      { subtotal: 700_000 },
      { type: 'fixed', value: 800_000, minOrderAmount: 500_000 },
    );
    expect(res.eligible).toBe(true);
    expect(res.total).toBe(0);
  });

  it('đơn đúng bằng ngưỡng tối thiểu vẫn được giảm', () => {
    const res = applyPromotion(
      { subtotal: 200_000 },
      { type: 'fixed', value: 20_000, minOrderAmount: 200_000 },
    );
    expect(res.eligible).toBe(true);
    expect(res.total).toBe(180_000);
  });

  it('subtotal = 0 tại đúng ngưỡng 0', () => {
    const res = applyPromotion(
      { subtotal: 0 },
      { type: 'fixed', value: 100_000, minOrderAmount: 0 },
    );
    expect(res.eligible).toBe(true);
    expect(res.discount).toBe(100_000);
    expect(res.total).toBe(0);
  });
});