# Custom Type Guards

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
`value is Type` dönüş tipiyle kendi tip kontrol fonksiyonunu yazmak. API'dan gelen `unknown` veriyi güvenli doğrulamak. `isUser()`, `isProduct()` gibi runtime validation fonksiyonları.

</div>

---

## 📖 Custom Type Guard Nedir?

`typeof` ve `instanceof` primitive ve class'lar için yeterlidir. Ama karmaşık bir objenin belirli bir interface'e uyup uymadığını kontrol etmek için kendi fonksiyonunu yazman gerekir. Bunun sihri dönüş tipindeki **`value is Type`** syntax'ındadır:

```typescript
// Normal fonksiyon — boolean döner, TypeScript tipi daraltmaz
function checkUser(value: unknown): boolean {
    return typeof value === "object" && value !== null && "id" in value;
}

if (checkUser(data)) {
    data.name; // ❌ hata — TypeScript hâlâ unknown görür
}

// Custom type guard — TypeScript tipi daraltır
function isUser(value: unknown): value is User {
    return typeof value === "object" && value !== null && "id" in value;
}

if (isUser(data)) {
    data.name; // ✅ TypeScript artık User bilir
}
```

`value is User` dönüş tipi TypeScript'e şunu söyler: "Bu fonksiyon `true` dönerse, `value` parametresinin tipi `User` olarak daraltılsın."

<hr class="section-divider">

## 📖 Tam Interface Kontrolü

İyi bir type guard tüm zorunlu alanları ve tiplerini kontrol eder:

```typescript
interface User {
    id: number;
    name: string;
    email: string;
}

interface Product {
    id: number;
    name: string;
    price: number;
}

function isUser(value: unknown): value is User {
    return (
        typeof value === "object" &&
        value !== null &&
        "id" in value &&
        "name" in value &&
        "email" in value &&
        typeof (value as User).id === "number" &&
        typeof (value as User).name === "string" &&
        typeof (value as User).email === "string"
    );
}

function isProduct(value: unknown): value is Product {
    return (
        typeof value === "object" &&
        value !== null &&
        "id" in value &&
        "price" in value &&
        typeof (value as Product).price === "number"
    );
}

// API'dan gelen unknown veri — tip güvenli işleme
function processData(data: unknown): void {
    if (isUser(data)) {
        // Burada TypeScript biliyor: data User
        console.log(`Kullanıcı: ${data.name} <${data.email}>`);
    } else if (isProduct(data)) {
        // Burada TypeScript biliyor: data Product
        console.log(`Ürün: ${data.name} — ${data.price}₺`);
    } else {
        console.log("Tanınmayan veri");
    }
}
```

<hr class="section-divider">

## 📖 Array Type Guard

Bir dizinin belirli tipte elemanlar içerdiğini kontrol etmek için `Array.isArray` ve `every` kombinasyonu kullanılır:

```typescript
// User[] mi kontrol et
function isUserArray(value: unknown): value is User[] {
    return Array.isArray(value) && value.every(isUser);
}

// Kullanım
const rawData: unknown = await fetch("/api/users").then(r => r.json());

if (isUserArray(rawData)) {
    // rawData: User[] — güvenli
    rawData.forEach(user => console.log(user.name)); // ✅
}
```

<hr class="section-divider">

## 📖 fetch ile Runtime Validation

API'dan gelen veri `res.json()` ile `any` döner — bu tehlikeldiр. `unknown` olarak alıp type guard ile kontrol etmek production'da şarttır:

```typescript
async function fetchUser(id: number): Promise<User> {
    const res = await fetch(`/api/users/${id}`);

    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
    }

    // unknown olarak al — any değil
    const data: unknown = await res.json();

    // Type guard ile doğrula
    if (!isUser(data)) {
        throw new Error("API geçersiz User verisi döndürdü");
    }

    return data; // User tipinde — güvenli
}

// Kullanım
const user = await fetchUser(1); // User — tip güvenceli
console.log(user.email); // ✅ güvenli
```

<hr class="section-divider">

## 🏭 Real-World: AI Chat API Yanıtı İşleme

<div class="callout callout-real-world">

**🏭 Gerçek API Response Doğrulama**

Tüm type narrowing tekniklerini bir araya getiren tam bir örnek:

```typescript
// Discriminated union — API content block tipleri
interface TextBlock {
    type: "text";
    text: string;
}

interface ToolUseBlock {
    type: "tool_use";
    id: string;
    name: string;
    input: Record<string, unknown>;
}

type ContentBlock = TextBlock | ToolUseBlock;

interface ChatMessage {
    id: string;
    role: "assistant";
    content: ContentBlock[];
    model: string;
    stopReason: "end_turn" | "max_tokens" | "tool_use";
}

// Custom type guard — API yanıtını doğrula
function isChatMessage(value: unknown): value is ChatMessage {
    return (
        typeof value === "object" &&
        value !== null &&
        "id" in value &&
        "content" in value &&
        Array.isArray((value as ChatMessage).content)
    );
}

// assertNever — exhaustive check
function assertNever(value: never): never {
    throw new Error(`İşlenmeyen durum: ${JSON.stringify(value)}`);
}

// Discriminated union ile content işle
function processContentBlock(block: ContentBlock): string {
    switch (block.type) {
        case "text":
            // TextBlock — text alanı güvenli
            return block.text;

        case "tool_use":
            // ToolUseBlock — name ve input alanları güvenli
            return `[Tool: ${block.name}] ${JSON.stringify(block.input)}`;

        default:
            return assertNever(block); // Yeni tip eklenirse derleme hatası
    }
}

// Tam API çağrısı — tüm teknikler bir arada
async function callChatApi(message: string): Promise<string> {
    try {
        const res = await fetch("/api/chat", {
            method: "POST",
            body: JSON.stringify({ message })
        });

        // typeof değil — HTTP hata kontrolü
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        // 1. unknown olarak al
        const data: unknown = await res.json();

        // 2. Custom type guard ile doğrula
        if (!isChatMessage(data)) {
            throw new Error("Geçersiz API yanıtı");
        }

        // 3. Discriminated union ile her content block'u işle
        return data.content.map(processContentBlock).join("\n");

    } catch (error) {
        // 4. instanceof ile hataları sınıflandır
        if (error instanceof Error) {
            console.error("Chat API hatası:", error.message);
            throw error;
        }
        throw new Error("Bilinmeyen hata");
    }
}
```

</div>

<hr class="section-divider">

## ✅ Best Practices

<div class="callout callout-tip">

**✅ Custom Type Guard Best Practices:**
- Fonksiyon adı `is` ile başlasın: `isUser()`, `isError()`, `isValidResponse()`
- Tüm zorunlu alanların hem varlığını hem tipini kontrol et
- `as` cast'ini guard içinde kullan — dışarıda kullanma
- Array type guard için `Array.isArray` + `every` kombinasyonunu kullan
- Production'da schema validation kütüphanesi (Zod, Yup) ile type guard'ı birleştir

</div>

## ❌ Avoid

<div class="callout callout-danger">

**❌ Kaçınılması Gerekenler:**
```typescript
// ❌ Eksik alan kontrolü — güvenlik açığı
function isUser(value: unknown): value is User {
    return typeof value === "object"; // sadece obje mi kontrol — id/name/email yok
}
// API { type: "error", message: "..." } döndürse bile User gibi işlenir

// ❌ as cast ile type guard atlatmak
const user = data as User; // runtime'da doğrulama yok — güvenlik açığı
user.email.toUpperCase(); // data.email undefined ise patlar

// ✅ Doğru:
if (isUser(data)) {
    data.email.toUpperCase(); // ✅ kontrol edildi
}

// ❌ Boolean dönen normal fonksiyon — TypeScript tipi daraltmaz
function checkUser(x: unknown): boolean { return "id" in (x as object); }
if (checkUser(data)) {
    (data as User).name; // ❌ as cast gerekli — güvensiz
}
// ✅ Doğru: value is User dönüş tipi kullan
```

</div>

<hr class="section-divider">

## 📋 Özet

| Kavram | Syntax | Açıklama |
|--------|--------|----------|
| Type guard fonksiyonu | `function isX(v: unknown): v is X` | Boolean ile daraltma |
| Array type guard | `Array.isArray(v) && v.every(isX)` | `X[]` kontrolü |
| fetch + type guard | `unknown = await res.json(); if (!isX(data)) throw` | Runtime doğrulama |
| is vs boolean | `value is User` vs `boolean` | TypeScript sadece `is` ile daraltır |

**Tüm type narrowing teknikleri karar ağacı:**
```
Primitive?           → typeof
Class instance?      → instanceof
Interface, alan var? → in guard
Ortak "type" alanı? → Discriminated union + switch
Karmaşık obje?       → Custom type guard (value is T)
Tümü ele alındı mı? → assertNever ile exhaustive check
```
