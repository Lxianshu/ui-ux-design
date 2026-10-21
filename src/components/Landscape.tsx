import { useId } from 'react';

/** 以本地矢量景观代替远程照片，保持离线演示和固定比例。 */
export function Landscape({ variant = 0 }: { variant?: number }) {
  const id = useId().replace(/:/g, '');
  const colors = [
    ['#d6e4eb', '#91aaa7', '#315d57'],
    ['#eee0cd', '#c3a98c', '#765d47'],
    ['#e2dff1', '#a7a0bb', '#565e7c'],
  ][variant % 3];
  return (
    <svg
      viewBox="0 0 400 250"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={['青绿色山峦与湖泊', '暖沙色山野', '暮色山谷'][variant % 3]}
    >
      <defs>
        <linearGradient id={id} x2="0" y2="1">
          <stop stopColor={colors[0]} />
          <stop offset="1" stopColor="#faf7ed" />
        </linearGradient>
      </defs>
      <path fill={`url(#${id})`} d="M0 0h400v250H0z" />
      <circle cx="290" cy="65" r="26" fill="#fff9df" />
      <path d="M-30 190L85 65l75 84 65-62 200 123v50H0z" fill={colors[1]} />
      <path d="M-40 240l155-102 102 56 94-67 130 111v20H0z" fill={colors[2]} />
      <path d="M110 250l80-65 35 7-60 58" fill={colors[0]} opacity=".6" />
      <path d="M0 228q100-15 160 9t240-5v18H0" fill="#f4f3e7" opacity=".18" />
    </svg>
  );
}
