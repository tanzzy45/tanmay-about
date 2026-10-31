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
  /**
   * Path under `public/`, with the file's pixel size. If the file is missing, the card
   * shows a TODO instead.
   */
  image?: { src: string; alt: string; width: number; height: number };
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
  /** Shown in the hero under the headline. */
  intro: string;
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
  intro: 'Dreamer, Fluent in Python, sarcasm and Stack Overflow',
  details: ['Mumbai, India', 'Fully remote', 'Happy to work US hours'],

  // Hero buttons and the Contact section both read this list. No phone number.
  contact: [
    { label: 'Email', display: email, href: `mailto:${email}` },
    { label: 'GitHub', display: 'github.com/tanzzy45', href: 'https://github.com/tanzzy45' },
    {
      label: 'LinkedIn',
      display: 'linkedin.com/in/tanmay-surve-9419b9361',
      href: 'https://www.linkedin.com/in/tanmay-surve-9419b9361/',
    },
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
      links: [{ label: 'Website', href: 'https://fayzo.in/' }],
    },
    {
      name: 'Cricket pitch map',
      note: 'Open source, roboflow/sports',
      role: 'Solo, open-source contribution',
      description:
        'Finds where the ball bounces from TV broadcast video, accurate to within 21 cm. YOLOv8 detection and pose, OpenCV homography and camera calibration, 704 hand-labelled frames, held-out evaluation, pytest.',
      stack: ['YOLOv8', 'OpenCV', 'pytest'],
      // Animated WebP, converted from the original GIF with sharp.
      image: {
        src: '/pitch-map.webp',
        alt: "Broadcast clip of one cricket delivery, with the ball's path traced in yellow down to where it bounces. Beside it, a top-down pitch map split into length zones (yorker, full, good, back of length, short) plots that bounce: good length, 6.5 m, outside off.",
        width: 720,
        height: 283,
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
      role: 'Solo builder',
      description:
        'AI job-search agent (Python). Collects about 50,000 postings a day from 20+ job sites and the hiring APIs of 580+ companies, filters them with rules, screens the shortlist with Claude (structured verdicts, cached), and runs itself daily with a Telegram bot.',
      stack: ['Python', 'Claude', 'Telegram Bot'],
      links: [{ label: 'Code', href: 'https://github.com/tanzzy45/jobradar' }],
    },
    {
      name: 'Weather-aware truck routing',
      role: 'Solo builder',
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
    bullets: [
      'Break work into small, atomic tickets with clear input/output boundaries to keep context windows clean.',
      'Run parallel agent streams in isolated Git worktrees to prevent branch and lockfile collisions.',
      'Require passing test suites before letting agents auto-commit or merge Pull Requests.',
      'Review generated PR diffs line-by-line instead of assuming a passing build implies perfect business logic.',
      'Log agent failure modes and edge cases in real time to continuously refine future prompts.',
    ],
    links: [
      { label: 'See the PRs that built this page', href: '#build-log' },
      { label: 'Read my field report', href: '/field-report' },
    ],
  },
};
