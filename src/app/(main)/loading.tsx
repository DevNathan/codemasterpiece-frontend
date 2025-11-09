import React from "react";
import LoadingMark from "@/shared/assets/loading/LoadingMark";

const Loading = () => {
  return (
    <div className="fixed top-0 left-0 w-[100dvw] h-[100vh] flex items-center justify-center bg-gray-800">
      <LoadingMark />
    </div>
  );
};

export default Loading;
