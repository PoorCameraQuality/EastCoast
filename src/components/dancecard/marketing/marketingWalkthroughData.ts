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
  phase?: string
}

const BASE = '/dancecard/organizers/walkthrough'

export const ORGANIZER_FEATURES: readonly MarketingFeature[] = [
  {
    id: 'venue-maps',
    chapter: 'organizer',
    phase: 'Set up the event',
    label: 'Venue maps',
    title: 'Your floor plan, pinned once',
    body: 'Upload your floor plan once. Draw room zones with size and rotation. Attendees open the same map on their dancecard. You stop answering "which building is Dungeon B?" in the group chat. Rooms live in one place, and program and room tools use the same names.',
    shots: [
      {
        src: `${BASE}/venue-maps.png`,
        alt: 'Venue maps settings with floor plan upload and place room zones editor for Main Hall and dungeons',
      },
    ],
    wide: true,
  },
  {
    id: 'room-availability',
    chapter: 'organizer',
    phase: 'Set up the event',
    label: 'Room availability',
    title: 'Your venue on one screen',
    body: 'See every room across the weekend on a time grid next to the map. Drag classes between columns or drop them on a pin. Orange alerts show monitor coverage gaps while you are still planning. Room mistakes and safety gaps show up before you publish, not during the play party.',
    shots: [
      {
        src: `${BASE}/room-availability.png`,
        alt: 'Room availability time grid beside camp floor plan with monitor coverage gap alert',
      },
    ],
    wide: true,
  },
  {
    id: 'registration-categories',
    chapter: 'organizer',
    phase: 'Set up the event',
    label: 'Registration',
    title: 'Ticket types that match how you run the door',
    body: 'Set up weekend passes, staff comps, capacity, check-in windows, and comp codes. Turn on staff tools per ticket type so the right people get console access when they register. Ticket types, door rules, and permissions stay together. No side spreadsheet.',
    shots: [
      {
        src: `${BASE}/registration-categories.png`,
        alt: 'Event settings registration tab with Weekend pass capacity, comp codes, and staff tools checkbox',
      },
    ],
    wide: true,
  },
  {
    id: 'event-settings',
    chapter: 'organizer',
    phase: 'Set up the event',
    label: 'Event settings',
    title: 'Configure the weekend in one home',
    body: 'Basics, public page, registration, policies, rooms, and tracks live in one settings area. Configure once before you live in Program and People. New team members know where the event is configured.',
    shots: [
      {
        src: `${BASE}/event-settings.png`,
        alt: 'Event settings hub with Essentials tabs for Basics, Registration, Policies, and Rooms',
      },
    ],
    wide: true,
  },
  {
    id: 'attendee-profile-settings',
    chapter: 'organizer',
    phase: 'Set up the event',
    label: 'Attendee profile',
    title: 'You choose what people share',
    body: 'Choose what registrants can add on Profile: photo, bio, FetLife, Discord, email on card, bio length, and the default prompt. You set how people connect. No developer needed. Community norms and privacy are your settings, not a custom build.',
    shots: [
      {
        src: `${BASE}/attendee-profile-settings.png`,
        alt: 'Attendee dancecard profile settings with toggles for photo, bio, FetLife, Discord, and email on card',
      },
    ],
    wide: true,
  },
  {
    id: 'program-grid',
    chapter: 'organizer',
    phase: 'Build the program',
    label: 'Program grid',
    title: 'Build the schedule like you mean it',
    body: 'Drag workshops onto a multi-day grid. Keep unassigned classes in the sidebar until you are ready. The conflict banner checks rooms, presenters, and photo policy before attendees see a draft. Scheduling feels like planning the weekend, not fighting the website.',
    shots: [
      {
        src: `${BASE}/program-grid.png`,
        alt: 'Organizer program grid with Opening circle, Rope 101, and classes across four days',
      },
    ],
    wide: true,
  },
  {
    id: 'import',
    chapter: 'organizer',
    phase: 'Build the program',
    label: 'Import',
    title: 'Your spreadsheet, live in minutes',
    body: 'Connect Google Sheets or upload CSV or Excel. Stage program and staff imports separately so volunteer rows do not end up in your class list. Preview, fix, publish. Your existing spreadsheet is still the fastest way in.',
    shots: [
      {
        src: `${BASE}/import-spreadsheet.png`,
        alt: 'Import page with Google Sheets connect, file upload, and program vs staff toggle',
      },
    ],
    wide: true,
  },
  {
    id: 'schedule-change-impact',
    chapter: 'organizer',
    phase: 'Build the program',
    label: 'Schedule changes',
    title: 'When you move a class, you pick who hears',
    body: 'After you move a session, see who has it on their dancecard and which presenters are on the block. Notify selected people in the app or copy an announcement. Personal dancecard times are not changed behind your back. You choose who hears about a change instead of blasting the whole camp.',
    shots: [
      {
        src: `${BASE}/schedule-change-impact.png`,
        alt: 'Schedule change impact modal listing presenters to notify after moving Opening circle',
      },
    ],
    wide: true,
  },
  {
    id: 'people-signups',
    chapter: 'organizer',
    phase: 'At the door',
    label: 'People signups',
    title: 'The door, without the guesswork',
    body: 'Every ticket in one table with vetting, filters, and color-coded check-in (on site, late, early override). Approve vetting in the side panel. Export when finance asks. Registration, vetting, and gate status are one workflow.',
    shots: [
      {
        src: `${BASE}/people-signups.png`,
        alt: 'People signups table with check-in buttons, vetting panel, and color-coded on-site status',
      },
    ],
    wide: true,
  },
  {
    id: 'policies-sign',
    chapter: 'organizer',
    phase: 'At the door',
    label: 'Policies and signing',
    title: 'Waivers before the badge',
    body: 'Attendees sign waivers and conduct policies (ECKE Sign) before you print a badge. Legal name is stored. Door staff see completion on the signup record. Paperless door with a clear record, not a binder and guesswork.',
    shots: [
      {
        src: `${BASE}/policies-sign.png`,
        alt: 'ECKE Sign policy checklist with legal name and signature fields',
      },
    ],
    wide: true,
  },
  {
    id: 'badges',
    chapter: 'organizer',
    phase: 'At the door',
    label: 'Badges',
    title: 'Badges at the door, not at Kinkos at 2 a.m.',
    body: 'Upload a sharp logo. Search one person for a reprint. Bulk print by package with checked-in filters. Counts per ticket type stay current. Badge night is a button at the desk, not a panic run to Kinkos.',
    shots: [
      {
        src: `${BASE}/badges-print.png`,
        alt: 'Badges tab with logo upload, attendee search, and print by package buttons',
      },
    ],
    wide: true,
  },
  {
    id: 'staff-roster',
    chapter: 'organizer',
    phase: 'Your crew',
    label: 'Staff roster',
    title: 'Everyone on the weekend, one list',
    body: 'One list for presenters, volunteers, photographers, and anyone else you add. Scene names, pronouns, comp types, and service hours pull from signups. Filter by role when you need "who can DM?" Everyone who touches the weekend is easy to find.',
    shots: [
      {
        src: `${BASE}/staff-roster.png`,
        alt: 'Staff roster overview table with scene names, pronouns, roles, and comp types',
      },
    ],
    wide: true,
  },
  {
    id: 'staff-shifts',
    chapter: 'organizer',
    phase: 'Your crew',
    label: 'Staff shifts',
    title: 'Shifts and hours on the board',
    body: 'Hours on the board shows scheduled hours vs expected hours per person. Add shifts with play space and role. Leave blocks open for volunteers to claim. Filter unstaffed and needs vetting. You see burnout and gaps before Friday morning setup.',
    shots: [
      {
        src: `${BASE}/staff-shifts.png`,
        alt: 'Staff shifts tab with hours summary, add shift form, and shift table by person and role',
      },
    ],
    wide: true,
  },
  {
    id: 'trusted-roles',
    chapter: 'organizer',
    phase: 'Your crew',
    label: 'Trusted roles',
    title: 'Applications for roles that actually matter',
    body: 'Build questionnaires and publish apply links. Review submissions in one queue for dungeon monitor, safety lead, and similar roles. Approve here, assign shifts next. High-trust roles stop living in three Google Forms and a DM thread.',
    shots: [
      {
        src: `${BASE}/trusted-roles.png`,
        alt: 'Special roles and applications with Dungeon monitor role, apply links, and review queue',
      },
    ],
    wide: true,
  },
  {
    id: 'coverage-grid',
    chapter: 'organizer',
    phase: 'Your crew',
    label: 'Coverage',
    title: 'See the gaps before the floor does',
    body: 'Set minimum lead and backup counts per window. The headcount grid turns red where you are short. Click a cell and assign from available staff. Play space coverage is visible. It is not tribal knowledge in one person\'s head.',
    shots: [
      {
        src: `${BASE}/coverage-grid.png`,
        alt: 'Coverage and assignments headcount grid across play spaces and two-hour slices with red gap cells',
      },
    ],
    wide: true,
  },
  {
    id: 'scheduling-conflict',
    chapter: 'organizer',
    phase: 'Your crew',
    label: 'Scheduling conflicts',
    title: 'Catch double-booking before Friday',
    body: 'If someone is already on setup that morning, you see it before you double-book. You can still assign them if you mean it. They get a nudge to check their dancecard. Fewer "where is my volunteer?" moments on the floor.',
    shots: [
      {
        src: `${BASE}/scheduling-conflict.png`,
        alt: 'Scheduling conflict modal warning that staff is already booked during the block',
      },
    ],
    wide: true,
  },
  {
    id: 'shift-swaps',
    chapter: 'organizer',
    phase: 'Your crew',
    label: 'Shift swaps',
    title: 'Let volunteers trade shifts (on your terms)',
    body: 'Volunteers propose trades with a note. You see both shifts and approve or decline. Coverage rules stay yours. Volunteers get flexibility. You keep control of the board.',
    shots: [
      {
        src: `${BASE}/shift-swaps.png`,
        alt: 'Shift swaps tab with pending trade request and approve or decline buttons',
      },
    ],
    wide: true,
  },
  {
    id: 'safety-incidents',
    chapter: 'organizer',
    phase: 'Safety and comms',
    label: 'Safety incidents',
    title: 'A log for safety leads, not the group chat',
    body: 'Log incidents with a short summary. Restricted notes stay visible only to safety role and owners. Timestamped history for handoffs between leads. Safety notes without a shared password spreadsheet.',
    shots: [
      {
        src: `${BASE}/safety-incidents.png`,
        alt: 'Safety incidents log with summary field, restricted notes, and closed incident history',
      },
    ],
    wide: true,
  },
  {
    id: 'announcements',
    chapter: 'organizer',
    phase: 'Safety and comms',
    label: 'Announcements',
    title: 'News that actually reaches everyone',
    body: 'Push updates like "pool closed" or "vendor row moved" to every attendee dancecard. Require acknowledgment when it must be read. Important news reaches phones, not a Discord channel half the camp muted.',
    shots: [
      {
        src: `${BASE}/announcements.png`,
        alt: 'Organizer messaging panel to send announcements to attendee dancecards',
      },
    ],
    wide: true,
  },
] as const

export const ATTENDEE_FEATURES: readonly MarketingFeature[] = [
  {
    id: 'program-live',
    chapter: 'attendee',
    label: 'Live program',
    title: 'When you change the schedule, they know',
    body: 'Official schedule by day with ADD, presenters, and map links. When you publish changes, their timeline updates from the same data you edited in the console. One schedule for everyone. Fewer "nobody told me it moved" moments at the door.',
    shots: [
      {
        src: `${BASE}/attendee-program.png`,
        alt: 'Attendee program day view with Opening circle, Rope 101, and ADD buttons',
      },
    ],
    wide: true,
  },
  {
    id: 'availability-live',
    chapter: 'attendee',
    label: 'My availability',
    title: 'Their calendar stays honest as they plan',
    body: 'Attendees block busy time, set buffers, share a link, and export to calendar. Green hours show when they are still free as they add classes. They handle their own calendar math. You are not in the middle of every "are you free?"',
    shots: [
      {
        src: `${BASE}/attendee-availability.png`,
        alt: 'Attendee availability calendar by day with open green hour blocks',
      },
    ],
    wide: true,
  },
  {
    id: 'compare',
    chapter: 'attendee',
    label: 'Compare',
    title: 'Compare schedules without spilling the tea',
    body: 'Two people compare in private. Mutual open windows show in green. Busy details stay hidden unless you allow it. They can pick a gap to reserve. Scene planning without posting class titles to the whole camp.',
    shots: [
      {
        src: `${BASE}/attendee-compare.png`,
        alt: 'Mutual availability compare with hour-by-hour green and blue calendar for two attendees',
      },
    ],
    wide: true,
  },
  {
    id: 'reserve',
    chapter: 'attendee',
    label: 'Reserve',
    title: 'Book scene time in a few taps',
    body: 'Tap a mutual open slot, confirm, and both dancecards update. They can add it to a calendar if they want. Scene time lands on both phones instead of a long Signal thread.',
    shots: [
      {
        src: `${BASE}/attendee-reserve.png`,
        alt: 'Reserve together confirmation showing reservation on both dancecards',
      },
    ],
    wide: true,
  },
  {
    id: 'reservations',
    chapter: 'attendee',
    label: 'Reservations',
    title: 'Scene times in one list',
    body: 'Confirmed scenes show in one list. Reschedule or cancel and both sides update when the other person responds. Less "I thought we said noon?" confusion.',
    shots: [
      {
        src: `${BASE}/attendee-reservations.png`,
        alt: 'Attendee reservations list with confirmed scene and reschedule or cancel buttons',
      },
    ],
    wide: true,
  },
  {
    id: 'attendee-profile',
    chapter: 'attendee',
    label: 'Profile',
    title: 'Profiles that match your event',
    body: 'Scene name, bio, contacts, badge line, and a live preview. They only fill in fields you turned on in settings. Attendees show up findable. You control how much they share.',
    shots: [
      {
        src: `${BASE}/attendee-profile.png`,
        alt: 'Attendee profile editor with live preview, photo, bio, and contact fields',
      },
    ],
    wide: true,
  },
  {
    id: 'iso-board',
    chapter: 'attendee',
    label: 'ISO board',
    title: 'Connection posts without the feed',
    body: 'Posts for practice partners, meetups, shadow shifts, and similar. Threaded replies and profiles. No need to expose a full schedule to coordinate. Connection stays in the app. Staff can watch the board instead of scattered social posts.',
    shots: [
      {
        src: `${BASE}/attendee-iso-board.png`,
        alt: 'ISO board with practice partner and meetup posts and reply counts',
      },
    ],
    wide: true,
  },
  {
    id: 'attendee-groups',
    chapter: 'attendee',
    label: 'Attendee groups',
    title: 'Tent cities and room blocks, self-serve',
    body: 'Tent cities and room blocks with expectations, chores, and bring lists. Owners approve who joins. Sub-camps organize themselves. You set expectations up front instead of micromanaging.',
    shots: [
      {
        src: `${BASE}/attendee-groups.png`,
        alt: 'Attendee group modal for tent city with expectations, chores, and bring list tabs',
      },
    ],
    wide: true,
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
