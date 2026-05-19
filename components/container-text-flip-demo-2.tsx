"use client";
import { ContainerTextFlip } from "@/components/ui/container-text-flip";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ContainerTextFlipDemo() {
  const words = ["insights","analytics","data"];
  return (
    <motion.h1
      initial={{
        opacity: 0,
      }}
      whileInView={{
        opacity: 1,
      }}
      className={cn(
        "bg-black relative mb-6 text-left text-3xl leading-normal font-bold tracking-tight text-zinc-700 md:text-6xl dark:text-zinc-100",
      )}
      layout
    >
      <div className="flex items-center justify-center">
        <div>

        Create Minimilist Forms which give you <ContainerTextFlip words={words} />
        </div>
        {/* <Blips /> */}
      </div>
    </motion.h1>
  );
}
