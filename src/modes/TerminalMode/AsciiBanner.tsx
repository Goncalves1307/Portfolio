// Art lives in content.ts (shared with the `banner` command). Built as an array
// of single-quoted strings (no template literal) so it can contain backslashes.
import { bannerArt } from '../../terminal/content';

const ART = bannerArt.join('\n');

export default function AsciiBanner() {
  return (
    <pre className="t-accent t-banner whitespace-pre leading-[1.1] text-[10px] xs:text-xs sm:text-sm select-none">
      {ART}
    </pre>
  );
}
