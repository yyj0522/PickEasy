"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TermHighlighter({ text }: { text: string }) {
  const [terms, setTerms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTerms() {
      const { data } = await supabase.from('dictionary').select('term');
      if (data) {
        setTerms(data.map(d => d.term));
      }
      setLoading(false);
    }
    fetchTerms();
  }, []);

  if (loading || !text) return <>{text}</>;

  const sortedTerms = [...terms].sort((a, b) => b.length - a.length);
  const regex = new RegExp(`(${sortedTerms.join('|')})`, 'g');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) => {
        if (terms.includes(part)) {
          return (
            <Link 
              key={i} 
              href={`/dictionary#${part}`} 
              target="_blank"
              className="text-blue-600 font-bold hover:underline decoration-wavy decoration-blue-300 cursor-help"
              title="용어 설명 보기"
            >
              {part}
            </Link>
          );
        }
        return part;
      })}
    </span>
  );
}