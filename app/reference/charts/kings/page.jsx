'use client';
import KingsChart from '../../../../components/charts/KingsChart.jsx';
export default function Page(){
  return <div className="wrap" style={{ maxWidth:1600 }}>
    <div className="crumb"><a href="/reference">Reference</a><span>/</span><a href="/reference/charts">Charts</a><span>/</span><span style={{ color:'var(--ink)' }}>Kings and prophets</span></div>
    <div className="lab" style={{ marginTop:36 }}>931 to 586 BC, both kingdoms and every prophet</div>
    <h1 className="h1" style={{ marginTop:8, fontSize:'clamp(44px,6vw,88px)' }}>Kings and Prophets</h1>
    <p style={{ fontSize:20, margin:'18px 0 0', maxWidth:820, color:'var(--dim)' }}>Nineteen kings in the north, none of them judged good. Twenty rulers in the south, eight of them good, all of David’s line. The prophets are drawn over the reigns they addressed, so you can see that Amos preached into Jeroboam II’s prosperity, that Isaiah outlived four kings, and that Jeremiah watched the end.</p>
    <div style={{ marginTop:28 }}><KingsChart /></div>
    <div className="sect"><div><div className="lab" style={{ color:'var(--ink)' }}>Worth knowing</div></div>
      <div className="grid2">{[
        ['Why the dates wobble','Judah counted a king’s first partial year as year one; Israel counted from the next New Year. Judah’s year began in autumn, Israel’s in spring. Co-regencies, where a son ruled alongside a sick or captive father, add overlaps. Edwin Thiele untangled most of it in the 1950s; his dates are used here.'],
        ['Anchors outside the Bible','Assyrian records fix Ahab at Qarqar in 853, Jehu’s tribute in 841, Menahem’s tribute in the 740s and the fall of Samaria in 722. Babylonian records fix 597 and 586. Everything else hangs from those.'],
        ['The refrain','"He did evil in the eyes of the LORD, walking in the ways of Jeroboam." Every northern king is judged by the golden calves, whatever else he did. Kings is theology written as history.'],
        ['Eight good kings','Asa, Jehoshaphat, Uzziah, Jotham, Hezekiah and Josiah without qualification; Joash and Amaziah began well. Only Hezekiah and Josiah are compared to David.'],
      ].map(([t,d])=><div key={t} className="card" style={{ padding:'18px 20px' }}><div style={{ fontSize:20, fontWeight:500, lineHeight:1.2 }}>{t}</div><p style={{ margin:'8px 0 0', color:'var(--dim)', fontSize:16 }}>{d}</p></div>)}</div></div>
  </div>;
}
