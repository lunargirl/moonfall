"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { PuzzlePart } from "@/types/puzzles";
import Markdown from "@/components/Markdown";
import styles from "./puzzle.module.css";
import { usePuzzle } from "@/context/PuzzleContext";
import confetti from "canvas-confetti";

export default function PuzzlePage() {
  const { story_id, puzzle_id } = useParams();
  const puzzle = usePuzzle();
  const [userId, setUserId] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  
  const correctAudioRef = useRef<HTMLAudioElement>(null);
  const wrongAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUserId = sessionData?.session?.user?.id ?? null;
      setUserId(currentUserId);

      const { data: partsData } = await supabase
        .from("puzzle_parts")
        .select("*")
        .eq("puzzle_id", puzzle_id)
        .order("part_number", { ascending: true });

      if (!partsData || partsData.length === 0) {
        setLoading(false);
        return;
      }

      puzzle.setParts(partsData);

      if (currentUserId) {
        const { data: solvedData } = await supabase
          .from("submissions")
          .select("puzzle_part_id")
          .eq("user_id", currentUserId)
          .eq("correct", true)
          .in(
            "puzzle_part_id",
            partsData.map((p) => p.id)
          );

        const solvedMap: Record<number, boolean> = {};
        partsData.forEach((p) => {
          solvedMap[p.part_number] =
            solvedData?.some((s) => s.puzzle_part_id === p.id) ?? false;
        });

        puzzle.setSolvedParts(solvedMap);
      }

      const { data: puzzleMeta } = await supabase
        .from("puzzles")
        .select("title")
        .eq("story_id", story_id)
        .eq("puzzle_id", puzzle_id)
        .single();

      puzzle.setTitle(puzzleMeta?.title ?? "Puzzle");

      setLoading(false);
    };

    fetchData();
  }, [story_id, puzzle_id]);

  useEffect(() => {
    setAnswer("");
    setResult(null);
  }, [puzzle.selectedPart]);

  if (loading) return <div>Loading puzzle...</div>;
  if (puzzle.selectedPart === null) return <div>Select a part...</div>;

  const selectedPart = puzzle.selectedPart;
  const part = puzzle.parts.find((p) => p.part_number === selectedPart);
  if (!part) return <div>Invalid part selected</div>;

  const isLocked = puzzle.parts
    .filter((p) => p.part_number < selectedPart)
    .some((p) => !puzzle.solvedParts[p.part_number]);

  const handleSubmit = async () => {
    if (!userId || !part) return;

    if (puzzle.solvedParts[selectedPart]) {
      setResult("Already solved!");
      return;
    }

    const correct = answer.trim() === part.solution;
    setAnswer("");

    if (correct) {
     
      await supabase.from("submissions").insert([
        {
          user_id: userId,
          puzzle_part_id: part.id,
          answer: answer,
          correct: true,
          puzzle_id: puzzle_id,
        },
      ]);

      
      const nextSolved = { ...puzzle.solvedParts, [selectedPart]: true };
      puzzle.setSolvedParts(nextSolved);

      
      
      setResult("Correct!");

      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      
      correctAudioRef.current?.play();
    } else {
      setResult("Wrong!");
      
      wrongAudioRef.current?.play();
    }
  };

  return (
    <div className={styles.container}>
     
      <audio ref={correctAudioRef} src="/sounds/correct.mp3" />
      <audio ref={wrongAudioRef} src="/sounds/wrong.mp3" />

      <div className={styles.titleRow}>
        <h1 className={styles.title}>{puzzle.title}</h1>

        {puzzle.solvedParts[selectedPart] && (
          <div className={styles.badgeContainer}>
            <img
              src={`/badges/badge${selectedPart}.svg`}
              alt={`Badge ${selectedPart}`}
              width={16}
              height={16}
            />
          </div>
        )}
      </div>
      <Markdown content={part.content} />

      {puzzle.solvedParts[selectedPart] && (
        <p>
          If you still want it lol:{" "}
          <a href={`/${story_id}/${puzzle_id}/input`}>puzzle input</a>
        </p>
      )}


      {!puzzle.solvedParts[selectedPart] && (
        <>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Enter answer"
            className={styles.input}
          />
          <button
            onClick={handleSubmit}
            disabled={isLocked}
            className={styles.submitButton}
          >
            Submit
          </button>
        </>
      )}

      {result && <div className={styles.result}>{result}</div>}
    </div>
  );
}
