# Exclude, Extract & NonNullable

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
`Exclude<T,U>` union'dan değer çıkarır, `Extract<T,U>` union'dan değer seçer, `NonNullable<T>` null/undefined temizler. Ayrıca `ReturnType<T>` ve `Parameters<T>` ile fonksiyon tiplerini çıkarmayı öğreneceksin.

</div>

---

## 📖 Obje vs Union — Doğru Utility Type'ı Seç

Utility type'ları iki gruba ayrılır. **Önce bunu bil:**

| Grup | Utility Types | Ne üzerinde çalışır |
|------|---------------|---------------------|
| Obje şekillendirme | `Partial`, `Required`, `Readonly`, `Pick`, `Omit`, `Record` | Interface / obje tipi |
| Union filtrele | `Exclude`, `Extract`, `NonNullable` | Union tip (`A \| B \| C`) |

Yanlış seçmek tip hatası değil, beklediğin sonucu vermemek demek.

<hr class="section-divider">

## 📖 Exclude\<T, U\> — Union'dan Değer Çıkar

`Exclude<T, U>`, union tip T'den U'ya atanabilir tipleri **çıkarır**. "Bu union'dan şunu çıkarmak istiyorum" dediğinde kullanılır:

```typescript
type AllStatus = "active" | "inactive" | "pending" | "deleted";

// "deleted" çıkar — soft delete'i kullanıcıya gösterme
type VisibleStatus = Exclude<AllStatus, "deleted">;
// → "active" | "inactive" | "pending"

// Birden fazla çıkar
type ActiveStatus = Exclude<AllStatus, "inactive" | "deleted">;
// → "active" | "pending"

// Primitive'leri filtrele
type OnlyString = Exclude<string | number | boolean, number | boolean>;
// → string
```

### Event Sistemi Filtresi

```typescript
type AppEvent =
    | "user:login"
    | "user:logout"
    | "user:delete"
    | "post:create"
    | "post:delete";

// Silme event'lerini çıkar — audit log dışında kullanma
type SafeEvent = Exclude<AppEvent, "user:delete" | "post:delete">;
// → "user:login" | "user:logout" | "post:create"

function handleSafeEvent(event: SafeEvent): void {
    console.log(`Event: ${event}`);
}

handleSafeEvent("user:login");    // ✅
// handleSafeEvent("user:delete"); // ❌ hata — Exclude ile çıkarıldı
```

<hr class="section-divider">

## 📖 Extract\<T, U\> — Union'dan Değer Seç

`Extract<T, U>`, Exclude'un tam tersidir. T'den sadece U'ya atanabilir tipleri **alır**. "Bu union'dan sadece şunları istiyorum" dediğinde kullanılır:

```typescript
type Mixed = string | number | boolean | null | undefined;

// Sadece primitive değerleri al (null/undefined hariç)
type Primitives = Extract<Mixed, string | number | boolean>;
// → string | number | boolean

// Sadece falsy değerleri al
type Falsy = Extract<Mixed, null | undefined | false | 0 | "">;
// → null | undefined
```

### Template Literal ile Güçlü Filtreleme

```typescript
type AppEvent =
    | "user:login"
    | "user:logout"
    | "user:delete"
    | "post:create"
    | "post:delete";

// Template literal — "user:" ile başlayanları al
type UserEvents = Extract<AppEvent, `user:${string}`>;
// → "user:login" | "user:logout" | "user:delete"

type PostEvents = Extract<AppEvent, `post:${string}`>;
// → "post:create" | "post:delete"

function handleUserEvent(event: UserEvents): void {
    switch (event) {
        case "user:login": console.log("Giriş"); break;
        case "user:logout": console.log("Çıkış"); break;
        case "user:delete": console.log("Silindi"); break;
    }
}

handleUserEvent("user:login");    // ✅
// handleUserEvent("post:create"); // ❌ hata — user event değil
```

### Exclude vs Extract Özeti

```typescript
// Exclude = çıkar (hariç tut)
type WithoutNull = Exclude<string | null | undefined, null | undefined>;
// → string

// Extract = seç (sadece bunları al)
type OnlyNull = Extract<string | null | undefined, null | undefined>;
// → null | undefined

// Akılda kalması için:
// Exclude → "bunlar HARİÇ"
// Extract → "SADECE bunlar"
```

<hr class="section-divider">

## 📖 NonNullable\<T\> — Null ve Undefined Temizle

`NonNullable<T>`, T'den `null` ve `undefined`'ı çıkarır. `Exclude<T, null | undefined>` ile aynı şey — ama daha okunabilir:

```typescript
type MaybeUser = User | null | undefined;

type DefiniteUser = NonNullable<MaybeUser>;
// → User

// Fonksiyon parametresi — null gelemez garantisi
function processUser(user: NonNullable<MaybeUser>): void {
    console.log(user.name); // güvenli — null kontrolü gerekmez
}

// Generic assert utility
function assertNotNull<T>(value: T | null | undefined, label: string): NonNullable<T> {
    if (value === null || value === undefined) {
        throw new Error(`${label} boş olamaz`);
    }
    return value as NonNullable<T>;
}

// Kullanım — API response'tan nullable veriyi kesinleştir
const maybeUser: User | null = await fetchUser(1);
const user = assertNotNull(maybeUser, "user"); // User tipinde
console.log(user.name); // ✅ güvenli
```

<hr class="section-divider">

## 📖 ReturnType\<T\> & Parameters\<T\>

Fonksiyon tiplerini çıkarmak için iki güçlü utility type:

```typescript
function createSession(userId: number, role: "admin" | "editor" | "viewer") {
    return {
        token: "jwt-token-here",
        userId,
        role,
        expiresAt: new Date().toISOString()
    };
}

// Dönüş tipini elle yazmak zorunda değilsin
type Session = ReturnType<typeof createSession>;
// → { token: string, userId: number, role: "admin" | "editor" | "viewer", expiresAt: string }

const session: Session = createSession(1, "admin");

// Parametre tiplerini tuple olarak al
type CreateSessionParams = Parameters<typeof createSession>;
// → [userId: number, role: "admin" | "editor" | "viewer"]

type FirstParam  = Parameters<typeof createSession>[0]; // number
type SecondParam = Parameters<typeof createSession>[1]; // "admin" | "editor" | "viewer"
```

### Dış Kütüphane ile ReturnType

```typescript
// Kütüphane tipini import etmeden kullan
import { useForm } from "react-hook-form";

// useForm'un ne döndürdüğünü elle yazmak zorunda değilsin
type FormMethods = ReturnType<typeof useForm>;

// React hook'unun tipini başka component'te kullan
function useAuth() {
    return { user: null as User | null, login, logout };
}

type AuthContext = ReturnType<typeof useAuth>;
// → { user: User | null, login: ..., logout: ... }
// useAuth değişince AuthContext otomatik güncellenir
```

<hr class="section-divider">

## 🏭 Real-World: Utility Type Zinciri

<div class="callout callout-real-world">

**🏭 Tek Base Model'den Tüm DTO'ları Türet**

Production'da iyi pratik: bir `Entity` interface'i yaz, gerisini utility type ile türet. Base model değişince tüm türetilmiş tipler otomatik güncellenir.

```typescript
// SINGLE SOURCE OF TRUTH — tek kaynak
interface UserEntity {
    id: number;
    name: string;
    email: string;
    password: string;
    role: "admin" | "editor" | "viewer";
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// DTO'lar — base model'den türet, elle yazma
type CreateUserRequest   = Omit<UserEntity, "id" | "createdAt" | "updatedAt">;
type UpdateUserRequest   = Partial<Omit<UserEntity, "id" | "createdAt" | "updatedAt">>;
type UserPublicResponse  = Readonly<Omit<UserEntity, "password">>;
type UserListItem        = Pick<UserEntity, "id" | "name" | "email" | "role" | "isActive">;
type UserDropdownOption  = Pick<UserEntity, "id" | "name">;

// Role alt kümeleri
type AdminRole   = Extract<UserEntity["role"], "admin">;             // "admin"
type NonAdminRole = Exclude<UserEntity["role"], "admin">;            // "editor" | "viewer"

// Store state
type UserStore = Readonly<{
    list: readonly UserListItem[];
    selected: UserPublicResponse | null;
    loading: boolean;
}>;

// API service — her endpoint doğru DTO'yu kullanır
class UserApiService {
    async create(data: CreateUserRequest): Promise<UserPublicResponse> {
        const res = await fetch("/api/users", {
            method: "POST",
            body: JSON.stringify(data)
        });
        return res.json();
    }

    async list(): Promise<UserListItem[]> {
        const res = await fetch("/api/users");
        return res.json();
    }

    async options(): Promise<UserDropdownOption[]> {
        const res = await fetch("/api/users?fields=id,name");
        return res.json();
    }
}
```

**Avantaj:** `UserEntity`'ye yeni bir alan ekleyince tüm DTO'lar otomatik güncellenir. Elle yazılmış DTO'larda sync kaybı yaşanmaz.

</div>

<hr class="section-divider">

## ✅ Best Practices

<div class="callout callout-tip">

**✅ Exclude / Extract / NonNullable Best Practices:**
- Union'dan değer çıkarmak için `Exclude`, seçmek için `Extract` kullan
- `null | undefined` temizlemek için `NonNullable<T>` kullan — `Exclude<T, null | undefined>` yazmaktan kısa
- Dış kütüphane tiplerini `ReturnType<typeof fn>` ile türet — import gerekmez, sync kalır
- `assertNotNull` gibi generic util fonksiyonlar yaz — null kontrolünü bir kez yaz, her yerde kullan
- Base model'den utility type zincirleriyle DTO türet — single source of truth

</div>

## ❌ Avoid

<div class="callout callout-danger">

**❌ Kaçınılması Gerekenler:**
```typescript
// ❌ Omit ile union filtremeye çalışmak — çalışmaz
type X = Omit<"active" | "inactive" | "deleted", "deleted">; // hata veya beklenmedik sonuç
// ✅ Union için Exclude kullan:
type X = Exclude<"active" | "inactive" | "deleted", "deleted">;

// ❌ Exclude ile obje alanı çıkarmaya çalışmak
type Y = Exclude<User, "password">; // çalışmaz — User union değil
// ✅ Obje için Omit kullan:
type Y = Omit<User, "password">;

// ❌ ReturnType'ı gereksiz yere kullanmak — orijinal tipi import etmek daha okunabilir
type Z = ReturnType<typeof someSimpleFunction>; // string döndürüyorsa sadece string yaz
// ✅ ReturnType'ı dış kütüphane veya karmaşık obje için kullan

// ❌ null kontrolsüz NonNullable kullanmak
function process(user: User | null): void {
    const u = user as NonNullable<User | null>; // ❌ as cast — runtime'da null gelirse patlar
    u.name;
}
// ✅ Gerçekten kontrol et:
function process(user: User | null): void {
    if (!user) return;
    user.name; // ✅ TypeScript artık User olduğunu bilir
}
```

</div>

<hr class="section-divider">

## 📋 Özet

| Utility Type | Ne Yapar | Kullanım |
|--------------|----------|----------|
| `Exclude<T, U>` | Union'dan U'yu çıkar | `Exclude<Status, "deleted">` |
| `Extract<T, U>` | Union'dan sadece U'yu al | `Extract<Events, \`user:${string}\`>` |
| `NonNullable<T>` | null ve undefined çıkar | `NonNullable<User \| null>` |
| `ReturnType<T>` | Fonksiyon dönüş tipi | `ReturnType<typeof createSession>` |
| `Parameters<T>` | Fonksiyon parametre tipleri | `Parameters<typeof fn>[0]` |

**Hangi tip için hangi utility:**
```
Obje tipi  → Omit / Pick / Partial / Required / Readonly
Union tipi → Exclude / Extract / NonNullable
```
