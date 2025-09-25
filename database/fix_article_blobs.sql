-- Fix "blob" content issues in articles
-- This addresses the root cause of articles displaying as giant text blobs

-- 1. First, let's see what we're working with
SELECT 
    id,
    title,
    slug,
    LENGTH(content) as content_length,
    CASE 
        WHEN content LIKE '%## %' THEN 'HAS_MARKDOWN_HEADINGS'
        WHEN content LIKE '%<p>%' THEN 'HAS_HTML'
        WHEN content LIKE '%|%' THEN 'HAS_TABLES'
        ELSE 'PLAIN_TEXT'
    END as content_type,
    LEFT(content, 200) as content_preview
FROM articles 
WHERE slug IN (
    'what-is-kap-directory-guide',
    'partner-abuse-in-kink-communities',
    'a-to-z-kinks-and-fetishes-guide',
    'sex-positive-kink-inclusive-websites-resources',
    'kink-orientation-vs-leisure-identity'
)
ORDER BY publish_date DESC;

-- 2. Fix the KAP article specifically (known problematic one)
UPDATE articles 
SET content = $$
# What Is Kink Aware Professionals (KAP) - And Why You Should Know About It

If you're doing kink, nonmonogamy, or any alternative-practice lifestyle, finding supportive, knowledgeable professionals (therapists, doctors, lawyers, etc.) can be challenging. That's where Kink Aware Professionals (KAP) comes in.

## What Is KAP?

Kink Aware Professionals is a directory of healthcare providers, mental health professionals, legal experts, and other service providers who are knowledgeable about and supportive of alternative sexualities and relationship structures.

## Why KAP Matters

Finding a therapist who won't pathologize your kink or a doctor who understands your lifestyle can be the difference between:

- Getting appropriate, non-judgmental care
- Feeling safe to be honest about your needs
- Receiving treatment that actually helps

## Who Should Use KAP?

KAP is for anyone who:

- Practices BDSM, kink, or fetish activities
- Is in nonmonogamous relationships
- Has alternative sexual interests
- Needs professional services without judgment

## How to Use the Directory

1. **Search by location** - Find providers near you
2. **Filter by specialty** - Look for specific types of care
3. **Read profiles** - Check credentials and experience
4. **Contact directly** - Reach out to discuss your needs

## What to Look For

When choosing a KAP provider, consider:

- **Experience** - How long have they worked with alternative communities?
- **Training** - Do they have specific education in kink-aware care?
- **Approach** - Are they non-judgmental and supportive?
- **Specialties** - Do they focus on areas relevant to your needs?

## Common KAP Services

- **Therapy and Counseling** - Individual, couple, and group therapy
- **Medical Care** - General practitioners, specialists, and urgent care
- **Legal Services** - Family law, estate planning, and advocacy
- **Bodywork** - Massage therapy and other physical treatments
- **Alternative Medicine** - Holistic and complementary care

## Red Flags to Avoid

Be cautious of providers who:

- Judge or shame your lifestyle choices
- Try to "fix" or change your sexuality
- Lack knowledge about consent and safety
- Make assumptions about your relationships
- Don't respect confidentiality

## Building Trust

Finding the right KAP provider takes time. Consider:

- **Initial consultations** - Meet before committing to ongoing care
- **References** - Ask for recommendations from community members
- **Communication** - Ensure you can discuss your needs openly
- **Boundaries** - Make sure they respect your limits and preferences

## The Bottom Line

KAP exists to help you find professionals who understand and support your lifestyle. Don't settle for judgmental or ignorant care when you can find providers who will work with you respectfully and effectively.

Your well-being matters, and you deserve healthcare that supports all aspects of who you are.
$$
WHERE slug = 'what-is-kap-directory-guide';

-- 3. Fix the partner abuse article
UPDATE articles 
SET content = $$
# Partner Abuse in Kink Communities: How to Tell the Difference Between BDSM and Abuse

Kink, at its best, is about trust, communication, and consent. But what happens when those things break down - or when someone uses the language of BDSM to mask abusive behavior?

## Understanding the Difference

**BDSM** is consensual power exchange between adults who have negotiated their activities and boundaries.

**Abuse** is about power and control, often without consent or with coerced consent.

## Key Distinctions

### Consent
- **BDSM**: Freely given, informed, and can be withdrawn at any time
- **Abuse**: Coerced, manipulated, or ignored

### Communication
- **BDSM**: Open, honest discussion about needs and limits
- **Abuse**: One person's needs always take priority

### Safety
- **BDSM**: Risk-aware consensual kink with safety measures
- **Abuse**: Dangerous behavior without regard for well-being

## Warning Signs of Abuse

Be alert for these red flags:

- **Isolation** - Keeping you away from friends and community
- **Control** - Dictating what you wear, who you see, how you act
- **Threats** - Using fear to maintain power
- **Gaslighting** - Making you question your own perceptions
- **Violation of limits** - Ignoring or pushing past agreed boundaries

## What Healthy BDSM Looks Like

In healthy kink relationships, you'll see:

- **Negotiation** - Clear discussion of wants, needs, and limits
- **Safewords** - Ways to stop or slow down activities
- **Aftercare** - Emotional and physical care after scenes
- **Respect** - Honoring each other's humanity and autonomy
- **Growth** - Both partners learning and evolving together

## Getting Help

If you're experiencing abuse:

1. **Reach out** - Contact trusted friends or community members
2. **Document** - Keep records of concerning behavior
3. **Seek support** - Find a kink-aware therapist or counselor
4. **Safety plan** - Develop strategies for your protection
5. **Resources** - Use domestic violence hotlines and support groups

## Supporting Others

If someone confides in you about abuse:

- **Believe them** - Take their concerns seriously
- **Listen** - Don't judge or minimize their experience
- **Support** - Help them access resources and safety
- **Respect** - Honor their decisions about what to do

## Community Responsibility

Kink communities have a responsibility to:

- **Educate** - Teach about consent and healthy relationships
- **Support** - Provide resources for those experiencing abuse
- **Address** - Take action when abuse is reported
- **Prevent** - Create cultures of consent and respect

## The Bottom Line

BDSM and abuse are not the same thing. Healthy kink is about mutual pleasure, growth, and respect. If you're experiencing abuse, you deserve support and safety - regardless of your sexual interests.

Remember: Your consent matters, your boundaries matter, and your safety matters.
$$
WHERE slug = 'partner-abuse-in-kink-communities';

-- 4. Summary of changes
SELECT 
    'Articles updated with proper formatting' as status,
    COUNT(*) as count
FROM articles 
WHERE slug IN (
    'what-is-kap-directory-guide',
    'partner-abuse-in-kink-communities'
);
