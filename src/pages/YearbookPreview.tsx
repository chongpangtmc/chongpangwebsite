import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FileText } from 'lucide-react';

type YearbookPage = {
  number: number;
  src: string;
};

const YearbookPreview = () => {
  const pageCount = 238;
  const pages = useMemo(() => Array.from({ length: pageCount }, (_, index) => {
    const pageNumber = String(index + 1).padStart(3, '0');
    return {
      number: index + 1,
      src: `/yearbook-pages-v5/page-${pageNumber}.jpg`,
    };
  }), []);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [isSinglePageMode, setIsSinglePageMode] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
  ));
  const [turnState, setTurnState] = useState<{ direction: 'next' | 'previous'; targetPage: number; active: boolean } | null>(null);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const turnTimerRef = useRef<number | null>(null);

  const isCover = currentPage === 1;
  const leftPage = pages[currentPage - 1];
  const rightPage = !isCover ? pages[currentPage] : undefined;
  const targetIsCover = turnState?.targetPage === 1;
  const targetLeftPage = turnState ? pages[turnState.targetPage - 1] : undefined;
  const targetRightPage = turnState && !targetIsCover ? pages[turnState.targetPage] : undefined;
  const visibleRightPage = isSinglePageMode ? undefined : rightPage;
  const targetVisibleRightPage = isSinglePageMode ? undefined : targetRightPage;
  const turningFrontPage = isSinglePageMode
    ? leftPage
    : turnState?.direction === 'next' ? (rightPage || leftPage) : leftPage;
  const turningBackPage = isSinglePageMode
    ? targetLeftPage
    : turnState?.direction === 'next' ? targetLeftPage : (targetRightPage || targetLeftPage);

  const getPreviousPage = useCallback((page: number) => {
    if (page <= 1) return 1;
    if (isSinglePageMode) return page - 1;
    return page === 2 ? 1 : page - 2;
  }, [isSinglePageMode]);

  const getNextPage = useCallback((page: number) => {
    if (page >= pageCount) return page;
    if (isSinglePageMode) return page + 1;
    return page === 1 ? 2 : Math.min(page + 2, pageCount);
  }, [isSinglePageMode, pageCount]);

  const stopPageTurn = useCallback(() => {
    if (turnTimerRef.current) {
      window.clearTimeout(turnTimerRef.current);
      turnTimerRef.current = null;
    }

    setTurnState(null);
  }, []);

  const getSpreadStartForPage = useCallback((page: number) => {
    const clampedPage = Math.min(Math.max(page, 1), pageCount);
    if (isSinglePageMode) return clampedPage;
    if (clampedPage === 1) return 1;
    if (clampedPage === pageCount && clampedPage % 2 === 1) return clampedPage;
    return clampedPage % 2 === 0 ? clampedPage : clampedPage - 1;
  }, [isSinglePageMode, pageCount]);

  const jumpToPage = useCallback((page: number) => {
    if (!Number.isFinite(page)) return;

    const clampedPage = Math.min(Math.max(Math.round(page), 1), pageCount);
    stopPageTurn();
    setCurrentPage(getSpreadStartForPage(clampedPage));
    setPageInput(String(clampedPage));
  }, [getSpreadStartForPage, pageCount, stopPageTurn]);

  const moveWithPageTurn = useCallback((direction: 'next' | 'previous') => {
    if (turnState) return;

    const nextPage = direction === 'next' ? getNextPage(currentPage) : getPreviousPage(currentPage);
    if (nextPage === currentPage) return;

    setTurnState({ direction, targetPage: nextPage, active: false });
    requestAnimationFrame(() => {
      setTurnState({ direction, targetPage: nextPage, active: true });
    });

    if (turnTimerRef.current) {
      window.clearTimeout(turnTimerRef.current);
    }

    turnTimerRef.current = window.setTimeout(() => {
      setCurrentPage(nextPage);
      setPageInput(String(nextPage));
      setTurnState(null);
      turnTimerRef.current = null;
    }, 520);
  }, [currentPage, turnState, getNextPage, getPreviousPage]);

  const renderPage = (page: YearbookPage, className = '') => (
    <figure className={`bg-white overflow-hidden md:rounded-xl md:shadow-lg md:border md:border-slate-200 ${className}`}>
      <img
        src={page.src}
        alt={`友诺士华语讲演会 30周年年刊 第 ${page.number} 页`}
        className="w-full h-auto block select-none"
        draggable={false}
      />
      <figcaption className="hidden md:block px-4 py-2 text-center text-xs font-bold text-slate-400">
        {page.number} / {pageCount}
      </figcaption>
    </figure>
  );

  const renderSpread = (
    spreadLeftPage: YearbookPage,
    spreadRightPage?: YearbookPage,
    hiddenSide?: 'left' | 'right',
  ) => (
    <div className={`grid gap-3 sm:gap-4 ${!spreadRightPage ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
      {renderPage(spreadLeftPage, hiddenSide === 'left' ? 'md:opacity-0' : '')}
      {spreadRightPage && renderPage(spreadRightPage, hiddenSide === 'right' ? 'md:opacity-0' : '')}
    </div>
  );

  const goPrevious = useCallback(() => {
    moveWithPageTurn('previous');
  }, [moveWithPageTurn]);

  const goNext = useCallback(() => {
    moveWithPageTurn('next');
  }, [moveWithPageTurn]);

  const handlePageSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const requestedPage = Number(pageInput);
    if (!Number.isFinite(requestedPage)) {
      setPageInput(String(currentPage));
      return;
    }

    jumpToPage(requestedPage);
  };

  const handleSwipeStart = (clientX: number, clientY: number) => {
    swipeStartRef.current = { x: clientX, y: clientY };
  };

  const handleSwipeEnd = (clientX: number, clientY: number) => {
    const start = swipeStartRef.current;
    swipeStartRef.current = null;
    if (!start) return;

    const deltaX = clientX - start.x;
    const deltaY = clientY - start.y;
    const isHorizontalSwipe = Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4;

    if (!isHorizontalSwipe) return;
    if (deltaX < 0) goNext();
    if (deltaX > 0) goPrevious();
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const syncPageMode = () => {
      setIsSinglePageMode(mediaQuery.matches);
    };

    syncPageMode();
    mediaQuery.addEventListener('change', syncPageMode);
    return () => mediaQuery.removeEventListener('change', syncPageMode);
  }, []);

  useEffect(() => {
    if (isSinglePageMode) return;

    setCurrentPage((page) => getSpreadStartForPage(page));
  }, [getSpreadStartForPage, isSinglePageMode]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping = target && (
        target.tagName === 'INPUT'
        || target.tagName === 'TEXTAREA'
        || target.tagName === 'SELECT'
        || target.isContentEditable
      );

      if (isTyping) return;
      if (event.key === 'ArrowLeft') goPrevious();
      if (event.key === 'ArrowRight') goNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrevious]);

  useEffect(() => {
    return () => {
      if (turnTimerRef.current) {
        window.clearTimeout(turnTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-slate-100 min-h-screen md:pt-20">
      <div className="hidden md:block sticky top-16 z-20 bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#772432]/10 text-[#772432] flex items-center justify-center">
              <FileText size={22} />
            </div>
            <div className="min-w-0">
              <h1 className="text-slate-900 font-black text-lg sm:text-xl">友诺士华语讲演会 30周年年刊</h1>
              <p className="text-slate-500 text-xs sm:text-sm font-medium">翻页预览 · 共 {pageCount} 页</p>
            </div>
          </div>
          <div className="flex flex-col sm:items-end gap-2">
            <div className="text-sm font-black text-slate-600">
              {isCover || !visibleRightPage ? `${currentPage}` : `${currentPage}-${visibleRightPage.number}`} / {pageCount}
            </div>
            <form onSubmit={handlePageSubmit} className="flex w-full sm:w-auto items-center gap-2">
              <label htmlFor="yearbook-page-jump" className="shrink-0 text-[11px] font-bold text-slate-400">
                跳到
              </label>
              <input
                id="yearbook-page-jump"
                type="number"
                inputMode="numeric"
                min={1}
                max={pageCount}
                value={pageInput}
                onChange={(event) => setPageInput(event.target.value)}
                onBlur={() => {
                  if (!pageInput) setPageInput(String(currentPage));
                }}
                className="h-10 w-full sm:w-24 rounded-lg border border-slate-200 bg-slate-50 px-3 text-center text-sm font-black text-slate-700 outline-none transition focus:border-[#004165] focus:bg-white focus:ring-2 focus:ring-[#004165]/10"
                aria-label="输入页码"
              />
              <button
                type="submit"
                className="h-10 shrink-0 rounded-lg bg-[#004165] px-4 text-sm font-black text-white transition hover:bg-[#00304b] active:scale-95"
              >
                前往
              </button>
            </form>
            <p className="text-[11px] font-bold text-slate-400">左右滑动翻页</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-none px-0 py-0 md:max-w-6xl md:px-6 md:py-8">
        <div
          className="relative min-h-[100svh] cursor-grab active:cursor-grabbing touch-pan-y flex items-start justify-center bg-slate-100 md:block md:min-h-0 md:bg-transparent"
          onPointerDown={(event) => handleSwipeStart(event.clientX, event.clientY)}
          onPointerUp={(event) => handleSwipeEnd(event.clientX, event.clientY)}
          onPointerCancel={() => { swipeStartRef.current = null; }}
          onPointerLeave={() => { swipeStartRef.current = null; }}
        >
          <div
            className="relative mx-auto pb-20 md:pb-0"
            style={{ perspective: '1800px' }}
          >
            <div
              className={`relative mx-auto ${
                turnState
                  ? !targetVisibleRightPage ? 'max-w-2xl' : 'max-w-6xl'
                  : isCover || !visibleRightPage ? 'max-w-2xl' : 'max-w-6xl'
              }`}
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              {turnState && targetLeftPage
                ? renderSpread(targetLeftPage, targetVisibleRightPage)
                : renderSpread(leftPage, visibleRightPage)}

              {turnState && (
                <div className="absolute inset-0 z-20 pointer-events-none md:hidden" aria-hidden="true">
                  <div
                    className={`relative h-full w-full transition-transform duration-500 ease-in-out ${
                      turnState.direction === 'next' ? 'origin-left' : 'origin-right'
                    }`}
                    style={{
                      backfaceVisibility: 'hidden',
                      transformStyle: 'preserve-3d',
                      willChange: 'transform',
                      transform: turnState.active
                        ? `rotateY(${turnState.direction === 'next' ? '-178deg' : '178deg'})`
                        : 'rotateY(0deg)',
                    }}
                  >
                    <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
                      {renderSpread(leftPage, visibleRightPage)}
                      <div className="absolute inset-0 bg-gradient-to-l from-black/20 via-transparent to-white/20" />
                    </div>
                    <div
                      className="absolute inset-0"
                      style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                      }}
                    >
                      {targetLeftPage && renderSpread(targetLeftPage, targetVisibleRightPage)}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-white/20" />
                    </div>
                  </div>
                </div>
              )}

              {turnState && (
                <div className="absolute inset-0 z-10 hidden md:block pointer-events-none" aria-hidden="true">
                  {renderSpread(leftPage, visibleRightPage, turnState.direction === 'next' ? 'right' : 'left')}
                </div>
              )}

              {turnState && turningFrontPage && turningBackPage && (
                <div
                  className={`absolute top-0 z-30 hidden md:block pointer-events-none ${
                    turnState.direction === 'next'
                      ? 'right-0 w-[calc(50%-0.5rem)]'
                      : 'left-0 w-[calc(50%-0.5rem)]'
                  }`}
                  aria-hidden="true"
                >
                  <div
                    className={`relative transition-transform duration-500 ease-in-out ${
                      turnState.direction === 'next' ? 'origin-left' : 'origin-right'
                    }`}
                    style={{
                      backfaceVisibility: 'hidden',
                      transformStyle: 'preserve-3d',
                      willChange: 'transform',
                      transform: turnState.active
                        ? `rotateY(${turnState.direction === 'next' ? '-178deg' : '178deg'})`
                        : 'rotateY(0deg)',
                    }}
                  >
                    <div className="relative" style={{ backfaceVisibility: 'hidden' }}>
                      {renderPage(turningFrontPage, 'shadow-2xl border-slate-300')}
                      <div className="absolute inset-0 bg-gradient-to-l from-black/25 via-transparent to-white/20" />
                    </div>
                    <div
                      className="absolute inset-0"
                      style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                      }}
                    >
                      {renderPage(turningBackPage, 'shadow-2xl border-slate-300')}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-white/25" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="fixed inset-x-0 bottom-0 z-30 md:hidden pointer-events-none">
            <div className="mx-auto max-w-sm px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <div className="rounded-2xl bg-slate-950/70 px-4 py-3 text-center text-white shadow-2xl backdrop-blur-md">
                <p className="text-sm font-black leading-tight">友诺士华语讲演会 30周年年刊</p>
                <p className="mt-1 text-xs font-bold text-white/75">
                  第 {currentPage} 页 / 共 {pageCount} 页
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 hidden md:flex justify-center">
          <input
            type="range"
            min={1}
            max={pageCount}
            value={currentPage}
            onChange={(event) => jumpToPage(Number(event.target.value))}
            className="w-full max-w-xl accent-[#004165]"
            aria-label="选择页码"
          />
        </div>
      </div>
    </div>
  );
};

export default YearbookPreview;
