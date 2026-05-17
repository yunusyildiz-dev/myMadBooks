# Constraints & Çoklu Generic

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
Generic constraint (`extends`): T'nin belirli özelliklere sahip olması. `keyof T`: objenin key'lerini dinamik tip olarak kullanma. Çoklu generic parametre ve generic default değer.

</div>

---

## 📖 Generic Constraint — extends

Bazen T'yi kullanmadan önce belirli bir özelliğe sahip olmasını garantilemek istersin:

```typescript
// ❌ Constraint yok — T'nin length'i olmayabilir
function getLength<T>(value: T): number {
    return value.length; // ❌ Hata: Property 'length' does not exist on type 'T'
}

// ✅ Constraint ile — length garantili
function getLength<T extends { length: number }>(value: T): number {
    return value.length;
}

console.log(getLength("Yunus"));          // → 5  (string.length)
console.log(getLength([1, 2, 3]));        // → 3  (array.length)
console.log(getLength({ length: 10 }));   // → 10 (obje, length var)
// getLength(42); // ❌ Hata — number'ın length'i yok
```

**`T extends X` nasıl okunur:**
> "T, en az X kadar olmalı. X'in tüm özelliklerine sahip olmalı, fazlası olabilir."

<hr class="section-divider">

## 📖 Interface Constraint — HasId Pattern

Repository'lerde her entity id'ye sahiptir:

```typescript
interface HasId {
    id: number;
}

// T'nin id alanı olması şart
function findById<T extends HasId>(items: T[], id: number): T | undefined {
    return items.find(item => item.id === id);
}

interface User    { id: number; name: string; email: string; }
interface Product { id: number; name: string; price: number; }

const users: User[] = [
    { id: 1, name: "Yunus", email: "y@mail.com" },
    { id: 2, name: "Ahmet", email: "a@mail.com" }
];

const products: Product[] = [
    { id: 1, name: "Laptop", price: 15999 },
    { id: 2, name: "Mouse",  price: 299 }
];

// Aynı fonksiyon — her iki tip için çalışır
const foundUser    = findById(users, 1);      // User | undefined
const foundProduct = findById(products, 2);   // Product | undefined
```

<hr class="section-divider">

## 📖 keyof Constraint — Dinamik Property Erişimi

`keyof T`, bir objenin key'lerinin union tipidir:

```typescript
interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

// keyof User = "id" | "name" | "email" | "role"

// Objenin herhangi bir alanını güvenli al
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}

const user: User = { id: 1, name: "Yunus", email: "y@mail.com", role: "admin" };

const name  = getProperty(user, "name");   // string
const id    = getProperty(user, "id");     // number
const email = getProperty(user, "email");  // string

// getProperty(user, "phone"); // ❌ Hata — "phone" User'da yok
// getProperty(user, "Nam");   // ❌ Hata — typo yakalandı!
```

### Dizi Sıralama

```typescript
function sortBy<T, K extends keyof T>(items: T[], key: K): T[] {
    return [...items].sort((a, b) => {
        if (a[key] < b[key]) return -1;
        if (a[key] > b[key]) return 1;
        return 0;
    });
}

// Kullanım — sadece var olan key'ler geçilebilir
const byName  = sortBy(users, "name");   // ✅
const byEmail = sortBy(users, "email");  // ✅
const byId    = sortBy(users, "id");     // ✅
// sortBy(users, "phone"); // ❌ Hata — "phone" User'da yok
```

<hr class="section-divider">

## 📖 Çoklu Generic Parametre

```typescript
// İki farklı tip arasında dönüşüm
function mapResponse<TRaw, TModel>(
    raw: TRaw,
    mapper: (data: TRaw) => TModel
): TModel {
    return mapper(raw);
}

// Örnek: ham API verisi → uygulama modeli
interface RawUser {
    user_id: number;
    full_name: string;
    email_address: string;
    created_timestamp: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    createdAt: Date;
}

const rawUser: RawUser = {
    user_id: 1,
    full_name: "Yunus Yıldız",
    email_address: "yunus@mail.com",
    created_timestamp: "2025-01-15T10:00:00Z"
};

const user = mapResponse<RawUser, User>(rawUser, raw => ({
    id: raw.user_id,
    name: raw.full_name,
    email: raw.email_address,
    createdAt: new Date(raw.created_timestamp)
}));

// Key-Value çifti
function pair<K extends string, V>(key: K, value: V): Record<K, V> {
    return { [key]: value } as Record<K, V>;
}

const p = pair("name", "Yunus"); // Record<"name", string>
```

<hr class="section-divider">

## 📖 Generic Default Değer

Generic'e default tip verilebilir:

```typescript
// T belirtilmezse string kullan
interface Container<T = string> {
    value: T;
    label: string;
}

const defaultContainer: Container = { value: "Merhaba", label: "Mesaj" }; // T = string
const numContainer: Container<number> = { value: 42, label: "Sayı" };

// Fonksiyonda default
function createState<T = null>(initial: T | null = null) {
    return {
        data: initial,
        loading: false,
        error: null as string | null
    };
}

const emptyState = createState();          // T = null
const userState  = createState<User>();    // T = User
const strState   = createState("hello");   // T = string (inference)
```

<hr class="section-divider">

## 🏭 Real-World: Gelişmiş Generic Kullanım

<div class="callout callout-real-world">

**🏭 Generic Validator**

```typescript
type ValidationRule<T> = {
    field: keyof T;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: T[keyof T]) => string | null;
};

type ValidationErrors<T> = Partial<Record<keyof T, string>>;

function validate<T extends object>(
    data: T,
    rules: ValidationRule<T>[]
): ValidationErrors<T> {
    const errors: ValidationErrors<T> = {};

    for (const rule of rules) {
        const value = data[rule.field];
        const fieldName = String(rule.field);

        if (rule.required && !value) {
            errors[rule.field] = `${fieldName} zorunludur`;
            continue;
        }

        if (rule.minLength && typeof value === "string" && value.length < rule.minLength) {
            errors[rule.field] = `${fieldName} en az ${rule.minLength} karakter olmalı`;
        }

        if (rule.pattern && typeof value === "string" && !rule.pattern.test(value)) {
            errors[rule.field] = `${fieldName} formatı geçersiz`;
        }

        if (rule.custom) {
            const customError = rule.custom(value);
            if (customError) errors[rule.field] = customError;
        }
    }

    return errors;
}

// Kullanım
interface LoginForm {
    email: string;
    password: string;
}

const loginErrors = validate<LoginForm>(
    { email: "yunus", password: "123" },
    [
        {
            field: "email",
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        },
        {
            field: "password",
            required: true,
            minLength: 8
        }
    ]
);
// { email: "email formatı geçersiz", password: "password en az 8 karakter olmalı" }
```

</div>

<hr class="section-divider">

## 📋 Özet

| Kavram | Syntax | Açıklama |
|--------|--------|----------|
| Constraint | `T extends X` | T, X'e uymalı |
| length constraint | `T extends { length: number }` | length garantisi |
| keyof | `K extends keyof T` | T'nin geçerli key'lerinden biri |
| Indexed access | `T[K]` | T'nin K key'indeki değerin tipi |
| Çoklu generic | `<T, U>` | İki bağımsız tip parametresi |
| Default generic | `<T = string>` | Belirtilmezse string kullan |
