import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { eventLocationLabel, sortDashboardEvents } from './dashboardListing'
import type { ManagedEventRow } from '@/lib/eckeOrgEventShared'

function event(partial: Partial<ManagedEventRow> & Pick<ManagedEventRow, 'id' | 'title' | 'start_date' | 'status'>): ManagedEventRow {
  return {
    slug: partial.id,
    end_date: partial.start_date,
    start_time: null,
    end_time: null,
    doors_open: null,
    city: 'Harrisburg',
    state: 'PA',
    venue: null,
    address: null,
    show_address_publicly: false,
    is_online: false,
    category: null,
    event_type: 'social',
    short_description: null,
    long_description: null,
    website: null,
    logo: null,
    hero_image: null,
    images: null,
    program_url: null,
    map_url: null,
    staff_application_url: null,
    vendor_application_url: null,
    presenter_application_url: null,
    photographer_application_url: null,
    staff_applications_open: false,
    vendor_applications_open: false,
    presenter_applications_open: false,
    photographer_applications_open: false,
    ticket_url: null,
    registration_required: false,
    ticket_price: null,
    price_range: null,
    registration_deadline: null,
    ticket_tiers: null,
    age_restriction: null,
    accessibility: null,
    dress_code: null,
    photography_policy: null,
    parking: null,
    hotel_information: null,
    food_drink: null,
    vendor_area: null,
    organizer_name: null,
    views: 0,
    archived_at: null,
    organization_id: null,
    dungeon_venue_id: null,
    dungeon_slug: null,
    ...partial,
  }
}

describe('dashboard event ranking', () => {
  it('puts drafts ahead of upcoming, then past', () => {
    const ranked = sortDashboardEvents([
      event({ id: 'past', title: 'Past', start_date: '2026-01-01', end_date: '2026-01-01', status: 'published' }),
      event({ id: 'soon', title: 'Soon', start_date: '2026-10-12', end_date: '2026-10-12', status: 'published' }),
      event({ id: 'draft', title: 'Draft', start_date: '2026-11-01', end_date: '2026-11-01', status: 'draft' }),
    ])
    assert.deepEqual(ranked.map((item) => item.id), ['draft', 'soon', 'past'])
  })

  it('labels online events without city state', () => {
    assert.equal(eventLocationLabel({ is_online: true, city: 'Harrisburg', state: 'PA' }), 'Online')
    assert.equal(eventLocationLabel({ is_online: false, city: 'Harrisburg', state: 'PA' }), 'Harrisburg, PA')
  })
})
