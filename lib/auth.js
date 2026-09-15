import { createHash } from 'crypto';
export const COOKIE='emmaus_auth';
export const token=()=>process.env.APP_PASSWORD?createHash('sha256').update('emmaus:'+process.env.APP_PASSWORD).digest('hex'):null;
