// Exact approved drawings, framed from the original sheets without redrawing them.
// Coordinates exclude the presentation labels and rules. Next optimizes each sheet once.
import { getImageProps } from 'next/image';
const sources = Object.fromEntries(['study','stories','reference','details','road-logo'].map(name => {
  const width = name === 'road-logo' ? 1254 : 1536;
  const height = name === 'road-logo' ? 1254 : 1024;
  const path = `/art/${name}${name === 'road-logo' ? '' : '-sheet'}.png`;
  return [name, {width, height, src:getImageProps({src:path,width,height,alt:'',quality:75}).props.srcSet.split(', ')[0].split(' ')[0]}];
}));
export const ARTWORK = {
  A1:['study',70,130,440,325,'Canon'],
  A2:['study',600,100,360,355,'Explore'],
  A3:['study',1090,100,390,355,'Memorise'],
  A4:['study',75,550,415,350,'Notes'],
  A5:['study',540,565,450,335,'Tutor'],
  A6:['study',1060,565,410,335,'Library'],
  B1:['stories',50,90,440,370,'The sower'],
  B2:['stories',590,80,360,380,'The good shepherd'],
  B3:['stories',1040,130,460,335,'Follow me'],
  B4:['stories',50,548,410,357,'The mustard seed'],
  B5:['stories',555,570,440,345,'Loaves and fishes'],
  B6:['stories',1040,565,460,345,'The empty tomb'],
  C1:['reference',25,100,480,360,'Atlas'],
  C2:['reference',530,120,480,330,'Tabernacle'],
  C3:['reference',1040,120,480,330,'Jerusalem'],
  C4:['reference',35,560,465,345,'Kings and prophets'],
  C5:['reference',525,535,480,385,'Family lines'],
  C6:['reference',1040,530,475,375,'Ancient words'],
  D1:['details',50,95,435,365,'Olive corners'],
  D2:['details',530,190,480,190,'The chapter road'],
  D3:['details',1090,155,400,275,'Lamp for the path'],
  D4:['details',35,570,460,345,'At the table'],
  D5:['details',545,590,440,305,'Held in the heart'],
  D6:['details',1035,550,475,365,'Rest beside the way'],
  logo:['road-logo',400,220,470,345,'Emmaus'],
  wordmark:['road-logo',210,574,835,185,'Emmaus'],
};
export function artworkSvg(id) {
  const item=ARTWORK[id];
  if(!item) return '';
  const [sheet,x,y,w,h]=item;
  const source=sources[sheet];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" width="${w}" height="${h}" focusable="false"><svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${x} ${y} ${w} ${h}" overflow="hidden"><image href="${source.src.replaceAll('&','&amp;')}" width="${source.width}" height="${source.height}" filter="url(#emmaus-ink)"/></svg></svg>`;
}
export function art(id, className = '') {
  if (!ARTWORK[id]) return '';
  return `<span class="emmaus-art ${className}" data-art="${id}" aria-hidden="true">${artworkSvg(id)}</span>`;
}
export const sectionArt = { 'Read the text':'D3','Your notes':'D5','Sit with this':'D4','Paths through the Bible':'A2','Chapter by chapter':'A1' };
export function chapterArt(book,ch) {
  const themes={matthew:{1:'C5',4:'B3',13:'B1',14:'B5',18:'B2',26:'D4',28:'B6'},mark:{4:'B4',6:'B5',14:'D4',16:'B6'},luke:{8:'B1',13:'B4',15:'B2',22:'D4',24:'B6'},john:{6:'B5',10:'B2',20:'B6',21:'B3'},exodus:{25:'C2',26:'C2',27:'C2'},psalms:{23:'B2'}};
  return themes[book]?.[ch];
}
