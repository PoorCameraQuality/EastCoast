export type MarketingChapter = 'organizer' | 'attendee'

export type MarketingShot = {
  src: string
  alt: string
}

export type MarketingFeature = {
  id: string
  chapter: MarketingChapter
  label: string
  title: string
  body: string
  shots: readonly MarketingShot[]
  wide?: boolean
}

const BASE = '/dancecard/organizers/walkthrough'

export const ORGANIZER_FEATURES: readonly MarketingFeature[] = [
  {
    id: 'rooms-map',
    chapter: 'organizer',
    label: 'Rooms & floor plan',
    title: 'Your venue on one screen',
    body: 'Create your spaces and drop map pins where they actually are. Drag classes onto the time grid, or drop them straight onto a room on the camp map. Slide times up and down the 24-hour column until the weekend looks right. No more “wait, which building is Classroom 1 again?”',
    shots: [
      {
        src: `${BASE}/01-rooms-map-pins.png`,
        alt: 'Room availability grid beside camp floor plan with drop pins for Barn, Classroom 1, and Dungeon B',
      },
    ],
    wide: true,
  },
  {
    id: 'program-grid',
    chapter: 'organizer',
    label: 'Program grid',
    title: 'Build the schedule like you mean it',
    body: 'Drag and drop your programming into place. Click any block to open the edit window: attach presenters, staff, tags, whatever you need. The console flags room conflicts, double-booked presenters, and photo-policy issues before your attendees ever see a draft schedule.',
    shots: [
      {
        src: `${BASE}/02-program-grid.png`,
        alt: 'Organizer program grid with Opening circle, Rope 101, and Consent class across four days',
      },
    ],
    wide: true,
  },
  {
    id: 'import',
    chapter: 'organizer',
    label: 'Import',
    title: 'Your spreadsheet, live in minutes',
    body: 'Import program and staff schedules in bulk. Hook up Google Sheets, or upload CSV or Excel. Preview everything on a staging board first. When it looks right, publish. Program and staff stay in separate lanes so you do not mix up volunteer shifts with workshop blocks.',
    shots: [
      {
        src: `${BASE}/03-import-spreadsheet.png`,
        alt: 'Import page with Google Sheets connect, file upload, and program vs staff toggle',
      },
    ],
    wide: true,
  },
  {
    id: 'check-in',
    chapter: 'organizer',
    label: 'Gate check-in',
    title: 'The door, without the guesswork',
    body: 'Check in attendees at the gate and see what you need before you wave them through. Did they e-sign waivers and policies? Are they early, on time, or late? One glance tells you who is on site. Gold means they are here. Red means you overrode an early arrival on purpose. No more clipboard chaos.',
    shots: [
      {
        src: `${BASE}/04-check-in-early-modal.png`,
        alt: 'Early check-in override modal when attendee arrives before ticket window',
      },
      {
        src: `${BASE}/05-check-in-on-site.png`,
        alt: 'Signups table with on-site and early override status colors',
      },
      {
        src: `${BASE}/a1-check-in-gate.png`,
        alt: 'People signups with check-in buttons and color-coded on-site states at the gate',
      },
    ],
  },
  {
    id: 'staff-roster',
    chapter: 'organizer',
    label: 'Staff & coverage',
    title: 'Staffing that warns you before you mess up',
    body: 'See your staff roster and make adjustments in one place. If someone is already booked, or their personal dancecard says they are busy, the system tells you. You can still assign them anyway when you know what you are doing. Coverage gaps (like monitor staffing) show up before the play party, not during it.',
    shots: [
      {
        src: `${BASE}/a7-coverage-headcount.png`,
        alt: 'Coverage headcount grid across play spaces and two-hour slices',
      },
      {
        src: `${BASE}/a3-assign-coverage.png`,
        alt: 'Assign coverage modal listing staff with hours and busy-this-block warnings',
      },
      {
        src: `${BASE}/a8-scheduling-conflict.png`,
        alt: 'Scheduling conflict modal when staff is already booked in the block',
      },
      {
        src: `${BASE}/a9-assign-coverage-busy.png`,
        alt: 'Assign coverage showing Casey Host busy this block with override option',
      },
    ],
  },
  {
    id: 'badges',
    chapter: 'organizer',
    label: 'Badges',
    title: 'Badges at the door, not at Kinkos at 2 a.m.',
    body: 'Print badges on the fly with verified registration serial numbers. Door staff can match a badge to a real signup. Less “trust me, I paid” and more “here is the record.”',
    shots: [
      {
        src: `${BASE}/a6-badges.png`,
        alt: 'Badges tab with print layout and registration serial numbers for Brax and Alex Demo',
      },
    ],
    wide: true,
  },
  {
    id: 'shift-swaps',
    chapter: 'organizer',
    label: 'Shift swaps',
    title: 'Let volunteers trade shifts (on your terms)',
    body: 'Staff and volunteers can swap shifts with each other, or you can require manual approval for every trade. When someone asks to switch, you see both shifts and decide if coverage still works.',
    shots: [
      {
        src: `${BASE}/a5-shift-swaps.png`,
        alt: 'Shift swaps tab with approval workflow description',
      },
    ],
    wide: true,
  },
  {
    id: 'trusted-roles',
    chapter: 'organizer',
    label: 'Trusted roles',
    title: 'Applications for roles that actually matter',
    body: 'Create trusted roles for positions that need a real vetting step: dungeon monitor, safety team, lead volunteer, whatever your event runs on. Build the questionnaire, publish a public apply link, and review submissions in one queue. No more Google Form scattered across three inboxes.',
    shots: [
      {
        src: `${BASE}/a4-trusted-roles.png`,
        alt: 'Trusted roles editor for Dungeon Monitor with published apply link and application queue',
      },
    ],
    wide: true,
  },
] as const

export const ATTENDEE_FEATURES: readonly MarketingFeature[] = [
  {
    id: 'announcements',
    chapter: 'attendee',
    label: 'Announcements',
    title: 'News that actually reaches everyone',
    body: 'Push announcements straight to every attendee dancecard. “Pool closed.” “Vendor row moved.” “Welcome, here is how check-in works.” You can even require acknowledgment before they use the rest of the app, so important stuff does not get buried in Discord.',
    shots: [
      {
        src: `${BASE}/08-announcements.png`,
        alt: 'Attendee dancecard announcements section with Water closed update',
      },
    ],
    wide: true,
  },
  {
    id: 'program-live',
    chapter: 'attendee',
    label: 'Live program',
    title: 'When you change the schedule, they know',
    body: 'Change a workshop time or move a class to a new room, and it updates on every dancecard automatically. If that change collides with something they already added, they get a heads-up. Fewer “nobody told me it moved” moments at the door.',
    shots: [
      {
        src: `${BASE}/09-program-updates.png`,
        alt: 'Attendee Activities timeline with Dungeon orientation added to personal dancecard',
      },
    ],
    wide: true,
  },
  {
    id: 'availability-live',
    chapter: 'attendee',
    label: 'Live availability',
    title: 'Their calendar stays honest as they plan',
    body: 'As attendees add classes to their dancecard, their availability updates in real time. They can see when they are still free and when they are booked solid. You are not the only one doing mental math on a napkin.',
    shots: [
      {
        src: `${BASE}/10-availability-live.png`,
        alt: 'Attendee calendar by day showing Dungeon orientation blocks after adding classes',
      },
    ],
    wide: true,
  },
  {
    id: 'compare',
    chapter: 'attendee',
    label: 'Compare',
    title: 'Compare schedules without spilling the tea',
    body: 'Two people can compare schedules privately. Nobody sees the name of your 2 p.m. class or your scene plans. They only see free, busy, or “host is free but you are not.” Mutual open windows show up as slots they can actually book.',
    shots: [
      {
        src: `${BASE}/11-compare-private.png`,
        alt: 'Mutual availability compare with hour-by-hour green and blue calendar',
      },
    ],
    wide: true,
  },
  {
    id: 'reserve',
    chapter: 'attendee',
    label: 'Reserve',
    title: 'Book scene time in a few taps',
    body: 'Tap an open mutual slot and reserve scene time with a friend. Check that the window still works, add a note, send it. Both dancecards update. Less “are you free Friday?” in twelve group chats.',
    shots: [
      {
        src: `${BASE}/13-reserve-scene.png`,
        alt: 'Reserve together modal for a mutual time slot with Alex Demo',
      },
    ],
    wide: true,
  },
  {
    id: 'reservations',
    chapter: 'attendee',
    label: 'Reservations',
    title: 'Scene times in one list',
    body: 'Confirmed scenes show up in one place. Need to move it? Propose a new time. Need to bail? Cancel. Everyone’s schedule updates when the other person responds. The old “I thought we said noon?” thread dies here.',
    shots: [
      {
        src: `${BASE}/12-reservations-glance.png`,
        alt: 'Reservations list showing confirmed scene with Alex Demo',
      },
      {
        src: `${BASE}/14-reschedule.png`,
        alt: 'Propose new time reschedule request modal',
      },
    ],
  },
  {
    id: 'policies-map',
    chapter: 'attendee',
    label: 'Policies & map',
    title: 'Sign papers, find the room, get in line',
    body: 'Attendees can sign waivers and conduct policies (ECKE Sign) while they wait for a badge. Then pull up the map you built and walk straight to the right building. Less wandering, more weekend.',
    shots: [
      {
        src: `${BASE}/16-policies-sign.png`,
        alt: 'ECKE Sign policy checklist with legal name signature fields',
      },
      {
        src: `${BASE}/15-venue-map.png`,
        alt: 'Interactive venue map with room pins and numbered activities legend',
      },
    ],
  },
] as const

export const ALL_MARKETING_FEATURES: readonly MarketingFeature[] = [
  ...ORGANIZER_FEATURES,
  ...ATTENDEE_FEATURES,
]

export const ORGANIZER_STEPS = ORGANIZER_FEATURES
export const ATTENDEE_STEPS = ATTENDEE_FEATURES
export type WalkthroughAudience = MarketingChapter
export type WalkthroughStep = MarketingFeature
export const WALKTHROUGH_STEPS = ALL_MARKETING_FEATURES
