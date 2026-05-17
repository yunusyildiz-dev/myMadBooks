# AI API Entegrasyonu

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
React + TypeScript ile tam bir AI chat arayüzü. `useChat` custom hook ile streaming state yönetimi. `ChatMessageItem`, `ChatInput`, `ChatInterface` bileşen mimarisi. `useRef` ile auto-scroll. Tüm Part 11 kavramlarının bir araya gelişi.

</div>

---

## 📖 Mimari Genel Bakış

AI chat arayüzü üç katmandan oluşur:

```
ChatInterface (ana bileşen)
├── useChat (custom hook — state + API)
├── ChatMessageItem (mesaj gösterimi)
└── ChatInput (metin girişi + gönder)
```

Her katman kendi tiplerini ve sorumluluğunu taşır. `useChat`, React bileşenlerinden API mantığını ayırır — bileşenler sadece görüntüler.

<hr class="section-divider">

## 📖 Tip Tanımları

```typescript
// Bir chat mesajının tam tipi
interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: string;
    isStreaming?: boolean; // streaming devam ediyorsa true
}

// useChat hook seçenekleri
interface UseChatOptions {
    systemPrompt?: string;
    model?: string;
    onError?: (error: Error) => void; // hata callback'i
}

// useChat hook dönüş tipi — explicit yazılmalı
interface UseChatReturn {
    messages: ChatMessage[];
    isLoading: boolean;
    error: string | null;
    sendMessage: (content: string) => Promise<void>;
    clearHistory: () => void;
}
```

**Neden `isStreaming`?** AI yanıtı chunk chunk gelir. Placeholder mesaj `isStreaming: true` ile eklenir, her chunk'ta `content` güncellenir. Streaming bitince `isStreaming: false` yapılır — UI blinking cursor'u buna göre gösterir.

<hr class="section-divider">

## 📖 useChat Custom Hook

```typescript
import { useState, useCallback } from "react";

function useChat(options: UseChatOptions = {}): UseChatReturn {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sendMessage = useCallback(async (content: string): Promise<void> => {
        if (!content.trim()) return;

        // 1. Kullanıcı mesajını ekle
        const userMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: "user",
            content,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setError(null);

        // 2. Streaming placeholder — asistan mesajı (boş içerik)
        const assistantId = crypto.randomUUID();
        const placeholder: ChatMessage = {
            id: assistantId,
            role: "assistant",
            content: "",
            timestamp: new Date().toISOString(),
            isStreaming: true
        };
        setMessages(prev => [...prev, placeholder]);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(m => ({
                        role: m.role,
                        content: m.content
                    })),
                    systemPrompt: options.systemPrompt,
                    model: options.model
                })
            });

            if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

            // 3. Stream'i oku — her chunk'ta state güncelle
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let accumulated = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                accumulated += chunk;

                setMessages(prev => prev.map(msg =>
                    msg.id === assistantId
                        ? { ...msg, content: accumulated }
                        : msg
                ));
            }

            // 4. Streaming bitti — isStreaming kapat
            setMessages(prev => prev.map(msg =>
                msg.id === assistantId
                    ? { ...msg, isStreaming: false }
                    : msg
            ));

        } catch (err) {
            const error = err instanceof Error ? err : new Error("Bilinmeyen hata");
            setError(error.message);
            options.onError?.(error); // optional callback — varsa çağır

            // Başarısız placeholder'ı kaldır
            setMessages(prev => prev.filter(msg => msg.id !== assistantId));
        } finally {
            setIsLoading(false);
        }
    }, [messages, options]);

    const clearHistory = useCallback((): void => {
        setMessages([]);
        setError(null);
    }, []);

    return { messages, isLoading, error, sendMessage, clearHistory };
}
```

**Kritik detaylar:**
- `setMessages(prev => [...prev, newMsg])` — functional update, önceki state'e güvenli bağımlılık
- `prev.map(msg => msg.id === assistantId ? {...msg, content} : msg)` — ID ile tek mesajı güncelle
- `options.onError?.(error)` — optional chaining ile callback'i güvenli çağır
- `useCallback(..., [messages, options])` — dependency array şart, stale closure önler

<hr class="section-divider">

## 📖 ChatMessageItem Bileşeni

```typescript
import { type FC } from "react";

interface ChatMessageProps {
    message: ChatMessage;
}

const ChatMessageItem: FC<ChatMessageProps> = ({ message }) => (
    <div className={`message message--${message.role}`}>
        <span className="message__role">
            {message.role === "user" ? "Sen" : "Asistan"}
        </span>
        <p className="message__content">
            {message.content}
            {message.isStreaming && <span className="cursor">▊</span>}
        </p>
        <time className="message__time">
            {new Date(message.timestamp).toLocaleTimeString("tr-TR")}
        </time>
    </div>
);
```

- `message--${message.role}` → CSS class'ı role'e göre değişir (`message--user`, `message--assistant`)
- `{message.isStreaming && <span>▊</span>}` → streaming devam ediyorsa cursor göster
- `toLocaleTimeString("tr-TR")` → Türkçe saat formatı

<hr class="section-divider">

## 📖 ChatInput Bileşeni

```typescript
import { useState, useRef, type FC } from "react";
import { type FormEvent, type KeyboardEvent, type ChangeEvent } from "react";

interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
    placeholder?: string;
}

const ChatInput: FC<ChatInputProps> = ({
    onSend,
    disabled = false,
    placeholder = "Mesaj yaz..."
}) => {
    const [value, setValue] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (!value.trim() || disabled) return;
        onSend(value.trim());
        setValue("");
        textareaRef.current?.focus(); // gönder sonrası focus'u koru
    };

    // Enter → gönder, Shift+Enter → yeni satır
    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!value.trim() || disabled) return;
            onSend(value.trim());
            setValue("");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                rows={3}
            />
            <button type="submit" disabled={disabled || !value.trim()}>
                {disabled ? "Yanıtlanıyor..." : "Gönder"}
            </button>
        </form>
    );
};
```

**Enter/Shift+Enter ayrımı:** `e.key === "Enter" && !e.shiftKey` — kullanıcının çok satırlı mesaj yazabilmesi için Shift+Enter yeni satır ekler, sadece Enter gönderir.

<hr class="section-divider">

## 🏭 ChatInterface — Her Şeyi Birleştir

<div class="callout callout-real-world">

**🏭 Üretim Kalitesinde Tam AI Chat Arayüzü**

```typescript
import { useEffect, useRef, type FC } from "react";

const ChatInterface: FC<{ systemPrompt?: string }> = ({ systemPrompt }) => {
    // Scroll için ref — DOM elementi
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // useChat — tüm chat state ve API mantığı
    const { messages, isLoading, error, sendMessage, clearHistory } = useChat({
        systemPrompt,
        onError: (err) => console.error("Chat hatası:", err.message)
    });

    // Yeni mesaj gelince en alta kaydır
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]); // messages değişince çalışır

    return (
        <div className="chat">
            <header className="chat__header">
                <h2>AI Asistan</h2>
                <button onClick={clearHistory}>Geçmişi Temizle</button>
            </header>

            <div className="chat__messages">
                {messages.map(message => (
                    <ChatMessageItem key={message.id} message={message} />
                ))}
                {error && <div className="chat__error">{error}</div>}
                <div ref={messagesEndRef} /> {/* scroll anchor */}
            </div>

            <ChatInput
                onSend={sendMessage}
                disabled={isLoading}
                placeholder="Sorunuzu yazın..."
            />
        </div>
    );
};

// Kullanım
export default function App() {
    return (
        <ChatInterface
            systemPrompt="Sen yardımcı bir TypeScript asistanısın. Kısa ve net yanıtlar ver."
        />
    );
}
```

**Veri akışı:**
```
kullanıcı yazar → ChatInput.onSend → useChat.sendMessage
    → fetch POST /api/chat
    → streaming okuma → setMessages(prev => ...) — her chunk
    → ChatMessageItem re-render (isStreaming: true → cursor görünür)
    → stream biter → isStreaming: false → cursor kaybolur
    → useEffect [messages] → scrollIntoView
```

</div>

<hr class="section-divider">

## ✅ Best Practices

<div class="callout callout-tip">

**✅ AI API Entegrasyonu Best Practices:**
- `useChat` gibi custom hook ile API mantığını bileşenden ayır — test edilebilir, yeniden kullanılabilir
- Streaming mesajları ID ile güncelle — `prev.map(msg => msg.id === id ? {...} : msg)`
- Hata durumunda placeholder'ı temizle — kullanıcıyı boş mesajla bırakma
- `finally` ile `setIsLoading(false)` — hata olsa da loading state'i kapat
- `useCallback` dependency array'ini doğru yaz — `[messages, options]`
- `useRef<HTMLDivElement>` ile scroll anchor — DOM'a doğrudan erişim

</div>

## ❌ Avoid

<div class="callout callout-danger">

**❌ Kaçınılması Gerekenler:**
```typescript
// ❌ API mantığını bileşen içine gömmek
function ChatInterface() {
    const sendMessage = async (content: string) => {
        // 50 satır API kodu buraya — test edilemez, yeniden kullanılamaz
    };
}
// ✅ useChat custom hook'a taşı

// ❌ Streaming'i state olmadan göstermek
setMessages([...messages, newMessage]); // ❌ stale closure — önceki messages
setMessages(prev => [...prev, newMessage]); // ✅ functional update

// ❌ Placeholder'ı başarısız durumda bırakmak
} catch (err) {
    setError("Hata"); // ❌ boş içerikli asistan mesajı listede kalır
    setMessages(prev => prev.filter(msg => msg.id !== assistantId)); // ✅ temizle
}

// ❌ isLoading'i finally'siz kapatmak
try {
    await fetch(...);
    setIsLoading(false); // ❌ hata olursa çalışmaz — sonsuz loading
} catch { }
// ✅ finally { setIsLoading(false) }

// ❌ scroll için useLayoutEffect veya DOM query
document.querySelector(".chat__messages").scrollTop = 999999; // ❌ güvensiz
// ✅ useRef + scrollIntoView
```

</div>

<hr class="section-divider">

## 📋 Özet — Part 11 Karar Ağacı

```
React + TypeScript'te ne kullanmalıyım?

UI verisi mi?
├── Basit değer (string, number, boolean)  → useState — generic gerekmez
├── null başlangıç / API verisi            → useState<T | null>(null)
└── Dizi (başlangıç boş)                   → useState<T[]>([])

DOM'a erişim mi?
├── HTML elementi (focus, scroll)          → useRef<HTMLElement>(null)
└── Re-render tetiklemeyecek değer         → useRef<T>(initialValue)

Yan etki mi?
├── Async API çağrısı                      → useEffect + içeride async fn
├── Event listener                         → useEffect + cleanup return
└── Mesaj gelince scroll                   → useEffect([messages])

Mantık tekrar kullanılacak mı?            → custom hook (use prefix)

Global state mi?
├── Auth, theme, dil (nadir değişen)       → Context API + custom hook
├── Sık değişen, karmaşık                 → Zustand / Redux Toolkit
└── Component bazlı                        → useState lokal

Props mı?
├── Her bileşen için ayrı interface yaz
├── Modelden türetmek için Pick/Omit/& kullan
└── children için ReactNode
```

| Kavram | Sözdizimi | Ne zaman |
|--------|-----------|----------|
| `FC<Props>` | `const Btn: FC<BtnProps> = ...` | Her bileşen |
| `useState<T\|null>` | `useState<User\|null>(null)` | API verisi |
| `useRef<HTML...>` | `useRef<HTMLDivElement>(null)` | DOM erişimi |
| `useCallback` | `useCallback(fn, [deps])` | Prop callback, ağır fn |
| Custom hook | `function useChat(): UseChatReturn` | Tekrar kullanılabilir mantık |
| Streaming state | `setMessages(prev => prev.map(...))` | ID ile tek mesaj güncelle |
| `ChangeEvent<T>` | `ChangeEvent<HTMLTextAreaElement>` | onChange handler |
| `KeyboardEvent<T>` | `KeyboardEvent<HTMLTextAreaElement>` | onKeyDown |
| `FormEvent<T>` | `FormEvent<HTMLFormElement>` | onSubmit |
