'use client';
import { useEffect, useRef, useState } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { PLACES } from '../lib/atlas/places.js';
import { BOOKS } from '../lib/data.js';

// Turns "Matthew 5:3" or "1 Kings 12:29" into /book/slug/ch
export function refHref(ref){ const m=ref.match(/^((?:[1-3] )?[A-Za-z ]+?) (\d+)/); if(!m) return null; const b=BOOKS.find(x=>x.name===m[1].trim()); return b?`/book/${b.slug}/${m[2]}`:null; }

const STYLE={
  version:8,
  glyphs:'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
  sources:{
    omt:{ type:'vector', url:'https://tiles.openfreemap.org/planet' },
    dem:{ type:'raster-dem', tiles:['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'], encoding:'terrarium', tileSize:256, maxzoom:14, attribution:'Terrain: Mapzen and AWS open data. Map data: OpenMapTiles, OpenStreetMap contributors, OpenFreeMap.' },
  },
  layers:[
    { id:'bg', type:'background', paint:{ 'background-color':'#221d16' } },
    { id:'hill', type:'hillshade', source:'dem', paint:{ 'hillshade-shadow-color':'#0d0a06', 'hillshade-highlight-color':'#5a4d3c', 'hillshade-accent-color':'#33291e', 'hillshade-exaggeration':0.6, 'hillshade-illumination-direction':320 } },
    { id:'water', type:'fill', source:'omt', 'source-layer':'water', paint:{ 'fill-color':'#121a1e' } },
    { id:'water-line', type:'line', source:'omt', 'source-layer':'water', paint:{ 'line-color':'#2a3b44', 'line-width':0.8 } },
    { id:'waterway', type:'line', source:'omt', 'source-layer':'waterway', filter:['in','class','river','canal'], paint:{ 'line-color':'#2a3b44', 'line-width':['interpolate',['linear'],['zoom'],5,0.4,9,1.4] } },
  ],
};
const FONT=['Noto Sans Regular']; const FONTB=['Noto Sans Bold'];
const coord=s=>typeof s==='string'?PLACES[s].c:s;

export default function AtlasMap({ def }){
  const el=useRef(null); const mapRef=useRef(null);
  const [visible,setVisible]=useState(()=>Object.fromEntries(def.routes.map(r=>[r.id,true])));
  const [sel,setSel]=useState(null);
  useEffect(()=>{
    let map; let cancelled=false;
    import('maplibre-gl').then(mod=>{ const maplibregl=mod.default||mod;
      // Turbopack cannot resolve MapLibre's module worker URL, so the worker is self hosted from /public.
      if(typeof maplibregl.setWorkerUrl==='function') maplibregl.setWorkerUrl('/maplibre/maplibre-gl-worker.mjs');
      if(cancelled||!el.current) return;
      map=new maplibregl.Map({ container:el.current, style:STYLE, center:def.view.center, zoom:def.view.zoom, attributionControl:{ compact:true }, cooperativeGestures:false });
      map.addControl(new maplibregl.NavigationControl({ showCompass:false }),'top-right');
      map.addControl(new maplibregl.ScaleControl({ maxWidth:120, unit:'metric' }),'bottom-left');
      mapRef.current=map;
      map.on('error',e=>{ console.warn('MAP ERROR', e && e.error && e.error.message, e && e.sourceId||''); });
      map.on('load',()=>{
        // Regions
        map.addSource('regions',{ type:'geojson', data:{ type:'FeatureCollection', features:def.regions.map(r=>({ type:'Feature', properties:{ name:r.name, color:r.color, ref:r.ref||'' }, geometry:{ type:'Polygon', coordinates:[[...r.ring,r.ring[0]]] } })) } });
        map.addLayer({ id:'regions-fill', type:'fill', source:'regions', paint:{ 'fill-color':['get','color'], 'fill-opacity':0.18 } },'water');
        map.addLayer({ id:'regions-line', type:'line', source:'regions', paint:{ 'line-color':['get','color'], 'line-width':1.2, 'line-opacity':0.75, 'line-dasharray':[3,2] } },'water');
        map.addSource('region-labels',{ type:'geojson', data:{ type:'FeatureCollection', features:[
          ...def.regions.map(r=>({ type:'Feature', properties:{ name:r.name.toUpperCase(), color:r.color, kind:'region' }, geometry:{ type:'Point', coordinates:centroid(r.ring) } })),
          ...def.labels.map(([n,c])=>({ type:'Feature', properties:{ name:n.toUpperCase(), color:'#a19a8e', kind:'label' }, geometry:{ type:'Point', coordinates:c } })),
        ] } });
        map.addLayer({ id:'region-labels', type:'symbol', source:'region-labels', layout:{ 'text-field':['get','name'], 'text-font':FONTB, 'text-size':['interpolate',['linear'],['zoom'],4,10,8,14], 'text-letter-spacing':0.18, 'text-max-width':8, 'text-allow-overlap':true }, paint:{ 'text-color':['get','color'], 'text-halo-color':'#171510', 'text-halo-width':1.4, 'text-opacity':0.9 } });
        // Routes
        def.routes.forEach(r=>{
          const feats=r.legs.map((l,i)=>({ type:'Feature', properties:{ leg:i, label:l.label, dashed:!!(l.dashed||r.dashed) }, geometry:{ type:'LineString', coordinates:l.stops.map(coord) } }));
          map.addSource('route-'+r.id,{ type:'geojson', data:{ type:'FeatureCollection', features:feats } });
          map.addLayer({ id:'route-'+r.id+'-halo', type:'line', source:'route-'+r.id, layout:{ 'line-cap':'round', 'line-join':'round' }, paint:{ 'line-color':'#171510', 'line-width':5, 'line-opacity':0.6 } });
          map.addLayer({ id:'route-'+r.id, type:'line', source:'route-'+r.id, layout:{ 'line-cap':'round', 'line-join':'round' }, paint:{ 'line-color':r.color, 'line-width':2.4, 'line-dasharray':['case',['get','dashed'],['literal',[2,2]],['literal',[1,0]]] } });
          map.addLayer({ id:'route-'+r.id+'-arrows', type:'symbol', source:'route-'+r.id, layout:{ 'symbol-placement':'line', 'symbol-spacing':90, 'text-field':'›', 'text-font':FONTB, 'text-size':18, 'text-keep-upright':false, 'text-allow-overlap':true }, paint:{ 'text-color':r.color, 'text-opacity':0.9 } });
        });
        // Places
        const pfeats=def.places.map(([n,refs,d,o={}])=>({ type:'Feature', properties:{ name:n, refs:JSON.stringify(refs), desc:d, refuge:!!o.refuge, capital:!!o.capital, approx:!!PLACES[n].approx }, geometry:{ type:'Point', coordinates:PLACES[n].c } }));
        map.addSource('places',{ type:'geojson', data:{ type:'FeatureCollection', features:pfeats } });
        map.addLayer({ id:'places-ring', type:'circle', source:'places', filter:['==',['get','refuge'],true], paint:{ 'circle-radius':9, 'circle-color':'rgba(0,0,0,0)', 'circle-stroke-color':'#ece7dc', 'circle-stroke-width':1.5 } });
        map.addLayer({ id:'places', type:'circle', source:'places', paint:{ 'circle-radius':['case',['get','capital'],6,4], 'circle-color':['case',['get','capital'],'#ece7dc','#d69282'], 'circle-stroke-color':'#171510', 'circle-stroke-width':1.5, 'circle-opacity':['case',['get','approx'],0.75,1] } });
        map.addLayer({ id:'place-labels', type:'symbol', source:'places', layout:{ 'text-field':['get','name'], 'text-font':FONT, 'text-size':['interpolate',['linear'],['zoom'],5,10,9,13], 'text-variable-anchor':['left','right','top','bottom'], 'text-radial-offset':0.7, 'text-justify':'auto', 'text-optional':true }, paint:{ 'text-color':'#ece7dc', 'text-halo-color':'#171510', 'text-halo-width':1.4 } });
        // Fit the view to everything drawn
        const all=[...def.places.map(p=>PLACES[p[0]].c), ...def.routes.flatMap(r=>r.legs.flatMap(l=>l.stops.map(coord))), ...def.regions.flatMap(r=>r.ring)];
        if(all.length){ const lons=all.map(c=>c[0]), lats=all.map(c=>c[1]); map.fitBounds([[Math.min(...lons),Math.min(...lats)],[Math.max(...lons),Math.max(...lats)]],{ padding:{ top:36, bottom:36, left:36, right:36 }, duration:0, maxZoom:9 }); }
        map.on('click','places',e=>{ const f=e.features[0]; setSel({ name:f.properties.name, refs:JSON.parse(f.properties.refs), desc:f.properties.desc, modern:PLACES[f.properties.name].modern, approx:PLACES[f.properties.name].approx }); });
        map.on('mouseenter','places',()=>map.getCanvas().style.cursor='pointer'); map.on('mouseleave','places',()=>map.getCanvas().style.cursor='');
        map.on('click',e=>{ const hits=map.queryRenderedFeatures(e.point,{ layers:['places'] }); if(!hits.length) setSel(null); });
      });
    });
    return ()=>{ cancelled=true; if(map) map.remove(); mapRef.current=null; };
  },[def.id]);
  useEffect(()=>{ const map=mapRef.current; if(!map||!map.isStyleLoaded()) return; def.routes.forEach(r=>{ const v=visible[r.id]?'visible':'none'; ['route-'+r.id,'route-'+r.id+'-halo','route-'+r.id+'-arrows'].forEach(id=>{ if(map.getLayer(id)) map.setLayoutProperty(id,'visibility',v); }); }); },[visible]);
  function flyTo(name){ const map=mapRef.current; if(!map) return; map.flyTo({ center:PLACES[name].c, zoom:Math.max(map.getZoom(),8), speed:0.8 }); const p=def.places.find(x=>x[0]===name); if(p) setSel({ name, refs:p[1], desc:p[2], modern:PLACES[name].modern, approx:PLACES[name].approx }); }
  return <div className="atlas">
    <div className="atlas-map" ref={el} />
    <div className="atlas-side">
      {def.routes.length>0 && <div className="card" style={{ padding:'14px 16px' }}><div className="lab" style={{ marginBottom:8 }}>Routes</div>
        {def.routes.map(r=><label key={r.id} className="atlas-route"><input type="checkbox" checked={!!visible[r.id]} onChange={e=>setVisible(v=>({ ...v, [r.id]:e.target.checked }))} /><span className="swatch" style={{ borderTopColor:r.color, borderTopStyle:r.dashed?'dashed':'solid' }} /><span>{r.label}</span></label>)}
      </div>}
      {def.regions.length>0 && <div className="card" style={{ padding:'14px 16px' }}><div className="lab" style={{ marginBottom:8 }}>Regions</div><div className="atlas-regions">{def.regions.map(r=><span key={r.name} className="chip" title={r.ref||''}><span className="dot" style={{ background:r.color }} />{r.name}</span>)}</div></div>}
      <div className="card" style={{ padding:'14px 16px', minHeight:120 }}>
        {sel ? <>
          <div className="lab" style={{ color:'var(--accent)' }}>{sel.name}</div>
          <div className="note" style={{ marginTop:2 }}>{sel.modern}{sel.approx?' · location approximate':''}</div>
          <p style={{ margin:'10px 0 0', fontSize:17 }}>{sel.desc}</p>
          {sel.refs.length>0 && <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:10 }}>{sel.refs.map(r=>{ const h=refHref(r); return h?<a key={r} className="chip" href={h}>{r}</a>:<span key={r} className="chip">{r}</span>; })}</div>}
        </> : <div className="note">Click a place on the map, or pick one below.</div>}
      </div>
      <div className="card" style={{ padding:'14px 16px' }}><div className="lab" style={{ marginBottom:8 }}>Places on this map</div><div className="atlas-places">{def.places.map(p=><button key={p[0]} className="opt" onClick={()=>flyTo(p[0])}>{p[0]}</button>)}</div></div>
    </div>
  </div>;
}
function centroid(ring){ let x=0,y=0; ring.forEach(([a,b])=>{ x+=a; y+=b; }); return [x/ring.length,y/ring.length]; }
