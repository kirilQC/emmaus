import Artwork from './Artwork.jsx';
export default function Footer(){
  return <footer>
    <div><a className="brand art-brand" aria-label="Emmaus" href="/"><Artwork id="logo" className="art-logo"/><Artwork id="wordmark" className="art-wordmark"/></a>
      <div style={{marginTop:10,maxWidth:340,fontStyle:'italic',fontFamily:"'Newsreader',Georgia,serif",fontSize:16}}>“He opened to us the Scriptures.” A personal study of the whole Bible.</div></div>
    <div style={{maxWidth:520,fontSize:12,lineHeight:1.5}}>Scripture quotations are taken from the Holy Bible, New Living Translation, copyright ©1996, 2004, 2015 by Tyndale House Foundation. Used by permission of Tyndale House Publishers, Carol Stream, Illinois 60188. All rights reserved.</div>
    <div className="cols">
      <div><div className="lab">Study</div><div style={{display:'flex',flexDirection:'column',gap:4}}><a href="/">Canon</a><a href="/explore">Explore</a><a href="/memorize">Memorise</a><a href="/notes">Notes</a><a href="/tutor">Tutor</a></div></div>
      <div><div className="lab">Built on</div><div style={{display:'flex',flexDirection:'column',gap:4}}><a href="https://www.tyndale.com" target="_blank" rel="noopener">New Living Translation, Tyndale House</a><a href="https://www.openbible.info" target="_blank" rel="noopener">OpenBible.info, CC BY</a><a href="https://bibleproject.com" target="_blank" rel="noopener">Videos by BibleProject</a><a href="https://www.stepbible.org" target="_blank" rel="noopener">STEP Bible data, CC BY</a></div></div>
    </div>
  </footer>;
}
