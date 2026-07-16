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
      "relative bg-gradient-to-br from-slate-900 to-slate-800 py-24 px-6 text-center min-h-[560px] flex items-center justify-center",
      undefined,
      [
        makeNode("div", "div", "max-w-4xl mx-auto", undefined, [
          makeNode(
            "span",
            "span",
            "inline-block bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full mb-6 uppercase tracking-widest border border-indigo-500/30",
            "New Release",
          ),
          makeNode(
            "h1",
            "h1",
            "text-5xl font-extrabold text-white mb-6 leading-tight tracking-tight",
            "Build beautiful websites faster",
          ),
          makeNode(
            "p",
            "p",
            "text-lg text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed",
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
                "bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3 rounded-xl transition-colors inline-block",
                "Get Started Free",
                undefined,
                { href: "#" },
              ),
              makeNode(
                "a",
                "a",
                "border border-slate-500 hover:border-slate-300 text-slate-300 hover:text-white font-semibold px-8 py-3 rounded-xl transition-colors inline-block",
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
    template: makeNode(
      "section",
      "section",
      "bg-background py-20 px-6",
      undefined,
      [
        makeNode(
          "div",
          "div",
          "max-w-6xl mx-auto grid grid-cols-1 @md:grid-cols-2 gap-12 items-center",
          undefined,
          [
            makeNode("div", "div", "", undefined, [
              makeNode(
                "span",
                "span",
                "inline-block text-blue-600 text-xs font-semibold uppercase tracking-widest mb-4",
                "Welcome",
              ),
              makeNode(
                "h1",
                "h1",
                "text-4xl font-bold text-foreground mb-5 leading-tight",
                "The future of web design is here",
              ),
              makeNode(
                "p",
                "p",
                "text-muted-foreground text-lg mb-8 leading-relaxed",
                "Create stunning pages visually with our next-generation editor.",
              ),
              makeNode(
                "a",
                "a",
                "bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg inline-block transition-colors",
                "Start Building",
                undefined,
                { href: "#" },
              ),
            ]),
            makeNode(
              "div",
              "div",
              "bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl aspect-video flex items-center justify-center",
              undefined,
              [
                makeNode(
                  "span",
                  "span",
                  "text-4xl",
                  "🖼️",
                ),
              ],
            ),
          ],
        ),
      ],
    ),
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
      "bg-background border-b border-border px-6 py-4",
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
              "text-xl font-bold text-foreground",
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
                  "text-muted-foreground hover:text-foreground text-sm font-medium transition-colors",
                  "Features",
                  undefined,
                  { href: "#" },
                ),
                makeNode(
                  "a",
                  "a",
                  "text-muted-foreground hover:text-foreground text-sm font-medium transition-colors",
                  "Pricing",
                  undefined,
                  { href: "#" },
                ),
                makeNode(
                  "a",
                  "a",
                  "text-muted-foreground hover:text-foreground text-sm font-medium transition-colors",
                  "About",
                  undefined,
                  { href: "#" },
                ),
                makeNode(
                  "a",
                  "a",
                  "bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors",
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
      "bg-slate-900 px-6 py-4",
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
                "text-slate-400 hover:text-white text-sm transition-colors",
                "Home",
                undefined,
                { href: "#" },
              ),
              makeNode(
                "a",
                "a",
                "text-slate-400 hover:text-white text-sm transition-colors",
                "Docs",
                undefined,
                { href: "#" },
              ),
              makeNode(
                "a",
                "a",
                "bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors",
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
      "py-20 px-6 bg-muted",
      undefined,
      [
        makeNode("div", "div", "max-w-6xl mx-auto", undefined, [
          makeNode("div", "div", "text-center mb-14", undefined, [
            makeNode(
              "h2",
              "h2",
              "text-4xl font-bold text-foreground mb-4",
              "Everything you need",
            ),
            makeNode(
              "p",
              "p",
              "text-muted-foreground max-w-xl mx-auto text-lg",
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
                ["⚡", "Lightning Fast", "Optimized for performance with zero compromises."],
                ["🎨", "Beautiful Design", "Pixel-perfect components ready to use."],
                ["🔒", "Secure by Default", "Enterprise-grade security out of the box."],
                ["📱", "Fully Responsive", "Looks great on every screen size."],
                ["🔧", "Easy to Customize", "Tailor everything to match your brand."],
                ["🚀", "Quick Deploy", "Go live in minutes with one-click deployment."],
              ].map(([icon, title, desc]) =>
                makeNode(
                  "div",
                  "div",
                  "bg-card rounded-2xl p-6 border border-border shadow-sm",
                  undefined,
                  [
                    makeNode("div", "div", "text-3xl mb-4", icon as string),
                    makeNode(
                      "h3",
                      "h3",
                      "text-lg font-semibold text-foreground mb-2",
                      title as string,
                    ),
                    makeNode(
                      "p",
                      "p",
                      "text-muted-foreground text-sm leading-relaxed",
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
    template: makeNode(
      "section",
      "section",
      "py-20 px-6 bg-background",
      undefined,
      [
        makeNode("div", "div", "max-w-5xl mx-auto", undefined, [
          makeNode("div", "div", "text-center mb-14", undefined, [
            makeNode(
              "h2",
              "h2",
              "text-4xl font-bold text-foreground mb-3",
              "Simple, transparent pricing",
            ),
            makeNode(
              "p",
              "p",
              "text-muted-foreground text-lg",
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
                  period: "/mo",
                  features: ["5 Projects", "10 GB Storage", "Basic Support"],
                  highlighted: false,
                },
                {
                  name: "Pro",
                  price: "$29",
                  period: "/mo",
                  features: ["Unlimited Projects", "100 GB Storage", "Priority Support", "Custom Domain"],
                  highlighted: true,
                },
                {
                  name: "Enterprise",
                  price: "$99",
                  period: "/mo",
                  features: ["Everything in Pro", "SSO", "SLA", "Dedicated Manager"],
                  highlighted: false,
                },
              ].map((plan) =>
                makeNode(
                  "div",
                  "div",
                  `rounded-2xl p-8 border flex flex-col ${
                    plan.highlighted
                      ? "bg-indigo-600 border-indigo-600"
                      : "bg-muted border-border"
                  }`,
                  undefined,
                  [
                    makeNode(
                      "h3",
                      "h3",
                      `text-lg font-semibold mb-1 ${plan.highlighted ? "text-indigo-100" : "text-muted-foreground"}`,
                      plan.name,
                    ),
                    makeNode("div", "div", "flex items-end gap-1 mb-6", undefined, [
                      makeNode(
                        "span",
                        "span",
                        `text-4xl font-bold ${plan.highlighted ? "text-white" : "text-foreground"}`,
                        plan.price,
                      ),
                      makeNode(
                        "span",
                        "span",
                        `text-sm pb-1 ${plan.highlighted ? "text-indigo-200" : "text-muted-foreground"}`,
                        plan.period,
                      ),
                    ]),
                    makeNode(
                      "ul",
                      "ul",
                      "space-y-3 mb-8 flex-1",
                      undefined,
                      plan.features.map((f) =>
                        makeNode(
                          "li",
                          "li",
                          `flex items-center gap-2 text-sm ${plan.highlighted ? "text-indigo-100" : "text-muted-foreground"}`,
                          `✓ ${f}`,
                        ),
                      ),
                    ),
                    makeNode(
                      "a",
                      "a",
                      `block text-center py-2.5 px-4 rounded-xl font-semibold text-sm transition-colors ${plan.highlighted ? "bg-white text-indigo-600 hover:bg-indigo-50" : "bg-indigo-600 text-white hover:bg-indigo-700"}`,
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
      ],
    ),
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
      "py-20 px-6 bg-muted",
      undefined,
      [
        makeNode("div", "div", "max-w-6xl mx-auto", undefined, [
          makeNode("div", "div", "text-center mb-14", undefined, [
            makeNode(
              "h2",
              "h2",
              "text-4xl font-bold text-foreground mb-3",
              "What people are saying",
            ),
            makeNode(
              "p",
              "p",
              "text-muted-foreground text-lg",
              "Trusted by thousands of teams worldwide.",
            ),
          ]),
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
                  avatar: "S",
                  text: "This tool saved us months of development time. Absolutely love it!",
                },
                {
                  name: "Mark Williams",
                  role: "Designer at Figma",
                  avatar: "M",
                  text: "The best visual builder I've ever used. The DX is incredible.",
                },
                {
                  name: "Emily Chen",
                  role: "Startup Founder",
                  avatar: "E",
                  text: "We shipped our landing page in 2 hours. Mind-blowing tool.",
                },
              ].map((t) =>
                makeNode(
                  "div",
                  "div",
                  "bg-card rounded-2xl p-6 shadow-sm border border-border flex flex-col gap-4",
                  undefined,
                  [
                    makeNode(
                      "p",
                      "p",
                      "text-muted-foreground text-sm leading-relaxed italic",
                      `"${t.text}"`,
                    ),
                    makeNode(
                      "div",
                      "div",
                      "flex items-center gap-3 pt-2 border-t border-border",
                      undefined,
                      [
                        makeNode(
                          "div",
                          "div",
                          "w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0",
                          t.avatar,
                        ),
                        makeNode("div", "div", "", undefined, [
                          makeNode(
                            "div",
                            "div",
                            "text-sm font-semibold text-foreground",
                            t.name,
                          ),
                          makeNode(
                            "div",
                            "div",
                            "text-xs text-muted-foreground",
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
    template: makeNode(
      "section",
      "section",
      "py-20 px-6 bg-background",
      undefined,
      [
        makeNode("div", "div", "max-w-3xl mx-auto", undefined, [
          makeNode("div", "div", "text-center mb-12", undefined, [
            makeNode(
              "h2",
              "h2",
              "text-4xl font-bold text-foreground mb-3",
              "Frequently Asked Questions",
            ),
            makeNode(
              "p",
              "p",
              "text-muted-foreground text-lg",
              "Everything you need to know.",
            ),
          ]),
          makeNode("div", "div", "divide-y divide-border border border-border rounded-2xl overflow-hidden", undefined, [
            ...[
              ["Is there a free plan?", "Yes! We offer a free plan with 5 projects and basic features."],
              ["Can I export my code?", "Absolutely. Export clean HTML, CSS, and React code at any time."],
              ["Do I need to know how to code?", "No coding skills required. Our visual editor makes it simple."],
              ["What integrations are available?", "We support Stripe, Mailchimp, Google Analytics, and 50+ more."],
            ].map(([q, a]) =>
              makeNode(
                "div",
                "div",
                "px-6 py-5 bg-card",
                undefined,
                [
                  makeNode(
                    "div",
                    "div",
                    "flex justify-between items-start gap-4 mb-2",
                    undefined,
                    [
                      makeNode(
                        "span",
                        "span",
                        "font-semibold text-foreground text-sm",
                        q as string,
                      ),
                      makeNode(
                        "span",
                        "span",
                        "text-muted-foreground text-lg leading-none shrink-0",
                        "＋",
                      ),
                    ],
                  ),
                  makeNode(
                    "p",
                    "p",
                    "text-muted-foreground text-sm leading-relaxed",
                    a as string,
                  ),
                ],
              ),
            ),
          ]),
        ]),
      ],
    ),
  },

  // ─── TEAM ──────────────────────────────────────────────────────
  {
    id: "team-cards",
    label: "Team Cards",
    category: "Team",
    icon: "users",
    template: makeNode(
      "section",
      "section",
      "py-20 px-6 bg-background",
      undefined,
      [
        makeNode("div", "div", "max-w-6xl mx-auto", undefined, [
          makeNode("div", "div", "text-center mb-14", undefined, [
            makeNode(
              "h2",
              "h2",
              "text-4xl font-bold text-foreground mb-3",
              "Meet the team",
            ),
            makeNode(
              "p",
              "p",
              "text-muted-foreground text-lg",
              "The talented people building great things.",
            ),
          ]),
          makeNode(
            "div",
            "div",
            "grid grid-cols-2 @md:grid-cols-4 gap-8",
            undefined,
            [
              ...[
                { name: "Alice Kim", role: "CEO", color: "from-blue-400 to-indigo-500" },
                { name: "Bob Lee", role: "CTO", color: "from-purple-400 to-pink-500" },
                { name: "Carol Wu", role: "Designer", color: "from-orange-400 to-rose-500" },
                { name: "Dan Park", role: "Engineer", color: "from-green-400 to-teal-500" },
              ].map((m) =>
                makeNode("div", "div", "text-center", undefined, [
                  makeNode(
                    "div",
                    "div",
                    `w-24 h-24 rounded-full bg-gradient-to-br ${m.color} mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-sm`,
                    m.name[0],
                  ),
                  makeNode("h3", "h3", "font-semibold text-foreground text-sm", m.name),
                  makeNode("p", "p", "text-muted-foreground text-xs mt-0.5", m.role),
                ]),
              ),
            ],
          ),
        ]),
      ],
    ),
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
      "bg-slate-900 text-slate-400 py-14 px-6",
      undefined,
      [
        makeNode("div", "div", "max-w-6xl mx-auto", undefined, [
          makeNode("div", "div", "flex items-center justify-between mb-10", undefined, [
            makeNode("span", "span", "text-white text-xl font-bold", "Brand"),
            makeNode("span", "span", "text-slate-500 text-sm", "Your tagline here"),
          ]),
          makeNode(
            "div",
            "div",
            "grid grid-cols-2 @md:grid-cols-4 gap-8 mb-10",
            undefined,
            [
              ...[
                { label: "Product", links: ["Features", "Pricing", "Changelog"] },
                { label: "Company", links: ["About", "Blog", "Careers"] },
                { label: "Legal", links: ["Privacy", "Terms", "Cookie Policy"] },
                { label: "Support", links: ["Docs", "Help Center", "Status"] },
              ].map((col) =>
                makeNode("div", "div", "", undefined, [
                  makeNode(
                    "h4",
                    "h4",
                    "text-white font-semibold mb-4 text-sm uppercase tracking-wider",
                    col.label,
                  ),
                  makeNode(
                    "ul",
                    "ul",
                    "space-y-2.5",
                    undefined,
                    col.links.map((l) =>
                      makeNode("li", "li", "", undefined, [
                        makeNode(
                          "a",
                          "a",
                          "hover:text-slate-200 text-sm transition-colors",
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
            "border-t border-slate-800 pt-8 flex flex-col @md:flex-row items-center justify-between gap-3 text-sm",
            undefined,
            [
              makeNode("span", "span", "", "© 2024 Brand. All rights reserved."),
              makeNode("span", "span", "text-slate-600", "Built with ♥"),
            ],
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
      "py-20 px-6 bg-muted",
      undefined,
      [
        makeNode("div", "div", "max-w-2xl mx-auto", undefined, [
          makeNode("div", "div", "text-center mb-10", undefined, [
            makeNode(
              "h2",
              "h2",
              "text-4xl font-bold text-foreground mb-3",
              "Get in touch",
            ),
            makeNode(
              "p",
              "p",
              "text-muted-foreground text-lg",
              "We'd love to hear from you. Send us a message!",
            ),
          ]),
          makeNode("div", "div", "bg-card rounded-2xl shadow-sm border border-border p-8", undefined, [
            makeNode("form", "form", "space-y-4", undefined, [
              makeNode(
                "div",
                "div",
                "grid grid-cols-1 @md:grid-cols-2 gap-4",
                undefined,
                [
                  makeNode("div", "div", "flex flex-col gap-1.5", undefined, [
                    makeNode("label", "label", "text-sm font-medium text-foreground", "First name"),
                    makeNode(
                      "input",
                      "input",
                      "w-full border border-border rounded-lg px-4 py-2.5 text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all",
                      undefined,
                      undefined,
                      { type: "text", placeholder: "John" },
                    ),
                  ]),
                  makeNode("div", "div", "flex flex-col gap-1.5", undefined, [
                    makeNode("label", "label", "text-sm font-medium text-foreground", "Last name"),
                    makeNode(
                      "input",
                      "input",
                      "w-full border border-border rounded-lg px-4 py-2.5 text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all",
                      undefined,
                      undefined,
                      { type: "text", placeholder: "Doe" },
                    ),
                  ]),
                ],
              ),
              makeNode("div", "div", "flex flex-col gap-1.5", undefined, [
                makeNode("label", "label", "text-sm font-medium text-foreground", "Email"),
                makeNode(
                  "input",
                  "input",
                  "w-full border border-border rounded-lg px-4 py-2.5 text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all",
                  undefined,
                  undefined,
                  { type: "email", placeholder: "john@example.com" },
                ),
              ]),
              makeNode("div", "div", "flex flex-col gap-1.5", undefined, [
                makeNode("label", "label", "text-sm font-medium text-foreground", "Message"),
                makeNode(
                  "textarea",
                  "textarea",
                  "w-full border border-border rounded-lg px-4 py-2.5 text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px] resize-none transition-all",
                  "Write your message here...",
                  undefined,
                  {},
                ),
              ]),
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
    template: makeNode(
      "section",
      "section",
      "py-20 px-6 bg-background",
      undefined,
      [
        makeNode("div", "div", "max-w-6xl mx-auto", undefined, [
          makeNode("div", "div", "text-center mb-12", undefined, [
            makeNode(
              "h2",
              "h2",
              "text-4xl font-bold text-foreground mb-3",
              "Our Work",
            ),
            makeNode(
              "p",
              "p",
              "text-muted-foreground text-lg",
              "A selection of our best projects.",
            ),
          ]),
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
                  "relative group cursor-pointer rounded-xl overflow-hidden shadow-sm",
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
                      "absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center",
                      undefined,
                      [
                        makeNode(
                          "span",
                          "span",
                          "text-white font-semibold text-sm",
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
      ],
    ),
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
      "bg-card rounded-2xl border border-border shadow-sm overflow-hidden max-w-sm",
      undefined,
      [
        makeNode(
          "div",
          "div",
          "bg-gradient-to-r from-blue-500 to-indigo-600 h-48 flex items-center justify-center",
          undefined,
          [
            makeNode("span", "span", "text-5xl", "🖼️"),
          ],
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
            "text-xl font-bold text-foreground mt-1.5 mb-2",
            "Card Title",
          ),
          makeNode(
            "p",
            "p",
            "text-muted-foreground text-sm mb-5 leading-relaxed",
            "A short description of the card content goes here.",
          ),
          makeNode(
            "a",
            "a",
            "inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors",
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
      "text-6xl font-extrabold text-foreground tracking-tight leading-tight",
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
      "text-4xl font-bold text-foreground leading-snug",
      "Section Heading",
    ),
  },
  {
    id: "heading-md",
    label: "Heading Medium",
    category: "Typography",
    icon: "type",
    template: makeNode(
      "h3",
      "h3",
      "text-2xl font-semibold text-foreground",
      "Sub Heading",
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
      "text-muted-foreground text-base leading-relaxed max-w-2xl",
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
      "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200",
      "New Feature",
    ),
  },
  {
    id: "divider",
    label: "Divider",
    category: "Typography",
    icon: "minus",
    template: makeNode(
      "hr",
      "hr",
      "border-0 border-t border-border my-8",
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
      "bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer",
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
      "border-2 border-foreground text-foreground hover:bg-foreground hover:text-background font-semibold px-6 py-2.5 rounded-lg transition-all cursor-pointer",
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
      "text-foreground bg-muted hover:bg-muted/70 font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer",
      "Click Me",
    ),
  },
  {
    id: "btn-danger",
    label: "Button Danger",
    category: "Buttons",
    icon: "mouse-pointer",
    template: makeNode(
      "button",
      "button",
      "bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer",
      "Delete",
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
      "py-16 px-6 bg-background",
      undefined,
      [],
    ),
  },
  {
    id: "container-div",
    label: "Div Container",
    category: "Containers",
    icon: "box",
    template: makeNode(
      "div",
      "div",
      "max-w-6xl mx-auto px-6",
      undefined,
      [],
    ),
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
        makeNode(
          "div",
          "div",
          "bg-muted border border-border rounded-xl p-6 min-h-[120px] flex items-center justify-center",
          undefined,
          [makeNode("span", "span", "text-muted-foreground text-sm", "Column 1")],
        ),
        makeNode(
          "div",
          "div",
          "bg-muted border border-border rounded-xl p-6 min-h-[120px] flex items-center justify-center",
          undefined,
          [makeNode("span", "span", "text-muted-foreground text-sm", "Column 2")],
        ),
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
        makeNode(
          "div",
          "div",
          "bg-muted border border-border rounded-xl p-6 min-h-[120px] flex items-center justify-center",
          undefined,
          [makeNode("span", "span", "text-muted-foreground text-sm", "Column 1")],
        ),
        makeNode(
          "div",
          "div",
          "bg-muted border border-border rounded-xl p-6 min-h-[120px] flex items-center justify-center",
          undefined,
          [makeNode("span", "span", "text-muted-foreground text-sm", "Column 2")],
        ),
        makeNode(
          "div",
          "div",
          "bg-muted border border-border rounded-xl p-6 min-h-[120px] flex items-center justify-center",
          undefined,
          [makeNode("span", "span", "text-muted-foreground text-sm", "Column 3")],
        ),
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
      "bg-muted rounded-xl aspect-video flex items-center justify-center border border-border",
      undefined,
      [
        makeNode("span", "span", "text-4xl", "🖼️"),
      ],
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
      "bg-gradient-to-br from-blue-200 to-indigo-300 rounded-2xl w-48 h-48 mx-auto flex items-center justify-center border border-blue-200",
      undefined,
      [
        makeNode("span", "span", "text-4xl", "📷"),
      ],
    ),
  },

  // ─── FORMS ─────────────────────────────────────────────────────
  {
    id: "input-text",
    label: "Text Input",
    category: "Forms",
    icon: "edit-2",
    template: makeNode("div", "div", "flex flex-col gap-1.5 max-w-sm", undefined, [
      makeNode("label", "label", "text-sm font-medium text-foreground", "Label"),
      makeNode(
        "input",
        "input",
        "border border-border rounded-lg px-4 py-2.5 text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full transition-all",
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
    template: makeNode(
      "div",
      "div",
      "bg-muted border border-border rounded-2xl p-8 max-w-md text-center",
      undefined,
      [
        makeNode("h3", "h3", "text-xl font-bold text-foreground mb-2", "Stay in the loop"),
        makeNode("p", "p", "text-muted-foreground text-sm mb-6", "Get the latest updates delivered to your inbox."),
        makeNode("div", "div", "flex gap-3", undefined, [
          makeNode(
            "input",
            "input",
            "flex-1 border border-border rounded-lg px-4 py-2.5 text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all",
            undefined,
            undefined,
            { type: "email", placeholder: "Enter your email" },
          ),
          makeNode(
            "button",
            "button",
            "bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer",
            "Subscribe",
          ),
        ]),
      ],
    ),
  },

  // ─── SHOPINGO ──────────────────────────────────────────────────────────────

  // 1 · Hero Banner
  {
    id: "shopingo-hero",
    label: "Hero Banner",
    category: "Shopingo",
    icon: "layout",
    template: makeNode("section", "section", "relative min-h-[520px] flex items-center bg-[#212529] overflow-hidden", undefined, [
      makeNode("img", "img", "absolute inset-0 w-full h-full object-cover opacity-35 pointer-events-none select-none", undefined, undefined, {
        src: "https://codervent.com/shopingo/demo/shopingo_V1/assets/images/sliders/s_1.webp",
        alt: "",
      }),
      makeNode("div", "div", "relative z-10 max-w-6xl mx-auto px-8 py-24 w-full", undefined, [
        makeNode("span", "span", "inline-block text-xs font-semibold uppercase tracking-[0.2em] text-[#ff2c2c] mb-4", "New Collection 2024"),
        makeNode("h1", "h1", "text-5xl font-extrabold text-white mb-4 leading-tight", "Women Fashion"),
        makeNode("p", "p", "text-2xl font-light text-white/75 mb-10", "Sale up to 25% off"),
        makeNode("a", "a", "inline-block bg-[#ff2c2c] hover:opacity-90 text-white font-bold px-10 py-3.5 text-sm uppercase tracking-widest transition-opacity", "Shop Now", undefined, { href: "/shop" }),
      ]),
    ]),
  },

  // 2 · Featured Products Grid
  {
    id: "shopingo-featured-products",
    label: "Featured Products",
    category: "Shopingo",
    icon: "grid",
    template: makeNode("section", "section", "bg-background py-16 px-4", undefined, [
      makeNode("div", "div", "max-w-6xl mx-auto", undefined, [
        makeNode("div", "div", "text-center mb-10", undefined, [
          makeNode("h2", "h2", "text-3xl font-extrabold text-[#212529] mb-2", "Featured Products"),
          makeNode("p", "p", "text-[#797979] text-sm", "Handpicked favourites for you"),
        ]),
        makeNode("div", "div", "grid grid-cols-2 md:grid-cols-4 gap-5", undefined, [
          ...[
            ["01", "Kurta Set"],
            ["02", "Heels"],
            ["03", "Lehenga"],
            ["04", "Plazzos"],
            ["05", "Makeup Kit"],
            ["06", "Shoes"],
            ["07", "Bag"],
            ["08", "Watch"],
          ].map(([n, name]) =>
            makeNode("div", "div", "border border-[#e1e1e1] group cursor-pointer hover:shadow-md transition-shadow", undefined, [
              makeNode("div", "div", "overflow-hidden relative", undefined, [
                makeNode("img", "img", "w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300", undefined, undefined, {
                  src: `https://codervent.com/shopingo/demo/shopingo_V1/assets/images/featured-products/${n}.webp`,
                  alt: name,
                }),
              ]),
              makeNode("div", "div", "p-3", undefined, [
                makeNode("p", "p", "text-xs text-[#797979] mb-0.5", "Shopingo"),
                makeNode("h4", "h4", "text-sm font-semibold text-[#212529] mb-1", name),
                makeNode("div", "div", "flex items-center justify-between", undefined, [
                  makeNode("span", "span", "text-[#ff2c2c] font-bold text-sm", "$49.00"),
                  makeNode("button", "button", "bg-[#212529] hover:bg-[#ff2c2c] text-white text-[10px] font-bold px-3 py-1.5 uppercase tracking-wider transition-colors cursor-pointer", "Add to Cart"),
                ]),
              ]),
            ])
          ),
        ]),
      ]),
    ]),
  },

  // 3 · Features / What We Offer
  {
    id: "shopingo-features",
    label: "Features Strip",
    category: "Shopingo",
    icon: "star",
    template: makeNode("section", "section", "bg-[#f9f9f9] border-y border-[#e1e1e1] py-14 px-4", undefined, [
      makeNode("div", "div", "max-w-6xl mx-auto", undefined, [
        makeNode("div", "div", "text-center mb-10", undefined, [
          makeNode("h2", "h2", "text-3xl font-extrabold text-[#212529] mb-2", "What We Offer!"),
          makeNode("p", "p", "text-[#797979] text-sm", "We provide the best shopping experience"),
        ]),
        makeNode("div", "div", "grid grid-cols-2 md:grid-cols-4 gap-6", undefined, [
          ...[
            ["🚚", "Free Delivery", "Orders over $99 get free standard shipping to your doorstep."],
            ["🔒", "Secure Payment", "100% secure payment processing with industry-grade encryption."],
            ["↩️", "Free Returns", "Not happy? Return within 30 days — no questions asked."],
            ["💬", "24/7 Support", "Our team is always ready to assist you any time of the day."],
          ].map(([icon, title, desc]) =>
            makeNode("div", "div", "flex flex-col items-center text-center p-6 bg-card border border-[#e1e1e1]", undefined, [
              makeNode("span", "span", "text-4xl mb-4", icon),
              makeNode("h4", "h4", "text-base font-bold text-[#212529] mb-2", title),
              makeNode("p", "p", "text-sm text-[#797979] leading-relaxed", desc),
            ])
          ),
        ]),
      ]),
    ]),
  },

  // 4 · Promo Banner (image + bullets)
  {
    id: "shopingo-promo-banner",
    label: "Promo Banner",
    category: "Shopingo",
    icon: "image",
    template: makeNode("section", "section", "bg-background py-16 px-4", undefined, [
      makeNode("div", "div", "max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center", undefined, [
        makeNode("div", "div", "", undefined, [
          makeNode("span", "span", "inline-block text-xs font-bold uppercase tracking-[0.18em] text-[#ff2c2c] mb-3", "Exclusive Deal"),
          makeNode("h2", "h2", "text-4xl font-extrabold text-[#212529] mb-5 leading-tight", "New Features of Trending Products"),
          makeNode("ul", "ul", "space-y-3 mb-8", undefined, [
            ...["Premium quality material sourced from top manufacturers", "Latest trends with exclusive seasonal designs", "Comfortable fit for every body type and lifestyle", "Eco-friendly packaging and sustainable production"].map((txt) =>
              makeNode("li", "li", "flex items-start gap-2.5 text-sm text-[#555]", undefined, [
                makeNode("span", "span", "text-[#ff2c2c] font-bold mt-0.5 shrink-0", "✓"),
                makeNode("span", "span", "", txt),
              ])
            ),
          ]),
          makeNode("div", "div", "flex gap-4 flex-wrap", undefined, [
            makeNode("a", "a", "inline-block bg-[#ff2c2c] hover:opacity-90 text-white font-bold px-8 py-3 text-sm uppercase tracking-wider transition-opacity", "Buy Now", undefined, { href: "/shop" }),
            makeNode("a", "a", "inline-block border-2 border-[#212529] text-[#212529] hover:bg-[#212529] hover:text-white font-bold px-8 py-3 text-sm uppercase tracking-wider transition-colors", "View Details", undefined, { href: "/shop" }),
          ]),
        ]),
        makeNode("div", "div", "overflow-hidden", undefined, [
          makeNode("img", "img", "w-full h-full object-cover", undefined, undefined, {
            src: "https://codervent.com/shopingo/demo/shopingo_V1/assets/images/extra-images/promo-large.webp",
            alt: "Trending Products",
          }),
        ]),
      ]),
    ]),
  },

  // 5 · Shop by Brands
  {
    id: "shopingo-brands",
    label: "Shop by Brands",
    category: "Shopingo",
    icon: "grid",
    template: makeNode("section", "section", "bg-[#f9f9f9] border-y border-[#e1e1e1] py-14 px-4", undefined, [
      makeNode("div", "div", "max-w-6xl mx-auto", undefined, [
        makeNode("div", "div", "text-center mb-10", undefined, [
          makeNode("h2", "h2", "text-3xl font-extrabold text-[#212529] mb-2", "Shop By Brands"),
          makeNode("p", "p", "text-[#797979] text-sm", "Select your favourite brands and purchase"),
        ]),
        makeNode("div", "div", "grid grid-cols-3 md:grid-cols-5 gap-4", undefined, [
          ...["01","02","03","04","05","06","07","08","09","10"].map((n) =>
            makeNode("div", "div", "bg-card border border-[#e1e1e1] flex items-center justify-center p-5 hover:border-[#ff2c2c] transition-colors cursor-pointer", undefined, [
              makeNode("img", "img", "h-10 object-contain grayscale hover:grayscale-0 transition-all", undefined, undefined, {
                src: `https://codervent.com/shopingo/demo/shopingo_V1/assets/images/brands/${n}.webp`,
                alt: `Brand ${n}`,
              }),
            ])
          ),
        ]),
      ]),
    ]),
  },

  // 6 · Top Categories
  {
    id: "shopingo-categories",
    label: "Top Categories",
    category: "Shopingo",
    icon: "grid",
    template: makeNode("section", "section", "bg-background py-16 px-4", undefined, [
      makeNode("div", "div", "max-w-6xl mx-auto", undefined, [
        makeNode("div", "div", "text-center mb-10", undefined, [
          makeNode("h2", "h2", "text-3xl font-extrabold text-[#212529] mb-2", "Top Categories"),
          makeNode("p", "p", "text-[#797979] text-sm", "Select your favourite categories and purchase"),
        ]),
        makeNode("div", "div", "grid grid-cols-2 md:grid-cols-3 gap-5", undefined, [
          ...[
            ["01", "Kurtas",   "856 Products"],
            ["02", "Heels",    "169 Products"],
            ["03", "Lehenga",  "589 Products"],
            ["04", "Plazzos",  "278 Products"],
            ["05", "Makeup",   "985 Products"],
            ["06", "Shoes",    "489 Products"],
          ].map(([n, cat, count]) =>
            makeNode("a", "a", "relative group overflow-hidden block", undefined, [
              makeNode("img", "img", "w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-300", undefined, undefined, {
                src: `https://codervent.com/shopingo/demo/shopingo_V1/assets/images/categories/${n}.webp`,
                alt: cat,
              }),
              makeNode("div", "div", "absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-5", undefined, [
                makeNode("h4", "h4", "text-white font-bold text-lg", cat),
                makeNode("span", "span", "text-white/70 text-xs", count),
              ]),
            ], { href: "/shop" })
          ),
        ]),
      ]),
    ]),
  },

  // 7 · Newsletter Strip
  {
    id: "shopingo-newsletter",
    label: "Newsletter",
    category: "Shopingo",
    icon: "mail",
    template: makeNode("section", "section", "bg-[#212529] py-14 px-4", undefined, [
      makeNode("div", "div", "max-w-3xl mx-auto text-center", undefined, [
        makeNode("h2", "h2", "text-3xl font-extrabold text-white mb-2", "Get Latest Update by Subscribing Our Newsletter"),
        makeNode("p", "p", "text-white/55 text-sm mb-8", "Get the latest news, promotions and offers sent directly to your inbox."),
        makeNode("div", "div", "flex max-w-lg mx-auto", undefined, [
          makeNode("input", "input", "flex-1 px-4 py-3 text-sm text-[#212529] outline-none border-0", undefined, undefined, {
            type: "email",
            placeholder: "Enter your email address",
          }),
          makeNode("button", "button", "bg-[#ff2c2c] hover:opacity-90 text-white font-bold px-6 py-3 text-sm uppercase tracking-wider whitespace-nowrap transition-opacity cursor-pointer", "Subscribe"),
        ]),
      ]),
    ]),
  },

  // 8 · Blog Cards — typed-block so the right panel shows Settings
  {
    id: "shopingo-blog",
    label: "Latest Blog",
    category: "Shopingo",
    icon: "file-text",
    template: {
      id: "blog-section-placeholder",
      type: "typed-block",
      tag: "div",
      className: "",
      blockType: "blog-section",
      blockData: {
        title: "From Our Blog",
        subtitle: "Check our latest news",
        posts: [
          { id: "1", title: "Fashion Tips for 2026", excerpt: "Discover the latest fashion trends and style tips for the upcoming season.", image: "https://codervent.com/shopingo/demo/shopingo_V1/assets/images/blog/01.webp", author: "Admin", date: "15 Aug, 2026", slug: "fashion-tips-2026" },
          { id: "2", title: "Top 10 Shoes This Year", excerpt: "Find the best footwear picks that combine style and comfort perfectly.", image: "https://codervent.com/shopingo/demo/shopingo_V1/assets/images/blog/02.webp", author: "Admin", date: "20 Sep, 2026", slug: "top-10-shoes" },
          { id: "3", title: "Makeup Must-Haves", excerpt: "Essential makeup products every woman should have in her beauty kit.", image: "https://codervent.com/shopingo/demo/shopingo_V1/assets/images/blog/03.webp", author: "Admin", date: "05 Oct, 2026", slug: "makeup-must-haves" },
        ],
        postsCount: 3,
        titleStyle: "default",
        displayMode: "grid",
        animateCards: false,
        showNavigation: true,
        showPagination: true,
        showPaging: false,
      },
    },
  },
];

const _raw = [...new Set(COMPONENT_BLOCKS.map((b) => b.category))];
// Pin theme-specific categories to the top
export const CATEGORIES = [
  ..._raw.filter((c) => c === "Shopingo"),
  ..._raw.filter((c) => c !== "Shopingo"),
];
