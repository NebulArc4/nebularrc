import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidProps {
  chart: string;
}

export default function Mermaid({ chart }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      mermaid.initialize({ startOnLoad: false, theme: 'dark' });
      mermaid.render('mermaid-diagram', chart).then(({ svg }) => {
        ref.current!.innerHTML = svg;
      });
    }
  }, [chart]);

  return <div ref={ref} />;
} 