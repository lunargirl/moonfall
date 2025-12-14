"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import styles from "./input.module.css";

export default function PuzzleInputPage() {
  const { story_id, puzzle_id } = useParams();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInput = async () => {
      const { data } = await supabaseClient
        .from("puzzles")
        .select("input_text")
        .eq("story_id", story_id)
        .eq("puzzle_id", puzzle_id)
        .single();

      if (data?.input_text) setInput(data.input_text);
      setLoading(false);
    };

    fetchInput();
  }, [story_id, puzzle_id]);

  if (loading) {
    return <div>Loading puzzle input...</div>;
  }

  return (
    <div className={styles.container}>
      <textarea
        value={input}
        readOnly
        wrap="off"
        className={styles.textarea}
      />
    </div>
  );
}
