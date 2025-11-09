import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/shadcn/card";
import { Lock } from "lucide-react";

const DraftBanner = () => {
  return (
    <Card className="mb-10 border-muted/30 bg-muted/40 backdrop-blur-sm shadow-md">
      <CardHeader className="flex flex-col items-center text-center">
        <div className="mb-3 flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
          <Lock className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-lg font-semibold text-foreground">
          이 게시글은 현재 비공개입니다
        </CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground text-sm text-center leading-relaxed">
        작성자에게만 열람 권한이 있어요. 공개로 전환되면 편하게 읽으실 수
        있습니다.
      </CardContent>
    </Card>
  );
};

export default DraftBanner;