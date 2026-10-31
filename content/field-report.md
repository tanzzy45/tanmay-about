I built this site with Fredrin over two evenings (30 and 31 October 2026) on Windows 11, as a first-time user. These are my notes: what worked, what broke, what I did about it, and what I'd change. Where I'm guessing at a cause, I say so. I don't know Fredrin's code.

## What worked

- **Parallel tickets in their own worktrees.** Tickets 2, 3 and 4 ran at the same time and were all done in about 25 minutes. When main moved, the workers merged it into their branches 4 times. None of those merges had a conflict.
- **PR descriptions I could trust.** Every PR said what changed, how it was tested and what was still open. The first one flagged a version problem in my own Project Context before I noticed it (see below).
- **No made-up facts.** Anything I hadn't supplied showed up on the page as a visible TODO instead of an invented link or number.
- **Good failure messages.** The CI workflow the worker wrote checks for the Cloudflare secrets first and names both when they're missing. That made the first failed deploy a five-minute fix.

## Setup

**Connecting GitHub didn't bring me back to the app.** After I authorised GitHub in the browser, Fredrin stayed on the connect screen. I closed it and went through the whole flow a second time, and then it worked.

**New chats on a local project start with an error.** Before I pushed the repo to GitHub, every new chat began by trying to sync with origin/main. The project had no remote yet, so the first thing I saw each time was an error that didn't apply to me. Suggestion: check for a remote first and skip the sync quietly if there isn't one.

**No place in the app to write the Project Context.** I wrote CONTEXT.md in VS Code and committed it by hand. It's the first commit in this repo. Opening Tickets from Apps showed an empty board with no obvious "New ticket" button, so it took me a while to find where to start. Suggestion: an "Edit Project Context" entry in the project sidebar, with a starter template.

**My Claude login expired three times.** Each time the ticket stopped and waited for me to press Enter. See "Running, but stuck" below.

## What broke and how I unblocked myself

**The first ticket hung for 14+ minutes in an empty repo.** I asked a worker to build an Astro site in a repo that held only CONTEXT.md. Nothing happened for over 14 minutes. Once I scaffolded Astro myself (npm create astro@latest), the worker started straight away and finished 9 of its 11 plan items on its own.

**Ticket creation froze for 10+ minutes** while it ran node -e scripts in /tmp/fredrin-ticket. I cancelled the stuck process, restarted the app and pressed Build myself, and the worker started. I don't know the cause.

**ticket finish hung for exactly 5 minutes (exit 124) when the summary had backticks.** Summaries with inline code, like a file path in backticks, ran into the 300-second timeout. A dry-run push (GIT_TERMINAL_PROMPT=0 git push --dry-run) returned 0, so git auth and the network were fine. With the backticks removed, ticket finish went through right away. My guess is something in how the summary is escaped. I wrote the ticket that published this report without backticks for that reason.

**One ticket took 1h 3m 50s, though the code was done in about 5 minutes.** During ticket finish there were 25 curl.exe processes running at once, all sending ticket context to Fredrin's API (context-classify), and the worker waited on them. Killing them and opening the PR with gh pr create got the ticket out. I don't know why they piled up.

**Opening the PR from ticket finish often failed.** The worker fell back to gh pr create on its own each time.

**Leftover processes on Windows.** Long tickets left preview servers and curl processes running. The worker had to find and kill them with PowerShell (Get-CimInstance Win32_Process).

**Non-ASCII text got garbled.** Em dashes, arrows and curly quotes in ticket descriptions came back mangled, so I now write tickets in plain ASCII.

**Node version.** Astro 7.4 needs Node 22.22+, and my machine runs 22.18. The worker noticed, pinned Astro to 7.3.8 and explained it in the PR. That one went well.

**The first deploy failed** because I hadn't added the Cloudflare secrets yet. I created the Pages project with wrangler, made a token that can only edit Pages, added both secrets and re-ran the job.

## Running, but stuck

For about 50 minutes the ticket header said Running, while the worker was actually waiting at "Login expired, press Enter to continue". Nothing told me: no Blocked state and no notification. I found out only by opening the ticket.

Two smaller things in the same area:

- If I clicked Start Building and switched to another ticket straight away, the ticket sometimes stayed in Backlog. My guess is that the request is tied to the open view.
- A card can show a Merge button next to a banner saying "Worker is still finishing up, merging now may interrupt it". I wasn't sure which one to trust.

## How the Project Context changed

- **My Project Context was wrong, and the worker caught it.** It said "Node 20+" and "Astro (latest)". The worker on ticket 1 pointed out that Astro 7 needs Node 22.12+ and that 7.4 won't run on this machine. Ticket 8 corrected both lines.
- **The design ticket (PR #7) rewrote the Design section of CONTEXT.md** in the same PR, so later tickets follow the new fonts and colours instead of the old template.
- **Most tickets end with a list of the files they're allowed to touch.** I think that's why the parallel tickets never conflicted.

## Parallel tickets

- Tickets 2, 3 and 4 (field report page, build log, CI and deploy) ran at the same time, and so did tickets 5 and 6. Ticket 7 (design) waited for ticket 5 because both changed the hero.
- **My own spec had a bug.** Ticket 2 asked for "most PRs open at the same time". I merged each PR as soon as it landed, so the stat showed 1 even though three agents had worked at once. Ticket 6 (PR #5) now measures each branch from its first commit to its merge. It also replaced "first commit to live", which showed 17 hours because it counted the night between my two sessions, with total agent time.

## Three changes I'd ship first

1. **Show Blocked when a worker is waiting for input,** and send a desktop notification for Blocked, Failed and Ready for review. This cost me the most time.
2. **Make ticket finish unable to hang.** Escape the summary before sending it, put a short timeout and a retry limit on the context-classify calls, and fall back to gh pr create automatically.
3. **Let Ctrl+Enter in the "What should we ship next?" bar create a ticket and start it in one step.** Today the ticket lands in Backlog, and I have to open it and press Build.
