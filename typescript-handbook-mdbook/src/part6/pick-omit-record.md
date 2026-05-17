# Pick, Omit & Record

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
`Pick<T,K>` seçili alanları alır, `Omit<T,K>` seçili alanları çıkarır, `Record<K,V>` key-value map tipi oluşturur. Bu üçü obje şekillendirmede en sık kullanılan utility type'lardır.

</div>

---

## 📖 Pick\<T, K\> — Sadece İstediğin Alanlar

`Pick<T, K>`, T interface'inden sadece K ile belirtilen alanları seçip yeni bir tip oluşturur. "Büyük modelden küçük bir kesit al" demek.

```typescript
interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    role: "admin" | "editor" | "viewer";
    createdAt: string;
}

// Dropdown için sadece id + name yeterli
type UserOption = Pick<User, "id" | "name">;
// { id: number, name: string }

// Liste satırı için — password ve createdAt gerekmez
type UserListItem = Pick<User, "id" | "name" | "email" | "role">;

// Kart bileşeni için — sadece görüntülenecekler
type UserCard = Pick<User, "name" | "email" | "role">;

const userCard: UserCard = { name: "Yunus", email: "yunus@mail.com", role: "admin" };
// userCard.id — ❌ hata — Pick'te yok

// Fonksiyon sadece ihtiyacı kadar veri ister
function renderUserOption(user: UserOption): string {
    return `<option value="${user.id}">${user.name}</option>`;
}
```

### Post Önizlemesi

```typescript
interface Post {
    id: number;
    title: string;
    content: string;   // uzun metin — liste sayfasında gerekmez
    authorId: number;
    publishedAt?: string;
    tags: string[];
}

// Liste sayfası — content yok
type PostPreview = Pick<Post, "id" | "title" | "authorId" | "tags">;

// Detay sayfası — hepsi var
type PostDetail = Post; // orijinal
```

**Ne zaman Pick kullanılır:**
- Alınacak alan sayısı **az** ise (`Pick<User, "id" | "name">`)
- UI bileşenlerine sadece ilgili alanları geçmek
- API response'un sadece gerekli alanlarını kullanmak (over-fetching azalt)

<hr class="section-divider">

## 📖 Omit\<T, K\> — İstemediğin Alanları Çıkar

`Omit<T, K>`, Pick'in tam tersidir. T'den K ile belirtilen alanları çıkarır, geri kalanını alır. "Şunlar hariç hepsi" demek.

```typescript
// Backend üretir — create DTO'da olmamalı
type CreateUserDto = Omit<User, "id" | "createdAt">;
// { name: string, email: string, password: string, role: "admin" | ... }

const newUser: CreateUserDto = {
    name: "Yunus",
    email: "yunus@mail.com",
    password: "secret123",
    role: "editor"
};
// newUser.id — ❌ hata — Omit'te yok

// API response'ta asla password dönmemeli
type SafeUser = Omit<User, "password">;
// { id, name, email, role, createdAt }

function toSafeUser(user: User): SafeUser {
    const { password, ...safe } = user; // destructuring ile çıkar
    return safe;
}

// Güncelleme DTO — id ve authorId değiştirilemez
type UpdatePostDto = Omit<Partial<Post>, "id" | "authorId">;
// { title?, content?, publishedAt?, tags? }
```

### Pick vs Omit Seçimi

```typescript
// User'dan password hariç her şeyi al:
type SafeUser2 = Omit<User, "password">;                                    // 1 alan yaz
type SafeUser3 = Pick<User, "id" | "name" | "email" | "role" | "createdAt">; // 5 alan yaz

// İkisi aynı sonucu verir — Omit daha az yazdırdı ✅

// Kural:
// Az alan çıkaracaksan  → Omit
// Az alan alacaksan     → Pick
```

<hr class="section-divider">

## 📖 Record\<K, V\> — Key-Value Map Tipi

`Record<K, V>`, K tipinde key'lere ve V tipinde value'lara sahip obje tipi oluşturur. `{ [key: K]: V }` yazmaktan çok daha güçlü: K union type olduğunda TypeScript **tüm key'lerin tanımlı olmasını zorlar**.

```typescript
type UserRole = "admin" | "editor" | "viewer";

// Rol → izin listesi tablosu
// Tüm roller tanımlanmak zorunda — eksik bırakamazsın
const rolePermissions: Record<UserRole, string[]> = {
    admin: ["read", "write", "delete", "manage"],
    editor: ["read", "write"],
    viewer: ["read"]
    // "admin" eksik bıraksan derleme hatası — exhaustive ✅
};

// Kullanım
function getPermissions(role: UserRole): string[] {
    return rolePermissions[role];
}
```

### Lookup Table

```typescript
// HTTP status mesajları
const httpMessages: Record<number, string> = {
    200: "OK",
    201: "Created",
    400: "Bad Request",
    401: "Unauthorized",
    404: "Not Found",
    500: "Internal Server Error"
};

// ID → User cache
const userCache: Record<number, User> = {};

function cacheUser(user: User): void {
    userCache[user.id] = user;
}

function getCachedUser(id: number): User | undefined {
    return userCache[id]; // O(1) erişim
}
```

### Form Field State Tablosu

```typescript
type FormField = "email" | "password" | "name";
type FieldState = "idle" | "valid" | "invalid" | "loading";

// Tüm form alanlarının durumu — eksiksiz tanımlı olmalı
const fieldStates: Record<FormField, FieldState> = {
    email: "idle",
    password: "idle",
    name: "valid"
    // "email" eksik bıraksan hata — union key garantisi ✅
};
```

### Record\<string, unknown\> Pattern

```typescript
// Bilinmeyen obje — any'den güvenli alternatif
function logObject(obj: Record<string, unknown>): void {
    Object.entries(obj).forEach(([key, val]) => {
        console.log(`${key}: ${val}`);
    });
}

logObject({ name: "Yunus", age: 25 }); // ✅
```

<hr class="section-divider">

## 🏭 Real-World: i18n ve Permission Sistemi

<div class="callout callout-real-world">

**🏭 Çok Dilli Uygulama (i18n)**

```typescript
type Locale = "tr" | "en" | "de";
type TranslationKey = "welcome" | "logout" | "profile" | "settings";

// Her dil için tüm key'ler tanımlı olmalı
const translations: Record<Locale, Record<TranslationKey, string>> = {
    tr: {
        welcome: "Hoş geldiniz",
        logout: "Çıkış Yap",
        profile: "Profil",
        settings: "Ayarlar"
    },
    en: {
        welcome: "Welcome",
        logout: "Logout",
        profile: "Profile",
        settings: "Settings"
    },
    de: {
        welcome: "Willkommen",
        logout: "Abmelden",
        profile: "Profil",
        settings: "Einstellungen"
    }
    // Eksik locale → derleme hatası ✅
};

function t(locale: Locale, key: TranslationKey): string {
    return translations[locale][key];
}

console.log(t("tr", "welcome")); // → "Hoş geldiniz"
// t("fr", "welcome"); // ❌ hata — "fr" geçerli locale değil
```

**🏭 Rol Bazlı Erişim Kontrolü (RBAC)**

```typescript
type Permission = "read" | "write" | "delete" | "manage";
type Role = "admin" | "editor" | "viewer";

// Her rol için izin kümesi — eksiksiz tanımlı
const ROLE_PERMISSIONS: Record<Role, Set<Permission>> = {
    admin: new Set(["read", "write", "delete", "manage"]),
    editor: new Set(["read", "write"]),
    viewer: new Set(["read"])
};

function hasPermission(role: Role, permission: Permission): boolean {
    return ROLE_PERMISSIONS[role].has(permission);
}

// Component düzeyinde — yetki bazlı render
type UserProfile = Pick<User, "id" | "name" | "role">;

function canDelete(user: UserProfile): boolean {
    return hasPermission(user.role, "delete");
}
```

</div>

<hr class="section-divider">

## ✅ Best Practices

<div class="callout callout-tip">

**✅ Pick / Omit / Record Best Practices:**
- Az çıkarılacak alan varsa Omit, az alınacak alan varsa Pick kullan
- API response'tan hassas alanları (`password`, `token`) Omit et
- Backend ürettiği alanları (`id`, `createdAt`) create DTO'larından Omit et
- Lookup tabloları için `Record<UnionKey, V>` kullan — eksik key derleme hatası verir
- Bilinmeyen objeler için `Record<string, unknown>` kullan — `any`'den güvenli

</div>

## ❌ Avoid

<div class="callout callout-danger">

**❌ Kaçınılması Gerekenler:**
```typescript
// ❌ Hassas alanları response'ta döndürmek
async function getUser(id: number): Promise<User> {
    return db.findUser(id); // password dahil dönüyor — güvenlik açığı!
}
// ✅ Doğru:
async function getUser(id: number): Promise<SafeUser> {
    const user = await db.findUser(id);
    return toSafeUser(user);
}

// ❌ index signature — eksik key'i TypeScript görmez
const roleMap: { [key: string]: string[] } = {
    admin: ["read", "write"]
    // "viewer" eksik — TypeScript uyarmaz ❌
};
// ✅ Record ile union key:
const roleMap: Record<UserRole, string[]> = {
    admin: ["read", "write"],
    editor: ["read"],
    viewer: ["read"] // eksik bıraksan hata ✅
};

// ❌ Pick ve Omit'i yanlış seçmek
// 10 alanlı User'dan 1 alan almak istiyorsan:
type X = Pick<User, "id">; // 1 alan yaz — doğru ✅
type Y = Omit<User, "name" | "email" | "password" | "role" | "createdAt">; // 5 alan yaz — gereksiz
```

</div>

<hr class="section-divider">

## 📋 Özet

| Utility Type | Ne Yapar | Seçim Kriteri |
|--------------|----------|---------------|
| `Pick<T, K>` | Sadece K alanlarını al | Alınacak alan sayısı az |
| `Omit<T, K>` | K alanları hariç hepsi | Çıkarılacak alan sayısı az |
| `Record<K, V>` | K→V map tipi | Lookup table, exhaustive map |

**Record ile index signature farkı:**
```typescript
{ [key: string]: V }          // herhangi bir string key — eksik key yok
Record<"a" | "b" | "c", V>   // sadece a, b, c — eksik key derleme hatası
```
