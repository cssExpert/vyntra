// Default Academy page content, extracted from the source "Le Middle Prep
// Academy" template. Only the 7 core pages are covered in this first pass —
// apply/book-a-tour/faculty/events/news/parents/student-life/support pages
// are out of scope, so every "Book a Tour" / "Apply Now" CTA across these
// pages points at /contact instead of a dedicated (not-yet-installed) page.

type SeedBlock = { id: string; type: string; data: Record<string, unknown> };

function b(id: string, type: string, data: Record<string, unknown>): SeedBlock {
  return { id, type, data };
}

const CTA_BANNER_FINAL = (id: string, title: string, subtitle?: string) =>
  b(id, "cta-banner", {
    title,
    subtitle,
    primaryCtaText: "Book a Tour",
    primaryCtaUrl: "/contact",
    secondaryCtaText: "Apply Now",
    secondaryCtaUrl: "/contact",
  });

export const ACADEMY_PAGE_DEFAULTS: Record<string, SeedBlock[]> = {
  home: [
    b("hero1", "hero-banner", {
      eyebrow: "Serving Grades 6–8, Now Enrolling Founding Families",
      heading: "Small by Design. Strong by Intention.",
      body: "A private middle school built around a 13-student class cap, faith-grounded character formation, and real mentorship — redefining the middle school experience in Baton Rouge, Louisiana.",
      backgroundImage: "",
      primaryCtaText: "Book a Tour",
      primaryCtaUrl: "/contact",
      secondaryCtaText: "Apply Now",
      secondaryCtaUrl: "/contact",
      tone: "navy",
    }),
    b("stats1", "stats-counter", {
      eyebrow: "Academic Excellence",
      title: "Rigor that prepares, not just occupies.",
      subtitle: "Our curriculum is built for the transition to elite high schools and beyond — measured, benchmarked, and relentlessly personal.",
      stats: [
        { value: "13", label: "Max per grade" },
        { value: "100%", label: "Certified faculty" },
        { value: "1:13", label: "Teacher ratio" },
        { value: "7", label: "Leadership pillars" },
      ],
      linkText: "Explore Academics →",
      linkUrl: "/academics",
    }),
    b("ti1", "text-image", {
      heading: "Small by design. Exceptional by outcome.",
      paragraphs: [
        "A thirteen-student class cap isn't a limitation — it's the most valuable thing we offer. Every teacher knows your child's handwriting, their fears, and their potential.",
        "1:13 — Teacher-to-student ratio, by design.",
      ],
      image: "",
      imagePosition: "right",
    }),
    b("ti2", "text-image", {
      heading: "A campus built for focus and belonging.",
      paragraphs: [
        "Purpose-built learning spaces — Bright, modern classrooms designed for small-group instruction and collaborative work — every space serves the mission.",
        "A safe, closely held community — Small enough that every staff member knows every family — safety and belonging aren't slogans here, they're structural.",
      ],
      image: "",
      imagePosition: "left",
      ctaText: "Take the Virtual Tour →",
      ctaUrl: "/campus",
    }),
    b("prog1", "academics-programs", {
      eyebrow: "Programs",
      title: "Formed for leadership, in every direction.",
      cards: [
        { name: "STEM", description: "Hands-on science, technology, engineering and math from day one." },
        { name: "Leadership", description: "Structured programs building confidence, voice, and responsibility." },
        { name: "Arts", description: "Creative expression as a core discipline, not an elective afterthought." },
        { name: "Athletics", description: "Teamwork and discipline built on the field and in the gym." },
        { name: "Community Service", description: "Real service projects that build empathy and civic responsibility." },
        { name: "Faith & Character", description: "Daily formation grounded in values, reflection, and community." },
      ],
    }),
    b("gallery1", "photo-gallery", {
      eyebrow: "Student Life",
      title: "A full, joyful, well-rounded childhood.",
      images: [
        { image: "", caption: "STEM Lab" },
        { image: "", caption: "Field Day" },
        { image: "", caption: "Leadership Retreat" },
        { image: "", caption: "Reading Circle" },
        { image: "", caption: "Morning Circle" },
        { image: "", caption: "Mentorship" },
      ],
      linkText: "View the Full Gallery →",
      linkUrl: "/campus",
    }),
    b("ti3", "text-image", {
      heading: "“I built this school because every child deserves to be known — not just enrolled.”",
      paragraphs: [
        "Founded on the belief that the middle school years shape a lifetime, Le Middle Prep Academy was built from the ground up around small classes, real mentorship, and a faith-grounded community — not a franchise model.",
      ],
      image: "",
      imagePosition: "right",
      ctaText: "Read the Full Story →",
      ctaUrl: "/about",
    }),
    b("testi1", "testimonials", {
      eyebrow: "Testimonials",
      title: "Parents notice the difference in weeks, not years.",
      items: [
        { quote: "Within a month, my son went from dreading school to leading his class in morning circle. The teachers know him — really know him.", name: "Maria T.", role: "Parent of 6th Grader" },
        { quote: "The small class size isn't marketing — I watched my daughter get individual reading support every single day.", name: "James O.", role: "Parent of 7th Grader" },
        { quote: "We toured five schools. This was the only one where the founder knew our daughter's name by our second visit.", name: "Denise R.", role: "Parent of 8th Grader" },
      ],
    }),
    b("adm1", "admissions-steps", {
      eyebrow: "Admissions Process",
      title: "Four steps to belonging.",
      steps: [
        { number: "1", title: "Inquire", description: "Tell us about your family and your child's needs." },
        { number: "2", title: "Tour", description: "Walk the campus and meet the faculty in person." },
        { number: "3", title: "Apply", description: "Submit a simple, guided application online." },
        { number: "4", title: "Enroll", description: "Join the founding community of leaders." },
      ],
      ctaText: "Start the Admissions Process",
      ctaUrl: "/admissions",
    }),
    b("stats2", "stats-counter", {
      eyebrow: "Impact Statistics",
      title: "Numbers that matter.",
      stats: [
        { value: "13", label: "Students per grade, max" },
        { value: "100%", label: "Certified educators" },
        { value: "7", label: "Leadership pillars taught" },
        { value: "501(c)(3)", label: "Nonprofit institution" },
      ],
    }),
    b("ti4", "text-image", {
      heading: "Your gift funds a seat for a future leader.",
      paragraphs: [
        "Every scholarship dollar goes directly to tuition support — no overhead, no waste, just a child in a classroom that knows their name.",
      ],
      image: "",
      imagePosition: "right",
      ctaText: "See Your Impact",
      ctaUrl: "/contact",
    }),
    b("faq1", "faq-accordion", {
      eyebrow: "FAQ",
      title: "Questions, answered.",
      items: [
        { question: "What is the tuition, and are scholarships available?", answer: "Tuition and scholarship tiers are outlined transparently on our Tuition & Scholarships page, including a scholarship-match option for qualifying families. No hidden fees." },
        { question: "What grades does Le Middle Prep Academy serve?", answer: "We serve grades 6 through 8, with a strict 13-student cap per grade to preserve our personalized model." },
        { question: "Is Le Middle Prep Academy accredited?", answer: "As a founding-class institution, we are actively pursuing accreditation and publish our status transparently on our About page." },
        { question: "How do I schedule a tour?", answer: "Use the Book a Tour page to pick a private or group tour time — most requests are confirmed within one business day." },
      ],
      linkText: "View Full FAQ →",
      linkUrl: "/faq",
    }),
    CTA_BANNER_FINAL("cta1", "Your child's leadership story starts here."),
  ],

  about: [
    b("hero1", "hero-banner", {
      eyebrow: "About Le Middle Prep Academy",
      heading: "Built on faith, small classes, and the belief that every child deserves to be known.",
      body: "We are a founding-class institution with a simple conviction: middle school shapes a lifetime, and no child should move through it as a number in a crowded roster.",
      backgroundImage: "",
      tone: "light",
    }),
    b("ti1", "text-image", {
      heading: "Mission & Vision",
      paragraphs: [
        "We exist to form confident, faith-grounded leaders — one child, one classroom, one relationship at a time. Every student is known, not numbered.",
        "Our vision is a Louisiana where a rigorous, values-centered education is not reserved for the few — where every family, regardless of means, can choose a school that treats their child's character and intellect as inseparable, and where thirteen desks per grade means thirteen futures we intend to know by name.",
      ],
      image: "",
      imagePosition: "right",
    }),
    b("ti2", "text-image", {
      heading: "“I built this school because every child deserves to be known — not just enrolled.”",
      paragraphs: [
        "Dr. Camille Fontenot spent over a decade teaching in Louisiana classrooms of thirty-plus students before she reached a breaking point: she could see which children were struggling, but she rarely had the minutes in a day to actually reach them.",
        "Le Middle Prep Academy was founded on three convictions: that the middle school years, more than any other, form the adults our children become; that character and faith are not separate from academic rigor but the foundation of it; and that real mentorship only happens when a teacher actually has time to know a student's handwriting, their fears, and their potential.",
        "Today, Dr. Fontenot still teaches a class period herself each week, because she believes a Head of School who has lost touch with the classroom has lost touch with the mission.",
      ],
      image: "",
      imagePosition: "left",
    }),
    b("faculty1", "faculty-grid", {
      eyebrow: "Governance",
      title: "Board of Directors.",
      intro: "As a 501(c)(3) nonprofit, Le Middle Prep Academy is guided by a volunteer board of Louisiana educators, business leaders, and parents committed to responsible stewardship of the mission.",
      members: [
        { name: "Dr. Angela Fontenot", role: "Board Chair", bio: "Twenty years in Louisiana public education administration, now devoted full-time to nonprofit school governance.", image: "" },
        { name: "Marcus Boudreaux", role: "Vice Chair, Finance", bio: "A Baton Rouge CPA who ensures every scholarship dollar is stewarded with full transparency.", image: "" },
        { name: "Dr. Renee Thibodeaux", role: "Board Secretary", bio: "Curriculum design specialist guiding our academic standards and accreditation preparation.", image: "" },
        { name: "James Callier", role: "Director, Community Engagement", bio: "Local pastor and community organizer connecting families with Baton Rouge's faith community.", image: "" },
        { name: "Sophia Landry", role: "Director, Parent Representative", bio: "A founding-class parent bringing the family perspective directly into every board decision.", image: "" },
      ],
    }),
    b("accred1", "custom-html", {
      html: `<section style="background:#faf8f4;padding:70px 0;">
  <div style="max-width:1100px;margin:0 auto;padding:0 24px;">
    <p style="text-align:center;font-size:12px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#C9A961;margin-bottom:12px;">Transparency</p>
    <h2 style="text-align:center;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:700;color:#0B1E33;margin-bottom:32px;">Accreditation &amp; Nonprofit Status</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px;margin-bottom:24px;">
      <div style="background:#fff;border:1px solid #C9A96144;border-radius:8px;padding:24px;">
        <span style="display:inline-block;font-size:11px;font-weight:700;padding:3px 10px;border-radius:4px;background:#0B1E33;color:#fff;margin-bottom:10px;">Confirmed</span>
        <h3 style="font-family:Georgia,serif;font-size:17px;font-weight:700;color:#0B1E33;margin:0 0 8px;">501(c)(3) Nonprofit</h3>
        <p style="font-size:14px;color:#555;line-height:1.6;margin:0;">Le Middle Prep Academy is a registered 501(c)(3) nonprofit institution. Donations are tax-deductible, and our finances are governed by an independent volunteer board rather than private ownership.</p>
      </div>
      <div style="background:#fff;border:1px solid #C9A96144;border-radius:8px;padding:24px;">
        <span style="display:inline-block;font-size:11px;font-weight:700;padding:3px 10px;border-radius:4px;background:#C9A961;color:#0B1E33;margin-bottom:10px;">In Progress</span>
        <h3 style="font-family:Georgia,serif;font-size:17px;font-weight:700;color:#0B1E33;margin:0 0 8px;">Accreditation</h3>
        <p style="font-size:14px;color:#555;line-height:1.6;margin:0;">As a founding-class school, we have not yet completed formal accreditation. We are actively pursuing candidacy through Cognia, with full accreditation targeted for the 2027–2028 school year.</p>
      </div>
    </div>
    <div style="background:#fff;border:1px solid #C9A96144;border-radius:8px;padding:24px;">
      <h3 style="font-family:Georgia,serif;font-size:17px;font-weight:700;color:#0B1E33;margin:0 0 8px;">What this means for your family</h3>
      <p style="font-size:14px;color:#555;line-height:1.6;margin:0;">Our curriculum, faculty credentialing, and academic benchmarks are already held to accreditation-level standards in preparation for candidacy — we simply haven't completed the formal review process yet. We'll update this page the moment our status changes, and we're always happy to discuss it directly on a tour.</p>
    </div>
  </div>
</section>`,
    }),
    CTA_BANNER_FINAL("cta1", "Come meet the people behind the mission.", "The best way to understand Le Middle Prep Academy is to walk the halls yourself."),
  ],

  academics: [
    b("hero1", "hero-banner", {
      eyebrow: "Academics",
      heading: "Rigor that prepares, not just occupies.",
      body: "A grade-by-grade curriculum benchmarked against elite high school admissions — delivered by certified faculty in classes capped at thirteen students.",
      backgroundImage: "",
      tone: "light",
    }),
    b("prog1", "academics-programs", {
      eyebrow: "Curriculum",
      title: "A curriculum that builds year over year.",
      subtitle: "Each grade layers new rigor and responsibility on a foundation of core subjects — so every student arrives at high school ready, not just old enough.",
      cards: [
        {
          name: "Grade 6 — \"Foundations & Habits\"",
          subjects: ["English Language Arts", "Pre-Algebra Mathematics", "Earth & Life Science", "Louisiana & U.S. History", "Faith & Character Formation"],
          differentiator: "A dedicated study-skills block that builds organization and ownership from the very first week.",
        },
        {
          name: "Grade 7 — \"Depth & Analysis\"",
          subjects: ["English Literature & Composition", "Algebra I", "Life & Physical Science", "World Geography & Civics", "Leadership Seminar"],
          differentiator: "Formal research and debate work begins — students learn to defend an argument in writing and aloud.",
        },
        {
          name: "Grade 8 — \"Readiness & Launch\"",
          subjects: ["Advanced English & Rhetoric", "Algebra I / Geometry Track", "Physical Science & Lab Methods", "U.S. Government & Economics", "High School Placement Prep"],
          differentiator: "One-on-one high school placement counseling, entrance-exam prep, and mock interviews.",
        },
      ],
    }),
    b("stats1", "stats-counter", {
      title: "Measured, benchmarked, and relentlessly personal.",
      stats: [
        { value: "13", label: "Students per grade, max" },
        { value: "100%", label: "Certified faculty" },
        { value: "1:13", label: "Teacher-to-student ratio" },
        { value: "3", label: "Core subjects taught daily" },
      ],
    }),
    b("ti1", "text-image", {
      heading: "Built for the transition to competitive high schools.",
      paragraphs: [
        "100% of graduates placed on a college-prep high school track.",
        "Our curriculum is benchmarked against the entrance expectations of Louisiana's most competitive high schools — advanced coursework in math and literature, formal writing and research instruction, and structured entrance-exam preparation beginning in seventh grade.",
        "By eighth grade, every student has a personalized placement plan, mock interview practice, and a faculty advocate who writes their recommendation letters.",
      ],
      image: "",
      imagePosition: "right",
      ctaText: "See the Admissions Process →",
      ctaUrl: "/admissions",
    }),
    b("timeline1", "timeline-steps", {
      eyebrow: "A Day in the Life",
      title: "What a school day looks like.",
      steps: [
        { marker: "7:45–8:00 AM", title: "Arrival & Morning Circle", description: "Students arrive, settle in, and open the day together in a short community circle." },
        { marker: "8:00–10:00 AM", title: "Core Block: Math & English", description: "Small-group instruction in the two subjects that anchor the rest of the day." },
        { marker: "10:00–10:15 AM", title: "Break", description: "A short reset outdoors, weather permitting." },
        { marker: "10:15 AM–12:00 PM", title: "Science & Social Studies", description: "Hands-on labs and discussion-based history and civics instruction." },
        { marker: "12:00–12:45 PM", title: "Lunch & Recreation", description: "A full lunch period with time for outdoor play and community." },
        { marker: "12:45–2:15 PM", title: "Electives: Arts, STEM & Leadership", description: "Rotating enrichment blocks that build skills beyond the core curriculum." },
        { marker: "2:15–3:00 PM", title: "Faith & Character Formation", description: "Guided reflection and values-based discussion to close the academic day." },
        { marker: "3:00 PM", title: "Dismissal", description: "Staggered pickup with staff supervision until every student is on their way home." },
      ],
    }),
    CTA_BANNER_FINAL("cta1", "See the rigor in person.", "Visit a classroom, meet the faculty, and see why families notice the difference in weeks, not years."),
  ],

  admissions: [
    b("hero1", "hero-banner", {
      eyebrow: "Join The Founding Community",
      heading: "Admissions at Le Middle Prep Academy.",
      body: "A simple, personal path from first inquiry to first day — transparent tuition, clear dates, and a team that answers real questions.",
      backgroundImage: "",
      primaryCtaText: "Apply Now",
      primaryCtaUrl: "/contact",
      secondaryCtaText: "Book a Tour",
      secondaryCtaUrl: "/contact",
      tone: "light",
    }),
    b("adm1", "admissions-steps", {
      eyebrow: "Admissions Process",
      title: "Four steps to belonging.",
      steps: [
        { number: "1", title: "Inquire", description: "Tell us about your family and your child's needs." },
        { number: "2", title: "Tour", description: "Walk the campus and meet the faculty in person." },
        { number: "3", title: "Apply", description: "Submit a simple, guided application online." },
        { number: "4", title: "Enroll", description: "Join the founding community of leaders." },
      ],
      ctaText: "Start Your Application",
      ctaUrl: "/contact",
    }),
    b("pricing1", "pricing-tiers", {
      eyebrow: "Tuition & Scholarships",
      title: "Transparent pricing, no surprises.",
      subtitle: "Figures below are illustrative starting points — every family's true cost is confirmed individually. Contact our admissions team for current rates.",
      tiers: [
        {
          name: "Standard Tuition",
          price: "$14,200/yr",
          note: "Illustrative figure — contact us for current rates.",
          features: ["Full academic program, grades 6–8", "13-student class cap", "All core materials included"],
          ctaText: "Apply Now",
          ctaUrl: "/contact",
        },
        {
          name: "Sibling Discount",
          price: "$12,000/yr",
          note: "Illustrative figure — per additional sibling enrolled.",
          badge: "Most Common",
          features: ["Applies to 2nd & 3rd enrolled siblings", "Same full academic program", "Combined family billing"],
          ctaText: "Apply Now",
          ctaUrl: "/contact",
        },
        {
          name: "Scholarship-Match",
          price: "Up to 50% off",
          note: "Illustrative figure — awarded based on demonstrated need.",
          features: ["Need-based, confidential review", "Funded by donor scholarship pool", "Renewable annually"],
          ctaText: "See Your Impact →",
          ctaUrl: "/contact",
        },
      ],
      calloutTitle: "Financial aid is a real conversation, not a form letter.",
      calloutBody: "Every scholarship dollar goes directly to tuition support. If cost is a concern, tell us before you rule us out — our admissions team reviews aid applications alongside the standard admissions file.",
      calloutCtaText: "Start a Scholarship Application",
      calloutCtaUrl: "/contact",
    }),
    b("timeline1", "timeline-steps", {
      eyebrow: "Admissions Calendar",
      title: "Key dates to know.",
      steps: [
        { marker: "January 15", title: "Priority application deadline", description: "Applications received by this date receive first review for the fall class." },
        { marker: "February 1–28", title: "Family interviews & campus visits", description: "A short conversation with our admissions team, scheduled individually." },
        { marker: "March 15", title: "Admission decision notification", description: "Families are notified by email and phone of their admission decision." },
        { marker: "April 1", title: "Enrollment deposit due", description: "A deposit secures your child's seat in a class capped at thirteen students." },
        { marker: "August 8", title: "New family orientation day", description: "Meet faculty, tour classrooms, and get everything ready before the first day." },
      ],
    }),
    b("dualcta1", "cta-cards", {
      cards: [
        { title: "Ready to apply?", description: "Start your child's application today — it takes about fifteen minutes.", ctaText: "Apply Now", ctaUrl: "/contact", tone: "light" },
        { title: "Want to see it first?", description: "Walk the campus, meet the faculty, and see the 1:13 ratio in action.", ctaText: "Book a Tour", ctaUrl: "/contact", tone: "navy" },
      ],
    }),
    CTA_BANNER_FINAL("cta1", "Your child's leadership story starts here."),
  ],

  contact: [
    b("hero1", "hero-banner", {
      eyebrow: "We'd Love to Hear From You",
      heading: "Contact Us.",
      body: "Questions about admissions, tuition, or a tour? Reach out — a real person on our team will respond personally, not a call center.",
      tone: "navy",
    }),
    b("cfi1", "contact-form-info", {
      formTitle: "Send a Message",
      formSubtitle: "Tell us how we can help.",
      submitText: "Send Message",
      infoTitle: "Reach Us Directly",
      addressLabel: "Campus Address",
      address: "123 Heritage Way, Baton Rouge, LA 70801",
      phoneLabel: "Phone",
      phoneLines: ["(225) 555-0142"],
      emailLabel: "Email",
      email: "admissions@lemiddleprepacademy.com",
      workingDaysLabel: "Office Hours",
      workingDays: "Monday – Friday, 8:00 AM – 4:00 PM",
      departments: ["Admissions", "General Inquiries", "Support & Donations"],
    }),
    CTA_BANNER_FINAL("cta1", "See the campus for yourself.", "The best way to understand Le Middle Prep Academy is to walk our halls and meet our faculty in person."),
  ],

  faq: [
    b("hero1", "hero-banner", {
      eyebrow: "Here to Help",
      heading: "Frequently Asked Questions.",
      body: "Everything you want to know about admissions, academics, tuition, and life at Le Middle Prep Academy — answered honestly, with no fine print.",
      tone: "navy",
    }),
    b("faq1", "faq-accordion", {
      groups: [
        {
          category: "Admissions",
          intro: "The essentials on applying, deadlines, and what we look for in a new family.",
          items: [
            { question: "When is the application deadline?", answer: "Our priority deadline for fall enrollment is March 1, though we accept rolling applications year-round as class seats remain open." },
            { question: "What are the entrance requirements?", answer: "We ask for a completed application, most recent report cards, a brief teacher recommendation, and a family interview. There is no standardized entrance exam." },
            { question: "What grades does Le Middle Prep Academy serve?", answer: "We serve grades 6 through 8 exclusively, with a strict cap of 13 students per grade to preserve our personalized, mentorship-driven model." },
            { question: "What does the admissions process look like, step by step?", answer: "It's four simple steps: inquire, tour the campus, submit a guided online application, and — once accepted — enroll." },
            { question: "How do I schedule a tour?", answer: "Use our Book a Tour page to pick a private or small-group tour time. Most requests are confirmed within one business day." },
          ],
        },
        {
          category: "Academics",
          intro: "How we teach, why our classes stay small, and what a typical school week involves.",
          items: [
            { question: "Why cap each grade at 13 students?", answer: "Thirteen is the number at which a teacher can genuinely know every student's handwriting, strengths, and struggles. It's a deliberate ceiling, not a marketing figure." },
            { question: "How rigorous is the curriculum?", answer: "Our academics are built for the transition into elite high schools — benchmarked, standards-aligned, and personalized to pace." },
            { question: "What is your homework philosophy?", answer: "Homework reinforces the day's learning rather than introducing new material alone at home." },
            { question: "What extracurriculars are offered?", answer: "Students choose from STEM clubs, leadership programs, visual and performing arts, and athletics." },
            { question: "Is Le Middle Prep Academy accredited?", answer: "As a founding-class institution, we are actively pursuing accreditation and publish our current status transparently on our About page." },
          ],
        },
        {
          category: "Tuition & Financial Aid",
          intro: "Transparent answers on cost, payment options, and how scholarships work at a nonprofit school.",
          items: [
            { question: "What is the tuition range?", answer: "Tuition is published in full on our Tuition & Scholarships page and reflects our small-class model. As a registered 501(c)(3) nonprofit, every dollar is reinvested directly into the classroom." },
            { question: "Are payment plans available?", answer: "Yes. Families may pay in full, split tuition into semester installments, or enroll in a monthly payment plan." },
            { question: "Who is eligible for scholarships?", answer: "We offer need-based scholarship support to qualifying families through donor-funded seats." },
            { question: "What does tuition include?", answer: "Tuition covers core academics, STEM and leadership programming, and standard classroom materials." },
          ],
        },
        {
          category: "Campus & Safety",
          intro: "How we keep every student safe, healthy, and known throughout the school day.",
          items: [
            { question: "How do drop-off and pick-up work?", answer: "All drop-off and pick-up happens through a single supervised entrance with staff verifying each student by name." },
            { question: "What emergency procedures are in place?", answer: "Our campus follows a documented emergency response plan with regular fire, severe weather, and lockdown drills." },
            { question: "Can you accommodate food allergies and dietary needs?", answer: "Yes. We collect allergy and dietary information during enrollment and share it directly with staff overseeing meals and snacks." },
            { question: "What campus security measures are in place?", answer: "Campus access is restricted to a single monitored entrance during school hours, with visitor sign-in required for every guest." },
          ],
        },
      ],
    }),
    b("cta1", "cta-banner", {
      title: "Still have questions? We'd love to talk.",
      subtitle: "Our admissions team is happy to answer anything that isn't covered here — no question is too small.",
      primaryCtaText: "Contact Us",
      primaryCtaUrl: "/contact",
      secondaryCtaText: "Book a Tour",
      secondaryCtaUrl: "/contact",
    }),
  ],

  campus: [
    b("hero1", "hero-banner", {
      eyebrow: "Campus",
      heading: "A campus built for focus and belonging.",
      body: "Every classroom, courtyard, and hallway at our Baton Rouge campus is designed around one idea: small groups do their best work in spaces made just for them.",
      tone: "light",
    }),
    b("gallery1", "photo-gallery", {
      eyebrow: "Photo Gallery",
      title: "Take a look around.",
      images: [
        { image: "", caption: "Grade 6 Classroom" },
        { image: "", caption: "Main Campus Building" },
        { image: "", caption: "Library & Reading Room" },
        { image: "", caption: "Science Lab" },
        { image: "", caption: "Breezeway & Common Area" },
        { image: "", caption: "Outdoor Athletic Field" },
        { image: "", caption: "Grade 8 Seminar Room" },
        { image: "", caption: "Outdoor Courtyard" },
        { image: "", caption: "Main Hallway" },
      ],
    }),
    b("ti1", "text-image", {
      heading: "Purpose-built classrooms",
      paragraphs: [
        "Every classroom is sized and furnished for a 13-student cap — flexible seating, natural light, and no wasted space, so instruction stays close and personal.",
      ],
      image: "",
      imagePosition: "right",
    }),
    b("ti2", "text-image", {
      heading: "Safety & security by design",
      paragraphs: [
        "Single-point campus access, badge-controlled entry, and staff who know every family on sight — safety isn't an add-on here, it's built into how small our campus stays.",
      ],
      image: "",
      imagePosition: "left",
    }),
    b("ti3", "text-image", {
      heading: "Outdoor & athletic space",
      paragraphs: [
        "A shaded courtyard for daily breaks and an open field for athletics and field days — room to move is part of the whole-child model, not an afterthought.",
      ],
      image: "",
      imagePosition: "right",
    }),
    b("ti4", "text-image", {
      heading: "Photos only tell half the story.",
      paragraphs: [
        "The best way to understand our campus is to walk it. We offer private in-person tours on weekday mornings and live virtual tours for families joining us from outside the Baton Rouge area — both include time to meet faculty and see a classroom in session.",
      ],
      image: "",
      imagePosition: "left",
      ctaText: "Schedule Your Tour",
      ctaUrl: "/contact",
    }),
    CTA_BANNER_FINAL("cta1", "Come walk the halls yourself."),
  ],
};
