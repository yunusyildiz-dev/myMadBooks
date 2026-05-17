# Neden TypeScript? — AI Developer Perspektifi

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
TypeScript'in AI geliştirmede neden kritik olduğu. JavaScript'in neden yetmediği. Discriminated union ile AI API yanıtları. `unknown` ile güvenli API işleme. Fullstack AI stack'te TypeScript'in rolü.

</div>

---

## 📖 AI Geliştirme Neden Özellikle Riskli?

Normal bir web API'ında yanlış bir alan adı en kötü ihtimalle 404 döndürür. Bir AI uygulamasında ise:

- Model `"text"` yerine `"tool_use"` döndürebilir — içerik tamamen farklı yapıda
- Streaming chunk'lar beklenmedik format içerebilir
- Token limiti aşıldığında yanıt `null` veya truncated gelebilir
- Tool çağrısı sonucu `unknown` tipinde, runtime'da ne geldiğini bilmiyorsun
- `content_block_delta` event'i geldiğinde `delta.text` olmayabilir

JavaScript'te bunların hepsi runtime'da patlar. TypeScript'te derleme aşamasında yakalanır.

<hr class="section-divider">

## 📖 JavaScript vs TypeScript — AI API'da Fark

```typescript
// ❌ JavaScript — her şey runtime'da patlıyor
async function getAIReply(messages) {
    const res = await fetch("/api/claude", { ... });
    const data = await res.json();
    return data.content[0].text; // ❌ content[0] tool_use olabilir — .text yok
}

// ✅ TypeScript — discriminated union, derleme zamanı garantisi
type ContentBlock =
    | { type: "text"; text: string }
    | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
    | { type: "tool_result"; tool_use_id: string; content: string };

function extractText(blocks: ContentBlock[]): string {
    return blocks
        .filter((b): b is { type: "text"; text: string } => b.type === "text")
        .map(b => b.text)
        .join(""); // ✅ TypeScript garantiliyor: b.text her zaman string
}
```

<hr class="section-divider">

## 📖 Fullstack AI Stack'te TypeScript'in Rolü

Roadmap'teki her katmanda TypeScript farklı bir problem çözüyor:

```
┌─────────────────────────────────────────────────────────┐
│                   FULLSTACK AI STACK                    │
├─────────────────────────────────────────────────────────┤
│  Frontend (React + TS)                                  │
│  → Props tipleme, event tipleri, custom hooks          │
│  → useChat — streaming state güvenli                   │
├─────────────────────────────────────────────────────────┤
│  API Layer (Next.js Route / Express)                    │
│  → Request/Response tipleme                            │
│  → ChatRequest, StreamOptions interface'leri           │
├─────────────────────────────────────────────────────────┤
│  AI Service (Claude / OpenAI wrapper)                   │
│  → ContentBlock discriminated union                    │
│  → ClaudeMessage — stop_reason exhaustive check        │
│  → AsyncGenerator<string> streaming                    │
├─────────────────────────────────────────────────────────┤
│  RAG Pipeline                                          │
│  → DocumentChunk, EmbeddingResult, RetrievalResult     │
│  → Vector search tip güvenliği                        │
├─────────────────────────────────────────────────────────┤
│  Agent / Tool System                                    │
│  → ClaudeTool interface — JSON Schema tipleme          │
│  → ToolRegistry — fonksiyon registrisi                 │
│  → stop_reason: "tool_use" | "end_turn" exhaustive    │
└─────────────────────────────────────────────────────────┘
```

<hr class="section-divider">

## 📖 AI'da En Sık Karşılaşılan Tip Hataları

```typescript
// ❌ HATA 1: response.json() → any — güvensiz
const data = await res.json();
data.content[0].text; // runtime crash — content[0] tool_use ise .text yok

// ✅ DÜZELTME: unknown başla, type-safe wrapper ile daralt
const data: unknown = await res.json();
const message = data as ClaudeMessage; // tek casting noktası

// ❌ HATA 2: stop_reason'ı görmezden gelmek
const reply = response.content[0].text; // ❌ stop_reason "tool_use" ise content[0] ToolUseBlock

// ✅ DÜZELTME: stop_reason'a göre dallan
if (response.stop_reason === "end_turn") {
    const texts = response.content.filter(b => b.type === "text");
    // ...
} else if (response.stop_reason === "tool_use") {
    const toolCalls = response.content.filter(b => b.type === "tool_use");
    // ...
}

// ❌ HATA 3: Streaming event'i doğrudan text olarak varsaymak
const event = JSON.parse(line) as { delta: { text: string } };
event.delta.text; // ❌ message_start event'inde delta yok

// ✅ DÜZELTME: type field'ını kontrol et
const event = JSON.parse(line) as {
    type: string;
    delta?: { type: string; text: string };
};
if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
    yield event.delta.text; // ✅ güvenli
}
```

<hr class="section-divider">

## 📖 Temel AI Tipleri — Cheat Sheet

```typescript
// Her AI projesinde kullanacağın temel tipler

// 1. Chat mesajı — her LLM API'ında ortak yapı
type ChatMessage = {
    role: "user" | "assistant" | "system";
    content: string;
};

// 2. API state — loading/error/data döngüsü
type AsyncState<T> = {
    data: T | null;
    loading: boolean;
    error: string | null;
};

// 3. Result pattern — beklenen hataları wrap et
type Result<T, E = Error> =
    | { success: true; data: T }
    | { success: false; error: E };

// 4. Streaming — chunk üretici
type StreamHandler = AsyncGenerator<string, void, unknown>;

// 5. Tool registry — agent için
type ToolFn<TInput = Record<string, unknown>, TOutput = unknown> =
    (input: TInput) => Promise<TOutput>;
type ToolRegistry = Record<string, ToolFn>;
```

<hr class="section-divider">

## ✅ Best Practices

<div class="callout callout-tip">

**✅ AI Developer TypeScript Best Practices:**
- AI API yanıtlarını `unknown` ile al, tek bir wrapper noktasında cast et
- `stop_reason` gibi discriminant alanları exhaustive switch ile kontrol et
- `ContentBlock` gibi heterogen dizileri discriminated union + filter ile işle
- Streaming için `AsyncGenerator<string>` kullan, `finally` ile `reader.releaseLock()` yap
- Tüm AI servis tiplerini ayrı bir `*.types.ts` dosyasına topla

</div>

## ❌ Avoid

<div class="callout callout-danger">

**❌ Kaçınılması Gerekenler:**
```typescript
// ❌ API yanıtını direkt any ile işlemek
const data: any = await res.json();
data.content[0].text; // stop_reason "tool_use" ise runtime crash

// ❌ Her streaming event'i aynı yapıda varsaymak
for (const line of lines) {
    const event = JSON.parse(line);
    yield event.delta.text; // message_start event'inde delta yok
}

// ❌ Tool çağrısını type guard'sız çalıştırmak
const fn = toolRegistry[block.name]; // block.name yoksa undefined
fn(block.input); // fn undefined — crash
// ✅ if (!fn) throw new Error(`Tool bulunamadı: ${block.name}`)
```

</div>

<hr class="section-divider">

## 📋 Özet

| Alan | TypeScript Getirisi |
|------|---------------------|
| Claude API | ContentBlock discriminated union — text vs tool_use ayrımı |
| Streaming | `AsyncGenerator<string>` + `finally` cleanup |
| Agent | `stop_reason` exhaustive switch — yeni case eklenince uyarı |
| RAG | `DocumentChunk`, `RetrievalResult` — pipeline boyunca tip güvencesi |
| Full-stack | Ortak tip tanımları — frontend/backend aynı interface'i paylaşır |
