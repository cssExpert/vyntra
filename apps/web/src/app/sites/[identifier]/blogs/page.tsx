"use client";

import React, { useState } from "react";
import { ArrowLeft, Calendar, Clock } from "lucide-react";

interface Post {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
}

const POSTS: Post[] = [
  {
    id: 1,
    title: "Understanding React Server Components",
    excerpt:
      "A deep dive into how server-side rendering is evolving to make our applications faster than ever.",
    category: "Technology",
    date: "June 10, 2026",
    readTime: "5 min read",
    image: "https://placehold.co/800x400/3b82f6/white?text=Tech",
  },
  {
    id: 2,
    title: "The Art of Minimalist UI",
    excerpt: "Why less is often more when designing user-centric interfaces.",
    category: "Design",
    date: "June 8, 2026",
    readTime: "4 min read",
    image: "https://placehold.co/400x400/8b5cf6/white?text=Design",
  },
  {
    id: 3,
    title: "Remote Work Best Practices",
    excerpt: "Establishing a sustainable routine while working from home.",
    category: "Productivity",
    date: "June 5, 2026",
    readTime: "6 min read",
    image: "https://placehold.co/400x400/10b981/white?text=Productivity",
  },
  {
    id: 4,
    title: "The Future of AI Design",
    excerpt:
      "How neural networks are helping designers iterate at light speed.",
    category: "Design",
    date: "June 12, 2026",
    readTime: "7 min read",
    image: "https://placehold.co/400x800/f59e0b/white?text=AI+Design",
  },
  {
    id: 5,
    title: "Next.js Performance Patterns",
    excerpt: "Optimizing your bundle sizes for better core web vitals.",
    category: "Technology",
    date: "June 14, 2026",
    readTime: "8 min read",
    image: "https://placehold.co/800x400/ef4444/white?text=Performance",
  },
  {
    id: 6,
    title: "Global Collaboration",
    excerpt: "Building high-performance remote teams across continents.",
    category: "Productivity",
    date: "June 15, 2026",
    readTime: "5 min read",
    image: "https://placehold.co/400x400/6366f1/white?text=Global",
  },
  {
    id: 7,
    title: "Next.js Performance Patterns",
    excerpt: "Optimizing your bundle sizes for better core web vitals.",
    category: "Technology",
    date: "June 14, 2026",
    readTime: "8 min read",
    image: "https://placehold.co/800x400/ef4444/white?text=Performance",
  },
  {
    id: 8,
    title: "Global Collaboration",
    excerpt: "Building high-performance remote teams across continents.",
    category: "Productivity",
    date: "June 15, 2026",
    readTime: "5 min read",
    image: "https://placehold.co/400x400/6366f1/white?text=Global",
  },
];

export default function App() {
  const [view, setView] = useState<"list" | "detail">("list");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const handleSelect = (id: number) => {
    const post = POSTS.find((p) => p.id === id);
    if (post) {
      setSelectedPost(post);
      setView("detail");
      window.scrollTo(0, 0);
    }
  };

  const Header = () => (
    <nav className="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div
          className="text-2xl font-black tracking-tighter text-slate-950 cursor-pointer"
          onClick={() => setView("list")}
        >
          BLOG<span className="text-blue-600">.</span>
        </div>
        <button className="bg-slate-950 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:scale-105 transition">
          Subscribe
        </button>
      </div>
    </nav>
  );

  const ListView = () => (
    <main className="pt-32 pb-0 px-6 max-w-7xl mx-auto">
      <div className="mb-12">
        <h2 className="text-4xl font-bold tracking-tight">Latest Insights</h2>
        <p className="text-slate-500 mt-2">
          Curated thoughts on technology, design, and growth.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 auto-rows-[250px] gap-6">
        {POSTS.map((post, index) => {
          const isFeatured = index === 0 || index === 3;
          // Bento layout logic: assigning different shapes based on index
          const layoutClass =
            index === 0
              ? "md:col-span-2 md:row-span-2"
              : index === 3
                ? "md:row-span-2"
                : "md:col-span-1";

          return (
            <article
              key={post.id}
              className={`group relative overflow-hidden bg-white rounded-3xl p-6 shadow-xs shadow-slate-100 transition-all duration-300 border border-black/1 group-hover: border-black/2 cursor-pointer flex flex-col justify-end ${layoutClass}`}
              onClick={() => handleSelect(post.id)}
            >
              <div
                className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-20 transition-opacity"
                style={{ backgroundImage: `url('${post.image}')` }}
              />
              <div className="relative z-10">
                <span className="bg-blue-600/10 text-blue-600 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-widest">
                  {post.category}
                </span>
                <h3
                  className={`${isFeatured ? "text-2xl md:text-4xl" : "text-xl md:text-2xl"} font-extrabold mt-3 mb-2 leading-snug group-hover:text-blue-600 transition`}
                >
                  {post.title}
                </h3>
                <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-4 text-[10px] font-semibold text-slate-400">
                  <span>{post.date}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );

  const DetailView = () => {
    if (!selectedPost) return null;

    return (
      <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <button
          onClick={() => setView("list")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-950 font-semibold mb-8 transition"
        >
          <ArrowLeft size={20} /> Back to Blog
        </button>

        <article>
          <div
            className="w-full h-96 rounded-3xl mb-12 bg-cover bg-center border border-slate-100"
            style={{ backgroundImage: `url('${selectedPost.image}')` }}
          />
          <span className="text-blue-600 font-bold text-sm uppercase tracking-widest">
            {selectedPost.category}
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold mt-4 mb-8 tracking-tight">
            {selectedPost.title}
          </h1>
          <div className="flex items-center gap-6 text-slate-500 mb-12">
            <div className="flex items-center gap-2">
              <Calendar size={18} /> {selectedPost.date}
            </div>
            <div className="flex items-center gap-2">
              <Clock size={18} /> {selectedPost.readTime}
            </div>
          </div>
          <div className="prose prose-lg max-w-none text-slate-600 leading-relaxed">
            <p className="mb-6">{selectedPost.excerpt}</p>
            <p>
              This is where your detailed article content would live. By using
              React state, we&rsquo;ve successfully simulated navigation without
              needing a full router setup.
            </p>
          </div>
        </article>
      </main>
    );
  };

  return (
    <div className="min-h-screen bg-[#F3F7FC]">
      <Header />
      {view === "list" ? <ListView /> : <DetailView />}
      <footer className="py-12 border-t border-slate-100 bg-white mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
