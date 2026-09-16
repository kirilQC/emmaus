import { ico } from '../../lib/icons.js';
// Sends a question to the tutor, with the study's own passage as the default subject when there is one.
export default function AskChip({ q, book, ch, label='Ask the tutor' }){
  const href='/tutor?q='+encodeURIComponent(q)+(book&&ch?`&book=${book}&ch=${ch}`:'');
  return <a className="chip" href={href}><span dangerouslySetInnerHTML={{ __html:ico('spark',12) }}/>{label}</a>;
}
