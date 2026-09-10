import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  listingCopyToPlainText,
  listingCopyToSafeHtml,
  orgCopyLooksLikeHtml,
  orgCopyToEditorHtml,
  orgPlainTextToHtml,
  sanitizeOrgHtml,
} from './eckeOrgRichText'

const PAF_PASTE = [
  'PAF27 returns May 5–9, 2027. Primal Arts Fest is a four-day, 21+ clothing-optional gathering that blends fire, ritual, art, education, and primal expression.',
  'By connecting body and spirit, provoking spiritual evolution, and embracing the sacred and the profane, it invites participants to explore workshops, performances, sacred sexuality, kink, and body modification. Built on consent, inclusivity, and risk-aware practices, the festival offers rituals, workshops, play-spaces, music, artisanal markets, and more — all with the backdrop of a 200-acre campground. For as long as humans have circled firelight and followed the drum, we have sought what lies beyond the everyday. Here, the arts of fire, ink, and ordeal are not spectacle but offering. Music becomes invocation, skin becomes canvas, and the body becomes a temple of both the sacred and the profane. **Venue:** Private 200-acre campground in Darlington, Maryland. Address is shared with registered attendees. **Registration:** Join the mailing list on the official site for PAF27 updates, pre-sale access, and rates. Ticket sales are announced there. **Get involved:** Staff, volunteer, presenter, and performer roles are listed on the official site. Vendor and body-modification artist applications open late summer 2026.',
].join(' ')

describe('eckeOrgRichText', () => {
  it('turns catalog **Header:** markers into h2 sections', () => {
    const html = orgPlainTextToHtml(PAF_PASTE)
    assert.match(html, /<h2>Venue<\/h2>/)
    assert.match(html, /<h2>Registration<\/h2>/)
    assert.match(html, /<h2>Get involved<\/h2>/)
    assert.match(html, /<p>PAF27 returns/)
    assert.match(html, /Darlington, Maryland/)
    assert.equal(html.includes('**Venue:**'), false)
  })

  it('does not treat inline **emphasis** as a section header', () => {
    const html = orgPlainTextToHtml(
      'Dark Odyssey **Summer Camp** is the **Maryland** Labor Day week outdoor festival.',
    )
    assert.equal(html.includes('<h2>'), false)
    assert.match(html, /<strong>Summer Camp<\/strong>/)
  })

  it('strips scripts before HTML is stored', () => {
    const clean = sanitizeOrgHtml('<p>Hello</p><script>alert(1)</script><h2>Venue</h2>')
    assert.match(clean, /<p>Hello<\/p>/)
    assert.match(clean, /<h2>Venue<\/h2>/)
    assert.equal(clean.includes('script'), false)
    assert.equal(clean.includes('alert'), false)
  })

  it('leaves existing HTML alone when opening the editor', () => {
    const html = '<h2>Venue</h2><p>Private campground.</p>'
    assert.equal(orgCopyLooksLikeHtml(html), true)
    assert.equal(orgCopyToEditorHtml(html), html)
  })

  it('renders listing markdown so **Hybrid convention.** is not raw asterisks', () => {
    const html = listingCopyToSafeHtml('**Hybrid convention.**')
    assert.match(html, /Hybrid convention\./)
    assert.equal(html.includes('**'), false)
    assert.equal(listingCopyToPlainText('**Hybrid convention.**'), 'Hybrid convention.')
  })
})
