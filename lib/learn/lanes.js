// Shared, client-safe metadata for the Learn library: lanes, grades, slugs.
export const LANES=[
 ['Foundations of the Christian Faith','foundations','cross','What Christians believe and why: God, Christ, Spirit, salvation, church and hope, each built from the passages.'],
 ['Bible Literacy','bible-literacy','book','How the library is arranged and how to read each kind of book well.'],
 ['Jesus','jesus','fish','Settings, sayings, signs and titles the Gospels assume you already know.'],
 ['New Testament','new-testament','letter','The letters and the churches that first read them.'],
 ['Acts','acts','flame','The Spirit and the church from Jerusalem outward.'],
 ['Paul','paul','road','Journeys, letters, co-workers, and the dates that are still argued over.'],
 ['Biblical Theology','biblical-theology','layers','Themes traced from Genesis to Revelation without flattening either end.'],
 ['Connections Across Scripture','connections','link','Quotation, echo, promise and fulfilment, with each link graded honestly.'],
 ['Geography','geography','map','Routes and regions, with the evidence for every line on the map.'],
 ['Visual Reconstructions','visual-reconstructions','tablets','Plans, scales and timelines drawn from the text’s own numbers, with what the illustrator had to supply kept separate.'],
 ['Characters','characters','person','The people the story turns on, including the ones usually skipped.'],
 ['History','history','crown','Kings, empires and dates the Bible takes for granted.'],
 ['Ancient History','ancient-history','globe','Egypt, Assyria, Babylon, Persia, Greece and Rome as the text meets them.'],
 ['Ancient Near Eastern Studies','ancient-near-east','scroll','Neighbouring texts and customs, and what they can and cannot explain.'],
 ['Second Temple Judaism','second-temple','lamp','The Judaism Jesus and Paul lived inside.'],
 ['Archaeology','archaeology','pin','What the ground has turned up, and what it does and does not establish.'],
 ['Original Languages','original-languages','quote','Hebrew and Greek words where the translation makes a difference.'],
 ['Textual Criticism','textual-criticism','search','How the text reached us and where the manuscripts differ.'],
 ['Difficult Passages','difficult-passages','scales','Texts that resist easy reading, with each view given its best case.'],
 ['Advanced Studies','advanced','star','Deep dives for readers who want the whole argument.'],
];
export const laneBySlug=s=>LANES.find(l=>l[1]===s);
export const laneByName=n=>LANES.find(l=>l[0]===n);
export const DIFFICULTY=['Foundational','Intermediate','Advanced','Deep Dive','Specialist'];
export const CONFIDENCE=['Very High','High','Moderate'];
// Full grade name -> [short label, css key, definition from the book's evidence vocabulary]
export const EVIDENCE={
 'Explicitly supported by Scripture':['Explicit','explicit','The passage states the claim or directly makes the connection.'],
 'Strong scriptural inference':['Inference','inference','Several passages support a synthesis that is not stated in one sentence.'],
 'Historically supported':['Historical','historical','External evidence bears on setting or plausibility.'],
 'Debated interpretation':['Debated','debated','Responsible readers disagree.'],
 'Speculative':['Speculative','speculative','Useful as a question or a design experiment, but not to be presented as established.'],
};
export const EVIDENCE_ORDER=Object.keys(EVIDENCE);
export const gradeOf=ev=>EVIDENCE[ev]||[ev,'speculative',''];
export const slugify=s=>String(s).toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export const studyPath=s=>`/learn/study/${s.id.toLowerCase()}-${slugify(s.title)}`;
export const lanePath=name=>`/learn/${(laneByName(name)||LANES[0])[1]}`;
export const tagPath=name=>`/learn/tag/${slugify(name)}`;
