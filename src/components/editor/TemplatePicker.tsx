"use client";

import { useState } from "react";
import { X, Layers as LayersPlus } from "lucide-react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/editorStore";
import { nanoid } from "nanoid";
import type { EditorNode } from "@/types/editor";

// ─── Node helper ─────────────────────────────────────────────────────────────

function n(
  type: string,
  tag: string,
  className: string,
  content?: string,
  children?: EditorNode[],
): EditorNode {
  return { id: nanoid(8), type, tag, className, content, children };
}

// ─── Shared content pools ────────────────────────────────────────────────────

const PORTFOLIO_FAQ = [
  {
    q: "Do you take on freelance projects?",
    a: "Yes! I'm available for select projects. Reach out to discuss scope and timeline.",
  },
  {
    q: "What is your design process?",
    a: "Discovery → Research → Concepting → Design → Iteration → Delivery. Clients stay involved at every step.",
  },
  {
    q: "Do you work with international clients?",
    a: "Absolutely. I work remotely with clients worldwide across all time zones.",
  },
  {
    q: "How long does a typical project take?",
    a: "2–8 weeks depending on scope. Branding is typically 4 weeks; full websites 6–8 weeks.",
  },
];

const BUSINESS_FAQ = [
  {
    q: "Is there a free trial?",
    a: "Yes! 14 days free with full access to all features — no credit card required.",
  },
  {
    q: "Can I cancel my plan at any time?",
    a: "Absolutely. No long-term contracts. Cancel whenever from your account settings.",
  },
  {
    q: "Do you offer custom enterprise plans?",
    a: "Yes, contact our sales team for custom pricing tailored to your organization.",
  },
  {
    q: "What integrations are supported?",
    a: "We integrate with Slack, HubSpot, Salesforce, Stripe, and 50+ other tools.",
  },
];

const AGENCY_FAQ = [
  {
    q: "How do you handle revisions?",
    a: "Unlimited revisions during the design phase, plus 2 rounds post-launch included in every package.",
  },
  {
    q: "What's your typical project timeline?",
    a: "Branding projects run 3–5 weeks. Full website builds typically take 6–10 weeks.",
  },
  {
    q: "Do you offer full brand identity packages?",
    a: "Yes — logo, color system, typography, brand guidelines, and all digital assets included.",
  },
  {
    q: "Do you sign NDAs?",
    a: "Yes, we sign NDAs before any kickoff. Confidentiality is a top priority for us.",
  },
];

const RESUME_FAQ = [
  {
    q: "Are you open to full-time roles?",
    a: "Yes, actively looking for the right full-time opportunity where I can make a real impact.",
  },
  {
    q: "Are you available for remote work?",
    a: "Yes — fully remote or hybrid. Also open to relocation for the right opportunity.",
  },
  {
    q: "What tools and technologies do you use?",
    a: "Primary stack: React, TypeScript, Figma, Node.js, Tailwind CSS, PostgreSQL, and AWS.",
  },
  {
    q: "Do you take on freelance projects too?",
    a: "Selectively yes. I'm always interested in challenging problems alongside my full-time work.",
  },
];

const PORTFOLIO_GALLERY = [
  {
    gradient: "bg-gradient-to-br from-rose-400 to-orange-400",
    label: "Brand Identity",
  },
  {
    gradient: "bg-gradient-to-br from-violet-500 to-pink-500",
    label: "UI Design",
  },
  {
    gradient: "bg-gradient-to-br from-cyan-400 to-blue-500",
    label: "Web Design",
  },
  {
    gradient: "bg-gradient-to-br from-amber-400 to-yellow-300",
    label: "Mobile App",
  },
  {
    gradient: "bg-gradient-to-br from-emerald-400 to-teal-500",
    label: "Marketing",
  },
  {
    gradient: "bg-gradient-to-br from-primary to-purple-500",
    label: "Typography",
  },
];

const BUSINESS_GALLERY = [
  {
    gradient: "bg-gradient-to-br from-primary to-blue-500",
    label: "Dashboard",
  },
  {
    gradient: "bg-gradient-to-br from-violet-400 to-primary",
    label: "Analytics",
  },
  { gradient: "bg-gradient-to-br from-blue-400 to-cyan-400", label: "Reports" },
  { gradient: "bg-gradient-to-br from-sky-400 to-blue-400", label: "Pipeline" },
  {
    gradient: "bg-gradient-to-br from-teal-400 to-emerald-400",
    label: "Automation",
  },
  {
    gradient: "bg-gradient-to-br from-purple-400 to-pink-400",
    label: "Team Hub",
  },
];

const AGENCY_GALLERY = [
  { gradient: "bg-gradient-to-br from-muted to-muted", label: "Rebrand" },
  {
    gradient: "bg-gradient-to-br from-orange-500 to-rose-600",
    label: "Campaign",
  },
  {
    gradient: "bg-gradient-to-br from-blue-500 to-primary",
    label: "Digital",
  },
  { gradient: "bg-gradient-to-br from-green-500 to-teal-600", label: "Print" },
  {
    gradient: "bg-gradient-to-br from-purple-500 to-pink-600",
    label: "Social",
  },
  {
    gradient: "bg-gradient-to-br from-amber-500 to-orange-600",
    label: "Video",
  },
];

const RESUME_GALLERY = [
  {
    gradient: "bg-gradient-to-br from-muted to-muted",
    label: "Project Alpha",
  },
  {
    gradient: "bg-gradient-to-br from-blue-500 to-primary",
    label: "Case Study",
  },
  {
    gradient: "bg-gradient-to-br from-violet-500 to-purple-600",
    label: "Open Source",
  },
  {
    gradient: "bg-gradient-to-br from-emerald-500 to-teal-600",
    label: "Side Project",
  },
  {
    gradient: "bg-gradient-to-br from-rose-500 to-pink-600",
    label: "Project Beta",
  },
  {
    gradient: "bg-gradient-to-br from-amber-500 to-orange-500",
    label: "Award Win",
  },
];

// ─── Section builders ────────────────────────────────────────────────────────

function buildHeader(
  brand: string,
  bg: string,
  brandCls: string,
  linkCls: string,
  btnCls: string,
  links: string[],
  btnLabel: string,
): EditorNode {
  return n("nav", "nav", `${bg} px-8 py-4 sticky top-0 z-50`, undefined, [
    n(
      "div",
      "div",
      "max-w-6xl mx-auto flex items-center justify-between",
      undefined,
      [
        n("span", "span", `text-xl font-bold ${brandCls}`, brand),
        n("div", "div", "flex items-center gap-6", undefined, [
          ...links.map((lnk) =>
            n(
              "a",
              "a",
              `text-sm font-medium ${linkCls} hover:opacity-80 transition-opacity`,
              lnk,
            ),
          ),
          n(
            "a",
            "a",
            `text-sm font-semibold px-5 py-2 rounded-lg transition-all ${btnCls}`,
            btnLabel,
          ),
        ]),
      ],
    ),
  ]);
}

function buildHero(
  eyebrow: string | null,
  heading: string,
  sub: string,
  bg: string,
  eyebrowCls: string | null,
  headingCls: string,
  subCls: string,
  btn1Cls: string,
  btn1: string,
  btn2Cls: string,
  btn2: string,
): EditorNode {
  const inner: EditorNode[] = [];
  if (eyebrow) {
    inner.push(
      n(
        "span",
        "span",
        `${eyebrowCls} text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full`,
        eyebrow,
      ),
    );
  }
  inner.push(
    n(
      "h1",
      "h1",
      `${headingCls} text-5xl font-extrabold leading-tight tracking-tight`,
      heading,
    ),
    n("p", "p", `${subCls} text-lg max-w-2xl`, sub),
    n("div", "div", "flex gap-4 flex-wrap justify-center", undefined, [
      n(
        "a",
        "a",
        `${btn1Cls} px-8 py-3 rounded-xl font-semibold transition-all`,
        btn1,
      ),
      n(
        "a",
        "a",
        `${btn2Cls} px-8 py-3 rounded-xl font-semibold transition-all`,
        btn2,
      ),
    ]),
  );
  return n(
    "section",
    "section",
    `${bg} py-28 px-8 min-h-[600px] flex items-center justify-center text-center`,
    undefined,
    [
      n(
        "div",
        "div",
        "max-w-4xl mx-auto flex flex-col items-center gap-6",
        undefined,
        inner,
      ),
    ],
  );
}

function buildFeatured(
  bg: string,
  heading: string,
  sub: string,
  headingCls: string,
  subCls: string,
  cards: Array<{
    icon: string;
    title: string;
    desc: string;
    cardCls: string;
    iconBg: string;
    titleCls: string;
    descCls: string;
  }>,
): EditorNode {
  return n("section", "section", `${bg} py-20 px-8`, undefined, [
    n("div", "div", "max-w-6xl mx-auto", undefined, [
      n("div", "div", "text-center mb-14", undefined, [
        n("h2", "h2", `${headingCls} text-4xl font-bold mb-4`, heading),
        n("p", "p", `${subCls} max-w-xl mx-auto`, sub),
      ]),
      n(
        "div",
        "div",
        "grid grid-cols-1 @md:grid-cols-3 gap-8",
        undefined,
        cards.map(({ icon, title, desc, cardCls, iconBg, titleCls, descCls }) =>
          n("div", "div", `${cardCls} rounded-2xl p-8`, undefined, [
            n(
              "div",
              "div",
              `${iconBg} w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5`,
              icon,
            ),
            n("h3", "h3", `${titleCls} text-lg font-semibold mb-2`, title),
            n("p", "p", `${descCls} text-sm leading-relaxed`, desc),
          ]),
        ),
      ),
    ]),
  ]);
}

function buildGallery(
  bg: string,
  heading: string,
  headingCls: string,
  items: Array<{ gradient: string; label: string }>,
): EditorNode {
  return n("section", "section", `${bg} py-20 px-8`, undefined, [
    n("div", "div", "max-w-6xl mx-auto", undefined, [
      n(
        "h2",
        "h2",
        `${headingCls} text-4xl font-bold text-center mb-12`,
        heading,
      ),
      n(
        "div",
        "div",
        "grid grid-cols-2 @md:grid-cols-3 gap-4",
        undefined,
        items.map(({ gradient, label }) =>
          n(
            "div",
            "div",
            "relative group rounded-2xl overflow-hidden cursor-pointer",
            undefined,
            [
              n("div", "div", `${gradient} aspect-[4/3] w-full`),
              n(
                "div",
                "div",
                "absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center",
                undefined,
                [n("span", "span", "text-white font-semibold text-sm", label)],
              ),
            ],
          ),
        ),
      ),
    ]),
  ]);
}

function buildTestimonials(
  bg: string,
  heading: string,
  headingCls: string,
  cardCls: string,
  quoteCls: string,
  nameCls: string,
  roleCls: string,
  avatarCls: string,
  items: Array<{ name: string; role: string; text: string }>,
): EditorNode {
  return n("section", "section", `${bg} py-20 px-8`, undefined, [
    n("div", "div", "max-w-6xl mx-auto", undefined, [
      n(
        "h2",
        "h2",
        `${headingCls} text-4xl font-bold text-center mb-14`,
        heading,
      ),
      n(
        "div",
        "div",
        "grid grid-cols-1 @md:grid-cols-3 gap-6",
        undefined,
        items.map(({ name, role, text }) =>
          n("div", "div", `${cardCls} rounded-2xl p-7`, undefined, [
            n(
              "p",
              "p",
              `${quoteCls} text-sm leading-relaxed mb-6`,
              `"${text}"`,
            ),
            n("div", "div", "flex items-center gap-3", undefined, [
              n(
                "div",
                "div",
                `${avatarCls} w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold`,
                name[0],
              ),
              n("div", "div", "", undefined, [
                n("div", "div", `${nameCls} text-sm font-semibold`, name),
                n("div", "div", `${roleCls} text-xs`, role),
              ]),
            ]),
          ]),
        ),
      ),
    ]),
  ]);
}

function buildFAQ(
  bg: string,
  heading: string,
  headingCls: string,
  itemCls: string,
  questionCls: string,
  answerCls: string,
  items: Array<{ q: string; a: string }>,
): EditorNode {
  return n("section", "section", `${bg} py-20 px-8`, undefined, [
    n("div", "div", "max-w-3xl mx-auto", undefined, [
      n(
        "h2",
        "h2",
        `${headingCls} text-4xl font-bold text-center mb-12`,
        heading,
      ),
      n(
        "div",
        "div",
        "space-y-3",
        undefined,
        items.map(({ q, a }) =>
          n("div", "div", `${itemCls} rounded-xl overflow-hidden`, undefined, [
            n(
              "div",
              "div",
              "flex items-center justify-between px-6 py-4",
              undefined,
              [
                n("span", "span", `${questionCls} font-medium`, q),
                n("span", "span", "text-2xl font-light leading-none", "+"),
              ],
            ),
            n("div", "div", "px-6 pb-5", undefined, [
              n("p", "p", `${answerCls} text-sm leading-relaxed`, a),
            ]),
          ]),
        ),
      ),
    ]),
  ]);
}

function buildNewsletter(
  bg: string,
  heading: string,
  sub: string,
  headingCls: string,
  subCls: string,
  inputCls: string,
  btnCls: string,
): EditorNode {
  return n("section", "section", `${bg} py-20 px-8`, undefined, [
    n("div", "div", "max-w-2xl mx-auto text-center", undefined, [
      n("h2", "h2", `${headingCls} text-4xl font-bold mb-4`, heading),
      n("p", "p", `${subCls} text-lg mb-10`, sub),
      n("div", "div", "flex justify-center gap-3 max-w-md mx-auto", undefined, [
        n(
          "div",
          "div",
          `${inputCls} flex-1 px-5 py-3 rounded-xl text-sm border`,
          "your@email.com",
        ),
        n(
          "button",
          "button",
          `${btnCls} px-6 py-3 rounded-xl font-semibold text-sm whitespace-nowrap`,
          "Subscribe",
        ),
      ]),
    ]),
  ]);
}

function buildFooter(
  bg: string,
  brand: string,
  brandDesc: string,
  brandCls: string,
  mutedCls: string,
  linkCls: string,
  dividerCls: string,
  columns: Array<{ label: string; links: string[] }>,
): EditorNode {
  return n("footer", "footer", `${bg} py-16 px-8`, undefined, [
    n("div", "div", "max-w-6xl mx-auto", undefined, [
      n(
        "div",
        "div",
        "grid grid-cols-2 @md:grid-cols-4 gap-8 mb-12",
        undefined,
        [
          n("div", "div", "@md:col-span-2", undefined, [
            n(
              "span",
              "span",
              `${brandCls} text-xl font-bold block mb-3`,
              brand,
            ),
            n(
              "p",
              "p",
              `${mutedCls} text-sm leading-relaxed max-w-xs`,
              brandDesc,
            ),
          ]),
          ...columns.map((col) =>
            n("div", "div", "", undefined, [
              n(
                "h4",
                "h4",
                `${brandCls} font-semibold text-sm uppercase tracking-wider mb-4`,
                col.label,
              ),
              n(
                "ul",
                "ul",
                "space-y-2.5",
                undefined,
                col.links.map((lnk) =>
                  n("li", "li", "", undefined, [
                    n(
                      "a",
                      "a",
                      `${linkCls} text-sm hover:opacity-80 transition-opacity`,
                      lnk,
                    ),
                  ]),
                ),
              ),
            ]),
          ),
        ],
      ),
      n(
        "div",
        "div",
        `${dividerCls} border-t pt-8 flex items-center justify-between`,
        undefined,
        [
          n(
            "span",
            "span",
            `${mutedCls} text-sm`,
            `© 2025 ${brand}. All rights reserved.`,
          ),
          n("div", "div", "flex gap-4", undefined, [
            n("a", "a", `${linkCls} text-sm`, "Privacy"),
            n("a", "a", `${linkCls} text-sm`, "Terms"),
          ]),
        ],
      ),
    ]),
  ]);
}

// ─── Full-page template node builders ────────────────────────────────────────

function buildLando(): EditorNode[] {
  return [
    buildHeader(
      "Lando",
      "bg-card border-b border-border",
      "text-foreground",
      "text-muted-foreground",
      "bg-rose-500 hover:bg-rose-600 text-white",
      ["Work", "Process", "About"],
      "Hire Me",
    ),
    buildHero(
      "Available for work",
      "Hi, I'm Lando Sullivan",
      "Designer & Creative Director crafting brands that matter. Based in New York.",
      "bg-gradient-to-br from-rose-400 via-pink-500 to-orange-400",
      "bg-card/20 text-white",
      "text-white",
      "text-white/80",
      "bg-card text-foreground hover:bg-card/90",
      "View Work",
      "border border-white/40 text-white hover:bg-card/10",
      "Let's Talk",
    ),
    buildFeatured(
      "bg-card",
      "What I Do",
      "End-to-end creative services for ambitious brands and startups.",
      "text-foreground",
      "text-muted-foreground",
      [
        {
          icon: "🎨",
          title: "Brand Identity",
          desc: "Creating memorable brands from concept to launch — logos, color systems, and guidelines.",
          cardCls: "bg-muted border border-border",
          iconBg: "bg-rose-100",
          titleCls: "text-foreground",
          descCls: "text-muted-foreground",
        },
        {
          icon: "💻",
          title: "Web Design",
          desc: "Beautiful, functional websites designed to perform and convert visitors.",
          cardCls: "bg-muted border border-border",
          iconBg: "bg-rose-100",
          titleCls: "text-foreground",
          descCls: "text-muted-foreground",
        },
        {
          icon: "📱",
          title: "UI/UX Design",
          desc: "User-centered digital experiences that people genuinely love using.",
          cardCls: "bg-muted border border-border",
          iconBg: "bg-rose-100",
          titleCls: "text-foreground",
          descCls: "text-muted-foreground",
        },
      ],
    ),
    buildGallery(
      "bg-muted",
      "Selected Work",
      "text-foreground",
      PORTFOLIO_GALLERY,
    ),
    buildTestimonials(
      "bg-rose-50",
      "Client Love",
      "text-foreground",
      "bg-card border border-rose-100",
      "text-muted-foreground",
      "text-foreground",
      "text-muted-foreground",
      "bg-gradient-to-br from-rose-400 to-orange-400 text-white",
      [
        {
          name: "Sarah Chen",
          role: "CEO, Bloom Studio",
          text: "Lando transformed our brand identity completely. Results exceeded every expectation we had.",
        },
        {
          name: "Marcus Rivera",
          role: "Founder, Arcane",
          text: "Working with Lando was a dream. He brings a rare mix of creativity and strategic thinking.",
        },
        {
          name: "Priya Nair",
          role: "Head of Design, Vela",
          text: "Best design partner we've worked with. Delivers beautifully and always on time.",
        },
      ],
    ),
    buildFAQ(
      "bg-card",
      "Questions?",
      "text-foreground",
      "bg-muted border border-border",
      "text-foreground",
      "text-muted-foreground",
      PORTFOLIO_FAQ,
    ),
    buildNewsletter(
      "bg-rose-600",
      "Stay in the loop",
      "Subscribe for design inspiration, case studies, and creative insights.",
      "text-white",
      "text-rose-100",
      "bg-card text-foreground h-12",
      "bg-foreground hover:bg-foreground text-white h-12",
    ),
    buildFooter(
      "bg-foreground",
      "Lando",
      "Designer & Creative Director based in New York. Open to select projects worldwide.",
      "text-white",
      "text-muted-foreground",
      "text-muted-foreground",
      "border-border",
      [
        {
          label: "Work",
          links: ["Portfolio", "Case Studies", "Dribbble", "Behance"],
        },
        {
          label: "Services",
          links: ["Branding", "Web Design", "UI/UX", "Consulting"],
        },
        {
          label: "Connect",
          links: ["Email", "LinkedIn", "Twitter", "Instagram"],
        },
      ],
    ),
  ];
}

function buildFlorent(): EditorNode[] {
  return [
    buildHeader(
      "FLORENT",
      "bg-black border-b border-white/8",
      "text-white",
      "text-muted-foreground",
      "border border-white/20 text-white hover:bg-card/10",
      ["Work", "Studio", "About"],
      "Contact",
    ),
    buildHero(
      null,
      "Selected Works.",
      "Web design & branding for forward-thinking companies worldwide.",
      "bg-gradient-to-br from-orange-700 to-red-600",
      "",
      "text-white",
      "text-orange-100",
      "bg-card text-foreground hover:bg-orange-50",
      "View Projects",
      "border border-white/30 text-white hover:bg-card/10",
      "Get in Touch",
    ),
    buildFeatured(
      "bg-foreground",
      "Services",
      "What we do best — delivered with precision and craft.",
      "text-white",
      "text-muted-foreground",
      [
        {
          icon: "◼",
          title: "Art Direction",
          desc: "Strategic creative direction that shapes how your brand looks, feels, and speaks.",
          cardCls: "bg-foreground border border-white/8",
          iconBg: "bg-orange-500/20",
          titleCls: "text-white",
          descCls: "text-muted-foreground",
        },
        {
          icon: "◼",
          title: "Web Design",
          desc: "Immersive digital experiences built with intention and sharp attention to detail.",
          cardCls: "bg-foreground border border-white/8",
          iconBg: "bg-orange-500/20",
          titleCls: "text-white",
          descCls: "text-muted-foreground",
        },
        {
          icon: "◼",
          title: "Motion & Film",
          desc: "Cinematic motion design that brings your brand story to life.",
          cardCls: "bg-foreground border border-white/8",
          iconBg: "bg-orange-500/20",
          titleCls: "text-white",
          descCls: "text-muted-foreground",
        },
      ],
    ),
    buildGallery("bg-black", "Projects", "text-white", PORTFOLIO_GALLERY),
    buildTestimonials(
      "bg-foreground",
      "What Clients Say",
      "text-white",
      "bg-foreground border border-white/8",
      "text-muted-foreground",
      "text-white",
      "text-muted-foreground",
      "bg-gradient-to-br from-orange-500 to-red-500 text-white",
      [
        {
          name: "Kai Blum",
          role: "Creative Director, Nord",
          text: "Florent's eye for detail is unmatched. Every pixel served a purpose. Truly exceptional work.",
        },
        {
          name: "Aline Dupont",
          role: "Founder, Maison",
          text: "We came with a vague brief and left with a brand we're genuinely proud of. Remarkable.",
        },
        {
          name: "Tom Walsh",
          role: "CEO, Arca",
          text: "The website he built for us tripled our inbound leads in the first month. Outstanding.",
        },
      ],
    ),
    buildFAQ(
      "bg-muted",
      "Common Questions",
      "text-foreground",
      "bg-card border border-border",
      "text-foreground",
      "text-muted-foreground",
      PORTFOLIO_FAQ,
    ),
    buildNewsletter(
      "bg-orange-600",
      "Creative Dispatch",
      "Monthly notes on design, culture, and craft — straight to your inbox.",
      "text-white",
      "text-orange-100",
      "bg-card text-foreground",
      "bg-black hover:bg-foreground text-white",
    ),
    buildFooter(
      "bg-black",
      "FLORENT",
      "Art direction & web design studio. Based in Paris, working worldwide.",
      "text-white",
      "text-muted-foreground",
      "text-muted-foreground",
      "border-white/10",
      [
        { label: "Work", links: ["Projects", "Case Studies", "Awards"] },
        { label: "Studio", links: ["About", "Process", "Clients"] },
        { label: "Contact", links: ["Email", "Instagram", "LinkedIn"] },
      ],
    ),
  ];
}

function buildMinimalFolio(): EditorNode[] {
  return [
    buildHeader(
      "Studio.",
      "bg-card border-b border-border",
      "text-foreground",
      "text-muted-foreground",
      "bg-foreground hover:bg-foreground text-white",
      ["Work", "About", "Writing"],
      "Say Hello",
    ),
    buildHero(
      "Independent designer",
      "Less is More.",
      "Thoughtful design that speaks without shouting. Clean, considered, lasting.",
      "bg-foreground",
      "bg-card/10 text-white",
      "text-white",
      "text-muted-foreground",
      "bg-card text-foreground hover:bg-muted",
      "See Work",
      "border border-border text-muted-foreground hover:border-border",
      "Read More",
    ),
    buildFeatured(
      "bg-muted",
      "Capabilities",
      "Focused expertise in areas that matter most.",
      "text-foreground",
      "text-muted-foreground",
      [
        {
          icon: "—",
          title: "Visual Identity",
          desc: "Restrained, considered brand systems that endure through trends.",
          cardCls: "bg-card border border-border",
          iconBg: "bg-muted",
          titleCls: "text-foreground",
          descCls: "text-muted-foreground",
        },
        {
          icon: "—",
          title: "Editorial Design",
          desc: "Publications, books, and long-form content crafted with care.",
          cardCls: "bg-card border border-border",
          iconBg: "bg-muted",
          titleCls: "text-foreground",
          descCls: "text-muted-foreground",
        },
        {
          icon: "—",
          title: "Digital",
          desc: "Websites that let the content breathe and the user focus.",
          cardCls: "bg-card border border-border",
          iconBg: "bg-muted",
          titleCls: "text-foreground",
          descCls: "text-muted-foreground",
        },
      ],
    ),
    buildGallery("bg-card", "Work", "text-foreground", PORTFOLIO_GALLERY),
    buildTestimonials(
      "bg-muted",
      "From Clients",
      "text-foreground",
      "bg-card border border-border",
      "text-muted-foreground",
      "text-foreground",
      "text-muted-foreground",
      "bg-foreground text-white",
      [
        {
          name: "Leo Brandt",
          role: "Publisher, Forma Press",
          text: "Quiet, confident design that made our publication feel authoritative and fresh.",
        },
        {
          name: "Uma Feld",
          role: "Director, Haus Gallery",
          text: "Finally found someone who understands that restraint is a design choice, not a limitation.",
        },
        {
          name: "Sid Moore",
          role: "Editor, The Review",
          text: "Delivered exactly what we needed: nothing more, nothing less. Perfect execution.",
        },
      ],
    ),
    buildFAQ(
      "bg-card",
      "FAQ",
      "text-foreground",
      "bg-muted border border-border",
      "text-foreground",
      "text-muted-foreground",
      PORTFOLIO_FAQ,
    ),
    buildNewsletter(
      "bg-foreground",
      "Notes on Design",
      "Occasional thoughts on craft, minimalism, and the creative process.",
      "text-white",
      "text-muted-foreground",
      "bg-card text-foreground",
      "bg-card text-foreground hover:bg-muted",
    ),
    buildFooter(
      "bg-foreground",
      "Studio.",
      "Independent design practice. Available for select collaborations.",
      "text-white",
      "text-muted-foreground",
      "text-muted-foreground",
      "border-border",
      [
        { label: "Work", links: ["Portfolio", "Archive", "Process"] },
        { label: "About", links: ["Story", "Values", "Writing"] },
        { label: "Contact", links: ["Email", "Instagram", "Are.na"] },
      ],
    ),
  ];
}

function buildTalentify(): EditorNode[] {
  return [
    buildHeader(
      "Talentify",
      "bg-primary border-b border-white/8",
      "text-white",
      "text-primary",
      "bg-primary hover:bg-primary text-white",
      ["Find Jobs", "For Companies", "Blog"],
      "Sign Up Free",
    ),
    buildHero(
      "10,000+ remote jobs",
      "Your gateway to remote tech careers.",
      "Connect with top companies and land your dream role — without the noise.",
      "bg-gradient-to-br from-primary via-violet-900 to-primary",
      "bg-primary/30 text-primary",
      "text-white",
      "text-primary",
      "bg-primary hover:bg-primary text-white",
      "Browse Jobs",
      "border border-primary/40 text-primary hover:bg-primary/20",
      "Post a Job",
    ),
    buildFeatured(
      "bg-card",
      "Why Talentify",
      "Everything you need to find and land your next remote role.",
      "text-foreground",
      "text-muted-foreground",
      [
        {
          icon: "⚡",
          title: "Curated Roles",
          desc: "Every job is hand-vetted by our team. No spam, no scams — only real opportunities.",
          cardCls: "bg-primary/10 border border-primary",
          iconBg: "bg-primary/10",
          titleCls: "text-foreground",
          descCls: "text-muted-foreground",
        },
        {
          icon: "🎯",
          title: "Smart Matching",
          desc: "Our algorithm surfaces roles that actually match your skills and preferences.",
          cardCls: "bg-primary/10 border border-primary",
          iconBg: "bg-primary/10",
          titleCls: "text-foreground",
          descCls: "text-muted-foreground",
        },
        {
          icon: "💬",
          title: "Direct Access",
          desc: "Message hiring managers directly — no middlemen, no walls, no gatekeeping.",
          cardCls: "bg-primary/10 border border-primary",
          iconBg: "bg-primary/10",
          titleCls: "text-foreground",
          descCls: "text-muted-foreground",
        },
      ],
    ),
    buildGallery(
      "bg-primary/10",
      "Companies Hiring Now",
      "text-foreground",
      BUSINESS_GALLERY,
    ),
    buildTestimonials(
      "bg-card",
      "Success Stories",
      "text-foreground",
      "bg-muted border border-border",
      "text-muted-foreground",
      "text-foreground",
      "text-muted-foreground",
      "bg-gradient-to-br from-primary to-violet-500 text-white",
      [
        {
          name: "Alex Kim",
          role: "Senior Engineer, hired via Talentify",
          text: "Found my dream remote job in 2 weeks. The quality of listings here is unmatched anywhere else.",
        },
        {
          name: "Nadia Osei",
          role: "Product Manager, Stripe",
          text: "Talentify made our remote hiring process 3× faster. Every candidate we interviewed was strong.",
        },
        {
          name: "Chris Park",
          role: "Designer at Vercel",
          text: "Applied to 3 jobs, got 3 interviews. This platform actually works. Highly recommend.",
        },
      ],
    ),
    buildFAQ(
      "bg-primary/10",
      "FAQ",
      "text-foreground",
      "bg-card border border-primary",
      "text-foreground",
      "text-muted-foreground",
      BUSINESS_FAQ,
    ),
    buildNewsletter(
      "bg-primary",
      "Weekly Remote Jobs Digest",
      "The best remote tech roles delivered to your inbox every Monday morning.",
      "text-white",
      "text-primary",
      "bg-card text-foreground",
      "bg-primary hover:bg-primary text-white",
    ),
    buildFooter(
      "bg-primary",
      "Talentify",
      "The remote-first job platform for tech professionals and the companies that hire them.",
      "text-white",
      "text-primary",
      "text-primary",
      "border-primary",
      [
        {
          label: "Jobs",
          links: ["Browse All", "Engineering", "Design", "Product"],
        },
        {
          label: "Companies",
          links: ["Post a Job", "Employer Hub", "Pricing"],
        },
        { label: "Company", links: ["About", "Blog", "Careers", "Press"] },
      ],
    ),
  ];
}

function buildNoora(): EditorNode[] {
  return [
    buildHeader(
      "Noora",
      "bg-card border-b border-border",
      "text-foreground",
      "text-muted-foreground",
      "bg-foreground hover:bg-foreground text-white",
      ["Product", "Pricing", "About"],
      "Start Free Trial",
    ),
    buildHero(
      "New: AI-powered reports",
      "Scale 2× faster with less effort.",
      "The all-in-one growth platform for ambitious businesses. No complexity, just results.",
      "bg-card",
      "bg-muted text-muted-foreground",
      "text-foreground",
      "text-muted-foreground",
      "bg-foreground hover:bg-foreground text-white",
      "Get Started",
      "border border-border text-muted-foreground hover:bg-muted",
      "Watch Demo",
    ),
    buildFeatured(
      "bg-muted",
      "Everything You Need",
      "One platform to attract, convert, and retain more customers.",
      "text-foreground",
      "text-muted-foreground",
      [
        {
          icon: "📊",
          title: "Real-Time Analytics",
          desc: "See exactly what's working with dashboards that update as fast as your business moves.",
          cardCls: "bg-card border border-border",
          iconBg: "bg-muted",
          titleCls: "text-foreground",
          descCls: "text-muted-foreground",
        },
        {
          icon: "🔁",
          title: "Workflow Automation",
          desc: "Automate repetitive tasks and free your team to focus on what actually matters.",
          cardCls: "bg-card border border-border",
          iconBg: "bg-muted",
          titleCls: "text-foreground",
          descCls: "text-muted-foreground",
        },
        {
          icon: "🤝",
          title: "Team Collaboration",
          desc: "Everyone on the same page. Shared inboxes, tasks, and docs in one place.",
          cardCls: "bg-card border border-border",
          iconBg: "bg-muted",
          titleCls: "text-foreground",
          descCls: "text-muted-foreground",
        },
      ],
    ),
    buildGallery(
      "bg-card",
      "Built for Every Team",
      "text-foreground",
      BUSINESS_GALLERY,
    ),
    buildTestimonials(
      "bg-muted",
      "Loved by 10,000+ Teams",
      "text-foreground",
      "bg-card border border-border",
      "text-muted-foreground",
      "text-foreground",
      "text-muted-foreground",
      "bg-gradient-to-br from-muted to-muted text-white",
      [
        {
          name: "Rachel Wong",
          role: "Operations Lead, Hatch",
          text: "Noora cut our reporting time by 80%. We now spend that time on actual strategy.",
        },
        {
          name: "Daniel Flores",
          role: "CEO, Ember Co.",
          text: "The automation features alone are worth 10× the price. Couldn't run the team without it.",
        },
        {
          name: "Sara Mills",
          role: "Head of Growth, Pilot",
          text: "Clean UI, powerful features, excellent support. Switched from three tools to just Noora.",
        },
      ],
    ),
    buildFAQ(
      "bg-card",
      "Common Questions",
      "text-foreground",
      "bg-muted border border-border",
      "text-foreground",
      "text-muted-foreground",
      BUSINESS_FAQ,
    ),
    buildNewsletter(
      "bg-foreground",
      "Product Updates",
      "Stay ahead with our monthly roundup of new features and growth tips.",
      "text-white",
      "text-muted-foreground",
      "bg-card text-foreground",
      "bg-card text-foreground hover:bg-muted",
    ),
    buildFooter(
      "bg-foreground",
      "Noora",
      "The all-in-one platform that helps growing businesses move faster and smarter.",
      "text-white",
      "text-muted-foreground",
      "text-muted-foreground",
      "border-border",
      [
        {
          label: "Product",
          links: ["Features", "Pricing", "Changelog", "Roadmap"],
        },
        { label: "Company", links: ["About", "Blog", "Careers", "Press"] },
        {
          label: "Support",
          links: ["Docs", "Help Center", "Status", "Contact"],
        },
      ],
    ),
  ];
}

function buildPixend(): EditorNode[] {
  return [
    buildHeader(
      "Pixend",
      "bg-blue-950 border-b border-white/8",
      "text-white",
      "text-blue-300",
      "bg-blue-500 hover:bg-blue-400 text-white",
      ["Services", "Work", "Pricing"],
      "Get a Quote",
    ),
    buildHero(
      "Full-service digital agency",
      "Ideas Born, Digitally Brought Alive.",
      "We build brands, products, and experiences for companies that want to lead — not follow.",
      "bg-gradient-to-br from-blue-800 to-primary",
      "bg-blue-500/30 text-blue-300",
      "text-white",
      "text-blue-200",
      "bg-blue-500 hover:bg-blue-400 text-white",
      "Start a Project",
      "border border-blue-400/30 text-blue-200 hover:bg-blue-500/20",
      "See Our Work",
    ),
    buildFeatured(
      "bg-card",
      "What We Build",
      "Digital solutions engineered to perform, scale, and impress.",
      "text-foreground",
      "text-muted-foreground",
      [
        {
          icon: "🌐",
          title: "Web Development",
          desc: "Fast, accessible websites and web apps built with modern tech stacks.",
          cardCls: "bg-blue-50 border border-blue-100",
          iconBg: "bg-blue-100",
          titleCls: "text-foreground",
          descCls: "text-muted-foreground",
        },
        {
          icon: "📱",
          title: "Mobile Apps",
          desc: "Native and cross-platform apps for iOS and Android that users love.",
          cardCls: "bg-blue-50 border border-blue-100",
          iconBg: "bg-blue-100",
          titleCls: "text-foreground",
          descCls: "text-muted-foreground",
        },
        {
          icon: "🎨",
          title: "Brand & Design",
          desc: "Complete brand identities and UI systems that make you look world-class.",
          cardCls: "bg-blue-50 border border-blue-100",
          iconBg: "bg-blue-100",
          titleCls: "text-foreground",
          descCls: "text-muted-foreground",
        },
      ],
    ),
    buildGallery(
      "bg-blue-50",
      "Recent Work",
      "text-foreground",
      BUSINESS_GALLERY,
    ),
    buildTestimonials(
      "bg-card",
      "Client Results",
      "text-foreground",
      "bg-muted border border-border",
      "text-muted-foreground",
      "text-foreground",
      "text-muted-foreground",
      "bg-gradient-to-br from-blue-500 to-primary text-white",
      [
        {
          name: "Owen Burke",
          role: "Founder, Luma Health",
          text: "Pixend delivered a product that looks and performs like it cost 3× what we paid. Incredible team.",
        },
        {
          name: "Maya Sato",
          role: "CTO, Refract",
          text: "They understood our technical requirements from day one. Delivery was on time and flawless.",
        },
        {
          name: "James Okafor",
          role: "CMO, Beacon",
          text: "Brand refresh was exactly what we needed. Website traffic doubled in the first month.",
        },
      ],
    ),
    buildFAQ(
      "bg-blue-50",
      "Have Questions?",
      "text-foreground",
      "bg-card border border-blue-100",
      "text-foreground",
      "text-muted-foreground",
      BUSINESS_FAQ,
    ),
    buildNewsletter(
      "bg-blue-600",
      "Digital Insights",
      "Monthly insights on web, design, and product strategy from our team.",
      "text-white",
      "text-blue-200",
      "bg-card text-foreground",
      "bg-blue-950 hover:bg-blue-900 text-white",
    ),
    buildFooter(
      "bg-blue-950",
      "Pixend",
      "Full-service digital agency building brands and products for ambitious companies.",
      "text-white",
      "text-blue-400",
      "text-blue-400",
      "border-blue-900",
      [
        {
          label: "Services",
          links: ["Web Dev", "Mobile", "Design", "Consulting"],
        },
        { label: "Work", links: ["Case Studies", "Clients", "Industries"] },
        { label: "Company", links: ["About", "Team", "Careers", "Blog"] },
      ],
    ),
  ];
}

function buildPortfolite(): EditorNode[] {
  return [
    buildHeader(
      "PORTFOLITE",
      "bg-black border-b border-white/8",
      "text-white",
      "text-muted-foreground",
      "border border-white/20 text-white hover:bg-card/8",
      ["Work", "Agency", "Insights"],
      "Start a Project",
    ),
    buildHero(
      null,
      "We craft brands that demand attention.",
      "Bold creative work for companies that refuse to blend in. No safe choices — only right ones.",
      "bg-foreground",
      "",
      "text-white",
      "text-muted-foreground",
      "bg-card text-foreground hover:bg-muted",
      "Our Work",
      "border border-white/20 text-white hover:bg-card/8",
      "Get in Touch",
    ),
    buildFeatured(
      "bg-black",
      "What We Do",
      "Creative services executed at the highest level of craft.",
      "text-white",
      "text-muted-foreground",
      [
        {
          icon: "▲",
          title: "Branding",
          desc: "Strategy-first brand identities that position you as a category leader.",
          cardCls: "bg-foreground border border-white/8",
          iconBg: "bg-card/8",
          titleCls: "text-white",
          descCls: "text-muted-foreground",
        },
        {
          icon: "▲",
          title: "Web Design",
          desc: "Websites that stop the scroll and convert attention into action.",
          cardCls: "bg-foreground border border-white/8",
          iconBg: "bg-card/8",
          titleCls: "text-white",
          descCls: "text-muted-foreground",
        },
        {
          icon: "▲",
          title: "Campaigns",
          desc: "Integrated creative campaigns across digital, print, and beyond.",
          cardCls: "bg-foreground border border-white/8",
          iconBg: "bg-card/8",
          titleCls: "text-white",
          descCls: "text-muted-foreground",
        },
      ],
    ),
    buildGallery(
      "bg-foreground",
      "Selected Projects",
      "text-white",
      AGENCY_GALLERY,
    ),
    buildTestimonials(
      "bg-black",
      "From Our Clients",
      "text-white",
      "bg-foreground border border-white/8",
      "text-muted-foreground",
      "text-white",
      "text-muted-foreground",
      "bg-gradient-to-br from-muted to-muted text-white",
      [
        {
          name: "Lena Vogel",
          role: "CMO, Meridian",
          text: "Portfolite gave us a brand we're genuinely proud to put in front of anyone. Transformed how we show up.",
        },
        {
          name: "Raj Anand",
          role: "Founder, Helix Studio",
          text: "I've worked with a lot of agencies. None deliver the level of craft and care that Portfolite does.",
        },
        {
          name: "Camille Roux",
          role: "CEO, Optic",
          text: "They challenged our thinking in the best way. The final work is bolder than we ever imagined.",
        },
      ],
    ),
    buildFAQ(
      "bg-muted",
      "Questions",
      "text-foreground",
      "bg-card border border-border",
      "text-foreground",
      "text-muted-foreground",
      AGENCY_FAQ,
    ),
    buildNewsletter(
      "bg-card",
      "The Portfolite Brief",
      "Design, culture, and creative thinking — delivered monthly.",
      "text-foreground",
      "text-muted-foreground",
      "bg-muted border border-border text-foreground",
      "bg-black hover:bg-foreground text-white",
    ),
    buildFooter(
      "bg-black",
      "PORTFOLITE",
      "Creative agency building bold brands and digital experiences for ambitious companies.",
      "text-white",
      "text-muted-foreground",
      "text-muted-foreground",
      "border-white/10",
      [
        { label: "Work", links: ["Projects", "Case Studies", "Awards"] },
        { label: "Agency", links: ["About", "Process", "Team"] },
        {
          label: "New Business",
          links: ["Get in Touch", "Brief Us", "Pricing"],
        },
      ],
    ),
  ];
}

function buildFinito(): EditorNode[] {
  return [
    buildHeader(
      "Finito",
      "bg-blue-950 border-b border-white/8",
      "text-white",
      "text-blue-300",
      "bg-card text-blue-950 hover:bg-blue-50",
      ["Services", "Process", "Work"],
      "Let's Talk",
    ),
    buildHero(
      "Transparent by design",
      "Transparent projects. Zero surprises.",
      "We keep communication tight, timelines clear, and every decision documented. Exactly how agency work should be.",
      "bg-gradient-to-br from-blue-900 to-primary",
      "bg-card/10 text-white",
      "text-white",
      "text-blue-200",
      "bg-card text-blue-950 hover:bg-blue-50",
      "Start a Project",
      "border border-white/20 text-white hover:bg-card/10",
      "How We Work",
    ),
    buildFeatured(
      "bg-card",
      "Our Approach",
      "We run projects differently — and clients notice.",
      "text-foreground",
      "text-muted-foreground",
      [
        {
          icon: "📋",
          title: "Fixed-Price Scoping",
          desc: "Every project starts with a precise scope. No billing surprises, ever.",
          cardCls: "bg-blue-50 border border-blue-100",
          iconBg: "bg-blue-100",
          titleCls: "text-foreground",
          descCls: "text-muted-foreground",
        },
        {
          icon: "📡",
          title: "Weekly Check-ins",
          desc: "Structured Slack updates and video calls so you always know the status.",
          cardCls: "bg-blue-50 border border-blue-100",
          iconBg: "bg-blue-100",
          titleCls: "text-foreground",
          descCls: "text-muted-foreground",
        },
        {
          icon: "🚀",
          title: "On-Time Delivery",
          desc: "95% of our projects ship on time. We treat deadlines as commitments.",
          cardCls: "bg-blue-50 border border-blue-100",
          iconBg: "bg-blue-100",
          titleCls: "text-foreground",
          descCls: "text-muted-foreground",
        },
      ],
    ),
    buildGallery("bg-blue-950", "Our Work", "text-white", AGENCY_GALLERY),
    buildTestimonials(
      "bg-card",
      "What Clients Report",
      "text-foreground",
      "bg-muted border border-border",
      "text-muted-foreground",
      "text-foreground",
      "text-muted-foreground",
      "bg-gradient-to-br from-blue-600 to-primary text-white",
      [
        {
          name: "Tom Hartley",
          role: "Product Director, Arch",
          text: "First agency I've worked with that actually did what they said when they said they would. Rare.",
        },
        {
          name: "Emilia Novak",
          role: "Founder, Kura",
          text: "The weekly updates meant zero anxiety. We always knew exactly where the project stood.",
        },
        {
          name: "Ben Santos",
          role: "Head of Marketing, Relay",
          text: "Delivered on scope, on time, on budget. The result was better than we hoped.",
        },
      ],
    ),
    buildFAQ(
      "bg-blue-50",
      "Good to Know",
      "text-foreground",
      "bg-card border border-blue-100",
      "text-foreground",
      "text-muted-foreground",
      AGENCY_FAQ,
    ),
    buildNewsletter(
      "bg-blue-900",
      "Agency Thinking",
      "How we approach problems, run projects, and stay honest with clients.",
      "text-white",
      "text-blue-300",
      "bg-card text-foreground",
      "bg-card text-blue-950 hover:bg-blue-50",
    ),
    buildFooter(
      "bg-blue-950",
      "Finito",
      "The agency that runs projects the way clients always wished agencies would.",
      "text-white",
      "text-blue-400",
      "text-blue-400",
      "border-blue-900",
      [
        { label: "Services", links: ["Branding", "Web", "Strategy", "Print"] },
        { label: "Company", links: ["About", "Process", "Results"] },
        { label: "Contact", links: ["Start a Project", "Email", "LinkedIn"] },
      ],
    ),
  ];
}

function buildLimitless(): EditorNode[] {
  return [
    buildHeader(
      "Limitless",
      "bg-violet-950 border-b border-white/8",
      "text-white",
      "text-violet-300",
      "bg-violet-500 hover:bg-violet-400 text-white",
      ["How It Works", "Pricing", "Work"],
      "Get Started",
    ),
    buildHero(
      "Design subscription",
      "The truly Limitless design subscription.",
      "Say goodbye to expensive freelancers and slow agencies. Lightning-fast, unlimited design — one flat monthly fee.",
      "bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900",
      "bg-violet-500/30 text-violet-300",
      "text-white",
      "text-violet-200",
      "bg-violet-500 hover:bg-violet-400 text-white",
      "Subscribe Now",
      "border border-violet-400/30 text-violet-200 hover:bg-violet-500/20",
      "See Examples",
    ),
    buildFeatured(
      "bg-card",
      "How It Works",
      "Subscribe, request, and receive. Repeat.",
      "text-foreground",
      "text-muted-foreground",
      [
        {
          icon: "✦",
          title: "Subscribe & Request",
          desc: "Pick your plan, submit your first design request, and we get to work the same day.",
          cardCls: "bg-violet-50 border border-violet-100",
          iconBg: "bg-violet-100",
          titleCls: "text-foreground",
          descCls: "text-muted-foreground",
        },
        {
          icon: "✦",
          title: "Review & Revise",
          desc: "Get your first draft in 1–2 business days. Revise as many times as you need.",
          cardCls: "bg-violet-50 border border-violet-100",
          iconBg: "bg-violet-100",
          titleCls: "text-foreground",
          descCls: "text-muted-foreground",
        },
        {
          icon: "✦",
          title: "Scale as Needed",
          desc: "Pause or cancel anytime. No lock-ins, no minimums, just pure design output.",
          cardCls: "bg-violet-50 border border-violet-100",
          iconBg: "bg-violet-100",
          titleCls: "text-foreground",
          descCls: "text-muted-foreground",
        },
      ],
    ),
    buildGallery(
      "bg-violet-950",
      "Recent Deliveries",
      "text-white",
      AGENCY_GALLERY,
    ),
    buildTestimonials(
      "bg-card",
      "Subscribers Love It",
      "text-foreground",
      "bg-muted border border-border",
      "text-muted-foreground",
      "text-foreground",
      "text-muted-foreground",
      "bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white",
      [
        {
          name: "Nina Patel",
          role: "Founder, Gleam",
          text: "We went from waiting weeks for designs to receiving them in 24 hours. Game changer.",
        },
        {
          name: "Jake Monroe",
          role: "Marketing Lead, Fuse",
          text: "The quality surprised us. These aren't quick mockups — they're proper production-ready designs.",
        },
        {
          name: "Claire Berg",
          role: "CEO, Slate",
          text: "Cancelled our in-house designer contract and saved $60k/year. Don't sleep on this.",
        },
      ],
    ),
    buildFAQ(
      "bg-violet-50",
      "Your Questions, Answered",
      "text-foreground",
      "bg-card border border-violet-100",
      "text-foreground",
      "text-muted-foreground",
      AGENCY_FAQ,
    ),
    buildNewsletter(
      "bg-violet-800",
      "Design Drops",
      "Weekly design inspiration and subscriber-only resources in your inbox.",
      "text-white",
      "text-violet-300",
      "bg-card text-foreground",
      "bg-violet-950 hover:bg-violet-900 text-white",
    ),
    buildFooter(
      "bg-violet-950",
      "Limitless",
      "Unlimited design for a flat monthly fee. Used by 500+ growing companies.",
      "text-white",
      "text-violet-400",
      "text-violet-400",
      "border-violet-900",
      [
        { label: "Product", links: ["How It Works", "Pricing", "Examples"] },
        {
          label: "Compare",
          links: ["vs Agencies", "vs Freelancers", "vs In-House"],
        },
        { label: "Company", links: ["About", "Blog", "Careers"] },
      ],
    ),
  ];
}

function buildMagnetto(): EditorNode[] {
  return [
    buildHeader(
      "MAGNETTO",
      "bg-black border-b border-white/8",
      "text-amber-400",
      "text-muted-foreground",
      "border border-amber-400/40 text-amber-400 hover:bg-amber-400/10",
      ["Work", "Experience", "Contact"],
      "Download CV",
    ),
    buildHero(
      "Open to opportunities",
      "MAGNETTO",
      "Product designer with a bold perspective on interface design. 6 years turning ideas into pixel-perfect products.",
      "bg-black",
      "bg-amber-400/15 text-amber-400",
      "text-amber-400 text-6xl",
      "text-muted-foreground",
      "bg-amber-400 text-black hover:bg-amber-300 font-bold",
      "View Work",
      "border border-white/20 text-white hover:bg-card/8",
      "Get in Touch",
    ),
    buildFeatured(
      "bg-amber-50",
      "Skills & Expertise",
      "What I bring to every project I touch.",
      "text-foreground",
      "text-muted-foreground",
      [
        {
          icon: "✦",
          title: "Product Design",
          desc: "End-to-end product design from research and wireframing through to polished UI.",
          cardCls: "bg-card border border-amber-100",
          iconBg: "bg-amber-100",
          titleCls: "text-foreground",
          descCls: "text-muted-foreground",
        },
        {
          icon: "✦",
          title: "Interaction Design",
          desc: "Micro-interactions and animations that make interfaces feel alive and intentional.",
          cardCls: "bg-card border border-amber-100",
          iconBg: "bg-amber-100",
          titleCls: "text-foreground",
          descCls: "text-muted-foreground",
        },
        {
          icon: "✦",
          title: "Design Systems",
          desc: "Scalable component libraries that keep design and engineering in sync.",
          cardCls: "bg-card border border-amber-100",
          iconBg: "bg-amber-100",
          titleCls: "text-foreground",
          descCls: "text-muted-foreground",
        },
      ],
    ),
    buildGallery("bg-black", "Projects", "text-white", RESUME_GALLERY),
    buildTestimonials(
      "bg-amber-50",
      "References",
      "text-foreground",
      "bg-card border border-amber-100",
      "text-muted-foreground",
      "text-foreground",
      "text-muted-foreground",
      "bg-gradient-to-br from-amber-400 to-orange-500 text-black",
      [
        {
          name: "Yuki Tanaka",
          role: "Head of Product, Orbit",
          text: "One of the most talented designers I've managed. Magnetto raises the bar for everyone on the team.",
        },
        {
          name: "Leo Chambers",
          role: "CTO, Vantage",
          text: "Rare combination of design taste and technical understanding. Shipped faster than any designer I've worked with.",
        },
        {
          name: "Diane Müller",
          role: "CEO, Frame",
          text: "Completely elevated our product design practice. The systems he built are still paying dividends.",
        },
      ],
    ),
    buildFAQ(
      "bg-card",
      "Good to Know",
      "text-foreground",
      "bg-muted border border-border",
      "text-foreground",
      "text-muted-foreground",
      RESUME_FAQ,
    ),
    buildNewsletter(
      "bg-black",
      "Let's Work Together",
      "Open to full-time roles and select freelance projects. Drop me a line.",
      "text-white",
      "text-muted-foreground",
      "bg-card text-foreground",
      "bg-amber-400 text-black hover:bg-amber-300 font-bold",
    ),
    buildFooter(
      "bg-black",
      "MAGNETTO",
      "Product designer based in Amsterdam. Available for full-time and contract work.",
      "text-amber-400",
      "text-muted-foreground",
      "text-muted-foreground",
      "border-white/10",
      [
        { label: "Work", links: ["Portfolio", "Case Studies", "Dribbble"] },
        { label: "Background", links: ["Experience", "Skills", "Education"] },
        { label: "Contact", links: ["Email", "LinkedIn", "Twitter"] },
      ],
    ),
  ];
}

function buildClassicCV(): EditorNode[] {
  return [
    buildHeader(
      "John Doe",
      "bg-foreground",
      "text-white",
      "text-muted-foreground",
      "bg-card text-foreground hover:bg-muted",
      ["About", "Experience", "Projects"],
      "Download Resume",
    ),
    buildHero(
      "Senior Product Designer · 8 years",
      "Crafting digital products people love to use.",
      "I specialize in product strategy, UX research, and interface design for software companies — from seed-stage startups to public companies.",
      "bg-gradient-to-br from-muted to-muted",
      null,
      "text-white",
      "text-muted-foreground",
      "bg-card text-foreground hover:bg-muted",
      "View Work",
      "border border-border text-muted-foreground hover:bg-muted",
      "Get in Touch",
    ),
    buildFeatured(
      "bg-card",
      "Experience Highlights",
      "A career shaped by meaningful products and great teams.",
      "text-foreground",
      "text-muted-foreground",
      [
        {
          icon: "🏢",
          title: "Atlassian · 3 yrs",
          desc: "Led design for Confluence's editor experience, serving 10M+ daily users.",
          cardCls: "bg-muted border border-border",
          iconBg: "bg-muted",
          titleCls: "text-foreground",
          descCls: "text-muted-foreground",
        },
        {
          icon: "🏢",
          title: "Intercom · 2 yrs",
          desc: "Redesigned the Inbox product, reducing support resolution time by 30%.",
          cardCls: "bg-muted border border-border",
          iconBg: "bg-muted",
          titleCls: "text-foreground",
          descCls: "text-muted-foreground",
        },
        {
          icon: "🏢",
          title: "Freelance · 3 yrs",
          desc: "Worked with 20+ startups on product design, brand, and design systems.",
          cardCls: "bg-muted border border-border",
          iconBg: "bg-muted",
          titleCls: "text-foreground",
          descCls: "text-muted-foreground",
        },
      ],
    ),
    buildGallery(
      "bg-muted",
      "Selected Projects",
      "text-foreground",
      RESUME_GALLERY,
    ),
    buildTestimonials(
      "bg-card",
      "Recommendations",
      "text-foreground",
      "bg-muted border border-border",
      "text-muted-foreground",
      "text-foreground",
      "text-muted-foreground",
      "bg-gradient-to-br from-muted to-muted text-white",
      [
        {
          name: "Amy Chen",
          role: "Director of Design, Atlassian",
          text: "John is among the strongest designers I've led. His thinking is sharp and his craft is exceptional.",
        },
        {
          name: "Mark O'Brien",
          role: "VP Product, Intercom",
          text: "Rare ability to zoom between strategic thinking and detailed execution. A true product design leader.",
        },
        {
          name: "Tara Singh",
          role: "Founder, Fable",
          text: "John brought structure and taste to our design practice. He's the reason our product looks world-class.",
        },
      ],
    ),
    buildFAQ(
      "bg-muted",
      "FAQ",
      "text-foreground",
      "bg-card border border-border",
      "text-foreground",
      "text-muted-foreground",
      RESUME_FAQ,
    ),
    buildNewsletter(
      "bg-foreground",
      "Get in Touch",
      "Interested in working together? I'd love to hear about your team and what you're building.",
      "text-white",
      "text-muted-foreground",
      "bg-card text-foreground",
      "bg-card text-foreground hover:bg-muted",
    ),
    buildFooter(
      "bg-foreground",
      "John Doe",
      "Senior Product Designer open to new opportunities. Based in San Francisco.",
      "text-white",
      "text-muted-foreground",
      "text-muted-foreground",
      "border-border",
      [
        { label: "Work", links: ["Portfolio", "Case Studies", "Resume PDF"] },
        { label: "Background", links: ["Experience", "Education", "Skills"] },
        { label: "Contact", links: ["Email", "LinkedIn", "Twitter"] },
      ],
    ),
  ];
}

function buildVivid(): EditorNode[] {
  return [
    buildHeader(
      "Jane Smith",
      "bg-emerald-700",
      "text-white",
      "text-emerald-200",
      "bg-card text-emerald-700 hover:bg-emerald-50",
      ["About", "Projects", "Writing"],
      "Hire Me",
    ),
    buildHero(
      "Full-Stack Engineer",
      "Building things people love.",
      "I write clean code, ship fast, and care deeply about the products I work on. Currently open to senior engineering roles at mission-driven companies.",
      "bg-gradient-to-br from-emerald-600 to-teal-700",
      "bg-card/15 text-white",
      "text-white",
      "text-emerald-100",
      "bg-card text-emerald-700 hover:bg-emerald-50 font-semibold",
      "See Projects",
      "border border-white/30 text-white hover:bg-card/10",
      "Read My Writing",
    ),
    buildFeatured(
      "bg-card",
      "Skills",
      "Technologies I use daily and the depth of my experience with each.",
      "text-foreground",
      "text-muted-foreground",
      [
        {
          icon: "⚛️",
          title: "Frontend",
          desc: "React, TypeScript, Next.js, Tailwind CSS, and a deep appreciation for performance and accessibility.",
          cardCls: "bg-emerald-50 border border-emerald-100",
          iconBg: "bg-emerald-100",
          titleCls: "text-foreground",
          descCls: "text-muted-foreground",
        },
        {
          icon: "🛠️",
          title: "Backend",
          desc: "Node.js, PostgreSQL, Redis, Prisma, tRPC, and various cloud infrastructure on AWS.",
          cardCls: "bg-emerald-50 border border-emerald-100",
          iconBg: "bg-emerald-100",
          titleCls: "text-foreground",
          descCls: "text-muted-foreground",
        },
        {
          icon: "🔧",
          title: "Tooling",
          desc: "Docker, GitHub Actions, Vercel, Linear, Figma — the full modern engineering workflow.",
          cardCls: "bg-emerald-50 border border-emerald-100",
          iconBg: "bg-emerald-100",
          titleCls: "text-foreground",
          descCls: "text-muted-foreground",
        },
      ],
    ),
    buildGallery("bg-emerald-50", "Projects", "text-foreground", RESUME_GALLERY),
    buildTestimonials(
      "bg-card",
      "Recommendations",
      "text-foreground",
      "bg-muted border border-border",
      "text-muted-foreground",
      "text-foreground",
      "text-muted-foreground",
      "bg-gradient-to-br from-emerald-500 to-teal-600 text-white",
      [
        {
          name: "Liam Torres",
          role: "Engineering Manager, Linear",
          text: "Jane is the kind of engineer who makes everyone around her better. Output is exceptional, velocity is high.",
        },
        {
          name: "Ava Johnson",
          role: "CTO, Bloom",
          text: "She built our entire data pipeline solo in 6 weeks. What she shipped would typically take a team of four.",
        },
        {
          name: "Noah Williams",
          role: "Founder, Sketch",
          text: "Jane cares about the product, not just the code. That's rare and makes a massive difference at our stage.",
        },
      ],
    ),
    buildFAQ(
      "bg-teal-50",
      "FAQ",
      "text-foreground",
      "bg-card border border-teal-100",
      "text-foreground",
      "text-muted-foreground",
      RESUME_FAQ,
    ),
    buildNewsletter(
      "bg-emerald-700",
      "Engineering Notes",
      "I write occasionally about React, systems design, and building products at speed.",
      "text-white",
      "text-emerald-200",
      "bg-card text-foreground",
      "bg-emerald-950 hover:bg-emerald-900 text-white",
    ),
    buildFooter(
      "bg-foreground",
      "Jane Smith",
      "Full-Stack Engineer. Building on the web since 2016. Based in Toronto.",
      "text-white",
      "text-muted-foreground",
      "text-muted-foreground",
      "border-border",
      [
        { label: "Work", links: ["Projects", "Open Source", "Writing"] },
        { label: "Background", links: ["Experience", "Skills", "Education"] },
        { label: "Contact", links: ["Email", "GitHub", "LinkedIn"] },
      ],
    ),
  ];
}

// ─── Types & data ─────────────────────────────────────────────────────────────

type Category = "All" | "Portfolio" | "Business" | "Agency" | "Resume";

interface ThumbnailTheme {
  header: string;
  hero: string;
  heroLine: string;
  featured: string;
  gallery: string;
  testimonial: string;
  newsletter: string;
  newsletterBtn: string;
  footer: string;
}

interface Template {
  id: string;
  name: string;
  author: string;
  category: Exclude<Category, "All">;
  theme: ThumbnailTheme;
  buildNodes: () => EditorNode[];
}

const TEMPLATES: Template[] = [
  {
    id: "porto-lando",
    name: "Lando",
    author: "Gustave Flowbert",
    category: "Portfolio",
    theme: {
      header: "bg-card",
      hero: "bg-gradient-to-br from-rose-400 to-orange-400",
      heroLine: "bg-card/70",
      featured: "bg-card",
      gallery: "bg-muted",
      testimonial: "bg-rose-50",
      newsletter: "bg-rose-600",
      newsletterBtn: "bg-foreground",
      footer: "bg-foreground",
    },
    buildNodes: buildLando,
  },
  {
    id: "porto-florent",
    name: "Florent S.",
    author: "Omakase",
    category: "Portfolio",
    theme: {
      header: "bg-black",
      hero: "bg-gradient-to-br from-orange-700 to-red-600",
      heroLine: "bg-card/70",
      featured: "bg-foreground",
      gallery: "bg-black",
      testimonial: "bg-foreground",
      newsletter: "bg-orange-600",
      newsletterBtn: "bg-black",
      footer: "bg-black",
    },
    buildNodes: buildFlorent,
  },
  {
    id: "porto-minimal",
    name: "Minimal Folio",
    author: "Studio Nord",
    category: "Portfolio",
    theme: {
      header: "bg-card",
      hero: "bg-foreground",
      heroLine: "bg-card/70",
      featured: "bg-muted",
      gallery: "bg-card",
      testimonial: "bg-muted",
      newsletter: "bg-foreground",
      newsletterBtn: "bg-card",
      footer: "bg-foreground",
    },
    buildNodes: buildMinimalFolio,
  },
  {
    id: "biz-talentify",
    name: "Talentify",
    author: "Ramish Aziz",
    category: "Business",
    theme: {
      header: "bg-primary",
      hero: "bg-gradient-to-br from-primary to-violet-900",
      heroLine: "bg-card/70",
      featured: "bg-card",
      gallery: "bg-primary/10",
      testimonial: "bg-card",
      newsletter: "bg-primary",
      newsletterBtn: "bg-primary",
      footer: "bg-primary",
    },
    buildNodes: buildTalentify,
  },
  {
    id: "biz-noora",
    name: "Noora",
    author: "Jakke Dea",
    category: "Business",
    theme: {
      header: "bg-card",
      hero: "bg-card",
      heroLine: "bg-muted",
      featured: "bg-muted",
      gallery: "bg-card",
      testimonial: "bg-muted",
      newsletter: "bg-foreground",
      newsletterBtn: "bg-card",
      footer: "bg-foreground",
    },
    buildNodes: buildNoora,
  },
  {
    id: "biz-pixend",
    name: "Pixend",
    author: "EV Studio",
    category: "Business",
    theme: {
      header: "bg-blue-950",
      hero: "bg-gradient-to-br from-blue-800 to-primary",
      heroLine: "bg-card/70",
      featured: "bg-card",
      gallery: "bg-blue-50",
      testimonial: "bg-card",
      newsletter: "bg-blue-600",
      newsletterBtn: "bg-blue-950",
      footer: "bg-blue-950",
    },
    buildNodes: buildPixend,
  },
  {
    id: "agency-portfolite",
    name: "Portfolite",
    author: "Framebase",
    category: "Agency",
    theme: {
      header: "bg-black",
      hero: "bg-foreground",
      heroLine: "bg-card/70",
      featured: "bg-black",
      gallery: "bg-foreground",
      testimonial: "bg-black",
      newsletter: "bg-card",
      newsletterBtn: "bg-black",
      footer: "bg-black",
    },
    buildNodes: buildPortfolite,
  },
  {
    id: "agency-finito",
    name: "Finito",
    author: "Tiago Silva",
    category: "Agency",
    theme: {
      header: "bg-blue-950",
      hero: "bg-gradient-to-br from-blue-900 to-primary",
      heroLine: "bg-card/70",
      featured: "bg-card",
      gallery: "bg-blue-950",
      testimonial: "bg-card",
      newsletter: "bg-blue-900",
      newsletterBtn: "bg-card",
      footer: "bg-blue-950",
    },
    buildNodes: buildFinito,
  },
  {
    id: "agency-limitless",
    name: "Limitless",
    author: "Hamza Ehsan",
    category: "Agency",
    theme: {
      header: "bg-violet-950",
      hero: "bg-gradient-to-br from-violet-900 to-fuchsia-900",
      heroLine: "bg-card/70",
      featured: "bg-card",
      gallery: "bg-violet-950",
      testimonial: "bg-card",
      newsletter: "bg-violet-800",
      newsletterBtn: "bg-violet-950",
      footer: "bg-violet-950",
    },
    buildNodes: buildLimitless,
  },
  {
    id: "resume-magnetto",
    name: "Magnetto",
    author: "Future Things",
    category: "Resume",
    theme: {
      header: "bg-black",
      hero: "bg-black",
      heroLine: "bg-amber-400/70",
      featured: "bg-amber-50",
      gallery: "bg-black",
      testimonial: "bg-amber-50",
      newsletter: "bg-black",
      newsletterBtn: "bg-amber-400",
      footer: "bg-black",
    },
    buildNodes: buildMagnetto,
  },
  {
    id: "resume-classic",
    name: "Classic CV",
    author: "Type Studio",
    category: "Resume",
    theme: {
      header: "bg-foreground",
      hero: "bg-gradient-to-br from-muted to-muted",
      heroLine: "bg-card/70",
      featured: "bg-card",
      gallery: "bg-muted",
      testimonial: "bg-card",
      newsletter: "bg-foreground",
      newsletterBtn: "bg-card",
      footer: "bg-foreground",
    },
    buildNodes: buildClassicCV,
  },
  {
    id: "resume-vivid",
    name: "Vivid",
    author: "ColorLab",
    category: "Resume",
    theme: {
      header: "bg-emerald-700",
      hero: "bg-gradient-to-br from-emerald-600 to-teal-700",
      heroLine: "bg-card/70",
      featured: "bg-card",
      gallery: "bg-emerald-50",
      testimonial: "bg-card",
      newsletter: "bg-emerald-700",
      newsletterBtn: "bg-emerald-950",
      footer: "bg-foreground",
    },
    buildNodes: buildVivid,
  },
];

// ─── Thumbnail preview ────────────────────────────────────────────────────────

function PageThumbnail({ theme }: { theme: ThumbnailTheme }) {
  return (
    <div className="w-full aspect-[4/3] rounded-xl overflow-hidden flex flex-col text-[0px]">
      {/* Header */}
      <div
        className={cn(
          theme.header,
          "h-[9%] shrink-0 flex items-center px-2 gap-1.5",
        )}
      >
        <div className="w-6 h-1.5 rounded-sm bg-current opacity-50" />
        <div className="ml-auto flex gap-1 items-center">
          <div className="w-4 h-1 rounded bg-current opacity-20" />
          <div className="w-4 h-1 rounded bg-current opacity-20" />
          <div
            className={cn(theme.newsletterBtn, "w-5 h-2 rounded opacity-80")}
          />
        </div>
      </div>
      {/* Hero */}
      <div
        className={cn(
          theme.hero,
          "h-[29%] shrink-0 flex flex-col items-center justify-center gap-1 px-3",
        )}
      >
        <div className={cn(theme.heroLine, "h-2 w-1/2 rounded-sm")} />
        <div
          className={cn(theme.heroLine, "h-1.5 w-2/3 rounded-sm opacity-60")}
        />
        <div
          className={cn(
            theme.heroLine,
            "h-1.5 w-5/12 rounded-sm opacity-40 mt-0.5",
          )}
        />
        <div
          className={cn(
            theme.newsletterBtn,
            "h-3 w-1/4 rounded-full mt-1 opacity-90",
          )}
        />
      </div>
      {/* Featured */}
      <div className={cn(theme.featured, "h-[19%] shrink-0 flex gap-1 p-1.5")}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex-1 rounded-lg bg-black/5 dark:bg-card/5 flex flex-col gap-0.5 p-1.5"
          >
            <div className="w-3 h-3 rounded bg-black/10 dark:bg-card/10 mb-0.5" />
            <div className="h-1 w-3/4 rounded bg-black/15 dark:bg-card/15" />
            <div className="h-1 w-full rounded bg-black/8 dark:bg-card/8" />
          </div>
        ))}
      </div>
      {/* Gallery */}
      <div className={cn(theme.gallery, "h-[16%] shrink-0 flex gap-0.5 p-1.5")}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex-1 rounded bg-black/15 dark:bg-card/15"
          />
        ))}
      </div>
      {/* Testimonials */}
      <div
        className={cn(theme.testimonial, "h-[13%] shrink-0 flex gap-1 p-1.5")}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex-1 rounded-lg bg-black/5 dark:bg-card/5 p-1"
          >
            <div className="h-1 w-full rounded bg-black/10 dark:bg-card/10 mb-0.5" />
            <div className="h-1 w-3/4 rounded bg-black/10 dark:bg-card/10" />
          </div>
        ))}
      </div>
      {/* Newsletter */}
      <div
        className={cn(
          theme.newsletter,
          "h-[9%] shrink-0 flex items-center justify-center gap-1.5 px-2",
        )}
      >
        <div className="h-1.5 w-1/3 rounded bg-current opacity-40" />
        <div
          className={cn(theme.newsletterBtn, "h-3 w-1/5 rounded-lg opacity-90")}
        />
      </div>
      {/* Footer */}
      <div className={cn(theme.footer, "flex-1 min-h-0")} />
    </div>
  );
}

// ─── Picker component ─────────────────────────────────────────────────────────

interface TemplatePickerProps {
  open: boolean;
  onClose: () => void;
}

export default function TemplatePicker({ open, onClose }: TemplatePickerProps) {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const { addNode, clearCanvas } = useEditorStore();

  const categories: Category[] = [
    "All",
    "Portfolio",
    "Business",
    "Agency",
    "Resume",
  ];

  const visible =
    activeCategory === "All"
      ? TEMPLATES
      : TEMPLATES.filter((t) => t.category === activeCategory);

  function handleSelect(template: Template) {
    clearCanvas();
    template.buildNodes().forEach((node) => addNode(node));
    onClose();
  }

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm
            data-open:animate-in data-open:fade-in-0
            data-closed:animate-out data-closed:fade-out-0 duration-150"
        />
        <DialogPrimitive.Popup
          className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2
            w-[calc(100vw-2rem)] max-w-5xl max-h-[calc(100vh-3rem)]
            flex flex-col bg-card
            rounded-2xl shadow-2xl outline-none overflow-hidden
            data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95
            data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95
            duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-7 py-5 border-b border-border dark:border-white/8 shrink-0">
            <DialogPrimitive.Title className="text-lg font-semibold text-foreground dark:text-white">
              Pick a Template
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              className="p-1.5 rounded-lg text-muted-foreground hover:text-muted-foreground hover:bg-muted
                dark:text-muted-foreground dark:hover:text-muted-foreground dark:hover:bg-card/8 transition-colors"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </DialogPrimitive.Close>
          </div>

          {/* Body */}
          <div className="flex flex-1 min-h-0">
            {/* Sidebar */}
            <aside className="w-52 shrink-0 flex flex-col border-r border-border dark:border-white/8 p-5">
              <nav className="flex flex-col gap-0.5 flex-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      "text-left px-3 py-2 rounded-sm text-sm transition-colors",
                      activeCategory === cat
                        ? "bg-muted dark:bg-card/10 text-foreground dark:text-white font-medium"
                        : "text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-muted dark:hover:bg-card/6",
                    )}
                  >
                    {cat === "All" ? "All Templates" : cat}
                  </button>
                ))}
              </nav>
              <button
                onClick={onClose}
                className="mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm border border-border shadow-xs dark:border-white/10
                  text-sm font-medium text-muted-foreground dark:text-muted-foreground
                  hover:bg-muted dark:hover:bg-card/6 transition-colors text-left"
              >
                <LayersPlus className="w-4 h-4" />
                Start blank
              </button>
            </aside>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-6 bg-muted min-h-[calc(100vh-150px)] max-h-[calc(100vh-150px)]">
              <div className="grid grid-cols-3 gap-5">
                {visible.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelect(template)}
                    className="group text-left flex flex-col gap-2.5 focus:outline-none"
                  >
                    <div
                      className={cn(
                        "w-full rounded-xl overflow-hidden",
                        "ring-2 ring-transparent group-hover:ring-ring dark:group-hover:ring-primary",
                        "group-focus-visible:ring-ring dark:group-focus-visible:ring-primary",
                        "transition-all duration-150 shadow-sm",
                      )}
                    >
                      <PageThumbnail theme={template.theme} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground dark:text-white leading-tight">
                        {template.name}
                      </p>
                      <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-0.5">
                        {template.author}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
