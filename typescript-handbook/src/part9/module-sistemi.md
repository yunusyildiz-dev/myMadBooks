# Module Sistemi

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
TypeScript'te module sistemi nedir, neden önemlidir. Named export vs default export farkı. `export type` ile tip-only export. Re-export ve barrel export (index.ts) pattern.

</div>

---

## 📖 Module Nedir?

Her TypeScript dosyası potansiyel olarak bir modüldür. Bir dosyada en az bir `export` varsa modül sayılır. Export yoksa **script** sayılır ve tüm değişkenleri global scope'u kirletir:

```typescript
// ❌ Script dosyası — global scope kirleniyor
var apiKey = "sk-secret"; // her yerden erişilebilir — tehlikeli

// ✅ Modül dosyası — sadece export edilenler dışarıya açık
export const apiKey = "sk-secret"; // sadece import edenler erişir

// Boş export bile dosyayı modül yapar
export {}; // bu yeter
```

**Kural:** Her dosya en az bir şey export etmeli. İç yardımcı fonksiyonlar export edilmez — bu encapsulation'dır.

<hr class="section-divider">

## 📖 Named Export — Birden Fazla Şey Export Et

Named export, dosyadan birden fazla şeyi isimli olarak dışarı açar. Import ederken aynı isim kullanılır:

```typescript
// math.ts
export const PI = 3.14159;

export function add(a: number, b: number): number {
    return a + b;
}

export function subtract(a: number, b: number): number {
    return a - b;
}

// İç yardımcı — dışarıya kapalı
function validateNumbers(a: number, b: number): boolean {
    return !isNaN(a) && !isNaN(b);
}

// Sonradan export et
function divide(a: number, b: number): number {
    if (b === 0) throw new Error("Sıfıra bölme");
    return a / b;
}
export { divide }; // validateNumbers gizli, divide açık
```

```typescript
// main.ts — import tarafı
import { add, subtract, PI } from "./math";
import { add as addNumbers, subtract as sub } from "./math"; // alias
import * as MathUtils from "./math"; // tümünü namespace olarak al

console.log(add(5, 3));              // → 8
console.log(MathUtils.multiply(4, 5)); // → 20
console.log(PI);                     // → 3.14159
```

**Named export tercih et** — IDE autocomplete daha iyi çalışır, tree-shaking (kullanılmayan kod eleme) daha etkili olur.

<hr class="section-divider">

## 📖 Default Export — Tek Ana Şey

Default export, dosya başına bir tane olabilir. Import ederken istediğin ismi verirsin:

```typescript
// UserService.ts
class UserService {
    private users: Array<{ id: number; name: string }> = [];

    getAll() { return this.users; }
    create(name: string) {
        const user = { id: Date.now(), name };
        this.users.push(user);
        return user;
    }
}

export default UserService; // default export
```

```typescript
// main.ts
import UserService from "./UserService";      // ✅ convention — dosya adıyla aynı
import MyUserService from "./UserService";    // ⚠️ geçerli ama belirsiz
import UserSrv from "./UserService";          // ⚠️ geçerli ama kötü pratik
```

<div class="callout callout-warning">

**⚠️ Default Export Dikkat**

Default export'ta import ismi serbest olduğu için farklı dosyalarda farklı isim kullanılabilir — karışıklık çıkar. React component'leri dışında **named export tercih et**.

React'ta convention: dosya adıyla aynı isim ver.
```typescript
// Button.tsx
export default function Button() { /* ... */ }

// import
import Button from "./Button"; // ✅ dosya adıyla aynı
```

</div>

<hr class="section-divider">

## 📖 export type — Tip-Only Export

`export type` ve `import type`, sadece TypeScript tipi olan şeyleri derleme zamanında export/import eder. Runtime'da bu satırlar tamamen silinir — bundle'a girmez:

```typescript
// types.ts
export type UserId = string | number;
export type UserRole = "admin" | "editor" | "viewer";

export interface UserProfile {
    id: UserId;
    name: string;
    email: string;
    role: UserRole;
}

export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message: string;
}

// Hem tip hem değer — ayrı satırlar netleştirir
export const DEFAULT_ROLE: UserRole = "viewer"; // runtime'da var
```

```typescript
// Kullanım tarafı
import type { UserProfile, ApiResponse } from "./types"; // sadece tip — runtime'a girmez
import { DEFAULT_ROLE } from "./types";                  // değer — runtime'da var
import { DEFAULT_ROLE, type UserRole } from "./types";   // tek satırda ikisi
```

<hr class="section-divider">

## 📖 Re-export ve Barrel Exports

**Barrel export**: Bir klasördeki tüm public export'ları tek bir `index.ts` dosyasında toplamak. Dışarıdan import edenler tek bir yere bakar:

```typescript
// users/index.ts — barrel export
export { UserService } from "./user.service";
export { UserRepository } from "./user.repository";
export type { User, CreateUserDto, UpdateUserDto } from "./user.types";
export { default as UserService } from "./UserService"; // default'u named'a çevir
export * from "./math"; // tümünü re-export et
export * as MathUtils from "./math"; // namespace ile re-export
```

```typescript
// ❌ Kötü — iç dosyaya doğrudan bağımlılık
import { UserService } from "../users/user.service";

// ✅ İyi — barrel üzerinden
import { UserService, type User } from "../users";
```

**Klasör yapısı:**
```
src/features/
├── users/
│   ├── user.entity.ts
│   ├── user.service.ts
│   ├── user.types.ts
│   └── index.ts          ← barrel export
├── products/
│   ├── product.service.ts
│   └── index.ts          ← barrel export
└── auth/
    ├── auth.service.ts
    └── index.ts          ← barrel export
```

<hr class="section-divider">

## 📖 Dynamic Import — Lazy Loading

Normal import static'tir — dosya yüklenince çalışır. Dynamic import async'tir — ihtiyaç anında yükler. Büyük kütüphaneler için idealdir:

```typescript
// PDF kütüphanesi büyük — sadece kullanıldığında yükle
async function generatePDF(data: unknown): Promise<void> {
    const { jsPDF } = await import("jspdf"); // runtime'da yüklenir
    console.log("PDF oluşturuluyor...", data);
}

// Koşullu import — ortama göre farklı modül
async function loadConfig(): Promise<void> {
    if (process.env.NODE_ENV === "development") {
        const { devConfig } = await import("./config.dev");
        console.log(devConfig);
    } else {
        const { prodConfig } = await import("./config.prod");
        console.log(prodConfig);
    }
}
```

<hr class="section-divider">

## ✅ Best Practices

<div class="callout callout-tip">

**✅ Module Sistemi Best Practices:**
- Bir dosyada tek sorumluluk — User ile ilgili şeyler `users.ts`'de
- Named export tercih et — IDE autocomplete ve tree-shaking daha iyi
- React component dışında default export kullanma
- `import type` ile tip-only import yap — bundle boyutu azalır
- Her feature klasörüne `index.ts` (barrel export) koy
- Circular import'tan kaçın — A, B'yi; B, A'yı import etmesin

</div>

## ❌ Avoid

<div class="callout callout-danger">

**❌ Kaçınılması Gerekenler:**
```typescript
// ❌ Export olmayan dosya — global scope kirleniyor
var helper = () => {}; // her yerden erişilebilir — tehlikeli

// ❌ Default export'a belirsiz isim vermek
import Svc from "./UserService"; // ❌ Svc — ne olduğu belirsiz
import UserService from "./UserService"; // ✅ açık isim

// ❌ İç dosyaya doğrudan bağımlılık
import { UserService } from "../features/users/user.service"; // ❌
import { UserService } from "../features/users"; // ✅ barrel export

// ❌ Büyük barrel export — her şeyi tek index.ts'de toplamak
// Tüm app'i tek index.ts'den export etmek tree-shaking'i bozar
```

</div>

<hr class="section-divider">

## 📋 Özet

| Kavram | Syntax | Kullanım |
|--------|--------|----------|
| Named export | `export { name }` | Utility, tip, sabit — çoğunluk |
| Default export | `export default X` | React component, tek ana class |
| Type export | `export type { T }` | Interface, type alias — runtime'a girme |
| Re-export | `export { x } from "..."` | Barrel export'ta |
| Namespace import | `import * as NS from "..."` | Tüm export'ları grupla |
| Dynamic import | `await import("...")` | Code splitting, lazy load |
| Barrel (index.ts) | Her feature klasörünün index.ts'i | Tek giriş noktası |
