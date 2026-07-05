import {
  uid,
  type Slide,
  type SlideBackground,
  type SlideFormat,
  type TextElement,
  type StickerElement,
  type ShapeElement,
} from "./types";

export type TemplateCategory = "business" | "sale" | "education" | "quote";

export interface Template {
  id: string;
  category: TemplateCategory;
  format: SlideFormat;
  slides: Slide[];
}

// ── builders ────────────────────────────────────────────────────────────

const W = 1080;

function text(p: Partial<TextElement> & { text: string; y: number }): TextElement {
  return {
    id: uid(),
    type: "text",
    x: W * 0.08,
    width: W * 0.84,
    angle: 0,
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    fontFamily: "Montserrat",
    fontSize: 64,
    fontWeight: "bold",
    fill: "#ffffff",
    textAlign: "center",
    lineHeight: 1.15,
    ...p,
  };
}

function sticker(emoji: string, x: number, y: number, fontSize = 160): StickerElement {
  return { id: uid(), type: "sticker", emoji, x, y, angle: 0, scaleX: 1, scaleY: 1, opacity: 1, fontSize };
}

function badge(p: Partial<ShapeElement> & { y: number }): ShapeElement {
  return {
    id: uid(),
    type: "shape",
    shape: "rect",
    x: W * 0.3,
    width: W * 0.4,
    height: 12,
    fill: "#ffffff",
    rx: 6,
    angle: 0,
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    ...p,
  };
}

function slide(background: SlideBackground, elements: Slide["elements"]): Slide {
  return { id: uid(), background, elements };
}

const grad = (from: string, to: string, angle = 135): SlideBackground => ({ type: "gradient", from, to, angle });
const color = (c: string): SlideBackground => ({ type: "color", color: c });

// ── template catalog ────────────────────────────────────────────────────
// Copy is in Uzbek (latin) — the primary market language. Users edit it anyway.

function cover(bg: SlideBackground, kicker: string, title: string, emoji?: string): Slide {
  const els: Slide["elements"] = [
    text({ text: kicker, y: 260, fontSize: 40, fontWeight: "normal", fontFamily: "Inter", opacity: 0.85 }),
    text({ text: title, y: 380, fontSize: 88 }),
    badge({ y: 780 }),
    text({ text: "@sizning_brendingiz", y: 880, fontSize: 36, fontWeight: "normal", fontFamily: "Inter", opacity: 0.7 }),
  ];
  if (emoji) els.push(sticker(emoji, W / 2 - 80, 60));
  return slide(bg, els);
}

function body(bg: SlideBackground, heading: string, paragraph: string, n?: string): Slide {
  const els: Slide["elements"] = [
    text({ text: heading, y: 240, fontSize: 72, textAlign: "left" }),
    text({
      text: paragraph,
      y: 430,
      fontSize: 44,
      fontWeight: "normal",
      fontFamily: "Inter",
      textAlign: "left",
      lineHeight: 1.4,
    }),
  ];
  if (n) els.push(text({ text: n, y: 80, fontSize: 48, textAlign: "left", opacity: 0.6 }));
  return slide(bg, els);
}

function cta(bg: SlideBackground, title: string, action: string): Slide {
  return slide(bg, [
    sticker("👇", W / 2 - 80, 620),
    text({ text: title, y: 320, fontSize: 80 }),
    text({ text: action, y: 830, fontSize: 44, fontWeight: "normal", fontFamily: "Inter" }),
  ]);
}

function make(id: string, category: TemplateCategory, slides: Slide[], format: SlideFormat = "1080x1350"): Template {
  return { id, category, format, slides };
}

export function getTemplates(): Template[] {
  return [
    // ── business ──
    make("biz-launch", "business", [
      cover(grad("#0f2027", "#2c5364"), "YANGILIK", "Biznesingizni onlaynga olib chiqing", "🚀"),
      body(grad("#0f2027", "#2c5364"), "Nima taklif qilamiz?", "Sayt, CRM va marketing — hammasi bir joyda. 7 kun ichida ishga tushiramiz.", "01"),
      body(grad("#0f2027", "#2c5364"), "Natija", "Mijozlar oqimi +40%. Kafolat bilan ishlaymiz.", "02"),
      cta(grad("#0f2027", "#2c5364"), "Bepul konsultatsiya", "Yozing: @sizning_brendingiz"),
    ]),
    make("biz-services", "business", [
      cover(color("#111827"), "XIZMATLAR", "Bir sahifada — barcha xizmatlarimiz", "💼"),
      body(color("#111827"), "1. Konsalting", "Biznes-jarayonlarni tahlil qilamiz va o‘sish nuqtalarini topamiz.", "01"),
      body(color("#111827"), "2. Marketing", "Target, SMM va kontent — kalit topshirish sharti bilan.", "02"),
      cta(color("#111827"), "Hamkorlikni boshlaymizmi?", "Direktga yozing 📩"),
    ]),
    make("biz-team", "business", [
      cover(grad("#134e5e", "#71b280"), "JAMOA", "Bizning jamoa bilan tanishing", "🤝"),
      body(grad("#134e5e", "#71b280"), "5 yillik tajriba", "50+ loyiha, 30+ doimiy mijoz. Har bir loyihaga shaxsiy yondashuv."),
      cta(grad("#134e5e", "#71b280"), "Biz bilan ishlang", "Havola bio’da 🔗"),
    ]),
    make("biz-steps", "business", [
      cover(grad("#232526", "#414345"), "QO‘LLANMA", "Buyurtma berish — 3 qadam", "📋"),
      body(grad("#232526", "#414345"), "1-qadam", "Direktga yozasiz yoki saytda ariza qoldirasiz.", "01"),
      body(grad("#232526", "#414345"), "2-qadam", "Menejer 15 daqiqada bog‘lanadi va narxni aytadi.", "02"),
      body(grad("#232526", "#414345"), "3-qadam", "Shartnoma — va ish boshlanadi!", "03"),
    ]),

    // ── sale / discounts ──
    make("sale-flash", "sale", [
      cover(grad("#cb2d3e", "#ef473a"), "FAQAT BUGUN", "CHEGIRMA –50%", "🔥"),
      body(grad("#cb2d3e", "#ef473a"), "Nimalarga?", "Barcha to‘plamlarga. Soni cheklangan — ulgurib qoling!"),
      cta(grad("#cb2d3e", "#ef473a"), "Buyurtma bering", "Havola bio’da yoki direktga yozing"),
    ]),
    make("sale-newprice", "sale", [
      cover(grad("#f7971e", "#ffd200"), "AKSIYA", "Yangi narxlar keldi", "💸"),
      body(grad("#f7971e", "#ffd200"), "Eski narx: 500 000", "Yangi narx: 349 000 so‘m. 31-dekabrgacha amal qiladi."),
      cta(grad("#f7971e", "#ffd200"), "Band qiling", "«XOHLAYMAN» deb yozing 👇"),
    ]),
    make("sale-gift", "sale", [
      cover(grad("#7f00ff", "#e100ff"), "SOVG‘A", "Har bir xaridga bonus", "🎁"),
      body(grad("#7f00ff", "#e100ff"), "Qanday olish mumkin?", "Do‘stingizni belgilang va postni ulashing — sovg‘a sizniki!"),
      cta(grad("#7f00ff", "#e100ff"), "Qatnashing", "Shartlar izohda 👇"),
    ]),
    make("sale-countdown", "sale", [
      cover(color("#18181b"), "OXIRGI KUNLAR", "Sotuv 3 kunda yopiladi", "⏰"),
      body(color("#18181b"), "Nega shoshilish kerak?", "Narx ko‘tarilishidan oldin joyingizni band qiling."),
      cta(color("#18181b"), "Hoziroq yozing", "@sizning_brendingiz"),
    ]),

    // ── education ──
    make("edu-tips", "education", [
      cover(grad("#1a2980", "#26d0ce"), "FOYDALI", "5 ta maslahat: Instagram’da o‘sish", "📚"),
      body(grad("#1a2980", "#26d0ce"), "1. Doimiylik", "Haftasiga kamida 3 ta post — algoritm faollikni yaxshi ko‘radi.", "01"),
      body(grad("#1a2980", "#26d0ce"), "2. Karusellar", "Karusel postlar 3 barobar ko‘proq saqlanadi.", "02"),
      body(grad("#1a2980", "#26d0ce"), "3. CTA", "Har bir postda harakatga chaqiriq bo‘lsin.", "03"),
      cta(grad("#1a2980", "#26d0ce"), "Foydali bo‘ldimi?", "Saqlab qo‘ying 🔖"),
    ]),
    make("edu-course", "education", [
      cover(grad("#42275a", "#734b6d"), "KURS", "0 dan SMM mutaxassisi bo‘ling", "🎓"),
      body(grad("#42275a", "#734b6d"), "Dastur", "8 hafta amaliyot, real loyihalar, sertifikat va ishga yo‘llanma."),
      cta(grad("#42275a", "#734b6d"), "Ro‘yxatdan o‘ting", "Havola bio’da 🔗"),
    ]),
    make("edu-mistakes", "education", [
      cover(color("#0c4a6e"), "XATOLAR", "Yangi boshlovchilarning 3 xatosi", "⚠️"),
      body(color("#0c4a6e"), "1-xato", "Auditoriyani o‘rganmasdan kontent qilish.", "01"),
      body(color("#0c4a6e"), "2-xato", "Faqat sotuv postlari — foydali kontent yo‘q.", "02"),
      body(color("#0c4a6e"), "3-xato", "Statistikani tahlil qilmaslik.", "03"),
      cta(color("#0c4a6e"), "Davomi bor", "Obuna bo‘ling ✅"),
    ]),
    make("edu-howto", "education", [
      cover(grad("#136a8a", "#267871"), "QANDAY?", "Karuselni 10 daqiqada yasash", "✨"),
      body(grad("#136a8a", "#267871"), "Oddiy yo‘l", "Tayyor shablonni tanlang, matnni o‘zgartiring — tayyor!"),
      cta(grad("#136a8a", "#267871"), "Sinab ko‘ring", "Slaydchibot’da bepul 🤖"),
    ]),

    // ── quotes ──
    make("quote-minimal", "quote", [
      slide(color("#fafaf9"), [
        text({ text: "“", y: 180, fontSize: 200, fill: "#111111", opacity: 0.2 }),
        text({ text: "Eng yaxshi vaqt — hozir.", y: 480, fontSize: 88, fill: "#111111" }),
        text({ text: "— xalq hikmati", y: 800, fontSize: 40, fontWeight: "normal", fontFamily: "Inter", fill: "#111111", opacity: 0.6 }),
      ]),
    ], "1080x1080"),
    make("quote-dark", "quote", [
      slide(grad("#000428", "#004e92"), [
        sticker("💭", W / 2 - 80, 160),
        text({ text: "Katta ishlar kichik qadamlardan boshlanadi.", y: 420, fontSize: 76 }),
        badge({ y: 760, x: W * 0.4, width: W * 0.2 }),
        text({ text: "@sizning_brendingiz", y: 840, fontSize: 36, fontWeight: "normal", fontFamily: "Inter", opacity: 0.7 }),
      ]),
    ], "1080x1080"),
    make("quote-bold", "quote", [
      slide(color("#facc15"), [
        text({ text: "ISHLA.", y: 260, fontSize: 140, fill: "#111111", textAlign: "left" }),
        text({ text: "ISHON.", y: 430, fontSize: 140, fill: "#111111", textAlign: "left" }),
        text({ text: "YUT.", y: 600, fontSize: 140, fill: "#111111", textAlign: "left" }),
        text({ text: "@sizning_brendingiz", y: 900, fontSize: 36, fontWeight: "normal", fontFamily: "Inter", fill: "#111111", textAlign: "left", opacity: 0.6 }),
      ]),
    ], "1080x1080"),
    make("quote-series", "quote", [
      cover(grad("#603813", "#b29f94"), "IQTIBOSLAR", "Hafta motivatsiyasi", "☕"),
      slide(grad("#603813", "#b29f94"), [
        text({ text: "“Muvaffaqiyat — har kuni takrorlanadigan kichik odatlar.”", y: 420, fontSize: 68 }),
      ]),
      cta(grad("#603813", "#b29f94"), "Yoqdimi?", "Do‘stlarga ulashing 📤"),
    ]),
  ];
}

export function getTemplate(id: string): Template | null {
  return getTemplates().find((t) => t.id === id) ?? null;
}

/** Deep-copies template slides with fresh ids so edits never mutate the catalog. */
export function instantiateTemplate(template: Template): Slide[] {
  return template.slides.map((s) => ({
    ...structuredClone(s),
    id: uid(),
    elements: s.elements.map((e) => ({ ...structuredClone(e), id: uid() })),
  }));
}
