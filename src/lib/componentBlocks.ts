import type { ComponentBlock, EditorNode } from "@/types/editor";
import { nanoid } from "nanoid";

function makeId() {
  return nanoid(8);
}

function makeNode(
  type: string,
  tag: string,
  className: string,
  content?: string,
  children?: EditorNode[],
  props?: Record<string, string>,
): EditorNode {
  return { id: makeId(), type, tag, className, content, children, props };
}

export const COMPONENT_BLOCKS: ComponentBlock[] = [
  // ─── HERO ──────────────────────────────────────────────────────
  {
    id: "hero-centered",
    label: "Hero Centered",
    category: "Hero",
    icon: "layout",
    template: makeNode(
      "section",
      "section",
      "relative bg-gradient-to-br from-slate-900 to-slate-800 py-24 px-6 text-center min-h-[600px] flex items-center justify-center",
      undefined,
      [
        makeNode("div", "div", "max-w-4xl mx-auto", undefined, [
          makeNode(
            "span",
            "span",
            "inline-block bg-indigo-500/20 text-indigo-400 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-widest",
            "New Release",
          ),
          makeNode(
            "h1",
            "h1",
            "text-5xl @md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight",
            "Build beautiful websites faster",
          ),
          makeNode(
            "p",
            "p",
            "text-xl text-slate-400 mb-8 max-w-2xl mx-auto",
            "The most powerful drag-and-drop builder for modern web projects. No code required.",
          ),
          makeNode(
            "div",
            "div",
            "flex gap-4 justify-center flex-wrap",
            undefined,
            [
              makeNode(
                "a",
                "a",
                "bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-xl transition-all",
                "Get Started Free",
                undefined,
                { href: "#" },
              ),
              makeNode(
                "a",
                "a",
                "border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-semibold px-8 py-3 rounded-xl transition-all",
                "View Demo",
                undefined,
                { href: "#" },
              ),
            ],
          ),
        ]),
      ],
    ),
  },
  {
    id: "hero-split",
    label: "Hero Split",
    category: "Hero",
    icon: "layout",
    template: makeNode("section", "section", "bg-white py-20 px-6", undefined, [
      makeNode(
        "div",
        "div",
        "max-w-6xl mx-auto grid grid-cols-1 @md:grid-cols-2 gap-12 items-center",
        undefined,
        [
          makeNode("div", "div", "", undefined, [
            makeNode(
              "h1",
              "h1",
              "text-5xl font-bold text-gray-900 mb-5 leading-tight",
              "The future of web design is here",
            ),
            makeNode(
              "p",
              "p",
              "text-gray-500 text-lg mb-8",
              "Create stunning pages visually with our next-generation editor.",
            ),
            makeNode(
              "a",
              "a",
              "bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg inline-block",
              "Start Building",
              undefined,
              { href: "#" },
            ),
          ]),
          makeNode(
            "div",
            "div",
            "bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl aspect-video",
            undefined,
            [],
          ),
        ],
      ),
    ]),
  },

  // ─── NAVBAR ────────────────────────────────────────────────────
  {
    id: "navbar-simple",
    label: "Navbar Simple",
    category: "Navbar",
    icon: "menu",
    template: makeNode(
      "nav",
      "nav",
      "bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50",
      undefined,
      [
        makeNode(
          "div",
          "div",
          "max-w-6xl mx-auto flex items-center justify-between",
          undefined,
          [
            makeNode(
              "a",
              "a",
              "text-xl font-bold text-gray-900",
              "Brand",
              undefined,
              { href: "#" },
            ),
            makeNode(
              "div",
              "div",
              "hidden @md:flex items-center gap-8",
              undefined,
              [
                makeNode(
                  "a",
                  "a",
                  "text-gray-600 hover:text-gray-900 text-sm font-medium",
                  "Features",
                  undefined,
                  { href: "#" },
                ),
                makeNode(
                  "a",
                  "a",
                  "text-gray-600 hover:text-gray-900 text-sm font-medium",
                  "Pricing",
                  undefined,
                  { href: "#" },
                ),
                makeNode(
                  "a",
                  "a",
                  "text-gray-600 hover:text-gray-900 text-sm font-medium",
                  "About",
                  undefined,
                  { href: "#" },
                ),
                makeNode(
                  "a",
                  "a",
                  "bg-blue-600 text-white text-sm font-semibold px-5 py-2 rounded-lg",
                  "Get Started",
                  undefined,
                  { href: "#" },
                ),
              ],
            ),
          ],
        ),
      ],
    ),
  },
  {
    id: "navbar-dark",
    label: "Navbar Dark",
    category: "Navbar",
    icon: "menu",
    template: makeNode(
      "nav",
      "nav",
      "bg-slate-900 px-6 py-4 sticky top-0 z-50",
      undefined,
      [
        makeNode(
          "div",
          "div",
          "max-w-6xl mx-auto flex items-center justify-between",
          undefined,
          [
            makeNode(
              "a",
              "a",
              "text-xl font-bold text-white",
              "Brand",
              undefined,
              { href: "#" },
            ),
            makeNode("div", "div", "flex items-center gap-6", undefined, [
              makeNode(
                "a",
                "a",
                "text-slate-400 hover:text-white text-sm",
                "Home",
                undefined,
                { href: "#" },
              ),
              makeNode(
                "a",
                "a",
                "text-slate-400 hover:text-white text-sm",
                "Docs",
                undefined,
                { href: "#" },
              ),
              makeNode(
                "a",
                "a",
                "bg-indigo-600 text-white text-sm font-semibold px-5 py-2 rounded-lg",
                "Sign Up",
                undefined,
                { href: "#" },
              ),
            ]),
          ],
        ),
      ],
    ),
  },

  // ─── FEATURES ──────────────────────────────────────────────────
  {
    id: "features-grid",
    label: "Features Grid",
    category: "Features",
    icon: "grid",
    template: makeNode(
      "section",
      "section",
      "py-20 px-6 bg-gray-50",
      undefined,
      [
        makeNode("div", "div", "max-w-6xl mx-auto", undefined, [
          makeNode("div", "div", "text-center mb-14", undefined, [
            makeNode(
              "h2",
              "h2",
              "text-4xl font-bold text-gray-900 mb-4",
              "Everything you need",
            ),
            makeNode(
              "p",
              "p",
              "text-gray-500 max-w-xl mx-auto",
              "Powerful features to help you build, ship, and scale your website.",
            ),
          ]),
          makeNode(
            "div",
            "div",
            "grid grid-cols-1 @md:grid-cols-3 gap-8",
            undefined,
            [
              ...[
                [
                  "⚡",
                  "Lightning Fast",
                  "Optimized for performance with zero compromises.",
                ],
                [
                  "🎨",
                  "Beautiful Design",
                  "Pixel-perfect components ready to use.",
                ],
                [
                  "🔒",
                  "Secure by Default",
                  "Enterprise-grade security out of the box.",
                ],
                ["📱", "Fully Responsive", "Looks great on every screen size."],
                [
                  "🔧",
                  "Easy to Customize",
                  "Tailor everything to match your brand.",
                ],
                [
                  "🚀",
                  "Quick Deploy",
                  "Go live in minutes with one-click deployment.",
                ],
              ].map(([icon, title, desc]) =>
                makeNode(
                  "div",
                  "div",
                  "bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow",
                  undefined,
                  [
                    makeNode("div", "div", "text-3xl mb-4", icon as string),
                    makeNode(
                      "h3",
                      "h3",
                      "text-lg font-semibold text-gray-900 mb-2",
                      title as string,
                    ),
                    makeNode(
                      "p",
                      "p",
                      "text-gray-500 text-sm leading-relaxed",
                      desc as string,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ]),
      ],
    ),
  },

  // ─── PRICING ───────────────────────────────────────────────────
  {
    id: "pricing-cards",
    label: "Pricing Cards",
    category: "Pricing",
    icon: "dollar-sign",
    template: makeNode("section", "section", "py-20 px-6 bg-white", undefined, [
      makeNode("div", "div", "max-w-5xl mx-auto", undefined, [
        makeNode("div", "div", "text-center mb-14", undefined, [
          makeNode(
            "h2",
            "h2",
            "text-4xl font-bold text-gray-900 mb-3",
            "Simple, transparent pricing",
          ),
          makeNode(
            "p",
            "p",
            "text-gray-500",
            "Choose the plan that works best for you.",
          ),
        ]),
        makeNode(
          "div",
          "div",
          "grid grid-cols-1 @md:grid-cols-3 gap-8",
          undefined,
          [
            ...[
              {
                name: "Starter",
                price: "$9",
                features: ["5 Projects", "10GB Storage", "Basic Support"],
              },
              {
                name: "Pro",
                price: "$29",
                features: [
                  "Unlimited Projects",
                  "100GB Storage",
                  "Priority Support",
                  "Custom Domain",
                ],
                highlighted: true,
              },
              {
                name: "Enterprise",
                price: "$99",
                features: [
                  "Everything in Pro",
                  "SSO",
                  "SLA",
                  "Dedicated Manager",
                ],
              },
            ].map((plan) =>
              makeNode(
                "div",
                "div",
                `rounded-2xl p-8 border ${
                  (plan as typeof plan & { highlighted?: boolean }).highlighted
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "bg-gray-50 border-gray-200"
                }`,
                undefined,
                [
                  makeNode(
                    "h3",
                    "h3",
                    `text-lg font-semibold mb-2 ${(plan as typeof plan & { highlighted?: boolean }).highlighted ? "text-white" : "text-gray-900"}`,
                    plan.name,
                  ),
                  makeNode("div", "div", "mb-6", undefined, [
                    makeNode(
                      "span",
                      "span",
                      `text-4xl font-bold ${(plan as typeof plan & { highlighted?: boolean }).highlighted ? "text-white" : "text-gray-900"}`,
                      plan.price,
                    ),
                    makeNode(
                      "span",
                      "span",
                      `text-sm ${(plan as typeof plan & { highlighted?: boolean }).highlighted ? "text-indigo-200" : "text-gray-500"}`,
                      "/month",
                    ),
                  ]),
                  makeNode(
                    "ul",
                    "ul",
                    "space-y-2 mb-8",
                    undefined,
                    plan.features.map((f) =>
                      makeNode(
                        "li",
                        "li",
                        `text-sm ${(plan as typeof plan & { highlighted?: boolean }).highlighted ? "text-indigo-100" : "text-gray-600"}`,
                        `✓ ${f}`,
                      ),
                    ),
                  ),
                  makeNode(
                    "a",
                    "a",
                    `block text-center py-2 px-4 rounded-lg font-semibold text-sm ${(plan as typeof plan & { highlighted?: boolean }).highlighted ? "bg-white text-indigo-600 hover:bg-indigo-50" : "bg-indigo-600 text-white hover:bg-indigo-700"}`,
                    "Get Started",
                    undefined,
                    { href: "#" },
                  ),
                ],
              ),
            ),
          ],
        ),
      ]),
    ]),
  },

  // ─── TESTIMONIALS ──────────────────────────────────────────────
  {
    id: "testimonials-grid",
    label: "Testimonials Grid",
    category: "Testimonials",
    icon: "quote",
    template: makeNode(
      "section",
      "section",
      "py-20 px-6 bg-slate-50",
      undefined,
      [
        makeNode("div", "div", "max-w-6xl mx-auto", undefined, [
          makeNode(
            "h2",
            "h2",
            "text-4xl font-bold text-center text-gray-900 mb-14",
            "What people are saying",
          ),
          makeNode(
            "div",
            "div",
            "grid grid-cols-1 @md:grid-cols-3 gap-6",
            undefined,
            [
              ...[
                {
                  name: "Sarah Johnson",
                  role: "CEO, TechCorp",
                  text: "This tool saved us months of development time. Absolutely love it!",
                },
                {
                  name: "Mark Williams",
                  role: "Designer at Figma",
                  text: "The best visual builder I've ever used. The DX is incredible.",
                },
                {
                  name: "Emily Chen",
                  role: "Startup Founder",
                  text: "We shipped our landing page in 2 hours. Mind-blowing tool.",
                },
              ].map((t) =>
                makeNode(
                  "div",
                  "div",
                  "bg-white rounded-2xl p-6 shadow-sm border border-gray-100",
                  undefined,
                  [
                    makeNode(
                      "p",
                      "p",
                      "text-gray-600 mb-5 text-sm leading-relaxed",
                      `"${t.text}"`,
                    ),
                    makeNode(
                      "div",
                      "div",
                      "flex items-center gap-3",
                      undefined,
                      [
                        makeNode(
                          "div",
                          "div",
                          "w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold",
                          t.name[0],
                        ),
                        makeNode("div", "div", "", undefined, [
                          makeNode(
                            "div",
                            "div",
                            "text-sm font-semibold text-gray-900",
                            t.name,
                          ),
                          makeNode(
                            "div",
                            "div",
                            "text-xs text-gray-400",
                            t.role,
                          ),
                        ]),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ]),
      ],
    ),
  },

  // ─── FAQ ───────────────────────────────────────────────────────
  {
    id: "faq-simple",
    label: "FAQ Simple",
    category: "FAQ",
    icon: "help-circle",
    template: makeNode("section", "section", "py-20 px-6 bg-white", undefined, [
      makeNode("div", "div", "max-w-3xl mx-auto", undefined, [
        makeNode(
          "h2",
          "h2",
          "text-4xl font-bold text-center text-gray-900 mb-12",
          "Frequently Asked Questions",
        ),
        makeNode("div", "div", "space-y-4", undefined, [
          ...[
            [
              "Is there a free plan?",
              "Yes! We offer a free plan with 5 projects and basic features.",
            ],
            [
              "Can I export my code?",
              "Absolutely. Export clean HTML, CSS, and React code at any time.",
            ],
            [
              "Do I need to know how to code?",
              "No coding skills required. Our visual editor makes it simple.",
            ],
            [
              "What integrations are available?",
              "We support Stripe, Mailchimp, Google Analytics, and 50+ more.",
            ],
          ].map(([q, a]) =>
            makeNode(
              "div",
              "div",
              "border border-gray-200 rounded-xl overflow-hidden",
              undefined,
              [
                makeNode(
                  "div",
                  "div",
                  "flex justify-between items-center px-6 py-4 bg-gray-50 cursor-pointer",
                  undefined,
                  [
                    makeNode(
                      "span",
                      "span",
                      "font-medium text-gray-900",
                      q as string,
                    ),
                    makeNode("span", "span", "text-gray-400", "+"),
                  ],
                ),
                makeNode("div", "div", "px-6 py-4", undefined, [
                  makeNode("p", "p", "text-gray-500 text-sm", a as string),
                ]),
              ],
            ),
          ),
        ]),
      ]),
    ]),
  },

  // ─── TEAM ──────────────────────────────────────────────────────
  {
    id: "team-cards",
    label: "Team Cards",
    category: "Team",
    icon: "users",
    template: makeNode("section", "section", "py-20 px-6 bg-white", undefined, [
      makeNode("div", "div", "max-w-6xl mx-auto", undefined, [
        makeNode(
          "h2",
          "h2",
          "text-4xl font-bold text-center text-gray-900 mb-12",
          "Meet the team",
        ),
        makeNode(
          "div",
          "div",
          "grid grid-cols-2 @md:grid-cols-4 gap-8",
          undefined,
          [
            ...[
              { name: "Alice Kim", role: "CEO" },
              { name: "Bob Lee", role: "CTO" },
              { name: "Carol Wu", role: "Designer" },
              { name: "Dan Park", role: "Engineer" },
            ].map((m) =>
              makeNode("div", "div", "text-center", undefined, [
                makeNode(
                  "div",
                  "div",
                  "w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold",
                  m.name[0],
                ),
                makeNode("h3", "h3", "font-semibold text-gray-900", m.name),
                makeNode("p", "p", "text-gray-400 text-sm", m.role),
              ]),
            ),
          ],
        ),
      ]),
    ]),
  },

  // ─── FOOTER ────────────────────────────────────────────────────
  {
    id: "footer-simple",
    label: "Footer Simple",
    category: "Footer",
    icon: "layout",
    template: makeNode(
      "footer",
      "footer",
      "bg-slate-900 text-slate-400 py-12 px-6",
      undefined,
      [
        makeNode("div", "div", "max-w-6xl mx-auto", undefined, [
          makeNode(
            "div",
            "div",
            "grid grid-cols-2 @md:grid-cols-4 gap-8 mb-8",
            undefined,
            [
              ...[
                {
                  label: "Product",
                  links: ["Features", "Pricing", "Changelog"],
                },
                { label: "Company", links: ["About", "Blog", "Careers"] },
                {
                  label: "Legal",
                  links: ["Privacy", "Terms", "Cookie Policy"],
                },
                { label: "Support", links: ["Docs", "Help Center", "Status"] },
              ].map((col) =>
                makeNode("div", "div", "", undefined, [
                  makeNode(
                    "h4",
                    "h4",
                    "text-white font-semibold mb-3 text-sm uppercase tracking-wider",
                    col.label,
                  ),
                  makeNode(
                    "ul",
                    "ul",
                    "space-y-2",
                    undefined,
                    col.links.map((l) =>
                      makeNode("li", "li", "", undefined, [
                        makeNode(
                          "a",
                          "a",
                          "hover:text-white text-sm transition-colors",
                          l,
                          undefined,
                          { href: "#" },
                        ),
                      ]),
                    ),
                  ),
                ]),
              ),
            ],
          ),
          makeNode(
            "div",
            "div",
            "border-t border-slate-800 pt-8 text-sm text-center",
            "© 2024 Brand. All rights reserved.",
          ),
        ]),
      ],
    ),
  },

  // ─── CONTACT ───────────────────────────────────────────────────
  {
    id: "contact-form",
    label: "Contact Form",
    category: "Contact",
    icon: "mail",
    template: makeNode(
      "section",
      "section",
      "py-20 px-6 bg-gray-50",
      undefined,
      [
        makeNode("div", "div", "max-w-2xl mx-auto", undefined, [
          makeNode(
            "h2",
            "h2",
            "text-4xl font-bold text-gray-900 mb-3 text-center",
            "Get in touch",
          ),
          makeNode(
            "p",
            "p",
            "text-gray-500 text-center mb-10",
            "We'd love to hear from you. Send us a message!",
          ),
          makeNode("form", "form", "space-y-4", undefined, [
            makeNode(
              "div",
              "div",
              "grid grid-cols-1 @md:grid-cols-2 gap-4",
              undefined,
              [
                makeNode(
                  "input",
                  "input",
                  "w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500",
                  undefined,
                  undefined,
                  { type: "text", placeholder: "First name" },
                ),
                makeNode(
                  "input",
                  "input",
                  "w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500",
                  undefined,
                  undefined,
                  { type: "text", placeholder: "Last name" },
                ),
              ],
            ),
            makeNode(
              "input",
              "input",
              "w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500",
              undefined,
              undefined,
              { type: "email", placeholder: "Email address" },
            ),
            makeNode(
              "textarea",
              "textarea",
              "w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]",
              "Your message...",
              undefined,
              {},
            ),
            makeNode(
              "button",
              "button",
              "w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors",
              "Send Message",
              undefined,
              { type: "submit" },
            ),
          ]),
        ]),
      ],
    ),
  },

  // ─── PORTFOLIO ─────────────────────────────────────────────────
  {
    id: "portfolio-grid",
    label: "Portfolio Grid",
    category: "Portfolio",
    icon: "image",
    template: makeNode("section", "section", "py-20 px-6 bg-white", undefined, [
      makeNode("div", "div", "max-w-6xl mx-auto", undefined, [
        makeNode(
          "h2",
          "h2",
          "text-4xl font-bold text-center text-gray-900 mb-12",
          "Our Work",
        ),
        makeNode(
          "div",
          "div",
          "grid grid-cols-2 @md:grid-cols-3 gap-4",
          undefined,
          [
            ...[
              ["from-blue-400 to-cyan-400", "Project Alpha"],
              ["from-purple-400 to-pink-400", "Project Beta"],
              ["from-orange-400 to-amber-400", "Project Gamma"],
              ["from-green-400 to-teal-400", "Project Delta"],
              ["from-rose-400 to-red-400", "Project Epsilon"],
              ["from-indigo-400 to-blue-400", "Project Zeta"],
            ].map(([gradient, name]) =>
              makeNode(
                "div",
                "div",
                "relative group cursor-pointer rounded-xl overflow-hidden",
                undefined,
                [
                  makeNode(
                    "div",
                    "div",
                    `bg-gradient-to-br ${gradient} aspect-video`,
                  ),
                  makeNode(
                    "div",
                    "div",
                    "absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center",
                    undefined,
                    [
                      makeNode(
                        "span",
                        "span",
                        "text-white font-semibold",
                        name as string,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ]),
    ]),
  },

  // ─── CARDS ─────────────────────────────────────────────────────
  {
    id: "card-simple",
    label: "Card Simple",
    category: "Cards",
    icon: "square",
    template: makeNode(
      "div",
      "div",
      "bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden max-w-sm",
      undefined,
      [
        makeNode(
          "div",
          "div",
          "bg-gradient-to-r from-blue-500 to-indigo-600 h-48",
        ),
        makeNode("div", "div", "p-6", undefined, [
          makeNode(
            "span",
            "span",
            "text-xs text-indigo-600 font-semibold uppercase tracking-wider",
            "Category",
          ),
          makeNode(
            "h3",
            "h3",
            "text-xl font-bold text-gray-900 mt-1 mb-2",
            "Card Title",
          ),
          makeNode(
            "p",
            "p",
            "text-gray-500 text-sm mb-4",
            "A short description of the card content goes here.",
          ),
          makeNode(
            "a",
            "a",
            "text-blue-600 hover:text-blue-700 text-sm font-semibold",
            "Read more →",
            undefined,
            { href: "#" },
          ),
        ]),
      ],
    ),
  },

  // ─── TYPOGRAPHY ────────────────────────────────────────────────
  {
    id: "heading-xl",
    label: "Heading XL",
    category: "Typography",
    icon: "type",
    template: makeNode(
      "h1",
      "h1",
      "text-6xl font-extrabold text-gray-900 tracking-tight",
      "Your Headline Here",
    ),
  },
  {
    id: "heading-lg",
    label: "Heading Large",
    category: "Typography",
    icon: "type",
    template: makeNode(
      "h2",
      "h2",
      "text-4xl font-bold text-gray-900",
      "Section Heading",
    ),
  },
  {
    id: "paragraph",
    label: "Paragraph",
    category: "Typography",
    icon: "align-left",
    template: makeNode(
      "p",
      "p",
      "text-gray-600 text-base leading-relaxed max-w-2xl",
      "This is a paragraph of text. You can edit this content to match your needs.",
    ),
  },
  {
    id: "badge",
    label: "Badge",
    category: "Typography",
    icon: "tag",
    template: makeNode(
      "span",
      "span",
      "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800",
      "New Badge",
    ),
  },

  // ─── BUTTONS ───────────────────────────────────────────────────
  {
    id: "btn-primary",
    label: "Button Primary",
    category: "Buttons",
    icon: "mouse-pointer",
    template: makeNode(
      "button",
      "button",
      "bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors",
      "Click Me",
    ),
  },
  {
    id: "btn-outline",
    label: "Button Outline",
    category: "Buttons",
    icon: "mouse-pointer",
    template: makeNode(
      "button",
      "button",
      "border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-semibold px-6 py-2.5 rounded-lg transition-all",
      "Click Me",
    ),
  },
  {
    id: "btn-ghost",
    label: "Button Ghost",
    category: "Buttons",
    icon: "mouse-pointer",
    template: makeNode(
      "button",
      "button",
      "text-gray-700 hover:bg-gray-100 font-semibold px-6 py-2.5 rounded-lg transition-colors",
      "Click Me",
    ),
  },

  // ─── CONTAINERS ────────────────────────────────────────────────
  {
    id: "container-section",
    label: "Section",
    category: "Containers",
    icon: "box",
    template: makeNode(
      "section",
      "section",
      "py-16 px-6 bg-white",
      undefined,
      [],
    ),
  },
  {
    id: "container-div",
    label: "Div Container",
    category: "Containers",
    icon: "box",
    template: makeNode("div", "div", "max-w-6xl mx-auto", undefined, []),
  },
  {
    id: "grid-2col",
    label: "Grid 2 Columns",
    category: "Containers",
    icon: "columns",
    template: makeNode(
      "div",
      "div",
      "grid grid-cols-1 @md:grid-cols-2 gap-8",
      undefined,
      [
        makeNode("div", "div", "bg-gray-100 rounded-xl p-6 min-h-[100px]"),
        makeNode("div", "div", "bg-gray-100 rounded-xl p-6 min-h-[100px]"),
      ],
    ),
  },
  {
    id: "grid-3col",
    label: "Grid 3 Columns",
    category: "Containers",
    icon: "columns",
    template: makeNode(
      "div",
      "div",
      "grid grid-cols-1 @md:grid-cols-3 gap-6",
      undefined,
      [
        makeNode("div", "div", "bg-gray-100 rounded-xl p-6 min-h-[100px]"),
        makeNode("div", "div", "bg-gray-100 rounded-xl p-6 min-h-[100px]"),
        makeNode("div", "div", "bg-gray-100 rounded-xl p-6 min-h-[100px]"),
      ],
    ),
  },
  {
    id: "flex-row",
    label: "Flex Row",
    category: "Containers",
    icon: "layout",
    template: makeNode(
      "div",
      "div",
      "flex items-center gap-4 flex-wrap",
      undefined,
      [],
    ),
  },

  // ─── IMAGES ────────────────────────────────────────────────────
  {
    id: "image-placeholder",
    label: "Image",
    category: "Images",
    icon: "image",
    template: makeNode(
      "div",
      "div",
      "bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl aspect-video flex items-center justify-center text-gray-400",
    ),
  },
  {
    id: "image-rounded",
    label: "Image Rounded",
    category: "Images",
    icon: "image",
    template: makeNode(
      "div",
      "div",
      "bg-gradient-to-br from-blue-200 to-indigo-300 rounded-2xl w-48 h-48 mx-auto flex items-center justify-center text-white font-semibold",
      "Photo",
    ),
  },

  // ─── FORMS ─────────────────────────────────────────────────────
  {
    id: "input-text",
    label: "Text Input",
    category: "Forms",
    icon: "edit-2",
    template: makeNode("div", "div", "flex flex-col gap-1.5", undefined, [
      makeNode("label", "label", "text-sm font-medium text-gray-700", "Label"),
      makeNode(
        "input",
        "input",
        "border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full",
        undefined,
        undefined,
        { type: "text", placeholder: "Enter text..." },
      ),
    ]),
  },
  {
    id: "newsletter-form",
    label: "Newsletter",
    category: "Forms",
    icon: "mail",
    template: makeNode("div", "div", "flex gap-3 max-w-md", undefined, [
      makeNode(
        "input",
        "input",
        "flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500",
        undefined,
        undefined,
        { type: "email", placeholder: "Enter your email" },
      ),
      makeNode(
        "button",
        "button",
        "bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold whitespace-nowrap hover:bg-blue-700",
        "Subscribe",
      ),
    ]),
  },
];

export const CATEGORIES = [...new Set(COMPONENT_BLOCKS.map((b) => b.category))];
