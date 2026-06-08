"use client";

import Icon from "@/components/common/Icon";

export function HeroPanel() {
  return (
    <div className="relative h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/Login/ERVFlowLogin.png')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />

      <div className="absolute top-7 left-7 z-10 flex items-center gap-2">
        <div className="flex items-center justify-center rounded-lg w-10 h-10 flex-shrink-0 bg-[#F76235]">
          <Icon name="Logo" size="28" className="w-7 h-7 text-white" />
        </div>
        <span className="text-base md:text-lg lg:text-xl font-extrabold text-white font-merienda tracking-tight">
          ERVFlow
        </span>
      </div>

      <div className="absolute bottom-8 left-7 right-7 z-10">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-snug text-pretty">
          &ldquo;Simply all <span className="text-[#F76235]">the tools</span>{" "}
          that my team and I will ever need.&rdquo;
        </h2>
        <div className="mt-5">
          <p className="text-base md:text-lg font-bold text-[#FFC233]">
            Karen Yue
          </p>
          <p className="text-sm text-white/60 mt-0.5">
            Director of Digital Marketing Technology
          </p>
        </div>
      </div>
    </div>
  );
}
