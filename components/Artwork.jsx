import { ARTWORK, artworkSvg } from '../lib/artwork.js';

// Decorative artwork is excluded from the accessibility tree; adjacent text names each section.
export default function Artwork({ id, className = '' }) {
  if (!ARTWORK[id]) return null;
  return <span className={`emmaus-art ${className}`} data-art={id} aria-hidden="true" dangerouslySetInnerHTML={{__html:artworkSvg(id)}} />;
}
