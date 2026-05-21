import type { ExternalResource } from '@/components/education/ExternalResourceCard'

/**
 * Curated outbound links — short teasers only; full articles live on source sites.
 * ~10 resources per topic; reviewed for reputable publishers (not exhaustive web crawl).
 */
export const EXTERNAL_EDUCATION_RESOURCES: ExternalResource[] = [
  // —— Safety (10) ——
  {
    id: 'ext-safety-ssc-rack',
    category: 'Safety',
    title: 'Why SSC and RACK Are Both Important Safety Acronyms to Know',
    url: 'https://submissiveguide.com/articles/safety/why-ssc-and-rack-are-both-important-safety-acronyms-to-know/',
    source: 'Submissive Guide',
    teaser:
      'Compares Safe-Sane-Consensual with Risk-Aware Consensual Kink so you can pick a framework that matches your experience level and scene intensity.',
  },
  {
    id: 'ext-safety-basics-ssc',
    category: 'Safety',
    title: 'BDSM Basics: Staying Safe with SSC',
    url: 'https://submissiveguide.com/safety/articles/bdsm-basics-staying-safe',
    source: 'Submissive Guide',
    teaser:
      'A practical primer on applying SSC in real scenes—vetting partners, setting limits, and building habits before you escalate intensity.',
  },
  {
    id: 'ext-safety-informed-consent',
    category: 'Safety',
    title: "What's Informed Consent and Why Is It Important In BDSM?",
    url: 'https://bdsmtrainingacademy.com/whats-informed-consent-and-why-is-it-important-in-bdsm/',
    source: 'BDSM Training Academy',
    teaser:
      'Explains informed consent as an ongoing process, not a checkbox—useful when you want language that bridges safety and negotiation.',
  },
  {
    id: 'ext-safety-ssc-rack-vetting',
    category: 'Safety',
    title: 'BDSM Safety — SSC, RACK, Negotiations, and Vetting',
    url: 'https://ontariokink.com/thinking-safety-ssc-rack-negotiations-vetting/',
    source: 'Ontario Kink',
    teaser:
      'Walks through vetting questions and negotiation habits alongside SSC/RACK so community newcomers know what to ask before private play.',
  },
  {
    id: 'ext-safety-ssc-vs-rack',
    category: 'Safety',
    title: 'SSC vs RACK: BDSM Safety Frameworks Explained',
    url: 'https://www.bemorekinky.com/blog/bdsm-fundamentals/boundaries-and-consent/ssc-vs-rack-bdsm-safety-frameworks',
    source: 'Be More Kinky',
    teaser:
      'Side-by-side breakdown of when each framework shines, with examples that help couples align on acceptable risk before gear comes out.',
  },
  {
    id: 'ext-safety-crash-restraint',
    category: 'Safety',
    title: 'Crash Restraint — Rope Bondage Course',
    url: 'https://crash-restraint.com/ties',
    source: 'Crash Restraint',
    teaser:
      'Free step-by-step rope lessons focused on anatomy-aware tying—strong starting point if impact play is familiar but rope is new to you.',
  },
  {
    id: 'ext-safety-remedial-ropes',
    category: 'Safety',
    title: 'Bondage Safety',
    url: 'https://www.remedialropes.com/',
    source: 'Remedial Ropes / Twisted Windows',
    teaser:
      'Deep reference on nerve zones, circulation checks, and emergency release—bookmark before your first harness or suspension study.',
  },
  {
    id: 'ext-safety-self-bondage',
    category: 'Safety',
    title: 'Self-Bondage Safety Intro',
    url: 'https://www.twistedwindows.com/articles/self-bondage-safety-intro',
    source: 'Twisted Windows',
    teaser:
      'Covers why solo rope is high-risk and which redundant release plans matter—essential harm-reduction if you experiment alone.',
  },
  {
    id: 'ext-safety-scarleteen-ssc',
    category: 'Safety',
    title: 'BDSM Basics: Safe, Sane and Consensual',
    url: 'https://www.scarleteen.com/article/advice/bdsm_basics_safe_sane_and_consensual',
    source: 'Scarleteen',
    teaser:
      'Youth-friendly, consent-forward introduction to SSC with plain language—good to share with partners new to kink vocabulary.',
  },
  {
    id: 'ext-safety-ncsf-consent-counts',
    category: 'Safety',
    title: 'Consent Counts',
    url: 'https://ncsfreedom.org/consent-counts/',
    source: 'NCSF',
    teaser:
      'National Coalition for Sexual Freedom overview of consent advocacy and legal reform—context for why community safety norms exist.',
  },

  // —— Consent (10) ——
  {
    id: 'ext-consent-norms-study',
    category: 'Consent',
    title: 'Consent Norms in the BDSM Community: Strong But Not Inflexible',
    url: 'https://link.springer.com/article/10.1007/s10508-024-03038-6',
    source: 'Archives of Sexual Behavior',
    teaser:
      'Peer-reviewed look at how kink communities negotiate consent differently in new play vs long-term relationships—grounded, not sensational.',
  },
  {
    id: 'ext-consent-checklist',
    category: 'Consent',
    title: 'BDSM Checklist Guide: Yes/No/Maybe, Aftercare, and Safety',
    url: 'https://www.lovense.com/sex-blog/kink-bdsm/bdsm-checklist-tips',
    source: 'Lovense Blog',
    teaser:
      'Template-style yes/no/maybe lists with prompts for limits, safewords, and aftercare—handy printout before a first scene with a new partner.',
  },
  {
    id: 'ext-consent-healthline',
    category: 'Consent',
    title: 'BDSM: Safe Words, Consent, and Boundaries',
    url: 'https://www.healthline.com/health/bdsm-consent-safe-words',
    source: 'Healthline',
    teaser:
      'Mainstream-health explainer on safewords, withdrawal of consent, and check-ins—useful when one partner is kink-curious but risk-averse.',
  },
  {
    id: 'ext-consent-subguide-meaning',
    category: 'Consent',
    title: 'What Does Consent Mean?',
    url: 'https://submissiveguide.com/fundamentals/articles/what-does-consent-mean',
    source: 'Submissive Guide',
    teaser:
      'Defines enthusiastic, informed consent in D/s contexts with examples of gray areas—helps subs advocate without breaking scene headspace.',
  },
  {
    id: 'ext-consent-enthusiastic',
    category: 'Consent',
    title: 'What Is Enthusiastic Consent?',
    url: 'https://www.plannedparenthood.org/learn/relationships/sexual-consent/what-is-enthusiastic-consent',
    source: 'Planned Parenthood',
    teaser:
      'Clear vanilla-world framing of enthusiastic consent that pairs well with kink negotiation—good baseline before adding power exchange.',
  },
  {
    id: 'ext-consent-ncsf-cases',
    category: 'Consent',
    title: 'Consent Legal Cases',
    url: 'https://ncsfreedom.org/consent-legal-cases-3/',
    source: 'NCSF',
    teaser:
      'Case summaries showing how courts have treated BDSM consent—read alongside play negotiation so legal reality informs your boundaries.',
  },
  {
    id: 'ext-consent-subguide-negotiating',
    category: 'Consent',
    title: 'Negotiating Consent for BDSM Play',
    url: 'https://submissiveguide.com/safety/articles/negotiating-consent-for-bdsm-play',
    source: 'Submissive Guide',
    teaser:
      'Step-by-step negotiation flow from limits to safewords—practical script before scenes where enthusiasm must stay explicit.',
  },
  {
    id: 'ext-consent-womens-health',
    category: 'Consent',
    title: 'Everything You Need to Know About BDSM and Consent',
    url: 'https://www.womenshealthmag.com/relationships/a19934167/bdsm-consent/',
    source: "Women's Health",
    teaser:
      'Accessible magazine piece on negotiating kink with a partner—low jargon, good for sharing with someone outside the community.',
  },
  {
    id: 'ext-consent-goodmenproject',
    category: 'Consent',
    title: 'Enthusiastic Consent Means Asking, Not Guessing',
    url: 'https://goodmenproject.com/featured-content/enthusiastic-consent-means-asking-not-guessing-bbab/',
    source: 'Good Men Project',
    teaser:
      'Essay-style reminder that guessing is not consent—useful for dominants building check-in habits without killing momentum.',
  },
  {
    id: 'ext-consent-psychology-today-cnc',
    category: 'Consent',
    title: 'Rising Interest in Consensual Non-Consent',
    url: 'https://www.psychologytoday.com/us/blog/the-polyamorists-next-door/202502/rising-interest-in-consensual-non-consent',
    source: 'Psychology Today',
    teaser:
      'Thoughtful overview of CNC fantasy vs practice—read before exploring edge play so fantasy, ethics, and law stay separated.',
  },

  // —— Techniques (10) ——
  {
    id: 'ext-tech-twisted-monk-videos',
    category: 'Techniques',
    title: 'Free Bondage Rope Tutorials: Getting Started Videos',
    url: 'https://www.twistedmonk.com/pages/how-to-videos',
    source: 'Twisted Monk',
    teaser:
      'Video library for column ties, harnesses, and cuffs from a well-known rope educator—pair with anatomy safety guides before improvising.',
  },
  {
    id: 'ext-tech-crash-course',
    category: 'Techniques',
    title: 'Crash Restraint Topology Course',
    url: 'https://crash-restraint.com/ties',
    source: 'Crash Restraint',
    teaser:
      'Structured progression from single-column ties to complex patterns with safety callouts throughout each lesson.',
  },
  {
    id: 'ext-tech-subguide-ropetips',
    category: 'Techniques',
    title: 'Rope Bondage Basics',
    url: 'https://submissiveguide.com/techniques/articles/rope-bondage-basics',
    source: 'Submissive Guide',
    teaser:
      'Written intro to rope types, tension, and beginner ties—good when you want text instructions instead of video pausing.',
  },
  {
    id: 'ext-tech-subguide-impact',
    category: 'Techniques',
    title: 'Impact Play Basics',
    url: 'https://submissiveguide.com/techniques/articles/impact-play-basics',
    source: 'Submissive Guide',
    teaser:
      'Covers floggers, paddles, and pacing for tops new to striking—emphasizes warmup, target zones, and sub feedback.',
  },
  {
    id: 'ext-tech-subguide-sensation',
    category: 'Techniques',
    title: 'Sensation Play Ideas',
    url: 'https://submissiveguide.com/techniques/articles/sensation-play-ideas',
    source: 'Submissive Guide',
    teaser:
      'Non-impact sensation prompts—temperature, texture, and blindfolds—for scenes when impact is off the table.',
  },
  {
    id: 'ext-tech-kink-academy',
    category: 'Techniques',
    title: 'Kink Academy — Technique Library',
    url: 'https://www.kinkacademy.com/',
    source: 'Kink Academy',
    teaser:
      'Subscription video school with scene demos across rope, impact, and fetish skills—use trailers/free samples to scope instructors.',
  },
  {
    id: 'ext-tech-bdsm-encyclopedia-bondage',
    category: 'Techniques',
    title: 'Bondage — BDSM Encyclopedia',
    url: 'https://bdsm-encyclopedia.com/en/bondage/',
    source: 'BDSM Encyclopedia',
    teaser:
      'Glossary-style reference on bondage categories and common terms—quick lookup when a party invitation lists unfamiliar tags.',
  },
  {
    id: 'ext-tech-bdsm-encyclopedia-impact',
    category: 'Techniques',
    title: 'Impact Play — BDSM Encyclopedia',
    url: 'https://bdsm-encyclopedia.com/en/impact-play/',
    source: 'BDSM Encyclopedia',
    teaser:
      'Defines implements and play styles with neutral definitions—helpful when negotiating a party’s “impact only” rules.',
  },
  {
    id: 'ext-tech-twisted-monk-learn-more',
    category: 'Techniques',
    title: 'Want to Learn More? (Twisted Monk)',
    url: 'https://www.twistedmonk.com/pages/want-to-learn-more',
    source: 'Twisted Monk',
    teaser:
      'Roadmap to books, classes, and kits from a major rope vendor—use to find in-person education near you.',
  },
  {
    id: 'ext-tech-healthline-submission-tips',
    category: 'Techniques',
    title: "Sexual Submission Isn't Just Extreme Kink Play: 23 Tips",
    url: 'https://www.healthline.com/health/healthy-sex/sexual-submission',
    source: 'Healthline',
    teaser:
      'Beginner-oriented D/s tips spanning communication and pacing—not a scene manual, but solid if power exchange is new.',
  },

  // —— Community (10) ——
  {
    id: 'ext-community-munch-etiquette',
    category: 'Community',
    title: 'Munch Etiquette',
    url: 'https://sincitydsnetwork.com/2018/04/munch-etiquette-2/',
    source: 'Sin City D/s Network',
    teaser:
      'What to wear, how to introduce yourself, and how to respect hosts at restaurant munches—reduces first-timer anxiety.',
  },
  {
    id: 'ext-community-all-about-munches',
    category: 'Community',
    title: 'All About Munches',
    url: 'http://ontariokink.com/all-about-munches/',
    source: 'Ontario Kink',
    teaser:
      'Explains munch formats, hosting norms, and why public venues matter for safer vetting before private invites.',
  },
  {
    id: 'ext-community-subguide-protocols',
    category: 'Community',
    title: 'Entering the Community: General Protocols in Public',
    url: 'https://submissiveguide.com/fundamentals/articles/entering-the-community-understanding-and-following-general-protocols-in-public',
    source: 'Submissive Guide',
    teaser:
      'Covers titles, greetings, and public D/s etiquette so you do not accidentally offend elders at your first dungeon night.',
  },
  {
    id: 'ext-community-out-finding-love',
    category: 'Community',
    title: 'How Kinky People Can Find Love and Community',
    url: 'https://www.out.com/relationships/kinky-people-can-find-love',
    source: 'Out',
    teaser:
      'Journalistic look at apps, munches, and queer kink spaces—helpful for LGBTQ+ readers hunting inclusive entry points.',
  },
  {
    id: 'ext-community-ptc-munch',
    category: 'Community',
    title: 'Munch (Kink Dictionary)',
    url: 'https://www.progressivetherapeutic.com.au/sex-kink-dictionary/munch',
    source: 'Progressive Therapeutic Collective',
    teaser:
      'Therapist-written definition of munches with mental-health framing—good primer to send a supportive but vanilla friend.',
  },
  {
    id: 'ext-community-subguide-finding',
    category: 'Community',
    title: 'Finding a BDSM Community',
    url: 'https://submissiveguide.com/community/articles/finding-a-bdsm-community',
    source: 'Submissive Guide',
    teaser:
      'Practical steps for locating local groups online and offline, with red flags to watch for in shady organizers.',
  },
  {
    id: 'ext-community-subguide-munch-first',
    category: 'Community',
    title: 'Attending Your First Munch',
    url: 'https://submissiveguide.com/community/articles/attending-your-first-munch',
    source: 'Submissive Guide',
    teaser:
      'Checklist for first-timers: what to bring, how long to stay, and how to bow out politely if the vibe is wrong.',
  },
  {
    id: 'ext-community-wisdom-munches',
    category: 'Community',
    title: 'Munches & Community Events',
    url: 'https://www.wisdomforbdsm.com/munches-community-events',
    source: 'Wisdom for BDSM',
    teaser:
      'Overview of event types from munches to play parties—helps you pick the right first event instead of jumping to a dungeon.',
  },
  {
    id: 'ext-community-ncsf-about',
    category: 'Community',
    title: 'About NCSF — Community Defense',
    url: 'https://ncsfreedom.org/about-us/',
    source: 'NCSF',
    teaser:
      'How the National Coalition for Sexual Freedom supports kink organizers and attendees facing discrimination or legal threats.',
  },
  {
    id: 'ext-community-fetlife-safety',
    category: 'Community',
    title: 'FetLife Community Guidelines',
    url: 'https://fetlife.com/guidelines/community',
    source: 'FetLife',
    teaser:
      'Platform rules and reporting norms for the largest kink social network—read before using it to find local munches.',
  },

  // —— Resources (10) ——
  {
    id: 'ext-resources-bdsm-encyclopedia',
    category: 'Resources',
    title: 'BDSM Encyclopedia Home',
    url: 'https://bdsm-encyclopedia.com/en/',
    source: 'BDSM Encyclopedia',
    teaser:
      'Searchable wiki of roles, gear, and scene types—bookmark when event flyers use shorthand you do not recognize.',
  },
  {
    id: 'ext-resources-subguide-glossary',
    category: 'Resources',
    title: 'BDSM Glossary of Terms',
    url: 'https://submissiveguide.com/fundamentals/articles/bdsm-glossary-of-terms',
    source: 'Submissive Guide',
    teaser:
      'Alphabetical kink vocabulary with plain definitions—fast way to align language before negotiation.',
  },
  {
    id: 'ext-resources-kink-academy',
    category: 'Resources',
    title: 'Kink Academy',
    url: 'https://www.kinkacademy.com/',
    source: 'Kink Academy',
    teaser:
      'Paid video hub aggregating educators across specialties—useful when you want structured courses instead of random tube clips.',
  },
  {
    id: 'ext-resources-ncsf-legal',
    category: 'Resources',
    title: 'Legal Resources — NCSF',
    url: 'https://ncsfreedom.org/legal-resources/',
    source: 'NCSF',
    teaser:
      'Know-your-rights packets and attorney referrals for kink-related legal trouble—keep saved even if you only attend munches.',
  },
  {
    id: 'ext-resources-tashra',
    category: 'Resources',
    title: 'TASHRA — Kink Health Research',
    url: 'https://www.tashra.org/',
    source: 'TASHRA',
    teaser:
      'Research alliance publishing data on kink and healthcare—cite when talking to doctors or therapists about your lifestyle.',
  },
  {
    id: 'ext-resources-dr-kolmes',
    category: 'Resources',
    title: 'Kink-Aware and Poly Affirmative Psychotherapy',
    url: 'https://drkkolmes.com/kink-and-poly-psychotherapy/',
    source: 'Dr. Keely Kolmes',
    teaser:
      'Explains what kink-aware therapy looks like and links to referral lists—starting point if you need professional support.',
  },
  {
    id: 'ext-resources-scarleteen-abuse-vs-kink',
    category: 'Resources',
    title: '50 Shades of BS — Kink vs Abuse',
    url: 'https://www.scarleteen.com/blog/joey/2013/09/02/50_shades_of_bs_how_to_tell_the_difference_between_kink_and_abuse',
    source: 'Scarleteen',
    teaser:
      'Checklist distinguishing consensual power exchange from coercion—share with friends who only know kink from mainstream fiction.',
  },
  {
    id: 'ext-resources-wisdom-home',
    category: 'Resources',
    title: 'Wisdom for BDSM',
    url: 'https://www.wisdomforbdsm.com/',
    source: 'Wisdom for BDSM',
    teaser:
      'Article hub spanning safety, relationships, and gear—good Sunday-reading site to supplement event-specific education.',
  },
  {
    id: 'ext-resources-loving-bdsm',
    category: 'Resources',
    title: 'Loving BDSM — Resource Library',
    url: 'https://lovingbdsm.com/resources/',
    source: 'Loving BDSM',
    teaser:
      'Long-running blog’s indexed guides on D/s dynamics, rituals, and long-distance power exchange.',
  },
  {
    id: 'ext-resources-bdsmrights',
    category: 'Resources',
    title: 'BDSM Rights — Know Your Rights',
    url: 'https://bdsmrights.com/',
    source: 'BDSM Rights',
    teaser:
      'Grassroots legal education site summarizing assault/consent issues by jurisdiction—pair with NCSF for US-focused depth.',
  },

  // —— Education (10) ——
  {
    id: 'ext-edu-scarleteen-abuse-kink',
    category: 'Education',
    title: 'Kink vs Abuse (Scarleteen)',
    url: 'https://www.scarleteen.com/blog/joey/2013/09/02/50_shades_of_bs_how_to_tell_the_difference_between_kink_and_abuse',
    source: 'Scarleteen',
    teaser:
      'Foundational ethics piece for beginners coming from pop-culture portrayals—sets expectations before attending first parties.',
  },
  {
    id: 'ext-edu-healthline-submission',
    category: 'Education',
    title: 'Sexual Submission: 23 Tips for Beginners',
    url: 'https://www.healthline.com/health/healthy-sex/sexual-submission',
    source: 'Healthline',
    teaser:
      'Introduces roles, safewords, and pacing without assuming prior dungeon experience—friendly for curious vanilla partners.',
  },
  {
    id: 'ext-edu-freelife-intro',
    category: 'Education',
    title: 'Intro to BDSM',
    url: 'https://www.freelifebh.com/blog/intro-to-bdsm',
    source: 'Freelife Behavioral Health',
    teaser:
      'Therapist-written 101 on consent, negotiation, and aftercare—bridges clinical language with community norms.',
  },
  {
    id: 'ext-edu-cypress-101',
    category: 'Education',
    title: 'BDSM 101: The Essentials for a Healthy Practice',
    url: 'https://www.cypresswellnesscenter.com/post/bdsm-101-the-essentials-for-a-healthy-practice',
    source: 'Cypress Wellness Center',
    teaser:
      'Wellness-clinic post on healthy BDSM habits—useful when you want a provider-toned article to share with a hesitant partner.',
  },
  {
    id: 'ext-edu-who-beginners',
    category: 'Education',
    title: 'Bondage and BDSM for Beginners',
    url: 'https://www.who.com.au/lifestyle/beauty/bondage-bdsm-for-beginners/',
    source: 'WHO Australia',
    teaser:
      'Sexologist Q&A covering myths, gear, and first steps—magazine style, low shame, good for absolute newcomers.',
  },
  {
    id: 'ext-edu-subguide-what-is-bdsm',
    category: 'Education',
    title: 'What is BDSM?',
    url: 'https://submissiveguide.com/fundamentals/articles/what-is-bdsm',
    source: 'Submissive Guide',
    teaser:
      'Defines the acronym, common roles, and scene flow in one article—send before your partner reads fifty conflicting Reddit threads.',
  },
  {
    id: 'ext-edu-subguide-myths',
    category: 'Education',
    title: 'BDSM Myths and Facts',
    url: 'https://submissiveguide.com/fundamentals/articles/bdsm-myths-and-facts',
    source: 'Submissive Guide',
    teaser:
      'Debunks pathology myths and media stereotypes—handy when family or friends assume kink equals abuse.',
  },
  {
    id: 'ext-edu-bemorekinky-fundamentals',
    category: 'Education',
    title: 'BDSM Fundamentals Blog Hub',
    url: 'https://www.bemorekinky.com/blog/bdsm-fundamentals',
    source: 'Be More Kinky',
    teaser:
      'Indexed beginner articles on boundaries, roles, and safety frameworks—pick topics à la carte while exploring interests.',
  },
  {
    id: 'ext-edu-psychpost-wellbeing',
    category: 'Education',
    title: 'Sexual Well-Being in BDSM Subcultures',
    url: 'https://www.psypost.org/new-study-explores-what-drives-sexual-well-being-in-bdsm-and-kink-subcultures/',
    source: 'PsyPost',
    teaser:
      'Summarizes research on wellbeing in kink communities—counters “damaged people” narratives with data.',
  },
  {
    id: 'ext-edu-kink-academy-free',
    category: 'Education',
    title: 'Free Classes at Kink Academy',
    url: 'https://www.kinkacademy.com/classes/free',
    source: 'Kink Academy',
    teaser:
      'Rotating free lessons from vetted educators—low-commitment way to sample teaching styles before subscribing.',
  },

  // —— Identity (10) ——
  {
    id: 'ext-identity-switch-sage',
    category: 'Identity',
    title: '“Switch it up”: A Qualitative Analysis of BDSM Switches',
    url: 'https://journals.sagepub.com/doi/10.1177/13634607241305967',
    source: 'Sexualities (SAGE)',
    teaser:
      'Academic study of switch identity beyond the dom/sub binary—insightful if you feel pressure to “pick a side.”',
  },
  {
    id: 'ext-identity-switch-pubmed',
    category: 'Identity',
    title: 'BDSM Role Fluidity: Switches Within Dominant/Submissive Binaries',
    url: 'https://pubmed.ncbi.nlm.nih.gov/28854056/',
    source: 'PubMed',
    teaser:
      'Mixed-methods paper on how switches navigate gendered role expectations—cite when discussing inclusive party roles.',
  },
  {
    id: 'ext-identity-metro-switch',
    category: 'Identity',
    title: 'What Is a Switch and How to Be One',
    url: 'https://metro.co.uk/2022/11/10/what-is-a-switch-and-how-to-be-one-in-the-bedroom-17729537/',
    source: 'Metro',
    teaser:
      'Accessible explainer on switch dynamics and communication—good share link for partners who only know fixed roles.',
  },
  {
    id: 'ext-identity-subguide-switch',
    category: 'Identity',
    title: 'What Is a Switch?',
    url: 'https://submissiveguide.com/fundamentals/articles/what-is-a-switch',
    source: 'Submissive Guide',
    teaser:
      'Community-voice article on enjoying both sides of the slash—includes tips for negotiating role changes mid-relationship.',
  },
  {
    id: 'ext-identity-subguide-dom-sub',
    category: 'Identity',
    title: 'Dominant vs Submissive — Which Are You?',
    url: 'https://submissiveguide.com/fundamentals/articles/dominant-vs-submissive-which-are-you',
    source: 'Submissive Guide',
    teaser:
      'Self-reflection prompts without forcing labels—helpful journaling before filling out dating-site role fields.',
  },
  {
    id: 'ext-identity-autostraddle-kink',
    category: 'Identity',
    title: 'Kink and Queer Identity (Autostraddle archive)',
    url: 'https://www.autostraddle.com/tag/kink/',
    source: 'Autostraddle',
    teaser:
      'Tag archive of queer writers on kink, power exchange, and intersectionality—browse essays that mirror East Coast queer scenes.',
  },
  {
    id: 'ext-identity-them-kink',
    category: 'Identity',
    title: 'Kink & Fetish Stories — Them',
    url: 'https://www.them.us/tags/kink',
    source: 'Them',
    teaser:
      'LGBTQ+ media coverage of kink culture and politics—context for how public perception affects closeted community members.',
  },
  {
    id: 'ext-identity-huffpost-madison-young',
    category: 'Identity',
    title: '50 Shades of Submission: Interview with Madison Young',
    url: 'https://www.huffpost.com/entry/madison-young-submission_b_1384294',
    source: 'HuffPost',
    teaser:
      'Performer perspective on submission as craft and identity—not a how-to, but humanizing for subs exploring persona.',
  },
  {
    id: 'ext-identity-psychology-today-kink',
    category: 'Identity',
    title: 'The Psychology of Kink',
    url: 'https://www.psychologytoday.com/us/blog/the-polyamorists-next-door/201310/the-psychology-of-kink',
    source: 'Psychology Today',
    teaser:
      'Clinical psychologist reframes kink as variant sexuality rather than disorder—useful when battling internalized shame.',
  },
  {
    id: 'ext-identity-subguide-feminist-sub',
    category: 'Identity',
    title: 'Can You Be a Feminist and a Submissive?',
    url: 'https://submissiveguide.com/fundamentals/articles/can-you-be-a-feminist-and-a-submissive',
    source: 'Submissive Guide',
    teaser:
      'Addresses agency, choice, and power exchange for subs who worry feminism and submission conflict.',
  },

  // —— Aftercare (10) ——
  {
    id: 'ext-aftercare-lascivity-drop',
    category: 'Aftercare',
    title: 'Dealing with the Drop — A Guide to Aftercare',
    url: 'https://www.lascivity.co.uk/guide-to-aftercare/',
    source: 'Lascivity',
    teaser:
      'Explains sub drop symptoms and partner aftercare rituals with concrete comfort ideas you can pack in a scene bag.',
  },
  {
    id: 'ext-aftercare-bound-together',
    category: 'Aftercare',
    title: 'What Is Sub/Dom Drop in BDSM?',
    url: 'https://bound-together.net/sub-dom-drop-bdsm/',
    source: 'Bound Together',
    teaser:
      'Covers hormonal crash theory and top drop—helps dominants plan care for themselves, not only subs.',
  },
  {
    id: 'ext-aftercare-michelle-fego',
    category: 'Aftercare',
    title: 'Sub Drop and Aftercare',
    url: 'https://www.michellefegatofi.org/post/sub-drop-and-aftercare',
    source: 'Michelle Fegatofi',
    teaser:
      'Coach-style guidance on recognizing drop early and building aftercare plans before intense weekends.',
  },
  {
    id: 'ext-aftercare-pinkcherry-101',
    category: 'Aftercare',
    title: 'BDSM Aftercare 101',
    url: 'https://www.pinkcherry.com/blogs/pinkcherry-blog/bdsm-aftercare-101-why-do-you-need-it',
    source: 'PinkCherry',
    teaser:
      'Retail blog that still nails hydration, warmth, and reassurance basics—easy intro for partners new to post-scene care.',
  },
  {
    id: 'ext-aftercare-encyclopedia',
    category: 'Aftercare',
    title: 'Aftercare — BDSM Encyclopedia',
    url: 'https://bdsm-encyclopedia.com/en/aftercare/',
    source: 'BDSM Encyclopedia',
    teaser:
      'Neutral definition plus examples of physical and emotional aftercare—good shared vocabulary before negotiations.',
  },
  {
    id: 'ext-aftercare-subguide-basics',
    category: 'Aftercare',
    title: 'Aftercare Basics',
    url: 'https://submissiveguide.com/safety/articles/aftercare-basics',
    source: 'Submissive Guide',
    teaser:
      'Checklist-oriented aftercare for subs and tops with prompts for next-day check-ins—pair with your event weekend plans.',
  },
  {
    id: 'ext-aftercare-subguide-drop',
    category: 'Aftercare',
    title: 'Understanding Sub Drop',
    url: 'https://submissiveguide.com/safety/articles/understanding-sub-drop',
    source: 'Submissive Guide',
    teaser:
      'Goes deeper on timelines and self-care when a partner cannot provide aftercare—important for solo subs after casual play.',
  },
  {
    id: 'ext-aftercare-lovense-checklist',
    category: 'Aftercare',
    title: 'Aftercare Section — BDSM Checklist Guide',
    url: 'https://www.lovense.com/sex-blog/kink-bdsm/bdsm-checklist-tips',
    source: 'Lovense Blog',
    teaser:
      'Embeds aftercare prompts inside a full negotiation checklist—print once, cover consent and recovery together.',
  },
  {
    id: 'ext-aftercare-healthline',
    category: 'Aftercare',
    title: 'BDSM Aftercare: What It Is and Why It Matters',
    url: 'https://www.healthline.com/health/bdsm-aftercare',
    source: 'Healthline',
    teaser:
      'Mainstream medical tone on physical and emotional aftercare—shareable with healthcare providers supporting your kink life.',
  },
  {
    id: 'ext-aftercare-psychology-today',
    category: 'Aftercare',
    title: 'The Importance of Aftercare',
    url: 'https://www.psychologytoday.com/us/blog/the-polyamorists-next-door/201310/the-importance-of-aftercare',
    source: 'Psychology Today',
    teaser:
      'Psychologist explains bonding and nervous-system regulation after intense scenes—bridges kink practice with attachment theory.',
  },

  // —— Mental Health (10) ——
  {
    id: 'ext-mental-kolmes',
    category: 'Mental Health',
    title: 'Kink-Aware and Poly Affirmative Psychotherapy',
    url: 'https://drkkolmes.com/kink-and-poly-psychotherapy/',
    source: 'Dr. Keely Kolmes',
    teaser:
      'Defines kink-aware therapy and what to expect in session—starting point before searching provider directories.',
  },
  {
    id: 'ext-mental-tashra-home',
    category: 'Mental Health',
    title: 'TASHRA — Alternative Sexualities Health Research',
    url: 'https://www.tashra.org/',
    source: 'TASHRA',
    teaser:
      'Research and clinician training on kink populations—cite studies when pushing back on pathologizing therapists.',
  },
  {
    id: 'ext-mental-tashra-ethics',
    category: 'Mental Health',
    title: 'Bound by Ethics: Kink and Clinical Practice',
    url: 'https://www.tashra.org/event/bound-by-ethics-navigating-the-intersection-of-kink-and-clinical-practice/',
    source: 'TASHRA',
    teaser:
      'Professional ethics workshop description—shows what competent clinicians learn about kink (useful when vetting therapists).',
  },
  {
    id: 'ext-mental-ncsf-mental',
    category: 'Mental Health',
    title: 'NCSF — Mental Health Resources',
    url: 'https://ncsfreedom.org/mental-health-resources/',
    source: 'NCSF',
    teaser:
      'Advocacy org’s links on discrimination, outing, and therapist referrals—bookmark if workplace or custody issues arise.',
  },
  {
    id: 'ext-mental-psychology-kink',
    category: 'Mental Health',
    title: 'The Psychology of Kink',
    url: 'https://www.psychologytoday.com/us/blog/the-polyamorists-next-door/201310/the-psychology-of-kink',
    source: 'Psychology Today',
    teaser:
      'Summarizes research showing kink practitioners are not inherently traumatized—helpful self-advocacy read before therapy intake.',
  },
  {
    id: 'ext-mental-psychpost-wellbeing',
    category: 'Mental Health',
    title: 'Sexual Well-Being in BDSM Subcultures (Study Summary)',
    url: 'https://www.psypost.org/new-study-explores-what-drives-sexual-well-being-in-bdsm-and-kink-subcultures/',
    source: 'PsyPost',
    teaser:
      'Plain-language recap of wellbeing research in kink communities—ammo against “you need to be fixed” narratives.',
  },
  {
    id: 'ext-mental-subguide-therapy',
    category: 'Mental Health',
    title: 'Finding a Kink-Aware Therapist',
    url: 'https://submissiveguide.com/community/articles/finding-a-kink-aware-therapist',
    source: 'Submissive Guide',
    teaser:
      'Interview questions and red flags when screening therapists—practical script you can reuse on Psychology Today listings.',
  },
  {
    id: 'ext-mental-wisdom-mental',
    category: 'Mental Health',
    title: 'BDSM and Mental Health',
    url: 'https://www.wisdomforbdsm.com/bdsm-mental-health',
    source: 'Wisdom for BDSM',
    teaser:
      'Community article on depression, anxiety, and scene pacing—not medical advice, but good discussion starter with partners.',
  },
  {
    id: 'ext-mental-freelife-intro',
    category: 'Mental Health',
    title: 'Intro to BDSM (Therapeutic Framing)',
    url: 'https://www.freelifebh.com/blog/intro-to-bdsm',
    source: 'Freelife Behavioral Health',
    teaser:
      'Clinic blog framing BDSM as consensual exploration with mental-health guardrails—share with therapists new to kink clients.',
  },
  {
    id: 'ext-mental-pt-jaxx',
    category: 'Mental Health',
    title: 'Kink-Aware Therapist Listing Example',
    url: 'https://www.psychologytoday.com/us/therapists/jaxx-alutalica-san-francisco-ca/244314',
    source: 'Psychology Today',
    teaser:
      'Sample profile showing NCSF-aligned credentials—use as a template for what to look for in provider bios.',
  },

  // —— Legal (10) ——
  {
    id: 'ext-legal-ncsf-cases',
    category: 'Legal',
    title: 'Consent Legal Cases — NCSF',
    url: 'https://ncsfreedom.org/consent-legal-cases-3/',
    source: 'NCSF',
    teaser:
      'Summaries of US cases where BDSM consent failed as a defense— sober reading before edge play or public play.',
  },
  {
    id: 'ext-legal-ncsf-resources',
    category: 'Legal',
    title: 'Legal Resources — NCSF',
    url: 'https://ncsfreedom.org/legal-resources/',
    source: 'NCSF',
    teaser:
      'Packets on assault law, custody, and workplace discrimination—download before organizing events in conservative jurisdictions.',
  },
  {
    id: 'ext-legal-ncsf-consent-counts',
    category: 'Legal',
    title: 'Consent Counts Campaign',
    url: 'https://ncsfreedom.org/consent-counts/',
    source: 'NCSF',
    teaser:
      'Explains Model Penal Code reform for explicit prior permission—shows how community advocacy connects to law reform.',
  },
  {
    id: 'ext-legal-ncsf-mpc',
    category: 'Legal',
    title: 'Model Penal Code — Explicit Prior Permission (PDF)',
    url: 'https://ncsfreedom.org/wp-content/uploads/2021/07/MPC-on-SA-213.10-with-Comments-and-Summary.pdf',
    source: 'NCSF',
    teaser:
      'Primary-source summary of proposed affirmative-defense language—dense but definitive for policy nerds and organizers.',
  },
  {
    id: 'ext-legal-bdsmrights',
    category: 'Legal',
    title: 'BDSM Rights — Legal Overview',
    url: 'https://bdsmrights.com/',
    source: 'BDSM Rights',
    teaser:
      'Grassroots site tracking how consensual BDSM is treated under criminal law—quick jurisdiction scan before traveling.',
  },
  {
    id: 'ext-legal-cbc-canada',
    category: 'Legal',
    title: 'BDSM in Canada: 50 Shades of Legal Grey',
    url: 'https://www.cbc.ca/news/canada/bdsm-in-canada-is-50-shades-of-legal-grey-1.2969194',
    source: 'CBC News',
    teaser:
      'Journalism on Canadian precedent treating consensual pain as assault—essential for East Coast travelers heading north.',
  },
  {
    id: 'ext-legal-subguide-law',
    category: 'Legal',
    title: 'BDSM and the Law',
    url: 'https://submissiveguide.com/safety/articles/bdsm-and-the-law',
    source: 'Submissive Guide',
    teaser:
      'Plain-language overview of legal risks and documentation habits—good primer before signing dungeon waivers.',
  },
  {
    id: 'ext-legal-scarleteen-abuse-law',
    category: 'Legal',
    title: 'Kink vs Abuse — Legal and Ethical Lines',
    url: 'https://www.scarleteen.com/blog/joey/2013/09/02/50_shades_of_bs_how_to_tell_the_difference_between_kink_and_abuse',
    source: 'Scarleteen',
    teaser:
      'Teen-focused but sharp on coercion vs consent—useful when explaining why “they agreed in the bedroom” is not always a legal defense.',
  },
  {
    id: 'ext-legal-aclu-kink',
    category: 'Legal',
    title: 'ACLU — LGBTQ Rights & Sexual Freedom (context)',
    url: 'https://www.aclu.org/issues/lgbtq-rights',
    source: 'ACLU',
    teaser:
      'Civil-liberties framing for sexual expression advocacy—background for why kink visibility ties to broader LGBTQ legal fights.',
  },
  {
    id: 'ext-legal-eff-digital',
    category: 'Legal',
    title: 'Digital Privacy at Events and Online (EFF)',
    url: 'https://www.eff.org/issues/privacy',
    source: 'Electronic Frontier Foundation',
    teaser:
      'Privacy rights primer—relevant when dungeons ban phones or when FetLife data leaks affect local community safety.',
  },
]

export function getExternalResourcesForCategory(category: string): ExternalResource[] {
  return EXTERNAL_EDUCATION_RESOURCES.filter((r) => r.category === category)
}

export function getAllExternalResourceCategories(): string[] {
  const set = new Set(EXTERNAL_EDUCATION_RESOURCES.map((r) => r.category))
  return Array.from(set)
}
