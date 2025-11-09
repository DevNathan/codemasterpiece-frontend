"use client";

import React, { useEffect, useState } from "react";
import { useSessionKeepAlive } from "@/features/auth/hooks/useSessionKeepAlive";
import SessionExpiryDialog from "@/features/auth/ui/SessionExpiryDialog";
import { useAuth } from "@/contexts/UserContext";
import { useAuthDialog } from "@/contexts/AuthDialogProvider";

/**
 * 로그인된 경우에만 세션 하트비트를 켠다.
 * 하드 만료 시: 즉시 로그아웃하지 말고 만료 다이얼로그를 먼저 보여준다.
 * "다시 로그인" 시점에 setUser(null) + 로그인 다이얼로그 오픈.
 */
export default function SessionKeepAliveGate() {
  const { isAuthenticated, setUser } = useAuth();
  const { openDialog } = useAuthDialog();

  const [warnOpen, setWarnOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  // 사용자가 수동으로 닫았는지 여부(경고/만료를 한 번 숨김)
  const [dismissed, setDismissed] = useState(false);

  const { state, actions } = useSessionKeepAlive({
    pingUrl: "/api/v1/auth/ping",
    onWarnOpenAction: () => setWarnOpen(true),
    onWarnCloseAction: () => setWarnOpen(false),
  });

  // 하드 만료 시 경고 강제 오픈
  useEffect(() => {
    if (state.hardExpired) setWarnOpen(true);
  }, [state.hardExpired]);

  // 새 경고/만료 이벤트가 오면 이전의 수동 닫힘(dismissed)을 해제해서 다시 보이도록
  useEffect(() => {
    if (state.warn || state.hardExpired) setDismissed(false);
  }, [state.warn, state.hardExpired]);

  const extendAction = async () => {
    if (busy) return;
    try {
      setBusy(true);
      await actions.beat(); // 핑 1회로 연장 시도
      // 성공 시 onWarnCloseAction를 통해 warnOpen=false, hardExpired=false가 되며 자연스럽게 닫힘
    } finally {
      setBusy(false);
    }
  };

  const reloginAction = () => {
    setUser(null);
    setWarnOpen(false);
    setDismissed(true); // 사용자가 의도적으로 재로그인 플로우로 이동 -> 모달 닫음
    openDialog();
  };

  const dismissAction = () => {
    setWarnOpen(false);
    setDismissed(true); // hardExpired가 true여도 사용자가 닫으면 숨긴다
  };

  const open =
    isAuthenticated && !dismissed && (warnOpen || state.hardExpired);

  return (
    <SessionExpiryDialog
      open={open}
      etaMs={state.etaMs}
      hardExpired={state.hardExpired}
      loading={busy}
      extendAction={extendAction}
      reloginAction={reloginAction}
      dismissAction={dismissAction}
    />
  );
}
