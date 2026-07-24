# Module 1 — Testing đúng cách · Phòng lab "Bẫy xanh giả"

> Mục tiêu module: **Tự phán xét được chất lượng test — không mù quáng tin test do agent viết.**
> Bài lab này cho bạn *chạm tay* vào tình huống thật: một agent nộp tính năng kèm test đã xanh, và bạn phải kiểm chứng nó.

---

## 0. Bối cảnh

Bạn là người review. Một "agent" vừa nộp cho bạn một use-case tầng domain (`applyPromotion` — áp khuyến mãi lên đơn hàng, đơn vị VND) **kèm sẵn bộ test đã chạy xanh**. Trong thực tế agentic, đây là khoảnh khắc nguy hiểm nhất: mọi thứ *trông* ổn.

Nhiệm vụ của bạn **không phải** viết lại code. Nhiệm vụ là: **viết test ca biên để chứng minh code đúng — hoặc bắt được chỗ nó sai.**

---

## 1. Chạy thử (5 phút)

```bash
npm install
npm test          # -> tất cả XANH ✅
npm run coverage  # -> 100% statements / branch / functions / lines
```

Dừng lại và tự hỏi: *"Xanh hết, coverage 100% kể cả branch. Vậy code này đã đúng chưa?"*

Đây chính là bài học cốt lõi: **coverage 100% KHÔNG đồng nghĩa với đúng.** Bộ test của agent chạy qua *mọi dòng và mọi nhánh* true/false (nên coverage tuyệt đối), nhưng chưa chạm tới những *giá trị* đẩy logic tới ca biên. Coverage đo "code nào được chạy", không đo "tình huống nào được kiểm".

---

## 2. Bài tập (phần chính)

Mở `src/domain/promotion.test.ts`, xuống khu vực **"KHU VỰC CỦA BẠN"** ở cuối file. Thay 3 dòng `it.todo(...)` bằng **ít nhất 3 test ca biên thật** nhằm *cố phá* `applyPromotion`.

Cách tư duy để tìm ca biên (kỹ năng bạn đang luyện): với mỗi đầu vào, đừng hỏi "giá trị đẹp là gì", hãy hỏi **"những LỚP giá trị nào tồn tại, và bộ test hiện tại đã chạm lớp nào?"**. Vài lớp kinh điển:

- **Biên của điều kiện** — giá trị *đúng bằng* ngưỡng (không phải trên/dưới ngưỡng).
- **Giá trị làm "tràn" logic** — khi một phép tính có thể cho kết quả ngoài vùng hợp lệ (âm, vượt trần, bằng 0).
- **Giá trị rỗng / cực trị** — 0, số rất lớn, đầu vào tối thiểu.

Sau khi viết xong, chạy lại `npm test`. Nếu một test của bạn **đỏ**, bạn vừa bắt được một bug mà agent (và bộ test của nó) bỏ sót. 🎯

**Mốc kiểm chứng của Module 1 coi như đạt khi:** bạn viết được ≥3 test ca biên, trong đó ≥1 test làm lộ một lỗi thật, và bạn giải thích được *vì sao coverage cao mà vẫn thiếu*.

---

## 3. Gợi ý (mở khi bí — cố gắng tự nghĩ trước)

<details>
<summary>Bấm để xem gợi ý</summary>

Đọc kỹ phần "Luật nghiệp vụ" trong `promotion.ts`. Có hai câu luật mà bộ test của agent **chưa hề kiểm**:

1. *"Đạt = lớn hơn HOẶC BẰNG ngưỡng."* → Bộ test hiện chỉ dùng đơn ở trên ngưỡng hoặc dưới hẳn ngưỡng. Điều gì xảy ra khi `subtotal` **đúng bằng** `minOrderAmount`?
2. *"Tổng sau giảm KHÔNG BAO GIỜ được âm."* → Bộ test cho `fixed` chỉ dùng giá trị giảm **nhỏ hơn** subtotal. Điều gì xảy ra khi giảm giá cố định **lớn hơn** subtotal?

</details>

---

## 4. Đáp án & bài học (chỉ mở sau khi đã tự làm)

<details>
<summary>Bấm để xem đáp án</summary>

Có **hai bug** được cài sẵn trong `promotion.ts`:

**Bug 1 — Tổng âm.** Dòng `const total = order.subtotal - discount;` không kẹp về 0. Với giảm giá cố định lớn hơn subtotal, tổng ra số âm.

```ts
it('giảm giá cố định không được làm tổng âm', () => {
  const res = applyPromotion(
    { subtotal: 100_000 },
    { type: 'fixed', value: 150_000, minOrderAmount: 50_000 },
  );
  expect(res.total).toBe(0);        // ❌ code trả về -50_000
});
```

**Bug 2 — Sai biên điều kiện (off-by-one).** Điều kiện dùng `>` thay vì `>=`, nên đơn *đúng bằng* ngưỡng bị loại oan.

```ts
it('đơn đúng bằng ngưỡng tối thiểu vẫn được giảm', () => {
  const res = applyPromotion(
    { subtotal: 200_000 },
    { type: 'fixed', value: 20_000, minOrderAmount: 200_000 },
  );
  expect(res.eligible).toBe(true);  // ❌ code trả về false
});
```

**Cách sửa `promotion.ts`:**

```ts
if (order.subtotal >= promo.minOrderAmount) {   // >= thay vì >
  // ...
  const total = Math.max(0, order.subtotal - discount);  // kẹp về 0
  return { eligible: true, discount, total };
}
```

### Vì sao coverage 100% (kể cả branch) mà vẫn lọt 2 bug này?

Vì **coverage đếm "dòng/nhánh nào được chạy", không đếm "tình huống nào được kiểm".** Bộ test của agent đã chạy qua cả nhánh `percent`, `fixed`, `maxDiscount` (cả true lẫn false), và cả hai nhánh của điều kiện đủ/không đủ điều kiện → mọi dòng và mọi nhánh true/false đều được thực thi → **100% statements + branch**. Nhưng không test nào đặt `subtotal` *đúng bằng* ngưỡng, và không test nào cho `fixed` *lớn hơn* subtotal. Hai *lớp giá trị đầu vào* đó chưa bao giờ được chạm — dù mọi dòng và mọi nhánh đều đã chạy. Đó là lý do ngay cả 100% branch coverage cũng không cứu bạn khỏi bug ca biên.

Đây là lý do người kiểm chứng giỏi nghĩ theo **lớp giá trị đầu vào và ca biên**, chứ không nhìn con số coverage rồi yên tâm.

### Móc nối với công việc thật của bạn

Khi bạn chỉ huy agent phát triển phần mềm, agent sẽ *luôn* nộp code kèm test xanh. Nếu bạn duyệt dựa trên "xanh + coverage cao", bạn sẽ merge cả bug. Kỹ năng vừa luyện — tự viết test ca biên độc lập với test của agent — chính là "đôi mắt" khiến bạn có thể cho agent tự chủ mà vẫn an toàn. Một quy tắc thực chiến: **với logic nghiệp vụ lõi, hãy tự bạn viết (hoặc tự duyệt kỹ) các test ca biên; đừng để agent vừa viết code vừa tự chấm điểm chính nó.**

</details>

---

## 5. Bảng khái niệm gọn (checklist Module 1)

| Khái niệm | Ý chính |
|---|---|
| Unit / Integration / E2E | Unit: 1 mảnh logic thuần (như lab này). Integration: nhiều thành phần ghép (DB, service). E2E: cả luồng như người dùng thật. |
| Test pyramid | Nhiều unit (nhanh, rẻ) → ít integration → rất ít e2e (chậm, đắt). |
| Test hành vi, không test cài đặt | Kiểm *kết quả/hợp đồng*, không kiểm chi tiết bên trong — để refactor không làm vỡ test oan. |
| Line vs branch coverage | Line = dòng được chạy. Branch = mọi nhánh true/false được kiểm. Cả hai vẫn không thay được "ca biên". |
| Edge / negative cases | Biên ngưỡng, giá trị tràn, rỗng, cực trị — nơi bug hay trốn. |
| Bẫy "xanh giả" | Test xanh do yếu, hoặc do agent tự viết cho khớp code sai. |
| TDD | Viết test *trước* cho logic quan trọng → agent không thể "sửa test cho pass". |

Khi bạn tick xong 7 mục này trong lộ trình và đạt mốc kiểm chứng ở mục 2, Module 1 hoàn thành. Nhắn mình để qua **Module 2 — CI/CD** (biến chính bộ test này thành cổng chặn merge tự động).
