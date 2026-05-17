# Union Types & Type Inference

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
Union type ile "ya bu ya o" tip tanımlaması. Type inference ile TypeScript'in tipi kendisi çıkarması. Ne zaman tipi elle yazman gerekir, ne zaman yazmana gerek yoktur.

</div>

---

## 📖 Union Type — "Ya Bu Ya O"

Union type, bir değişkenin birden fazla tipte olabileceğini belirtir. `|` (pipe) operatörü ile yazılır:

```typescript
// Sadece string
let name: string = "Yunus";

// Sadece number
let age: number = 25;

// string VEYA number — union type
let id: string | number;
id = "abc-123"; // ✅
id = 42;        // ✅
// id = true;   // ❌ boolean değil, hata

// Üç tip birden
let value: string | number | boolean;
value = "Yunus"; // ✅
value = 42;      // ✅
value = true;    // ✅
value = null;    // ❌ null dahil değil
```

<hr class="section-divider">

## 📖 Union Type ile Fonksiyon

Union type alan fonksiyonlarda TypeScript, hangi tipin geldiğini kontrol etmeni zorunlu kılar:

```typescript
function formatId(id: string | number): string {
    // id burada string | number — ikisi de olabilir
    // Doğrudan string metodunu çağıramazsın
    // id.toUpperCase(); // ❌ hata — number'ın toUpperCase'i yok

    // Önce kontrol et, sonra kullan
    if (typeof id === "string") {
        return id.toUpperCase(); // ✅ burada TypeScript bilir: id string
    } else {
        return `#${id}`;        // ✅ burada TypeScript bilir: id number
    }
}

console.log(formatId("abc-123")); // → "ABC-123"
console.log(formatId(42));        // → "#42"
```

Bu kontrol mekanizmasına **type narrowing** denir — ayrı bir bölümde detaylı göreceksin.

<hr class="section-divider">

## 📖 Literal Union Type — Belirli Değerler

String veya number literallerini union ile birleştirerek sadece belirli değerlere izin verebilirsin:

```typescript
// Sadece bu 3 string değeri geçerli
type Direction = "up" | "down" | "left" | "right";

let move: Direction = "up";    // ✅
move = "left";                  // ✅
// move = "forward";            // ❌ hata — bu değer tanımlı değil
// move = "Up";                 // ❌ hata — büyük/küçük harf duyarlı

// Sayısal literaller
type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;
let roll: DiceValue = 4; // ✅
// roll = 7;              // ❌ hata

// Karışık literaller
type Result = "success" | "error" | null;
let apiResult: Result = "success"; // ✅
apiResult = null;                  // ✅
// apiResult = "pending";          // ❌ hata
```

### Literal Union — Gerçekçi Örnek

```typescript
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type ContentType = "application/json" | "text/html" | "multipart/form-data";
type Theme = "light" | "dark" | "system";
type Language = "tr" | "en" | "de" | "fr" | "es";

interface RequestConfig {
    method: HttpMethod;
    contentType: ContentType;
    timeout?: number;
}

function makeRequest(url: string, config: RequestConfig): void {
    console.log(`${config.method} ${url}`);
    // config.method = "CONNECT"; // ❌ geçerli değil
}

makeRequest("/api/users", { method: "GET", contentType: "application/json" });
makeRequest("/api/users", { method: "POST", contentType: "application/json" });
```

<hr class="section-divider">

## 📖 Union Type ile Nullable Değerler

Bir değerin bazen `null` veya `undefined` olabileceğini belirtmek için:

```typescript
// Kullanıcı giriş yapmamış olabilir
let currentUser: User | null = null;

// Bulunmayabilir
function findUser(id: number): User | undefined {
    return users.find(u => u.id === id);
}

// Null kontrolü
const user = findUser(1);
if (user !== undefined) {
    console.log(user.name); // ✅ güvenli — undefined değil
}

// Optional chaining ile daha kısa
console.log(user?.name); // user undefined ise undefined döner, patlamaz

// Nullish coalescing ile default değer
console.log(user?.name ?? "Misafir"); // user yoksa "Misafir"
```

<hr class="section-divider">

## 📖 Type Inference — TypeScript'in Tip Çıkarımı

**Type inference**, TypeScript'in değerden tipi kendisi çıkarmasıdır. Açıkça yazmana gerek yoktur:

```typescript
// Değer atandığında TypeScript tipi çıkarır
let city = "İstanbul";     // TypeScript: string
let population = 15000000; // TypeScript: number
let isCapital = false;      // TypeScript: boolean
let primes = [2, 3, 5, 7]; // TypeScript: number[]

// Artık tip kilitli — başka tip atayamazsın
// city = 42;       // ❌ hata: string değişkene number atılamaz
// population = "?"; // ❌ hata: number değişkene string atılamaz
```

### Object Inference

```typescript
// TypeScript objenin şeklini çıkarır
let product = {
    id: 1,
    name: "Laptop",
    price: 15999,
    inStock: true
};

// product'ın tipi otomatik:
// { id: number, name: string, price: number, inStock: boolean }

product.name = "Gaming Laptop"; // ✅
// product.price = "expensive"; // ❌ hata: string değil number
// product.color = "black";     // ❌ hata: 'color' bu objede yok
```

### Fonksiyon Dönüş Tipi Inference

```typescript
// Dönüş tipini yazmasan da TypeScript çıkarır
function add(a: number, b: number) {
    return a + b; // TypeScript anlar: number döner
}

const result = add(3, 4); // result: number — TypeScript bilir

function createUser(name: string, age: number) {
    return { name, age, createdAt: new Date() };
}
// Dönüş tipi: { name: string, age: number, createdAt: Date }
const newUser = createUser("Yunus", 25);
// newUser.name → string
// newUser.createdAt → Date
```

<hr class="section-divider">

## 📖 Ne Zaman Tip Yaz, Ne Zaman Yazma?

Bu sorunun net bir cevabı var:

```typescript
// ✅ TİP YAZ: Fonksiyon parametreleri — TypeScript çıkaramaz
function multiply(a: number, b: number): number {
    return a * b;
}

// ✅ TİP YAZ: Başlangıç değeri yoksa
let userId: number;
userId = getUserIdFromDatabase(); // sonra atanıyor

// ✅ TİP YAZ: Union tip — belirsizlik var
let input: string | number = getUserInput();

// ✅ TİP YAZ: API response — any döner, sen tipini belirt
const response: User = await apiGet<User>("/api/user/1");

// ✅ YAZMA (inference yeterli): değer açıkça belli
let total = 0;                          // number olduğu belli
let items = ["a", "b", "c"];           // string[] olduğu belli
let isLoading = false;                  // boolean olduğu belli
let user = { id: 1, name: "Yunus" };   // şekil belli

// ✅ YAZMA: arrow function parametresi — callback context varsa
const numbers = [1, 2, 3];
const doubled = numbers.map(n => n * 2); // n: number — TypeScript anlar
```

<hr class="section-divider">

## 📖 as const — Değişmez Literal Tipler

`as const` ile değişkeni en dar (literal) tipine kilitlersин:

```typescript
// Normal inference — geniş tip
let status = "active"; // string — "inactive" de atanabilir

// as const — dar literal tip
let status2 = "active" as const; // "active" — sadece bu değer

// Obje ile
const config = {
    host: "localhost",
    port: 3000,
    debug: true
} as const;

// config.host: "localhost" (literal)
// config.port: 3000 (literal)
// config.host = "other"; // ❌ readonly — değiştirilemez

// Dizi ile as const
const directions = ["up", "down", "left", "right"] as const;
// directions: readonly ["up", "down", "left", "right"]
type Direction = typeof directions[number]; // "up" | "down" | "left" | "right"
```

<hr class="section-divider">

## 🏭 Real-World Kullanım

<div class="callout callout-real-world">

**🏭 Form Validation — Union Type**

```typescript
type FieldName = "email" | "password" | "name" | "phone";
type FieldStatus = "idle" | "valid" | "invalid" | "loading";

interface FieldState {
    value: string;
    status: FieldStatus;
    error: string | null;
}

type FormState = Record<FieldName, FieldState>;

const initialFormState: FormState = {
    email:    { value: "", status: "idle", error: null },
    password: { value: "", status: "idle", error: null },
    name:     { value: "", status: "idle", error: null },
    phone:    { value: "", status: "idle", error: null }
};

function validateEmail(email: string): "valid" | "invalid" {
    return email.includes("@") ? "valid" : "invalid";
}
```

</div>

<div class="callout callout-real-world">

**🏭 API Response Durumları**

```typescript
type ApiState<T> =
    | { status: "idle" }
    | { status: "loading" }
    | { status: "success"; data: T }
    | { status: "error"; message: string };

// Discriminated union — status field'ına göre TypeScript anlar
function renderUserState(state: ApiState<User>): string {
    switch (state.status) {
        case "idle":    return "Henüz yüklenmedi";
        case "loading": return "Yükleniyor...";
        case "success": return `Hoş geldiniz, ${state.data.name}!`;
        case "error":   return `Hata: ${state.message}`;
    }
}
```

</div>

<hr class="section-divider">

## ✅ Best Practices

<div class="callout callout-tip">

**✅ Union & Inference Best Practices:**
- Literal union type'ı `type` alias ile isimlendir: `type Status = "active" | "inactive"`
- Union type fonksiyona girince type narrowing yap — direkt kullanma
- `as const` ile sabit konfigürasyonları dondurmayı alışkanlık edin
- Nullable değerlerde `| null` veya `| undefined` açıkça yaz
- Inference'a güven — değer belliyse tipi tekrar yazmak boşa tekrar

</div>

## ❌ Avoid

<div class="callout callout-danger">

**❌ Kaçınılması Gerekenler:**
```typescript
// ❌ Geniş union — neredeyse any kadar kötü
let value: string | number | boolean | object | null | undefined;

// ❌ Union kontrolü yapmadan kullanma
function process(id: string | number): void {
    id.toUpperCase(); // ❌ hata — number'ın toUpperCase'i yok
}

// ❌ İnference varken gereksiz tip yazmak
let total: number = 0; // 0 olduğu belli, ": number" gereksiz
let name: string = "Yunus"; // "Yunus" string olduğu belli

// ✅ Daha sade:
let total2 = 0;
let name2 = "Yunus";
```

</div>

<hr class="section-divider">

## 📋 Özet

| Kavram | Syntax | Kullanım |
|--------|--------|----------|
| Union type | `string \| number` | Birden fazla tip olabilir |
| Literal union | `"a" \| "b" \| "c"` | Sadece belirli değerler |
| Nullable | `User \| null` | Değer olmayabilir |
| Type inference | Otomatik | Değer belliyse tipi TypeScript çıkarır |
| `as const` | `"x" as const` | Değeri literal tipine kilitle |

**Type Inference Kuralı:**
- Fonksiyon parametresi → her zaman tip yaz
- Başlangıç değeri belli → yazmana gerek yok
- Belirsizlik varsa → yaz
