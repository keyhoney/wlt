import { useState } from 'react';
import {
  Loader2,
  Copy,
  Check,
  Music,
  Languages,
  Globe,
  Sparkles,
  Heart,
  AudioLines,
  ArrowLeftRight,
  Layers,
  type LucideIcon,
} from 'lucide-react';

type FootnoteType =
  | 'word'
  | 'culture'
  | 'metaphor'
  | 'emotion'
  | 'rhythm'
  | 'translation'
  | 'context';

interface TranslationLine {
  original: string;
  pronunciation: string;
  translation: string;
  explanation: string | null;
  footnoteType?: FootnoteType | null;
}

interface TranslationResult {
  summary: string;
  lines: TranslationLine[];
}

const FOOTNOTE_ICONS: Record<
  FootnoteType,
  { icon: LucideIcon; color: string; label: string }
> = {
  word: { icon: Languages, color: 'text-gold', label: '어휘' },
  culture: { icon: Globe, color: 'text-gold-mid', label: '문화' },
  metaphor: { icon: Sparkles, color: 'text-gold', label: '은유·상징' },
  emotion: { icon: Heart, color: 'text-[#e8a0a0]', label: '감정' },
  rhythm: { icon: AudioLines, color: 'text-gold-mid', label: '리듬' },
  translation: { icon: ArrowLeftRight, color: 'text-gold-dark', label: '번역' },
  context: { icon: Layers, color: 'text-muted', label: '맥락' },
};

function resolveFootnoteType(
  type: FootnoteType | null | undefined,
  explanation: string,
): FootnoteType {
  if (type && type in FOOTNOTE_ICONS) return type;

  if (/라임|리듬|운율|음절|후렴|가창/.test(explanation)) return 'rhythm';
  if (/은유|비유|상징|의인화|이미지|시적/.test(explanation)) return 'metaphor';
  if (/문화|관용|속담|한국어/.test(explanation)) return 'culture';
  if (/감정|그리움|함의|애정|어조/.test(explanation)) return 'emotion';
  if (/서사|주제|곡 전체|역할/.test(explanation)) return 'context';
  if (/직역|단어|대응|어순/.test(explanation)) return 'word';
  return 'translation';
}

function Footnote({ explanation, footnoteType }: { explanation: string; footnoteType?: FootnoteType | null }) {
  const type = resolveFootnoteType(footnoteType, explanation);
  const { icon: Icon, color, label } = FOOTNOTE_ICONS[type];

  return (
    <div className="footnote-box mt-3 flex gap-2.5 items-start px-3.5 py-3">
      <span className={`shrink-0 mt-0.5 ${color}`} title={label} aria-label={label}>
        <Icon className="w-4 h-4" strokeWidth={2} />
      </span>
      <p className="text-[13px] text-muted leading-relaxed">{explanation}</p>
    </div>
  );
}

interface TranslationResult {
  summary: string;
  lines: TranslationLine[];
}

const TONE_OPTIONS = [
  { value: '직역에 가깝게', label: '직역', short: '직역' },
  { value: '자연스러운 의역', label: '자연스러운 의역', short: '의역' },
  { value: '라임과 리듬에 맞춰서', label: '라임·리듬 맞춤', short: '리듬' },
  { value: '시적인 느낌으로', label: '시적·예술적', short: '시적' },
] as const;

function getFullTranslation(lines: TranslationLine[]) {
  return lines.map((line) => line.translation).join('\n');
}

export default function LyricsTranslator() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [activeTone, setActiveTone] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTranslate = async (tone: string) => {
    if (!inputText.trim() || isTranslating) return;

    setIsTranslating(true);
    setActiveTone(tone);
    setResult(null);
    try {
      const response = await fetch('/api/translate/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, tone }),
      });

      if (!response.ok) throw new Error('Translation failed');

      const data = await response.json();
      setResult(data.result);
    } catch (error) {
      console.error(error);
      alert('번역 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsTranslating(false);
      setActiveTone(null);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(getFullTranslation(result.lines));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = inputText.split('\n').length;
  const hasInput = inputText.trim().length > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Input */}
      <section>
        <h2 className="section-label mb-2">원문 가사</h2>
        <div className="premium-card overflow-hidden">
          <div className="premium-card-header flex items-center justify-between px-5 py-3.5">
            <span className="text-sm font-medium text-ink">한국어</span>
            <span className="text-[12px] text-muted-2 tabular-nums">
              {inputText.length}자 · {lineCount}줄
            </span>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="가사를 붙여넣으세요"
            rows={8}
            className="w-full px-5 py-4 bg-transparent text-[16px] text-ink placeholder:text-muted-2/60 resize-none outline-none leading-relaxed min-h-[180px]"
          />
        </div>
      </section>

      {/* Tone selection */}
      <section>
        <h2 className="section-label mb-2">번역 방식</h2>
        <div className="grid grid-cols-2 gap-2">
          {TONE_OPTIONS.map(({ value, label, short }) => {
            const isActive = activeTone === value;
            const disabled = isTranslating || !hasInput;

            return (
              <button
                key={value}
                onClick={() => handleTranslate(value)}
                disabled={disabled}
                className="tone-chip"
              >
                <span
                  className={`tone-chip-inner flex items-center justify-center gap-1.5 ${
                    isActive ? 'tone-chip-inner--active' : ''
                  } ${disabled ? 'tone-chip-inner--disabled' : ''}`}
                >
                  {isActive && <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />}
                  <span className="hidden sm:inline">{isActive ? '분석 중...' : label}</span>
                  <span className="sm:hidden">{isActive ? '...' : short}</span>
                </span>
              </button>
            );
          })}
        </div>
        {!hasInput && (
          <p className="text-[13px] text-muted-2 mt-2.5 px-1">가사를 입력하면 번역 방식을 선택할 수 있습니다.</p>
        )}
      </section>

      {/* Results */}
      <section>
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="section-label mb-0">분석 결과</h2>
          {result && (
            <button onClick={handleCopy} className="btn-ghost-gold">
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>복사됨</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>영문 복사</span>
                </>
              )}
            </button>
          )}
        </div>

        {!result && !isTranslating && (
          <div className="premium-card flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="premium-logo w-14 h-14 rounded-xl mb-5">
              <Music className="w-6 h-6 text-gold-dark" />
            </div>
            <p className="text-[17px] font-semibold text-ink">번역 결과가 여기에 표시됩니다</p>
            <p className="text-[15px] text-muted-2 mt-1.5">위에서 번역 방식을 선택하세요</p>
          </div>
        )}

        {isTranslating && !result && (
          <div className="premium-card flex flex-col items-center justify-center py-16 px-6">
            <Loader2 className="w-9 h-9 animate-spin text-gold mb-5" />
            <p className="text-[17px] font-semibold text-ink">분석하는 중</p>
            <p className="text-[15px] text-muted-2 mt-1.5">문화적 맥락과 리듬을 살펴보고 있어요</p>
          </div>
        )}

        {result && (
          <div className="flex flex-col gap-4">
            <div className="premium-card p-5 sm:p-6">
              <p className="text-[12px] font-semibold gold-text uppercase tracking-[0.1em] mb-2">노래 맥락</p>
              <p className="text-[15px] text-muted leading-relaxed">{result.summary}</p>
            </div>

            <div className="premium-card overflow-hidden">
              {result.lines.map((line, idx) => {
                if (!line.original.trim() && !line.translation.trim()) {
                  return <div key={idx} className="h-3" />;
                }

                const hasMoreContent = result.lines
                  .slice(idx + 1)
                  .some((l) => l.original.trim() || l.translation.trim());

                return (
                  <div key={idx} className={`px-5 py-4 ${hasMoreContent ? 'premium-divider' : ''}`}>
                    <p className="text-[16px] text-ink leading-snug">{line.original}</p>
                    {line.pronunciation && (
                      <p className="text-[13px] text-muted-2 mt-0.5">{line.pronunciation}</p>
                    )}
                    <p className="text-[16px] font-semibold translation-highlight mt-2 leading-snug">
                      {line.translation}
                    </p>
                    {line.explanation && (
                      <Footnote explanation={line.explanation} footnoteType={line.footnoteType} />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="premium-card p-5 sm:p-6 border-gold-dark/30">
              <p className="text-[12px] font-semibold gold-text uppercase tracking-[0.1em] mb-3">전체 영문 번역</p>
              <p className="text-[16px] text-ink leading-relaxed whitespace-pre-wrap">
                {getFullTranslation(result.lines)}
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
