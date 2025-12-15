"use client";

import StoryIcon from "@/components/Icon/Story-Icon";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { PuzzlePart, PuzzleGroup } from "@/types/puzzles";
import type { Submission } from "@/types/submissions";

export default function StoryPage() {
  const params = useParams(); // <-- use this hook for client components
  const story_id = params.story_id; // safe now
  const [userId, setUserId] = useState<string | null>(null);
  const [parts, setParts] = useState<PuzzlePart[]>([]);
  const [solvedPartIds, setSolvedPartIds] = useState<Set<string>>(new Set());
  const [puzzles, setPuzzles] = useState<PuzzleGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUserId = sessionData?.session?.user?.id ?? null;
      setUserId(currentUserId);

      
      const { data: partsData, error: partsError } = await supabase
        .from("puzzle_parts")
        .select("id, puzzle_id, part_number, story_id")
        .eq("story_id", story_id);

      if (partsError || !partsData) {
        console.error(partsError);
        setLoading(false);
        return;
      }

      setParts(partsData as unknown as PuzzlePart[]);

      
      let solvedIds = new Set<string>();
      if (currentUserId && partsData.length > 0) {
        const partIds = partsData.map((p) => p.id);
        const { data: submissions } = await supabase
          .from("submissions")
          .select("puzzle_part_id")
          .eq("correct", true)
          .eq("user_id", currentUserId)
          .in("puzzle_part_id", partIds);

        solvedIds = new Set((submissions ?? []).map((s: Submission) => s.puzzle_part_id));
        setSolvedPartIds(solvedIds);
      }

      
      const puzzleIds = Array.from(new Set(partsData.map((p) => p.puzzle_id)));
      const { data: puzzleMeta } = await supabase
        .from("puzzles")
        .select("puzzle_id, title")
        .in("puzzle_id", puzzleIds);

      const titleMap = new Map<string, string>();
      puzzleMeta?.forEach((p) => titleMap.set(p.puzzle_id, p.title));

      
      const grouped: Record<string, PuzzleGroup> = {};
      (partsData as unknown as PuzzlePart[]).forEach((part) => {
        if (!grouped[part.puzzle_id]) {
          grouped[part.puzzle_id] = {
            puzzle_id: part.puzzle_id,
            title: titleMap.get(part.puzzle_id) ?? "Puzzle",
            parts: {},
          } satisfies PuzzleGroup;
        }
        grouped[part.puzzle_id].parts[part.part_number] = part;
      });

      setPuzzles(Object.values(grouped));
      setLoading(false);
    };

    if (story_id) fetchData();
  }, [story_id]);

  const badgeIfSolved = (part?: PuzzlePart, badge?: string) =>
    part && solvedPartIds.has(part.id) ? badge : undefined;

  if (!story_id) return <div>Invalid story</div>;
  if (loading) return <div>Loading story...</div>;

  return (
    <div className="iconGrid">
      {puzzles.map((puzzle) => {
        const iconSrc = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/story-icons/${story_id}/${puzzle.puzzle_id}.png`;

        return (
          <StoryIcon
            key={puzzle.puzzle_id}
            title={puzzle.title}
            iconSrc={iconSrc}
            href={`/${story_id}/${puzzle.puzzle_id}`}
            badgeLeft={badgeIfSolved(puzzle.parts[1], "/badges/badge1.svg")}
            badgeCenter={badgeIfSolved(puzzle.parts[2], "/badges/badge2.svg")}
            badgeRight={badgeIfSolved(puzzle.parts[0], "/badges/badge0.svg")}
          />
        );
      })}
    </div>
  );
}
