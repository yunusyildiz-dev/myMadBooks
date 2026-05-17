# Optional, Default & Rest Parametreler

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
Opsiyonel parametreler (`?`), varsayılan değerli parametreler (`= değer`) ve sınırsız parametre alan rest (`...args`) syntax'ı. Çok sayıda parametre varsa options pattern nasıl uygulanır.

</div>

---

## 📖 Optional Parametreler

Fonksiyona her zaman geçilmeyecek parametreler `?` ile işaretlenir:

```typescript
// age opsiyonel — geçilmeyebilir
function createUser(name: string, age?: number): string {
    if (age !== undefined) {
        return `${name} (${age} yaşında)`;
    }
    return name;
}

console.log(createUser("Yunus", 25)); // → "Yunus (25 yaşında)"
console.log(createUser("Ahmet"));     // → "Ahmet" — age verilmedi

// age'in tipi: number | undefined
function showAge(age?: number): void {
    // age !== undefined kontrolü şart
    console.log(age?.toFixed(2) ?? "Bilinmiyor");
}
```

<div class="callout callout-warning">

**⚠️ Önemli Kural: Opsiyonel Parametreler Sonda Olmalı**

```typescript
// ❌ Hata — opsiyonel parametre ortada olamaz
function wrong(age?: number, name: string): void { }

// ✅ Opsiyonel parametreler her zaman sonda
function right(name: string, age?: number): void { }
function right2(a: string, b?: number, c?: boolean): void { }
```

</div>

### API İsteği — Opsiyonel Filtreler

```typescript
async function getUsers(page?: number, limit?: number): Promise<User[]> {
    const p = page ?? 1;       // default 1
    const l = limit ?? 10;     // default 10
    const url = `/api/users?page=${p}&limit=${l}`;
    const res = await fetch(url);
    return res.json();
}

await getUsers();          // page=1, limit=10
await getUsers(2);         // page=2, limit=10
await getUsers(3, 25);     // page=3, limit=25
```

<hr class="section-divider">

## 📖 Default Parametreler

Parametre verilmezse belirtilen varsayılan değer kullanılır:

```typescript
// = ile default değer
function setVolume(level: number = 50): void {
    console.log(`Ses seviyesi: ${level}`);
}

setVolume(80); // → "Ses seviyesi: 80"
setVolume();   // → "Ses seviyesi: 50" — default devreye girdi
// setVolume(undefined); // → 50 — undefined geçince de default çalışır

// Default + tip inference — tipi yazmak zorunda değilsin
function repeat(text: string, times = 3): string {
    // times: number — TypeScript "3"ten anladı
    return text.repeat(times);
}

console.log(repeat("ha"));    // → "hahaha"
console.log(repeat("ha", 2)); // → "haha"
```

<div class="callout callout-tip">

**✅ Default Parametre vs Optional Parametre Farkı**

```typescript
// Optional: undefined olabilir, kontrol şart
function fn1(x?: number): void {
    console.log(x); // undefined veya number
}

// Default: asla undefined olmaz, default devreye girer
function fn2(x: number = 10): void {
    console.log(x); // her zaman number
}

fn1();           // undefined
fn2();           // 10
fn1(undefined);  // undefined
fn2(undefined);  // 10 — default devreye girer
```

</div>

### HTTP Fetch Wrapper — Default Parametreler

```typescript
async function fetchData(
    url: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    timeout: number = 5000,
    retries: number = 3
): Promise<unknown> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
        const res = await fetch(url, {
            method,
            signal: controller.signal
        });
        clearTimeout(timer);
        return res.json();
    } catch (error) {
        if (retries > 0) {
            return fetchData(url, method, timeout, retries - 1);
        }
        throw error;
    }
}

// Kullanım
await fetchData("/api/users");                           // GET, 5000ms, 3 deneme
await fetchData("/api/users", "POST");                   // POST, 5000ms, 3 deneme
await fetchData("/api/users", "GET", 10000);             // GET, 10000ms, 3 deneme
await fetchData("/api/users", "GET", 5000, 1);           // GET, 5000ms, 1 deneme
```

<hr class="section-divider">

## 📖 Rest Parametreler — Sınırsız Argüman

`...args` ile sınırsız sayıda parametre alınır. Array olarak gelir:

```typescript
// Sayıları topla — kaç tane olursa olsun
function sum(...numbers: number[]): number {
    return numbers.reduce((total, n) => total + n, 0);
}

console.log(sum(1, 2, 3));          // → 6
console.log(sum(10, 20, 30, 40));   // → 100
console.log(sum());                  // → 0

// Prefix + rest parametreler
function logWithTag(tag: string, ...messages: string[]): void {
    messages.forEach(msg => console.log(`[${tag}] ${msg}`));
}

logWithTag("ERROR", "Bağlantı kesildi", "Retry: 3", "Timeout: 5000ms");
// [ERROR] Bağlantı kesildi
// [ERROR] Retry: 3
// [ERROR] Timeout: 5000ms
```

<div class="callout callout-warning">

**⚠️ Rest Parametre Kuralları:**
- Her zaman **son parametre** olmalı
- Sadece **bir tane** rest parametre olabilir

```typescript
// ❌ Rest ortada olamaz
function wrong(...items: string[], separator: string): void { }

// ✅ Rest sonda
function right(separator: string, ...items: string[]): void { }
```

</div>

### Rest Parametre — Gerçekçi Örnekler

```typescript
// CSS class birleştirici — Tailwind projelerde çok kullanılır
function classNames(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(" ");
}

const isActive = true;
const isDisabled = false;
const btn = classNames(
    "btn",
    "btn-primary",
    isActive && "btn-active",
    isDisabled && "btn-disabled", // false — filtrelenir
    undefined                      // undefined — filtrelenir
);
console.log(btn); // → "btn btn-primary btn-active"

// Pipeline — fonksiyonları sırayla uygula
function pipeline<T>(...fns: Array<(val: T) => T>): (input: T) => T {
    return (input: T) => fns.reduce((acc, fn) => fn(acc), input);
}

const processString = pipeline<string>(
    s => s.trim(),
    s => s.toLowerCase(),
    s => s.replace(/\s+/g, "-")
);

console.log(processString("  Hello World  ")); // → "hello-world"
```

<hr class="section-divider">

## 📖 Options Object Pattern — Çok Parametre Varsa

Birden fazla opsiyonel parametre varsa, hepsini tek bir objeye topla:

```typescript
// ❌ Kötü — kaç parametre var, hangisi hangisi?
function getUsers(page?: number, limit?: number, search?: string, sortBy?: string, order?: string): Promise<User[]> { ... }

// Bu fonksiyonu çağırmak bile zorlaşır:
getUsers(undefined, undefined, "yunus", undefined, "asc");

// ✅ Options pattern — okunabilir, genişletilebilir
interface GetUsersOptions {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: "name" | "email" | "createdAt";
    order?: "asc" | "desc";
    role?: "admin" | "editor" | "viewer";
}

async function getUsers(options: GetUsersOptions = {}): Promise<User[]> {
    const {
        page = 1,
        limit = 10,
        search = "",
        sortBy = "createdAt",
        order = "desc"
    } = options;

    const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search,
        sortBy,
        order
    });

    const res = await fetch(`/api/users?${params}`);
    return res.json();
}

// Çağırma — çok daha okunabilir
await getUsers({ page: 2, search: "yunus" });
await getUsers({ sortBy: "name", order: "asc" });
await getUsers({ role: "admin", limit: 50 });
```

<hr class="section-divider">

## 🏭 Real-World Kullanım

<div class="callout callout-real-world">

**🏭 Logger Sistemi — Default + Rest**

```typescript
type LogLevel = "debug" | "info" | "warn" | "error";

interface LogOptions {
    timestamp?: boolean;
    prefix?: string;
    level?: LogLevel;
}

function log(
    level: LogLevel = "info",
    options: LogOptions = {},
    ...messages: string[]
): void {
    const { timestamp = true, prefix = "" } = options;
    const time = timestamp ? `[${new Date().toISOString()}] ` : "";
    const pfx = prefix ? `[${prefix}] ` : "";
    const tag = `[${level.toUpperCase()}]`;

    messages.forEach(msg => {
        console.log(`${time}${tag}${pfx} ${msg}`);
    });
}

log("error", { prefix: "UserService" }, "Login failed", "Attempt: 3");
log("info", {}, "Server started on port 3000");
log("warn", { timestamp: false }, "Deprecated API used");
```

</div>

<hr class="section-divider">

## ✅ Best Practices

<div class="callout callout-tip">

**✅ Optional/Default/Rest Best Practices:**
- 3'ten fazla opsiyonel parametre → options objesine geç
- Default parametre, `undefined` kontrolünü ortadan kaldırır — tercih et
- Rest parametre: kaç argüman geleceği bilinmiyorsa kullan
- `undefined` vs `null`: default parametre sadece `undefined`'ı karşılar, `null`'u değil
- Options objesinde destructuring ile default değer ver

</div>

## ❌ Avoid

<div class="callout callout-danger">

**❌ Kaçınılması Gerekenler:**
```typescript
// ❌ Çok parametre — kafayı karıştırır
function create(a: string, b?: number, c?: boolean, d?: string, e?: number): void { }

// ❌ null geçince default çalışmaz
function fn(x: number = 10): void { console.log(x); }
fn(null as any); // null — 10 değil! null ≠ undefined

// ❌ any[] rest parametresi — tip güvencesi yok
function process(...args: any[]): void { }

// ✅ Tipi belirt:
function process(...args: string[]): void { }
```

</div>

<hr class="section-divider">

## 📋 Özet

| Özellik | Syntax | Açıklama |
|---------|--------|----------|
| Optional | `param?: T` | Verilmeyebilir → `T \| undefined` |
| Default | `param: T = value` | Verilmezse varsayılan |
| Rest | `...params: T[]` | Sınırsız, array olarak gelir |
| Options pattern | `options: Options = {}` | Çok opsiyonel param varsa |
