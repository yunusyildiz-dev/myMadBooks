# Type Alias

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
`type` keyword'ü ile tip alias oluşturma. Union, intersection, tuple ve primitive tipler için `type`'ın `interface`'den neden daha güçlü olduğu. Gerçek projelerde `type` nerede kullanılır.

</div>

---

## 📖 Type Alias Nedir?

`type`, bir tip tanımına **isim verme** işlemidir. Hem objeleri hem de union, tuple, primitive alias gibi karmaşık tipleri adlandırabilirsin:

```typescript
// Obje tipi — interface gibi
type User = {
    id: number;
    name: string;
    email: string;
};

// Union tip — interface yapamaz bunu
type Status = "active" | "inactive" | "pending";

// Primitive alias
type ID = string | number;
type Timestamp = string;

// Tuple
type Point = [x: number, y: number];
type RGB   = [red: number, green: number, blue: number];
```

<hr class="section-divider">

## 📖 Type ile Obje Tanımı

Interface ile neredeyse aynı şekilde çalışır:

```typescript
type Product = {
    id: number;
    name: string;
    price: number;
    inStock: boolean;
    category?: string; // opsiyonel
};

const laptop: Product = {
    id: 1,
    name: "MacBook Pro",
    price: 35000,
    inStock: true
};

function getPrice(product: Product): string {
    return `${product.name}: ${product.price.toLocaleString("tr-TR")}₺`;
}
```

<hr class="section-divider">

## 📖 Intersection Type — Tipleri Birleştir

`&` operatörü ile birden fazla tipi birleştirirsin:

```typescript
type Animal = {
    name: string;
    age: number;
};

type Pet = Animal & {
    owner: string;
    vaccinated: boolean;
};

// Pet = { name, age, owner, vaccinated }
const myDog: Pet = {
    name: "Karabaş",
    age: 3,
    owner: "Yunus",
    vaccinated: true
};

// Interface extends'in type karşılığı
type BaseEntity = {
    id: number;
    createdAt: string;
};

type UserEntity = BaseEntity & {
    name: string;
    email: string;
};
// UserEntity = { id, createdAt, name, email }
```

<hr class="section-divider">

## 📖 Union Type ile type Alias

`type`'ın en güçlü yönü union tiplerdir — `interface` bunu yapamaz:

```typescript
// String literal union
type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
type UserRole    = "admin" | "editor" | "viewer";
type Language    = "tr" | "en" | "de" | "fr";
type HttpMethod  = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// Farklı tip union
type ID = string | number;
type Nullable<T> = T | null;
type MaybeUser = User | null | undefined;

// Obje union — discriminated union (ayrı bölümde detaylı)
type Shape =
    | { kind: "circle";    radius: number }
    | { kind: "rectangle"; width: number; height: number }
    | { kind: "triangle";  base: number; height: number };

// Kullanım
function getArea(shape: Shape): number {
    switch (shape.kind) {
        case "circle":    return Math.PI * shape.radius ** 2;
        case "rectangle": return shape.width * shape.height;
        case "triangle":  return 0.5 * shape.base * shape.height;
    }
}
```

<hr class="section-divider">

## 📖 Primitive Alias — Anlamlı İsimler

Kod okunabilirliğini artırmak için primitive tiplere anlamlı isimler verebilirsin:

```typescript
// Anlamsız — her parametre number, ne anlama geldiği belirsiz
function createOrder(userId: number, productId: number, quantity: number): void { ... }

// Anlamlı alias — isimler belgeyici görevi görür
type UserId    = number;
type ProductId = number;
type Quantity  = number;
type Price     = number;

function createOrder(userId: UserId, productId: ProductId, qty: Quantity): void { ... }

// Daha da güçlü: branded types (ileri seviye)
type UserId2 = number & { readonly _brand: "UserId" };
// Bu sayede UserId2 tipini normal number ile karıştıramazsın
```

<hr class="section-divider">

## 📖 Tuple ile type Alias

```typescript
// Koordinat sistemleri
type Point2D = [x: number, y: number];
type Point3D = [x: number, y: number, z: number];

// Renk
type RGB  = [r: number, g: number, b: number];
type RGBA = [r: number, g: number, b: number, a: number];

// Key-value çifti
type Entry<K, V> = [key: K, value: V];

// Fonksiyon dönüş tipi olarak tuple
type MinMax = [min: number, max: number];

function getMinMax(numbers: number[]): MinMax {
    return [Math.min(...numbers), Math.max(...numbers)];
}

const [min, max] = getMinMax([3, 1, 7, 2, 9]); // destructuring ile al
```

<hr class="section-divider">

## 📖 Mapped Types ile type

`type`, `interface`'in yapamadığı gelişmiş tip dönüşümlerine izin verir:

```typescript
// Tüm alanları string'e çevir
type Stringify<T> = {
    [K in keyof T]: string;
};

// Tüm alanları opsiyonel yap (Partial'ın manuel versiyonu)
type MyPartial<T> = {
    [K in keyof T]?: T[K];
};

// Tüm alanları readonly yap
type MyReadonly<T> = {
    readonly [K in keyof T]: T[K];
};
```

Bu tür generic mapped type'lar için `type` şarttır — `interface` bunları yapamaz.

<hr class="section-divider">

## 🏭 Real-World Kullanım

<div class="callout callout-real-world">

**🏭 API Durum Yönetimi — Discriminated Union**

```typescript
// API çağrısı 4 farklı durumda olabilir
type AsyncState<T> =
    | { status: "idle" }
    | { status: "loading" }
    | { status: "success"; data: T }
    | { status: "error"; message: string; code: number };

// React component'te kullanım
function UserProfile({ state }: { state: AsyncState<User> }) {
    switch (state.status) {
        case "idle":    return <p>Henüz yüklenmedi</p>;
        case "loading": return <Spinner />;
        case "success": return <UserCard user={state.data} />;
        case "error":   return <ErrorMessage msg={state.message} />;
    }
}
```

</div>

<div class="callout callout-real-world">

**🏭 Form Tipler**

```typescript
// Form alanları için alias
type FieldName = "email" | "password" | "name" | "phone";
type FieldError = string | null;
type FormErrors = Record<FieldName, FieldError>;

// Form state
type FormStatus = "idle" | "submitting" | "success" | "error";

type FormState = {
    values: Record<FieldName, string>;
    errors: FormErrors;
    status: FormStatus;
    touched: Record<FieldName, boolean>;
};

const initialFormState: FormState = {
    values: { email: "", password: "", name: "", phone: "" },
    errors: { email: null, password: null, name: null, phone: null },
    status: "idle",
    touched: { email: false, password: false, name: false, phone: false }
};
```

</div>

<hr class="section-divider">

## ✅ Best Practices

<div class="callout callout-tip">

**✅ Type Alias Best Practices:**
- Union tipler için `type` şart — `interface` yapamaz
- Primitive alias'lar kodu belgeleyici yapar: `type UserId = number`
- Status, Role gibi literal union'lar için her zaman `type` kullan
- Obje tipleri için proje içinde tutarlı ol — hep `interface` veya hep `type`
- Intersection (`&`) ile tip birleştirme, `extends`'in alternatifi

</div>

## ❌ Avoid

<div class="callout callout-danger">

**❌ Kaçınılması Gerekenler:**
```typescript
// ❌ Type alias'ı gereksiz yerde kullan — direkt tipi yaz
type MyString = string; // neden? string'i direkt kullan

// ❌ Çok karmaşık iç içe union
type WeirdType = string | number | (boolean | null) | (string[] | undefined);
// Bu tipleri daha küçük parçalara böl

// ❌ Type ile interface'i aynı projede tutarsız kullanmak
interface User { name: string }
type Product = { name: string } // hangisi ne zaman? — kural koy
```

</div>

<hr class="section-divider">

## 📋 Özet

| Kullanım | Syntax | `type` mı `interface` mi? |
|----------|--------|--------------------------|
| Obje şekli | `type X = { a: string }` | İkisi de olur |
| Union tip | `type X = "a" \| "b"` | **Sadece `type`** |
| Intersection | `type X = A & B` | **Sadece `type`** |
| Tuple | `type X = [string, number]` | **Sadece `type`** |
| Primitive alias | `type ID = number` | **Sadece `type`** |
| Class contract | `implements X` | Sadece `interface` |
| Declaration merging | Aynı isim | Sadece `interface` |
