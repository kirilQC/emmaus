'use client';
import Artwork from '../../components/Artwork.jsx';
import Memorise from '../../components/memorise/Memorise.jsx';
export default function Page(){
  return <>
    <div className="wrap" style={{ paddingBottom:0 }}>
      <Artwork id="A3" className="art-page-heading"/>
      <div className="lab">Verses you are learning</div>
      <h1 className="h1" style={{ marginTop:8, fontSize:'clamp(44px,7vw,96px)' }}>Memorise</h1>
    </div>
    <Memorise/>
  </>;
}
