import fs from "fs";
import path from "path";
import Markdown from "@/components/Markdown";

export default function LocalPreview() {
  
  const filePath = path.join(process.cwd(), "puzzle-draft", "00_00/00_00.mdx");

  let content = "";
  try {
    content = fs.readFileSync(filePath, "utf8");
  } catch (error) {
    content = `# ❌ File Not Found\nTried to load:\n\`${filePath}\``;
  }

  return (
    <div>
      
      <Markdown content={content} />
    </div>
  );
}