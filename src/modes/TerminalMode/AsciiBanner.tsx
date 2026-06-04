// Built as an array of single-quoted strings (no template literal) so the art
// can contain backslashes (escaped as \\) without any backtick/escape hazard.
const ART = [
  ' ___  _  ___   ___  ___  ',
  '|   \\| |/ _ \\ / __|/ _ \\ ',
  '| |) | | (_) | (_ | (_) |',
  '|___/|_|\\___/ \\___|\\___/ ',
].join('\n');

export default function AsciiBanner() {
  return (
    <pre className="t-accent t-banner whitespace-pre leading-[1.1] text-[10px] xs:text-xs sm:text-sm select-none">
      {ART}
    </pre>
  );
}
