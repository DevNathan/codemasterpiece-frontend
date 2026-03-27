"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/shadcn/dialog";
import { Button } from "@/shared/components/shadcn/button";
import { Checkbox } from "@/shared/components/shadcn/checkbox";
import { ScrollArea } from "@/shared/components/shadcn/scroll-area";
import { CookieManager } from "@/shared/module/cookieManager";
import SessionStorage from "@/shared/module/sessionStorage";
import { COOKIES } from "@/lib/constants/cookies";

const ONE_YEAR = 60 * 60 * 24 * 365;
const SESSION_LATCH_KEY = "policy_auto_open_latch";

type Props = {
  open?: boolean;
  onOpenChangeAction?: (open: boolean) => void;
  autoOpenIfNotAck?: boolean;
};

/**
 * @component PolicyDialog
 * @description 사이트 정책 및 개인정보 처리방침을 안내하는 다이얼로그 컴포넌트입니다.
 * React 19의 연쇄 렌더링 방지 규칙을 준수하여 렌더링 단계에서 쿠키 상태를 동기화합니다.
 */
export default function PolicyDialog({
  open,
  onOpenChangeAction,
  autoOpenIfNotAck = true,
}: Props) {
  /**
   * 클라이언트 환경 여부를 확인하기 위한 외부 스토어 동기화 훅입니다.
   */
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const alreadyAcked = useMemo(
    () =>
      isClient ? CookieManager.getItem(COOKIES.POLICY_ACK) === "1" : false,
    [isClient],
  );

  const sessionLatched = useMemo(
    () =>
      isClient
        ? SessionStorage.getItem<boolean>(SESSION_LATCH_KEY) === true
        : false,
    [isClient],
  );

  const isControlled = typeof open === "boolean";
  const shouldAutoOpen =
    isClient && autoOpenIfNotAck && !alreadyAcked && !sessionLatched;

  const [internalOpen, setInternalOpen] = useState<boolean>(false);
  const shown = isControlled ? (open as boolean) : internalOpen;

  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [prevShown, setPrevShown] = useState(shown);

  /**
   * 다이얼로그가 열릴 때 현재 쿠키 상태를 읽어와 체크박스와 동기화합니다.
   * 연쇄 렌더링(Cascading Render)을 방지하기 위해 useEffect 대신 렌더링 단계에서 상태를 즉시 조정합니다.
   */
  if (shown !== prevShown) {
    setPrevShown(shown);
    if (shown && isClient) {
      setDontShowAgain(CookieManager.getItem(COOKIES.POLICY_ACK) === "1");
    }
  }

  const handleClose = () => {
    if (dontShowAgain) {
      CookieManager.setItem(COOKIES.POLICY_ACK, "1", { maxAgeSec: ONE_YEAR });
    } else {
      /** 체크를 해제하고 닫을 경우 쿠키 수명을 0으로 설정하여 정책 동의를 파기합니다. */
      CookieManager.setItem(COOKIES.POLICY_ACK, "", { maxAgeSec: 0 });
    }

    SessionStorage.setItem(SESSION_LATCH_KEY, true);

    if (isControlled) onOpenChangeAction?.(false);
    else setInternalOpen(false);
  };

  useEffect(() => {
    if (!shouldAutoOpen) return;

    const timer = setTimeout(() => {
      SessionStorage.setItem(SESSION_LATCH_KEY, true);
      if (isControlled) {
        onOpenChangeAction?.(true);
      } else {
        setInternalOpen(true);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [isControlled, onOpenChangeAction, shouldAutoOpen]);

  return (
    <Dialog
      open={shown}
      onOpenChange={(v) =>
        v
          ? isControlled
            ? onOpenChangeAction?.(true)
            : setInternalOpen(true)
          : handleClose()
      }
    >
      <DialogContent className="sm:max-w-lg backdrop-blur-xl bg-white/85 dark:bg-zinc-900/70 border border-border/70 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            개인정보 · 쿠키 · 통계 안내
          </DialogTitle>
          <DialogDescription>
            Code Masterpiece의 개인정보 관리 정책에 관한 내용입니다.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-72 pr-2">
          <div className="space-y-5 text-sm text-muted-foreground leading-relaxed">
            <section>
              <div className="font-semibold text-foreground text-base">
                1) 요약
              </div>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>광고·외부 추적 스크립트는 사용하지 않습니다.</li>
                <li>필수 쿠키와 세션 단위 통계(페이지뷰)만 처리합니다.</li>
              </ul>
            </section>

            <section>
              <div className="font-semibold text-foreground text-base">
                2) 수집 · 저장
              </div>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>
                  <strong>세션(JSESSIONID)</strong>: 로그인 유지용(HTTPOnly, JS
                  접근 불가)
                </li>
                <li>
                  <strong>client-id</strong>: 비로그인 상호작용(좋아요 등)
                  식별용 UUID, 1년 보관
                </li>
                <li>
                  <strong>__point</strong>: 선택한 테마 색상 유지, 1년 보관
                </li>
              </ul>
            </section>

            <section>
              <div className="font-semibold text-foreground text-base">
                3) 수집하지 않음
              </div>
              <p className="mt-2">
                별도의 개인정보는 수집·보관하지 않습니다. 로그인은{" "}
                <strong>GitHub OAuth</strong>로만 처리하며, 자체 DB에 개인정보를
                저장하지 않습니다.
              </p>
            </section>

            <section>
              <div className="font-semibold text-foreground text-base">
                4) GitHub 로그인 · 댓글
              </div>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>GitHub OAuth만 사용하며 별도 계정은 없습니다.</li>
                <li>
                  댓글 저장 항목: GitHub ID, 표시명 스냅샷, 아바타 URL(ID 기반)
                </li>
                <li>이메일, 조직, 팔로워 등은 저장하지 않습니다.</li>
              </ul>
            </section>

            <section>
              <div className="font-semibold text-foreground text-base">
                5) 익명(게스트) 댓글
              </div>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>표시명과 선택적 이미지 URL 저장 가능</li>
                <li>PIN(4자리)은 단방향 해시로만 저장되며 복원 불가</li>
                <li>익명 식별은 client-id(UUID) 쿠키로 수행됩니다.</li>
              </ul>
            </section>

            <section>
              <div className="font-semibold text-foreground text-base">
                6) 페이지뷰 · 세션 통계
              </div>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>
                  페이지 이동이나 제목 변경 시 페이지뷰 요청이 자동 전송됩니다.
                </li>
                <li>
                  <code>session-id</code>가 브라우저 세션스토리지에 저장되어
                  탭/창 단위로 방문을 묶습니다.
                </li>
                <li>
                  전송 항목은 URL, 제목, 시각, 세션 ID이며 개인식별 정보는
                  없습니다.
                </li>
              </ul>
            </section>

            <section>
              <div className="font-semibold text-foreground text-base">
                7) 제3자 제공
              </div>
              <p className="mt-2">
                사용자 정보는 제3자에게 제공되지 않습니다. 광고나 추적 코드도
                없습니다.
              </p>
            </section>

            <section>
              <div className="font-semibold text-foreground text-base">
                8) 보관 · 삭제
              </div>
              <p className="mt-2">
                댓글 및 스냅샷은 사용자가 삭제하거나 정책상 정리될 때까지
                보관됩니다. 삭제 요청은 방명록 또는 이슈로 가능하며, PIN 검증이
                필요할 수 있습니다.
              </p>
            </section>

            <section>
              <div className="font-semibold text-foreground text-base">
                9) 보안
              </div>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>게스트 PIN은 해시만 저장하며 복구할 수 없습니다.</li>
                <li>모든 통신은 HTTPS로 암호화됩니다.</li>
              </ul>
            </section>

            <section>
              <div className="font-semibold text-foreground text-base">
                10) 문의
              </div>
              <p className="mt-2">
                GitHub 이슈 또는{" "}
                <Link
                  href="/guest"
                  className="text-point underline underline-offset-[3px] hover:underline-offset-[5px] transition-all"
                >
                  방명록
                </Link>
                으로 문의 바랍니다.
              </p>
            </section>
          </div>
        </ScrollArea>

        <div className="flex items-center gap-2 pt-2">
          <Checkbox
            id="dontshow"
            checked={dontShowAgain}
            onCheckedChange={(v) => setDontShowAgain(Boolean(v))}
          />
          <label htmlFor="dontshow" className="text-sm select-none">
            다시 보지 않기
          </label>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={handleClose}>
            확인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
