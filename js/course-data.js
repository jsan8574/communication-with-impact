/* =========================================================================
   COURSE DATA — Communication with Impact
   All learner-facing content lives here; app.js / activities.js only render it.

   PATHS: learners pick a role (tl | mgr) and a function (ops | nonops).
   Any value can be a variant:   V({ tl_ops, tl_nonops, mgr_ops, mgr_nonops, tl, mgr, ops, nonops, _ })
   Lookup order: "<role>_<fn>" → "<role>" → "<fn>" → "_" (default).
   Strings may use {tokens} from COURSE.tokens, resolved per path.
   ========================================================================= */
(function () {
  const V = (o) => Object.assign({ $v: 1 }, o);
  const J = (...parts) => ({ $j: parts });   // join resolved parts into one string

  window.COURSE = {
    id: "cwi-v1",                       // localStorage namespace
    program: "Learning Series",
    title: "Communication with Impact",
    subtitle: "From Information to Influence",
    copyright: "©2026 HealthRecon Connect LLC. All rights reserved | Confidential",
    passMark: 80,

    roles: [
      { id: "tl", label: "Team Leader", desc: "You lead a team day to day and report to a Manager / AM." },
      { id: "mgr", label: "Manager", desc: "You lead Team Leaders or a function and report to a Director or above." }
    ],
    functions: [
      { id: "ops", label: "RCM Operations", desc: "AR follow-up, billing, coding, denials, payment posting, eligibility, client delivery." },
      { id: "nonops", label: "Non-Ops (support function)", desc: "HR, Talent Acquisition, IT, Finance, Training, WFM, MIS, Facilities — supporting the Ops floor." }
    ],
    tokens: {
      role:    V({ tl: "Team Leader", mgr: "Manager" }),
      roles:   V({ tl: "Team Leaders", mgr: "Managers" }),
      boss:    V({ tl: "your manager", mgr: "your director" }),
      Boss:    V({ tl: "Your manager", mgr: "Your director" }),
      up2:     V({ tl: "e.g. your manager's manager", mgr: "e.g. a VP or the COO" }),
      directs: V({ tl: "team member", mgr: "Team Leader" }),
      fnName:  V({ ops: "RCM Operations", nonops: "Non-Ops" }),
      floor:   V({ ops: "the floor", nonops: "your function" })
    },

    modules: [
      /* ================================================================== */
      {
        id: "m0", num: "00", title: "Start Here", minutes: 4,
        steps: [
          {
            id: "welcome", title: "Welcome", kicker: "Before you begin",
            blocks: [
              { t: "lead", html: "At your level, communication is no longer only about making sure people understand what you said. It's about how well you <strong>frame issues, influence decisions, and build confidence</strong> — upward, across, and with your own team." },
              { t: "track" },
              { t: "name" },
              { t: "cards", cols: 2, items: [
                { title: "Time", text: "About 60 minutes. Stop at any module break — your progress, answers and time are saved in this browser." },
                { title: "Try-it exercises", text: "Write real answers about real work. Writing a real answer (not just thinking it) is what makes it stick." },
                { title: "Activities & checks", text: "Each module has a hands-on activity and a short Check for Understanding. A final Knowledge Check (80% to pass) unlocks your certificate." },
                { title: "Keep your work", text: "At the end, download a PDF of everything you wrote, plus a one-page checklist that's meant to outlive this course." }
              ]},
              { t: "h3", text: "By the end, you'll be able to…" },
              { t: "cards", cols: 5, numbered: true, items: [
                { k: "01", title: "Frame", text: "Communicate business issues in specific, quantified language." },
                { k: "02", title: "Structure", text: "Build concise, high-impact updates using SBAR." },
                { k: "03", title: "Adapt", text: "Tailor the same facts to each stakeholder." },
                { k: "04", title: "Present", text: "Sound credible under pressure — including when you don't know." },
                { k: "05", title: "Navigate", text: "Handle difficult conversations using COIN." }
              ]},
              { t: "callout", kind: "tip", title: "Pick one to focus on", html: "Don't try to absorb every line equally. Pick the <strong>one</strong> outcome you're most likely to use this week and pay closer attention when it comes up." }
            ]
          },
          {
            id: "baseline", title: "Opening Self-Check", kicker: "Baseline",
            blocks: [
              { t: "p", html: "Set an honest baseline. You'll answer the same question at the end and compare — so this only works if your answer now is real. Nothing here is scored." },
              { t: "scale", id: "confOpen", prompt: "How confident are you communicating with someone two levels above you ({up2})?",
                labels: ["Avoid it", "Uncomfortable", "Need preparation", "Confident", "Can influence"] },
              { t: "reflect", id: "r_barrier", title: "Also ask yourself",
                fields: [{ id: "barrier", label: "What makes upward communication difficult for you?", rows: 3, placeholder: "e.g. I'm never sure how much detail to give…" }],
                note: "Common answers: fear of being wrong, not knowing how much detail to give, worry about sounding unprepared. Several of those are addressed directly in this course — you'll come back to this at the end." }
            ]
          }
        ]
      },

      /* ================================================================== */
      {
        id: "m1", num: "01", title: "Mindset: From Information to Influence", minutes: 12,
        steps: [
          {
            id: "changed", title: "Your Communication Has Changed", kicker: "01 · Mindset",
            blocks: [
              { t: "p", html: "Stepping up changes the communication <em>requirement itself</em> — not just its polish." },
              { t: "compare",
                left: V({ tl: "As a team member", mgr: "As a Team Leader" }),
                right: V({ tl: "As a Team Leader", mgr: "As a Manager" }),
                rows: V({
                  tl_ops: [
                    ["Work the accounts in your queue", "Explain your team's performance and why it moved"],
                    ["Follow the process", "Flag risk early — before it becomes an escalation"],
                    ["Report your own numbers", "Translate floor reality for your manager"],
                    ["Raise issues", "Recommend solutions and ask for what you need"]
                  ],
                  tl_nonops: [
                    ["Close your own tickets, cases or requisitions", "Explain your team's service levels and why they moved"],
                    ["Follow the process", "Flag risk to Ops early — before it becomes an escalation"],
                    ["Report your own numbers", "Translate your function's work into impact on the Ops floor"],
                    ["Raise issues", "Recommend solutions and ask for what you need"]
                  ],
                  mgr: [
                    ["Give instructions", "Frame business issues"],
                    ["Explain processes", "Explain business impact"],
                    ["Manage your team", "Manage stakeholders"],
                    ["Report numbers", "Recommend solutions — and own decisions"]
                  ]
                })
              },
              { t: "flow", items: ["Clarity", "Credibility", "Influence"] },
              { t: "callout", kind: "pause", title: "Pause", html: V({
                ops: "Your communication is fundamentally about <strong>translation</strong>: you translate operational reality into something {boss} can understand and act on. Think of one recent update you gave upward — was it <em>informing</em>, or <em>influencing</em>?",
                nonops: "In a support function, your communication is fundamentally about <strong>translation</strong>: you translate what's happening in {floor} into what it means for the Ops floor and the business. Think of one recent update you gave upward or to Ops — was it <em>informing</em>, or <em>influencing</em>?"
              })}
            ]
          },
          {
            id: "upgrade", title: "Information → Insight → Influence", kicker: "01 · Mindset",
            blocks: [
              { t: "cards", cols: 3, numbered: true, items: V({
                ops: [
                  { k: "1", title: "Information", text: "What happened?<br><em>“Our denial rate is 7.2%.”</em>" },
                  { k: "2", title: "Insight", text: "Why did it happen?<br><em>“Denials rose 1.4 points after the payer policy change.”</em>" },
                  { k: "3", title: "Influence", text: "What does it mean + what next?<br><em>“We've isolated the affected claims and started corrective action.”</em>" }
                ],
                nonops: [
                  { k: "1", title: "Information", text: "What happened?<br><em>“Time-to-fill for AR callers is 38 days.”</em>" },
                  { k: "2", title: "Insight", text: "Why did it happen?<br><em>“Time-to-fill rose 9 days after two sourcing partners paused.”</em>" },
                  { k: "3", title: "Influence", text: "What does it mean + what next?<br><em>“We've launched a referral drive — I need hiring managers to hold Tuesday interview slots.”</em>" }
                ]
              })},
              { t: "p", html: "Most people stop at <strong>Information</strong> — repeating what the dashboard already says. Senior stakeholders need <em>what happened → why → so what → now what</em>. Influence doesn't mean manipulation; it means helping people understand implications and act." },
              { t: "activity", a: {
                type: "bucket", id: "a_iii",
                title: "Sort the statements",
                instructions: "Drag each statement into the level it reaches — or tap it and choose where it goes.",
                buckets: [
                  { id: "info", label: "Information", hint: "What happened" },
                  { id: "insight", label: "Insight", hint: "Why it happened" },
                  { id: "infl", label: "Influence", hint: "What it means + what's next" }
                ],
                items: V({
                  ops: [
                    { id: "i1", text: "“Our denial rate is 7.2% this week.”", b: "info" },
                    { id: "i2", text: "“We closed 1,140 accounts yesterday.”", b: "info" },
                    { id: "i3", text: "“Denials rose 1.4 points after the payer's policy change on the 1st.”", b: "insight" },
                    { id: "i4", text: "“Productivity dipped because six new hires are still in nesting.”", b: "insight" },
                    { id: "i5", text: "“We've isolated the affected claims and will resubmit by Thursday — I need QA to prioritise a sample review.”", b: "infl" },
                    { id: "i6", text: "“I recommend moving senior callers to the Aetna queue until Friday to protect the timely-filing deadline.”", b: "infl" }
                  ],
                  nonops: [
                    { id: "i1", text: "“Open IT tickets are at 214 this week.”", b: "info" },
                    { id: "i2", text: "“We made 12 offers this month.”", b: "info" },
                    { id: "i3", text: "“Ticket volume rose 30% after the VPN change forced everyone to re-authenticate.”", b: "insight" },
                    { id: "i4", text: "“Offer acceptance fell because our night-shift allowance is below two local competitors'.”", b: "insight" },
                    { id: "i5", text: "“We've published a self-fix guide and expect volume back to normal by Friday — I need Ops TLs to share it in huddles.”", b: "infl" },
                    { id: "i6", text: "“I recommend matching the night-shift allowance for AR roles — I need a decision by the 15th to hit next month's start date.”", b: "infl" }
                  ]
                }),
                coach: [
                  "Information is necessary but it isn't leadership — {boss} can usually read the number off a dashboard.",
                  "Insight adds the <strong>why</strong>. That's where your knowledge of {floor} becomes valuable.",
                  "Influence adds <strong>what it means and what happens next</strong> — usually with an owner, a date and an ask. That's the level your updates should reach."
                ]
              }}
            ]
          },
          {
            id: "model", title: "The Master Message Model", kicker: "01 · Mindset",
            blocks: [
              { t: "p", html: "Every tool in this course — SBAR, stakeholder translation, COIN — is a different lens on the same four questions. If you remember nothing else, remember these." },
              { t: "cards", cols: 4, numbered: true, items: [
                { k: "1", title: "What?", text: "What happened? Facts, trend, signal." },
                { k: "2", title: "So what?", text: "Why does it matter? Business impact, risk, client or Ops effect." },
                { k: "3", title: "Now what?", text: "What are we doing? Ownership, action, timeline." },
                { k: "4", title: "What do you need?", text: "Decision, support, alignment or visibility." }
              ]},
              { t: "quote", text: "Bring the problem — and bring your view of the path forward." },
              { t: "callout", kind: "tip", title: "Watch for the common gap", html: "Under pressure most people jump straight from <em>What</em> to <em>Now What</em> and skip <strong>So What</strong>. Without it, the listener can't judge how urgent your issue is." },
              { t: "h3", text: "Upgrade the language" },
              { t: "p", html: "“Sounding senior” is a translation skill — specific and quantified — not a vocabulary or personality trait. Read each statement, <strong>guess the stronger version in your head</strong>, then flip the card." },
              { t: "activity", a: {
                type: "flip", id: "a_lang",
                title: "Operational → Leadership",
                instructions: "Guess first, then tap each card to flip it. Flip all five to continue.",
                cards: V({
                  tl_ops: [
                    { front: "“The team is struggling.”", back: "“Productivity is 8% below target.”", note: "A number tells your manager how big the problem is." },
                    { front: "“The client is unhappy.”", back: "“Client confidence is at risk.”", note: "Names the business risk, not the mood." },
                    { front: "“We have a backlog.”", back: "“$42K in receivables are now past 90 days.”", note: "Money and ageing make the urgency obvious." },
                    { front: "“We need more people.”", back: "“Current capacity is insufficient for projected volume.”", note: "A capacity gap, not a complaint." },
                    { front: "“QA found errors.”", back: "“The error pattern is creating downstream rework.”", note: "Moves from event to consequence." }
                  ],
                  mgr_ops: [
                    { front: "“The teams are struggling.”", back: "“Department productivity is 8% below target.”", note: "A number tells your director how big the problem is." },
                    { front: "“The client is unhappy.”", back: "“Client confidence is at risk ahead of the Q3 renewal.”", note: "Names the business risk and when it bites." },
                    { front: "“We have a backlog.”", back: "“$X in receivables remain exposed past 90 days.”", note: "Money and ageing make the urgency obvious." },
                    { front: "“We need more people.”", back: "“Current capacity is insufficient for projected volume.”", note: "A capacity gap, not a complaint." },
                    { front: "“QA found errors.”", back: "“The error pattern is creating downstream rework.”", note: "Moves from event to consequence." }
                  ],
                  nonops: [
                    { front: "“We're swamped with tickets.”", back: "“Ticket volume is 40% above what our SLA staffing covers.”", note: "Quantifies the gap between demand and capacity." },
                    { front: "“Ops is unhappy with us.”", back: "“Ops confidence in our turnaround is at risk.”", note: "Names the business risk, not the mood." },
                    { front: "“Hiring is slow.”", back: "“Time-to-fill is 38 days against a 25-day target — 14 seats are open.”", note: "Target vs actual, plus the impact on the floor." },
                    { front: "“We need more people.”", back: "“Current capacity is insufficient for projected volume.”", note: "A capacity gap, not a complaint." },
                    { front: "“There were payroll errors.”", back: "“The error pattern is creating rework and eroding employee trust.”", note: "Moves from event to consequence." }
                  ]
                }),
                coach: [
                  "None of the stronger versions use jargon. They use <strong>numbers, named risk and business impact</strong> — that's the whole trick.",
                  "Precision often means <em>fewer</em> words, not more. A rewrite that's just longer isn't the goal.",
                  "Next time you type “struggling”, “unhappy” or “a lot”, ask: <em>what's the number?</em>"
                ]
              }}
            ]
          },
          {
            id: "tryData", title: "Try It: Turn Data Into Influence", kicker: "01 · Try it",
            blocks: [
              { t: "callout", kind: "scenario", title: "Transform this statement for {boss}", html: V({
                tl_ops: "<span class='big-quote'>“Our team's AR backlog increased by 20% this month.”</span>",
                mgr_ops: "<span class='big-quote'>“AR backlog across the department increased by 20% this month.”</span>",
                tl_nonops: "<span class='big-quote'>“Open IT tickets from the Ops floor increased by 20% this month.”</span>",
                mgr_nonops: "<span class='big-quote'>“Attrition among new AR hires increased by 20% this quarter.”</span>"
              })},
              { t: "cards", cols: 4, numbered: true, items: [
                { k: "1", title: "What?", text: "What changed?" },
                { k: "2", title: "Why?", text: "What caused it?" },
                { k: "3", title: "Impact?", text: "Why does it matter?" },
                { k: "4", title: "Action?", text: "What happens next?" }
              ]},
              { t: "reflect", id: "r_data", title: "Your version (about 60 seconds)",
                fields: [{ id: "data", label: "Write the message you'd send {boss}", rows: 4, placeholder: "It's up 20% because… That means… We're…" }],
                model: { title: "One strong version looks like this", html: J(V({
                  tl_ops: "“AR backlog is up 20% following the payer coding change. That's roughly <strong>$60K in delayed receivables</strong> if unresolved by month-end. We've isolated the affected claims and are <strong>resubmitting by Thursday</strong>.”",
                  mgr_ops: "“AR backlog is up 20% following the payer coding change. That's roughly <strong>$180K in delayed receivables</strong> if unresolved by month-end. We've isolated the affected claims and are <strong>resubmitting by Thursday</strong> — I'll confirm recovery in Friday's review.”",
                  tl_nonops: "“Ops tickets are up 20% since the VPN change. About 60 callers are losing 20 minutes a day — <strong>roughly 1.5% of floor productivity</strong>. We've published a self-fix guide and will <strong>clear the backlog by Thursday</strong>.”",
                  mgr_nonops: "“New-hire attrition is up 20% this quarter, mostly in the first 30 days. That's about 18 seats to refill — <strong>roughly $45K in hiring and training cost</strong> and a capacity gap for Ops at month-end. We're redesigning week-one onboarding with Ops TLs and will <strong>report early results in four weeks</strong>.”"
                }), "<br><br>Notice: the stronger version doesn't necessarily contain more information — it contains more <em>meaning</em>.") } }
            ]
          },
          {
            id: "hunt1", title: "Spot the Leader Moves", kicker: "01 · Activity",
            blocks: [
              { t: "p", html: "Here's an update posted to {boss} in Teams. Read it once, then find each move by clicking the sentence." },
              { t: "activity", a: {
                type: "hunt", id: "a_hunt",
                title: "Find it in the message",
                header: "Teams message → {boss}, 11:42 AM",
                sentences: V({
                  tl_ops: [
                    { id: "s1", tag: "Purpose", text: "Quick update on the BCBS queue before your 2 PM call." },
                    { id: "s2", tag: "What", text: "Denials on BCBS claims jumped from 6% to 11% over the last three days." },
                    { id: "s3", tag: "Why", text: "It traces to the new prior-auth requirement that went live Monday." },
                    { id: "s4", tag: "So what", text: "If we don't fix it, about $35K in claims will miss the filing window next week." },
                    { id: "s5", tag: "Now what", text: "I've already pulled the 62 affected claims and assigned two callers to rework them by Wednesday." },
                    { id: "s6", tag: "The ask", text: "I need you to approve 3 hours of overtime for those two callers today." }
                  ],
                  mgr_ops: [
                    { id: "s1", tag: "Purpose", text: "Quick update on BCBS denials before your 2 PM client call." },
                    { id: "s2", tag: "What", text: "BCBS denials across all three teams jumped from 6% to 11% over the last week." },
                    { id: "s3", tag: "Why", text: "It traces to the new prior-auth requirement that went live Monday." },
                    { id: "s4", tag: "So what", text: "If we don't fix it, about $140K in claims will miss the filing window this month — two weeks before the client review." },
                    { id: "s5", tag: "Now what", text: "I've added a prior-auth check at intake and moved six callers to rework the 240 affected claims by Friday." },
                    { id: "s6", tag: "The ask", text: "I need you to raise the prior-auth change with the client on today's call so we can agree a grace period." }
                  ],
                  tl_nonops: [
                    { id: "s1", tag: "Purpose", text: "Quick update on the Ops ticket queue before your 2 PM meeting." },
                    { id: "s2", tag: "What", text: "Open tickets from the AR floor jumped from 60 to 140 in three days." },
                    { id: "s3", tag: "Why", text: "Most trace to the VPN certificate change that went live Monday." },
                    { id: "s4", tag: "So what", text: "Each affected caller loses about 20 minutes a day — roughly 1.5% of floor productivity until it's fixed." },
                    { id: "s5", tag: "Now what", text: "I've published a self-fix guide and assigned two analysts to clear the rest by Wednesday." },
                    { id: "s6", tag: "The ask", text: "I need you to ask Ops leadership to share the guide in today's huddles." }
                  ],
                  mgr_nonops: [
                    { id: "s1", tag: "Purpose", text: "Quick update on AR hiring before your 2 PM leadership meeting." },
                    { id: "s2", tag: "What", text: "Offer acceptance for AR caller roles fell from 80% to 55% this month." },
                    { id: "s3", tag: "Why", text: "Candidate feedback points to our night-shift allowance, now below two local competitors." },
                    { id: "s4", tag: "So what", text: "At this rate we'll miss 14 of 30 seats for next month's start, and Ops goes into quarter-end short-staffed." },
                    { id: "s5", tag: "Now what", text: "We've launched a referral drive and moved to same-week offers to recover what we can." },
                    { id: "s6", tag: "The ask", text: "I need your approval to take a shift-allowance increase to the CFO by the 15th." }
                  ]
                }),
                tasks: [
                  { prompt: "Find the <strong>business impact</strong> — the “so what”.", answer: "s4", look: "Look for money, risk, or the effect on the client or the floor." },
                  { prompt: "Find where the writer <strong>owns the next step</strong>.", answer: "s5", look: "Look for “I've…” or “We've…” — action already under way." },
                  { prompt: "Find the <strong>ask</strong> — the decision or support needed.", answer: "s6", look: "Look for what the writer needs <em>from the reader</em>." }
                ],
                hints: {
                  "Purpose": "That's the opener — it signals why you're writing.",
                  "What": "That's the fact — the <em>What</em>.",
                  "Why": "That's the cause — useful insight, but not what the task asks for.",
                  "So what": "That's the impact — the consequence if nothing is done.",
                  "Now what": "That's ownership — what the writer is already doing.",
                  "The ask": "That's the ask — what the writer needs from the reader."
                },
                after: V({
                  ops: "<strong>Now compare the “reporter” version:</strong><br><em>“We noticed denials went up on BCBS. We think it might be the prior-auth thing. The team is looking into it.”</em><br>Where's the ask? <strong>There isn't one</strong> — no impact or ownership either.",
                  nonops: "<strong>Now compare the “reporter” version:</strong><br><em>“We've noticed things have been slow lately. We think it might be the market. The team is looking into it.”</em><br>Where's the ask? <strong>There isn't one</strong> — no impact or ownership either."
                }),
                coach: [
                  "The ask is the move most often missing. Many updates end with “FYI” and leave the reader to guess what you need.",
                  "Ownership (“I've already…”) is what builds confidence — the problem is being handled, not just reported.",
                  "Notice the order: purpose → fact → why → impact → action → ask. You'll see this pattern again as SBAR."
                ]
              }},
              { t: "reflect", id: "r_hunt", optional: true, title: "Quick reflection (optional)",
                fields: [{ id: "hunt", label: "What would you change in the last update you sent {boss}?", rows: 2 }] }
            ]
          },
          {
            id: "q1", title: "Check for Understanding", kicker: "01 · Quiz",
            blocks: [
              { t: "quiz", id: "q_m1", questions: [
                V({
                  ops: { q: "{Boss} asks, “How's the backlog?” Which answer moves from Information to Influence?",
                    o: ["“It's at 1,240 accounts.”", "“It's up 12% because callers are out.”", "“It's up 12% because callers are out. I've moved the oldest accounts to senior callers, and we'll be back on target by Friday.”", "“Honestly, it's been a tough week.”"],
                    a: 2, why: "Only this answer adds meaning and a path forward — cause, ownership and a timeline. The first is Information; the second reaches Insight." },
                  nonops: { q: "{Boss} asks, “How's the ticket queue?” Which answer moves from Information to Influence?",
                    o: ["“It's at 214 tickets.”", "“It's up 30% because of the VPN change.”", "“It's up 30% because of the VPN change. We've published a self-fix guide and will be back within SLA by Friday.”", "“Honestly, it's been a tough week.”"],
                    a: 2, why: "Only this answer adds meaning and a path forward — cause, ownership and a timeline. The first is Information; the second reaches Insight." }
                }),
                { q: "Which step of the Master Message Model do people most often skip when they jump straight to action?",
                  o: ["What?", "So what?", "Now what?", "What do you need?"],
                  a: 1, why: "“So what?” is the most-skipped step. Without it, the listener can't judge how urgent or important your issue is." },
                { q: "Why is “Productivity is 8% below target” stronger than “The team is struggling”?",
                  o: ["It uses more senior vocabulary", "It's specific and quantified, so the listener can gauge the size of the problem", "It's longer and more detailed", "It avoids blaming anyone"],
                  a: 1, why: "Sounding senior is about precision, not vocabulary. A number lets the listener judge scale and urgency." }
              ]}
            ]
          }
        ]
      },

      /* ================================================================== */
      {
        id: "m2", num: "02", title: "Structure: SBAR for High-Stakes Updates", minutes: 12,
        steps: [
          {
            id: "sbar", title: "The SBAR Framework", kicker: "02 · Structure",
            blocks: [
              { t: "p", html: "SBAR prevents the classic problem of giving five minutes of background before saying why you called." },
              { t: "cards", cols: 4, items: [
                { title: "Situation", text: "What is happening now?" },
                { title: "Background", text: "What context matters?" },
                { title: "Assessment", text: "What does it mean?" },
                { title: "Recommendation", text: "What should happen next?" }
              ]},
              { t: "flow", items: ["Start with the situation", "End with the recommendation"] },
              { t: "h3", text: "SBAR in action" },
              { t: "example", rows: V({
                tl_ops: [
                  ["Situation", "14% denial spike on Medicare claims in our queue this week."],
                  ["Background", "The CMS modifier update went live Monday."],
                  ["Assessment", "About $90K in receivables could be affected within 48 hours."],
                  ["Recommendation", "Pull, recode and resubmit affected claims by Thursday — I need approval for 4 hours of OT."]
                ],
                mgr_ops: [
                  ["Situation", "14% denial spike on Medicare claims across the department this week."],
                  ["Background", "The CMS modifier update went live Monday."],
                  ["Assessment", "About $280K in receivables could be affected within 48 hours."],
                  ["Recommendation", "Pull, recode and resubmit affected claims by Thursday. I've shifted two teams onto it; I need 4 hours of OT approved for the third."]
                ],
                tl_nonops: [
                  ["Situation", "Payroll for 46 night-shift AR callers was short-paid this cycle."],
                  ["Background", "The shift-allowance code changed in the new payroll system on the 1st."],
                  ["Assessment", "If it isn't fixed before Friday, we risk complaints and attrition on a team that's already hard to hire for."],
                  ["Recommendation", "Run an off-cycle correction on Thursday — I need your sign-off today to send it to Finance."]
                ],
                mgr_nonops: [
                  ["Situation", "The AR platform was down for 3 hours yesterday — the second outage this month."],
                  ["Background", "Both outages trace to the same vendor patching process."],
                  ["Assessment", "Each outage costs roughly 450 caller-hours (about $12K), and Ops is losing confidence in IT."],
                  ["Recommendation", "Move vendor patches to Sunday windows from this week — I need you to back that on Thursday's vendor call."]
                ]
              })},
              { t: "callout", kind: "key", title: "Read it aloud, in a decisive tone", html: "Which part shows your <strong>judgement</strong>? Assessment. Which part makes this a leadership conversation rather than a status update? <strong>Recommendation</strong> — a specific action, timeline and ask. Background should be <em>relevant</em>, not everything you know." }
            ]
          },
          {
            id: "seq1", title: "Put the SBAR in Order", kicker: "02 · Activity",
            blocks: [
              { t: "callout", kind: "scenario", title: "Scenario", html: V({
                tl_ops: "Three callers are out sick and a timely-filing deadline is coming. Your update to your manager has been scrambled.",
                mgr_ops: "Twelve callers are out across your teams and a timely-filing deadline is coming. Your update to your director has been scrambled.",
                tl_nonops: "Start dates are coming and candidates aren't confirmed. Your update to your manager has been scrambled.",
                mgr_nonops: "New payer rules go live soon and training isn't done. Your update to your director has been scrambled."
              })},
              { t: "activity", a: {
                type: "sequence", id: "a_sbarseq",
                title: "Connect the SBAR",
                instructions: "Tap the sentences in the order you'd say them. Tap a placed sentence to take it back.",
                slotLabels: ["Situation", "Background", "Assessment", "Recommendation"],
                items: V({
                  tl_ops: [
                    { id: "q1", text: "Three of my eight callers are out sick today, and the Humana follow-up queue is at 410 accounts." },
                    { id: "q2", text: "Humana's 90-day timely-filing cutoff hits 38 of those accounts on Friday." },
                    { id: "q3", text: "At current capacity we'll clear about half by Friday, so roughly $22K is at risk of write-off." },
                    { id: "q4", text: "I recommend borrowing two callers from Team B for two days — can you approve that with their TL today?" }
                  ],
                  mgr_ops: [
                    { id: "q1", text: "Humana follow-up volume across our three teams is at 1,800 accounts, with 12 callers out this week." },
                    { id: "q2", text: "Humana's 90-day timely-filing cutoff hits 260 of those accounts on Friday." },
                    { id: "q3", text: "At current capacity we'll clear about 60%, putting roughly $140K at risk of write-off." },
                    { id: "q4", text: "I've paused low-value follow-ups and moved eight callers from Team C; I need your approval to flag a one-week SLA dip to the client." }
                  ],
                  tl_nonops: [
                    { id: "q1", text: "We have 9 open AR caller positions, and 4 start dates next week have no confirmed candidates." },
                    { id: "q2", text: "Two of our sourcing agencies paused their contracts on the 1st." },
                    { id: "q3", text: "Without action, the floor starts next month four seats short during quarter-end." },
                    { id: "q4", text: "I recommend a referral bonus for this batch — can you approve it today so we can announce it Monday?" }
                  ],
                  mgr_nonops: [
                    { id: "q1", text: "Training completion for the new payer rules is at 52%, and the rules go live in 10 days." },
                    { id: "q2", text: "Floor coverage has kept agents off the LMS during shift hours." },
                    { id: "q3", text: "If we go live at this level, expect a denial spike like last quarter's — roughly $200K in rework." },
                    { id: "q4", text: "I recommend 45-minute protected training blocks per team this week — I need you to agree the coverage plan with the Ops director by Wednesday." }
                  ]
                }),
                coach: [
                  "The <strong>Situation</strong> comes first so the listener knows why you're talking before any history.",
                  "<strong>Assessment</strong> is your judgement — turning a count into money, risk or impact. It proves you understand the business.",
                  "The <strong>Recommendation</strong> is the part most people skip under pressure. Close with a specific action and a clear ask."
                ]
              }},
              { t: "decide" }
            ]
          },
          {
            id: "notdo", title: "What Not To Do", kicker: "02 · Structure",
            blocks: [
              { t: "p", html: "“Reporter” communication leaves the listener to do the thinking. Read the four lines below and ask yourself: <strong>what's missing?</strong>" },
              { t: "warnlist", items: V({
                ops: ["“We noticed the denials went up.”", "“We think it might be because of the payer change.”", "“The team is looking into it.”", "“We'll see what happens.”"],
                nonops: ["“We noticed more tickets came in.”", "“We think it might be the VPN thing.”", "“The team is looking into it.”", "“We'll see what happens.”"]
              })},
              { t: "reveal", button: "Reveal what's missing", html: "<div class='chips'><span>Assessment</span><span>Ownership</span><span>Business impact</span><span>Recommendation</span><span>Clear ask</span></div><p>There is nothing technically wrong with these statements — the problem is they make the listener do all the thinking.</p>" }
            ]
          },
          {
            id: "trySbar", title: "Try It: Build Your Own SBAR", kicker: "02 · Try it",
            blocks: [
              { t: "callout", kind: "scenario", title: "Scenario", html: V({
                tl_ops: "A key client has escalated a recurring quality issue on your team's work.<ul><li>Your team's quality score dropped from 97% to 91%</li><li>The client has asked for an action plan</li><li>Your senior processor believes it's temporary</li><li>QA sees the same modifier error recurring for three weeks</li><li>Your manager meets the client tomorrow and wants your briefing today</li></ul>",
                mgr_ops: "A key client has escalated a recurring quality issue.<ul><li>Account quality score dropped from 97% to 91%</li><li>The client has requested a formal action plan</li><li>Your Team Leaders believe it's temporary</li><li>QA sees a recurring pattern across two teams</li><li>The client review is tomorrow — your director wants a briefing tonight</li></ul>",
                tl_nonops: "The Ops floor has escalated repeated delays in system access for new hires.<ul><li>New hires wait an average of 3 days for access (target: same day)</li><li>An Ops manager has escalated to your manager</li><li>Your analyst thinks it's a one-off vendor delay</li><li>Ticket data shows the same approval step stalling for four weeks</li><li>Your manager meets Ops leadership tomorrow</li></ul>",
                mgr_nonops: "Ops leadership has escalated recurring errors in monthly incentive payouts.<ul><li>Third month in a row with errors; about 70 employees affected</li><li>The Ops director has asked for an action plan</li><li>Your payroll lead believes it's temporary</li><li>Audit shows the same manual step failing each month</li><li>You present to the COO tomorrow</li></ul>"
              })},
              { t: "reflect", id: "r_sbar", title: "Write your SBAR (about 7 minutes)",
                intro: "You're not presenting everything you know — only what the listener needs to know. When you've written it, say it out loud once: hearing it exposes gaps that reading doesn't.",
                fields: [
                  { id: "s", label: "Situation — what is happening?", rows: 2 },
                  { id: "b", label: "Background — what context matters?", rows: 2 },
                  { id: "a", label: "Assessment — what does it mean?", rows: 2 },
                  { id: "r", label: "Recommendation — what do you recommend?", rows: 2 }
                ],
                selfcheck: ["It started with the situation", "The assessment was clear (what it means, not just what happened)", "The recommendation was specific — action, owner, timeline", "It sounded like a leader, not a reporter"],
                model: { title: "One strong version", html: V({
                  tl_ops: "<strong>Situation:</strong> Our quality score for this client dropped from 97% to 91%, and they've asked for an action plan before tomorrow's review.<br><strong>Background:</strong> QA has traced most errors to the same modifier issue, recurring for three weeks.<br><strong>Assessment:</strong> This is a pattern, not a one-off — a short-term fix alone won't restore the client's confidence.<br><strong>Recommendation:</strong> A targeted refresher on the modifier rule for the four processors involved this week, plus 100% QA on those claims for two weeks. I'll send you a one-page action plan by 5 PM today.",
                  mgr_ops: "<strong>Situation:</strong> Account quality fell from 97% to 91% and the client wants a formal action plan at tomorrow's review.<br><strong>Background:</strong> QA sees the same error pattern across two teams — not a one-week blip.<br><strong>Assessment:</strong> Treating this as temporary is the bigger risk: if it recurs after tomorrow, we lose credibility on the account.<br><strong>Recommendation:</strong> Present a two-week recovery plan — root-cause fix, targeted retraining, 100% QA on affected claim types, weekly score to the client. I need you to back the QA resourcing tonight.",
                  tl_nonops: "<strong>Situation:</strong> New hires are waiting an average of 3 days for system access, and Ops has escalated.<br><strong>Background:</strong> Ticket data shows the same manual approval step stalling for four weeks.<br><strong>Assessment:</strong> It's a process gap, not a vendor one-off — it will keep costing the floor about 60 caller-days a month.<br><strong>Recommendation:</strong> Pre-build access for next Monday's batch and switch standard roles to auto-approval. I need your sign-off to take it to Ops leadership tomorrow.",
                  mgr_nonops: "<strong>Situation:</strong> Incentive payouts have been wrong three months running, affecting about 70 employees, and Ops has asked for an action plan.<br><strong>Background:</strong> Audit shows the same manual step failing every cycle.<br><strong>Assessment:</strong> It's systemic, not temporary — and each repeat erodes floor trust in both payroll and Ops leadership.<br><strong>Recommendation:</strong> Automate the step before next cycle and add a pre-run reconciliation with Ops. I'll ask the COO for a two-week IT priority slot."
                }) } }
            ]
          },
          {
            id: "q2", title: "Check for Understanding", kicker: "02 · Quiz",
            blocks: [
              { t: "quiz", id: "q_m2", questions: [
                { q: "In SBAR, which part shows your judgement?",
                  o: ["Situation", "Background", "Assessment", "Recommendation"], a: 2,
                  why: "Assessment is where you interpret the facts — what they mean for the business. That's your judgement on display." },
                V({
                  ops: { q: "Someone spends the first two minutes of an update explaining the history of a payer's policy. What's going wrong?",
                    o: ["Nothing — context always helps", "They're leading with Background instead of the Situation; background should be relevant, not everything they know", "They should have led with the Recommendation", "They should have sent it by email instead"], a: 1,
                    why: "SBAR starts with the Situation so the listener knows why you're talking. Background is only what's needed to understand it." },
                  nonops: { q: "Someone spends the first two minutes of an update explaining the history of the payroll system migration. What's going wrong?",
                    o: ["Nothing — context always helps", "They're leading with Background instead of the Situation; background should be relevant, not everything they know", "They should have led with the Recommendation", "They should have sent it by email instead"], a: 1,
                    why: "SBAR starts with the Situation so the listener knows why you're talking. Background is only what's needed to understand it." }
                }),
                V({
                  ops: { q: "Which Recommendation is strongest?",
                    o: ["“We should probably look into it.”", "“Maybe we could add some overtime?”", "“Resubmit the 62 affected claims by Thursday — I need approval for 4 hours of OT today.”", "“Let's discuss options at next week's meeting.”"], a: 2,
                    why: "A strong recommendation has a specific action, a timeline and a clear ask." },
                  nonops: { q: "Which Recommendation is strongest?",
                    o: ["“We should probably look into it.”", "“Maybe we could try a referral bonus?”", "“Launch a referral bonus for this batch Monday — I need your approval today.”", "“Let's discuss options at next week's meeting.”"], a: 2,
                    why: "A strong recommendation has a specific action, a timeline and a clear ask." }
                })
              ]}
            ]
          }
        ]
      },

      /* ================================================================== */
      {
        id: "m3", num: "03", title: "Adapt: Same Facts, Different Lens", minutes: 9,
        steps: [
          {
            id: "lens", title: "Same Message ≠ Same Communication", kicker: "03 · Adapt",
            blocks: [
              { t: "p", html: "The facts stay the same across audiences. Only the <strong>emphasis</strong> changes — based on what that person needs to know or decide." },
              { t: "cards", cols: 4, numbered: true, items: V({
                tl_ops: [
                  { k: "1", title: "Your Manager / AM", text: "Impact + risk.<br>Lead with the number and what it means." },
                  { k: "2", title: "Your Team", text: "Action + clarity.<br>Lead with what we're doing and what I need from you." },
                  { k: "3", title: "Peer TL / QA", text: "Alignment + shared impact.<br>Lead with what affects them." },
                  { k: "4", title: "Client", text: "Confidence + ownership + control.<br>Lead with what you've already done." }
                ],
                mgr_ops: [
                  { k: "1", title: "CFO / COO / Director", text: "Financial impact + risk.<br>Lead with the number and the implication." },
                  { k: "2", title: "Your Team Leaders", text: "Action + capacity + timeline.<br>Lead with the action and dependency." },
                  { k: "3", title: "Peer Manager", text: "Alignment + shared impact.<br>Lead with what affects them." },
                  { k: "4", title: "Client", text: "Confidence + ownership + control.<br>Lead with what you've already done." }
                ],
                tl_nonops: [
                  { k: "1", title: "Your Manager", text: "Impact + risk.<br>Lead with the number and what it means." },
                  { k: "2", title: "Your Team", text: "Action + clarity.<br>Lead with what we're doing and what I need from you." },
                  { k: "3", title: "Peer support team", text: "Alignment + shared impact (e.g. IT ↔ HR ↔ Finance).<br>Lead with what affects them." },
                  { k: "4", title: "Ops TL / Manager", text: "Your internal client: confidence + control.<br>Lead with what you've done and what they'll see." }
                ],
                mgr_nonops: [
                  { k: "1", title: "CFO / COO / Director", text: "Financial impact + risk.<br>Lead with the number and the implication." },
                  { k: "2", title: "Your leads / team", text: "Action + capacity + timeline.<br>Lead with the action and who owns what." },
                  { k: "3", title: "Peer function head", text: "Alignment + shared impact.<br>Lead with what affects them." },
                  { k: "4", title: "Ops leadership", text: "Your internal client: confidence + ownership + control.<br>Lead with what you've already done." }
                ]
              })},
              { t: "flow", items: ["Same facts", "Different lens", "Not different truth"] },
              { t: "callout", kind: "pause", title: "Pause", html: "Stakeholder communication is not about changing the truth — it's about changing the lens. Relevant framing, never spin. Which of these four do <em>you</em> find hardest to communicate with?" }
            ]
          },
          {
            id: "match1", title: "Match the Opening to the Audience", kicker: "03 · Activity",
            blocks: [
              { t: "callout", kind: "scenario", title: "One fact", html: V({
                tl_ops: "Your team's AR backlog is up 20%. Here are four openings — one written for each audience.",
                mgr_ops: "Department AR backlog is up 20%. Here are four openings — one written for each audience.",
                tl_nonops: "Open requests from Ops to your team are up 20% this month. Here are four openings — one written for each audience.",
                mgr_nonops: "First-90-day attrition is up 20% this quarter. Here are four openings — one written for each audience."
              })},
              { t: "activity", a: {
                type: "match", id: "a_match",
                title: "Connect each audience to its opening",
                instructions: "Select an audience, then select the opening written for them. You can also start with the opening.",
                pairs: V({
                  tl_ops: [
                    { l: "Your Manager / AM", r: "“Our AR backlog is up 20% — about $60K is now at risk of ageing past 90 days, and I have a recovery plan to walk you through.”" },
                    { l: "Your Team", r: "“Starting today we're working Aetna accounts over 60 days first — here's how today's queue is split.”" },
                    { l: "Peer Team Leader", r: "“Our backlog jump is coming from the shared eligibility queue, so it'll likely hit your follow-ups next week — can we agree a split?”" },
                    { l: "Client", r: "“We've identified the cause of the recent delay on your accounts and already have a recovery plan in place — here's where things stand.”" }
                  ],
                  mgr_ops: [
                    { l: "CFO / COO", r: "“AR backlog is up 20% — about $180K in receivables is exposed if we don't recover by month-end, and here's the plan to protect it.”" },
                    { l: "Your Team Leaders", r: "“To clear the backlog by the 30th we're moving six callers onto Aetna 60+ from Monday — I need queues rebalanced by Friday.”" },
                    { l: "Peer Manager", r: "“The backlog is building in the shared eligibility step, so your team will feel it in next week's follow-ups — can we agree a split today?”" },
                    { l: "Client", r: "“We've identified what drove the delay on your accounts and have a recovery plan in place — here's where things stand and when you'll see it close.”" }
                  ],
                  tl_nonops: [
                    { l: "Your Manager", r: "“Open Ops requests are up 20% — our turnaround has slipped from 2 to 4 days, and I have a plan to recover it by month-end.”" },
                    { l: "Your Team", r: "“From today we're triaging Ops requests by go-live date first — here's how the queue is split.”" },
                    { l: "Peer support team", r: "“Half our backlog is waiting on approvals from your side, so both our SLAs are slipping — can we agree a daily cut-off?”" },
                    { l: "Ops Team Leader", r: "“We know requests have been slower this month; we've found why, and you'll see turnaround back to 2 days by the 30th — here's what to expect meanwhile.”" }
                  ],
                  mgr_nonops: [
                    { l: "CFO / COO", r: "“First-90-day attrition is up 20% — about $120K a quarter in rehiring and training cost, and I'm bringing a plan to reverse it.”" },
                    { l: "Your leads / team", r: "“From the next cohort every new hire gets a buddy and a day-30 check-in — here's who owns what by Friday.”" },
                    { l: "Peer function head", r: "“Early attrition is driving most of your training rework too — can we redesign week one together before the next cohort?”" },
                    { l: "Ops leadership", r: "“We've pinpointed why new hires are leaving early and already have fixes in place — here's what changes for your floor and when.”" }
                  ]
                }),
                coach: [
                  "Each opening leads with what <strong>that</strong> person needs: money and risk upward, action for your team, shared impact for a peer, confidence for the client you serve.",
                  "The facts never change — no one is told a different story.",
                  "The mistake this catches: writing four openings that are identical except for the name at the top."
                ]
              }}
            ]
          },
          {
            id: "tryAdapt", title: "Try It: One Problem, Four Openings", kicker: "03 · Try it",
            blocks: [
              { t: "callout", kind: "scenario", title: "New fact", html: J(V({
                tl_ops: "<span class='big-quote'>“Our clean-claim rate dropped from 95% to 89% this week.”</span>",
                mgr_ops: "<span class='big-quote'>“Department clean-claim rate dropped from 95% to 89% this month.”</span>",
                tl_nonops: "<span class='big-quote'>“Our first-contact resolution rate dropped from 80% to 68% this month.”</span>",
                mgr_nonops: "<span class='big-quote'>“Engagement survey participation fell from 78% to 52% this year.”</span>"
              }), "Write one opening sentence for each audience. Change the emphasis — not the facts.") },
              { t: "reflect", id: "r_adapt", title: "Your four openings (about 5 minutes)",
                fields: V({
                  tl_ops: [
                    { id: "a1", label: "Your Manager / AM — impact + risk", rows: 2 },
                    { id: "a2", label: "Your Team — action + clarity", rows: 2 },
                    { id: "a3", label: "Peer TL / QA — alignment + shared impact", rows: 2 },
                    { id: "a4", label: "Client — confidence + control", rows: 2 }
                  ],
                  mgr_ops: [
                    { id: "a1", label: "CFO / COO — financial impact + risk", rows: 2 },
                    { id: "a2", label: "Your Team Leaders — action + capacity + timeline", rows: 2 },
                    { id: "a3", label: "Peer Manager — alignment + shared impact", rows: 2 },
                    { id: "a4", label: "Client — confidence + ownership + control", rows: 2 }
                  ],
                  tl_nonops: [
                    { id: "a1", label: "Your Manager — impact + risk", rows: 2 },
                    { id: "a2", label: "Your Team — action + clarity", rows: 2 },
                    { id: "a3", label: "Peer support team — alignment + shared impact", rows: 2 },
                    { id: "a4", label: "Ops Team Leader — confidence + control", rows: 2 }
                  ],
                  mgr_nonops: [
                    { id: "a1", label: "CFO / COO — financial impact + risk", rows: 2 },
                    { id: "a2", label: "Your leads / team — action + ownership", rows: 2 },
                    { id: "a3", label: "Peer function head — alignment + shared impact", rows: 2 },
                    { id: "a4", label: "Ops leadership — confidence + control", rows: 2 }
                  ]
                }),
                selfcheck: ["My emphasis changes across the four", "The underlying facts are the same in all four", "None of them are identical except for a name swap"],
                model: { title: "Example openings", html: V({
                  tl_ops: "<strong>Manager:</strong> “Clean-claim rate fell from 95% to 89% this week — roughly 70 extra claims in rework — and I've found the cause.”<br><strong>Team:</strong> “From today, double-check the registration fields on every new claim before submitting — here's the checklist.”<br><strong>Peer / QA:</strong> “We're seeing a jump in front-end registration errors — are you seeing the same, and can we align on one fix?”<br><strong>Client:</strong> “We spotted a dip in first-pass accuracy this week, traced it to a registration change, and the fix is already in place.”",
                  mgr_ops: "<strong>CFO / COO:</strong> “Clean-claim rate fell six points this month — about $150K in delayed cash — and we've found the root cause.”<br><strong>Team Leaders:</strong> “From Monday every team runs the registration pre-check; I need QA sampling doubled for two weeks.”<br><strong>Peer Manager:</strong> “The errors start in shared intake, so your teams will see them too — let's fix it once, together.”<br><strong>Client:</strong> “We caught a dip in first-pass accuracy, traced it to a registration change, and the fix is already live.”",
                  tl_nonops: "<strong>Manager:</strong> “First-contact resolution fell from 80% to 68% — that's about 90 repeat tickets a week from Ops — and I know why.”<br><strong>Team:</strong> “From today, use the new VPN script on every access call — here's the one-pager.”<br><strong>Peer support team:</strong> “A lot of our repeats are password resets your system is triggering — can we look at the policy together?”<br><strong>Ops Team Leader:</strong> “We know your callers have had to contact us twice too often; we've found why, and you'll see it drop from next week.”",
                  mgr_nonops: "<strong>CFO / COO:</strong> “Survey participation fell from 78% to 52% — we're losing our early-warning signal on attrition, which costs us about $120K a quarter.”<br><strong>Your leads:</strong> “This cycle, every lead runs a 10-minute team huddle on last year's actions before the survey opens.”<br><strong>Peer function head:</strong> “Low participation weakens your training-needs data too — can we co-sponsor the launch?”<br><strong>Ops leadership:</strong> “We've heard the floor doesn't see action from the survey, so this year we're showing results and actions by team within 30 days.”"
                }) } }
            ]
          },
          {
            id: "q3", title: "Check for Understanding", kicker: "03 · Quiz",
            blocks: [
              { t: "quiz", id: "q_m3", questions: [
                { q: "What does stakeholder translation mean?",
                  o: ["Changing the facts to suit each audience", "Keeping the same facts but changing the emphasis to fit what each person needs to know or decide", "Giving everyone the full detail so nobody is left out", "Only sharing good news with clients"], a: 1,
                  why: "Same facts — different lens, not a different truth." },
                V({
                  tl: { q: "You're telling your team about the problem. What should you lead with?",
                    o: ["The dollar value at risk", "What we're doing and what I need from you", "How it compares to other teams", "The history of how it built up"], a: 1,
                    why: "Your team needs action and clarity — what to do differently today." },
                  mgr: { q: "You're briefing the CFO or COO. What should you lead with?",
                    o: ["Which Team Leader is responsible", "The financial impact and the risk", "A detailed timeline of events", "How hard the teams are working"], a: 1,
                    why: "Senior finance and operations leaders need the number and the implication first." }
                })
              ]}
            ]
          }
        ]
      },

      /* ================================================================== */
      {
        id: "m4", num: "04", title: "Executive Presence", minutes: 9,
        steps: [
          {
            id: "fivec", title: "The Five C's of Executive Presence", kicker: "04 · Presence",
            blocks: [
              { t: "lead", html: "Executive presence is not about sounding important. It's about being <strong>credible and useful</strong> — and it's made of observable, learnable behaviours, not charisma." },
              { t: "activity", a: {
                type: "flip", id: "a_fivec",
                title: "Explore the Five C's",
                instructions: "Tap each card to see what it looks like in practice.",
                cards: [
                  { front: "Clear", sub: "Say what matters.", back: "Lead with the point. “Two things you need to know before the 2 PM call…”" },
                  { front: "Composed", sub: "Stay steady under pressure.", back: "Same pace and tone when the news is bad. No over-explaining, no defensiveness." },
                  { front: "Credible", sub: "Use facts + judgement.", back: "Numbers plus your view: “$22K is at risk — I think we can recover most of it by Friday.”" },
                  { front: "Confident", sub: "Own your message.", back: "“We need…” not “We might need…”. Own the next step out loud." },
                  { front: "Concise", sub: "Respect their time.", back: "Concise doesn't mean incomplete — it means prioritised. Cut what doesn't change the decision." }
                ],
                coach: [
                  "Executive presence is the combination of <strong>clarity, ownership, judgement and composure</strong> — not vocabulary.",
                  "Concise ≠ incomplete. It means you've already done the work of prioritising.",
                  "Think of someone whose meeting presence you admire: which of the five do they show most? That's the one to copy."
                ]
              }}
            ]
          },
          {
            id: "detox", title: "Language Detox: Make the Ask Obvious", kicker: "04 · Activity",
            blocks: [
              { t: "p", html: "Your email and chat messages are part of your leadership presence — often where your reputation is actually set. Four standards: <strong>Precision</strong> (say exactly what you mean), <strong>Brevity</strong> (cut unnecessary words), <strong>Action</strong> (make the required action obvious), <strong>Confidence</strong> (avoid unnecessary hedging)." },
              { t: "activity", a: {
                type: "bucket", id: "a_detox",
                title: "Hedge or direct?",
                instructions: "Drag each phrase into the right bucket — or tap it and choose where it goes.",
                buckets: [
                  { id: "weak", label: "Weakens the message", hint: "Hedging, apologising, vague" },
                  { id: "strong", label: "Makes the ask obvious", hint: "Purpose, commitment, deadline" }
                ],
                items: V({
                  ops: [
                    { id: "d1", text: "“I just wanted to check in about…”", b: "weak" },
                    { id: "d2", text: "“Sorry to bother you, but…”", b: "weak" },
                    { id: "d3", text: "“We might need to look at overtime.”", b: "weak" },
                    { id: "d4", text: "“Hopefully we'll be done by Friday.”", b: "weak" },
                    { id: "d5", text: "“Please let me know your thoughts.”", b: "weak" },
                    { id: "d6", text: "“I'm writing to request approval for overtime.”", b: "strong" },
                    { id: "d7", text: "“We need two extra callers on Thursday.”", b: "strong" },
                    { id: "d8", text: "“We'll finish by Friday 5 PM.”", b: "strong" },
                    { id: "d9", text: "“I'd like your decision on the OT request by Wednesday.”", b: "strong" }
                  ],
                  nonops: [
                    { id: "d1", text: "“I just wanted to check in about…”", b: "weak" },
                    { id: "d2", text: "“Sorry to bother you, but…”", b: "weak" },
                    { id: "d3", text: "“We might need to push the go-live.”", b: "weak" },
                    { id: "d4", text: "“Hopefully the fix will be done by Friday.”", b: "weak" },
                    { id: "d5", text: "“Please let me know your thoughts.”", b: "weak" },
                    { id: "d6", text: "“I'm writing to request approval for a referral bonus.”", b: "strong" },
                    { id: "d7", text: "“We need access requests by Tuesday noon to meet Monday's start.”", b: "strong" },
                    { id: "d8", text: "“The fix will be live by Friday 5 PM.”", b: "strong" },
                    { id: "d9", text: "“I'd like your decision on the go-live date by Wednesday.”", b: "strong" }
                  ]
                }),
                coach: [
                  "The swaps: <em>“I just wanted to…”</em> → <em>“I'm writing to…”</em>; <em>“Sorry to bother you”</em> → start with the purpose; <em>“might”</em> → <em>“need”</em>; <em>“hopefully by Friday”</em> → <em>“by Friday 5 PM”</em>; <em>“let me know your thoughts”</em> → <em>“I'd like your decision on X by Wednesday.”</em>",
                  "These phrases aren't automatically wrong — the problem is when they weaken an otherwise clear business message.",
                  "Don't swing too far into bluntness. The goal is precision and ownership, not curtness."
                ]
              }}
            ]
          },
          {
            id: "tryDetox", title: "Try It: Rewrite the Message", kicker: "04 · Try it",
            blocks: [
              { t: "callout", kind: "scenario", title: "Rewrite this", html: V({
                ops: "<span class='big-quote'>“I just wanted to check if maybe we could have a quick discussion sometime this week regarding the client issue.”</span>",
                nonops: "<span class='big-quote'>“I just wanted to check if maybe we could have a quick discussion sometime this week regarding the Ops access issue.”</span>"
              })},
              { t: "reflect", id: "r_detox", title: "Your rewrite",
                fields: [{ id: "detox", label: "Rewrite it with a clear purpose, timeframe and direct ask", rows: 3 }],
                model: { title: "A strong rewrite", html: J(V({
                  ops: "“I'd like to discuss the client issue this week. Can we connect Thursday at 2 PM?”",
                  nonops: "“I'd like to discuss the Ops access issue this week. Can we connect Thursday at 2 PM?”"
                }), "<br><br>What changed: <strong>purpose</strong>, <strong>confidence</strong>, <strong>timeframe</strong>, <strong>direct ask</strong> — in half the words.") } },
              { t: "callout", kind: "tip", title: "Do it for real", html: "Open your last five sent emails or chats. Search for <em>just</em>, <em>sorry</em>, <em>might</em> and <em>hopefully</em>. Which one do you use most?" }
            ]
          },
          {
            id: "dontknow", title: "When You Don't Know the Answer", kicker: "04 · Presence",
            blocks: [
              { t: "cards", cols: 3, items: [
                { title: "Don't guess", text: "Avoid speculating just to sound confident.<br><em>“I think it's probably around…”</em>", tone: "bad" },
                { title: "Be transparent", text: "<em>“I don't have that number with me right now. What I can confirm is…”</em>", tone: "good" },
                { title: "Own the follow-up", text: "<em>“I don't want to speculate. I'll validate that and come back to you by 3 PM.”</em>", tone: "good" }
              ]},
              { t: "callout", kind: "key", title: "Why this builds credibility", html: "Guessing and being wrong costs far more trust than a confident, time-boxed follow-up. Keep it to those three moves — being transparent doesn't mean over-explaining." }
            ]
          },
          {
            id: "q4", title: "Check for Understanding", kicker: "04 · Quiz",
            blocks: [
              { t: "quiz", id: "q_m4", questions: [
                V({
                  ops: { q: "{Boss} asks for the exact write-off figure. You don't have it. What's the best response?",
                    o: ["“I think it's probably around $20K.”", "“Sorry, I'm not sure — I'll check at some point.”", "“I don't have that number with me. What I can confirm is about 40 accounts are affected. I'll validate the figure and come back by 3 PM.”", "“That's really a question for billing.”"], a: 2,
                    why: "Be transparent, share what you can confirm, and own a time-boxed follow-up." },
                  nonops: { q: "{Boss} asks for the exact cost-per-hire this quarter. You don't have it. What's the best response?",
                    o: ["“I think it's probably around $2,000.”", "“Sorry, I'm not sure — I'll check at some point.”", "“I don't have that number with me. What I can confirm is agency spend is up this quarter. I'll validate the figure and come back by 3 PM.”", "“That's really a question for Finance.”"], a: 2,
                    why: "Be transparent, share what you can confirm, and own a time-boxed follow-up." }
                }),
                { q: "Which email opening shows the most executive presence?",
                  o: ["“Sorry to bother you, I just wanted to ask about…”", "“I'd like your approval for the request below by Wednesday 12 PM.”", "“Hopefully it's OK if we maybe go ahead?”", "“Please let me know your thoughts.”"], a: 1,
                  why: "It states the purpose, the ask and the deadline — no hedging." },
                { q: "In the Five C's, what does “Concise” mean?",
                  o: ["Always under three sentences", "Leaving out anything negative", "Prioritised — not incomplete", "Speaking quickly"], a: 2,
                  why: "Concise means you've done the work of prioritising what matters to the decision." }
              ]}
            ]
          }
        ]
      },

      /* ================================================================== */
      {
        id: "m5", num: "05", title: "Navigate: Difficult Conversations with COIN", minutes: 14,
        steps: [
          {
            id: "coin", title: "The COIN Model", kicker: "05 · Navigate",
            blocks: [
              { t: "p", html: J(V({
                tl: "Every Team Leader has these conversations: performance concerns, missed commitments, quality slips, pushback, peer conflict, repeated communication gaps.",
                mgr: "Every Manager has these conversations: a Team Leader's missed commitments, client or Ops complaints, scope pushback, peer conflict, repeated communication gaps."
              }), " The hardest ones are usually the ones we delay — fear of the reaction, not knowing how to start, worry about the relationship. <strong>Structure gives you a neutral way in.</strong>") },
              { t: "cards", cols: 4, items: [
                { title: "Context", text: "What conversation are we having?" },
                { title: "Observation", text: "What specifically happened?" },
                { title: "Impact", text: "What was the consequence?" },
                { title: "Next step", text: "What needs to change?" }
              ]},
              { t: "flow", items: ["When X happened", "I observed Y", "The impact was Z", "Let's do A"] },
              { t: "h3", text: V({ tl_ops: "COIN in practice: a team member's missed follow-ups", mgr_ops: "COIN in practice: a client commitment missed", tl_nonops: "COIN in practice: candidate updates that didn't happen", mgr_nonops: "COIN in practice: a report Ops relies on, late again" }) },
              { t: "example", rows: V({
                tl_ops: [
                  ["Context", "“I want to talk about the payer follow-ups that were due Monday.”"],
                  ["Observation", "“Twelve of the fifteen accounts on your list weren't worked, and this is the third week it's happened.”"],
                  ["Impact", "“Two of those claims have now passed timely filing — that's $4,800 we can't recover — and the team picked up the rework.”"],
                  ["Next step", "“Let's agree a 10-minute check-in at 4 PM each day on your follow-up list for the next two weeks.”"]
                ],
                mgr_ops: [
                  ["Context", "“I want to talk about Tuesday's client update.”"],
                  ["Observation", "“The corrective action plan wasn't included, and the client asked about it directly.”"],
                  ["Impact", "“That created a confidence gap and a follow-up from the client to our director.”"],
                  ["Next step", "“Let's align on the narrative before every client call — a 10-minute pre-call review.”"]
                ],
                tl_nonops: [
                  ["Context", "“I want to talk about candidate updates to the Ops hiring managers.”"],
                  ["Observation", "“Six of the ten candidates in your pipeline had no update for over a week — the third week running.”"],
                  ["Impact", "“Two candidates accepted other offers, and the Ops manager escalated to my manager.”"],
                  ["Next step", "“Let's agree updates every Tuesday and Friday by noon, and a 10-minute review with me on Mondays for the next month.”"]
                ],
                mgr_nonops: [
                  ["Context", "“I want to talk about the monthly headcount report for Ops leadership.”"],
                  ["Observation", "“It's gone out after the 5th working day three months running, and this month two sites' numbers were wrong.”"],
                  ["Impact", "“Ops made staffing decisions on stale data, and the COO asked me directly why.”"],
                  ["Next step", "“Let's lock a day-3 draft review with me each month, and I'll get you direct access to the WFM feed.”"]
                ]
              })},
              { t: "callout", kind: "key", title: "Notice", html: "<strong>Observation + Impact</strong> keep it objective. <strong>Next step</strong> makes it actionable. The purpose is behaviour change and accountability — not making someone feel bad." }
            ]
          },
          {
            id: "behav", title: "Behaviour, Not Personality", kicker: "05 · Activity",
            blocks: [
              { t: "p", html: "A COIN Observation describes <strong>specific behaviour</strong> — something you could have seen or measured. Labels about personality invite argument." },
              { t: "activity", a: {
                type: "bucket", id: "a_behav",
                title: "Observation or label?",
                instructions: "Drag each statement into the right bucket — or tap it and choose where it goes.",
                buckets: [
                  { id: "obs", label: "Observable behaviour", hint: "Use in COIN" },
                  { id: "lab", label: "Personality label", hint: "Avoid" }
                ],
                items: V({
                  ops: [
                    { id: "b1", text: "“You're not proactive.”", b: "lab" },
                    { id: "b2", text: "“You don't care about quality.”", b: "lab" },
                    { id: "b3", text: "“You're always late.”", b: "lab" },
                    { id: "b4", text: "“You have an attitude problem.”", b: "lab" },
                    { id: "b5", text: "“The client update went out without the agreed corrective action.”", b: "obs" },
                    { id: "b6", text: "“Three of your last five QA audits had the same modifier error.”", b: "obs" },
                    { id: "b7", text: "“You joined the 9 AM huddle after 9:15 on four days this week.”", b: "obs" },
                    { id: "b8", text: "“When I asked you to cover the Aetna queue, you said ‘that's not my job’.”", b: "obs" }
                  ],
                  nonops: [
                    { id: "b1", text: "“You're not proactive.”", b: "lab" },
                    { id: "b2", text: "“You don't care about quality.”", b: "lab" },
                    { id: "b3", text: "“You're always late.”", b: "lab" },
                    { id: "b4", text: "“You have an attitude problem.”", b: "lab" },
                    { id: "b5", text: "“The Ops report went out without the site breakdown we agreed.”", b: "obs" },
                    { id: "b6", text: "“Three of your last five offer letters had the wrong shift code.”", b: "obs" },
                    { id: "b7", text: "“You joined the 9 AM stand-up after 9:15 on four days this week.”", b: "obs" },
                    { id: "b8", text: "“When I asked you to cover the Ops ticket queue, you said ‘that's not my job’.”", b: "obs" }
                  ]
                }),
                coach: [
                  "Labels (“not proactive”, “always late”) describe a person. People defend who they are — so the conversation becomes an argument.",
                  "Observations describe what happened. They're hard to dispute and, crucially, they describe something the person can <strong>change</strong>.",
                  "Watch for “always” and “never” — they turn a fact into an exaggeration."
                ]
              }},
              { t: "h3", text: "When pressure rises, structure matters more" },
              { t: "compare", left: "Under pressure, we drift to…", right: "Move toward…", rows: [
                ["<strong>Defensive:</strong> “That's not really what happened.”", "<strong>Fact:</strong> Here's what happened."],
                ["<strong>Vague:</strong> “We'll take care of it.”", "<strong>Ownership:</strong> Here's what we've done."],
                ["<strong>Blaming:</strong> “The team didn't do what they were supposed to.”", "<strong>Action:</strong> Here's what happens next."]
              ]}
            ]
          },
          {
            id: "sim", title: "Simulation: A Difficult Conversation", kicker: "05 · Simulation",
            blocks: [
              { t: "p", html: "This replaces the live role-play. You'll run a COIN conversation one decision at a time. Pick what you'd say — if it misses, you'll get coaching and another try." },
              { t: "activity", a: V({
                tl_ops: {
                  type: "sim", id: "a_sim", title: "Your conversation with Sam",
                  setup: "Sam is an experienced AR caller on your team. For the third week in a row, Sam hasn't finished the payer follow-ups they committed to. Two claims have now passed timely filing. You've booked 15 minutes in a quiet room.",
                  steps: [
                    { label: "Context", situation: "Sam sits down. How do you open?", options: [
                      { text: "“Hey Sam, got a minute? Nothing serious, just a quick thing…”", ok: false, fb: "Softening hides the purpose. Sam now has to guess what this is about — and if it turns out to be serious, you've undermined your own message." },
                      { text: "“Sam, I want to talk about the payer follow-ups that were due Monday.”", ok: true, fb: "Clear context. Sam knows exactly what conversation this is, without any judgement attached yet." },
                      { text: "“Sam, we need to talk about your attitude to deadlines.”", ok: false, fb: "That's a personality label. You've put Sam on the defensive in the first sentence." } ] },
                    { label: "Observation", situation: "Sam nods: “OK…” What did you observe?", options: [
                      { text: "“You never get your follow-ups done.”", ok: false, fb: "“Never” is an exaggeration Sam can easily disprove — and then you're arguing about the word, not the pattern." },
                      { text: "“Some people on the team have noticed you're falling behind.”", ok: false, fb: "That's hearsay and it drags the team in. Speak to what <em>you</em> observed, specifically." },
                      { text: "“Twelve of the fifteen accounts on your list weren't worked by Monday, and it's the third week this has happened.”", ok: true, fb: "Specific, measurable, and it names the pattern without exaggerating it." } ] },
                    { label: "Impact", situation: "Sam is quiet. What was the impact?", options: [
                      { text: "“It makes me look bad in front of my manager.”", ok: false, fb: "That makes it about you. Impact should be the business, client or team consequence." },
                      { text: "“Two of those claims have now passed timely filing — that's $4,800 we can't recover — and Jo and Ravi picked up the rework.”", ok: true, fb: "Concrete business impact and team impact. This is what makes the conversation matter." },
                      { text: "“It's just not acceptable.”", ok: false, fb: "That's a judgement, not an impact. Sam still doesn't know what the consequence actually was." } ] },
                    { label: "Pushback", situation: "Sam pushes back: <em>“I was dealing with a lot of eligibility escalations — it wasn't entirely my fault.”</em>", options: [
                      { text: "“That's not really the point.”", ok: false, fb: "Dismissive and defensive. Sam feels unheard, and the conversation turns into a standoff." },
                      { text: "“OK, fair enough — let's leave it this time.”", ok: false, fb: "You've dropped accountability. It's the third week — the pattern will continue, and the rest of the team will notice." },
                      { text: "“I hear you — the escalations were real, and I should have spotted that load sooner. The follow-ups still need to happen, so let's work out how.”", ok: true, fb: "You acknowledge what's true, own your part, and keep the conversation on the next step." } ] },
                    { label: "Next step", situation: "Sam relaxes a little: “Yeah… OK.” How do you close?", options: [
                      { text: "“Let's do a 10-minute check-in at 4 PM each day on your follow-up list for two weeks, and I'll route new escalations to Jo until Friday. Does that work for you?”", ok: true, fb: "Specific, time-boxed, supportive — and it checks for agreement. That's a real next step." },
                      { text: "“Just try harder next week.”", ok: false, fb: "Vague. Nothing will be different next week, and there's nothing to follow up on." },
                      { text: "“If it happens again, I'll have to take this to HR.”", ok: false, fb: "Leading with a threat isn't a next step. First agree what needs to change and how you'll support it." } ] }
                  ]
                },
                mgr_ops: {
                  type: "sim", id: "a_sim", title: "Your conversation with Sam",
                  setup: "Sam is one of your Team Leaders. For the third time this month, Sam's client update went out without the corrective action plan you'd agreed — and yesterday the client asked about it directly on a call with your director. You've booked 20 minutes.",
                  steps: [
                    { label: "Context", situation: "Sam joins the call. How do you open?", options: [
                      { text: "“Sam, got a sec? Just a small thing about the client…”", ok: false, fb: "Softening it signals it doesn't matter — the opposite of what you need Sam to hear." },
                      { text: "“Sam, I'm worried about your client skills.”", ok: false, fb: "That's a judgement about Sam, not a conversation topic. Sam will defend themselves instead of listening." },
                      { text: "“Sam, I want to talk about Tuesday's client update.”", ok: true, fb: "Clear, neutral context. Sam knows exactly what this is about." } ] },
                    { label: "Observation", situation: "Sam: “Sure — what about it?”", options: [
                      { text: "“The corrective action plan wasn't included on Tuesday, and it's the third update this month without it.”", ok: true, fb: "Specific and factual, and it names the pattern." },
                      { text: "“You always leave important things out of client updates.”", ok: false, fb: "“Always” is an exaggeration — Sam will point to the times it was fine." },
                      { text: "“The client thinks you're disorganised.”", ok: false, fb: "That's a label, second-hand. Stick to what you observed." } ] },
                    { label: "Impact", situation: "Sam goes quiet. What was the impact?", options: [
                      { text: "“It embarrassed me in front of the director.”", ok: false, fb: "That makes it about your discomfort rather than the business consequence." },
                      { text: "“It's really unprofessional.”", ok: false, fb: "A judgement, not an impact. What actually happened as a result?" },
                      { text: "“The client asked about it directly, which created a confidence gap and a follow-up to our director — on an account that renews in Q3.”", ok: true, fb: "Client impact, leadership visibility and commercial risk — clear and factual." } ] },
                    { label: "Pushback", situation: "Sam pushes back: <em>“The issues were changing daily — I didn't want to commit to a plan that might change.”</em>", options: [
                      { text: "“That's just an excuse.”", ok: false, fb: "Dismissive. Sam has a real point about uncertainty — ignoring it loses them." },
                      { text: "“I understand — the plan was moving. The client still needs to see we're in control, so let's show the plan and say what might change.”", ok: true, fb: "You acknowledge the real constraint and still hold the standard. That's composed leadership." },
                      { text: "“Fine — skip the plan until things settle.”", ok: false, fb: "You've lowered the standard the client expects. The confidence gap will grow." } ] },
                    { label: "Next step", situation: "Sam: “OK… so what do you want me to do differently?”", options: [
                      { text: "“Be more careful with the client.”", ok: false, fb: "Too vague to act on or follow up." },
                      { text: "“Next time, I'll take over the account.”", ok: false, fb: "A threat, not a next step — and it removes Sam's chance to grow." },
                      { text: "“Let's do a 10-minute pre-call review before every client call this month — you bring the draft, I'll help sharpen the narrative. Does that work?”", ok: true, fb: "Specific, time-boxed, supportive, and it checks agreement." } ] }
                  ]
                },
                tl_nonops: {
                  type: "sim", id: "a_sim", title: "Your conversation with Sam",
                  setup: "Sam is a recruiter on your Talent Acquisition team. For the third week running, candidates in Sam's pipeline have gone over a week with no update. Two have accepted offers elsewhere, and an Ops manager has escalated to your manager. You've booked 15 minutes.",
                  steps: [
                    { label: "Context", situation: "Sam sits down. How do you open?", options: [
                      { text: "“Sam, we need to talk about how disorganised you've been.”", ok: false, fb: "A personality label in your first sentence — Sam goes on the defensive." },
                      { text: "“Sam, I want to talk about candidate updates to the Ops hiring managers.”", ok: true, fb: "Clear context, no judgement attached." },
                      { text: "“Sam, quick chat? It's nothing really…”", ok: false, fb: "If it's nothing, why are you meeting? Softening hides the purpose." } ] },
                    { label: "Observation", situation: "Sam: “OK…” What did you observe?", options: [
                      { text: "“You never update anyone.”", ok: false, fb: "“Never” is easy to disprove — then you're arguing about the word." },
                      { text: "“The Ops managers say you ignore them.”", ok: false, fb: "Hearsay. Speak to what you observed in the data." },
                      { text: "“Six of the ten candidates in your pipeline had no update for over a week, and it's the third week running.”", ok: true, fb: "Specific, measurable and it names the pattern." } ] },
                    { label: "Impact", situation: "Sam looks surprised. What was the impact?", options: [
                      { text: "“Two candidates accepted other offers, the floor is still two seats short, and the Ops manager escalated to my manager.”", ok: true, fb: "Candidate, Ops and team impact — concrete and business-focused." },
                      { text: "“It makes me look bad to my manager.”", ok: false, fb: "That centres you. Impact should be the business or internal-client consequence." },
                      { text: "“That's just not good enough.”", ok: false, fb: "A judgement, not a consequence." } ] },
                    { label: "Pushback", situation: "Sam pushes back: <em>“Hiring managers take days to give feedback — I can't update candidates on nothing.”</em>", options: [
                      { text: "“That's not the point.”", ok: false, fb: "It partly <em>is</em> the point — dismissing it loses Sam." },
                      { text: "“That's fair — slow feedback is real, and I'll raise it with the Ops managers. Candidates still need to hear from us, even if it's ‘no news yet’, so let's plan that.”", ok: true, fb: "You acknowledge the real blocker, take ownership of your part, and keep the standard." },
                      { text: "“Then don't worry about it until they reply.”", ok: false, fb: "You've dropped the standard — more candidates will walk." } ] },
                    { label: "Next step", situation: "Sam: “OK. What do you need from me?”", options: [
                      { text: "“If another candidate drops, it goes on your review.”", ok: false, fb: "A threat isn't a next step. Agree the change first." },
                      { text: "“Try to stay on top of it.”", ok: false, fb: "Vague — nothing to act on or check." },
                      { text: "“Let's agree updates every Tuesday and Friday by noon — even ‘no news yet’ — and a 10-minute Monday review with me for the next month. Does that work?”", ok: true, fb: "Specific, time-boxed, supportive and agreed." } ] }
                  ]
                },
                mgr_nonops: {
                  type: "sim", id: "a_sim", title: "Your conversation with Sam",
                  setup: "Sam leads the MIS / reporting team in your function. For three months running, the headcount report Ops leadership relies on has been late — and this month two sites' numbers were wrong. The COO asked you about it directly. You've booked 20 minutes.",
                  steps: [
                    { label: "Context", situation: "Sam joins. How do you open?", options: [
                      { text: "“Sam, I want to talk about the monthly headcount report for Ops leadership.”", ok: true, fb: "Clear, specific, neutral." },
                      { text: "“Sam, have you got a minute? Nothing major…”", ok: false, fb: "It is major — softening it confuses the message." },
                      { text: "“Sam, I need to talk about your reliability.”", ok: false, fb: "A label about Sam — expect defensiveness." } ] },
                    { label: "Observation", situation: "Sam: “OK, go ahead.”", options: [
                      { text: "“Your reports are always late.”", ok: false, fb: "“Always” invites argument about the exceptions." },
                      { text: "“The COO thinks you're careless.”", ok: false, fb: "Second-hand and a label. Use what you observed." },
                      { text: "“The report went out after the 5th working day three months running, and this month two sites' numbers were wrong.”", ok: true, fb: "Specific, verifiable and it names the pattern." } ] },
                    { label: "Impact", situation: "Sam nods slowly. What was the impact?", options: [
                      { text: "“It's not the standard I expect.”", ok: false, fb: "A judgement — not a consequence Sam can see." },
                      { text: "“Ops made staffing decisions on stale data, and the COO asked me directly why the numbers didn't match.”", ok: true, fb: "Business impact and leadership visibility — clear stakes." },
                      { text: "“It's embarrassing for me.”", ok: false, fb: "That centres you, not the business." } ] },
                    { label: "Pushback", situation: "Sam pushes back: <em>“The sites send me their data late — I can't publish what I don't have.”</em>", options: [
                      { text: "“Everyone else manages.”", ok: false, fb: "A comparison that ignores a real blocker — Sam stops listening." },
                      { text: "“OK, then late is fine.”", ok: false, fb: "You've dropped the standard Ops depends on." },
                      { text: "“That's a real blocker, and I should have fixed site access sooner. The report still has to be right and on time, so let's remove that dependency.”", ok: true, fb: "Acknowledge, own your part, hold the standard, move to solutions." } ] },
                    { label: "Next step", situation: "Sam: “What would help?”", options: [
                      { text: "“Let's lock a day-3 draft review with me each month, and I'll get you direct access to the WFM feed by Friday so you're not waiting on sites. Does that work?”", ok: true, fb: "Specific, supported, time-boxed and agreed." },
                      { text: "“Just make it a priority.”", ok: false, fb: "Vague — no change in how the work happens." },
                      { text: "“If it's late again, I'll give it to someone else.”", ok: false, fb: "A threat, not a next step." } ] }
                  ]
                },
                _: null
              })},
              { t: "coachSim", items: [
                "<strong>Context</strong> without softening or labels lets the person hear the rest.",
                "<strong>Observation</strong> must be specific and yours — no “always”, “never” or “people are saying”.",
                "<strong>Impact</strong> is the business, client or team consequence — not how it makes you feel.",
                "When they push back: <strong>acknowledge what's true, own your part, return to the next step.</strong>",
                "A <strong>Next step</strong> has an action, a timeframe, your support, and a check for agreement."
              ]}
            ]
          },
          {
            id: "tryCoin", title: "Try It: Your COIN Opening", kicker: "05 · Try it",
            blocks: [
              { t: "p", html: "This is the highest-value practice in the course. Think of a <strong>real</strong> conversation you need to have — with a {directs}, a peer, or an internal client. First, say your COIN opening out loud in 60 seconds — to a mirror, an empty room, or record it on your phone. Then write it down." },
              { t: "reflect", id: "r_coin", title: "Your COIN opening",
                fields: [
                  { id: "c", label: "Context", rows: 2 },
                  { id: "o", label: "Observation (specific behaviour)", rows: 2 },
                  { id: "i", label: "Impact", rows: 2 },
                  { id: "n", label: "Next step", rows: 2 }
                ],
                selfcheck: ["Specific context", "Observable behaviour — no labels", "Business, client or team impact", "Clear next step", "I said it aloud calmly and confidently"],
                model: { title: "Make it harder", html: "Imagine they push back: <em>“I was dealing with a lot of other issues — it wasn't entirely my fault.”</em> Say your response out loud anyway: acknowledge what's true, own your part, return to the next step." } }
            ]
          },
          {
            id: "q5", title: "Check for Understanding", kicker: "05 · Quiz",
            blocks: [
              { t: "quiz", id: "q_m5", questions: [
                V({
                  ops: { q: "Which of these is a COIN Observation?",
                    o: ["“You don't pay attention to detail.”", "“Three of your last five QA audits had the same modifier error.”", "“Everyone says your work is sloppy.”", "“You need to be more careful.”"], a: 1,
                    why: "It's specific, measurable and describes behaviour — not personality or hearsay." },
                  nonops: { q: "Which of these is a COIN Observation?",
                    o: ["“You don't pay attention to detail.”", "“Three of your last five offer letters had the wrong shift code.”", "“Everyone says your work is sloppy.”", "“You need to be more careful.”"], a: 1,
                    why: "It's specific, measurable and describes behaviour — not personality or hearsay." }
                }),
                { q: "Which parts of COIN keep a difficult conversation objective?",
                  o: ["Context + Next step", "Observation + Impact", "Context + Observation", "Impact + Next step"], a: 1,
                  why: "Observation and Impact are facts and consequences — they keep it about what happened, not who the person is." },
                { q: "{Boss} asks what went wrong on a missed deadline. Which pattern should you move toward?",
                  o: ["Explain + defend + reassure", "Fact → Ownership → Action", "Apologise → explain → wait", "Context → Blame → Fix"], a: 1,
                  why: "Here's what happened, here's what we've done, here's what happens next." }
              ]}
            ]
          }
        ]
      },

      /* ================================================================== */
      {
        id: "m6", num: "06", title: "Integrate: The 90-Second Update", minutes: 9,
        steps: [
          {
            id: "toolkit", title: "Putting It All Together", kicker: "06 · Integrate",
            blocks: [
              { t: "cards", cols: 3, items: [
                { title: "SBAR", text: "High-stakes updates.<br>Situation → Background → Assessment → Recommendation" },
                { title: "Stakeholder mapping", text: "Adapting the message.<br>Same facts → different emphasis" },
                { title: "COIN", text: "Difficult conversations.<br>Context → Observation → Impact → Next step" }
              ]},
              { t: "choice", id: "fav", prompt: "Which framework will you use most often?", options: ["SBAR", "Stakeholder mapping", "COIN"] },
              { t: "p", html: "Underneath all three is one five-part model that covers almost any communication at your level:" },
              { t: "cards", cols: 5, numbered: true, items: [
                { k: "1", title: "Fact", text: "What happened? Specific data, trend or signal." },
                { k: "2", title: "Impact", text: "So what? Business, client, risk or people impact." },
                { k: "3", title: "Your view", text: "What do you believe? Assessment, root cause, confidence." },
                { k: "4", title: "Action", text: "What are you doing? Owner, timeline, recovery." },
                { k: "5", title: "Ask", text: "What do you need? Decision, support or alignment." }
              ]},
              { t: "callout", kind: "key", title: "How it maps", html: "SBAR's Situation + Background → <strong>Fact</strong>. Assessment → <strong>Your view</strong>. Recommendation → <strong>Action</strong> and <strong>Ask</strong>." }
            ]
          },
          {
            id: "seq2", title: "Build a 90-Second Update", kicker: "06 · Activity",
            blocks: [
              { t: "p", html: "A strong 90-second update opens with the point — not the history or a greeting — runs <strong>Fact → Impact → Your view → Action → Ask</strong>, and closes with <em>“My recommendation is X. I need Y from you by Z.”</em>" },
              { t: "activity", a: {
                type: "sequence", id: "a_90",
                title: "Put the update in order",
                instructions: "Tap the sentences in the order you'd say them to {boss}.",
                slotLabels: ["Open", "Fact", "Impact", "Your view", "Action", "Ask"],
                items: V({
                  tl_ops: [
                    { id: "n1", text: "“There are two things you need to know about the Aetna queue before tomorrow's review.”" },
                    { id: "n2", text: "“First-pass denials on Aetna rose from 5% to 9% over the last two weeks.”" },
                    { id: "n3", text: "“That's about 120 extra claims in rework and roughly $30K in delayed cash.”" },
                    { id: "n4", text: "“I believe it's the new referral rule — 80% of the denials cite it.”" },
                    { id: "n5", text: "“We've built a pre-submission check for referrals and trained the team this morning.”" },
                    { id: "n6", text: "“My recommendation is to keep the check for 30 days. I need you to raise the rule with the client by Friday.”" }
                  ],
                  mgr_ops: [
                    { id: "n1", text: "“There are two things you need to know about the Aetna account before tomorrow's client review.”" },
                    { id: "n2", text: "“First-pass denials on Aetna rose from 5% to 9% across all teams over two weeks.”" },
                    { id: "n3", text: "“That's about 600 extra claims in rework and roughly $150K in delayed cash this month.”" },
                    { id: "n4", text: "“I believe it's the new referral rule — 80% of the denials cite it.”" },
                    { id: "n5", text: "“We've built a pre-submission referral check and trained all three teams this week.”" },
                    { id: "n6", text: "“My recommendation is to keep the check for 30 days. I need you to raise the rule change with the client by Friday.”" }
                  ],
                  tl_nonops: [
                    { id: "n1", text: "“There are two things you need to know about system access before Monday's new-hire batch.”" },
                    { id: "n2", text: "“New hires are waiting an average of 3 days for access, against a same-day target.”" },
                    { id: "n3", text: "“That's about 60 lost caller-days a month, and new hires start their first week frustrated.”" },
                    { id: "n4", text: "“I believe it's the manual approval step — it's where 90% of tickets stall.”" },
                    { id: "n5", text: "“We've pre-built access for Monday's batch and drafted an auto-approval rule.”" },
                    { id: "n6", text: "“My recommendation is auto-approval for standard roles. I need your sign-off by Thursday.”" }
                  ],
                  mgr_nonops: [
                    { id: "n1", text: "“There are two things you need to know about new-hire attrition before Thursday's leadership review.”" },
                    { id: "n2", text: "“First-90-day attrition for AR roles rose from 18% to 27% this quarter.”" },
                    { id: "n3", text: "“That's about 40 seats to refill — roughly $120K in hiring and training cost — with Ops short-staffed into quarter-end.”" },
                    { id: "n4", text: "“I believe it's the week-one experience: exit interviews point to no buddy and no system access on day one.”" },
                    { id: "n5", text: "“We've launched a buddy programme with Ops TLs and pre-built access for the next cohort.”" },
                    { id: "n6", text: "“My recommendation is to fund the buddy stipend for two quarters. I need your decision by the 15th.”" }
                  ]
                }),
                coach: [
                  "The <strong>Open</strong> starts with the point and signals how much you're about to say (“two things”).",
                  "<strong>Your view</strong> is what separates a leader from a reporter — you've formed a judgement about the cause.",
                  "The close — <em>“My recommendation is X. I need Y from you by Z.”</em> — makes the ask impossible to miss."
                ]
              }},
              { t: "callout", kind: "tip", title: "Try it out loud", html: "Pick one real issue on your plate. Map it silently onto the five parts, then <strong>time yourself</strong> delivering a 90-second version out loud, open to close." }
            ]
          },
          {
            id: "q6", title: "Check for Understanding", kicker: "06 · Quiz",
            blocks: [
              { t: "quiz", id: "q_m6", questions: [
                { q: "Where should a 90-second update start?",
                  o: ["With a greeting and small talk", "With the history of the issue", "With the point — what they need to know", "With an apology"], a: 2,
                  why: "Open with the point so the listener knows why you're talking." },
                { q: "In the five-part model, SBAR's Recommendation maps to…",
                  o: ["Fact", "Impact", "Your view", "Action and Ask"], a: 3,
                  why: "Recommendation is what you're doing plus what you need." },
                V({
                  tl_ops: { q: "Which of these should you <strong>decide yourself</strong> as a Team Leader, then inform your manager?",
                    o: ["Approving overtime for the team", "Re-prioritising today's queue to work the oldest accounts first", "Changing a client's SLA", "Borrowing callers from another team"], a: 1,
                    why: "Daily queue priorities are yours to own. Overtime spend, client commitments and cross-team resourcing need your manager — bring those as SBAR with a recommendation." },
                  mgr_ops: { q: "Which of these should you <strong>decide yourself</strong> as a Manager, then inform your director?",
                    o: ["Moving callers between your own teams for a week", "Changing the client contract terms", "A department-wide hiring freeze", "Approving budget beyond your authority"], a: 0,
                    why: "Resourcing across your own teams is yours. Contract, policy and budget beyond your authority go to your director — as SBAR with a recommendation." },
                  tl_nonops: { q: "Which of these should you <strong>decide yourself</strong> as a Team Leader, then inform your manager?",
                    o: ["Changing a company-wide HR or IT policy", "Re-prioritising your team's queue by Ops go-live dates", "Approving a new vendor contract", "Moving an Ops start date"], a: 1,
                    why: "Your team's daily priorities are yours to own. Policy, vendor spend and anything that changes Ops commitments needs your manager — bring it as SBAR with a recommendation." },
                  mgr_nonops: { q: "Which of these should you <strong>decide yourself</strong> as a Manager, then inform your director?",
                    o: ["Redesigning your own team's intake process", "Changing a company-wide compensation policy", "Signing a contract above your approval limit", "Delaying an Ops go-live across all sites"], a: 0,
                    why: "Your function's processes are yours. Policy, spend above your limit and Ops-wide commitments go to your director — as SBAR with a recommendation." }
                })
              ]}
            ]
          },
          {
            id: "checklist", title: "Your Communication Checklist", kicker: "06 · Keep this",
            blocks: [
              { t: "p", html: "Use this before your next update to {boss}, client or Ops call, or escalation. It's included in your PDF download — keep it somewhere you'll see it again." },
              { t: "checklist", items: ["Did I lead with the point?", "Did I explain why it matters?", "Did I separate facts from assumptions?", "Did I adapt the message to the stakeholder?", "Did I show ownership and control?", "Did I make the next step visible?", "Did I make the ask explicit?"] }
            ]
          },
          {
            id: "commit", title: "My 3 Communication Commitments", kicker: "06 · Action",
            blocks: [
              { t: "p", html: "Write something <strong>real</strong> — something that's actually in your calendar or inbox right now. “Communicate better” isn't specific enough: push yourself to one concrete behaviour per line." },
              { t: "reflect", id: "r_commit", title: "My commitments (3–4 minutes)",
                fields: [
                  { id: "restructure", label: "1 · Restructure — one message I'll restructure using SBAR / Fact → Impact → Action → Ask", rows: 2 },
                  { id: "translate", label: "2 · Translate — one stakeholder I'll communicate differently with, and how", rows: 2 },
                  { id: "conversation", label: "3 · Have the conversation — one difficult conversation I need to have, and my COIN opening", rows: 3 }
                ],
                model: { title: "Make it stick", html: "Share these three commitments with {boss} or a peer. A commitment someone else knows about is far more likely to happen — and put at least one on your actual calendar this week." } }
            ]
          },
          {
            id: "close", title: "Closing Confidence Check", kicker: "Close",
            blocks: [
              { t: "scale", id: "confClose", compare: "confOpen", prompt: "How confident do you feel now communicating with someone two levels above you ({up2})?",
                labels: ["Avoid it", "Uncomfortable", "Need preparation", "Confident", "Can influence"] },
              { t: "reflect", id: "r_final", title: "Final reflection",
                fields: [{ id: "final", label: "What will you communicate differently this week? Write 2–3 concrete answers.", rows: 3 }],
                note: "Keep it practical and forward-looking, not aspirational. Look back at what you wrote about upward communication at the start — has anything shifted?" },
              { t: "closing" }
            ]
          }
        ]
      },

      /* ================================================================== */
      {
        id: "m7", num: "07", title: "Knowledge Check & Certificate", minutes: 8,
        steps: [
          {
            id: "final", title: "Final Knowledge Check", kicker: "Graded · 80% to pass",
            blocks: [
              { t: "p", html: "Ten scenario questions covering the whole course. Answer them all, then submit. You need <strong>80%</strong> to unlock your certificate — you can retake it, and your best score is kept." },
              { t: "final", id: "final", questions: [
                V({
                  ops: { q: "Which statement reaches the <strong>Insight</strong> level — not just Information, not yet Influence?",
                    o: ["“Clean-claim rate is 91% this week.”", "“Clean-claim rate fell 4 points after the new registration form went live.”", "“Clean-claim rate fell 4 points; we've retrained the front-end team and will be back to 95% by Friday.”", "“Clean-claim rate is a key KPI for the client.”"], a: 1,
                    why: "Insight explains why it happened. The third option goes further, into Influence." },
                  nonops: { q: "Which statement reaches the <strong>Insight</strong> level — not just Information, not yet Influence?",
                    o: ["“Time-to-fill is 38 days.”", "“Time-to-fill rose 9 days after two sourcing partners paused.”", "“Time-to-fill rose 9 days; we've launched a referral drive and expect 30 days by month-end.”", "“Time-to-fill is a key KPI for Ops.”"], a: 1,
                    why: "Insight explains why it happened. The third option goes further, into Influence." }
                }),
                V({
                  ops: { q: "You message {boss}: “The team is looking into the denial increase.” What's most missing?",
                    o: ["More background on the payer", "An apology for the increase", "Assessment, ownership and a clear ask", "A spreadsheet of affected claims"], a: 2,
                    why: "It's “reporter” communication — it leaves the reader to do the thinking." },
                  nonops: { q: "You message {boss}: “The team is looking into the ticket increase.” What's most missing?",
                    o: ["More background on the VPN change", "An apology for the increase", "Assessment, ownership and a clear ask", "A spreadsheet of affected tickets"], a: 2,
                    why: "It's “reporter” communication — it leaves the reader to do the thinking." }
                }),
                V({
                  ops: { q: "In an SBAR update, “The CMS modifier update went live Monday” is which element?",
                    o: ["Situation", "Background", "Assessment", "Recommendation"], a: 1, why: "It's context that explains the situation — Background." },
                  nonops: { q: "In an SBAR update, “The shift-allowance code changed in the new payroll system on the 1st” is which element?",
                    o: ["Situation", "Background", "Assessment", "Recommendation"], a: 1, why: "It's context that explains the situation — Background." }
                }),
                V({
                  ops: { q: "“We've already identified the cause and put a recovery plan in place — here's where things stand.” Which audience is this opening built for?",
                    o: ["{Boss} — impact + risk", "Your team — action + clarity", "A peer — shared impact", "The client — confidence + ownership + control"], a: 3,
                    why: "It leads with what's already been done — the confidence and control a client needs." },
                  nonops: { q: "“We've found why requests have been slow, and you'll see turnaround back to normal by the 30th.” Which audience is this opening built for?",
                    o: ["{Boss} — impact + risk", "Your team — action + clarity", "A peer support team — shared impact", "Ops, your internal client — confidence + control"], a: 3,
                    why: "It leads with what's been done and what they'll see — the confidence and control an internal client needs." }
                }),
                { q: "What should you lead with when updating a peer?",
                  o: ["The dollar value at risk", "What affects them and where you need to align", "Your full action plan", "Who caused the problem"], a: 1,
                  why: "Peers need alignment and shared impact." },
                { q: "Which is the best rewrite of “Hopefully we'll have it done by Friday”?",
                  o: ["“We will definitely, absolutely have it done.”", "“Hopefully by Friday, fingers crossed.”", "“We'll have it done by Friday 5 PM.”", "“It should be done soon.”"], a: 2,
                  why: "Specific commitment with a clear deadline — confident without over-promising." },
                { q: "In a COIN conversation, your {directs} says “It wasn't entirely my fault.” What's the strongest response?",
                  o: ["“That's not really the point.”", "“OK, let's leave it this time.”", "“I hear you — that was real and I should have spotted it sooner. The work still needs to happen, so let's work out how.”", "“Everyone else managed.”"], a: 2,
                  why: "Acknowledge what's true, own your part, return to the next step." },
                V({
                  tl: { q: "Which of these is a proper COIN <strong>Next step</strong>?",
                    o: ["“Just be more careful from now on.”", "“Let's do a 10-minute check-in at 4 PM daily for two weeks — does that work?”", "“I'm disappointed in you.”", "“Next time I'll have to escalate.”"], a: 1,
                    why: "Specific action, timeframe and a check for agreement." },
                  mgr: { q: "Which of these is a proper COIN <strong>Next step</strong> with one of your Team Leaders?",
                    o: ["“Just be more careful from now on.”", "“Let's do a 10-minute pre-call review before every client or Ops call this month — does that work?”", "“I'm disappointed in you.”", "“Next time I'll take over.”"], a: 1,
                    why: "Specific action, timeframe, your support and a check for agreement." }
                }),
                { q: "Under pressure, “We'll take care of it” is an example of which drift?",
                  o: ["Defensive", "Vague", "Blaming", "Ownership"], a: 1,
                  why: "It sounds like ownership but says nothing about what, who or when. Move to Fact → Ownership → Action." },
                { q: "Why does “My recommendation is X. I need Y from you by Z.” make a strong close?",
                  o: ["It's polite", "It states your view and a specific ask with a deadline", "It keeps the update under 90 seconds", "It avoids committing to anything"], a: 1,
                  why: "It makes both your judgement and your ask impossible to miss." }
              ]}
            ]
          },
          {
            id: "cert", title: "Your Certificate", kicker: "Finish",
            blocks: [ { t: "cert" } ]
          }
        ]
      }
    ],

    /* Role-specific "decide or escalate" guidance (rendered by { t: "decide" }) */
    decide: V({
      tl_ops: { title: "Decide or escalate? — Team Leader, Operations",
        own: ["Daily queue priorities and allocation", "Coaching and follow-up with your team", "Quality checks within your team"],
        up: ["Overtime or spend", "Borrowing people from another team", "Anything that changes a client commitment or SLA"],
        tip: "When you escalate, bring SBAR <strong>with a recommendation</strong> — never just the problem." },
      mgr_ops: { title: "Decide or escalate? — Manager, Operations",
        own: ["Resourcing across your own teams", "Recovery plans for your accounts", "Coaching your Team Leaders"],
        up: ["Budget beyond your authority", "Changes to client contracts or SLAs", "Risks your director must own with the client"],
        tip: "Decide, then inform upward with SBAR. And coach your Team Leaders to bring you <strong>recommendations, not problems</strong>." },
      tl_nonops: { title: "Decide or escalate? — Team Leader, Non-Ops",
        own: ["Your team's daily queue and priorities", "How requests from Ops are triaged", "Coaching and follow-up with your team"],
        up: ["Policy exceptions or changes", "Vendor spend or new tools", "Anything that moves an Ops start date or go-live"],
        tip: "When you escalate, bring SBAR <strong>with a recommendation</strong> — never just the problem." },
      mgr_nonops: { title: "Decide or escalate? — Manager, Non-Ops",
        own: ["Your function's processes and service levels", "Priorities agreed with Ops leadership", "Coaching your leads"],
        up: ["Company-wide policy changes", "Spend above your approval limit", "Trade-offs that affect Ops capacity across sites"],
        tip: "Decide, then inform upward with SBAR. Coach your leads to bring you <strong>recommendations, not problems</strong>." }
    })
  };
})();
