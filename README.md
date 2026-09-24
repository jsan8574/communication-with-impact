# Learning Series — Communication with Impact

A self-paced e-learning course (about 60 minutes), adapted from the facilitator-led *Communicating with Impact* workshop deck and its speaker notes.

It is a static site: plain HTML, CSS and JS, with no build step, framework, backend or login. It deploys to GitHub Pages by pushing this folder as it is.

> **GitHub Pages sites are public.** Anyone with the URL can open the course, whatever the repo's visibility or your plan. The page asks search engines not to index it (`noindex`), but that is not access control.

## Learner paths

On the Welcome screen, learners pick a **role** and a **function**. That gives four paths:

| | RCM Operations | Non-Ops (HR, TA, IT, Finance, Training, WFM, MIS…) |
|---|---|---|
| **Team Leader** | `tl_ops` | `tl_nonops` |
| **Manager** | `mgr_ops` | `mgr_nonops` |

Each path has its own examples, scenarios, stakeholders, "decide or escalate" guidance, branching simulation, try-it prompts and quiz questions. Progress is saved **separately per path**, so a learner can switch paths without losing work.

## Structure

| Module | Content | Activity types |
|---|---|---|
| 00 Start Here | Path picker, outcomes, opening confidence check | Scale, reflection |
| 01 Mindset | Information → Insight → Influence, Master Message Model | Bucket sort, flip cards, try-it, find-the-ask hunt, quiz |
| 02 Structure | SBAR, what not to do, decide-or-escalate | Sequence, reveal, try-it, quiz |
| 03 Adapt | Stakeholder translation | Match-with-lines (1:1, all labels unique), try-it, quiz |
| 04 Presence | Five C's, language detox, when you don't know | Flip cards, bucket sort, try-it, quiz |
| 05 Navigate | COIN, behaviour vs label | Bucket sort, **branching simulation**, try-it, quiz |
| 06 Integrate | 5-part model, 90-second update, checklist, commitments | Choice, sequence, quiz, checklist, reflection, closing confidence check |
| 07 Finish | Graded Knowledge Check (10 Qs, 80% to pass, retakes allowed) | Final quiz, certificate (PNG), PDF of answers |

## Files

```
index.html            page shell. Every CSS/JS tag carries ?v=N
css/styles.css        brand palette tokens and layout; responsive rules at 860px and 640px
js/course-data.js     ALL content, including per-path variants (edit this to change wording)
js/activities.js      activity renderers: flip, bucket, sequence, match, hunt, sim
js/app.js             engine: state, gating, timer, quizzes, certificate, PDF
fonts/                Proxima Nova 400/600/700 plus italics
```

## Editing content

All learner-facing text lives in `js/course-data.js`.

- **Different text for different paths.** Wrap any value in `V({...})` with keys `tl_ops`, `tl_nonops`, `mgr_ops`, `mgr_nonops`, `tl`, `mgr`, `ops`, `nonops` or `_` (default). The most specific key wins.
- **Tokens.** Strings can use `{boss}`, `{Boss}`, `{role}`, `{roles}`, `{up2}`, `{directs}`, `{fnName}` and `{floor}`, which resolve per path.
- **Mixing a variant with text.** Use `J(V({...}), " more text")`. Don't use `+`.
- **Adding a path or edition.** Add it to `roles`/`functions` and add variant keys. For a separate edition (for example a different program), copy the data file and change `id` so saved progress doesn't collide.

Activity design rules followed in this course:

- **Match** is only used for 1:1 pairs where every label on both sides is unique.
- **Sort into categories** uses the bucket activity.
- **Order the steps** uses the sequence activity.
- **Explore concepts** uses flip cards.
- Every activity shows "Coaching key points" when it's completed.

## ⚠️ When you update the site: bump the version

Browsers cache CSS/JS aggressively. After **any** change to a CSS or JS file, raise the number in **every** `?v=N` in `index.html` (for example `?v=11` → `?v=12`) before pushing. If a fix "isn't showing up", check in DevTools → Network that the new `?v=` was loaded before assuming the code is wrong.

## Learner data and privacy

- Everything is stored in the learner's own browser (`localStorage`, key `cwi-v1`). This includes progress, answers, reflections, quiz scores and time.
- Nothing is sent to a server, and the L&D team can't see learner data. Learners download their certificate (PNG) and answers (PDF) themselves.
- Clearing browser data, or switching browser or device, starts the course fresh.
- **Time invested** only counts while the tab is visible and the learner has been active in the last 5 minutes. Gaps over 5 seconds between ticks (sleep, a backgrounded tab) are ignored.
- The PDF uses jsPDF 2.5.1, loaded from cdnjs only when the learner clicks download.

## Local preview

Serve the folder over HTTP (for example `python3 -m http.server 8765`) and open `http://localhost:8765`.

## Fonts

Proxima Nova is a commercial typeface. Make sure your licence covers web embedding before publishing: on a public Pages site, the `.otf` files are downloadable by anyone.
