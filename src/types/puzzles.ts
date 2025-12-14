export type PuzzlePart = {
  id: string;
  puzzle_id: string;
  part_number: 0 | 1 | 2;
  solution: string;
  content: string; 
};

export type Puzzle = {
  story_id: string; 
  puzzle_id: string;
  title: string; 
};
  
export type PuzzleGroup = {
    puzzle_id: string;
    title: string;
    parts: {
      0?: PuzzlePart;
      1?: PuzzlePart;
      2?: PuzzlePart;
    };
};