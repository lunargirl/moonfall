"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import styles from "./header.module.css";
import { usePuzzle } from "@/context/PuzzleContext";

export default function Header() {
  const [username, setUsername] = useState<string | null>(null);
  const puzzle = usePuzzle();

  useEffect(() => {
    if (typeof window === "undefined") return;

  
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setUsername(
        user?.user_metadata?.user_name ??
        user?.user_metadata?.preferred_username ??
        null
      );
    });

  
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      setUsername(
        user?.user_metadata?.user_name ??
        user?.user_metadata?.preferred_username ??
        null
      );
    };
    fetchSession();

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUsername(null);
  };

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.button}>Home</Link>
      </nav>

      {puzzle.parts.length > 0 && (
        <div className={styles.partButtons}>
          {puzzle.parts.map((p) => {
            const locked = puzzle.parts
              .filter((pp) => pp.part_number < p.part_number)
              .some((pp) => puzzle.solvedParts[pp.part_number] !== true);

            return (
              <button
                key={p.part_number}
                className={`${styles.partButton} ${styles.button} ${p.part_number === puzzle.selectedPart ? styles.activePart : ""}`}
                onClick={() => puzzle.setSelectedPart(p.part_number)}
                disabled={locked}
              >
                Part {p.part_number} {locked ? "🔒" : ""}
              </button>
            );
          })}
        </div>
      )}

      <div className={styles.userArea}>
        {!username ? (
          <button className={styles.button} onClick={handleLogin}>
            Log In with GitHub
          </button>
        ) : (
          <>
            <span className={styles.username}>{username}</span>
            <button className={styles.button} onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}
