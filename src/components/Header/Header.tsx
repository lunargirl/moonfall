"use client";

import Link from "next/link";
import { supabaseClient } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import styles from "./header.module.css";
import { usePuzzle } from "@/context/PuzzleContext";

type HeaderProps = {
  parts?: { part_number: number; locked?: boolean }[];
  selectedPart?: number;
  onSelectPart?: (partNumber: number) => void;
};

export default function Header({}: HeaderProps) {
  const [username, setUsername] = useState<string | null>(null);
  const puzzle = usePuzzle();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();
      if (!session) return;

      const token = session.provider_token;
      if (!token) return;

      const res = await fetch("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;

      const profile = await res.json();
      setUsername(profile.login);
    };

    fetchUser();
  }, []);

  const handleLogin = async () => {
    localStorage.setItem("redirectAfterLogin", window.location.pathname);

    await supabaseClient.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    setUsername(null);
  };

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.button}>
          Home
        </Link>
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
                className={`${styles.partButton} ${styles.button} ${
                  p.part_number === puzzle.selectedPart ? styles.activePart : ""
                }`}
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
