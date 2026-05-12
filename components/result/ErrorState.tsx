'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

const COPY: Record<string, string> = {
  invalid_input: '입력 정보를 다시 확인해 주세요.',
  config_missing: '서비스 설정에 문제가 있어요. 잠시 후 다시 와 주세요.',
  rate_limited: '요청이 잠시 많아요. 10 초 뒤에 다시 시도해 주세요.',
  upstream_error: '풀이 서버가 잠깐 응답하지 못했어요.',
  timeout: '응답이 길어지고 있어요.',
  parse_failed: '결과를 정리하다 막혔어요.',
  saju_calc_failed: '사주 계산 단계에서 막혔어요. 입력을 다시 확인해 주세요.',
  network_error: '네트워크 연결을 확인해 주세요.',
};

export function ErrorState({
  code, retryable, onRetry, message,
}: {
  code: string;
  retryable: boolean;
  onRetry: () => void;
  message?: string;
}) {
  return (
    <main className="min-h-[100dvh] flex flex-col items-center justify-center px-6 text-center gap-6">
      <h1 className="font-display text-2xl">잠시 막혔어요</h1>
      <p className="text-sm text-muted max-w-xs">{COPY[code] ?? '알 수 없는 오류가 발생했어요.'}</p>
      <div className="flex gap-3">
        {retryable && <Button onClick={onRetry}>다시 시도</Button>}
        <Link href="/"><Button variant="ghost">홈으로</Button></Link>
      </div>

      {/* Diagnostic details — collapsed by default. Click to expand. */}
      <details className="text-xs text-muted max-w-md w-full px-2 mt-4">
        <summary className="cursor-pointer select-none text-[11px] tracking-wider opacity-60 hover:opacity-100">
          디버그 정보 (오류 코드 · 메시지)
        </summary>
        <div className="mt-2 text-left text-[10px] leading-relaxed border border-border rounded p-3 break-all whitespace-pre-wrap">
          <div><span className="opacity-50">code:</span> <code>{code}</code></div>
          <div><span className="opacity-50">retryable:</span> <code>{String(retryable)}</code></div>
          {message && (
            <div className="mt-2">
              <span className="opacity-50">message:</span>
              <pre className="mt-1 opacity-80 whitespace-pre-wrap">{message}</pre>
            </div>
          )}
        </div>
      </details>
    </main>
  );
}
