# Optional, Readonly & Nested

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
Opsiyonel alanlar (`?`), readonly alanlar, iç içe (nested) objeler ve dinamik key yapıları (index signature, Record). Gerçek projelerde bu pattern'ler her gün karşına çıkar.

</div>

---

## 📖 Optional Properties — Opsiyonel Alanlar

`?` ile işaretlenen alanlar vermek zorunda değilsin:

```typescript
interface Profile {
    username: string;      // zorunlu
    email: string;         // zorunlu
    bio?: string;          // opsiyonel — verilmeyebilir
    avatarUrl?: string;    // opsiyonel
    phone?: string;        // opsiyonel
}

// bio ve avatarUrl olmadan da geçerli
const profile1: Profile = { username: "yunus", email: "yunus@mail.com" }; // ✅

// bio ile de geçerli
const profile2: Profile = {
    username: "yunus",
    email: "yunus@mail.com",
    bio: "Frontend developer"
}; // ✅
```

### Opsiyonel Alanı Kullanmadan Önce Kontrol

Opsiyonel alan `T | undefined` tipindedir. Kontrol etmeden kullanamazsın:

```typescript
function showBio(profile: Profile): string {
    // ❌ Hata — bio undefined olabilir
    // return profile.bio.toUpperCase();

    // ✅ Yöntem 1: if kontrolü
    if (profile.bio) {
        return profile.bio.toUpperCase();
    }
    return "Bio girilmemiş";

    // ✅ Yöntem 2: Optional chaining — undefined ise undefined döner, patlamaz
    // return profile.bio?.toUpperCase() ?? "Bio girilmemiş";
}

// ✅ Optional chaining (?.) — zincirleme erişimde güvenli
const bioLength = profile1.bio?.length; // bio yoksa undefined, varsa length

// ✅ Nullish coalescing (??) — null/undefined ise sağdaki değeri kullan
const bioText = profile1.bio ?? "Bio girilmemiş";
```

### PATCH Request Örneği

```typescript
// PUT: tüm alanları gönder
interface UpdateUserFull {
    name: string;
    email: string;
    bio: string;
}

// PATCH: sadece değişen alanları gönder (Partial<T> ile daha kısa)
interface UpdateUserPatch {
    name?: string;
    email?: string;
    bio?: string;
}

function patchUser(id: number, data: UpdateUserPatch): void {
    // data.name gelmiş mi? kontrol et
    if (data.name !== undefined) {
        console.log(`İsim güncelleniyor: ${data.name}`);
    }
}

patchUser(1, { name: "Yunus YILDIZ" });         // sadece isim ✅
patchUser(2, { email: "yeni@mail.com" });       // sadece email ✅
patchUser(3, { name: "Ahmet", bio: "Dev" });    // isim + bio ✅
```

<hr class="section-divider">

## 📖 Readonly Properties — Salt Okunur Alanlar

`readonly` ile işaretlenen alanlar bir kez set edilir, sonra değiştirilemez:

```typescript
interface Config {
    readonly apiUrl: string;      // değiştirilemez
    readonly version: number;     // değiştirilemez
    timeout: number;              // değiştirilebilir
}

const config: Config = {
    apiUrl: "https://api.example.com",
    version: 1,
    timeout: 3000
};

config.timeout = 5000;    // ✅ timeout mutable
// config.apiUrl = "..."; // ❌ Compile hatası — readonly
// config.version = 2;    // ❌ Compile hatası — readonly
```

### Readonly Dizi

```typescript
interface AppSettings {
    readonly supportedLanguages: readonly string[];
    readonly maxRetries: number;
}

const settings: AppSettings = {
    supportedLanguages: ["tr", "en", "de"],
    maxRetries: 3
};

// settings.supportedLanguages.push("fr"); // ❌ readonly dizi
// settings.maxRetries = 5;                // ❌ readonly alan
console.log(settings.supportedLanguages[0]); // ✅ okumak serbest
```

### Readonly\<T\> Utility Type

Var olan bir tipin tüm alanlarını readonly yapar:

```typescript
interface User {
    id: number;
    name: string;
    email: string;
}

type ImmutableUser = Readonly<User>;
// { readonly id: number; readonly name: string; readonly email: string }

// Fonksiyon parametresi — "içeride değiştirmiyorum" garantisi
function displayUser(user: Readonly<User>): void {
    // user.name = "..."; // ❌ compile hatası
    console.log(`${user.name} <${user.email}>`);
}
```

<hr class="section-divider">

## 📖 Nested Objects — İç İçe Objeler

Gerçek veri modelleri nadiren tek seviyeli olur. Siparişlerin müşterisi, müşterinin adresi vardır:

### Yanlış Yol — Inline Nested

```typescript
// ❌ Okunaksız — hepsini tek interface'e tık
interface OrderBad {
    id: number;
    customer: {
        name: string;
        email: string;
        address: {
            street: string;
            city: string;
            country: string;
        };
    };
    items: {
        productId: number;
        quantity: number;
        price: number;
    }[];
    total: number;
}
```

### Doğru Yol — Ayrı Interface'ler

```typescript
// ✅ Her objeyi ayrı interface'e böl
interface Address {
    street: string;
    city: string;
    country: string;
    zipCode?: string;
}

interface Customer {
    id: number;
    name: string;
    email: string;
    address: Address;     // Address tekrar kullanılabilir
}

interface OrderItem {
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
}

interface Order {
    id: number;
    customer: Customer;   // Customer tekrar kullanılabilir
    items: OrderItem[];   // OrderItem tekrar kullanılabilir
    total: number;
    status: "pending" | "shipped" | "delivered";
    createdAt: string;
}

// Kullanım — tam tip güvenceli
const order: Order = {
    id: 1,
    customer: {
        id: 101,
        name: "Yunus Yıldız",
        email: "yunus@mail.com",
        address: { street: "Bağdat Cad.", city: "İstanbul", country: "TR" }
    },
    items: [
        { productId: 1, productName: "Laptop", quantity: 1, unitPrice: 15999 }
    ],
    total: 15999,
    status: "pending",
    createdAt: "2025-01-15"
};

// Nested alana tip güvenceli erişim
console.log(order.customer.address.city); // "İstanbul"
```

<hr class="section-divider">

## 📖 Index Signature — Dinamik Key

Hangi key'lerin geleceğini bilmiyorsan index signature kullan:

```typescript
// Syntax: [key: tip]: değerTipi
interface Dictionary {
    [key: string]: string;
}

const dict: Dictionary = {
    hello: "Merhaba",
    goodbye: "Hoşçakal",
    thanks: "Teşekkürler"
};

// Dinamik erişim
dict["hello"];    // "Merhaba"
dict["yeniKey"];  // undefined (hata vermez!)
```

<div class="callout callout-warning">

**⚠️ Index Signature'ın Zayıf Noktası**

Index signature, her string key'e izin verir — typo'ları yakalamaz:

```typescript
const config: Dictionary = { apiUrl: "https://api.com" };
config["apiURl"]; // typo! ama TypeScript uyarmaz
```

Key seti belliyse `Record<K, V>` daha güvenlidir.

</div>

### Record<K, V> — Daha Güvenli Alternatif

```typescript
// Key seti belli — union type ile kısıtla
type Language = "tr" | "en" | "de";

const greetings: Record<Language, string> = {
    tr: "Merhaba",
    en: "Hello",
    de: "Hallo"
    // fr: "Bonjour" // ❌ Hata — "fr" Language union'ında yok
};

// Eksik key'i atlayamazsın
const incomplete: Record<Language, string> = {
    tr: "Merhaba",
    en: "Hello"
    // ❌ Hata: "de" eksik
};
```

### Index Signature + Sabit Alan

```typescript
interface FormErrors {
    formId: string;                  // sabit, zorunlu alan
    [fieldName: string]: string;     // dinamik field hataları
}

const loginErrors: FormErrors = {
    formId: "login-form",
    email: "Geçerli email girin",
    password: "En az 8 karakter olmalı"
};
```

<hr class="section-divider">

## 🏭 Real-World Kullanım

<div class="callout callout-real-world">

**🏭 i18n Çeviri Sistemi**

```typescript
type Locale = "tr" | "en" | "de" | "fr";

interface Translations {
    [key: string]: string;
}

const messages: Record<Locale, Translations> = {
    tr: {
        welcome: "Hoş geldiniz",
        error: "Bir hata oluştu",
        loading: "Yükleniyor..."
    },
    en: {
        welcome: "Welcome",
        error: "An error occurred",
        loading: "Loading..."
    },
    de: {
        welcome: "Willkommen",
        error: "Ein Fehler ist aufgetreten",
        loading: "Laden..."
    },
    fr: {
        welcome: "Bienvenue",
        error: "Une erreur s'est produite",
        loading: "Chargement..."
    }
};

function t(locale: Locale, key: string): string {
    return messages[locale]?.[key] ?? key;
}

console.log(t("tr", "welcome")); // → "Hoş geldiniz"
console.log(t("en", "error"));  // → "An error occurred"
```

</div>

<div class="callout callout-real-world">

**🏭 Cache Sistemi**

```typescript
interface CacheEntry<T> {
    data: T;
    readonly cachedAt: number;    // Unix timestamp — değişmemeli
    readonly ttl: number;          // Time to live (ms) — değişmemeli
    hitCount: number;             // mutable — her erişimde artar
}

type Cache<T> = Record<string, CacheEntry<T>>;

class UserCache {
    private cache: Cache<User> = {};

    set(key: string, user: User, ttl: number = 60000): void {
        this.cache[key] = {
            data: user,
            cachedAt: Date.now(),
            ttl,
            hitCount: 0
        };
    }

    get(key: string): User | null {
        const entry = this.cache[key];
        if (!entry) return null;
        if (Date.now() - entry.cachedAt > entry.ttl) {
            delete this.cache[key];
            return null;
        }
        entry.hitCount++; // mutable alanı güncelle
        return entry.data;
    }
}
```

</div>

<hr class="section-divider">

## ✅ Best Practices

<div class="callout callout-tip">

**✅ Optional, Readonly & Nested Best Practices:**
- Opsiyonel alanları kullanmadan önce `?.` veya `if` kontrolü yap
- PATCH endpoint'lerinde tüm alanları opsiyonel yap: `Partial<T>`
- Config ve ID alanlarını `readonly` yap — değişmemeli
- Nested objeleri ayrı interface'lere böl — 3 seviyeden derin nested yapıdan kaçın
- Key seti belliyse index signature yerine `Record<K, V>` kullan
- `??` ile null/undefined için default değer ver

</div>

## ❌ Avoid

<div class="callout callout-danger">

**❌ Kaçınılması Gerekenler:**
```typescript
// ❌ Opsiyonel alanı kontrol etmeden kullan
const name = profile.bio.toUpperCase(); // bio undefined ise: TypeError!

// ❌ 5+ seviye nested inline obje
type DeepNested = {
    a: { b: { c: { d: { e: string } } } }
}; // bölümlemek gerekiyor

// ❌ Index signature ile sabit key — typo'lar yakalanmaz
const routes: { [path: string]: Handler } = {
    "/usres": handleUsers // typo! ama TypeScript uyarmaz
};
// ✅ Bunun yerine:
type AppRoute = "/users" | "/products" | "/orders";
const routes2: Record<AppRoute, Handler> = { ... };
```

</div>

<hr class="section-divider">

## 📋 Özet

| Özellik | Syntax | Ne Zaman? |
|---------|--------|-----------|
| Optional | `field?: T` | Kullanıcı doldurmayabilir |
| Optional chaining | `obj?.field` | Null/undefined güvenli erişim |
| Nullish coalescing | `a ?? b` | Null/undefined ise default |
| Readonly | `readonly field: T` | Config, ID, sabit değerler |
| `Readonly<T>` | Utility type | Tüm alanları readonly yap |
| Nested | Ayrı interface | 2+ seviyeli veri modelleri |
| Index signature | `[key: string]: T` | Dinamik, bilinmeyen key'ler |
| Record | `Record<K, V>` | Bilinen union key → değer |
