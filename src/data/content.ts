import type { SiteContent } from '../types';

/**
 * Site content. Add new activities, photos and videos here (see README).
 * Facebook blocks automated scraping, so items are curated manually from
 * https://www.facebook.com/ThaiPoliceBand/ — the live page feed is embedded
 * separately via the official Facebook Page Plugin.
 */
export const content: SiteContent = {
  name: 'ดุริยางค์ตำรวจ',
  nameEn: 'Royal Thai Police Band',
  division: 'ฝ่ายดนตรี กองสวัสดิการ สำนักงานกำลังพล สำนักงานตำรวจแห่งชาติ',
  divisionEn: 'Police Music Division · Welfare Division, Royal Thai Police',
  motto: 'ดนตรีเพื่อภารกิจของสำนักงานตำรวจแห่งชาติ',
  mottoEn: 'Music for the mission of the Royal Thai Police',
  tagline: 'ส่งต่อความสุขและเกียรติยศ ผ่านเสียงดนตรีของผู้พิทักษ์สันติราษฎร์',
  about: [
    'ดุริยางค์ตำรวจ ฝ่ายดนตรี กองสวัสดิการ สำนักงานตำรวจแห่งชาติ รับผิดชอบงานบริการด้านดนตรีสำหรับงานราชพิธี รัฐพิธี และพิธีการสำคัญของสำนักงานตำรวจแห่งชาติ รวมถึงหน่วยงานราชการอื่นที่ร้องขอ',
    'นอกจากงานพิธีการ ยังจัดการแสดงดนตรีเพื่อเป็นสวัสดิการแก่ข้าราชการตำรวจและประชาชน ดูแลงานวิชาการดนตรี การประพันธ์และเรียบเรียงเสียงประสาน และเปิดโรงเรียนการดนตรีสำหรับผู้สนใจ',
  ],
  facebookUrl: 'https://www.facebook.com/ThaiPoliceBand/',
  website: 'http://www.thaipoliceband.org',
  address: '91 หมู่ 4 ถนนแจ้งวัฒนะ ตำบลคลองเกลือ อำเภอปากเกร็ด จังหวัดนนทบุรี 11120',
  phone: '0-2205-2522',
  works: [
    {
      id: 'parade',
      title: 'วงโยธวาทิต',
      description: 'บรรเลงในงานสวนสนาม ราชพิธี และรัฐพิธี ด้วยความสง่างามและพร้อมเพรียง',
      image: '/media/parade-photo.webp',
    },
    {
      id: 'bagpipe',
      title: 'วงปี่สก็อต',
      description: 'เอกลักษณ์แห่งพิธีการ เสียงปี่และกลองที่สร้างความประทับใจในทุกงานสำคัญ',
      image: '/media/bagpipe-photo.webp',
    },
    {
      id: 'jazz',
      title: 'วงหัสดนตรี',
      description: 'วงดนตรีสากลสำหรับงานเลี้ยงรับรองและการแสดงเพื่อความบันเทิง',
      image: '/media/jazz.svg',
    },
    {
      id: 'chamber',
      title: 'เชมเบอร์มิวสิค',
      description: 'วงดนตรีขนาดเล็กสำหรับงานพิธีที่ต้องการความประณีตและเป็นทางการ',
      image: '/media/chamber.svg',
    },
    {
      id: 'thai',
      title: 'วงดนตรีไทย',
      description: 'สืบสานดนตรีไทย บรรเลงในงานประเพณีและพิธีการตามแบบแผน',
      image: '/media/thai-photo.webp',
    },
    {
      id: 'orchestra',
      title: 'Pop Orchestra',
      description: 'วงออร์เคสตราร่วมสมัย บรรเลงเพลงป็อปร่วมกับศิลปินรับเชิญในคอนเสิร์ตพิเศษ',
      image: '/media/orchestra.svg',
    },
  ],
  activities: [
    {
      id: 'kathin-2026',
      title: 'บรรเลงดนตรีในพิธีถวายผ้าพระกฐินพระราชทาน',
      date: '2026-11-12',
      location: 'พระอุโบสถวัดตรีทศเทพ',
      category: 'ceremony',
      summary:
        'วงดนตรีไทย ปฏิบัติราชการบรรเลงดนตรีในพิธีถวายผ้าพระกฐินพระราชทานของสำนักงานตำรวจแห่งชาติ',
      image: '/media/thai-photo.webp',
    },
    {
      id: 'thonglor-symphony-2026',
      title: 'THONG LOR: SYMPHONY OF GIVING',
      date: '2026-10-21',
      location: 'กรุงเทพมหานคร',
      category: 'concert',
      summary:
        'วง Pop Orchestra จากวงดุริยางค์ตำรวจ ร่วมกับศิลปินรับเชิญมากมาย ส่งต่อความสุขผ่านเสียงดนตรีในคอนเสิร์ตการกุศล',
      image: '/media/concert.svg',
      sourceUrl: 'https://www.facebook.com/ThaiPoliceBand/',
    },
    {
      id: 'police-songs-2023',
      title: '13 บทเพลง “ตำรวจ” ที่เลือกสรรแล้ว',
      date: '2023-10-02',
      location: 'สำนักงานตำรวจแห่งชาติ',
      category: 'community',
      summary:
        'ขับร้องและบรรเลงโดยวงดุริยางค์ตำรวจ ร่วมกับนักร้องยอดนิยมร่วมสมัย เพื่อปลุกจิตสำนึกแห่งความเป็นผู้พิทักษ์สันติราษฎร์',
      image: '/media/ceremony.svg',
      sourceUrl: 'https://human.police.go.th/2023/10/',
    },
    {
      id: 'world-police-band-23',
      title: 'งานแสดงวงดนตรีตำรวจโลก ครั้งที่ 23',
      date: '2018-12-20',
      location: 'เอเชียทีค เดอะ ริเวอร์ฟร้อนท์',
      category: 'concert',
      summary:
        'ประเทศไทยเป็นเจ้าภาพครั้งแรก ร่วมกับตำรวจนครบาลโตเกียว เมียนมา และสิงคโปร์ พร้อมขบวนพาเหรดดนตรีระยะทางกว่า 0.5 กิโลเมตร',
      image: '/media/festival.svg',
      sourceUrl: 'https://travelintrend.com/entertainment/music-entertainment/inter-police-band-at-asiatique.html',
    },
    {
      id: 'music-school',
      title: 'โรงเรียนการดนตรี ดุริยางค์ตำรวจ',
      date: '2026-10-23',
      location: 'ปากเกร็ด นนทบุรี',
      category: 'education',
      summary: 'เปิดสอนดนตรีภาคทฤษฎีและปฏิบัติสำหรับผู้สนใจทุกวัย โดยบุคลากรของดุริยางค์ตำรวจ',
      image: '/media/school-photo.webp',
    },
  ],
  photos: [
    { id: 'p1', src: '/media/concert.svg', alt: 'คอนเสิร์ตการกุศล', caption: 'คอนเสิร์ตการกุศล THONG LOR: SYMPHONY OF GIVING', category: 'concert' },
    { id: 'p2', src: '/media/orchestra.svg', alt: 'วง Pop Orchestra', caption: 'เบื้องหลังการซ้อมวง Pop Orchestra', category: 'concert' },
    { id: 'p3', src: '/media/parade-photo.webp', alt: 'วงโยธวาทิตดุริยางค์ตำรวจในชุดปกติขาว', caption: 'วงโยธวาทิตในงานพิธีการ', category: 'ceremony' },
    { id: 'p4', src: '/media/bagpipe-photo.webp', alt: 'วงปี่สก็อตดุริยางค์ตำรวจเดินเข้าสู่เวทีในงานประชุม', caption: 'วงปี่สก็อตบรรเลงในงานพิธี', category: 'ceremony' },
    { id: 'p5', src: '/media/festival.svg', alt: 'เทศกาลดนตรีตำรวจโลก', caption: 'ขบวนพาเหรดงานแสดงวงดนตรีตำรวจโลก ครั้งที่ 23', category: 'community' },
    { id: 'p6', src: '/media/thai-photo.webp', alt: 'วงดนตรีไทยดุริยางค์ตำรวจในพิธีถวายผ้าพระกฐิน', caption: 'วงดนตรีไทย พิธีถวายผ้าพระกฐินพระราชทาน วัดตรีทศเทพ', category: 'ceremony' },
    { id: 'p7', src: '/media/school-photo.webp', alt: 'ครูและนักเรียนโรงเรียนการดนตรี ดุริยางค์ตำรวจ', caption: 'ครูและนักเรียนโรงเรียนการดนตรี', category: 'education' },
    { id: 'p8', src: '/media/chamber.svg', alt: 'เชมเบอร์มิวสิค', caption: 'วงเชมเบอร์มิวสิคในงานเลี้ยงรับรอง', category: 'ceremony' },
  ],
  // Add Facebook or YouTube video URLs here, e.g.
  // { id: 'v1', title: '...', url: 'https://www.facebook.com/ThaiPoliceBand/videos/123', poster: '/media/concert.svg' }
  videos: [],
};
