# Claude API Tipleme

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
Claude API'ının tam tip sistemi. `ContentBlock` discriminated union. `ClaudeMessage` ve `stop_reason` ayrımı. Tip güvenli API wrapper. Streaming event tipleme. Token usage interface'i.

</div>

---

## 📖 ContentBlock — Discriminated Union

Claude API'ının en önemli kavramı: bir `content` dizisi içindeki her eleman farklı tipte olabilir. `type` alanı discriminant'tır — TypeScript bunu kullanarak tip daralması yapar:

```typescript
// Text bloğu — normal yanıt
interface TextBlock {
    type: "text";
    text: string;
}

// Tool çağrısı — LLM bir araç kullanmak istiyor
interface ToolUseBlock {
    type: "tool_use";
    id: string;            // tool_use_id — sonuçta kullanılır
    name: string;          // çağrılacak tool adı
    input: Record<string, unknown>; // tool'a gönderilecek parametreler
}

// Tool sonucu — tool çalıştırıldı, sonuç gönderiliyor
interface ToolResultBlock {
    type: "tool_result";
    tool_use_id: string;  // hangi tool_use'a yanıt
    content: string;       // JSON.stringify(result)
}

// Discriminated union — hepsi bir arada
type ContentBlock = TextBlock | ToolUseBlock | ToolResultBlock;
```

**Neden discriminated union?** `content` dizisi içinde herhangi bir blok gelebilir. TypeScript, `type` alanını kontrol ettiğinde otomatik olarak doğru tip'e daralır:

```typescript
function processBlock(block: ContentBlock): void {
    switch (block.type) {
        case "text":
            console.log(block.text);      // ✅ string — TypeScript biliyor
            break;
        case "tool_use":
            console.log(block.name);      // ✅ string
            console.log(block.input);     // ✅ Record<string, unknown>
            break;
        case "tool_result":
            console.log(block.tool_use_id); // ✅ string
            break;
    }
}
```

<hr class="section-divider">

## 📖 ClaudeMessage — Tam Yanıt Tipi

```typescript
interface ClaudeMessage {
    id: string;
    type: "message";
    role: "assistant";
    content: ContentBlock[];
    model: string;
    stop_reason:
        | "end_turn"      // normal bitiş
        | "max_tokens"    // token limiti doldu
        | "tool_use"      // model tool çağırmak istiyor
        | "stop_sequence"; // stop sequence tetiklendi
    stop_sequence: string | null;
    usage: {
        input_tokens: number;
        output_tokens: number;
    };
}

// stop_reason'a göre davranış — exhaustive switch şart
function handleResponse(response: ClaudeMessage): string {
    switch (response.stop_reason) {
        case "end_turn":
            return response.content
                .filter((b): b is TextBlock => b.type === "text")
                .map(b => b.text)
                .join("");

        case "tool_use":
            const toolCalls = response.content
                .filter((b): b is ToolUseBlock => b.type === "tool_use");
            return `Tool çağrısı: ${toolCalls.map(t => t.name).join(", ")}`;

        case "max_tokens":
            throw new Error("Token limiti doldu — max_tokens değerini artır");

        case "stop_sequence":
            return "Stop sequence tetiklendi";
    }
}
```

<hr class="section-divider">

## 📖 Tip Güvenli Claude API Wrapper

```typescript
interface ClaudeOptions {
    model?: string;
    maxTokens?: number;
    systemPrompt?: string;
    temperature?: number;
}

// Tek mesaj — streaming olmayan çağrı
async function callClaude(
    messages: ChatMessage[],
    options: ClaudeOptions = {}
): Promise<string> {
    const {
        model = "claude-sonnet-4-20250514",
        maxTokens = 1024,
        systemPrompt
    } = options;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
            "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
            model,
            max_tokens: maxTokens,
            system: systemPrompt,
            messages: messages.filter(m => m.role !== "system")
        })
    });

    if (!res.ok) {
        if (res.status === 401) throw new Error("API key geçersiz");
        if (res.status === 429) throw new Error("Rate limit — bekle ve tekrar dene");
        throw new Error(`Claude API hata: ${res.status}`);
    }

    const data: unknown = await res.json();
    const message = data as ClaudeMessage; // tek casting noktası

    if (message.stop_reason === "max_tokens") {
        console.warn("Yanıt kesildi — max_tokens artırılabilir");
    }

    // Sadece text blokları al
    return message.content
        .filter((block): block is TextBlock => block.type === "text")
        .map(block => block.text)
        .join("");
}
```

<hr class="section-divider">

## 📖 Streaming Event Tipleme

Claude streaming API, Server-Sent Events (SSE) formatında çalışır. Her event farklı bir yapıya sahiptir:

```typescript
// Streaming event tipleri — tüm olası formatlar
type StreamEvent =
    | { type: "message_start"; message: Pick<ClaudeMessage, "id" | "model" | "usage"> }
    | { type: "content_block_start"; index: number; content_block: ContentBlock }
    | { type: "content_block_delta"; index: number; delta: TextDelta | InputJsonDelta }
    | { type: "content_block_stop"; index: number }
    | { type: "message_delta"; delta: { stop_reason: ClaudeMessage["stop_reason"] }; usage: { output_tokens: number } }
    | { type: "message_stop" };

interface TextDelta {
    type: "text_delta";
    text: string;
}

interface InputJsonDelta {
    type: "input_json_delta";
    partial_json: string;
}

// Tip güvenli streaming wrapper
async function* streamClaude(
    messages: ChatMessage[],
    options: ClaudeOptions = {}
): AsyncGenerator<string, void, unknown> {
    const { model = "claude-sonnet-4-20250514", maxTokens = 1024, systemPrompt } = options;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
            "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
            model,
            max_tokens: maxTokens,
            system: systemPrompt,
            stream: true,
            messages: messages.filter(m => m.role !== "system")
        })
    });

    if (!res.ok || !res.body) throw new Error(`Claude stream başlatılamadı: ${res.status}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const lines = decoder
                .decode(value, { stream: true })
                .split("\n")
                .filter(line => line.startsWith("data: "));

            for (const line of lines) {
                const rawData = line.slice(6); // "data: " prefix'ini çıkar
                if (rawData === "[DONE]") return;

                try {
                    const event = JSON.parse(rawData) as StreamEvent;

                    // Sadece text delta'ları yield et
                    if (
                        event.type === "content_block_delta" &&
                        event.delta.type === "text_delta"
                    ) {
                        yield event.delta.text;
                    }
                } catch {
                    // JSON parse hatası — satırı atla (heartbeat vb.)
                }
            }
        }
    } finally {
        reader.releaseLock(); // bellek sızıntısı önle
    }
}

// Kullanım
async function main() {
    let reply = "";
    for await (const chunk of streamClaude([
        { role: "user", content: "TypeScript nedir?" }
    ])) {
        reply += chunk;
        process.stdout.write(chunk); // gerçek zamanlı yaz
    }
    console.log("\n\nToplam:", reply.length, "karakter");
}
```

<hr class="section-divider">

## 🏭 Real-World: Tam Claude Servisi

<div class="callout callout-real-world">

**🏭 Üretim Kalitesinde AI Servis Katmanı**

```typescript
class ClaudeService {
    private readonly baseUrl = "https://api.anthropic.com/v1/messages";
    private readonly defaultModel = "claude-sonnet-4-20250514";

    private get headers(): Record<string, string> {
        return {
            "Content-Type": "application/json",
            "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
            "anthropic-version": "2023-06-01"
        };
    }

    async complete(
        messages: ChatMessage[],
        options: ClaudeOptions = {}
    ): Promise<{ text: string; usage: ClaudeMessage["usage"] }> {
        const res = await fetch(this.baseUrl, {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify({
                model: options.model ?? this.defaultModel,
                max_tokens: options.maxTokens ?? 1024,
                system: options.systemPrompt,
                messages: messages.filter(m => m.role !== "system")
            })
        });

        if (!res.ok) this.throwApiError(res.status);

        const data = await res.json() as ClaudeMessage;

        return {
            text: data.content
                .filter((b): b is TextBlock => b.type === "text")
                .map(b => b.text)
                .join(""),
            usage: data.usage
        };
    }

    async *stream(
        messages: ChatMessage[],
        options: ClaudeOptions = {}
    ): AsyncGenerator<string> {
        const res = await fetch(this.baseUrl, {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify({
                model: options.model ?? this.defaultModel,
                max_tokens: options.maxTokens ?? 1024,
                system: options.systemPrompt,
                stream: true,
                messages: messages.filter(m => m.role !== "system")
            })
        });

        if (!res.ok || !res.body) this.throwApiError(res.status);

        yield* this.readStream(res.body!);
    }

    private async *readStream(
        body: ReadableStream<Uint8Array>
    ): AsyncGenerator<string> {
        const reader = body.getReader();
        const decoder = new TextDecoder();
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const lines = decoder.decode(value, { stream: true })
                    .split("\n")
                    .filter(l => l.startsWith("data: "));
                for (const line of lines) {
                    const raw = line.slice(6);
                    if (raw === "[DONE]") return;
                    try {
                        const event = JSON.parse(raw) as StreamEvent;
                        if (event.type === "content_block_delta" &&
                            event.delta.type === "text_delta") {
                            yield event.delta.text;
                        }
                    } catch { /* skip */ }
                }
            }
        } finally {
            reader.releaseLock();
        }
    }

    private throwApiError(status: number): never {
        const messages: Record<number, string> = {
            401: "API key geçersiz veya eksik",
            429: "Rate limit — lütfen bekle",
            500: "Claude API sunucu hatası",
            529: "Claude API aşırı yüklü"
        };
        throw new Error(messages[status] ?? `Claude API: ${status}`);
    }
}

// Kullanım
const claude = new ClaudeService();

// Tek yanıt
const { text, usage } = await claude.complete([
    { role: "user", content: "Merhaba!" }
], { systemPrompt: "Kısa ve net yanıtla." });

console.log(text);
console.log(`Kullanım: ${usage.input_tokens} giriş, ${usage.output_tokens} çıkış token`);

// Streaming
for await (const chunk of claude.stream([
    { role: "user", content: "TypeScript hakkında bir şey anlat." }
])) {
    process.stdout.write(chunk);
}
```

</div>

<hr class="section-divider">

## ✅ Best Practices

<div class="callout callout-tip">

**✅ Claude API Tipleme Best Practices:**
- `ContentBlock` discriminated union yaz — `type` alanı üzerinden daralt
- `stop_reason` switch'ini exhaustive yap — `max_tokens` durumunu mutlaka handle et
- API response'u `unknown` ile al, tek bir noktada `as ClaudeMessage` cast et
- Streaming için `AsyncGenerator<string>` kullan — `finally` içinde `releaseLock()`
- `ClaudeService` class'ı oluştur — retry, timeout, error handling merkezi

</div>

## ❌ Avoid

<div class="callout callout-danger">

**❌ Kaçınılması Gerekenler:**
```typescript
// ❌ content[0] doğrudan erişim — tool_use olabilir
const text = response.content[0].text; // ❌ TypeScript izin vermez — iyi!

// ❌ stop_reason kontrolü yapmadan devam
const reply = await callClaude(messages);
// Yanıt max_tokens nedeniyle kesilmiş olabilir — kullanıcı eksik yanıt alır

// ❌ Streaming'de tüm event'leri text varsaymak
const event = JSON.parse(raw); // message_start, content_block_start vb. de geliyor
yield event.delta.text; // ❌ delta.text olmayan event'lerde crash

// ❌ Her streaming satırı için ayrı request — chunk kümeleme yok
// ✅ Birden fazla satırı birlikte işle, buffer kullan
```

</div>

<hr class="section-divider">

## 📋 Özet

| Kavram | Tip | Ne zaman |
|--------|-----|----------|
| `ContentBlock` | Discriminated union | `content[]` içindeki her blok |
| `TextBlock` | `type: "text"` | Normal metin yanıtı |
| `ToolUseBlock` | `type: "tool_use"` | LLM tool çağırmak istiyor |
| `stop_reason` | `"end_turn" \| "tool_use" \| "max_tokens"` | Yanıt neden bitti? |
| `streamClaude()` | `AsyncGenerator<string>` | Chunk chunk metin al |
| `ClaudeService` | Class | Merkezi API katmanı |
