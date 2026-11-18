# STOCK_HANDOFF — تسليم ميزة إدارة مخزون المزود

> **الفرع:** `feature/provider-stock-management` (من `origin/develop` @ `8a58c81`) · **الحالة:** مكتملة محلياً — **لم يُرفَع (push) أو يُدمج (merge) أو يُنشر (deploy)**

---

## 1. التشغيل والتحقق

```powershell
cd C:\Users\ZAKEER\Desktop\Mawarid-Najm-Stock
npm.cmd ci --legacy-peer-deps    # تثبيت نظيف (تعارض vite@8/plugin-react@4 موجود مسبقاً)
npm.cmd test                     # 84/84 ناجح
npm.cmd run build                # ناجح exit 0
npm.cmd dev                      # الواجهة على :5173 (يتطلب خادم Nova على :8080 لسطح المكتب الحي)
```

> لا تستخدم `npm.ps1` مباشرة (سياسة تنفيذ PowerShell) — استخدم دائماً `npm.cmd`.

## 2. خريطة الملفات

```
src/services/api/modules/stock.api.js      8 endpoints (عقد API_STOCK_DOCS.md)
src/services/api/client.js                 withMeta (meta للترقيم)
src/services/api/errorMessages.js          1600–1611 + رسالة شبكة
src/shared/constants/routes.js             +5 STOCK_* routes
src/app/App.jsx                            resolveCurrentScreen + تسجيل الشاشات
src/features/stock/
  ├ pages/  Create · Dashboard · Transaction · Units · History
  ├ components/ StockHeader · StockPage · StockStates · ProviderStockCard
  ├ hooks/useMyStock.js                    المصدر الموثوق الوحيد للبيانات
  ├ validation.js · utils.js
  └ __tests__/ 8 ملفات اختبار + helpers.jsx
src/features/dashboard/pages/DashboardPage.jsx   نقطة دخول المزود (isProvider)
docs/features/STOCK_{IMPLEMENTATION,TEST_REPORT,HANDOFF}.md
API_STOCK_DOCS.md                          عقد الـ API المرجعي
```

## 3. قائمة تحقق حي (بانتظار خادم Nova)

نقاط التحقق اليدوي عند توفر البيئة الحية (المطلوب في التسليم النهائي):

1. `GET /user/me/stock` بدون جلسة → **401** معكوسة كحالة انتهاء جلسة (لا فراغ).
2. مزود بلا مخزون → `404/1600` → بطاقة «لا يوجد مخزون مسجل».
3. إنشاء مخزون → `201` + وحدة رئيسية `rate=1` فرعية كما أُرسلت؛ مزود يملك مخزوناً → `409/1611` مع تنقل للوحة.
4. صرف أكبر من الرصيد → `409/1602` برسالة عربية ودون نجاح وهمي؛ الرصيد يتحدث بعد العودة للوحة (إعادة جلب).
5. وحدة فرعية باسم مكرر → `409/1609`؛ تعديل معامل وحدة مُستخدمة → `409/1610` مع إعادة محاولة بالاسم فقط.
6. السجل: `is_in` غير مُرسل للكل / `true` / `false`، `page_size=20`، قراءة `meta.total_pages`.
7. مستفيد/زائر يفتحان مسار `stock-*` يدوياً → تحويل للوحة/تسجيل الدخول.
8. انتهاء الجلسة أثناء فتح شاشة مخزون → حالة انتهاء جلسة بزر خروج/دخول.

## 4. ملاحظات للتطوير المستقبلي

- المصدر الوحيد للرصيد: `useMyStock` — لا تُمرَّر بيانات مخزون عبر `params` ولا تُحسب أرصدة محلياً أبداً (عقد الخادم هو المرجع).
- عند إضافة endpoint جديد: أضفه في `stock.api.js` فقط، وأي كود خطأ جديد في `errorMessages.js` (وأضفه لـ `errorMessages.test.js`).
- عند إضافة شاشة جديدة: مفتاح في `ROUTES` + إضافتها إلى `STOCK_SCREENS` و`screens` في `App.jsx` (الحماية تعمل تلقائياً).
- حدود معروفة: الاختبارات mock-Only، لا e2e، لا أتمتة متصفح، تعارض تبعيات vite القديم غير مُعالَج عمداً (خارج نطاق المهمة).
