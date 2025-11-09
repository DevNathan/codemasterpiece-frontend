import React from "react";

const LoadingMark = () => {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="animate-spin"
    >
      <circle cx="95.6758" cy="24.4864" r="12.1622" className="fill-point" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M60 0C26.8629 0 0 26.8629 0 60C0 93.1371 26.8629 120 60 120C93.1119 120 119.959 93.178 120 60.0756C120 60.0505 120 60.0253 120 60.0001C120 53.2831 114.555 47.8379 107.838 47.8379C101.121 47.8379 95.6759 53.2831 95.6759 60H95.6755C95.6754 79.703 79.7029 95.6755 59.9998 95.6755C40.2967 95.6755 24.3241 79.7029 24.3241 59.9998C24.3241 40.3158 40.2657 24.3552 59.9424 24.3242L60.0001 24.3243C66.7171 24.3243 72.1623 18.8791 72.1623 12.1622C72.1623 5.44519 66.7171 0 60.0001 0H60Z"
        fill="white"
      />
    </svg>
  );
};

export default LoadingMark;
