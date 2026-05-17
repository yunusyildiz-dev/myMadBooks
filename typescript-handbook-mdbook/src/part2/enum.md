# Enum

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
TypeScript'te enum nedir, kaç çeşidi vardır (numeric, string, const), ne zaman kullanılır ve ne zaman modern alternatif olan union type tercih edilir.

</div>

---

## 📖 Enum Nedir?

Enum (enumeration — numaralandırma), **birbirine bağlı sabit değerlerin isimlendirilmiş bir grup** oluşturmasını sağlar.

**Neden gerekli?** Düşün ki uygulamanda sipariş durumları var:

```typescript
// ❌ Sihirli sayılar — ne anlama geliyor?
function processOrder(status: number): void {
    if (status === 0) { /* pending */ }
    if (status === 1) { /* processing */ }
    if (status === 2) { /* shipped */ }
}

// ❌ Sihirli string'ler — typo riski var
function processOrder2(status: string): void {
    if (status === "pending") { ... }
    if (status === "procesing") { ... } // typo! ama TypeScript uyarmaz
}

// ✅ Enum — isimlendirilmiş, güvenli
enum OrderStatus {
    Pending,
    Processing,
    Shipped,
    Delivered
}

function processOrder3(status: OrderStatus): void {
    if (status === OrderStatus.Pending) { ... }    // okunabilir
    if (status === OrderStatus.Processing) { ... } // güvenli
}
```

<hr class="section-divider">

## 📖 Numeric Enum — Sayısal Enum

Varsayılan enum türü. Değerler 0'dan başlayarak otomatik artar:

```typescript
enum Direction {
    Up,     // 0
    Down,   // 1
    Left,   // 2
    Right   // 3
}

let move: Direction = Direction.Up;
console.log(move);              // → 0
console.log(Direction.Right);   // → 3

// Reverse mapping — numeric enum'a özgü
console.log(Direction[0]);  // → "Up"
console.log(Direction[3]);  // → "Right"
```

### Başlangıç Değeri Belirleme

```typescript
// 1'den başlat
enum Priority {
    Low = 1,
    Medium,  // 2
    High,    // 3
    Critical // 4
}

// HTTP status kodları
enum HttpStatus {
    OK = 200,
    Created = 201,
    BadRequest = 400,
    Unauthorized = 401,
    NotFound = 404,
    InternalServerError = 500
}

let statusCode: HttpStatus = HttpStatus.NotFound;
console.log(statusCode); // → 404
```

<div class="callout callout-warning">

**⚠️ Numeric Enum'ın Zayıf Noktası**

Numeric enum'da geçerli aralık dışında bir sayı atamak mümkündür — TypeScript izin verir:

```typescript
let dir: Direction = 999; // ❌ TypeScript hata vermez ama mantıksız!
```

Bu yüzden string enum daha güvenli kabul edilir.

</div>

<hr class="section-divider">

## 📖 String Enum — String Enum (Tavsiye Edilen)

Değerler sayı yerine string:

```typescript
enum PaymentMethod {
    CreditCard = "CREDIT_CARD",
    BankTransfer = "BANK_TRANSFER",
    Crypto = "CRYPTO",
    Cash = "CASH"
}

let payment: PaymentMethod = PaymentMethod.CreditCard;
console.log(payment); // → "CREDIT_CARD"

// Avantaj: debug'da okunabilir
// Numeric enum'da "3" görürsün — ne anlama gelir?
// String enum'da "CREDIT_CARD" görürsün — hemen anlarsın
```

### String Enum Kullanım Örneği

```typescript
enum UserRole {
    Admin = "ADMIN",
    Editor = "EDITOR",
    Viewer = "VIEWER"
}

interface User {
    id: number;
    name: string;
    role: UserRole;
}

function hasPermission(user: User, action: string): boolean {
    switch (user.role) {
        case UserRole.Admin:
            return true; // admin her şeyi yapabilir
        case UserRole.Editor:
            return action === "read" || action === "write";
        case UserRole.Viewer:
            return action === "read";
    }
}

const adminUser: User = { id: 1, name: "Yunus", role: UserRole.Admin };
console.log(hasPermission(adminUser, "delete")); // → true
```

<hr class="section-divider">

## 📖 Const Enum — Performanslı Enum

`const enum`, derleme sonrasında enum referansları inline değerle değiştirilir — runtime'da enum objesi oluşmaz:

```typescript
const enum Color {
    Red,    // 0
    Green,  // 1
    Blue    // 2
}

let myColor: Color = Color.Red;

// Derleme sonrası JavaScript:
// let myColor = 0; ← direkt sayı, enum objesi yok
```

<div class="callout callout-tip">

**✅ `const enum` Ne Zaman?**
- Performans kritikse (büyük loop'larda kullanılıyorsa)
- Enum değerleri sadece TypeScript kodunda kullanılıyorsa (dış kütüphane/JSON'a geçmiyorsa)
- Bundle size önemliyse

**⚠️ Dikkat:** `const enum`'u harici kütüphane veya JSON olarak kullanma — runtime'da var olmaz.

</div>

<hr class="section-divider">

## 📖 Modern Alternatif: Union Type

TypeScript topluluğunda enum yerine union type kullanımı giderek artıyor:

```typescript
// Enum yöntemi
enum OrderStatus {
    Pending = "PENDING",
    Processing = "PROCESSING",
    Shipped = "SHIPPED",
    Delivered = "DELIVERED"
}

// Union type yöntemi — daha hafif, daha az kod
type OrderStatusType = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED";
```

### Karşılaştırma

```typescript
// Enum ile
function getLabel(status: OrderStatus): string {
    switch (status) {
        case OrderStatus.Pending:    return "Sipariş Alındı";
        case OrderStatus.Processing: return "Hazırlanıyor";
        case OrderStatus.Shipped:    return "Kargoda";
        case OrderStatus.Delivered:  return "Teslim Edildi";
    }
}

// Union type ile
function getLabel2(status: OrderStatusType): string {
    const labels: Record<OrderStatusType, string> = {
        PENDING:    "Sipariş Alındı",
        PROCESSING: "Hazırlanıyor",
        SHIPPED:    "Kargoda",
        DELIVERED:  "Teslim Edildi"
    };
    return labels[status];
}

// İkisi de tip güvenli ama union type daha az boilerplate
```

### Enum vs Union Type — Karar Tablosu

| Özellik | Enum | Union Type |
|---------|------|-----------|
| Sözdizimi | `enum X { A, B }` | `type X = "A" \| "B"` |
| Runtime varlığı | ✅ Var | ❌ Yok (sıfır maliyet) |
| Reverse mapping | ✅ Var (numeric) | ❌ Yok |
| Kod miktarı | Daha fazla | Daha az |
| OOP uyumu | ✅ İyi | ❌ Zayıf |
| Tree-shaking | ❌ Zor | ✅ Kolay |
| Iterasyon | ✅ `Object.values(Enum)` | ❌ Dizi gerekir |
| Tercih | NestJS, OOP projeler | React, modern TS |

<hr class="section-divider">

## 🏭 Real-World Kullanım

<div class="callout callout-real-world">

**🏭 E-Ticaret Sipariş Durumları**

```typescript
enum OrderStatus {
    Pending = "PENDING",
    Confirmed = "CONFIRMED",
    Processing = "PROCESSING",
    Shipped = "SHIPPED",
    Delivered = "DELIVERED",
    Cancelled = "CANCELLED",
    Refunded = "REFUNDED"
}

interface Order {
    id: number;
    userId: number;
    status: OrderStatus;
    total: number;
    createdAt: string;
}

const statusColors: Record<OrderStatus, string> = {
    [OrderStatus.Pending]:    "#FFA500",
    [OrderStatus.Confirmed]:  "#4169E1",
    [OrderStatus.Processing]: "#9370DB",
    [OrderStatus.Shipped]:    "#1E90FF",
    [OrderStatus.Delivered]:  "#32CD32",
    [OrderStatus.Cancelled]:  "#DC143C",
    [OrderStatus.Refunded]:   "#808080"
};

function getStatusBadge(order: Order): { label: string; color: string } {
    const labels: Record<OrderStatus, string> = {
        [OrderStatus.Pending]:    "Bekliyor",
        [OrderStatus.Confirmed]:  "Onaylandı",
        [OrderStatus.Processing]: "Hazırlanıyor",
        [OrderStatus.Shipped]:    "Kargoda",
        [OrderStatus.Delivered]:  "Teslim Edildi",
        [OrderStatus.Cancelled]:  "İptal",
        [OrderStatus.Refunded]:   "İade Edildi"
    };
    return {
        label: labels[order.status],
        color: statusColors[order.status]
    };
}
```

</div>

<div class="callout callout-real-world">

**🏭 HTTP Status Kodları (NestJS / Express Projesi)**

```typescript
enum HttpStatus {
    OK = 200,
    Created = 201,
    NoContent = 204,
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    Conflict = 409,
    UnprocessableEntity = 422,
    TooManyRequests = 429,
    InternalServerError = 500
}

function sendResponse(status: HttpStatus, data?: unknown): void {
    console.log(`HTTP ${status}`, data);
}

sendResponse(HttpStatus.Created, { id: 1, name: "Yunus" });
sendResponse(HttpStatus.NotFound);
sendResponse(HttpStatus.Unauthorized);
```

</div>

<hr class="section-divider">

## ✅ Best Practices

<div class="callout callout-tip">

**✅ Enum Best Practices:**
- **String enum** kullan (numeric enum değil) — debug'da okunabilir
- Enum isimlerini **PascalCase** yaz: `OrderStatus`, `UserRole`
- Enum **değerlerini UPPER_SNAKE_CASE** yaz: `"CREDIT_CARD"`, `"IN_PROGRESS"`
- **Az sayıda sabit değer** için union type daha sade: `type Status = "active" | "inactive"`
- NestJS/backend gibi OOP odaklı projelerde enum, React gibi frontend'de union type tercih et
- Enum'u switch-case ile kullanıyorsan **exhaustive check** ekle

</div>

## ❌ Avoid

<div class="callout callout-danger">

**❌ Kaçınılması Gerekenler:**
```typescript
// ❌ Numeric enum'ı dışarıya (API, JSON) gönderme
// 0, 1, 2 değerleri anlamsız
enum BadStatus { Pending, Active, Inactive }

// ❌ const enum'ı harici modüle export etme
// runtime'da var olmaz, import eden kütüphane çöker
export const enum Visibility { Public, Private }

// ❌ Enum değerini magic number olarak kullanma
if (order.status === 2) { ... } // 2 ne demek?
// ✅ Bunun yerine:
if (order.status === OrderStatus.Processing) { ... }

// ❌ Enum ile güvenli olmayan assignment
let status: OrderStatus = 999 as OrderStatus; // geçerli ama yanlış
```

</div>

<hr class="section-divider">

## 📋 Özet

| Enum Türü | Syntax | Değer | Özellik | Ne Zaman? |
|-----------|--------|-------|---------|-----------|
| Numeric | `enum X { A, B }` | 0, 1, 2... | Reverse mapping var | Nadir — string enum tercih et |
| String | `enum X { A = "A" }` | "A", "B" | Okunabilir, güvenli | OOP projeler, NestJS |
| Const | `const enum X { A }` | inline sayı | Sıfır runtime maliyet | Performans kritikse |
| Union type | `type X = "A" \| "B"` | string | Hafif, modern | React, modern TS |
