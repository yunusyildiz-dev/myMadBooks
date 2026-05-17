# Component & Props Tipleme

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
React bileşenini TypeScript ile tanımlamak. `FC<Props>` vs direkt fonksiyon. Props interface yazımı. `ReactNode` ve `children` tipi. Utility type'larla props türetme.

</div>

---

## 📖 Component Tanımı — FC\<Props\> ve function

React bileşeni TypeScript'te iki yolla tanımlanır:

```typescript
import { type FC, type ReactElement, type ReactNode } from "react";

// Yöntem 1: FC<Props> — Function Component
interface ButtonProps {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    variant?: "primary" | "secondary" | "danger";
}

const Button: FC<ButtonProps> = ({ label, onClick, disabled = false, variant = "primary" }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`btn btn-${variant}`}
        >
            {label}
        </button>
    );
};

// Yöntem 2: Direkt fonksiyon — modern topluluk tercihi
function ButtonAlt({ label, onClick, disabled = false }: ButtonProps): ReactElement {
    return (
        <button onClick={onClick} disabled={disabled}>
            {label}
        </button>
    );
}
```

**Fark:**
- `FC<Props>` → return tipi implicitly `ReactElement | null`
- `function` → return tipini explicit yazabilirsin; daha açık, daha az "magic"
- Proje içinde tutarlı ol — ikisi de geçerli

<hr class="section-divider">

## 📖 Props Interface Yazımı

Props interface, component'in "kontratı"dır. Parent'ın ne verebileceğini TypeScript'e söyler:

```typescript
interface UserCardProps {
    // Primitif tipler
    name: string;
    age: number;
    isActive: boolean;

    // Opsiyonel — ? ile
    bio?: string;
    avatarUrl?: string;

    // Union — belirli değerler
    role: "admin" | "editor" | "viewer";

    // Obje prop
    address: { city: string; country: string };

    // Dizi prop
    tags: string[];

    // Callback prop — fonksiyon tipi
    onEdit: (id: number) => void;
    onDelete?: (id: number) => void; // opsiyonel callback

    // Style prop
    className?: string;
    style?: React.CSSProperties;
}

const UserCard: FC<UserCardProps> = ({
    name, age, isActive, bio, role,
    address, tags, onEdit, onDelete, className
}) => {
    return (
        <div className={className}>
            <h2>{name}</h2>
            <p>{age} yaş — {role}</p>
            <p>{address.city}, {address.country}</p>
            {bio && <p>{bio}</p>}
            <div>{tags.map(tag => <span key={tag}>{tag}</span>)}</div>
            <button onClick={() => onEdit(1)}>Düzenle</button>
            {onDelete && (
                <button onClick={() => onDelete(1)}>Sil</button>
            )}
        </div>
    );
};
```

<hr class="section-divider">

## 📖 Utility Type ile Props Türetme

Var olan veri modelinden component props türetmek tekrar yazmayı önler:

```typescript
interface User {
    id: number;
    name: string;
    email: string;
    role: "admin" | "editor" | "viewer";
    bio?: string;
}

// User'dan pick et + callback ekle
type UserListItemProps = Pick<User, "id" | "name" | "role"> & {
    onSelect: (id: number) => void;
    isSelected?: boolean;
};

const UserListItem: FC<UserListItemProps> = ({ id, name, role, onSelect, isSelected }) => (
    <div
        onClick={() => onSelect(id)}
        style={{ fontWeight: isSelected ? "bold" : "normal" }}
    >
        {name} — {role}
    </div>
);

// Hassas alanları çıkar
type SafeUserProps = Omit<User, "email"> & {
    onFollow: (id: number) => void;
};
```

<hr class="section-divider">

## 📖 children Tipi

```typescript
// ReactNode — en geniş, en yaygın
// string, number, ReactElement, null, boolean, array kabul eder
interface CardProps {
    title: string;
    children: ReactNode;   // içine her şey alabilir
    footer?: ReactNode;    // opsiyonel footer
}

const Card: FC<CardProps> = ({ title, children, footer }) => (
    <div className="card">
        <div className="card-header"><h3>{title}</h3></div>
        <div className="card-body">{children}</div>
        {footer && <div className="card-footer">{footer}</div>}
    </div>
);

// PropsWithChildren<T> — React utility type
type LayoutProps = React.PropsWithChildren<{
    title: string;
    sidebar?: ReactNode;
}>;

const Layout: FC<LayoutProps> = ({ title, children, sidebar }) => (
    <div>
        <header>{title}</header>
        <main>{children}</main>
        {sidebar && <aside>{sidebar}</aside>}
    </div>
);

// Kullanım
<Layout title="Dashboard" sidebar={<nav>Nav</nav>}>
    <p>İçerik buraya gelir</p>
</Layout>
```

**`ReactNode` vs `ReactElement`:**
- `ReactNode` → string, number, null, boolean dahil her şey — çoğu zaman bu
- `ReactElement` → sadece React bileşeni — string kabul etmez

<hr class="section-divider">

## ✅ Best Practices

<div class="callout callout-tip">

**✅ Component & Props Best Practices:**
- Her component için ayrı `Props` interface yaz — component'in kontratı
- Opsiyonel prop'lara destructuring'de default değer ver
- Callback prop tipini fonksiyon imzasıyla yaz: `onEdit: (id: number) => void`
- Var olan modelden props türet — `Pick`, `Omit`, `&` kullan
- `children` tipi için `ReactNode` kullan — yeterince geniş

</div>

## ❌ Avoid

<div class="callout callout-danger">

**❌ Kaçınılması Gerekenler:**
```typescript
// ❌ Props interface olmadan component
const BadComponent = ({ name, onClick }: any) => <div>{name}</div>; // any — tehlikeli

// ❌ İç içe tip tanımı
const Component: FC<{ user: { id: number; address: { city: string } } }> = ...
// ✅ Ayrı interface'e çıkar

// ❌ callback'i tanımsız bırakmak
interface Props { onSubmit: Function; } // ❌ parametre ve dönüş tipi belirsiz
interface Props { onSubmit: (data: FormData) => Promise<void>; } // ✅ tam imza
```

</div>

<hr class="section-divider">

## 📋 Özet

| Kavram | Syntax | Kullanım |
|--------|--------|----------|
| FC\<Props\> | `const Btn: FC<BtnProps> = ...` | Function component |
| Direkt fonksiyon | `function Btn(props: BtnProps): ReactElement` | Modern tercih |
| ReactNode | `children: ReactNode` | Her tür içerik |
| PropsWithChildren | `React.PropsWithChildren<T>` | children dahil props |
| Props türetme | `Pick<Model, "id"> & { onSelect: ... }` | DRY props |
