# Event Tipleri

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
React'ta event tipleri: `ChangeEvent`, `MouseEvent`, `FormEvent`, `KeyboardEvent`. Her event için doğru HTML element tipi. `e.target.value` güvenli erişimi. Context API ile global state tipleme.

</div>

---

## 📖 Event Tipi Formatı

React event'leri `React.XxxEvent<HTMLElement>` formatındadır. Element tipi önemlidir — `e.target.value` için `HTMLInputElement` olmazsa TypeScript hata verir:

```typescript
// Genel format:
// React.EventName<HTMLElementType>
// veya import ederek:
// ChangeEvent<HTMLInputElement>
```

<hr class="section-divider">

## 📖 Temel Event Tipleri

```typescript
import {
    type ChangeEvent,
    type MouseEvent,
    type FormEvent,
    type KeyboardEvent,
    useState
} from "react";

function FormExample() {
    const [inputValue, setInputValue] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // ChangeEvent — input, select, textarea onChange
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setInputValue(e.target.value); // string — güvenli
    };

    const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>): void => {
        console.log(e.target.value); // seçili option değeri
    };

    const handleTextAreaChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
        console.log(e.target.value);
    };

    // Dosya input — FileList tipleme
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0] ?? null;
        setSelectedFile(file);
        if (file) {
            console.log(file.name, file.size, file.type);
        }
    };

    // MouseEvent — button, div tıklama
    const handleButtonClick = (e: MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        console.log("Tıklandı:", e.clientX, e.clientY);
    };

    const handleDivClick = (e: MouseEvent<HTMLDivElement>): void => {
        e.stopPropagation();
        console.log("Div tıklandı");
    };

    // FormEvent — form submit
    const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault(); // sayfa yenilemeyi önle — şart
        console.log("Form gönderildi:", inputValue);
    };

    // KeyboardEvent — klavye olayları
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === "Enter") console.log("Enter basıldı");
        if (e.key === "Escape") setInputValue("");
        if (e.ctrlKey && e.key === "s") {
            e.preventDefault();
            console.log("Ctrl+S — kaydet");
        }
    };

    // FocusEvent
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>): void => {
        console.log("Focus:", e.target.name);
    };

    // DragEvent
    const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        console.log("Drop edilen dosyalar:", files);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
            />
            <select onChange={handleSelectChange}>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
            </select>
            <input type="file" onChange={handleFileChange} />
            <button type="submit" onClick={handleButtonClick}>Gönder</button>
            <div
                onClick={handleDivClick}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
            >
                Sürükle bırak
            </div>
        </form>
    );
}
```

<hr class="section-divider">

## 📖 Event Tipi Referans Tablosu

| Event | Tip | Element | Kullanım |
|-------|-----|---------|---------|
| `onChange` input | `ChangeEvent<HTMLInputElement>` | `<input>` | text, number, checkbox |
| `onChange` select | `ChangeEvent<HTMLSelectElement>` | `<select>` | dropdown |
| `onChange` textarea | `ChangeEvent<HTMLTextAreaElement>` | `<textarea>` | çok satır |
| `onClick` button | `MouseEvent<HTMLButtonElement>` | `<button>` | tıklama |
| `onClick` div | `MouseEvent<HTMLDivElement>` | `<div>` | tıklama |
| `onSubmit` | `FormEvent<HTMLFormElement>` | `<form>` | form gönder |
| `onKeyDown` | `KeyboardEvent<HTMLInputElement>` | `<input>` | klavye |
| `onFocus/onBlur` | `React.FocusEvent<HTMLInputElement>` | `<input>` | odak |
| `onDrop` | `React.DragEvent<HTMLDivElement>` | `<div>` | sürükle bırak |
| `style` prop | `React.CSSProperties` | herhangi | inline stil |

<hr class="section-divider">

## 📖 Context API Tipleme

Context API, global state için kullanılır. TypeScript ile güvenli kullanmak için `null` başlangıç değeri ve custom hook:

```typescript
import { createContext, useContext, useState, type FC, type ReactNode } from "react";

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

// Context — default null, Provider dışında kullanıma karşı guard
const AuthContext = createContext<AuthContextType | null>(null);

// Provider bileşeni
export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const login = async (email: string, password: string): Promise<void> => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password })
            });
            const data = await res.json() as User;
            setUser(data);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = (): void => setUser(null);

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook — context'i güvenli kullan
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth, AuthProvider içinde kullanılmalı");
    }
    return context; // null değil — AuthContextType
}

// Kullanım
function ProfilePage() {
    const { user, logout, isLoading } = useAuth();

    if (isLoading) return <div>Yükleniyor...</div>;
    if (!user) return <div>Giriş yapılmadı</div>;

    return (
        <div>
            <h1>{user.name}</h1>
            <p>{user.email}</p>
            <button onClick={logout}>Çıkış</button>
        </div>
    );
}
```

<hr class="section-divider">

## ✅ Best Practices

<div class="callout callout-tip">

**✅ Event & Context Best Practices:**
- Event handler'ların her zaman doğru element tipini kullan — `HTMLInputElement` vs `HTMLDivElement`
- Inline handler'larda tip çıkarılır — ayrı fonksiyonda explicit yaz
- Context default değeri `null` yap, custom hook içinde kontrol et
- `useAuth`, `useTheme` gibi custom hook ile context'i sar — direkt `useContext` çağırma
- Context sık değişen state için değil, global nadir değişen değerler için

</div>

## ❌ Avoid

<div class="callout callout-danger">

**❌ Kaçınılması Gerekenler:**
```typescript
// ❌ Yanlış element tipi — e.target.value TypeScript göremiyor
const handleChange = (e: ChangeEvent<HTMLElement>): void => {
    e.target.value; // ❌ HTMLElement'te value yok
};
// ✅ ChangeEvent<HTMLInputElement>

// ❌ Context'i Provider dışında kullanmak
function App() {
    const { user } = useAuth(); // ❌ AuthProvider sarmalı yoksa null — hata
}

// ❌ Context ile sık değişen state — her değişimde tüm consumer re-render
const DataContext = createContext({ data: largeList }); // ❌ her güncelleme tüm ağacı re-render
// ✅ Zustand veya ayrı context'e böl
```

</div>

<hr class="section-divider">

## 📋 Özet

**Karar ağacı:**
```
Hangi event tipi?
├── onChange (input, select, textarea) → ChangeEvent<HTML___Element>
├── onClick (button, div)              → MouseEvent<HTML___Element>
├── onSubmit (form)                    → FormEvent<HTMLFormElement>
├── onKeyDown/Up (input)               → KeyboardEvent<HTMLInputElement>
├── onFocus/onBlur (input)             → FocusEvent<HTMLInputElement>
└── onDrop (div)                       → DragEvent<HTMLDivElement>

Global state?
├── Nadir değişen (auth, theme)        → Context API + custom hook
├── Sık değişen, component bazlı      → useState lokal
└── Karmaşık, çok component           → Zustand / Redux
```
