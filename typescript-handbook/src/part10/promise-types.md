# Promise Tipleri

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
`Promise<T>` nedir, nasıl tiplendirilir. `Promise<void>`, `Promise<T | null>` farkları. `Promise.all`, `Promise.allSettled`, `Promise.race` kombinasyonları ve paralel çalıştırma.

</div>

---

## 📖 Promise\<T\> Nedir?

`Promise<T>`, gelecekte tamamlanacak bir işlemin sonucunu temsil eder. `T`, başarıyla tamamlanınca dönen değerin tipidir. TypeScript bu tipi bildiğinde `await` sonrası değere güvenle erişebilirsin:

```typescript
// Promise<void>  → değer döndürmeyen async işlem
// Promise<T>     → T dönen async işlem
// Promise<T | null> → bulunamayabilir (findById)

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function delayedValue<T>(value: T, ms: number): Promise<T> {
    return new Promise((resolve) => {
        setTimeout(() => resolve(value), ms);
    });
}

// Kullanım
delay(1000).then(() => console.log("1 saniye geçti"));

const user: User = await delayedValue(
    { id: 1, name: "Yunus", email: "yunus@mail.com", role: "admin" },
    500
);
console.log(user.name); // TypeScript biliyor: string
```

**Promise durumları:**
- `pending` → henüz tamamlanmadı
- `fulfilled` → başarıyla tamamlandı → `resolve(value)` çağrıldı
- `rejected` → hata ile sonlandı → `reject(error)` çağrıldı

<hr class="section-divider">

## 📖 Dönüş Tipi Seçimi

```typescript
// Promise<T> — değer dönen async işlem
async function getUser(id: number): Promise<User> {
    await delay(100);
    return { id, name: "Yunus", email: "yunus@mail.com", role: "editor" };
}

// Promise<T | null> — bulunamayabilir
async function findUser(id: number): Promise<User | null> {
    await delay(100);
    if (id <= 0) return null;
    return { id, name: "Yunus", email: "yunus@mail.com", role: "viewer" };
}

// Promise<void> — değer döndürmeyen işlem (kaydet, sil, gönder)
async function deleteUser(id: number): Promise<void> {
    await delay(100);
    console.log(`User ${id} silindi`);
    // return yok
}

// Kullanım
const user = await getUser(1);        // User
const maybeUser = await findUser(0);  // User | null
await deleteUser(1);                  // void
```

<hr class="section-divider">

## 📖 Promise Kombinasyonları

### Promise.all — Paralel, Hepsi Başarılı

```typescript
// ❌ Yavaş — sırayla bekle (toplam 2 saniye)
async function slowSequential() {
    const user = await getUser(1);        // 1 sn bekle
    const product = await getProduct(2); // 1 sn daha bekle
    return [user, product];
}

// ✅ Hızlı — paralel çalıştır (toplam 1 saniye)
async function fastParallel(): Promise<[User, Product]> {
    const [user, product] = await Promise.all([
        getUser(1),
        getProduct(2)
    ]);
    // TypeScript tuple tipini çıkarır: [User, Product]
    return [user, product];
}
```

**Kural:** Birbirinden bağımsız async işlemleri sırayla await etme — `Promise.all` ile paralel çalıştır.

**Uyarı:** `Promise.all` içindeki herhangi biri hata alırsa tümü başarısız olur.

### Promise.allSettled — Hata Toleranslı Paralel

```typescript
// Bazıları hata verse de devam et
async function fetchMultipleUsers(ids: number[]): Promise<(User | null)[]> {
    const results = await Promise.allSettled(
        ids.map(id => getUser(id))
    );

    return results.map(result => {
        if (result.status === "fulfilled") {
            return result.value; // User
        } else {
            console.error(`Hata: ${result.reason}`);
            return null; // hata alan → null döndür, diğerleri devam eder
        }
    });
}

const users = await fetchMultipleUsers([1, 2, -1, 4]);
// [-1 hata versile] → [User, User, null, User]
```

### Promise.race — Timeout Pattern

```typescript
// AI API çağrıları uzun sürebilir — timeout şart
async function withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
): Promise<T> {
    const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout: ${timeoutMs}ms`)), timeoutMs)
    );

    return Promise.race([promise, timeout]); // hangisi önce biterse o
}

// Kullanım
const user = await withTimeout(getUser(1), 5000); // 5 saniyede bitmezse hata
```

<hr class="section-divider">

## 🏭 Real-World: Dashboard Paralel Yükleme

<div class="callout callout-real-world">

**🏭 Admin Dashboard — Tüm Verileri Paralel Yükle**

```typescript
interface DashboardData {
    users: User[];
    products: Product[];
    recentOrders: Order[];
    stats: DashboardStats;
}

interface DashboardStats {
    totalUsers: number;
    totalRevenue: number;
    activeOrders: number;
}

async function loadDashboard(): Promise<DashboardData> {
    // 4 API çağrısı — hepsi bağımsız, paralel çalıştır
    const [users, products, recentOrders, stats] = await Promise.all([
        apiGet<User[]>("/api/users"),
        apiGet<Product[]>("/api/products"),
        apiGet<Order[]>("/api/orders?recent=10"),
        apiGet<DashboardStats>("/api/stats")
    ]);

    return { users, products, recentOrders, stats };
}

// Kısmi başarı tolere et — bazı widget'lar yüklenmezse dashboard çalışmaya devam eder
async function loadDashboardSafe(): Promise<Partial<DashboardData>> {
    const [usersResult, productsResult, ordersResult, statsResult] =
        await Promise.allSettled([
            apiGet<User[]>("/api/users"),
            apiGet<Product[]>("/api/products"),
            apiGet<Order[]>("/api/orders?recent=10"),
            apiGet<DashboardStats>("/api/stats")
        ]);

    return {
        users: usersResult.status === "fulfilled" ? usersResult.value : undefined,
        products: productsResult.status === "fulfilled" ? productsResult.value : undefined,
        recentOrders: ordersResult.status === "fulfilled" ? ordersResult.value : undefined,
        stats: statsResult.status === "fulfilled" ? statsResult.value : undefined,
    };
}
```

</div>

<hr class="section-divider">

## ✅ Best Practices

<div class="callout callout-tip">

**✅ Promise Best Practices:**
- `async` fonksiyonun dönüş tipini her zaman `Promise<T>` olarak yaz — explicit
- Bağımsız async işlemleri `Promise.all` ile paralel çalıştır — sırayla bekleme
- Hata toleransı gerekiyorsa `Promise.allSettled` kullan
- AI API ve uzun işlemler için `withTimeout` wrapper kullan
- `Promise<void>` kaydet/sil/gönder için, `Promise<T | null>` bulunamayabilir için

</div>

## ❌ Avoid

<div class="callout callout-danger">

**❌ Kaçınılması Gerekenler:**
```typescript
// ❌ Bağımsız işlemleri sırayla await etmek
const user = await getUser(1);       // bekle
const product = await getProduct(2); // sonra bekle — 2x yavaş
// ✅ Doğru:
const [user, product] = await Promise.all([getUser(1), getProduct(2)]);

// ❌ Promise hatalarını yakalamamak
const user = await getUser(1); // hata alırsa üst katmana fırlatılır — beklenmedik crash
// ✅ Doğru: try/catch veya .catch() kullan

// ❌ Promis içinde Promis — callback hell benzeri
getUser(1).then(user => {
    getOrders(user.id).then(orders => {
        // iç içe geçmiş — okunaksız
    });
});
// ✅ async/await kullan
```

</div>

<hr class="section-divider">

## 📋 Özet

| Tip | Kullanım |
|-----|----------|
| `Promise<T>` | T dönen async işlem |
| `Promise<void>` | Değer döndürmeyen (kaydet, sil) |
| `Promise<T \| null>` | Bulunamayabilir (findById) |
| `Promise.all([...])` | Paralel, hepsi başarılı olmalı |
| `Promise.allSettled([...])` | Paralel, hata toleranslı |
| `Promise.race([p, timeout])` | İlk biten — timeout pattern |
