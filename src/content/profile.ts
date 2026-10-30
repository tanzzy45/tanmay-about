/**
 * Every personal fact on the page lives in this file. Components only read from it.
 *
 * `null` marks something the owner still has to supply. Components render it as a
 * visible TODO instead of inventing a value.
 */

export interface Link {
  label: string;
  /** `null` = URL not supplied yet. */
  href: string | null;
}

export interface ContactChannel extends Link {
  /** Text shown in the Contact section. `null` = not supplied yet. */
  display: string | null;
}

export interface Project {
  name: string;
  /** Short context shown beside the name. */
  note?: string;
  /** `null` = role not supplied yet. */
  role: string | null;
  description: string;
  stack: string[];
  /** Path under `public/`. If the file is missing, the card shows a TODO instead. */
  image?: { src: string; alt: string };
  links: Link[];
}

export interface StackRow {
  label: string;
  items: string[];
}

export interface Profile {
  name: string;
  title: string;
  headline: string;
  details: string[];
  contact: ContactChannel[];
  projects: Project[];
  stack: StackRow[];
  aiAgents: {
    /** `null` = bullet not written yet. */
    bullets: (string | null)[];
    links: Link[];
  };
}

const email = 'tanzzyy45@gmail.com';

export const profile: Profile = {
  name: 'Tanmay Surve',
  title: 'Full-stack engineer & founder',
  headline:
    "I've shipped a marketplace to production and sold it to 500+ brands myself. I build full-stack apps, computer vision pipelines and AI agents.",
  details: ['Mumbai, India', 'Fully remote', 'Happy to work US hours'],

  // Hero buttons and the Contact section both read this list. No phone number.
  contact: [
    { label: 'Email', display: email, href: `mailto:${email}` },
    { label: 'GitHub', display: 'github.com/tanzzy45', href: 'https://github.com/tanzzy45' },
    // TODO(owner): [LINKEDIN_URL]
    { label: 'LinkedIn', display: null, href: null },
  ],

  projects: [
    {
      name: 'Fayzo',
      role: 'Founder, 2025 to now',
      description:
        'Marketplace for emerging D2C brands, live in production. Built the whole stack: React Native/Expo, Node.js, Supabase/Postgres with RLS and migrations, Firebase Auth, Razorpay payments with retries and duplicate-webhook protection, Playwright end-to-end tests, Cloudflare. Also ran sales and partner onboarding: cold outreach to 500+ brands, demos.',
      stack: [
        'React Native',
        'Expo',
        'Node.js',
        'Supabase',
        'PostgreSQL',
        'Firebase Auth',
        'Razorpay',
        'Playwright',
        'Cloudflare',
      ],
      // TODO(owner): [FAYZO_URL]
      links: [{ label: 'Website', href: null }],
    },
    {
      name: 'Cricket pitch map',
      note: 'Open source, roboflow/sports',
      // TODO(owner): role not given.
      role: null,
      description:
        'Finds where the ball bounces from TV broadcast video, accurate to within 21 cm. YOLOv8 detection and pose, OpenCV homography and camera calibration, 704 hand-labelled frames, held-out evaluation, pytest.',
      stack: ['YOLOv8', 'OpenCV', 'pytest'],
      // TODO(owner): check this alt text matches the GIF once it is added.
      image: {
        src: '/pitch-map.gif',
        alt: 'Cricket pitch map: ball bounce points found from TV broadcast video',
      },
      links: [
        {
          label: 'Code (feat/cricket-pitch)',
          href: 'https://github.com/tanzzy45/sports/tree/feat/cricket-pitch',
        },
        { label: 'PR #72 (bug fix)', href: 'https://github.com/roboflow/sports/pull/72' },
        { label: 'Issue #74 (proposal)', href: 'https://github.com/roboflow/sports/issues/74' },
      ],
    },
    {
      name: 'JobRadar',
      // TODO(owner): role not given.
      role: null,
      description:
        'AI job-search agent (Python). Collects about 50,000 postings a day from 20+ job sites and the hiring APIs of 580+ companies, filters them with rules, screens the shortlist with Claude (structured verdicts, cached), and runs itself daily with a Telegram bot.',
      stack: ['Python', 'Claude', 'Telegram Bot'],
      links: [{ label: 'Code', href: 'https://github.com/tanzzy45/jobradar' }],
    },
    {
      name: 'Weather-aware truck routing',
      // TODO(owner): role not given.
      role: null,
      description:
        "Compares 3 truck routes using the forecast at each checkpoint's ETA. React + Django, HERE truck routing with OSRM fallback, a pure tested risk-rules engine, 0–48 h corridor weather heatmap, Docker, 80+ tests in CI.",
      stack: ['React', 'Django', 'HERE', 'OSRM', 'Docker'],
      links: [
        { label: 'Live demo', href: 'https://weather-truck-routing-kn0b.onrender.com' },
        { label: 'Code', href: 'https://github.com/tanzzy45/weather-truck-routing' },
      ],
    },
  ],

  stack: [
    {
      label: 'Languages & frameworks',
      items: [
        'TypeScript',
        'Python',
        'JavaScript',
        'Node.js',
        'React',
        'React Native',
        'Expo',
        'Django',
      ],
    },
    {
      label: 'Data & backend',
      items: [
        'PostgreSQL',
        'Supabase',
        'SQL (schema design, migrations, RLS)',
        'Firebase',
        'Redis',
        'FastAPI',
      ],
    },
    {
      label: 'Tooling',
      items: [
        'Git (branches, worktrees, rebases)',
        'Docker',
        'GitHub Actions',
        'Playwright',
        'pytest',
        'vitest',
        'Claude Code',
      ],
    },
  ],

  aiAgents: {
    // TODO(owner): write these three bullets.
    bullets: [null, null, null],
    links: [
      { label: 'See the PRs that built this page', href: '#build-log' },
      { label: 'Read my field report', href: '/field-report' },
    ],
  },
};
