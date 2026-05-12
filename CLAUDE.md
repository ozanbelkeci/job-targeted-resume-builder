# CLAUDE.md

Bu dosya Claude Code'un her oturumda otomatik okuduğu bağlam dosyasıdır.
Projeye her başladığında bu dosyayı oku, sonra `project-spec.md` dosyasını oku.

---

## Proje Nedir?

**Coversume** — Kullanıcıların CV'lerini iş ilanlarına göre AI ile optimize eden bir SaaS web uygulaması.

Temel akış:
1. Kullanıcı CV'sini yükler (PDF) veya kayıtlı profilinden seçer
2. Yükleme sırasında opsiyonel profil formu doldurur (hedef rol, deneyim seviyesi, çalışma şekli, sektör)
3. İş ilanı metnini yapıştırır (sadece text — URL scraping yok)
4. AI (GPT-4o-mini) CV'yi o ilana göre optimize eder (2 adımlı: parse → optimize)
5. ATS uyum skoru + keyword analizi gösterilir
6. Kullanıcı CV'yi inline olarak düzenler, ATS skoru anlık güncellenir
7. Seçili template (Classic / Modern / Minimal) + renk paletiyle PDF indirilir
8. Pro kullanıcılar Cover Letter ve LinkedIn Optimizer özelliklerini kullanır

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **Database + Auth:** Supabase
- **AI:** OpenAI GPT-4o-mini (`lib/gemini.ts` — dosya adı eski, içerik OpenAI)
- **PDF Export:** @react-pdf/renderer + Roboto font (jsDelivr CDN — Türkçe karakter desteği)
- **PDF Import:** pdf-parse v1.1.1 (CJS, `serverComponentsExternalPackages`'da)
- **Drag & Drop:** @dnd-kit/core + @dnd-kit/sortable (bullet reordering)
- **Debounce:** lodash.debounce (inline edit score recalc)
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
- `resumes` — Kayıtlı CV profilleri (`id, user_id, name, original_filename, original_text, is_default, storage_path, target_role_types, experience_level, work_arrangement, target_industry, created_at`)
- `optimizations` — Optimizasyon geçmişi (`id, user_id, resume_id, job_title, job_company, optimized_cv_json, ats_score, ats_keywords, tips, cover_letter, linkedin_suggestions, created_at`)
- `user_credits` — Kullanıcı kredisi ve pro durumu (`id, user_id, credits, is_pro, pro_expires_at, updated_at`)

**Dikkat:** Tablo adı `user_credits`'tir, `user_plans` değil.

### DB Migrations (Supabase SQL Editor'da çalıştırılması gerekiyor)
```sql
-- Orijinal
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS is_default boolean DEFAULT false;
ALTER TABLE optimizations ADD COLUMN IF NOT EXISTS cover_letter text;
ALTER TABLE optimizations ADD COLUMN IF NOT EXISTS linkedin_suggestions jsonb;

-- Upload profil formu
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS target_role_types text[];
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS experience_level text;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS work_arrangement text[];
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS target_industry text;
```

---

## Sayfalar

```
/                              → Landing page (auth-aware navbar, kullanıcı avatar + sign out)
/login                         → Giriş + Kayıt sayfası (?view=signup destekli)
/app/upload                    → CV seç veya yükle + opsiyonel profil context formu
/app/job                       → İş ilanı metni gir (sadece textarea)
/app/processing                → AI işlem loading animasyonu
/app/results/[id]              → Tüm sonuçlar + inline editing + template seçici
/app/results/[id]/cover-letter → Cover letter üret/düzenle/kopyala (Pro)
/app/results/[id]/linkedin     → LinkedIn Headline/About/Skills önerileri (Pro)
/dashboard                     → Optimizasyon geçmişi + kullanıcı bilgisi
```

---

## API Endpoints

```
POST  /api/parse-pdf                    → PDF metni çıkar, resumes tablosuna kaydet (profil context dahil)
POST  /api/optimize                     → CV + iş ilanı → GPT-4o-mini optimize (kredi düşer)
POST  /api/refine                       → Seçili keyword'lerle CV'yi yeniden optimize (KREDİ DÜŞMEZ)
POST  /api/cover-letter                 → Cover letter üret (Pro, kredi düşmez)
POST  /api/linkedin-optimize            → LinkedIn önerileri üret (Pro, kredi düşmez)
GET   /api/download-pdf                 → PDF oluştur ve döndür (?id=&template=&color=)
GET   /api/resumes                      → Kullanıcının kayıtlı CV'lerini listele
DELETE /api/resumes?id=xxx              → CV sil
GET   /api/credits/check               → Kredi ve pro durumu
PATCH /api/optimizations/[id]/update   → Inline edit sonrası CV + skor kaydet
POST  /api/scrape-url                  → Eski, kullanılmıyor (silinebilir)
POST  /api/paddle/webhook              → Paddle ödeme webhook (henüz tam entegre değil)
```

---

## Results Sayfası Özellikleri

`/app/results/[id]` sayfası `ResultsClient.tsx` client component'i üzerinden çalışır.

### Mevcut özellikler:
1. **Missing Keywords Checkbox + Regenerate** — Kullanıcı bildiği keyword'leri seçer, `/api/refine` çağrılır
2. **Before/After Toggle** — Optimized vs Original CV görünümü (fade animasyonu)
3. **Copy as Text** — Optimize CV'yi formatlanmış düz metin olarak clipboard'a kopyalar
4. **Application Checklist** — localStorage tabanlı, Cover Letter/LinkedIn/Applied to Job durumu
5. **Score Breakdown** — 3 kategoride progress bar (Keyword Match, Experience Relevance, Skills Alignment)
6. **Inline CV Editing** — Summary, skills, bullets, job title, iletişim bilgileri, yeni deneyim ekleme/silme
7. **Live ATS Score** — Düzenleme yapıldıkça client-side anlık skor güncelleme (debounce 600ms)
8. **Save Changes** — PATCH endpoint'e kayıt, unsaved changes guard
9. **Template Seçici** — Classic / Modern / Minimal + 4'er renk paleti, localStorage'a kaydedilir
10. **Animated Score Ring** — Skor değiştiğinde animasyonlu sayaç

---

## Inline Editing Sistemi

### Düzenlenebilir alanlar (`EditableCvPreview.tsx`)
- **Job Title** — İsmin altında, inline input (click-to-edit)
- **İletişim bilgileri** — Her item düzenlenebilir, silinebilir; + butonu ile yeni eklenebilir
- **Professional Summary** — Click-to-edit textarea (auto-resize)
- **Experience bullets** — @dnd-kit ile sürükle-bırak sıralama, inline edit, ekle/sil
- **Yeni deneyim ekleme** — Başlık + Şirket + Başlangıç/Bitiş tarihi formu
- **Deneyim silme** — Her entry'de çöp kutusu ikonu
- **Skills** — Chip üzerinde × ile silme, + ile ekleme; kategorili skills için dropdown

### Düzenlenemeyen alanlar (şimdilik)
- İsim, eğitim

### Live ATS Skoru (`lib/ats-calculator.ts`)
```
calculateLiveScore(editedCv, originalMatched, originalMissing)
```
- `originalMatched` keyword'leri HİÇ yeniden değerlendirmez (sabit matched)
- Sadece `originalMissing` keyword'leri editedCv metninde aranır
- Teknik keyword filtresi: `isTechnicalKeyword()` — sayı içeren ifadeler, generic kelimeler elenir
- Fuzzy match: R1 (substring) + R2 (per-significant-word ≥4 char)
- `GENERIC_WORDS` → `lib/constants/ats-config.ts`
- Summary/bullets değişiminde debounce: 600ms; skill ekle/çıkar: anlık

---

## CV Template Sistemi

### Şablonlar (`lib/cv-templates/`)
| Template | Karakter | Varsayılan Renk |
|---|---|---|
| Classic | Kurumsal, serif-style, merkezi header | `#2C2C2C` (Charcoal) |
| Modern | Sol accent bar (3px), sol hizalı, tech-friendly | `#1E3A5F` (Navy) |
| Minimal | Büyük isim, bol whitespace, minimal header | `#111111` (Black) |

### Renk paletleri (`lib/cv-templates/index.ts`, `COLOR_PALETTES`)
- Her template için 4 renk seçeneği
- Template değişince renk default'a sıfırlanır
- `localStorage`'a kaydedilir (`preferred-cv-template`, `preferred-cv-color`)

### PDF download
`GET /api/download-pdf?id=xxx&template=modern&color=%231E3A5F`
- Renk ve template query param olarak geçilir
- `lib/pdf-generator.tsx` → template'e göre ClassicDocument / ModernDocument / MinimalDocument'a yönlendirir

### Web önizleme
`EditableCvPreview` → `theme: CvTheme` prop alır → `SectionTitle` ve renk uygulaması template'e göre değişir

---

## AI Pipeline — Kritik Detaylar

### 2 Adımlı CV İşleme (`lib/gemini.ts`)

```
optimizeResume(rawCvText, jobDescription, selectedKeywords?, tipContexts?, generalContext?, candidateContext?)
    ↓
  parseRawCvText(rawText)          ← Adım 1: Ham PDF metnini yapılandır
    - detectWorkStructure()         ← Sütun layout tespiti
    - buildStructureHint()          ← Şirket↔pozisyon mapping'i AI'a ver
    - AI çağrısı (temperature=0)
    - enforceCorrectMapping()       ← Programatik doğrulama
    - sortByDate()                  ← En yeni deneyim en üste
    ↓
  formatParsedCvForPrompt()        ← Temiz yapılandırılmış metin
    ↓
  Optimization prompt (temperature=0.2)
    - 11 kural (ATS uyum, bullet yapısı, summary, skills kategorisi vb.)
    - candidateContext block (hedef rol, deneyim seviyesi, sektör — upload formundan)
    - selectedKeywords entegrasyonu
    - Metric tip kuralı: hiç metrik yoksa otomatik tip üretir
    - sortByDate() final check
    ↓
  correctKeywords()                ← Programatik fuzzy keyword düzeltmesi
```

### Optimizasyon Prompt Çıktısı (JSON)
```json
{
  "job_title": "string",
  "job_company": "string | null",
  "ats_score": number,
  "matched_keywords": ["string"],
  "missing_keywords": ["string"],
  "tips": ["string"],
  "optimized_cv": {
    "name", "job_title", "email", "phone",
    "linkedin", "github", "portfolio", "location",
    "summary",
    "experience": [{ "title", "company", "duration", "bullets" }],
    "education": [{ "degree", "school", "year" }],
    "skills": {
      "languages", "frameworks", "databases", "tools", "methodologies"
    }
  }
}
```

### Skills Tipi (Geriye Dönük Uyumluluk)
- Yeni optimizasyonlar: `CvSkills` objesi (kategorili)
- Eski DB kayıtları: `string[]` (düz liste)
- `Array.isArray(cv.skills)` her render noktasında kontrol edilir

### candidateContext
Upload formundan gelen profil bilgileri (target_role_types, experience_level, work_arrangement, target_industry) `resumes` tablosuna kaydedilir. `/api/optimize` ve `/api/refine` bu alanları DB'den çekip AI prompt'una `--- CANDIDATE CONTEXT ---` bloğu olarak ekler.

---

## Klasör Yapısı (Önemli Dosyalar)

```
resume-builder/
├── app/
│   ├── page.tsx
│   ├── login/page.tsx
│   ├── app/
│   │   ├── upload/page.tsx         → CV seç/yükle + profil context formu (chip selector)
│   │   ├── job/page.tsx
│   │   ├── processing/page.tsx
│   │   └── results/[id]/
│   │       ├── page.tsx            → Server: veri çek
│   │       ├── ResultsClient.tsx   → Client: tüm interactive özellikler
│   │       ├── cover-letter/page.tsx
│   │       └── linkedin/page.tsx
│   ├── api/
│   │   ├── optimize/route.ts
│   │   ├── refine/route.ts
│   │   ├── cover-letter/route.ts
│   │   ├── linkedin-optimize/route.ts
│   │   ├── parse-pdf/route.ts      → candidateContext alanlarını kabul eder
│   │   ├── download-pdf/route.ts   → ?template=&color= param destekli
│   │   ├── resumes/route.ts
│   │   ├── optimizations/[id]/update/route.ts  → PATCH, inline edit kayıt
│   │   └── credits/check/route.ts
│   └── dashboard/page.tsx
├── components/
│   ├── AtsScoreRing.tsx            → Animasyonlu sayaç (600ms step)
│   ├── CvPreview.tsx               → Read-only CV preview (eski/non-edit)
│   ├── EditableCvPreview.tsx       → Inline edit + theme prop
│   ├── TemplateSelector.tsx        → Template kartları + renk swatches
│   ├── FileUploader.tsx
│   ├── LandingNavbar.tsx
│   ├── SignOutButton.tsx
│   ├── UpgradeModal.tsx
│   └── editing/
│       ├── SummaryEditor.tsx       → Click-to-edit textarea
│       ├── SkillsEditor.tsx        → Chip add/remove + category dropdown
│       └── BulletsEditor.tsx       → @dnd-kit sürükle-bırak + inline edit
├── lib/
│   ├── gemini.ts                   → OpenAI entegrasyonu + tüm AI fonksiyonları
│   ├── pdf-generator.tsx           → generateResumePdf(cv, theme) dispatcher
│   ├── pdf-parser.ts
│   ├── ats-calculator.ts           → calculateLiveScore() + buildSearchableText()
│   ├── plan-guard.ts
│   ├── rate-limit.ts
│   ├── supabase/client.ts + server.ts
│   ├── cv-templates/
│   │   ├── index.ts                → TEMPLATE_REGISTRY, COLOR_PALETTES, DEFAULT_THEME
│   │   ├── classic-document.tsx    → @react-pdf Classic PDF
│   │   ├── modern-document.tsx     → @react-pdf Modern PDF (sol accent bar)
│   │   ├── minimal-document.tsx    → @react-pdf Minimal PDF (büyük isim, bol boşluk)
│   │   └── fonts.ts                → registerFonts() — Roboto CDN
│   └── constants/
│       ├── index.ts
│       └── ats-config.ts           → GENERIC_WORDS (keyword filtresi)
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
- Eğitim bölümü inline editing

---

## Sık Sorulan Sorular

**Neden Stripe yok?**
Türkiye'de çalışmıyor. Paddle kullanıyoruz.

**Neden URL scraping yok?**
LinkedIn, Indeed gibi siteler bot engelliyor. Kullanıcı ilanı kopyalayıp yapıştırıyor.

**AI hangi dilde cevap veriyor?**
Her zaman İngilizce. `lib/gemini.ts`'deki tüm promptlar "All responses must be in English only" içeriyor.

**Cover Letter ve Refine kredi harcıyor mu?**
Hayır. Sadece `/api/optimize` kredi düşer. Cover letter, LinkedIn, Refine, inline edit kaydetme ücretsiz.

**PDF dosyası Supabase'de saklanıyor mu?**
Hayır. Sadece metin içeriği `resumes.original_text` alanında tutuluyor.

**lib/gemini.ts neden Gemini değil OpenAI kullanıyor?**
İlk başta Google Gemini planlanmıştı, sonra OpenAI'ye geçildi. Dosya adı tarihsel nedenle kaldı.

**PDF'te Türkçe karakterler (İ, ğ, ş) bozuluyor mu?**
Hayır. Roboto font jsDelivr CDN'den yükleniyor, tam Unicode desteği var. Tüm PDF template'leri Roboto kullanır.

**Skills objesi string[] mi CvSkills objesi mi?**
Yeni optimizasyonlar kategorili `CvSkills` objesi döndürür. Eski DB kayıtları `string[]` olabilir. `Array.isArray(cv.skills)` ile her yerde kontrol edilir.

**Live ATS skoru neden bazen değişmiyor?**
Tasarım gereği. `originalMatched` keyword'leri hiç yeniden değerlendirilmez — sadece `originalMissing` keyword'leri editedCv'de aranır. Bu, anlamsız içerik değişikliklerinin (ör. "3 yıl" → "4 yıl") skoru düşürmesini engeller.
