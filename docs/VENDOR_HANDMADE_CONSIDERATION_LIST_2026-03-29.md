# Handmade / con-vendor consideration list — ECKE (2026-03-29)

**Source:** [`VENDOR_LEADS_MASTER_LISTING_SCAN_2026-03-29.md`](./VENDOR_LEADS_MASTER_LISTING_SCAN_2026-03-29.md) (not `.mdz` — use `.md`). Rows were split in [`VENDOR_CURATION_BATCHES.json`](./VENDOR_CURATION_BATCHES.json) (`node scripts/split-vendor-rows-for-curation.mjs`).

**Rule applied:** List only businesses that fit **handmade or small-batch maker goods** sold at **convention or dungeon vendor tables**. **Excluded:** travel/cruises/resorts, ticketing (Eventbrite, TicketSpice, Sickening, etc.), hotel blocks, CVBs, nonprofits/advocacy, medical/chiro, event producers, photographers, web-design credits, mailchimp, club venues, mass retail emporiums (e.g. The Dungeon Store, Mr S Leather), Redbubble/POD, brand-packaged lube at scale, X-Pole mass equipment, etc.

**Method:** **10 parallel `generalPurpose` (fast) subagents** each curated one batch from `VENDOR_CURATION_BATCHES.json` with light site checks. This document **merges** their **Recommend** rows, **dedupes by URL**, and rolls **Uncertain** into a single queue for human review.

---

## Recommended for `vendors.js` consideration (deduped by URL)

Sort alphabetically by brand. **Verify** each site and overlap with existing `src/data/vendors.js` before adding.

| Brand | Website | Notes |
| --- | --- | --- |
| 2V1 Dark Works | https://www.facebook.com/2V1darkworks | FB-only; confirm shop/maker before listing. |
| Agreeable Agony | https://agreeableagony.com/ | Tempest / maker collective. |
| Anubis Gear | https://www.anubisgear.com/ | MsC sponsor; designer-led gear. |
| Arcane Impact | https://arcaneimpact.com/ | Tempest vendor. |
| Awkward Artist Studio | https://www.awkwardartiststudio.com/ | CCFF; small-batch / Squarespace shop. |
| Bastille & Bags | https://www.the-bastille.com/ | Shrine vendor directory. |
| Barking Leather | https://www.barkingleather.com/ | MsC gold; leather maker. |
| Biggins Beatery / The Beatery | https://www.bigginsbeatery.com/ | Shrine vendor. |
| Bitches Love Leather | https://bllenterprises.com/ | DO Fusion vending list. |
| Bloody Rose Boutique | https://bloodyroseboutique.com/ | Shrine vendor. |
| BONEAFIDE | https://boneafide.store/ | Keystone vendor list. |
| Bound Bunny Boutique | https://etsy.me/2SHSOJA | Etsy (resolve redirect to canonical shop URL). |
| Broken Lance After Dark | https://www.etsy.com/shop/BrokenLanceAfterDark | Tempest / Etsy. |
| CaneLove (Canes4pain) | https://canelove.com/ | CCFF; impact canes. |
| CedarCreek Creations | https://www.facebook.com/cedarcreek.handmadecreations | FB; “handmadecreations”. |
| Chameleon Creations | https://www.facebook.com/ChameleonAfterDark/ | Shrine vendor. |
| Cockeye Kink | https://cockeyekink.com/ | PNWLC sponsor; fetish gear brand. |
| Delicious Boutique | https://www.deliciousboutique.com/ | Indie designers / handcrafted framing. |
| Dorie’s Designs | https://doriesdesigns.net/ | Chain maille; confirm site uptime. |
| Dulcis Doloris | https://www.etsy.com/shop/WTProductions | Shrine / Etsy. |
| Dungeon in a Bag | https://dungeoninabag.com/ | Portable dungeon furniture. |
| EF Leathercraft | https://www.efleathercraft.com/ | Already similar to EF Leather in vendors — **dedupe check**. |
| Emma Alamo | https://emmaalamo.com/ | Tempest vendor. |
| Fantasy Grove Toys | https://fantasygrove.com/ | Tempest. |
| Faire Treasures | https://www.fairetreasures.com/ | Shrine vendor. |
| FFäusten | https://ffausten.com/ | PNWLC sponsor; proprietary gear / shop. |
| Flogging Farmers | https://www.etsy.com/shop/FlogginFarmers | DO Fusion; **may already be in vendors** as Floggin Farmers. |
| Fontina + Co | https://www.fontinaco.com/ | Shrine vendor. |
| Forge and Fleece | https://www.etsy.com/shop/ForgeAndFleece | Tempest / Etsy. |
| From the Hoard | https://www.fromthehoard.com/ | Shrine vendor. |
| Heidi Sweet Sensations | https://heidisweetsensations.square.site/ | Shrine / Square. |
| Heretical Son Leatherwork | https://www.etsy.com/shop/HereticalSonLeather | Shrine / Etsy. |
| Holo Leathers | https://www.hololeathers.com/ | DO Fusion list. |
| JAFantasyArt | https://www.jafantasyart.com/ | Shrine vendor. |
| Kinbaku Studio | https://www.kinbaku-studio.com/ | Rope products / education-adjacent. |
| Kink Think Factory | https://www.kinkthinkfactory.com/ | Books / con merch table style. |
| Kilted Kink | https://kiltedkinktoys.square.site/ | Shrine / Square. |
| Kinky Nix | https://kinkynix.bigcartel.com/ | Shrine / Big Cartel. |
| Kink Works | https://www.etsy.com/shop/kinkworksrx | Shrine / Etsy. |
| KnottieKittie Rope | https://www.knottiekittie.com/ | Shrine vendor. |
| Kjones Pottery | https://kjonespottery.com/ | Tempest; pottery. |
| KNucks | https://www.myknucks.com/ | Keystone vendor. |
| Leather By Danny | https://www.leatherbydanny.com/ | Tempest + DO Fusion; normalize URL without `www` if preferred. |
| Lethal Ware | https://www.etsy.com/shop/LethalWare | Keystone / Etsy. |
| Lilfox Toy Box | https://www.etsy.com/shop/LilfoxToybox | DO Fusion / Etsy. |
| Ms Martha’s Corset Shoppe | https://corset1.com/ | CCFF new vendor. |
| Nadia Vanilla Fine Art | https://www.nadiavanilla.com/ | Tempest; artist. |
| Oh, Jessa! | https://ohjessa.com/ | Handmade apparel / corsetry; DO Fusion. |
| Pan’s Haven Candles & More | https://www.etsy.com/shop/PansHaven | Shrine / Etsy. |
| Pendragon Chainmail | https://www.etsy.com/shop/PendragonChainmail | DO Fusion / Etsy. |
| Perverted Pins | https://www.instagram.com/PervertedPins | IG-only pin maker. |
| Pixie and Paladin Crafts | https://facebook.com/pixiepaladin | FB “Crafts”. |
| PlusHii Kawaii | https://www.plushiikawaii.com/ | Tempest. |
| Raven Claw Rope | https://ravenclawrope.com/ | Shrine vendor. |
| Sire Don Leather | https://www.etsy.com/shop/SDLeather | CCFF / Etsy. |
| Skipjack Flog | https://www.etsy.com/shop/SkipjackFlog | Shrine / Etsy. |
| SnM Leatherworks | https://www.snmleatherworks.com/ | CCFF; family leather shop. |
| Spicy Kitten Designs | https://www.spicykittendesigns.com/ | Shrine vendor. |
| Spring Hill Wood Works | https://springhill-woodworks.com/ | MsC silver; woodworks. |
| Square Peg Toys | https://www.squarepegtoys.com/ | Handcrafted silicone; PNWLC sponsor. |
| The Fat Unicorn | https://www.etsy.com/shop/fatunicorncreations | DO Fusion / Etsy. |
| The Giggling Sadist | https://thegigglingsadist.com/ | Shrine vendor. |
| TheBeav Woodcrafting | https://www.thebeavwoodcrafting.com/ | CCFF; hardwood toys. |
| Too Hot to Handle Candles | https://www.toohotcandles.com/ | Wax play candles; vending events. |
| Unique Kink | https://uniquekink.com/ | CCFF; leather impact toys. |
| Vitromancy Arts | https://www.vitromancyart.com/ | Tempest; art/maker. |
| Wolfstryker Leather | https://wolfstryker.com/ | Keystone vendor. |

**Count:** ~**69** recommendation rows; **~65** unique canonical URLs after deduping EF/Floggin against existing vendors.

---

## Explicitly **not** for handmade vendor directory (policy)

Aggregated from all 10 agents: cruises (Bliss, Desire, Temptation, etc.), resorts (Sea Mountain, Hedonism), **ticketing** (Eventbrite, Eventbee, Sickening, Ticketleap, TicketSpice, Splash Takeovers, Buytickets.at, Retreat Guru, Naughty members checkout), **hotels** (Hyatt, Hilton/Passkey, Choice, WebRez), **CVB** (Experience Columbus, Explore McAllen), **nonprofits/advocacy** (Atlanta Pride as org, NCSF, Woodhull, SWOP, STEP RGV, Valley AIDS, MAsT International, Leather Leadership org, etc.), **medical** (Any Spine, Q Care, Vitality, Kind Clinic, LCA Esthetics), **photographers**, **mailchimp/eepurl**, **Appaloosa web hosting**, **Modern Lifestyle platform**, **Redbubble POD**, **Mr S Leather**, **The Dungeon Store**, **Spunk Lube** brand retail, **X-Pole**, **colette clubs** venue, **That Place** venue, **Eagle Portland** bar sponsor, **Ice Lounge** club network, **Metro Underground** beneficiary org, **Pigload** platform, **Marxx Productions**, **TAG Rochester** community space, **Kink Unlimited Events**, **FIRE Orlando**, **Orlando Munch**, **Fanatics / Official Band Shirts** mass merch, **Lifestyle Playtime** event/ticketing, **Kinky Trivia** event-first (agent judgment), and similar.

---

## Human review queue (uncertain / split agent opinion)

| Brand | URL | Issue |
| --- | --- | --- |
| Beyond Piercing | https://linktr.ee/BeyondPiercing | Service + jewelry; policy call. |
| Drool Apparel | https://droolapparel.com/ | Agent timeout; confirm small-batch vs mass apparel. |
| Free The Kink | https://freethekink.com/ | Merch vs media/advocacy. |
| Katherine McIntyre | https://www.katherine-mcintyre.com/ | Often author table — confirm product mix. |
| JP & DM Creations | https://m.facebook.com/100063674760870/ | FB-only numeric URL. |
| Le Château Exotique | https://www.fetishwear.com/ | Retail catalog vs artisan. |
| Goth Moth Studios | https://www.facebook.com/gothmothstudios | FB-only; confirm maker catalog. |
| Our Alibi | https://www.ouralibi4u.com/ | 404 in agent check. |
| PenguinAfterDark | https://www.penguinafterdark.com/ | Confirm maker vs general retail. |
| Regal Raiment | https://www.regalraiment.net/ | Handmade claim unclear. |
| Strings and Fibers | https://www.stringsandfibers.com/ | Fetch failed; likely rope vendor. |
| Vern’s Tavern | https://www.vernstavern.com/ | Wix placeholder in agent check. |
| Violet Wand Store | https://www.violetwands.com/ | Specialty retail vs maker. |
| Wicked Wishes Toys | https://www.facebook.com/WickedWishesToys/ | FB-only. |
| Wytchwàld Studios | https://www.instagram.com/wytchwald.studios/ | IG-only. |

---

## Subagent IDs (curation pass)

| Batch | Agent ID |
| --- | --- |
| 0 | `2cce7d1b-4ea0-48c1-9325-9434f3cdf021` |
| 1 | `9c59bde3-6150-4c6a-8e90-68cd3efe51f6` |
| 2 | `fbfb5f8d-6fbb-4473-a829-2c368156f668` |
| 3 | `dd2df37d-d100-4ce0-812d-65282ab492b9` |
| 4 | `1537879e-4c6e-4de9-b563-5591e2e40ece` |
| 5 | `1d09f591-1b26-4d51-bb3b-b27c3eb57033` |
| 6 | `c7f4a3d5-ae03-4856-87db-6a4b6de8b22a` |
| 7 | `d9a11026-eb32-4a1d-8958-1590a8c1e929` |
| 8 | `f0d01f84-d687-46cb-9a4f-515cdc12a377` |
| 9 | `997ef1e7-92ea-43f4-939c-d0c8041ecf75` |

---

## Already in `src/data/vendors.js` (skip unless updating tags/logo)

Compared **2026-03-29** to current `websiteUrl` values (same host or Etsy shop path):

| Consideration row | Matched `websiteUrl` |
| --- | --- |
| Bitches Love Leather (`bllenterprises.com`) | `https://www.bllenterprises.com/` |
| Barking Leather | `https://www.barkingleather.com/` |
| Broken Lance After Dark | `https://www.etsy.com/shop/BrokenLanceAfterDark` |
| CaneLove (`canelove.com`) | **Related:** directory has `https://canes4pain.com/index.htm` (same product line — do not add twice) |
| Delicious Boutique | `https://www.deliciousboutique.com/` |
| EF Leathercraft | `https://www.efleathercraft.com/` |
| Emma Alamo | `https://emmaalamo.com/` |
| Flogging Farmers | `https://www.etsy.com/shop/FlogginFarmers` |
| Holo Leathers | `https://www.hololeathers.com/` |
| Kinbaku Studio | `https://www.kinbaku-studio.com/` |
| Kink Think Factory | `https://www.kinkthinkfactory.com/` |
| SnM Leatherworks | `https://www.snmleatherworks.com/` |
| TheBeav Woodcrafting | `https://thebeavwoodcrafting.com/` |
| Unique Kink | `https://uniquekink.com/` |

**~55 net-new** domains/shops remain in the recommendation table after dropping the rows above (plus any you policy-exclude, e.g. FB-only).

---

## Next steps in repo

1. ~~Compare to `vendors.js`~~ — see table above; re-check after edits to `vendors.js`.  
2. For each new row: logo `125px`, `tagSlugs` from `vendorTaxonomy.ts`, `slug`, neutral description.  
3. Re-run curation after you tighten “handmade” (e.g. exclude all FB-only, or require Etsy/own domain).
