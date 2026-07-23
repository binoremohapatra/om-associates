import { Home, Info, LayoutGrid, Newspaper, BarChart2 } from 'lucide-react';
import Dock from './Dock';

export default function GlobalDock() {
  const items = [
    { icon: <Home size={18} />, label: 'Top', onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
    { icon: <LayoutGrid size={18} />, label: 'Services', onClick: () => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }) },
    { icon: <Info size={18} />, label: 'Why Us', onClick: () => document.getElementById('why-us')?.scrollIntoView({ behavior: 'smooth' }) },
    { icon: <Newspaper size={18} />, label: 'News', onClick: () => document.getElementById('gst-news')?.scrollIntoView({ behavior: 'smooth' }) },
    { icon: <BarChart2 size={18} />, label: 'Analytics', onClick: () => document.getElementById('analytics')?.scrollIntoView({ behavior: 'smooth' }) },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100]">
      <Dock 
        items={items}
        panelHeight={68}
        baseItemSize={50}
        magnification={70}
      />
    </div>
  );
}
