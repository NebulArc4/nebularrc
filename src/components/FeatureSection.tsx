"use client";

import { useEffect, useRef, useState } from "react";

const features = [
  {
    title: "Autonomous Agents",
    description:
      "Deploy intelligent agents that act on your behalf — research, optimize, and execute tasks 24/7.",
  },
  {
    title: "Scalable AI Infrastructure",
    description:
      "Built for high-performance — scale from single-agent tasks to enterprise-level simulations.",
  },
  {
    title: "Decision Intelligence",
    description:
      "Make better decisions using real-time simulations and data-driven foresight powered by quantum-aware models.",
  },
];

export default function Features() {
  const refs = useRef<HTMLDivElement[]>([]);
  const [visibleIndexes, setVisibleIndexes] = useState<number[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute("data-index"));
          if (entry.isIntersecting) {
            setVisibleIndexes((prev) =>
              prev.includes(index) ? prev : [...prev, index]
            );
          }
        });
      },
      { threshold: 0.3 }
    );

    refs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      refs.current.forEach((el) => {
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  return (
    <section className="min-h-screen px-8 sm:px-20 py-24 bg-black text-white">
      <h2 className="text-4xl sm:text-5xl font-bold text-center mb-16">Why NebulArc?</h2>
      <div className="space-y-16 max-w-4xl mx-auto">
        {features.map((feature, index) => (
          <div
            key={index}
            ref={(el) => {
              if (el) refs.current[index] = el;
            }}
            data-index={index}
            className={`transition-opacity duration-1000 transform ${
              visibleIndexes.includes(index)
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h3 className="text-2xl sm:text-3xl font-semibold mb-4">{feature.title}</h3>
            <p className="text-gray-300">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
