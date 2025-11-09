export function formatKoreanDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  const second = String(date.getSeconds()).padStart(2, "0");

  return `${year}년 ${month}월 ${day}일 ${hour}:${minute}:${second}`;
}

export const formatToYearMonthDay = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 월은 0부터 시작하므로 +1
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
};

export const getTimeGapFromNow = (
  date: Date,
  callback: (date: Date) => string,
): string => {
  const now = new Date();
  let gap = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);

  if (gap < 1) {
    return "방금 전";
  }
  if (gap < 60) {
    return `${gap}분 전`;
  }

  gap = Math.floor(gap / 60);
  if (gap < 24) {
    return `${gap}시간 전`;
  }

  gap = Math.floor(gap / 24);
  if (gap < 31) {
    return `${gap}일 전`;
  }

  // 7일 이상일 경우 사용자 지정 콜백 함수 실행
  return callback(date);
};
