import { ico } from "../lib/icons.js";

export default function Icon({ name, size = 18, className = "" }) {
  return (
    <span
      className={`icon ${className}`}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: ico(name, size) }}
    />
  );
}
