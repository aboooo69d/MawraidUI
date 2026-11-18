# STOCK_IMPLEMENTATION — ميزة إدارة مخزون المزود

> **الفرع:** `feature/provider-stock-management` · **العقد المرجعي:** `API_STOCK_DOCS.md` (Nova API)
> **تاريخ الإنجاز:** نوفمبر 2026 · الحالة: **مكتملة وملتزمة بالبناء (84/84 اختبار، build ناجح)**

---

## 1. نظرة عامة

ميزة إدارة مخزون كاملة لمزودي الخدمة (`role_name === "provider"`) بالعربية RTL وواجهة متوافقة مع الجوال، تغطي المسارات الثمانية في عقد Nova عبر طبقة API مركزية واحدة، مع حماية صارمة لصلاحيات الوصول (مستضيف/مستفيد/مزود)، وتحقق من المدخلات، ومنع الإرسال المزدوج، وحماية من الاستجابات القديمة (stale)، وحالات أخطاء كاملة دون نجاح وهمي.

## 2. الملفات المُنشأة والمعدّلة

### طبقة API (`src/services/api/`)

| ملف | الوصف |
|---|---|
| `modules/stock.api.js` | 8 endpoints في كائن `stockApi` — جميعها عبر `request()` ومسارات نسبية إلى `/api/v1` |
| `client.js` | خيار جديد `withMeta` (افتراضي `false`) يُرجع `{data, meta}` للمسارات المرقمة — تراجعية كاملة |
| `errorMessages.js` | أكواد 1600–1611 + رسالة عربية لفشل الشبكة (`TypeError`) |
| `index.js` | تصدير `stockApi` من الـ barrel |

### المسارات والحماية

| ملف | الوصف |
|---|---|
| `src/shared/constants/routes.js` | +5 مفاتيح: `STOCK_CREATE` / `STOCK_DASHBOARD` / `STOCK_TRANSACTION` / `STOCK_UNITS` / `STOCK_HISTORY` |
| `src/app/App.jsx` | تسجيل الشاشات، ودالة **`resolveCurrentScreen(screen, user)`** المُصدَّرة للحماية والاختبار |

منطق الحماية:

```js
STOCK_SCREENS: guest → LOGIN · consumer → DASHBOARD · provider → الشاشة المطلوبة
بقية الشاشات: نفس سلوك المشروع الأصلي حرفياً (جلسة نشطة على شاشات الدخول → DASHBOARD)
```

### الميزة (`src/features/stock/`)

| ملف | الوصف |
|---|---|
| `hooks/useMyStock.js` | محمّل البيانات الوحيد الموثوق — `GET /user/me/stock` مع حارس تسلسل طلبات (sequence) يتجاهل الاستجابات القديمة ويحمي عند الخروج من الشاشة · الحالات: `loading / ready / empty(404 أو 1600) / error` |
| `validation.js` | قواعد العقد: وحدة رئيسية واحدة `rate=1`، فرعية `rate` صحيح ≥1، أسماء فريدة ≤50 حرف، كمية موجبة صحيحة، وصف ≤1000 حرف |
| `utils.js` | `isSessionExpired` (401/1100) · `isStockMissing` (1600، أو 404 بدون كود تطبيق فقط — **لا يُعامَل أي 404 كغياب مخزون**) · `formatDateTime` / `formatAmount` |
| `pages/StockCreatePage.jsx` | اختيار النوع من `GET /stocks/types`، صف رئيسي ثابت (المعامل مقفل 1)، إضافة/حذف صفوف فرعية، أخطاء لكل حقل |
| `pages/StockDashboardPage.jsx` | الرصيد المتاح + `balances[]` من الخادم (دون أي حسابات محلية)، تحديث يدوي، 4 إجراءات سريعة، بطاقة بيانات |
| `pages/StockTransactionPage.jsx` | `direction` كمعامل تنقل (`in`/`out`)؛ اتجاه غير صالح يُعيد توجيه مرة واحدة (حارس حلقة)؛ معرّف الوحدة من القائمة المشحونة (لا يُقبل من الاستعلام) |
| `pages/StockUnitsPage.jsx` | عرض/إضافة/تعديل الصفوف؛ حقل معامل الوحدة الرئيسية معطّل بالقيمة 1؛ `PATCH` يرسل الحقول المتغيّرة فقط؛ **الاسم لا يُفقد أبداً** |
| `pages/StockHistoryPage.jsx` | فلاتر `الكل/وارد/منصرف` → `is_in` محذوف/`true`/`false`، `page_size=20`، ترقيم من `meta`، حارس تسلسل للاستجابات القديمة، تصفير الصفحة مع تغيير الفلتر |
| `components/` | `StockHeader` (ترويسة ثابتة + رجوع) · `StockPage` (قالب الشاشة) · `StockStates` (تحميل/خطأ+إعادة محاولة/انتهاء جلسة/فارغ) · `ProviderStockCard` (نقطة الدخول) |

### نقاط التكامل

- `src/features/dashboard/pages/DashboardPage.jsx` — بطاقة الاكتشاف تُعرض **للمزود فقط** (`{isProvider && <ProviderStockCard go={go} />}`) بعد بطاقة الترحيب مباشرة: لا يوجد مخزون ← «إضافة مخزون جديد»؛ يوجد ← ملخص + «إدارة المخزون» **دون زر إنشاء احتياطي**.
- `src/shared/components/` — `SecondaryBtn` ربح خاصية `disabled` (تراجعية)؛ +5 أيقونات (`Plus/Minus/Box/Settings/History`) في `icons/index.jsx`.

## 3. خريطة endpoints → دوال

| # | Endpoint | الدالة | الاستخدام |
|---|---|---|---|
| 1 | `GET /user/me/stock` | `stockApi.getMyStock()` | `useMyStock` — كل الشاشات + البطاقة |
| 2 | `GET /stocks/types` | `stockApi.getStockTypes()` | قائمة النوع في الإنشاء |
| 3 | `POST /stocks` | `stockApi.createStock(payload)` | نموذج الإنشاء |
| 4 | `GET /stocks/:stock_id` | `stockApi.getStockById(id)` | مُصدَّر للعقد (لا يستخدمه التدفق الحالي — المصدر الموثوق `getMyStock`) |
| 5 | `POST /stocks/:id/transactions` | `stockApi.createStockTransaction(id, p)` | حركات الصرف/التوريد |
| 6 | `GET /stocks/:id/transactions?page&page_size&is_in` | `stockApi.getStockTransactions(id, {…})` | السجل (يُرجع `{data, meta}`) |
| 7 | `POST /stocks/:id/units` | `stockApi.addStockUnit(id, p)` | إضافة وحدة فرعية |
| 8 | `PATCH /stocks/:id/units/:unit_id` | `stockApi.updateStockUnit(id, unitId, p)` | تعديل وحدة |

الحمولات مطابقة للعقد حرفياً (مثال الإنشاء: `{stock_type_id, units:[{name, rate, is_main}]}`) — **لا مسارات أو حقول مخترعة، لا mocks في كود الإنتاج**.

## 4. قرارات هندسية

1. **الكود 1100 بقي كما هو** (`رقم الجوال أو كلمة المرور غير صحيحة`) — تغييره كان سيُفسد رسائل تسجيل الدخول؛ انتهاء جلسة المخزون (401/1100) يُعالج بمكوّن `SessionExpiredState` (زر خروج + انتقال لتسجيل الدخول).
2. **`empty` لا يستنتج من أي 404** — فقط كود `1600` أو 404 بلا كود تطبيق؛ أخطاء الخادم تبقى أخطاء مع زر إعادة محاولة (لا تُعرض كبيانات فارغة).
3. **معرّف الحركة يُبنى من الوحدة المحمّلة** لا من الاستعلام (يمنع حركات وهمية)؛ معرّف المخزون من نتائج الطلب لا من параметر قابل للتعديل.
4. **نجاح الإنشاء/الحركة → عودة للوحة** التي تعيد الجلب من الخادم = تحديث رصيد موثوق وحيد المصدر دون تكرار طلبات.
5. **1611 عند الإنشاء** → جلب `getMyStock` مرة واحدة وانتقال للوحة (يقاطع الحلقة)؛ فشل الجلب ← عرض الخطأ الأصلي.
6. **1610 عند تعديل وحدة مُستخدمة مع تغيير الاسم والمعامل** → إعادة محاولة تلقائية بالاسم فقط (يسمح الخادم بالاسم) مع نجاح وصياغة توضيحية؛ بدون تغيير اسم ← عرض الخطأ مباشرة.
7. **`ProviderStockCard` داخل `features/stock`** واستيرادها من `DashboardPage` — نقطة تكامل مقصودة (الميزتان مترابطتان).
8. **`showToast` يُمرَّر للشاشات الخمس فقط** — توسيع محدود الضروري للنجاح دون تعديل الشاشات القائمة.

## 5. حماية البيانات

- **حالة وحيدة موثوقة:** كل الشاشات تمر عبر `useMyStock` (لا تمرير `stockId` قديم عبر `params`).
- **stale/mount:** `seqRef` يبطل أي استجابة أُجّلت بعد طلب أحدث أو بعد الخروج — في hook وسجل الحركات معاً.
- **منع الإرسال المزدوج:** علامة `submitting/adding/saving` تفحص قبل الإرسال + الزر `disabled/` مع `loading`.
- **الجلسات:** 401 في أي شاشة → حالة انتهاء جلسة (خروج + تسجيل دخول) — لا توجيه صامت أثناء الكتابة.
