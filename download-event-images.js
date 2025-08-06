const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Image URLs and their corresponding filenames
const imageUrls = [
  {
    url: 'https://static.wixstatic.com/media/589c0f_d6a6ff6021494951bd7d19751b0ae952~mv2.jpg/v1/fill/w_259,h_231,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/589c0f_d6a6ff6021494951bd7d19751b0ae952~mv2.jpg',
    filename: 'smirc.jpg'
  },
  {
    url: 'https://darkodyssey.com/wp-content/uploads/2014/08/logo-do-300x97.png',
    filename: 'darkodyssey.png'
  },
  {
    url: 'https://masterslaveconference.org/wp-content/uploads/2021/06/MSC-Logo_6.png',
    filename: 'msc.png'
  },
  {
    url: 'https://images.squarespace-cdn.com/content/v1/65a42d3b1848d67c1c1681db/6609ee87-7bdc-48c2-8856-c9cb4b86a01b/image0.png?format=750w',
    filename: 'fornucopia.png'
  },
  {
    url: 'https://kinkykollege.com/wp-content/uploads/2022/10/heart.png',
    filename: 'kinkykollege.png'
  },
  {
    url: 'https://ohiosmart.org/resources/Pictures/Save%20the%20Date%20for%20Website.png',
    filename: 'ohiosmart.png'
  },
  {
    url: 'https://images.squarespace-cdn.com/content/v1/67a7c39d9cbc98548c660c78/1739047847346-XYLNL0KXJE8Y1ARLN0OV/eik.JPG?format=1500w',
    filename: 'eik.jpg'
  },
  {
    url: 'https://img1.wsimg.com/isteam/ip/611d1842-ded9-4e5d-82e0-46f0c62a301f/CCFF%20Transparent.png/:/rs=w:195,h:117,cg:true,m/cr=w:195,h:117/qt=q:95',
    filename: 'ccff.png'
  },
  {
    url: 'https://studio58events.com/wp-content/uploads/NoelHeader-1024x686.jpg',
    filename: 'naughtynoel.jpg'
  },
  {
    url: 'https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=182,fit=crop,q=95/AQEJbZGjDbt1Elr5/logo-thg-Aq2eQg9NJLf34eqE.png',
    filename: 'dungeonsgeekdoms.png'
  },
  {
    url: 'https://studio58events.com/wp-content/uploads/Gras_Header-300x200.png',
    filename: 'naughtygras.png'
  },
  {
    url: 'https://static.wixstatic.com/media/85cba3_f982359883a04bb9810af286522a54e6~mv2.png/v1/fill/w_590,h_177,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Converted-PNG.png',
    filename: 'fetcamp.png'
  },
  {
    url: 'https://images.squarespace-cdn.com/content/v1/579ecd416b8f5ba10892d03f/540d4f46-7a52-4f67-ac8f-cefddf529aa1/Naughty+Nawlins+Banner+600+X+200.2.png?format=2500w',
    filename: 'naughtynawlins.png'
  },
  {
    url: 'https://www.tesfest.org/wp-content/uploads/2025/07/TF-2026-Big-Red-Logo.png',
    filename: 'tesfest.png'
  },
  {
    url: 'https://static.wixstatic.com/media/aa0749_d8c05de044eb44e28e3941c477f4d6e2~mv2.png/v1/fill/w_600,h_159,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/TTGreenTitleOnly-051924.png',
    filename: 'twistedtyrst.png'
  },
  {
    url: 'https://www.campcrucible.com/wp-content/uploads/2015/01/CC_LOGO_web.png',
    filename: 'campcrucible.png'
  },
  {
    url: 'https://frolicon.com/wp-content/uploads/2025/06/Frolicon_Header2025-1024x315.png',
    filename: 'frolicon.png'
  },
  {
    url: 'https://smsprimalarts.com/wp-content/uploads/2023/07/primal-arts-flame.png?w=96&h=113',
    filename: 'primalarts.png'
  },
  {
    url: 'https://www.turtlehilleventco.com/uploads/8/7/7/8/87780478/img-4873_orig.jpg',
    filename: 'beltane.jpg'
  },
  {
    url: 'https://www.neehu.org/wp-content/uploads/2024/11/NEEHU-16-Banner-0.1-1200x600.png',
    filename: 'neehu.png'
  },
  {
    url: 'https://cdn.prod.website-files.com/5a849328ef2b990001bd77cb/5a849328ef2b990001bd7867_header2015.jpg',
    filename: 'rochester.jpg'
  },
  {
    url: 'https://tetheredtogether.net/wp-content/uploads/2022/09/Untitled-design-4.png',
    filename: 'tethered.png'
  },
  {
    url: 'https://charmedhypno.org/wpress/wp-content/uploads/2024/07/Charmed2025_logo_300x202.png',
    filename: 'charmed.png'
  }
];

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Function to download an image
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(imagesDir, filename);
    const protocol = url.startsWith('https:') ? https : http;
    
    const request = protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        const file = fs.createWriteStream(filepath);
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          console.log(`✅ Downloaded: ${filename}`);
          resolve();
        });
        
        file.on('error', (err) => {
          fs.unlink(filepath, () => {}); // Delete the file if there was an error
          reject(err);
        });
      } else {
        reject(new Error(`Failed to download ${filename}: ${response.statusCode}`));
      }
    });
    
    request.on('error', (err) => {
      reject(err);
    });
    
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error(`Timeout downloading ${filename}`));
    });
  });
}

// Download all images
async function downloadAllImages() {
  console.log('🖼️ Starting image downloads...');
  
  for (const image of imageUrls) {
    try {
      await downloadImage(image.url, image.filename);
    } catch (error) {
      console.log(`❌ Failed to download ${image.filename}: ${error.message}`);
    }
  }
  
  console.log('✅ Image download process completed!');
  console.log('📁 Images saved to: public/images/');
  console.log('🎨 You can now add these images to your events data');
}

downloadAllImages();
