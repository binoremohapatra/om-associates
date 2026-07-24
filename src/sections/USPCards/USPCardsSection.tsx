import CircularGallery from '../../components/ui/CircularGallery';
import { renderToStaticMarkup } from 'react-dom/server';
import { FileText, Building2, Scale, Globe, Headset, Calculator } from 'lucide-react';

const createCardImage = (title: string, desc: string, Icon: any) => {
  const svgString = renderToStaticMarkup(
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
      <rect width="800" height="600" fill="#141418" rx="40" />
      <rect width="796" height="596" x="2" y="2" fill="none" stroke="rgba(201,169,75,0.3)" strokeWidth="4" rx="38" />
      <circle cx="400" cy="220" r="80" fill="rgba(201,169,75,0.15)" />
      
      <g transform="translate(360, 180)">
        <Icon size={80} color="#E8C96B" strokeWidth={1.5} />
      </g>
      
      <text x="400" y="380" fontFamily="sans-serif" fontSize="52" fontWeight="bold" fill="#F5F5F7" textAnchor="middle">{title}</text>
      <text x="400" y="460" fontFamily="sans-serif" fontSize="28" fill="#9898AA" textAnchor="middle">{desc}</text>
    </svg>
  );
  const b64 = btoa(unescape(encodeURIComponent(svgString)));
  return `data:image/svg+xml;base64,${b64}`;
};

const USP_CARDS = [
  { text: 'GST Registration', image: createCardImage('GST Registration', 'In as little as 3 Hours*', FileText) },
  { text: 'Income Tax', image: createCardImage('Income Tax', 'Fast and Accurate ITR Filing', Calculator) },
  { text: 'Business Reg.', image: createCardImage('Business Reg.', 'Company and LLP Registration', Building2) },
  { text: 'Legal Compliance', image: createCardImage('Legal Compliance', 'Corporate Legal Advisory', Scale) },
  { text: 'Import Export', image: createCardImage('Import Export', 'IEC and DGFT Consultation', Globe) },
  { text: 'Trusted Support', image: createCardImage('Trusted Support', 'Dedicated Expert Assistance', Headset) },
];

export default function USPCardsSection() {
  return (
    <section className="w-full relative flex items-center justify-center py-10 overflow-hidden" style={{ background: '#0D0D0F', borderBottom: '1px solid rgba(201,169,75,0.1)' }}>
      <div style={{ height: '600px', width: '100%', position: 'relative' }}>
        <CircularGallery
          items={USP_CARDS}
          bend={1}
          textColor="#E8C96B"
          borderRadius={0.05}
          scrollEase={0.05}
          font="bold 30px Figtree"
          scrollSpeed={2}
        />
      </div>
    </section>
  );
}
