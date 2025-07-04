import nlp from 'compromise';

export function detectEntities(text: string): {
  companies: string[];
  symbols: string[];
  people: string[];
  dates: string[];
  currencies: string[];
  locations: string[];
  emails: string[];
  urls: string[];
  phones: string[];
  hashtags: string[];
} {
  const doc = nlp(text);
  // Company names (proper nouns, organizations)
  const companies = doc.organizations().out('array');
  // Stock symbols (all-caps, 1-5 letters)
  const symbols = (text.match(/\b[A-Z]{1,5}\b/g) || []).filter(s => !['THE','AND','FOR','WITH','FROM','THIS','THAT','YOUR','HAVE','WILL','SHOULD','COULD','MIGHT','ABOUT','WHICH','THERE','THEIR','WHAT','WHEN','WHERE','WHO','WHY','HOW'].includes(s));
  // People
  const people = doc.people().out('array');
  // Dates (simple regex for YYYY-MM-DD, MM/DD/YYYY, Month Day, Year, etc.)
  const dateRegex = /\b(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4})\b/gi;
  const dates = Array.from(new Set((text.match(dateRegex) || [])));
  // Currencies (e.g. $100, €200, £300, ¥400)
  const currencyRegex = /\b(\$|€|£|¥)\s?\d+(?:,\d{3})*(?:\.\d{1,2})?\b/g;
  const currencies = Array.from(new Set((text.match(currencyRegex) || [])));
  // Locations (simple: capitalized words after 'in', 'at', 'from', etc.)
  const locationRegex = /\b(?:in|at|from|to|near|on) ([A-Z][a-zA-Z]+(?: [A-Z][a-zA-Z]+)*)\b/g;
  const locations = Array.from(new Set(Array.from(text.matchAll(locationRegex), m => m[1])));
  // Emails
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = Array.from(new Set((text.match(emailRegex) || [])));
  // URLs
  const urlRegex = /https?:\/\/[\w.-]+(?:\.[\w\.-]+)+(?:[\w\-\._~:/?#[\]@!$&'()*+,;=]*)?/g;
  const urls = Array.from(new Set((text.match(urlRegex) || [])));
  // Phone numbers (simple: (123) 456-7890, 123-456-7890, etc.)
  const phoneRegex = /\b(?:\(\d{3}\)\s?|\d{3}[\-\.\s])\d{3}[\-\.\s]\d{4}\b/g;
  const phones = Array.from(new Set((text.match(phoneRegex) || [])));
  // Hashtags
  const hashtagRegex = /#\w+/g;
  const hashtags = Array.from(new Set((text.match(hashtagRegex) || [])));
  return { companies, symbols, people, dates, currencies, locations, emails, urls, phones, hashtags };
} 