# Partial, Required & Readonly

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
Utility type'ların temeli: `Partial<T>` tüm alanları opsiyonel yapar, `Required<T>` hepsini zorunlu kılar, `Readonly<T>` değiştirilemez yapar. Bu üçü gerçek projelerde her gün kullanılır.

</div>

---

## 📖 Utility Type Neden Var?

Bir interface yazıyorsun, ama farklı senaryolarda bu interface'in biraz farklı bir versiyonuna ihtiyaç duyuyorsun:

```typescript
interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    role: "admin" | "editor" | "viewer";
    createdAt: string;
}

// PATCH isteği için tüm alanlar opsiyonel olmalı
// Create isteği için id ve createdAt olmayacak
// API response'ta password dönmemeli
// State'teki user değiştirilemez olmalı
```

Her senaryo için ayrı interface yazmak DRY (Don't Repeat Yourself) ilkesini ihlal eder. Utility type'lar bu sorunu çözer: **bir kez tanımla, farklı ihtiyaçlar için türet.**

<hr class="section-divider">

## 📖 Partial\<T\> — Tüm Alanlar Opsiyonel

`Partial<T>`, T'nin tüm alanlarını `?` ile opsiyonel yapar. PATCH request body'si için biçilmiş kaftan:

```typescript
// Partial<User> açılımı — TypeScript böyle görür:
// {
//   id?: number;
//   name?: string;
//   email?: string;
//   password?: string;
//   role?: "admin" | "editor" | "viewer";
//   createdAt?: string;
// }

type UpdateUserDto = Partial<User>;

function updateUser(id: number, data: UpdateUserDto): void {
    console.log(`PATCH /users/${id}`, data);
}

// Sadece değişen alanları gönder
updateUser(1, { name: "Yunus YILDIZ" });               // ✅ sadece isim
updateUser(2, { email: "yeni@mail.com", role: "admin" }); // ✅ email + rol
updateUser(3, {});                                      // ✅ hiçbir şey — geçerli
```

<div class="callout callout-warning">

**⚠️ PUT vs PATCH Farkı**
- `PUT` = tüm objeyi gönder — tüm alanlar zorunlu
- `PATCH` = sadece değişenleri gönder — `Partial<T>` kullan

Bu farkı karıştırmak üretimde veri kaybına yol açar.

</div>

### Form Draft Pattern

```typescript
// Kullanıcı formu adım adım dolduruyor — henüz submit etmedi
type UserFormDraft = Partial<User>;

let draft: UserFormDraft = {};
draft.name = "Yunus";          // adım adım doldur
draft.email = "yunus@mail.com";
// id ve createdAt yok — backend dolduracak, form'da yok
```

### Config Merge Pattern

```typescript
interface AppConfig {
    theme: "light" | "dark";
    language: string;
    timeout: number;
    debug: boolean;
}

// Sadece override etmek istediklerini geç, gerisi default kalır
function createConfig(overrides: Partial<AppConfig> = {}): AppConfig {
    const defaults: AppConfig = {
        theme: "light",
        language: "tr",
        timeout: 5000,
        debug: false
    };
    return { ...defaults, ...overrides };
}

const config = createConfig({ theme: "dark", debug: true });
// → { theme: "dark", language: "tr", timeout: 5000, debug: true }
```

<hr class="section-divider">

## 📖 Required\<T\> — Tüm Alanlar Zorunlu

`Required<T>`, Partial'ın tam tersidir. Tüm opsiyonel `?` alanları zorunlu hale getirir. "Validasyon geçildi, artık tüm alanlar dolu" garantisi için kullanılır:

```typescript
interface DraftPost {
    title?: string;
    content?: string;
    authorId?: number;
    tags?: string[];
}

// Validation sonrası — artık hepsi dolu, tip sistemi biliyor
type ValidatedPost = Required<DraftPost>;
// { title: string, content: string, authorId: number, tags: string[] }

function publishPost(post: ValidatedPost): void {
    // burada undefined kontrolü gerekmez — tip güvencesi var
    console.log(`Yayınlanıyor: ${post.title} by user ${post.authorId}`);
}

function validatePost(draft: DraftPost): ValidatedPost {
    if (!draft.title || !draft.content || !draft.authorId) {
        throw new Error("Eksik alanlar var");
    }
    return {
        title: draft.title,
        content: draft.content,
        authorId: draft.authorId,
        tags: draft.tags ?? []
    };
}

const draft: DraftPost = { title: "TS Generics", content: "...", authorId: 1 };
const validPost = validatePost(draft); // ValidatedPost
publishPost(validPost); // ✅ tip güvenli, undefined kontrolü yok
```

**Ne zaman kullanılır:**
- Validation aşamasından geçmiş veriyi temsil etmek için
- Test fixture'larında — mock data'nın tüm alanlarını doldurmak zorunda
- Form submit anı — draft tamamlandı, artık zorunlu

<hr class="section-divider">

## 📖 Readonly\<T\> — Değiştirilemez

`Readonly<T>`, T'nin tüm alanlarını `readonly` yapar. Atama sonrası değiştirme girişimi derleme hatası verir:

```typescript
type ImmutableUser = Readonly<User>;
// { readonly id: number, readonly name: string, ... }

const frozenUser: ImmutableUser = {
    id: 1,
    name: "Yunus",
    email: "yunus@mail.com",
    password: "hash",
    role: "admin",
    createdAt: "2024-01-01"
};

// frozenUser.name = "Ahmet"; // ❌ hata — Cannot assign to 'name' (readonly)
```

### Fonksiyon Parametresi Garantisi

```typescript
// "Bu fonksiyon user'ı değiştirmiyor" garantisi
function displayUser(user: Readonly<User>): void {
    // user.name = "..."; // ❌ hata — içeride değiştiremezsin
    console.log(`${user.name} <${user.email}>`);
}
```

### State Management Pattern

```typescript
// Redux / Zustand state — immutable olmalı
type AppState = Readonly<{
    users: readonly User[];  // dizi de readonly — push/pop yasak
    loading: boolean;
    error: string | null;
}>;
```

<div class="callout callout-warning">

**⚠️ Readonly Sadece Bir Seviye Derindir**

```typescript
const state: Readonly<{ user: User }> = { user: { id: 1, name: "Yunus", ... } };

// state.user = {...}  // ❌ hata — readonly
// state.user.name = "Ahmet"; // ⚠️ TypeScript izin verir — sadece 1 seviye
```

Deep (derin) readonly için `ReadonlyArray<Readonly<T>>` gibi zincirlemek veya `type-fest` kütüphanesi kullanmak gerekir.

</div>

<hr class="section-divider">

## 🏭 Real-World: API Service Katmanı

<div class="callout callout-real-world">

**🏭 Tip Güvenli CRUD Service**

```typescript
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

// Create — backend üretecekleri yok
type CreateUserRequest = Omit<UserEntity, "id" | "createdAt" | "updatedAt">;

// PATCH — her şey opsiyonel
type UpdateUserRequest = Partial<Omit<UserEntity, "id" | "createdAt" | "updatedAt">>;

// API response — password asla dönmemeli
type UserResponse = Readonly<Omit<UserEntity, "password">>;

class UserService {
    // POST /users — tüm alanlar zorunlu (password dahil)
    async create(data: CreateUserRequest): Promise<UserResponse> {
        const res = await fetch("/api/users", {
            method: "POST",
            body: JSON.stringify(data)
        });
        return res.json();
    }

    // PATCH /users/:id — sadece değişenler
    async update(id: number, data: UpdateUserRequest): Promise<UserResponse> {
        const res = await fetch(`/api/users/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data)
        });
        return res.json();
    }
}

// Kullanım — tip hataları derleme anında yakalanır
const service = new UserService();

await service.create({
    name: "Yunus",
    email: "y@mail.com",
    password: "secret",
    role: "editor",
    isActive: true
});

await service.update(1, { name: "Yunus Yıldız" }); // ✅ sadece isim güncelle
```

</div>

<hr class="section-divider">

## ✅ Best Practices

<div class="callout callout-tip">

**✅ Partial / Required / Readonly Best Practices:**
- PATCH endpoint'lerinde her zaman `Partial<T>` kullan — PUT ile karıştırma
- Validation geçince `Required<T>` ile tipi daralt — undefined kontrollerini azalt
- Fonksiyon parametrelerini `Readonly<T>` yap — yan etki olmadığını garanti et
- State yönetiminde `Readonly<T>` kullan — yanlışlıkla mutasyonu engelle
- Config objelerini `Readonly<T>` yap — runtime'da değişmemeli

</div>

## ❌ Avoid

<div class="callout callout-danger">

**❌ Kaçınılması Gerekenler:**
```typescript
// ❌ PATCH endpoint'inde PUT gibi davranmak
interface UpdateUserDto {
    name: string;   // zorunlu — ama PATCH için yanlış
    email: string;
    role: string;
}
// ✅ Doğru:
type UpdateUserDto = Partial<User>;

// ❌ Validation sonrası undefined kontrolü yapmaya devam etmek
function publish(post: DraftPost) {
    if (!post.title) throw new Error("..."); // validation burada değil
    post.title.toUpperCase(); // TS hâlâ string | undefined görür
}
// ✅ Doğru: validate edip Required<DraftPost> döndür

// ❌ Readonly'i deep sanmak — iç objeleri mutate edebilirsin
const state: Readonly<{ user: User }> = { user: { id: 1, name: "A", ... } };
state.user.name = "B"; // ⚠️ TypeScript izin verir — beklenmedik mutasyon
```

</div>

<hr class="section-divider">

## 📋 Özet

| Utility Type | Ne Yapar | Ne Zaman Kullanılır |
|--------------|----------|---------------------|
| `Partial<T>` | Tüm alanlar `?` — opsiyonel | PATCH DTO, form draft, config merge |
| `Required<T>` | Tüm `?` kaldır — zorunlu | Validation sonrası, submit anı |
| `Readonly<T>` | Tüm alanlar `readonly` | Config, state, fonksiyon parametresi |
