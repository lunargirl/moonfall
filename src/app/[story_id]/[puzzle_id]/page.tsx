"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import type { PuzzlePart } from "@/types/puzzles";
import Markdown from "@/components/Markdown";
import styles from "./puzzle.module.css";
import { usePuzzle } from "@/context/PuzzleContext";

export default function PuzzlePage() {
  const { story_id, puzzle_id } = useParams();
  const puzzle = usePuzzle();
  const [userId, setUserId] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: sessionData } = await supabaseClient.auth.getSession();
      const currentUserId = sessionData?.session?.user?.id ?? null;
      setUserId(currentUserId);

      const { data: partsData } = await supabaseClient
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
        const { data: solvedData } = await supabaseClient
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

      const { data: puzzleMeta } = await supabaseClient
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

    if (correct) {
      await supabaseClient
        .from("submissions")
        .insert([
          { user_id: userId, puzzle_part_id: part.id, answer, correct },
        ]);

      const nextSolved = { ...puzzle.solvedParts, [selectedPart]: true };
      puzzle.setSolvedParts(nextSolved);
      setResult("Correct!");
    } else {
      setResult("Wrong!");
    }
  };

  return (
    <div className={styles.container}>
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
          <p>
            You might want this:{" "}
            <a href={`/${story_id}/${puzzle_id}/input`}>puzzle input</a>
          </p>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
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
