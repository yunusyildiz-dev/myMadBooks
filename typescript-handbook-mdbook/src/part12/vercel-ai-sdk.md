# Vercel AI SDK & Full-Stack Entegrasyon

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
Vercel AI SDK ile Next.js full-stack AI uygulaması. `streamText` ile Route Handler tipleme. `useChat` hook entegrasyonu. Token yönetimi ve maliyet takibi. Tüm öğrenilenlerin birleştiği kapstone stack.

</div>

---

## 📖 Vercel AI SDK Neden Kullanılır?

Manuel streaming implementasyonu yazmak yerine Vercel AI SDK:
- SSE stream → client-side state yönetimini otomatikleştirir
- `useChat` hook ile streaming UI hazır gelir
- TypeScript tipleri SDK ile birlikte gelir
- Multiple provider desteği: Claude, GPT-4o, Gemini aynı interface

```
Ekosistem:
ai               → core SDK (streamText, generateText)
@ai-sdk/anthropic → Claude provider
@ai-sdk/openai   → OpenAI provider
ai/react         → useChat, useCompletion React hooks
```

<hr class="section-divider">

## 📖 Next.js Route Handler — Backend

```typescript
// app/api/chat/route.ts
import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { type NextRequest } from "next/server";

// Request body tipi
interface ChatRequest {
    messages: Array<{
        role: "user" | "assistant";
        content: string;
    }>;
    systemPrompt?: string;
    model?: string;
}

export async function POST(req: NextRequest): Promise<Response> {
    const body = await req.json() as ChatRequest;
    const { messages, systemPrompt, model = "claude-sonnet-4-20250514" } = body;

    // streamText — provider-agnostic streaming
    const result = streamText({
        model: anthropic(model),
        system: systemPrompt ?? "Sen yardımcı bir TypeScript asistanısın.",
        messages,
        maxTokens: 1024,
        temperature: 0.7,
        onFinish: ({ text, usage }) => {
            // Streaming bitince çalışır — loglama, analytics
            console.log("Tamamlandı:", {
                chars: text.length,
                inputTokens: usage.promptTokens,
                outputTokens: usage.completionTokens
            });
        }
    });

    // DataStreamResponse — Vercel AI SDK'nın kendi protokolü
    return result.toDataStreamResponse();
}
```

### Multiple Provider Desteği

```typescript
// app/api/chat/route.ts — model seçimi ile
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { type LanguageModelV1 } from "ai";

type SupportedModel =
    | "claude-sonnet-4-20250514"
    | "claude-haiku-4-5-20251001"
    | "gpt-4o"
    | "gpt-4o-mini";

function getModel(modelId: SupportedModel): LanguageModelV1 {
    switch (modelId) {
        case "claude-sonnet-4-20250514":
            return anthropic("claude-sonnet-4-20250514");
        case "claude-haiku-4-5-20251001":
            return anthropic("claude-haiku-4-5-20251001");
        case "gpt-4o":
            return openai("gpt-4o");
        case "gpt-4o-mini":
            return openai("gpt-4o-mini");
    }
}

export async function POST(req: NextRequest): Promise<Response> {
    const { messages, model = "claude-sonnet-4-20250514" } = await req.json() as {
        messages: Array<{ role: "user" | "assistant"; content: string }>;
        model?: SupportedModel;
    };

    const result = streamText({
        model: getModel(model),
        messages,
        maxTokens: 1024
    });

    return result.toDataStreamResponse();
}
```

<hr class="section-divider">

## 📖 Frontend — useChat Hook

```typescript
// components/chat/ChatPage.tsx
"use client";

import { useChat } from "ai/react";
import { type FormEvent } from "react";

// SDK'nın Message tipi
interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

export default function ChatPage() {
    const {
        messages,         // Message[] — tüm konuşma
        input,            // string — input değeri
        handleInputChange, // ChangeEvent<HTMLInput> handler
        handleSubmit,     // FormEvent handler — otomatik API çağrısı
        isLoading,        // boolean — yanıt bekliyor
        error,            // Error | undefined
        stop,             // streaming'i durdur
        reload,           // son mesajı yeniden gönder
        setMessages       // konuşmayı sıfırla veya düzenle
    } = useChat({
        api: "/api/chat",
        initialMessages: [],
        onError: (err) => {
            console.error("Chat hatası:", err.message);
        },
        onFinish: (message) => {
            console.log("Mesaj tamamlandı:", message.content.length, "karakter");
        },
        body: {
            // Her requestte gönderilecek ekstra alanlar
            model: "claude-sonnet-4-20250514",
            systemPrompt: "Sen bir TypeScript uzmanısın."
        }
    });

    const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleSubmit(e);
    };

    return (
        <div className="chat">
            <div className="chat__messages">
                {messages.map((message: Message) => (
                    <div
                        key={message.id}
                        className={`message message--${message.role}`}
                    >
                        <strong>{message.role === "user" ? "Sen" : "AI"}</strong>
                        <p>{message.content}</p>
                    </div>
                ))}
                {isLoading && (
                    <div className="message message--assistant">
                        <span className="typing-indicator">▊</span>
                    </div>
                )}
                {error && (
                    <div className="chat__error">
                        Hata: {error.message}
                        <button onClick={() => reload()}>Tekrar dene</button>
                    </div>
                )}
            </div>

            <form onSubmit={handleFormSubmit} className="chat__input">
                <input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Sorunuzu yazın..."
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading || !input.trim()}>
                    {isLoading ? "Yanıtlanıyor..." : "Gönder"}
                </button>
                {isLoading && (
                    <button type="button" onClick={stop}>
                        Durdur
                    </button>
                )}
            </form>
        </div>
    );
}
```

<hr class="section-divider">

## 📖 Token Yönetimi & Maliyet Takibi

```typescript
// shared/utils/token.utils.ts

// Yaklaşık token sayımı — tiktoken olmadan
export function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
}

// Konuşma geçmişini token limitine göre buda
export function trimHistory(
    messages: ChatMessage[],
    maxTokens: number = 50000
): ChatMessage[] {
    let total = messages.reduce(
        (sum, msg) => sum + estimateTokens(msg.content),
        0
    );

    if (total <= maxTokens) return messages;

    const trimmed = [...messages];

    // System mesajını koru (ilk eleman), eskiden başlayarak sil
    while (total > maxTokens && trimmed.length > 1) {
        const removed = trimmed.splice(1, 1)[0];
        total -= estimateTokens(removed.content);
    }

    return trimmed;
}

// Maliyet hesaplama — model başına fiyatlar
interface TokenCost {
    inputTokens: number;
    outputTokens: number;
    totalCostUsd: number;
    formattedCost: string;
}

type ModelPricing = Record<string, { inputPer1M: number; outputPer1M: number }>;

const MODEL_PRICING: ModelPricing = {
    "claude-sonnet-4-20250514": { inputPer1M: 3.0, outputPer1M: 15.0 },
    "claude-haiku-4-5-20251001": { inputPer1M: 0.25, outputPer1M: 1.25 },
    "gpt-4o": { inputPer1M: 5.0, outputPer1M: 15.0 },
    "gpt-4o-mini": { inputPer1M: 0.15, outputPer1M: 0.60 }
};

export function calculateCost(
    inputTokens: number,
    outputTokens: number,
    model: string
): TokenCost {
    const pricing = MODEL_PRICING[model] ?? { inputPer1M: 3.0, outputPer1M: 15.0 };

    const totalCostUsd =
        (inputTokens / 1_000_000) * pricing.inputPer1M +
        (outputTokens / 1_000_000) * pricing.outputPer1M;

    return {
        inputTokens,
        outputTokens,
        totalCostUsd,
        formattedCost: `$${totalCostUsd.toFixed(6)}`
    };
}
```

<hr class="section-divider">

## 🏭 Real-World: Kapstone AI Chat Uygulaması

<div class="callout callout-real-world">

**🏭 Tam Stack — Next.js + Claude + RAG + TypeScript**

```
knowledge-base/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          → streamText — Vercel AI SDK
│   │   ├── documents/route.ts     → PDF upload + chunk + embed
│   │   └── search/route.ts        → RAG sorgusu
│   └── page.tsx
├── features/
│   ├── chat/
│   │   ├── chat.types.ts          → ChatMessage, ChatRequest
│   │   ├── claude.service.ts      → callClaude, streamClaude
│   │   └── useChat.ts             → custom hook
│   ├── documents/
│   │   ├── document.types.ts      → DocumentChunk, EmbeddingResult
│   │   ├── embedder.service.ts    → embedText, embedBatch
│   │   └── chunker.ts             → splitText
│   └── rag/
│       ├── rag.types.ts           → RetrievalResult, RAGResult
│       ├── vector.store.ts        → VectorStore interface
│       └── rag.service.ts         → RAGService.query()
└── shared/
    ├── types/
    │   ├── api.types.ts           → ApiResponse<T>, Result<T>
    │   └── claude.types.ts        → ContentBlock, ClaudeMessage
    └── utils/
        ├── fetch.utils.ts         → typedFetch<T>
        └── token.utils.ts         → estimateTokens, calculateCost
```

**Route handler with RAG:**

```typescript
// app/api/chat/route.ts — RAG entegreli
import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { RAGService } from "@features/rag/rag.service";
import { InMemoryVectorStore } from "@features/rag/vector.store";

const ragService = new RAGService(new InMemoryVectorStore());

export async function POST(req: NextRequest): Promise<Response> {
    const { messages, useRAG = false } = await req.json() as {
        messages: Array<{ role: "user" | "assistant"; content: string }>;
        useRAG?: boolean;
    };

    const lastUserMessage = messages[messages.length - 1];
    let systemPrompt = "Sen yardımcı bir asistansın.";

    // RAG: context bul ve system prompt'a ekle
    if (useRAG && lastUserMessage?.role === "user") {
        const ragResult = await ragService.query(lastUserMessage.content, {
            topK: 3,
            similarityThreshold: 0.6
        });

        if (ragResult.sources.length > 0) {
            const context = ragResult.sources
                .map(s => s.content)
                .join("\n\n---\n\n");

            systemPrompt = `Sen belge tabanlı bir asistansın.
Aşağıdaki belgelerden yararlanarak yanıt ver:

${context}

Bağlamda olmayan sorular için açıkça belirt.`;
        }
    }

    const result = streamText({
        model: anthropic("claude-sonnet-4-20250514"),
        system: systemPrompt,
        messages,
        maxTokens: 1024,
        onFinish: ({ usage }) => {
            const cost = calculateCost(
                usage.promptTokens,
                usage.completionTokens,
                "claude-sonnet-4-20250514"
            );
            console.log(`Maliyet: ${cost.formattedCost}`);
        }
    });

    return result.toDataStreamResponse();
}
```

</div>

<hr class="section-divider">

## ✅ Best Practices

<div class="callout callout-tip">

**✅ Vercel AI SDK & Full-Stack Best Practices:**
- `streamText` + `toDataStreamResponse()` kullan — manuel SSE yazmaya gerek yok
- `useChat` body prop ile sabit parametreler gönder (model, systemPrompt)
- `onFinish` callback'inde token kullanımı logla — maliyet takibi için
- `trimHistory` ile geçmişi budama — her mesajda token sayısını kontrol et
- Tip paylaşımı: frontend ve backend aynı `ChatMessage` interface'ini import etsin
- Model seçimini exhaustive switch ile yönet — yeni model eklince derleme uyarısı

</div>

## ❌ Avoid

<div class="callout callout-danger">

**❌ Kaçınılması Gerekenler:**
```typescript
// ❌ API key'i client-side'a sızdırmak
// useChat içinde doğrudan Anthropic API çağrısı yapma
// Her zaman server-side route handler üzerinden git

// ❌ trimHistory olmadan sonsuz geçmiş
const result = streamText({ messages: allMessages }); // ❌ 100 mesaj sonra token overflow
// ✅ messages: trimHistory(allMessages, 50000)

// ❌ Her model için farklı API çağrısı mantığı
if (model === "claude") { callClaude(...) }
else if (model === "gpt4") { callOpenAI(...) }
// ✅ Vercel AI SDK provider abstraction kullan

// ❌ useChat'i server component'te kullanmak
// useChat "use client" direktifi gerektirir — hook

// ❌ Maliyet takibi olmadan prodüksiyona çıkmak
// onFinish içinde mutlaka token kullanımını logla
```

</div>

<hr class="section-divider">

## 📋 Özet — Fullstack AI Developer Roadmap

```
Pillar 1: Frontend & Backend (6-8 hafta)
  ✅ TypeScript + React — Bu kitap (Part 1-11)
  → React Query, Form yönetimi (Zod), WebSocket

Pillar 2: AI Entegrasyonu (6-8 hafta)
  ✅ Claude API tipleme — Part 12/2
  ✅ Tool Use & Agent — Part 12/3
  ✅ Vercel AI SDK — Part 12/5
  → Prompt engineering, token yönetimi

Pillar 3: RAG (4-6 hafta)
  ✅ RAG Pipeline tipleme — Part 12/4
  → ChromaDB, pgvector üretim kurulumu

Pillar 4: Agent (3-4 hafta)
  ✅ Agentic loop — Part 12/3
  → Tavily web search, multi-step agent

Kapstone: AI Knowledge Base
  Next.js + TypeScript + Claude + pgvector + RAG + Agent
```

| Teknoloji | Kullanım | TypeScript Desteği |
|-----------|----------|--------------------|
| Vercel AI SDK | streamText, useChat | Tam — tüm tipler dahil |
| Anthropic SDK | callClaude, streaming | Tam — ContentBlock tipleri |
| OpenAI SDK | GPT-4o, embeddings | Tam — aynı interface |
| pgvector | Vector arama | VectorStore interface |
| Next.js App Router | Route Handler | NextRequest, Response |
