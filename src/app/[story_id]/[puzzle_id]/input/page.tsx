"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import styles from "./input.module.css";

export default function PuzzleInputPage() {
  const { story_id, puzzle_id } = useParams();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const fetchInput = async () => {
      const { data } = await supabase
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

  const handleTripleClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    if (e.detail === 3 && textareaRef.current) {
      textareaRef.current.select();
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(input);
  };

  if (loading) {
    return <div>Loading puzzle input...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <button onClick={copyToClipboard} className={styles.copyButton}>
          Copy all
        </button>
      </div>

      <textarea
        ref={textareaRef}
        value={input}
        readOnly
        wrap="off"
        onClick={handleTripleClick}
        className={styles.textarea}
      />
    </div>
  );
}
