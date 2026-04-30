# CLAUDE.md

Bu dosya Claude Code'un her oturumda otomatik okuduğu bağlam dosyasıdır.
Projeye her başladığında bu dosyayı oku, sonra `project-spec.md` dosyasını oku.

---

## Proje Nedir?

**Job-Targeted Resume Builder** — Kullanıcıların CV'lerini iş ilanlarına göre AI ile optimize eden bir SaaS web uygulaması.

Temel akış:
1. Kullanıcı CV'sini yükler (PDF) veya kayıtlı profilinden seçer
2. İş ilanı metnini yapıştırır (sadece text — URL scraping yok)
3. AI (GPT-4o-mini) CV'yi o ilana göre optimize eder (2 adımlı: parse → optimize)
4. ATS uyum skoru + keyword analizi gösterilir
5. Optimize CV PDF veya düz metin olarak kopyalanır
6. Pro kullanıcılar Cover Letter ve LinkedIn Optimizer özelliklerini kullanır

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **Database + Auth:** Supabase
- **AI:** OpenAI GPT-4o-mini (`lib/gemini.ts` — dosya adı eski, içerik OpenAI)
- **PDF Export:** @react-pdf/renderer + Roboto font (jsDelivr CDN — Türkçe karakter desteği)
- **PDF Import:** pdf-parse v1.1.1 (CJS, `serverComponentsExternalPackages`'da)
- **Ödeme:** Paddle (Türkiye uyumlu MOR) — henüz entegre edilmedi
- **Deploy:** Vercel

---

## Kritik Kurallar

### Asla yapma
- `any` tipi kullanma
- `console.log` bırakma (sadece `console.error` try/catch içinde)
- TODO / FIXME yorum bırakma
- Hardcode fiyat veya limit yazma → `lib/constants/index.ts` kullan
- Stripe kullanma → Türkiye'de çalışmıyor
- URL scraping → kaldırıldı, iş ilanı sadece metin olarak girilir
- OpenAI API key'i client tarafında kullanma
- Paddle webhook'larını imza doğrulamasız işleme
- Plan kontrolünü client'tan gelen veriye dayandırma

### Her zaman yap
- Her async işlemde loading state göster
- Her butonda double-submit engelle
- Hata mesajlarını kullanıcı dilinde yaz, teknik hata kodu gösterme
- Plan kontrolünü Supabase'den çekerek server tarafında yap
- Tüm AI çıktıları İngilizce olsun
- `lib/plan-guard.ts` helper'larını kullan: `isPro(is_pro)`, `hasCredits(credits)`

---

## Plan Yapısı

| Plan | Fiyat | Optimizasyon | Cover Letter | LinkedIn | CV Profili |
|---|---|---|---|---|---|
| Free | $0 | 1 hak | ❌ | ❌ | Birden fazla |
| Starter | $5 tek | 5 hak | ❌ | ❌ | Birden fazla |
| Pro | $12/ay | Sınırsız | ✅ | ✅ | Sınırsız |
| Lifetime | $79 tek | Sınırsız | ✅ | ✅ | Sınırsız |

---

## Veritabanı Tabloları

- `auth.users` — Supabase Auth (otomatik)
- `resumes` — Kayıtlı CV profilleri (`id, user_id, name, original_filename, original_text, is_default, created_at`)
- `optimizations` — Optimizasyon geçmişi (`id, user_id, resume_id, job_title, job_company, optimized_cv_json, ats_score, ats_keywords, tips, cover_letter, linkedin_suggestions, created_at`)
- `user_credits` — Kullanıcı kredisi ve pro durumu (`id, user_id, credits, is_pro, pro_expires_at, updated_at`)

**Dikkat:** Tablo adı `user_credits`'tir, `user_plans` değil.

### DB Migration (Supabase SQL Editor'da çalıştırılması gerekiyor)
```sql
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS is_default boolean DEFAULT false;
ALTER TABLE optimizations ADD COLUMN IF NOT EXISTS cover_letter text;
ALTER TABLE optimizations ADD COLUMN IF NOT EXISTS linkedin_suggestions jsonb;
```

---

## Sayfalar

```
/                              → Landing page (auth-aware navbar, kullanıcı avatar + sign out)
/login                         → Giriş + Kayıt sayfası (?view=signup destekli)
/app/upload                    → Kayıtlı CV'leri listele VEYA yeni PDF yükle
/app/job                       → İş ilanı metni gir (sadece textarea)
/app/processing                → AI işlem loading animasyonu
/app/results/[id]              → Tüm sonuçlar + 5 gelişmiş özellik (bakınız aşağıda)
/app/results/[id]/cover-letter → Cover letter üret/düzenle/kopyala (Pro)
/app/results/[id]/linkedin     → LinkedIn Headline/About/Skills önerileri (Pro)
/dashboard                     → Optimizasyon geçmişi + kullanıcı bilgisi
```

---

## API Endpoints

```
POST /api/parse-pdf           → PDF metni çıkar, resumes tablosuna kaydet
POST /api/optimize            → CV + iş ilanı → GPT-4o-mini optimize (kredi düşer)
POST /api/refine              → Seçili keyword'lerle CV'yi yeniden optimize (KREDİ DÜŞMEZ)
POST /api/cover-letter        → Cover letter üret (Pro, kredi düşmez)
POST /api/linkedin-optimize   → LinkedIn önerileri üret (Pro, kredi düşmez)
GET  /api/download-pdf        → PDF oluştur ve döndür
GET  /api/resumes             → Kullanıcının kayıtlı CV'lerini listele
DELETE /api/resumes?id=xxx    → CV sil
GET  /api/credits/check       → Kredi ve pro durumu
POST /api/scrape-url          → Eski, şu an kullanılmıyor (silinebilir)
POST /api/paddle/webhook      → Paddle ödeme webhook (henüz tam entegre değil)
```

---

## Results Sayfası Özellikleri

`/app/results/[id]` sayfası `ResultsClient.tsx` client component'i üzerinden çalışır.

### Mevcut özellikler:
1. **Missing Keywords Checkbox + Regenerate** — Kullanıcı bildiği keyword'leri seçer, `/api/refine` çağrılır, kredi düşmez, keyword listesi korunur (sadece seçilenler matched'a geçer)
2. **Before/After Toggle** — Optimized vs Original CV görünümü (fade animasyonu)
3. **Copy as Text** — Optimize CV'yi formatlanmış düz metin olarak clipboard'a kopyalar
4. **Application Checklist** — localStorage tabanlı, Cover Letter/LinkedIn/Applied to Job durumu
5. **Score Breakdown** — 3 kategoride progress bar (Keyword Match, Experience Relevance, Skills Alignment)

---

## AI Pipeline — Kritik Detaylar

### 2 Adımlı CV İşleme (`lib/gemini.ts`)

```
optimizeResume(rawCvText, jobDescription, selectedKeywords?)
    ↓
  parseRawCvText(rawText)          ← Adım 1: Ham PDF metnini yapılandır
    - detectWorkStructure()         ← Sütun layout tespiti (pre-section title)
    - buildStructureHint()          ← Şirket↔pozisyon mapping'i AI'a ver
    - AI çağrısı (temperature=0)
    - enforceCorrectMapping()       ← Programatik doğrulama
    - sortByDate()                  ← En yeni deneyim en üste
    ↓
  formatParsedCvForPrompt()        ← Temiz yapılandırılmış metin
    ↓
  Optimization prompt (temperature=0.2)
    - Fuzzy keyword matching (Microservices → Microservices Technologies)
    - selectedKeywords entegrasyonu
    - sortByDate() final check
```

**Neden bu kadar karmaşık?** İki sütunlu PDF'lerde `pdf-parse` metni karışık sırayla çıkarıyor: iş tanımı maddeleri şirket adından ÖNCE geliyor. Programatik tespit + AI hint bu sorunu çözüyor.

### Deneyim Sıralaması
`sortByDate()` her zaman en son tarihe göre sıralar:
- "Present"/"Now"/"Current" → her zaman ilk sıraya
- Diğerleri → start date azalan sıra

---

## Klasör Yapısı (Önemli Dosyalar)

```
resume-builder/
├── app/
│   ├── page.tsx                    → Landing (server, auth-aware)
│   ├── login/page.tsx              → Login + Signup
│   ├── app/
│   │   ├── upload/page.tsx         → CV seç veya yükle (client)
│   │   ├── job/page.tsx            → İş ilanı textarea (client)
│   │   ├── processing/page.tsx     → Loading animasyonu (client)
│   │   └── results/[id]/
│   │       ├── page.tsx            → Server: veri çek, ResultsClient'a ilet
│   │       ├── ResultsClient.tsx   → Client: tüm interactive özellikler
│   │       ├── cover-letter/page.tsx
│   │       └── linkedin/page.tsx
│   ├── api/
│   │   ├── optimize/route.ts       → Ana optimizasyon (kredi düşer)
│   │   ├── refine/route.ts         → Keyword refinement (kredi düşmez)
│   │   ├── cover-letter/route.ts
│   │   ├── linkedin-optimize/route.ts
│   │   ├── parse-pdf/route.ts
│   │   ├── download-pdf/route.ts
│   │   ├── resumes/route.ts
│   │   └── credits/check/route.ts
│   └── dashboard/page.tsx
├── components/
│   ├── AtsScoreRing.tsx
│   ├── CvPreview.tsx
│   ├── FileUploader.tsx
│   ├── LandingNavbar.tsx           → Client, user avatar + sign out dropdown
│   ├── SignOutButton.tsx
│   └── UpgradeModal.tsx
├── lib/
│   ├── gemini.ts                   → OpenAI entegrasyonu (dosya adı eski)
│   ├── pdf-generator.tsx           → @react-pdf/renderer, Roboto font
│   ├── pdf-parser.ts               → pdf-parse v1.1.1
│   ├── plan-guard.ts               → isPro(), hasCredits()
│   ├── rate-limit.ts               → In-memory rate limit (3/dakika)
│   ├── supabase/client.ts + server.ts
│   └── constants/index.ts
├── types/index.ts                  → Tüm TypeScript interface'leri
└── middleware.ts                   → /app/* ve /dashboard/* auth guard
```

---

## Renk Paleti

```
Primary:    #1E3A5F (koyu lacivert)
Background: #F8FAFC (açık gri)
Surface:    #FFFFFF (beyaz)
Font:       Inter
```

---

## Yapılacaklar (Kalan)

### 🟡 Ödeme Sistemi
- Paddle entegrasyonu (henüz yapılmadı)
- Fiyatlandırma sayfasında satın alma flow'u
- Webhook'ta kredi yükleme + pro aktivasyonu
- Lifetime plan ($79)

### 🟡 Küçük İyileştirmeler
- Dashboard'a kayıtlı CV profili yönetimi (silme, yeniden adlandırma)
- Optimizasyon geçmişinde sayfalama (şu an hepsi yükleniyor)
- Cover letter PDF indirme

---

## Sık Sorulan Sorular

**Neden Stripe yok?**
Türkiye'de çalışmıyor. Paddle kullanıyoruz.

**Neden URL scraping yok?**
LinkedIn, Indeed gibi siteler bot engelliyor. Kullanıcı ilanı kopyalayıp yapıştırıyor.

**AI hangi dilde cevap veriyor?**
Her zaman İngilizce. `lib/gemini.ts`'deki tüm promptlar "All responses must be in English only" içeriyor.

**Cover Letter ve Refine kredi harcıyor mu?**
Hayır. Sadece `/api/optimize` kredi düşer. Cover letter, LinkedIn, Refine ücretsiz.

**PDF dosyası Supabase'de saklanıyor mu?**
Hayır. Sadece metin içeriği `resumes.original_text` alanında tutuluyor.

**lib/gemini.ts neden Gemini değil OpenAI kullanıyor?**
İlk başta Google Gemini planlanmıştı, sonra OpenAI'ye geçildi. Dosya adı tarihsel nedenle kaldı, içerik tamamen OpenAI GPT-4o-mini kullanıyor.

**PDF'te Türkçe karakterler (İ, ğ, ş) bozuluyor mu?**
Hayır. Roboto font jsDelivr CDN'den yükleniyor, tam Unicode desteği var.
