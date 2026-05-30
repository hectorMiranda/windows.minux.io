// RFC4122-ish v4 id using crypto when available.
export function uuid() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  const b = new Uint8Array(16);
  (globalThis.crypto?.getRandomValues || fill)(b);
  b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, '0'));
  return `${h.slice(0,4).join('')}-${h.slice(4,6).join('')}-${h.slice(6,8).join('')}-${h.slice(8,10).join('')}-${h.slice(10).join('')}`;
}
function fill(arr){ for(let i=0;i<arr.length;i++) arr[i]=(i*131+7)&0xff; return arr; }
export function shortId(n=8){ return uuid().replace(/-/g,'').slice(0,n); }
