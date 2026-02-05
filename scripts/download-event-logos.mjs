#!/usr/bin/env node
/**
 * Downloads external event logos to public/images so the site does not depend
 * on third-party URLs. Run: node scripts/download-event-logos.mjs
 *
 * Writes: public/images/claw-26.svg, imslbb-2026.jpg, etc.
 */

import { writeFile, mkdir } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = join(__dirname, "..", "public", "images");

const LOGOS = [
  {
    url: "https://clawinfo.org/images/c26/CLAW26.svg",
    file: "claw-26.svg",
  },
  {
    url: "https://static.wixstatic.com/media/8b1836_4f24a3debc224bdba8d05ece64219329~mv2.jpg/v1/fill/w_239,h_84,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/IMsLBB%20gen%205.jpg",
    file: "imslbb-2026.jpg",
  },
  {
    url: "https://static.wixstatic.com/media/83bfb2_495a6c80484840789232a3405cc0c30b~mv2.png/v1/fill/w_190,h_136,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Excelsior50%20transparency.png",
    file: "fire-island-leather-weekend-2026.png",
  },
  {
    url: "https://ropecraft.net/wp-content/uploads/2021/12/Rebound-Logo-transparentback.png",
    file: "ropecraft-chicago-2026.png",
  },
  {
    url: "https://images.squarespace-cdn.com/content/v1/64d3c2e3bd1e28250d8e1855/cc0373b2-199a-407b-9d18-d882bea9474b/KINK24+Square+3.jpg?format=2500w",
    file: "kink-odyssey-spring-2026.jpg",
  },
  {
    url: "https://fetishcon.com/wp-content/uploads/2023/07/fc23-lf_only-logo.png",
    file: "fetish-con-2026.png",
  },
  {
    url: "https://static.wixstatic.com/media/638104_1abe7af1d7724a1abeb2c2485ca37676~mv2.png/v1/fill/w_910,h_661,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/Women%20of%20drummer%202026%20Advertisement%20.png",
    file: "women-of-drummer-2026.png",
  },
  {
    url: "https://modernlifestyle-prod.nyc3.cdn.digitaloceanspaces.com/3060596/51dd45d6-aae3-45fc-a33b-516ab58ed19e/original.png?v=rpo4o5",
    file: "domcon-new-orleans-2026.png",
  },
  {
    url: "https://static.wixstatic.com/media/463cc7_1de35aaa13ff4ddfa0458fba8deb9022~mv2.png/v1/fill/w_325,h_320,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/nepah%202026.png",
    file: "nepah-2026.png",
  },
  {
    url: "https://img1.wsimg.com/isteam/ip/bc3c98ba-50c5-4e90-9375-08a9f19bb7e9/leather-weekend-contestant-flyer.jpg/:/cr=t:5.56%25,l:0%25,w:100%25,h:79.96%25/rs=w:600,h:600,cg:true",
    file: "rehoboth-beach-leather-weekend-2025.jpg",
  },
  {
    url: "https://pleasurecationparty.com/resources/FullSizeRender.jpg.opt126x158o0%2C0s126x158.jpg",
    file: "pleasurecation-party.jpg",
  },
];

async function main() {
  await mkdir(IMAGES_DIR, { recursive: true });
  for (const { url, file } of LOGOS) {
    const path = join(IMAGES_DIR, file);
    try {
      const res = await fetch(url, { redirect: "follow" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      await writeFile(path, buf);
      console.log(`OK ${file}`);
    } catch (err) {
      console.error(`FAIL ${file}: ${err.message}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
