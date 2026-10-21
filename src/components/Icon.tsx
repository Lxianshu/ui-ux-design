import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CodeXml,
  Copy,
  LayoutGrid,
  Monitor,
  Play,
  RotateCcw,
  Search,
  Smartphone,
  Sparkles,
  X,
} from 'lucide-react';

const icons = {
  grid: LayoutGrid,
  search: Search,
  arrow: ArrowRight,
  back: ArrowLeft,
  copy: Copy,
  check: Check,
  play: Play,
  monitor: Monitor,
  phone: Smartphone,
  code: CodeXml,
  book: BookOpen,
  reset: RotateCcw,
  close: X,
  spark: Sparkles,
};
interface IconProps {
  name: keyof typeof icons;
  size?: number;
  className?: string;
}

/** 所有公共图标复用 Lucide SVG 组件，避免文字或图标字体占位。 */
export function Icon({ name, size = 18, className }: IconProps) {
  const Component = icons[name];
  return <Component className={className} size={size} strokeWidth={1.65} aria-hidden="true" />;
}
