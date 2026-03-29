# Master vendor leads — ECKE listing website scan (2026-03-29)

**Scope:** Every unique `website` on ECKE **events** and **dungeons** (`src/data/events.js`, `src/data/dungeons.js`) — **125 URLs** — split into **five batches of 25** and scanned in parallel by research agents.

**What this is:** Outbound links that *look like* vendors, sponsors, marketplaces, travel partners, ticketing, or community partners on those official sites. **Not vetted for accuracy, consent, or whether they belong in `vendors.js`.** Many events list vendor **names** without URLs (e.g. CLAW VendorMart, Crucible LF&P) — those are summarized in agent notes, not as rows below.

**What to do next:** Deduplicate against `src/data/vendors.js` (`websiteUrl`), assign `tagSlugs` from `vendorTaxonomy.ts`, add logos, and confirm each business still wants directory placement.

**Batch definition:** `docs/VENDOR_SCAN_BATCHES.json` (regenerate with `node scripts/extract-listing-urls-for-vendor-scan.mjs`).

**Deduped URL-only index:** `docs/VENDOR_LEADS_UNIQUE_URLS_2026-03-29.txt` — **162** unique `https://` strings extracted from the tables below (includes ticketing, hotels, and nonprofits — filter before importing to `vendors.js`). Regenerate: `node scripts/extract-urls-from-vendor-master.mjs`.

---

## Batch 0 — vendor leads

| Vendor / brand | Vendor URL | ECKE listing (name) | Notes (source path or page) |
|---|---|---|---|
| Awkward Artist Studio | https://www.awkwardartiststudio.com/ | Coastal Carolina Fetish Fair 2026 | Homepage “Returning Vendors” → SHOP |
| Bitches Love Leather | https://bllenterprises.com/ | Dark Odyssey Fusion | `/fusion/vending/` 2024 vendor list |
| CaneLove (Canes4pain) | https://canelove.com/ | Coastal Carolina Fetish Fair 2026 | Returning Vendors → SHOP |
| Delicious Boutique | https://www.deliciousboutique.com/ | Dark Odyssey Fusion | `/fusion/vending/` |
| Dorie’s Designs | https://doriesdesigns.net/ | Coastal Carolina Fetish Fair 2026 | Returning Vendors → SHOP |
| Dungeon in a Bag | https://dungeoninabag.com/ | Coastal Carolina Fetish Fair 2026 | New Vendors → SHOP |
| EF Leathercraft | https://www.efleathercraft.com/ | Dark Odyssey Fusion | `/fusion/vending/` |
| Experience Columbus | https://www.experiencecolumbus.com/ | CLAW 26 | Host-city partner links |
| Experience Columbus (LGBTQ+ visitor info) | https://www.experiencecolumbus.com/lgbtq/ | CLAW 26 | Same block as above |
| Flogging Farmers | https://www.etsy.com/shop/FlogginFarmers | Dark Odyssey Fusion | `/fusion/vending/` (Etsy storefront) |
| Goth Moth Studios | https://www.facebook.com/gothmothstudios | Dark Odyssey Fusion | `/fusion/vending/` (social-only link as given) |
| Holo Leathers | https://www.hololeathers.com/ | Dark Odyssey Fusion | `/fusion/vending/` |
| Hyatt Regency Columbus (group booking) | https://www.hyatt.com/events/en-US/group-booking/CMHRC/G-CLW6 | CLAW 26 | Host hotel block |
| Ice Lounge | https://icelounge.net/ | Annual Kink Expo — Elgin Munchers (Chicago area) 2026 | `/about-us-1` “Our Partners” |
| Kinbaku Studio | https://www.kinbaku-studio.com/ | Dark Odyssey Fusion | `/fusion/vending/` |
| Kink Think Factory | https://www.kinkthinkfactory.com/ | Dark Odyssey Fusion | `/fusion/vending/` |
| Kinky Trivia | https://www.kinkytrivia.net/ | Coastal Carolina Fetish Fair 2026 | Returning Vendors → SHOP |
| Leather By Danny | https://www.leatherbydanny.com/ | Dark Odyssey Fusion | `/fusion/vending/` |
| Lifestyle Playtime | https://www.lifestyleplaytime.com/ | Annual Kink Expo — Elgin Munchers (Chicago area) 2026 | `/about-us-1` “Our Partners” |
| Lilfox Toy Box | https://www.etsy.com/shop/LilfoxToybox | Dark Odyssey Fusion | `/fusion/vending/` |
| Oh, Jessa! | https://ohjessa.com/ | Dark Odyssey Fusion | `/fusion/vending/` |
| Our Alibi | https://www.ouralibi4u.com/ | Annual Kink Expo — Elgin Munchers (Chicago area) 2026 | `/about-us-1` “Our Partners” |
| Pendragon Chainmail | https://www.etsy.com/shop/PendragonChainmail | Dark Odyssey Fusion | `/fusion/vending/` |
| Regal Raiment | https://www.regalraiment.net/ | Coastal Carolina Fetish Fair 2026; Dark Odyssey Fusion | CCFF + DO Fusion |
| Sire Don Leather (Etsy) | https://www.etsy.com/shop/SDLeather | Coastal Carolina Fetish Fair 2026 | Returning Vendors → SHOP |
| SnM Leatherworks | https://www.snmleatherworks.com/ | Coastal Carolina Fetish Fair 2026 | New Vendors → SHOP |
| Strings and Fibers | https://www.stringsandfibers.com/ | Dark Odyssey Fusion | `/fusion/vending/` |
| The Dungeon Store | https://thedungeonstore.com/ | Coastal Carolina Fetish Fair 2026 | Returning Vendors → SHOP |
| The Fat Unicorn | https://www.etsy.com/shop/fatunicorncreations | Dark Odyssey Fusion | `/fusion/vending/` |
| The NEW Ms Martha’s Corset Shoppe | https://corset1.com/ | Coastal Carolina Fetish Fair 2026 | New Vendors → SHOP |
| TheBeav Woodcrafting | https://www.thebeavwoodcrafting.com/ | Coastal Carolina Fetish Fair 2026 | Returning Vendors → SHOP |
| Too Hot to Handle Candles | https://www.toohotcandles.com/ | Coastal Carolina Fetish Fair 2026 | Returning Vendors → SHOP |
| Unique Kink | https://uniquekink.com/ | Coastal Carolina Fetish Fair 2026 | Returning Vendors → SHOP |
| Vern’s Tavern | https://www.vernstavern.com/ | Annual Kink Expo — Elgin Munchers (Chicago area) 2026 | `/about-us-1` “Our Partners” |

**Batch 0 — no public vendor directory / access issues (abbrev.):** Alaska Club Kink; Austin Kink Weekend; Baltimore Playhouse; Beguiled; Beyond Leather (age gate); Beyond Vanilla 35 (applications only); Black Thorn; Camp Thornwood; Charmed (vending app only); CLAW VendorMart (names, no URLs in fetch); Academy of Fetish Arts; DO Summer Camp / Surrender / Winter Fire; Deviance Tampa Bay; Fetish Con exhibitors page sparse; Fetish Factory same-domain retail; Florida Fetish Weekend page; FetLife-only listings (403/login); Sarasota Dark Temple.

---

## Batch 1 — vendor leads

| Vendor / brand | Vendor URL | ECKE listing (name) | Notes |
|---|---|---|---|
| Any Spine Chiropractic & Massage Studio | https://anyspine.com/ | Kink Down South Weekend 2026 | Eventeny sponsors |
| Anubis Gear | https://www.anubisgear.com/ | The Master/slave Conference MsC 2026 | Gold tier (URL verified off-page) |
| Atlanta Pride Committee | https://atlantapride.org/ | Kink Down South Weekend 2026 | Eventeny sponsor |
| Barking Leather | https://www.barkingleather.com/ | The Master/slave Conference MsC 2026 | Gold tier |
| Black FemDoms-Atlanta | https://bfdatlanta.com/ | The Master/slave Conference MsC 2026 | Platinum tier |
| Bliss Cruise | https://www.blisscruise.com/ | Infliction Hall; Purgatory Dungeon | Travel partner |
| BONEAFIDE | https://boneafide.store/ | Hugs & Kisses 2026 | Keystone `/vendors` |
| Desire Cruises | https://desire-cruises.com/ | Infliction Hall; Purgatory Dungeon; The Pendulum Club | Club calendars |
| Desire Experience (resorts) | https://www.desire-experience.com/ | Infliction Hall; Purgatory Dungeon; The Pendulum Club | Club calendars |
| Free The Kink | https://freethekink.com/ | The Master/slave Conference MsC 2026 | Platinum tier |
| Hedonism II | https://www.hedonism.com/ | Infliction Hall | Travel-style listing |
| KNucks | https://www.myknucks.com/ | Hugs & Kisses 2026 | Keystone `/vendors` |
| Le Château Exotique | https://www.fetishwear.com/ | Hugs & Kisses 2026 | Keystone `/vendors` |
| Lethal Ware | https://www.etsy.com/shop/LethalWare | Hugs & Kisses 2026 | Keystone `/vendors` |
| MAsT International | https://www.mast.net/ | The Master/slave Conference MsC 2026 | Platinum tier |
| Naughty in N’awlins / Naughty Events | https://www.naughty-events.com/ | Purgatory Dungeon | Partner event on calendar |
| Q Care Plus | https://www.qcareplus.com/ | Kink Down South Weekend 2026 | Eventeny sponsor |
| Sea Mountain Las Vegas | https://www.seamountainlasvegas.com/ | Infliction Hall; Purgatory Dungeon | Club calendars |
| Sea Mountain Resorts | https://www.seamountainresorts.com/ | Infliction Hall; Purgatory Dungeon | Club calendars |
| Spring Hill Wood Works | https://springhill-woodworks.com/ | The Master/slave Conference MsC 2026 | Silver tier |
| The Dungeon Store | https://thedungeonstore.com/ | The Master/slave Conference MsC 2026 | Silver tier |
| Temptation Cruises | https://www.temptationcruises.com/ | Infliction Hall; Purgatory Dungeon | Club calendars |
| Temptation Experience (resorts) | https://www.temptation-experience.com/ | Infliction Hall; Purgatory Dungeon; The Pendulum Club | Club calendars |
| Violet Wand Store | https://www.violetwands.com/ | Kinky Kollege: Spring Break 2026 | Mentioned in testimonial on homepage |
| Wolfstryker Leather | https://wolfstryker.com/ | Hugs & Kisses 2026 | Keystone `/vendors` |

**Batch 1 — gaps / no vendor URLs:** NELA timeout; KinkyCon portal thin; Paddles NYC TLS issues; GWNN sponsors empty; Florida Power Exchange; Frolicon (applications only); Galleria Domain 2; CURE (Google Form only); Kink Center; Leather Reign; Cold As Hell; LoftNC; LRA Chicago; OhioSMART / Fetish Flea (no URL list); Pleasurecation; many club sites without malls.

---

## Batch 2 — vendor leads (Shrine + Tempest heavy)

| Vendor / brand | Vendor URL | ECKE listing (name) | Notes |
|---|---|---|---|
| 2V1 Dark Works | https://www.facebook.com/2V1darkworks | Shrine Parties | Vendor directory |
| Agreeable Agony | https://agreeableagony.com/ | Dungeons & Geekdoms | Tempest vendors |
| Arcane Impact | https://arcaneimpact.com/ | Dungeons & Geekdoms | Tempest |
| Bastille & Bags | https://www.the-bastille.com/ | Shrine Parties | Vendor directory |
| Beyond Piercing | https://linktr.ee/BeyondPiercing | Shrine Parties | Vendor directory |
| Bliss Cruise | https://registration.blisscruise.com/ | Saints & Sinners | Travel partner |
| Bloody Rose Boutique | https://bloodyroseboutique.com/ | Shrine Parties | Vendor directory |
| Bound Bunny Boutique | https://etsy.me/2SHSOJA | Shrine Parties | Etsy short link |
| Broken Lance After Dark | https://www.etsy.com/shop/BrokenLanceAfterDark | Dungeons & Geekdoms | Tempest |
| CedarCreek Creations | https://www.facebook.com/cedarcreek.handmadecreations | Shrine Parties | Vendor directory |
| Chameleon Creations | https://www.facebook.com/ChameleonAfterDark/ | Shrine Parties | Vendor directory |
| colette clubs | https://coletteclubs.com/ | Shrine Parties | Check-in / membership flow |
| Desire Cruises | https://desire-cruises.com/ | Saints & Sinners | Partner promos |
| Desire Experience | https://www.desire-experience.com/ | Saints & Sinners | Partner promos |
| Dulcis Doloris | https://www.etsy.com/shop/WTProductions | Shrine Parties | Vendor directory |
| Emma Alamo | https://emmaalamo.com/ | Dungeons & Geekdoms | Tempest |
| Fantasy Grove Toys | https://fantasygrove.com/ | Dungeons & Geekdoms | Tempest |
| Fontina + Co | https://www.fontinaco.com/ | Shrine Parties | Vendor directory |
| Forge and Fleece | https://www.etsy.com/shop/ForgeAndFleece | Dungeons & Geekdoms | Tempest |
| Faire Treasures | https://www.fairetreasures.com/ | Shrine Parties | Vendor directory |
| From the Hoard | https://www.fromthehoard.com/ | Shrine Parties | Vendor directory |
| Heidi Sweet Sensations | https://heidisweetsensations.square.site/ | Shrine Parties | Vendor directory |
| Heretical Son Leatherwork | https://www.etsy.com/shop/HereticalSonLeather | Shrine Parties | Vendor directory |
| JAFantasyArt | https://www.jafantasyart.com/ | Shrine Parties | Vendor directory |
| JP & DM Creations | https://m.facebook.com/100063674760870/ | Shrine Parties | Vendor directory |
| Katherine McIntyre | https://www.katherine-mcintyre.com/ | Dungeons & Geekdoms | Tempest |
| Kind Clinic | https://kindclinic.org/ | Shrine Parties | STI-testing partner |
| Kilted Kink | https://kiltedkinktoys.square.site/ | Shrine Parties | Vendor directory |
| KnottieKittie Rope | https://www.knottiekittie.com/ | Shrine Parties | Vendor directory |
| Kink Works | https://www.etsy.com/shop/kinkworksrx | Shrine Parties | Vendor directory |
| Kinky Nix | https://kinkynix.bigcartel.com/ | Shrine Parties | Vendor directory |
| Kjones Pottery | https://kjonespottery.com/ | Dungeons & Geekdoms | Tempest |
| Leather by Danny | https://leatherbydanny.com/ | Dungeons & Geekdoms | Tempest |
| Nadia Vanilla Fine Art | https://www.nadiavanilla.com/ | Dungeons & Geekdoms | Tempest |
| Pan’s Haven Candles & More | https://www.etsy.com/shop/PansHaven | Shrine Parties | Vendor directory |
| PenguinAfterDark | https://www.penguinafterdark.com/ | Shrine Parties | Vendor directory |
| Perverted Pins | https://www.instagram.com/PervertedPins | Dungeons & Geekdoms | Instagram-only |
| Phantoms Era Designs | https://phantomsera.com/ | The Aviary Philly | Footer “site by” |
| Pixie and Paladin Crafts | https://facebook.com/pixiepaladin | Dungeons & Geekdoms | Tempest |
| PlusHii Kawaii | https://www.plushiikawaii.com/ | Dungeons & Geekdoms | Tempest |
| Pride Interpreting | https://prideinterpreting.wixsite.com/website | San Diego Bootblack & Leather Weekend | Accessibility |
| Raven Claw Rope | https://ravenclawrope.com/ | Shrine Parties | Vendor directory |
| Redbubble (CSPC merch) | https://www.redbubble.com/people/TheCSPC | Center for Sex Positive Culture (CSPC) | Official merch |
| SWOP USA | https://swopusa.org/ | Ropecraft Chicago 2026 | Advocacy link |
| Skipjack Flog | https://www.etsy.com/shop/SkipjackFlog | Shrine Parties | Vendor directory |
| Smith Beard Media | https://smithbeardmedia.com/ | San Diego Bootblack & Leather Weekend | Photographer |
| Spicy Kitten Designs | https://www.spicykittendesigns.com/ | Shrine Parties | Vendor directory |
| Suzanne Shifflett (photography) | https://smshifflett.com/ | San Diego Bootblack & Leather Weekend | Photographer |
| Temptation Cruises | https://temptationcruises.com/ | Saints & Sinners | Travel partner |
| Temptation Experience | https://www.temptation-experience.com/ | Saints & Sinners | Travel partner |
| The Beatery (Biggins Beatery) | https://www.bigginsbeatery.com/ | Shrine Parties | Vendor directory |
| The Dungeon Store | https://thedungeonstore.com/ | Dungeons & Geekdoms | Tempest |
| The Giggling Sadist | https://thegigglingsadist.com/ | Shrine Parties | Vendor directory |
| Vivent Health | https://viventhealth.org/ | Shrine Parties | STI-testing partner |
| Vitromancy Arts | https://www.vitromancyart.com/ | Dungeons & Geekdoms | Tempest |
| Wicked Wishes Toys | https://www.facebook.com/WickedWishesToys/ | Shrine Parties | Vendor directory |
| Wytchwàld Studios | https://www.instagram.com/wytchwald.studios/ | Dungeons & Geekdoms | Instagram-only |
| X-Pole US | https://xpoleus.com/ | Naughty Gras | Dancing Poles sponsor |

**Batch 2 — gaps:** RACK Room; Rehoboth; Ropecraft (apply-to-vend only); SELF `/vendors` 404; SD Bootblack (bios only); OK LeatherFest Google Sites; STL3 renovation; Studio 58 / Naughty Noel; Sub Rosa / SubSpace; Tethered Together; **The Crucible** names many vendors **without URLs**; Korral, Mark CPI, Threshold, Vortex; Diosa’s; Saints & Sinners footer link farm trimmed.

---

## Batch 3 — vendor leads

| Vendor / brand | Vendor URL | ECKE listing (name) | Notes |
|---|---|---|---|
| Appaloosa (Spotted Horse Design) | https://www.spottedhorse.com/ | KinkFest 2026 | “Web design and hosting” footer |
| Black Rose — Mailchimp | https://br.us17.list-manage.com/subscribe?u=2c633bed545c7aa58fb8b672d&id=b9236ee456 | Black Rose | Newsletter |
| Bliss Cruise | https://registration.blisscruise.com/Book/Reservation/Start?tripId=3120&travelAgentId=167634 | DomCon New Orleans 2026 | Travel partner |
| Buytickets.at / Rope Daddy Studios | https://buytickets.at/ropedaddystudiosllc/1828384 | Indy Rope Expo 2026 | Ticketing |
| Camp Crucible — Mailchimp | https://eepurl.com/gHPlo9 | Camp Crucible | Mailing list |
| Desire Cruises | https://desire-cruises.com/ | DomCon New Orleans 2026 | Travel |
| Desire Experience | https://www.desire-experience.com/ | DomCon New Orleans 2026 | Resorts |
| Eventbee | https://www.eventbee.com/v/deviations/event?eid=257526554 | Arcadia Collective Detroit | Ticketing |
| Eventbrite — NEEHU 17 | https://www.eventbrite.com/e/neehu-17-april-2-6-2026-registration-1837565270189 | New England Erotic Hypnosis (un)Conference | Registration |
| Eventbrite — World Bear Weekend | https://wbw2026.eventbrite.com/ | World Bear Weekend 2026 | Pass sales |
| Fanatics | https://www.fanatics.com/ | Naughty in N'Awlins | “T-shirt ideas” |
| Hilton / Passkey | https://book.passkey.com/e/51173262 | DomCon New Orleans 2026 | Hotel block |
| IncognitoPhotographer | https://www.instagram.com/incognitophotographer/ | Arcadia Collective Detroit | Event copy |
| LASC — Sintra | https://lasc-hvlc.sintra.site/ | Lifestyle America Social Club listing | Platform redirect |
| Modern Lifestyle | https://modernlifestyle.co/ | DomCon New Orleans 2026 | Platform credit |
| Moonshot (m00nshot) | https://www.m00nshot.com/collections/adult-humor-t-shirts | Naughty in N'Awlins | T-shirt ideas |
| Naughty Events — members | https://members.naughty-events.com/events/77104/orders/new | Naughty in N'Awlins | Ticketing subdomain |
| Official Band Shirts | https://www.officialbandshirts.com/ | Naughty in N'Awlins | T-shirt ideas |
| Retreat Guru | https://eastonmountain.secure.retreat.guru/program/kink-odyssey-spring/?form=1&lang=en | Kink Odyssey - Spring 2026 | Registration |
| Sickening Events | https://www.sickening.events/e/international-mr-leather-2026 | International Mr. Leather (IML) 2026 | Ticket packages |
| Splash Takeovers (EROTICON) | https://splashtakeovers.com/events/68323/orders/new?promoter_id=670551 | DomCon New Orleans 2026 | Partner ticketing |
| Squarespace — Easton Mountain lodging | https://eastonmountain.squarespace.com/lodging | Kink Odyssey - Spring 2026 | Lodging |
| The Metro Underground | https://www.themetrounderground.com/ | DC Fetish Ball | Beneficiary |
| Temptation Cruises | https://www.temptationcruises.com/ | DomCon New Orleans 2026 | Travel |
| Temptation Experience | https://www.temptation-experience.com/ | DomCon New Orleans 2026 | Resorts |

**Batch 3 — omitted / thin:** Chicago Fetish Weekend; CrucibleCon; Denver Sanctuary; Elevation Rope; Fire Island Leather; Exploration Into Kink; FetCamp; FORNUCOPIA; IMsLBB internal forms; Leather Leadership Conference; MAL; Iowa Leather Weekend (venue text only). DomCon footer affiliate list not fully expanded.

---

## Batch 4 — vendor leads

| Vendor / brand | Vendor URL | ECKE listing (name) | Notes |
|---|---|---|---|
| Choice Hotels | https://www.choicehotels.com/reservations/groups/NP95Y6 | RGV Leather Weekend 2026 | Hotel block |
| Cockeye Kink | https://cockeyekink.com/ | Pacific Northwest Leathermen's Campout 2026 | Sponsor |
| Drool Apparel | https://droolapparel.com/ | Boundless Detroit S&M Symposium 2026 | Oblige network |
| Eagle Portland | https://www.eagleportland.com/ | PNWLC 2026 | Sponsor |
| Explore McAllen | https://www.exploremcallen.com/ | RGV Leather Weekend 2026 | CVB |
| FFAusten | https://ffausten.com/ | PNWLC 2026 | Sponsor |
| FIRE Orlando | https://www.fireorlando.com/ | The Woodshed | Community link |
| Kink Unlimited Events | https://kinkunlimitedevents.com/ | The Aphrodite Group | Partner |
| Leather Leadership Conference | https://www.leatherleadership.org/ | The Woodshed | Partner org |
| Marxx Productions | https://www.marxxproductions.com/rgvleatherweekend | RGV Leather Weekend 2026 | Productions |
| Mr S Leather | https://www.mr-s-leather.com/ | PNWLC 2026 | Retail sponsor |
| NCSF | https://ncsfreedom.org/ | SMIRC; The Woodshed | Deduped |
| NLA-International | https://www.nla-international.com/ | The Woodshed | Partner |
| Orlando Munch | https://orlandomunch.com/ | The Woodshed | Partner |
| Pigload | https://www.pigload.com/ | PNWLC 2026 | Sponsor |
| Redbubble (Woodshed Orlando) | https://www.redbubble.com/people/WoodshedOrlando/shop | The Woodshed | Merch |
| SE Leatherfest (secure portal) | https://www.secure.seleatherfest.com/ | The Woodshed | Related registration |
| Spunk Lube | https://www.spunklube.com/ | PNWLC 2026 | Sponsor |
| Square Peg Toys | https://www.squarepegtoys.com/ | PNWLC 2026 | Sponsor |
| STEP RGV | https://www.steprgv.com/ | RGV Leather Weekend 2026 | Partner |
| TAG Rochester | https://www.tagrochester.com/ | The Aphrodite Group | Partner |
| That Place Club | https://thatplace.club | OKC Kink Weekend 2026 | Venue |
| The LCA Esthetics | https://www.thelcaesthetics.com/ | RGV Leather Weekend 2026 | Local sponsor |
| Ticketleap (OPE) | https://ope.ticketleap.com/ | Oklahoma Power Exchange | Ticketing |
| TicketSpice (PNWLC) | https://pnwlcampout.ticketspice.com/pacific-northwest-leathermens-campout-2026 | PNWLC 2026 | Registration |
| Valley AIDS Council | https://www.valleyaids.org/ | RGV Leather Weekend 2026 | Nonprofit |
| Vitality Family Medical Group | https://www.vitalityfamilymedicalgroup.com/ | RGV Leather Weekend 2026 | Sponsor |
| WebRez (hotel package) | https://secure.webrez.com/hotel/4174/?package_id=341360&date_from=20260918&date_to=20260920 | MAUL 20th Anniversary Weekend | Hotel booking |
| Woodhull Freedom Foundation | https://www.woodhullfoundation.org/ | The Woodshed | Partner |

**Batch 4 — integrity / gaps:** `tes.org` may contain spam injection — treat as site issue, not sponsors. TESFest: no exhibitor URLs in pass. NEPAH; NWLC; Oblige main; Primal Arts; REAF; SPLF malformed Bluesky URL; Chicago Rose; Crow’s Nest; Metro Underground listing; Nest; Beltane; Twisted Tryst; Women of Drummer — no sponsor URLs in pass.

---

## Agent IDs (for follow-up in Cursor)

- Batch 0: `aa413381-6fd3-4003-86af-fb06b7178714`
- Batch 1: `b0fe60b0-3f31-42d3-b90c-79bfc476106d`
- Batch 2: `84855699-0085-404f-aaf8-453c5b440120`
- Batch 3: `de2ff887-43ca-aa0b-8efde82049dc`
- Batch 4: `d9ff396a-7403-4ada-9247-ad9680fb1602`

---

*Subagents: 5 × `generalPurpose` (fast). Regenerate URL batches: `node scripts/extract-listing-urls-for-vendor-scan.mjs`.*
