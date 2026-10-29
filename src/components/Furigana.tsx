const KANJI_CHARS = '\\u3400-\\u9fff\\uf900-\\ufaff\\u3005';
const KANJI = new RegExp(`[${KANJI_CHARS}]`);
const RUNS = new RegExp(`[${KANJI_CHARS}]+|[^${KANJI_CHARS}]+`, 'g');

type Segment = { text: string; reading?: string };

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Splits 連れて来る / つれてくる into 連(つ) れて 来(く) る, so furigana sits only on kanji. */
function segment(word: string, reading: string): Segment[] {
  const runs = word.match(RUNS) ?? [];
  const pattern = runs.map((run) => (KANJI.test(run) ? '(.+?)' : escapeRegExp(run))).join('');
  const match = reading.match(new RegExp(`^${pattern}$`));
  if (!match) return [{ text: word, reading }];

  let group = 1;
  return runs.map((run) =>
    KANJI.test(run) ? { text: run, reading: match[group++] } : { text: run },
  );
}

interface FuriganaProps {
  word: string;
  reading: string;
  show: boolean;
}

export function Furigana({ word, reading, show }: FuriganaProps) {
  if (!show || !KANJI.test(word)) return <span lang="ja">{word}</span>;

  return (
    <span lang="ja">
      {segment(word, reading).map(({ text, reading: ruby }, index) =>
        ruby ? (
          <ruby key={index}>
            {text}
            <rp>(</rp>
            <rt>{ruby}</rt>
            <rp>)</rp>
          </ruby>
        ) : (
          text
        ),
      )}
    </span>
  );
}
