/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Music2 } from 'lucide-react';
import LyricsTranslator from './components/LyricsTranslator';

export default function App() {
  return (
    <div className="min-h-screen bg-mesh flex flex-col">
      <header className="premium-header sticky top-0 z-50 safe-top">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="premium-logo shrink-0">
              <Music2 className="w-4 h-4 text-gold" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold tracking-[0.14em] gold-text uppercase truncate">
                Woo Sae-byuk Vocal Academy
              </p>
              <p className="text-sm font-medium text-muted truncate">Lyric Translation System</p>
            </div>
          </div>
          <span className="premium-badge hidden sm:inline-block shrink-0">가사 번역</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl w-full px-5 py-8 sm:py-10 flex-1 safe-bottom">
        <LyricsTranslator />
      </main>
    </div>
  );
}
