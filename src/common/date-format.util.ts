import { format, toZonedTime } from 'date-fns-tz';

export const formatDate = (date: Date): string => {
  const timeZone = 'Asia/Seoul'; // 한국 시간대
  const zonedDate = toZonedTime(date, timeZone); // UTC를 KST로 변환
  return format(zonedDate, 'yyyy-MM-dd HH:mm:ss', { timeZone }); // 포맷팅
};