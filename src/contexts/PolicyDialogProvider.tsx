"use client";

import React, { createContext, useContext, useState } from "react";
import PolicyDialog from "@/shared/components/footer/PolicyDialog";

type PolicyDialogContextType = {
  openPolicyDialog: () => void;
  closePolicyDialog: () => void;
};

const PolicyDialogContext = createContext<PolicyDialogContextType | null>(null);

export const usePolicyDialog = () => {
  const context = useContext(PolicyDialogContext);
  if (!context) {
    throw new Error(
      "usePolicyDialog must be used within a PolicyDialogProvider",
    );
  }
  return context;
};

export default function PolicyDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <PolicyDialogContext.Provider
      value={{
        openPolicyDialog: () => setOpen(true),
        closePolicyDialog: () => setOpen(false),
      }}
    >
      {children}
      <PolicyDialog
        open={open}
        onOpenChangeAction={setOpen}
        autoOpenIfNotAck={true}
      />
    </PolicyDialogContext.Provider>
  );
}
