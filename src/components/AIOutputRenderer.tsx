"use client";
import React, { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { detectEntities } from "@/lib/ai-entity-detection";
import StockPriceChart, { searchSymbolByCompanyName } from "./StockPriceChart";
import toast from "react-hot-toast";
import { FaHashtag, FaMapMarkerAlt, FaEnvelope, FaLink, FaPhone, FaMoneyBillAlt } from 'react-icons/fa';
import { usePreferences } from './PreferencesContext';

interface AIOutputRendererProps {
  text: string;
}

export default function AIOutputRenderer({ text }: AIOutputRendererProps) {
  const { prefs } = usePreferences();
  const [resolvedSymbols, setResolvedSymbols] = useState<string[]>([]);
  const [loadingSymbols, setLoadingSymbols] = useState(false);

  // Detect entities only once per text
  const entities = useMemo(() => detectEntities(text), [text]);

  // Resolve company names to symbols (async)
  React.useEffect(() => {
    let isMounted = true;
    async function resolveCompanies() {
      setLoadingSymbols(true);
      const found: string[] = [...entities.symbols];
      for (const company of entities.companies) {
        // Only resolve if not already a symbol
        if (!found.includes(company)) {
          const symbol = await searchSymbolByCompanyName(company);
          if (symbol && !found.includes(symbol)) found.push(symbol);
        }
      }
      if (isMounted) setResolvedSymbols(found);
      setLoadingSymbols(false);
    }
    resolveCompanies();
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  // Copy/share/save handlers
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  // Output style classes
  const styleClass =
    prefs.outputStyle === 'compact'
      ? 'text-xs leading-tight p-2'
      : prefs.outputStyle === 'large'
      ? 'text-lg leading-relaxed p-6'
      : 'text-base leading-normal p-4';

  // Highlight entities in markdown
  function highlightEntities(source: string) {
    let highlighted = source;
    // Highlight symbols
    for (const symbol of entities.symbols) {
      highlighted = highlighted.replace(
        new RegExp(`\\b${symbol}\\b`, "g"),
        `<span class='entity-symbol'>${symbol}</span>`
      );
    }
    // Highlight companies
    for (const company of entities.companies) {
      highlighted = highlighted.replace(
        new RegExp(company, "g"),
        `<span class='entity-company'>${company}</span>`
      );
    }
    // Highlight people
    for (const person of entities.people) {
      highlighted = highlighted.replace(
        new RegExp(person, "g"),
        `<span class='entity-person'>${person}</span>`
      );
    }
    // Highlight dates
    for (const date of entities.dates) {
      highlighted = highlighted.replace(
        new RegExp(date, "g"),
        `<span class='entity-date'>${date}</span>`
      );
    }
    // Highlight currencies
    for (const currency of entities.currencies) {
      highlighted = highlighted.replace(
        new RegExp(currency.replace(/[$()*+?.^|{}\\]/g, '\\$&'), "g"),
        `<span class='entity-currency'>${currency}</span>`
      );
    }
    // Highlight locations
    for (const location of entities.locations) {
      highlighted = highlighted.replace(
        new RegExp(location, "g"),
        `<span class='entity-location'>${location}</span>`
      );
    }
    // Highlight emails
    for (const email of entities.emails) {
      highlighted = highlighted.replace(
        new RegExp(email.replace(/[$()*+?.^|{}\\]/g, '\\$&'), "g"),
        `<span class='entity-email'>${email}</span>`
      );
    }
    // Highlight URLs
    for (const url of entities.urls) {
      highlighted = highlighted.replace(
        new RegExp(url.replace(/[$()*+?.^|{}\\]/g, '\\$&'), "g"),
        `<span class='entity-url'>${url}</span>`
      );
    }
    // Highlight phones
    for (const phone of entities.phones) {
      highlighted = highlighted.replace(
        new RegExp(phone.replace(/[$()*+?.^|{}\\]/g, '\\$&'), "g"),
        `<span class='entity-phone'>${phone}</span>`
      );
    }
    // Highlight hashtags
    for (const hashtag of entities.hashtags) {
      highlighted = highlighted.replace(
        new RegExp(hashtag, "g"),
        `<span class='entity-hashtag'>${hashtag}</span>`
      );
    }
    // For underline/icon, add extra classes or icons
    if (prefs.entityHighlight === 'underline') {
      highlighted = highlighted.replace(/<span class='entity-([\w-]+)'>/g, "<span class='entity-$1 underline decoration-dotted'>");
    }
    if (prefs.entityHighlight === 'icon') {
      // Already handled in component rendering
    }
    return highlighted;
  }

  return (
    <div className={`relative group animate-fadein ${styleClass}`}>
      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={handleCopy} className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600">Copy</button>
        {/* Add share/save as needed */}
      </div>
      <ReactMarkdown
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={{
          span({ className, children }) {
            if (className === "entity-symbol")
              return <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1 rounded cursor-pointer" title="Stock Symbol">{children}</span>;
            if (className === "entity-company")
              return <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-1 rounded cursor-pointer" title="Company (hover for info)"><span className="inline-block align-middle">🏢</span> <span className="underline decoration-dotted" title="Company info coming soon">{children}</span></span>;
            if (className === "entity-person")
              return <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 px-1 rounded cursor-pointer" title="Person">👤 {children}</span>;
            if (className === "entity-date")
              return <span className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-1 rounded cursor-pointer" title="Date">📅 {children}</span>;
            if (className === "entity-currency")
              return <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-1 rounded cursor-pointer" title="Currency"><FaMoneyBillAlt className="inline-block mr-1" />{children}</span>;
            if (className === "entity-location")
              return <span className="bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 px-1 rounded cursor-pointer" title="Location"><FaMapMarkerAlt className="inline-block mr-1" />{children}</span>;
            if (className === "entity-email")
              return <a href={`mailto:${children}`} className="bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-1 rounded cursor-pointer underline" title="Email"><FaEnvelope className="inline-block mr-1" />{children}</a>;
            if (className === "entity-url")
              return <a href={String(children)} target="_blank" rel="noopener noreferrer" className="bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300 px-1 rounded cursor-pointer underline" title="URL"><FaLink className="inline-block mr-1" />{children}</a>;
            if (className === "entity-phone")
              return <a href={`tel:${children}`} className="bg-lime-100 dark:bg-lime-900 text-lime-700 dark:text-lime-300 px-1 rounded cursor-pointer underline" title="Phone"><FaPhone className="inline-block mr-1" />{children}</a>;
            if (className === "entity-hashtag")
              return <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-1 rounded cursor-pointer" title="Hashtag"><FaHashtag className="inline-block mr-1" />{children}</span>;
            return <span>{children}</span>;
          },
        }}
      >
        {highlightEntities(text)}
      </ReactMarkdown>
      {/* Inline charts for all resolved symbols */}
      <div className="flex flex-wrap gap-6 mt-4">
        {loadingSymbols ? (
          <div className="text-gray-400 text-sm">Loading charts...</div>
        ) : (
          Array.isArray(resolvedSymbols) && resolvedSymbols.map((symbol) => (
            <div key={symbol} className="w-full md:w-1/2 lg:w-1/3">
              <h5 className="text-sm font-bold mb-2 text-gray-900 dark:text-white">Stock Price Chart for {symbol}</h5>
              <StockPriceChart symbol={symbol} />
            </div>
          ))
        )}
      </div>
      <style jsx>{`
        .animate-fadein { animation: fadein 0.5s; }
        @keyframes fadein { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
} 