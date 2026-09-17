import Artwork from '../../components/Artwork.jsx';
import ExploreSearch from '../../components/explore/ExploreSearch.jsx';
import { ico, pattern } from '../../lib/icons.js';
import { PEOPLE, ROLES, PARABLES, PLACES, EVENTS } from '../../lib/data.js';
import { MAPS } from '../../lib/atlas/maps.js';
import { DIAGRAMS } from '../../lib/diagrams/index.js';
import { CHARTS } from '../../lib/charts/tables.js';
import { ESSAYS } from '../../lib/background.js';
import { MODELS } from '../../lib/models/index.js';
import { LANES } from '../../lib/learn/lanes.js';
import { STUDIES, LANE_COUNTS, PATH, THEMES, QUESTIONS, SOURCES, TAGS } from '../../lib/learn/index.js';
export const metadata={ title:'Explore · Emmaus' };

const DRAWINGS=DIAGRAMS.length+MODELS.length, CHARTCOUNT=CHARTS.length+1;
function Tile({ href, kicker, title, art, icon, color, span, h }){
  return <a className="exp-tile" href={href} style={{ gridColumn:`span ${span}`, minHeight:h, borderColor:`color-mix(in srgb,${color} 34%,var(--line))`, backgroundImage:`${pattern(icon,color)},linear-gradient(155deg,color-mix(in srgb,${color} 26%,var(--card)),var(--card) 72%)` }}>
    <span className="exp-tile-copy"><span className="lab" style={{ color }}>{kicker}</span><span className="exp-tile-t">{title}</span></span>
    <Artwork id={art} className="exp-tile-art"/>
  </a>;
}
export default function Page(){
  const total=STUDIES.length+MAPS.length+DRAWINGS+CHARTCOUNT+ESSAYS.length+PEOPLE.length+PARABLES.length+PLACES.length+EVENTS.length+QUESTIONS.length;
  const rest=[
    ['The twenty lanes','lamp',LANES.map(([name,slug])=>[name,`/learn/${slug}`,LANE_COUNTS[slug]])],
    ['People, stories and places','compass',[['People',`/people`,PEOPLE.length],['Parables of Jesus','/parables',PARABLES.length],['Places','/places',PLACES.length],['Major events','/timeline',EVENTS.length],['Commandments and teachings','/commandments',3],['3D models','/reference/models',MODELS.length],['Diagrams','/reference/diagrams',DIAGRAMS.length]]],
    ['How this was built','scales',[['The method','/learn/method',''],['The source registry','/learn/sources',SOURCES.length],['Harder questions','/learn/questions',QUESTIONS.length],['Themes','/learn/themes',THEMES.length],['The guided path','/learn/path',PATH.length],['Tag pages','/learn/tag/providence',TAGS.length]]],
  ];
  return <div className="exp">
    <div className="exp-hero" style={{ backgroundImage:`${pattern('compass','var(--accent)')},radial-gradient(ellipse at 50% -20%, var(--accent-soft) 0%, var(--bg) 62%)` }}>
      <div className="lab exp-kicker">{STUDIES.length} studies · {MAPS.length} maps · {DRAWINGS} drawings and models · {CHARTCOUNT} charts · {ESSAYS.length} essays · {PARABLES.length} parables · {PEOPLE.length} people</div>
      <h1 className="h1 exp-h1">What do you want to understand?</h1>
      <ExploreSearch/>
    </div>
    <div className="wrap exp-body">
      <div className="exp-or"><span className="lab">Or wander in</span><span className="note">{total.toLocaleString()} pages, and every one links back to the chapter it explains</span></div>
      <div className="exp-grid">
        <Tile href="/learn/path" kicker={`A guided path · ${PATH.length} studies`} title="Start with the gospel, then the evidence system" art="D2" icon="road" color="var(--accent)" span={6} h={290}/>
        <Tile href="/learn/foundations" kicker={`${LANE_COUNTS.foundations} studies`} title="Foundations of the Christian Faith" art="B6" icon="heart" color="#8a3b2e" span={3} h={290}/>
        <Tile href="/learn/jesus" kicker={`${LANE_COUNTS.jesus} studies`} title="Jesus" art="B3" icon="fish" color="#4d6f95" span={3} h={290}/>
        <Tile href="/reference/atlas" kicker={`${MAPS.length} maps`} title="The Atlas" art="C1" icon="map" color="#6a8f6a" span={4} h={230}/>
        <Tile href="/reference/diagrams" kicker={`${DRAWINGS} plans, to the cubit`} title="Drawings and models" art="C2" icon="tablets" color="#b08d3f" span={4} h={230}/>
        <Tile href="/reference/charts" kicker={`${CHARTCOUNT} charts`} title="Charts and timelines" art="C4" icon="scales" color="#d9a441" span={4} h={230}/>
        <Tile href="/learn/difficult-passages" kicker={`${LANE_COUNTS['difficult-passages']} studies`} title="Difficult Passages" art="B2" icon="scales" color="#c96a3f" span={3} h={230}/>
        <Tile href="/learn/characters" kicker={`${LANE_COUNTS.characters} studies · ${PEOPLE.length} people`} title="Characters" art="C5" icon="person" color="#7a5c96" span={3} h={230}/>
        <Tile href="/learn/archaeology" kicker={`${LANE_COUNTS.archaeology} studies`} title="Archaeology" art="C3" icon="pin" color="#a35b3f" span={3} h={230}/>
        <Tile href="/reference/background" kicker={`${ESSAYS.length} essays`} title="Background essays" art="C6" icon="scroll" color="#6a8f6a" span={3} h={230}/>
        <Tile href="/learn/themes" kicker="Creation · Covenant · Exodus · Kingdom · Temple" title={`${THEMES.length} canonical themes`} art="B4" icon="link" color="var(--accent)" span={7} h={210}/>
        <Tile href="/learn/questions" kicker="Open problems, none settled here" title={`${QUESTIONS.length} harder questions`} art="B1" icon="spark" color="#d9b25c" span={5} h={210}/>
      </div>
      <div className="exp-rest">{rest.map(([title,icon,items])=><div key={title} className="exp-col">
        <div className="lab si" style={{ color:'var(--ink)' }}><span className="gi" dangerouslySetInnerHTML={{ __html:ico(icon,16) }}/><span>{title}</span></div>
        <div className="exp-links">{items.map(([name,href,n])=><a key={href+name} href={href}><span>{name}</span>{n!==''&&<span className="note">{n}</span>}</a>)}</div>
      </div>)}</div>
    </div>
  </div>;
}
