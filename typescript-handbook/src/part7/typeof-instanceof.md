# typeof & instanceof Guards

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
`typeof` ile primitive tipleri daralt, `instanceof` ile class instance'larını kontrol et. Error handling'de `instanceof` olmadan yapamazsın.

</div>

---

## 📖 typeof Guard — Primitive Tipler

`typeof` operatörü JavaScript'te her zaman vardı, ama TypeScript'te **tip daraltma aracı** olarak da çalışır. `typeof` kontrol ettikten sonra o blokta TypeScript tipi otomatik daraltır:

```typescript
// typeof sonuçları:
// "string" | "number" | "boolean" | "bigint"
// "symbol" | "undefined" | "object" | "function"

function formatInput(input: string | number | boolean): string {
    if (typeof input === "string") {
        // Burada TypeScript biliyor: input string
        return input.trim().toUpperCase();
    }
    if (typeof input === "number") {
        // Burada TypeScript biliyor: input number
        return input.toFixed(2);
    }
    // Geriye boolean kalır — TypeScript biliyor
    return input ? "Evet" : "Hayır";
}

console.log(formatInput("  yunus  ")); // → "YUNUS"
console.log(formatInput(3.14159));     // → "3.14"
console.log(formatInput(true));        // → "Evet"
```

### unknown ile typeof

```typescript
// fetch sonrası gelen veri unknown olmalı
function processApiValue(value: unknown): string {
    if (typeof value === "string") return value;
    if (typeof value === "number") return value.toString();
    if (typeof value === "boolean") return value ? "true" : "false";
    if (value === null) return "null";
    if (typeof value === "object") return JSON.stringify(value);
    return "bilinmeyen";
}
```

<div class="callout callout-warning">

**⚠️ typeof null === "object" Tuzağı**

JavaScript'in tarihi bir hatası: `typeof null` → `"object"` döner. Her zaman önce null kontrolü yap:

```typescript
function isNullOrObject(value: unknown): void {
    if (typeof value === "object") {
        // ⚠️ null da buraya girer!
        if (value === null) {
            console.log("null");
        } else {
            // Burada: kesinlikle obje, null değil
            console.log("obje:", value);
        }
    }
}
```

</div>

<hr class="section-divider">

## 📖 instanceof Guard — Class Instance'ları

`instanceof`, bir objenin belirli bir class'tan oluşturulup oluşturulmadığını kontrol eder. Class tabanlı yapılarda ve özellikle error handling'de şarttır:

```typescript
class NetworkError extends Error {
    constructor(
        message: string,
        public statusCode: number
    ) {
        super(message);
        this.name = "NetworkError";
    }
}

class ValidationError extends Error {
    constructor(
        message: string,
        public fields: string[]
    ) {
        super(message);
        this.name = "ValidationError";
    }
}
```

### catch Bloğunda Error Sınıflandırma

```typescript
// Production'da her try/catch böyle yazılmalı
function handleError(error: unknown): string {
    if (error instanceof NetworkError) {
        // Burada TypeScript biliyor: error NetworkError
        // statusCode alanına güvenli erişim
        return `Network hatası (${error.statusCode}): ${error.message}`;
    }

    if (error instanceof ValidationError) {
        // Burada TypeScript biliyor: error ValidationError
        // fields alanına güvenli erişim
        return `Validasyon hatası — ${error.fields.join(", ")} alanları geçersiz`;
    }

    if (error instanceof Error) {
        // Genel Error — message var ama statusCode/fields yok
        return `Hata: ${error.message}`;
    }

    // string throw edilmiş olabilir — instanceof'tan önce kontrol
    return "Bilinmeyen hata";
}

// Kullanım
try {
    throw new NetworkError("Bağlantı kurulamadı", 503);
} catch (err) {
    console.log(handleError(err)); // → "Network hatası (503): Bağlantı kurulamadı"
}
```

<div class="callout callout-warning">

**⚠️ catch(err) — TypeScript'te err unknown'dur**

`catch (err)` bloğunda `err` tipi `unknown`'dur (strict modda). `err.message` gibi bir şey yazmak derleme hatası verir. Daima instanceof ile daralt:

```typescript
try {
    // ...
} catch (err) {
    // err.message; // ❌ hata — unknown
    if (err instanceof Error) {
        err.message; // ✅ güvenli
    }
}
```

</div>

### Date ve Built-in Class'lar

```typescript
function formatDate(value: string | Date): string {
    if (value instanceof Date) {
        // Burada TypeScript biliyor: value Date
        return value.toLocaleDateString("tr-TR");
    }
    // string — Date'e çevir
    return new Date(value).toLocaleDateString("tr-TR");
}

console.log(formatDate(new Date())); // → "17.05.2026"
console.log(formatDate("2025-01-15")); // → "15.01.2025"
```

<hr class="section-divider">

## 📖 typeof vs instanceof — Ne Seçmeli?

```typescript
// typeof — primitive'ler için
typeof "yunus" === "string"  // ✅
typeof 42 === "number"        // ✅
typeof true === "boolean"     // ✅

// instanceof — class instance'ları için
new Date() instanceof Date          // ✅
new Error("x") instanceof Error     // ✅
new NetworkError("x", 404) instanceof NetworkError // ✅

// instanceof interface için çalışmaz — interface runtime'da silinir
// interface User { id: number }
// {} instanceof User // ❌ runtime hata — User runtime'da yok
```

**Interface kontrolü için `in` guard kullan (sonraki bölüm).**

<hr class="section-divider">

## 🏭 Real-World: API Error Handler

<div class="callout callout-real-world">

**🏭 Tip Güvenli Hata Yakalama Sistemi**

```typescript
class ApiError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public endpoint: string
    ) {
        super(message);
        this.name = "ApiError";
    }
}

class AuthError extends ApiError {
    constructor(endpoint: string) {
        super("Yetkilendirme gerekli", 401, endpoint);
        this.name = "AuthError";
    }
}

class RateLimitError extends ApiError {
    constructor(
        endpoint: string,
        public retryAfter: number
    ) {
        super("İstek limiti aşıldı", 429, endpoint);
        this.name = "RateLimitError";
    }
}

// Merkezi hata işleyici
async function withErrorHandling<T>(fn: () => Promise<T>): Promise<T | null> {
    try {
        return await fn();
    } catch (error) {
        if (error instanceof AuthError) {
            // Kullanıcıyı login'e yönlendir
            window.location.href = "/login";
            return null;
        }

        if (error instanceof RateLimitError) {
            // Retry-After saniye sonra tekrar dene
            console.warn(`Rate limited — ${error.retryAfter}s sonra tekrar dene`);
            return null;
        }

        if (error instanceof ApiError) {
            // Genel API hatası — kullanıcıya göster
            console.error(`API hatası ${error.statusCode}: ${error.message}`);
            return null;
        }

        if (error instanceof Error) {
            // Beklenmedik hata — logla
            console.error("Beklenmedik hata:", error.message);
            return null;
        }

        throw error; // bilinmeyen tip — yukarı fırlat
    }
}
```

</div>

<hr class="section-divider">

## ✅ Best Practices

<div class="callout callout-tip">

**✅ typeof / instanceof Best Practices:**
- Primitive union tiplerde `typeof` kullan
- Class hiyerarşisinde ve catch bloklarında `instanceof` kullan
- `catch (err)` bloğunda daima `instanceof Error` ile başla
- `typeof null === "object"` tuzağını unutma — önce null kontrol et
- Interface kontrolü için `instanceof` değil `in` kullan

</div>

## ❌ Avoid

<div class="callout callout-danger">

**❌ Kaçınılması Gerekenler:**
```typescript
// ❌ catch'te instanceof kullanmadan alan erişimi
try {
    // ...
} catch (err) {
    console.log(err.message); // ❌ hata — unknown
}
// ✅ Doğru:
} catch (err) {
    if (err instanceof Error) console.log(err.message);
}

// ❌ interface için instanceof kullanmak — runtime'da yoktur
interface User { id: number }
function isUser(x: unknown): x is User {
    return x instanceof User; // ❌ runtime hata
}
// ✅ Doğru: in guard veya custom type guard kullan

// ❌ null kontrolü yapmadan typeof "object" kullanmak
if (typeof value === "object") {
    value.foo; // ❌ value null olabilir — TypeScript uyarır
}
// ✅ Doğru:
if (typeof value === "object" && value !== null) {
    value.foo; // ✅ güvenli
}
```

</div>

<hr class="section-divider">

## 📋 Özet

| Guard | Syntax | Kullanım |
|-------|--------|----------|
| `typeof` | `typeof x === "string"` | Primitive: string, number, boolean |
| `instanceof` | `x instanceof Error` | Class instance, Date, custom class |
| null tuzağı | `typeof x === "object" && x !== null` | Object kontrolü — null güvenli |
| catch tipi | `err instanceof Error` | catch bloğunda err unknown'dur |
