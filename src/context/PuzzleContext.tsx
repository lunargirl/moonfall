"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { PuzzlePart } from "@/types/puzzles";

type PuzzleContextType = {
  parts: PuzzlePart[];
  selectedPart: number | null;
  title: string | null;
  solvedParts: Record<number, boolean>;
  setParts: (parts: PuzzlePart[]) => void;
  setSelectedPart: (part: number) => void;
  setTitle: (title: string) => void;
  setSolvedParts: (map: Record<number, boolean>) => void;
};

export const PuzzleContext = createContext<PuzzleContextType | undefined>(
  undefined
);

export const PuzzleProvider = ({ children }: { children: ReactNode }) => {
  const [parts, setPartsState] = useState<PuzzlePart[]>([]);
  const [selectedPart, setSelectedPart] = useState<number | null>(null);
  const [solvedParts, setSolvedParts] = useState<Record<number, boolean>>({});
  const [title, setTitle] = useState<string | null>(null);

  const setParts = (newParts: PuzzlePart[]) => {
    setPartsState(newParts);
    setSelectedPart((prev) =>
      prev === null && newParts.length > 0 ? newParts[0].part_number : prev
    );
  };

  return (
    <PuzzleContext.Provider
      value={{
        parts,
        selectedPart,
        title,
        solvedParts,
        setParts,
        setSelectedPart,
        setTitle,
        setSolvedParts,
      }}
    >
      {children}
    </PuzzleContext.Provider>
  );
};

export const usePuzzle = () => {
  const context = useContext(PuzzleContext);
  if (!context) throw new Error("usePuzzle must be used within PuzzleProvider");
  return context;
};
