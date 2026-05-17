# Import/Export Pratikleri & Path Alias

<div class="callout callout-info">

**📘 Bu Bölümde Öğreneceklerin**
Import alias (as), path alias (@/ prefix) ve tsconfig.json konfigürasyonu. Büyük projelerde klasör organizasyonu ve feature-based mimari. Gerçek Next.js proje yapısı örneği.

</div>

---

## 📖 Import Alias (as) — İsim Çakışması Çözümü

Farklı modüllerden aynı isimde şeyler import edildiğinde `as` ile yeniden isimlendirilir:

```typescript
// İki farklı modülden aynı isim
import { add as addNumbers } from "./math";
import { add as addItems } from "./cart";        // isim çakışması önlendi

// Kısaltma
import { reallyLongUtilityFunctionName as shortFn } from "./utils";

// Namespace import — tüm export'ları tek obje altında topla
import * as DateUtils from "./date-utils";
import * as MathUtils from "./math";

DateUtils.format("2024-01-01");
MathUtils.multiply(4, 5);

// Default export için convention — dosya adıyla aynı isim ver
import UserService from "./UserService";     // ✅ açık
import MyService from "./UserService";       // ⚠️ belirsiz — kaçın
```

<hr class="section-divider">

## 📖 Path Alias — @/ ile Kısa Import

Büyük projelerde relative path'ler uzar ve kırılgan hale gelir. Path alias ile kısaltılır:

```typescript
// ❌ Relative path — klasör taşınırsa bozulur
import { UserService } from "../../../features/users";
import { formatDate } from "../../shared/utils/date";
import type { ApiResponse } from "../../../shared/types/api";

// ✅ Path alias — her yerden aynı, klasör taşınsa bile geçerli
import { UserService } from "@features/users";
import { formatDate } from "@shared/utils/date";
import type { ApiResponse } from "@shared/types";
```

### tsconfig.json Konfigürasyonu

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@features/*": ["src/features/*"],
      "@shared/*": ["src/shared/*"],
      "@components/*": ["src/components/*"],
      "@types/*": ["src/types/*"]
    }
  }
}
```

### Vite Konfigürasyonu (vite.config.ts)

```typescript
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "@features": path.resolve(__dirname, "./src/features"),
            "@shared": path.resolve(__dirname, "./src/shared"),
            "@components": path.resolve(__dirname, "./src/components")
        }
    }
});
```

<div class="callout callout-warning">

**⚠️ İki Yerde Tanımla**

Path alias hem `tsconfig.json`'da (TypeScript için) hem de build tool config'inde (Vite, Webpack) tanımlanmalıdır. Sadece birinde tanımlarsan diğeri hata verir.

</div>

<hr class="section-divider">

## 📖 Feature-Based Proje Yapısı

Büyük projelerde "feature-based" (özellik bazlı) klasör organizasyonu en yaygın pratiktir. Her özellik kendi klasöründe yaşar ve bir `index.ts` ile dışarıya açılır:

```
src/
├── app/                        ← Next.js App Router
│   ├── api/
│   │   ├── chat/route.ts       ← POST /api/chat
│   │   ├── documents/route.ts  ← POST /api/documents
│   │   └── users/route.ts      ← GET/POST /api/users
│   └── page.tsx
│
├── features/
│   ├── chat/
│   │   ├── chat.service.ts     ← AI API çağrıları
│   │   ├── chat.types.ts       ← Message, Conversation tipleri
│   │   ├── chat.hooks.ts       ← useChat, useConversation
│   │   └── index.ts            ← barrel export — public API
│   │
│   ├── users/
│   │   ├── user.entity.ts
│   │   ├── user.service.ts
│   │   ├── user.repository.ts
│   │   ├── user.types.ts
│   │   └── index.ts
│   │
│   └── auth/
│       ├── auth.service.ts
│       ├── auth.types.ts
│       └── index.ts
│
├── shared/
│   ├── types/
│   │   ├── api.types.ts        ← ApiResponse<T>, PaginatedResponse<T>
│   │   └── index.ts
│   ├── utils/
│   │   ├── date.utils.ts
│   │   ├── token.utils.ts
│   │   └── index.ts
│   └── hooks/
│       ├── useLocalStorage.ts
│       └── index.ts
│
└── components/
    ├── ui/                     ← shadcn/ui bileşenleri
    ├── chat/
    │   ├── ChatMessage.tsx
    │   ├── ChatInput.tsx
    │   └── index.ts
    └── layout/
        ├── Header.tsx
        └── index.ts
```

### Barrel Export İçeriği

```typescript
// features/chat/index.ts — public API
export { ChatService } from "./chat.service";
export { useChat, useConversation } from "./chat.hooks";
export type {
    Message,
    Conversation,
    CreateMessageDto,
    ChatStreamEvent
} from "./chat.types";

// İç implementation dışarıya kapalı:
// chat.service.ts'nin DB katmanı, internal helpers vs.
```

### Tüm Import Pattern'leri

```typescript
// Named import
import { ChatService } from "@features/chat";

// Named import + alias
import { ChatService as CS } from "@features/chat";

// Tip import — bundle'a girmez
import type { Message } from "@features/chat";

// Tip + değer aynı satırda
import { ChatService, type Message } from "@features/chat";

// Namespace import
import * as ChatFeature from "@features/chat";

// Dynamic import (lazy loading)
const { ChatService } = await import("@features/chat");
```

<hr class="section-divider">

## 🏭 Real-World: API Route ile Feature Import

<div class="callout callout-real-world">

**🏭 Next.js API Route'ta Feature Kullanımı**

```typescript
// app/api/chat/route.ts
import { ChatService, type CreateMessageDto } from "@features/chat";
import type { ApiResponse } from "@shared/types";
import { validateRequest } from "@shared/utils";

export async function POST(request: Request): Promise<Response> {
    try {
        const body: CreateMessageDto = await request.json();
        const result = await validateRequest(body);
        if (!result.success) {
            const errorResponse: ApiResponse<null> = {
                data: null,
                success: false,
                message: result.error,
                timestamp: new Date().toISOString()
            };
            return Response.json(errorResponse, { status: 400 });
        }

        const service = new ChatService();
        const message = await service.processMessage(body);

        const successResponse: ApiResponse<typeof message> = {
            data: message,
            success: true,
            message: "Mesaj işlendi",
            timestamp: new Date().toISOString()
        };
        return Response.json(successResponse);

    } catch (error) {
        return Response.json(
            { success: false, message: "Sunucu hatası" },
            { status: 500 }
        );
    }
}
```

```typescript
// components/chat/ChatMessage.tsx
import type { Message } from "@features/chat";
import { formatDate } from "@shared/utils";

interface Props {
    message: Message;
}

export function ChatMessageComponent({ message }: Props) {
    return (
        <div className={`message ${message.role}`}>
            <p>{message.content}</p>
            <small>{formatDate(message.createdAt)}</small>
        </div>
    );
}
```

</div>

<hr class="section-divider">

## ✅ Best Practices

<div class="callout callout-tip">

**✅ Import/Export & Path Alias Best Practices:**
- `@/` prefix convention — Next.js ve Vite'ta yaygın
- Her feature klasörüne `index.ts` koy — tek giriş noktası
- Hiçbir zaman internal dosyaya doğrudan import yapma — barrel kullan
- 3-5 alias yeterli — çok fazla alias karmaşıklık yaratır
- `tsconfig.json` ve build tool'da ikisinde de tanımla
- Circular import'tan kaçın — feature'lar arası bağımlılıkları tek yönde tut

</div>

## ❌ Avoid

<div class="callout callout-danger">

**❌ Kaçınılması Gerekenler:**
```typescript
// ❌ Çok derin relative path — kırılgan ve okunaksız
import { formatDate } from "../../../../shared/utils/date/format";

// ❌ İç dosyaya doğrudan import — encapsulation ihlali
import { ChatRepository } from "../features/chat/chat.repository";
// ✅ Barrel üzerinden:
import { ChatService } from "@features/chat";

// ❌ Circular import — A, B'yi; B, A'yı import ediyor
// features/chat/index.ts → features/auth/index.ts → features/chat/index.ts

// ❌ Çok büyük barrel — her şeyi tek index.ts'de toplamak
// src/index.ts — tüm app'i tek dosyadan export etmek — tree-shaking bozulur

// ❌ Path alias olmadan büyük proje
import something from "../../../../../../../deep/path"; // ❌ okunamaz
```

</div>

<hr class="section-divider">

## 📋 Özet

| Kavram | Syntax | Kullanım |
|--------|--------|----------|
| Import alias | `import { fn as myFn }` | İsim çakışması önleme |
| Path alias | `@features/chat` | Uzun relative path yerine |
| tsconfig paths | `"@/*": ["src/*"]` | TypeScript'e alias tanıt |
| Barrel export | `index.ts` → `export { X } from "./x"` | Feature public API |
| Feature-based | Her özellik kendi klasöründe | Büyük proje organizasyonu |

**Karar ağacı:**
```
Birden fazla şey export edilecek?    → named export
Tek ana şey export edilecek?         → default (React component)
Sadece tip mi?                       → export type / import type
Aynı klasörden çok import mu?        → barrel export (index.ts)
Relative path çok uzun mu?          → path alias (@/)
Büyük kütüphane, nadiren kullanılır? → dynamic import
```
