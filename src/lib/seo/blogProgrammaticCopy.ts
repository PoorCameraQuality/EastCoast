import { EAST_COAST_STATES, type StateSlug } from '@/lib/eastCoastStates'
import { CITY_BY_SLUG, type CityEntry } from '@/lib/discoveryCityRegistry'

export type BlogProgrammaticSections = {
  h1: string
  lead: string
  intro: string[]
  main: string[]
  practical: string[]
  cta: string
}

function stateName(slug: StateSlug): string {
  return EAST_COAST_STATES[slug].name
}

function stateAbbr(slug: StateSlug): string {
  return EAST_COAST_STATES[slug].abbr
}

/** Long-form programmatic guide: BDSM events in {state}. */
export function buildStateEventsGuideCopy(stateSlug: StateSlug): BlogProgrammaticSections {
  const name = stateName(stateSlug)
  const abbr = stateAbbr(stateSlug)
  const year = new Date().getFullYear()

  const intro = [
    `Looking for BDSM dungeons and kink-friendly events in ${name}? This guide is written for adults who want a realistic picture of how ${name}'s communities find each other, what "fetish venue" and "dungeon" often mean in practice, and how to move from curiosity to showing up at something well-run and consent-forward.`,
    `Across ${name} (${abbr}), you will find a mix of private membership clubs, rental studios that host classes and parties, weekend conventions that draw regional crowds, and smaller social munches in cafes. None of that replaces your own judgment—but it does mean you are not starting from zero. Local calendars exist because people have spent years building trust, safety norms, and repeat gatherings.`,
    `If your search started with phrases like **bdsm dungeons near me** or **kink clubs ${name}**, you are matching how many newcomers discover the scene: a mix of geographic hope and vague anxiety. The healthiest path is to pair online research with **in-person** accountability: organizers you can name, venues with rules, and classes where skills—not bravado—are the point.`,
  ]

  const main = [
    `**What counts as a "kink event" in ${name}?** Labels vary. A munch might look like any dinner meetup until you read the code of conduct. A workshop might spend two hours on negotiation without any public play. A dungeon night might combine social space, play furniture, and volunteer monitors ("dungeon masters") who enforce house safewords. Conventions bundle vending, education, and parties. Each format teaches different etiquette; skipping straight to the loudest option is rarely necessary.`,
    `**Fetish venues and East Coast travel.** ${name} sits in a broader Mid-Atlantic and Northeast corridor where people routinely cross state lines for a favorite teacher, vendor hall, or annual con. That is normal. It also means your "local" scene may be **regional** in practice—especially if you live outside a major metro. Use state and city discovery pages together rather than assuming one zip code holds every opportunity.`,
    `**Dungeons as physical anchors.** A serious dungeon or private club is more than a room with rings in the wall. It is often a **membership organization** with orientations, cleaning rotations, incident reporting, and long institutional memory. Those friction points—applications, fees, references—exist because privacy and liability are real. When a listing describes itself as members-only or private address, treat that as **information**, not exclusion for its own sake.`,
    `**Consent culture is the universal ticket.** Regardless of zip code, expect norms like: ask before touching people or their gear; do not interrupt scenes; photograph only where explicit opt-in rules allow; accept "no thanks" without debate. If someone tells you "real submissives do not use safewords" or pressures you to skip negotiation, that is a **red flag**, not advanced technique.`,
    `**Classes before complex play.** Rope suspension, heavy impact, fire, and breath-related play deserve structured instruction. Many ${name} adjacent events publish beginner tracks—sometimes labeled 101 or fundamentals. Shopping for toys before you understand nerve pathways or cleaning requirements is expensive in more than one sense; ethical **vendors** will still sell to you, but good ones will also steer you toward education first when risk is high.`,
    `**Privacy and discretion.** Not everyone can be out about kink. Protect other people's names, faces, and stories. Event photography rules exist to reduce **outing** risk. If you match with someone online before meeting at a venue, agree how you will recognize each other without broadcasting kink cues to bystanders.`,
    `**Substances and judgment.** Alcohol policies differ. Some spaces ban play while drinking; others allow moderate bar service away from play floors. Your personal line should err toward **clear consent**; if you would not sign a contract in that state, do not scene in it either.`,
    `**Finding rhythm over ${year}.** Instead of one frantic weekend, consider a ninety-day plan: one social event, one class, one larger gathering if it still feels right. Repeatability builds friendships; friendships build safer introductions to private spaces.`,
    `**When something goes wrong.** Document private notes, contact organizer emails or board members where appropriate, and prioritize your own safety if retaliation is a concern. Large events increasingly publish **consent support** contacts; smaller venues may route concerns through a board. Professional mental health support is not a betrayal of the scene—it is adult self-care.`,
    `**Economic reality.** Tickets, memberships, travel, and quality gear add up. Budget honestly; many communities also need volunteers for door, setup, or fundraising. Contributing time can be as valuable as spending money, and you learn the org chart faster.`,
    `**Signals of a healthy listing ecosystem.** When a platform links **articles**, **events**, **vendors**, and **dungeon** pages together, you can verify that a class teacher also appears near a vendor table at a recurring con, or that a venue’s rules match what organizers publish. That cross-linking is not “SEO tricks”—it is **accountability infrastructure** that anonymous threads cannot replicate.`,
    `**Boundaries around identity.** You do not owe strangers your legal name, employer, or trauma history to attend a munch. You do owe basic courtesy: show up when you RSVP when possible, cancel politely, and treat staff like people with finite energy.`,
    `**Measuring fit without drama.** If a group’s tone feels wrong after two visits, try a different format before you write off an entire region. ${name} has multiple entry points; the goal is **your** sustainable participation, not winning a popularity contest on night one.`,
  ]

  const practical = [
    `**Checklist before you RSVP:** Read the dress code, door times, ID requirements, and refund policy. Confirm whether the event is **18+** or **21+**. If you need accessibility information (stairs, seating, scent-free hours), email early—organizers can only accommodate needs they know about.`,
    `**At the door:** Have payment ready; be polite to volunteers; ask where orientations or quiet spaces are. If it is your first visit to a venue, say so—many offer a quick tour.`,
    `**During the event:** Default to watching unless you have negotiated otherwise. Keep conversations away from active scenes. Thank staff on the way out if you appreciated their work.`,
    `**Afterward:** Plan hydration, food, sleep, and emotional check-ins. Subdrop and top-drop can arrive late; treat them as normal physiology, not personal failure.`,
    `**Use platform tools intentionally:** Browse **upcoming BDSM events** filtered for ${name}, cross-link to **vendor** pages when you are ready to buy gear with care, and read **dungeon** listings to understand membership paths rather than guessing from anonymous forums.`,
  ]

  const cta = `Browse upcoming BDSM and kink events in ${name} on our discovery hub, then add a class or social to your calendar before you commit to high-intensity play.`

  return {
    h1: `BDSM Events, Kink Clubs, and Fetish Venues in ${name}`,
    lead: `Looking for BDSM dungeons in ${name}? This page-style guide lists how real communities find venues that host kink events, classes, and private sessions. These spaces are central to local networks and often provide structured environments for consent-forward play—when you choose events with clear rules and accountable leadership.`,
    intro,
    main,
    practical,
    cta,
  }
}

function cityEntry(slug: string): CityEntry {
  return CITY_BY_SLUG[slug]
}

/** Long-form programmatic guide: starting kink in {city}. */
export function buildCityStartGuideCopy(citySlug: string): BlogProgrammaticSections {
  const entry = cityEntry(citySlug)
  const display = entry.displayName
  const abbr = entry.stateAbbr
  const stateSlug = (Object.keys(EAST_COAST_STATES) as StateSlug[]).find(
    (s) => EAST_COAST_STATES[s].abbr === abbr
  )
  const stateNameResolved = stateSlug ? stateName(stateSlug) : abbr
  const year = new Date().getFullYear()

  const intro = [
    `**How to start BDSM in ${display}** is really three questions in one: how to learn without hurting yourself or others, how to find people who value consent, and how to connect classes, gear, and venues into a sustainable path. This guide assumes you are an adult, willing to slow down, and interested in communities that publish rules you can read before you walk in.`,
    `${display} sits in ${stateNameResolved} (${abbr}). Your practical scene may span the metro, nearby suburbs, and sometimes neighboring states—especially for weekend intensives or vendor-heavy conventions. That is not a bug; regional kink infrastructure has always been partly mobile.`,
    `If you began with searches like **how to start kink** or **kink clubs near ${display}**, you are in the same funnel as thousands of newcomers. The difference between a rocky start and a solid one is often **pacing**: more orientation, fewer anonymous DMs, and repeated attendance at accountable spaces.`,
  ]

  const main = [
    `**Start with skills and vocabulary.** Before you buy a wall of toys, spend time with negotiation language, limits, safewords, and aftercare. Many teachers in the ${display} region offer beginner workshops on consent, impact foundations, or rope safety. Those classes are also where you meet **repeat** faces—organizers, vendors, and dungeon staff who show up month after month.`,
    `**Social events are data.** Munches and meet-and-greets are low-pressure ways to observe group norms: how introductions work, how people discuss dynamics without imposing them on strangers, and which groups emphasize education versus party culture. Take notes mentally; you are learning **local flavor**, not universal truth.`,
    `**Play parties are not the only "real" kink.** Some people spend years in service-oriented or low-sensation dynamics. Others love performance and ritual. If your interests are narrow, that is fine. Compatibility matters more than breadth.`,
    `**Online spaces: useful and hazardous.** Apps and forums can announce events, but they also amplify **love-bombing**, **moving goalposts**, and **privacy leaks**. Prefer introductions that tie back to named events and venues you can verify independently.`,
    `**Gear shopping with a plan.** When you visit **vendors**—online or at events—bring questions about materials, cleaning, and intended use. A good seller will warn you away from the wrong implement for your current skill level. Budget for **quality** on items that affect circulation, breathing, or insertion; bargain-bin mystery materials are a false economy.`,
    `**Dungeons and studios as onboarding layers.** Some ${display}-area listings describe **membership** paths, orientations, or guest policies. Read them carefully. Private addresses and vetting steps exist to protect members and neighbors, not to gatekeep forever. If a space refuses all transparency about rules, ask yourself what accountability is left.`,
    `**Negotiation templates that scale.** Keep a phone note: activities on the table, intensity scale, body areas, safeword, aftercare needs, health considerations, and substance boundaries. For early scenes, **short** beats **sprawling**; one activity done well builds trust faster than a chaotic sampler platter.`,
    `**Aftercare for solo folks too.** Even if you arrive and leave alone, plan food, water, sleep, and a non-judgmental friend you can call without outing third parties. Emotional swings after intense experiences are common; naming them reduces shame.`,
    `**Red flags deserve hard stops.** Anyone who mocks your limits, discourages safewords, isolates you from friends, or pushes filming without negotiation is telling you who they are. Believe them early.`,
    `**${year} pacing suggestion:** Month one—two social or class events. Month two—repeat one group so people recognize you. Month three—consider a low-stakes scene with someone enthusiastic about beginners. Adjust if work, family, or mental health needs slower timing.`,
    `**East Coast context.** Fetish venues and educators along the coast often cross-pollinate: a presenter in one city may vend in another; a dungeon policy you like may mirror a club two states over. Reading **state-level** guides in addition to this city guide helps you see the wider map.`,
    `**Turning education into a funnel.** The point of long-form guides is not to keep you reading forever—it is to help you click through to **dated** event listings, **vetted** vendor pages, and **dungeon** onboarding that matches your risk tolerance. If a guide never points you toward accountable spaces, keep researching.`,
    `**Intersectional courtesy.** ${display} communities include LGBTQ+ folks, people of color, disabled kinksters, and neurodivergent attendees. Accessibility asks (seating, lighting, captioning) deserve proactive answers—or an honest “we cannot yet” with a timeline.`,
    `**Sustainability beats intensity.** The healthiest newcomers are often boring on paper: they hydrate, sleep, budget, and keep friendships outside the scene. Intensity without scaffolding leads to burnout; **boring** is how you stay for ${year} and beyond.`,
  ]

  const practical = [
    `**Week-before habits:** Sync your calendar with one recurring event series. Read a venue's code of conduct twice—once for rules, once for tone.`,
    `**Day-of habits:** Pack water, snacks, cash for door and tips, phone charger, and a layer for cold rooms. Arrive early enough to orient yourself without rushing.`,
    `**Conversation habits:** Introduce yourself with the name and pronouns you want used; ask others the same; avoid interrogating people about their kinks in line at the coat check.`,
    `**Post-event habits:** Journal privately, hydrate, and note what you might do differently. If you loved something, thank the organizer—small gratitude keeps volunteer ecosystems alive.`,
    `**Platform habits:** Bookmark **events** in ${stateNameResolved}, follow **dungeon** listings that serve ${display} travelers or residents, and revisit **vendor** pages when you have concrete questions—not just shopping dopamine.`,
  ]

  const cta = stateSlug
    ? `Start with our BDSM events discovery for ${stateNameResolved}, then pick a class or social within reach of ${display} before you invest in high-risk play.`
    : `Browse regional BDSM events and education, then choose a class or social near ${display} before you invest in high-risk play.`

  return {
    h1: `How to Start Exploring Kink and BDSM in ${display}`,
    lead: `This guide helps newcomers in ${display}, ${stateNameResolved} translate curiosity into consent-forward steps: classes, social events, vendors, and dungeon culture—without rushing past safety or negotiation.`,
    intro,
    main,
    practical,
    cta,
  }
}
