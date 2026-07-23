// Default Academy page/menu/layout definitions — installed on demand via POST /cms/themes/academy/install
// Content is extracted from the "Le Middle Prep Academy" source template; only
// the 7 core pages are covered in this first pass. "Book a Tour" / "Apply Now"
// CTAs point at /contact since dedicated apply/book-a-tour pages aren't installed.

import type { InstallPageDef, InstallMenuDef, InstallLayoutDef } from './shopingo-installer';

export const ACADEMY_MENUS: InstallMenuDef[] = [
  {
    slug: 'academy-nav',
    name: 'Main Navigation',
    menuType: 'navigation',
    role: 'nav',
    items: [
      { label: 'About',      url: '/about',      target: '_self', order: 0 },
      { label: 'Academics',  url: '/academics',  target: '_self', order: 1 },
      { label: 'Campus & Life', url: '/campus',  target: '_self', order: 2 },
      { label: 'Admissions', url: '/admissions', target: '_self', order: 3 },
      { label: 'FAQ',        url: '/faq',        target: '_self', order: 4 },
    ],
  },
  {
    slug: 'academy-explore',
    name: 'Explore',
    menuType: 'footer',
    role: 'footer-col',
    items: [
      { label: 'About',      url: '/about',      target: '_self', order: 0 },
      { label: 'Academics',  url: '/academics',  target: '_self', order: 1 },
      { label: 'Campus & Life', url: '/campus',  target: '_self', order: 2 },
    ],
  },
  {
    slug: 'academy-admissions',
    name: 'Admissions',
    menuType: 'footer',
    role: 'footer-col',
    items: [
      { label: 'Admissions', url: '/admissions', target: '_self', order: 0 },
      { label: 'FAQ',        url: '/faq',        target: '_self', order: 1 },
    ],
  },
  {
    slug: 'academy-community',
    name: 'Community',
    menuType: 'footer',
    role: 'footer-col',
    items: [
      { label: 'Contact Us', url: '/contact',    target: '_self', order: 0 },
    ],
  },
];

export const ACADEMY_LAYOUT: InstallLayoutDef = {
  name: 'Academy',
  navMenuSlug: 'academy-nav',
  footerColumns: [
    { title: 'Explore',    menuSlug: 'academy-explore' },
    { title: 'Admissions', menuSlug: 'academy-admissions' },
    { title: 'Community',  menuSlug: 'academy-community' },
  ],
};

function id(s: string) { return s; }

export const ACADEMY_PAGES: InstallPageDef[] = [

  // ── Home ─────────────────────────────────────────────────────────────────────
  {
    slug: 'home',
    title: 'Home',
    metaDesc: 'A premium, faith-grounded private middle school with a 13-student class cap, rigorous academics, and a leadership-focused whole-child education.',
    isLandingPage: true,
    blocks: [
      {
        id: id('hero1'), type: 'hero-banner', data: {
          eyebrow: 'Serving Grades 6–8, Now Enrolling Founding Families',
          heading: 'Small by Design. Strong by Intention.',
          body: 'A private middle school built around a 13-student class cap, faith-grounded character formation, and real mentorship.',
          primaryCtaText: 'Book a Tour', primaryCtaUrl: '/contact',
          secondaryCtaText: 'Apply Now', secondaryCtaUrl: '/contact',
          tone: 'navy',
        },
      },
      {
        id: id('stats1'), type: 'stats-counter', data: {
          eyebrow: 'Academic Excellence',
          title: 'Rigor that prepares, not just occupies.',
          subtitle: 'Measured, benchmarked, and relentlessly personal.',
          stats: [
            { value: '13', label: 'Max per grade' },
            { value: '100%', label: 'Certified faculty' },
            { value: '1:13', label: 'Teacher ratio' },
            { value: '7', label: 'Leadership pillars' },
          ],
          linkText: 'Explore Academics →', linkUrl: '/academics',
        },
      },
      {
        id: id('prog1'), type: 'academics-programs', data: {
          eyebrow: 'Programs',
          title: 'Formed for leadership, in every direction.',
          cards: [
            { name: 'STEM', description: 'Hands-on science, technology, engineering and math from day one.' },
            { name: 'Leadership', description: 'Structured programs building confidence, voice, and responsibility.' },
            { name: 'Arts', description: 'Creative expression as a core discipline, not an elective afterthought.' },
            { name: 'Athletics', description: 'Teamwork and discipline built on the field and in the gym.' },
            { name: 'Community Service', description: 'Real service projects that build empathy and civic responsibility.' },
            { name: 'Faith & Character', description: 'Daily formation grounded in values, reflection, and community.' },
          ],
        },
      },
      {
        id: id('gallery1'), type: 'photo-gallery', data: {
          eyebrow: 'Student Life',
          title: 'A full, joyful, well-rounded childhood.',
          images: [
            { image: '', caption: 'STEM Lab' }, { image: '', caption: 'Field Day' },
            { image: '', caption: 'Leadership Retreat' }, { image: '', caption: 'Reading Circle' },
            { image: '', caption: 'Morning Circle' }, { image: '', caption: 'Mentorship' },
          ],
          linkText: 'View the Full Gallery →', linkUrl: '/campus',
        },
      },
      {
        id: id('testi1'), type: 'testimonials', data: {
          eyebrow: 'Testimonials',
          title: 'Parents notice the difference in weeks, not years.',
          items: [
            { quote: 'Within a month, my son went from dreading school to leading his class in morning circle.', name: 'Maria T.', role: 'Parent of 6th Grader' },
            { quote: "The small class size isn't marketing — I watched my daughter get individual reading support every single day.", name: 'James O.', role: 'Parent of 7th Grader' },
            { quote: 'We toured five schools. This was the only one where the founder knew our daughter\'s name by our second visit.', name: 'Denise R.', role: 'Parent of 8th Grader' },
          ],
        },
      },
      {
        id: id('adm1'), type: 'admissions-steps', data: {
          eyebrow: 'Admissions Process',
          title: 'Four steps to belonging.',
          steps: [
            { number: '1', title: 'Inquire', description: "Tell us about your family and your child's needs." },
            { number: '2', title: 'Tour', description: 'Walk the campus and meet the faculty in person.' },
            { number: '3', title: 'Apply', description: 'Submit a simple, guided application online.' },
            { number: '4', title: 'Enroll', description: 'Join the founding community of leaders.' },
          ],
          ctaText: 'Start the Admissions Process', ctaUrl: '/admissions',
        },
      },
      {
        id: id('faq1'), type: 'faq-accordion', data: {
          eyebrow: 'FAQ',
          title: 'Questions, answered.',
          items: [
            { question: 'What is the tuition, and are scholarships available?', answer: 'Tuition and scholarship tiers are outlined transparently on our Tuition & Scholarships page.' },
            { question: 'What grades does the school serve?', answer: 'We serve grades 6 through 8, with a strict 13-student cap per grade.' },
            { question: 'Is the school accredited?', answer: 'As a founding-class institution, we are actively pursuing accreditation and publish our status on our About page.' },
            { question: 'How do I schedule a tour?', answer: 'Use the Book a Tour page to pick a private or group tour time.' },
          ],
          linkText: 'View Full FAQ →', linkUrl: '/faq',
        },
      },
      {
        id: id('cta1'), type: 'cta-banner', data: {
          title: "Your child's leadership story starts here.",
          primaryCtaText: 'Book a Tour', primaryCtaUrl: '/contact',
          secondaryCtaText: 'Apply Now', secondaryCtaUrl: '/contact',
        },
      },
    ],
  },

  // ── About ────────────────────────────────────────────────────────────────────
  {
    slug: 'about',
    title: 'About',
    metaDesc: 'Meet the founder, mission, and board of directors behind our faith-grounded, 501(c)(3) nonprofit private middle school.',
    isLandingPage: false,
    blocks: [
      {
        id: id('hero1'), type: 'hero-banner', data: {
          eyebrow: 'About Us',
          heading: 'Built on faith, small classes, and the belief that every child deserves to be known.',
          body: 'We are a founding-class institution with a simple conviction: middle school shapes a lifetime.',
          tone: 'light',
        },
      },
      {
        id: id('ti1'), type: 'text-image', data: {
          heading: 'Mission & Vision',
          paragraphs: [
            'We exist to form confident, faith-grounded leaders — one child, one classroom, one relationship at a time.',
            'Our vision is a place where a rigorous, values-centered education is not reserved for the few.',
          ],
          image: '', imagePosition: 'right',
        },
      },
      {
        id: id('faculty1'), type: 'faculty-grid', data: {
          eyebrow: 'Governance',
          title: 'Board of Directors.',
          intro: 'Guided by a volunteer board of educators, business leaders, and parents committed to responsible stewardship of the mission.',
          members: [
            { name: 'Dr. Angela Fontenot', role: 'Board Chair', bio: 'Twenty years in public education administration, now devoted full-time to nonprofit school governance.', image: '' },
            { name: 'Marcus Boudreaux', role: 'Vice Chair, Finance', bio: 'A CPA who ensures every scholarship dollar is stewarded with full transparency.', image: '' },
            { name: 'Dr. Renee Thibodeaux', role: 'Board Secretary', bio: 'Curriculum design specialist guiding our academic standards and accreditation preparation.', image: '' },
            { name: 'James Callier', role: 'Director, Community Engagement', bio: 'Local pastor and community organizer connecting families with the faith community.', image: '' },
            { name: 'Sophia Landry', role: 'Director, Parent Representative', bio: 'A founding-class parent bringing the family perspective directly into every board decision.', image: '' },
          ],
        },
      },
      {
        id: id('cta1'), type: 'cta-banner', data: {
          title: 'Come meet the people behind the mission.',
          subtitle: 'The best way to understand our school is to walk the halls yourself.',
          primaryCtaText: 'Book a Tour', primaryCtaUrl: '/contact',
          secondaryCtaText: 'Apply Now', secondaryCtaUrl: '/contact',
        },
      },
    ],
  },

  // ── Academics ────────────────────────────────────────────────────────────────
  {
    slug: 'academics',
    title: 'Academics',
    metaDesc: 'A grade-by-grade curriculum benchmarked against elite high school admissions, delivered by certified faculty in small classes.',
    isLandingPage: false,
    blocks: [
      {
        id: id('hero1'), type: 'hero-banner', data: {
          eyebrow: 'Academics',
          heading: 'Rigor that prepares, not just occupies.',
          body: 'A grade-by-grade curriculum benchmarked against elite high school admissions.',
          tone: 'light',
        },
      },
      {
        id: id('prog1'), type: 'academics-programs', data: {
          eyebrow: 'Curriculum',
          title: 'A curriculum that builds year over year.',
          cards: [
            { name: 'Grade 6 — "Foundations & Habits"', subjects: ['English Language Arts', 'Pre-Algebra Mathematics', 'Earth & Life Science', 'History', 'Faith & Character Formation'], differentiator: 'A dedicated study-skills block that builds organization and ownership from the very first week.' },
            { name: 'Grade 7 — "Depth & Analysis"', subjects: ['English Literature & Composition', 'Algebra I', 'Life & Physical Science', 'World Geography & Civics', 'Leadership Seminar'], differentiator: 'Formal research and debate work begins.' },
            { name: 'Grade 8 — "Readiness & Launch"', subjects: ['Advanced English & Rhetoric', 'Algebra I / Geometry Track', 'Physical Science & Lab Methods', 'U.S. Government & Economics', 'High School Placement Prep'], differentiator: 'One-on-one high school placement counseling, entrance-exam prep, and mock interviews.' },
          ],
        },
      },
      {
        id: id('timeline1'), type: 'timeline-steps', data: {
          eyebrow: 'A Day in the Life',
          title: 'What a school day looks like.',
          steps: [
            { marker: '7:45–8:00 AM', title: 'Arrival & Morning Circle', description: 'Students arrive, settle in, and open the day together.' },
            { marker: '8:00–10:00 AM', title: 'Core Block: Math & English', description: 'Small-group instruction anchoring the day.' },
            { marker: '12:00–12:45 PM', title: 'Lunch & Recreation', description: 'A full lunch period with time for outdoor play and community.' },
            { marker: '3:00 PM', title: 'Dismissal', description: 'Staggered pickup with staff supervision.' },
          ],
        },
      },
      {
        id: id('cta1'), type: 'cta-banner', data: {
          title: 'See the rigor in person.',
          subtitle: 'Visit a classroom and meet the faculty.',
          primaryCtaText: 'Book a Tour', primaryCtaUrl: '/contact',
          secondaryCtaText: 'Apply Now', secondaryCtaUrl: '/contact',
        },
      },
    ],
  },

  // ── Admissions ───────────────────────────────────────────────────────────────
  {
    slug: 'admissions',
    title: 'Admissions',
    metaDesc: 'Our simple four-step admissions process, transparent tuition and scholarship tiers, and key application dates.',
    isLandingPage: false,
    blocks: [
      {
        id: id('hero1'), type: 'hero-banner', data: {
          eyebrow: 'Join The Founding Community',
          heading: 'Admissions.',
          body: 'A simple, personal path from first inquiry to first day — transparent tuition, clear dates.',
          primaryCtaText: 'Apply Now', primaryCtaUrl: '/contact',
          secondaryCtaText: 'Book a Tour', secondaryCtaUrl: '/contact',
          tone: 'light',
        },
      },
      {
        id: id('adm1'), type: 'admissions-steps', data: {
          eyebrow: 'Admissions Process',
          title: 'Four steps to belonging.',
          steps: [
            { number: '1', title: 'Inquire', description: "Tell us about your family and your child's needs." },
            { number: '2', title: 'Tour', description: 'Walk the campus and meet the faculty in person.' },
            { number: '3', title: 'Apply', description: 'Submit a simple, guided application online.' },
            { number: '4', title: 'Enroll', description: 'Join the founding community of leaders.' },
          ],
          ctaText: 'Start Your Application', ctaUrl: '/contact',
        },
      },
      {
        id: id('pricing1'), type: 'pricing-tiers', data: {
          eyebrow: 'Tuition & Scholarships',
          title: 'Transparent pricing, no surprises.',
          subtitle: "Figures below are illustrative starting points — every family's true cost is confirmed individually.",
          tiers: [
            { name: 'Standard Tuition', price: '$14,200/yr', note: 'Illustrative figure.', features: ['Full academic program, grades 6–8', '13-student class cap', 'All core materials included'], ctaText: 'Apply Now', ctaUrl: '/contact' },
            { name: 'Sibling Discount', price: '$12,000/yr', note: 'Per additional sibling enrolled.', badge: 'Most Common', features: ['Applies to 2nd & 3rd enrolled siblings', 'Same full academic program', 'Combined family billing'], ctaText: 'Apply Now', ctaUrl: '/contact' },
            { name: 'Scholarship-Match', price: 'Up to 50% off', note: 'Awarded based on demonstrated need.', features: ['Need-based, confidential review', 'Funded by donor scholarship pool', 'Renewable annually'], ctaText: 'See Your Impact →', ctaUrl: '/contact' },
          ],
          calloutTitle: 'Financial aid is a real conversation, not a form letter.',
          calloutBody: 'Every scholarship dollar goes directly to tuition support.',
          calloutCtaText: 'Start a Scholarship Application', calloutCtaUrl: '/contact',
        },
      },
      {
        id: id('timeline1'), type: 'timeline-steps', data: {
          eyebrow: 'Admissions Calendar',
          title: 'Key dates to know.',
          steps: [
            { marker: 'January 15', title: 'Priority application deadline', description: 'Applications received by this date receive first review.' },
            { marker: 'February 1–28', title: 'Family interviews & campus visits', description: 'A short conversation with our admissions team.' },
            { marker: 'March 15', title: 'Admission decision notification', description: 'Families are notified by email and phone.' },
            { marker: 'April 1', title: 'Enrollment deposit due', description: "A deposit secures your child's seat." },
            { marker: 'August 8', title: 'New family orientation day', description: 'Meet faculty, tour classrooms.' },
          ],
        },
      },
      {
        id: id('dualcta1'), type: 'cta-cards', data: {
          cards: [
            { title: 'Ready to apply?', description: "Start your child's application today — it takes about fifteen minutes.", ctaText: 'Apply Now', ctaUrl: '/contact', tone: 'light' },
            { title: 'Want to see it first?', description: 'Walk the campus, meet the faculty, and see the small-class ratio in action.', ctaText: 'Book a Tour', ctaUrl: '/contact', tone: 'navy' },
          ],
        },
      },
      {
        id: id('cta1'), type: 'cta-banner', data: {
          title: "Your child's leadership story starts here.",
          primaryCtaText: 'Book a Tour', primaryCtaUrl: '/contact',
          secondaryCtaText: 'Apply Now', secondaryCtaUrl: '/contact',
        },
      },
    ],
  },

  // ── Contact ──────────────────────────────────────────────────────────────────
  {
    slug: 'contact',
    title: 'Contact',
    metaDesc: 'Reach our admissions team by phone, email, or the contact form, or schedule a campus tour.',
    isLandingPage: false,
    blocks: [
      {
        id: id('hero1'), type: 'hero-banner', data: {
          eyebrow: "We'd Love to Hear From You",
          heading: 'Contact Us.',
          body: 'Questions about admissions, tuition, or a tour? Reach out — a real person on our team will respond personally.',
          tone: 'navy',
        },
      },
      {
        id: id('cfi1'), type: 'contact-form-info', data: {
          formTitle: 'Send a Message', formSubtitle: 'Tell us how we can help.', submitText: 'Send Message',
          infoTitle: 'Reach Us Directly',
          addressLabel: 'Campus Address', address: '123 Heritage Way, Baton Rouge, LA 70801',
          phoneLabel: 'Phone', phoneLines: ['(225) 555-0142'],
          emailLabel: 'Email', email: 'admissions@lemiddleprepacademy.com',
          workingDaysLabel: 'Office Hours', workingDays: 'Monday – Friday, 8:00 AM – 4:00 PM',
          departments: ['Admissions', 'General Inquiries', 'Support & Donations'],
        },
      },
      {
        id: id('cta1'), type: 'cta-banner', data: {
          title: 'See the campus for yourself.',
          subtitle: 'The best way to understand our school is to walk our halls and meet our faculty in person.',
          primaryCtaText: 'Book a Tour', primaryCtaUrl: '/contact',
          secondaryCtaText: 'Apply Now', secondaryCtaUrl: '/contact',
        },
      },
    ],
  },

  // ── FAQ ──────────────────────────────────────────────────────────────────────
  {
    slug: 'faq',
    title: 'FAQ',
    metaDesc: "Answers to frequently asked questions about admissions, academics, tuition, and campus safety.",
    isLandingPage: false,
    blocks: [
      {
        id: id('hero1'), type: 'hero-banner', data: {
          eyebrow: 'Here to Help',
          heading: 'Frequently Asked Questions.',
          body: 'Everything you want to know about admissions, academics, tuition, and life at our school.',
          tone: 'navy',
        },
      },
      {
        id: id('faq1'), type: 'faq-accordion', data: {
          groups: [
            {
              category: 'Admissions',
              intro: 'The essentials on applying, deadlines, and what we look for in a new family.',
              items: [
                { question: 'When is the application deadline?', answer: 'Our priority deadline for fall enrollment is March 1, though we accept rolling applications year-round.' },
                { question: 'What are the entrance requirements?', answer: 'A completed application, recent report cards, a teacher recommendation, and a family interview.' },
                { question: 'What grades does the school serve?', answer: 'Grades 6 through 8, with a strict cap of 13 students per grade.' },
                { question: 'What does the admissions process look like, step by step?', answer: 'Inquire, tour the campus, submit a guided application, and enroll.' },
                { question: 'How do I schedule a tour?', answer: 'Use our Book a Tour page — most requests are confirmed within one business day.' },
              ],
            },
            {
              category: 'Academics',
              intro: 'How we teach, why our classes stay small, and what a typical school week involves.',
              items: [
                { question: 'Why cap each grade at 13 students?', answer: 'So a teacher can genuinely know every student\'s handwriting, strengths, and struggles.' },
                { question: 'How rigorous is the curriculum?', answer: 'Built for the transition into elite high schools — benchmarked and standards-aligned.' },
                { question: 'What is your homework philosophy?', answer: "Homework reinforces the day's learning rather than introducing new material alone at home." },
                { question: 'What extracurriculars are offered?', answer: 'STEM clubs, leadership programs, visual and performing arts, and athletics.' },
                { question: 'Is the school accredited?', answer: 'As a founding-class institution, we are actively pursuing accreditation.' },
              ],
            },
            {
              category: 'Tuition & Financial Aid',
              intro: 'Transparent answers on cost, payment options, and how scholarships work at a nonprofit school.',
              items: [
                { question: 'What is the tuition range?', answer: 'Published in full on our Tuition & Scholarships page.' },
                { question: 'Are payment plans available?', answer: 'Yes — pay in full, split by semester, or enroll in a monthly plan.' },
                { question: 'Who is eligible for scholarships?', answer: 'Need-based scholarship support is available through donor-funded seats.' },
                { question: 'What does tuition include?', answer: 'Core academics, STEM and leadership programming, and standard classroom materials.' },
              ],
            },
            {
              category: 'Campus & Safety',
              intro: 'How we keep every student safe, healthy, and known throughout the school day.',
              items: [
                { question: 'How do drop-off and pick-up work?', answer: 'Through a single supervised entrance with staff verifying each student by name.' },
                { question: 'What emergency procedures are in place?', answer: 'A documented emergency response plan with regular fire, weather, and lockdown drills.' },
                { question: 'Can you accommodate food allergies and dietary needs?', answer: 'Yes — allergy and dietary information is collected during enrollment.' },
                { question: 'What campus security measures are in place?', answer: 'A single monitored entrance with visitor sign-in required for every guest.' },
              ],
            },
          ],
        },
      },
      {
        id: id('cta1'), type: 'cta-banner', data: {
          title: "Still have questions? We'd love to talk.",
          subtitle: "Our admissions team is happy to answer anything that isn't covered here.",
          primaryCtaText: 'Contact Us', primaryCtaUrl: '/contact',
          secondaryCtaText: 'Book a Tour', secondaryCtaUrl: '/contact',
        },
      },
    ],
  },

  // ── Campus ───────────────────────────────────────────────────────────────────
  {
    slug: 'campus',
    title: 'Campus',
    metaDesc: 'A photo tour of purpose-built classrooms, safe common areas, outdoor space, and a library designed for a small class cap.',
    isLandingPage: false,
    blocks: [
      {
        id: id('hero1'), type: 'hero-banner', data: {
          eyebrow: 'Campus',
          heading: 'A campus built for focus and belonging.',
          body: 'Every classroom, courtyard, and hallway is designed around one idea: small groups do their best work in spaces made just for them.',
          tone: 'light',
        },
      },
      {
        id: id('gallery1'), type: 'photo-gallery', data: {
          eyebrow: 'Photo Gallery',
          title: 'Take a look around.',
          images: [
            { image: '', caption: 'Grade 6 Classroom' }, { image: '', caption: 'Main Campus Building' },
            { image: '', caption: 'Library & Reading Room' }, { image: '', caption: 'Science Lab' },
            { image: '', caption: 'Breezeway & Common Area' }, { image: '', caption: 'Outdoor Athletic Field' },
            { image: '', caption: 'Grade 8 Seminar Room' }, { image: '', caption: 'Outdoor Courtyard' },
            { image: '', caption: 'Main Hallway' },
          ],
        },
      },
      {
        id: id('ti1'), type: 'text-image', data: {
          heading: 'Purpose-built classrooms',
          paragraphs: ['Every classroom is sized and furnished for a small-group cap — flexible seating, natural light, and no wasted space.'],
          image: '', imagePosition: 'right',
        },
      },
      {
        id: id('ti4'), type: 'text-image', data: {
          heading: 'Photos only tell half the story.',
          paragraphs: ['The best way to understand our campus is to walk it. We offer private in-person tours on weekday mornings and live virtual tours.'],
          image: '', imagePosition: 'left',
          ctaText: 'Schedule Your Tour', ctaUrl: '/contact',
        },
      },
      {
        id: id('cta1'), type: 'cta-banner', data: {
          title: 'Come walk the halls yourself.',
          primaryCtaText: 'Book a Tour', primaryCtaUrl: '/contact',
          secondaryCtaText: 'Apply Now', secondaryCtaUrl: '/contact',
        },
      },
    ],
  },
];
