interface FuriganaProps {
  word: string;
  reading: string;
  show: boolean;
}

export function Furigana({ word, reading, show }: FuriganaProps) {
  if (!show || word === reading) return <span lang="ja">{word}</span>;
  return (
    <ruby lang="ja">
      {word}
      <rp>(</rp>
      <rt>{reading}</rt>
      <rp>)</rp>
    </ruby>
  );
}
