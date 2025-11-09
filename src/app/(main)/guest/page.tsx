import { GuestbookProvider } from "@/features/guest/context/GuestbookContext";
import BackgroundFrame from "@/features/guest/ui/BackgroundFrame";
import GuestbookBody from "@/features/guest/ui/GuestbookBody";

export default function Page() {
  return (
    <BackgroundFrame>
      <GuestbookProvider initialSliceSize={20}>
        <GuestbookBody />
      </GuestbookProvider>
    </BackgroundFrame>
  );
}
