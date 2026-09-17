// Prints the tutor's system prompt, exactly as the API sends it.
// Copy the voice section into Vercel as TUTOR_SYSTEM_PROMPT to edit it without a deploy.
//   node scripts/tutor-prompt.mjs           the whole prompt
//   node scripts/tutor-prompt.mjs --voice   just the editable part
import { VOICE, CONTRACT, systemPrompt, promptSource } from '../lib/tutor/prompt.js';
if(process.argv.includes('--voice')) console.log(VOICE);
else if(process.argv.includes('--contract')) console.log(CONTRACT);
else { console.error(`# source: ${promptSource()}\n`); console.log(systemPrompt()); }
