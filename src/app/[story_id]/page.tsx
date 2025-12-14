import StoryIcon from "@/components/Icon/Story-Icon";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

import type { PuzzlePart, PuzzleGroup } from "@/types/puzzles";
import type { Submission } from "@/types/submissions";

type PageProps = {
  params: {
    story_id: string;
  };
};

export default async function StoryPage({ params }: { params: Promise<{ story_id: string }> }) {
  const { story_id } = await params;

  const supabaseServer = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabaseServer.auth.getUser();

  // fetch puzzle parts
  const { data: partsData, error: partsError } = await supabaseServer
    .from("puzzle_parts")
    .select("id, puzzle_id, part_number")
    .eq("story_id", story_id);

  if (partsError || !partsData) {
    console.error(partsError);
    return <div>Failed to load story</div>;
  }

  const parts = partsData as PuzzlePart[];
  const partIds = parts.map((p) => p.id);

  // fetch solved submissions for user
  let solvedPartIds = new Set<string>();
  if (user && partIds.length > 0) {
    const { data: submissions } = await supabaseServer
      .from("submissions")
      .select("puzzle_part_id")
      .eq("correct", true)
      .eq("user_id", user.id)
      .in("puzzle_part_id", partIds);

    solvedPartIds = new Set(
      (submissions ?? []).map((s: Submission) => s.puzzle_part_id)
    );
  }

  // fetch puzzle titles from puzzles table
  const puzzleIds = Array.from(new Set(parts.map((p) => p.puzzle_id)));
  const { data: puzzleMeta } = await supabaseServer
    .from("puzzles")
    .select("puzzle_id, title")
    .in("puzzle_id", puzzleIds);

  const titleMap = new Map<string, string>();
  puzzleMeta?.forEach((p) => titleMap.set(p.puzzle_id, p.title));

  // group parts by puzzle
  const puzzles = Object.values(
    parts.reduce((acc, part) => {
      if (!acc[part.puzzle_id]) {
        acc[part.puzzle_id] = {
          puzzle_id: part.puzzle_id,
          title: titleMap.get(part.puzzle_id) ?? "Puzzle",
          parts: {},
        } satisfies PuzzleGroup;
      }
      acc[part.puzzle_id].parts[part.part_number] = part;
      return acc;
    }, {} as Record<string, PuzzleGroup>)
  );

  const badgeIfSolved = (part?: PuzzlePart, badge?: string) =>
    part && solvedPartIds.has(part.id) ? badge : undefined;

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
