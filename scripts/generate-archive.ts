/**
 * One-time script to generate archive.json with 60 pre-built character sheets.
 *
 * Usage: npx tsx scripts/generate-archive.ts
 *
 * Reads OPENAI_API_KEY from .env.local in the project root.
 */

import OpenAI from "openai";
import { writeFileSync, readFileSync } from "fs";
import { resolve } from "path";

const envPath = resolve(__dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf-8");
const match = envContent.match(/OPENAI_API_KEY=(.+)/);
const apiKey = match?.[1]?.trim();

if (!apiKey) {
  console.error("No OPENAI_API_KEY found in .env.local");
  process.exit(1);
}

const openai = new OpenAI({ apiKey });

const CHARACTERS = [
  { name: "Hamlet", source: "Hamlet — Shakespeare" },
  { name: "Elizabeth Bennet", source: "Pride and Prejudice — Austen" },
  { name: "Jay Gatsby", source: "The Great Gatsby — Fitzgerald" },
  { name: "Atticus Finch", source: "To Kill a Mockingbird — Lee" },
  { name: "Jane Eyre", source: "Jane Eyre — Brontë" },
  { name: "Sherlock Holmes", source: "Sherlock Holmes — Doyle" },
  { name: "Huckleberry Finn", source: "Adventures of Huckleberry Finn — Twain" },
  { name: "Ebenezer Scrooge", source: "A Christmas Carol — Dickens" },
  { name: "Holden Caulfield", source: "The Catcher in the Rye — Salinger" },
  { name: "Scout Finch", source: "To Kill a Mockingbird — Lee" },
  { name: "Raskolnikov", source: "Crime and Punishment — Dostoevsky" },
  { name: "Meursault", source: "The Stranger — Camus" },
  { name: "Scheherazade", source: "One Thousand and One Nights" },
  { name: "Santiago", source: "The Old Man and the Sea — Hemingway" },
  { name: "Anna Karenina", source: "Anna Karenina — Tolstoy" },
  { name: "Don Quixote", source: "Don Quixote — Cervantes" },
  { name: "Gregor Samsa", source: "The Metamorphosis — Kafka" },
  { name: "Humbert Humbert", source: "Lolita — Nabokov" },
  { name: "Sethe", source: "Beloved — Morrison" },
  { name: "Okonkwo", source: "Things Fall Apart — Achebe" },
  { name: "Odysseus", source: "The Odyssey — Homer" },
  { name: "Sun Wukong", source: "Journey to the West — Wu Cheng'en" },
  { name: "Anansi", source: "West African / Caribbean Folklore" },
  { name: "Persephone", source: "Greek Mythology" },
  { name: "Loki", source: "Norse Mythology" },
  { name: "Gilgamesh", source: "The Epic of Gilgamesh" },
  { name: "Coyote", source: "Native American Trickster Mythology" },
  { name: "Medea", source: "Medea — Euripides" },
  { name: "Arjuna", source: "Mahabharata — Hindu Epic" },
  { name: "Isis", source: "Egyptian Mythology" },
  { name: "Willy Loman", source: "Death of a Salesman — Miller" },
  { name: "Blanche DuBois", source: "A Streetcar Named Desire — Williams" },
  { name: "Nora Helmer", source: "A Doll's House — Ibsen" },
  { name: "Hedda Gabler", source: "Hedda Gabler — Ibsen" },
  { name: "Lady Macbeth", source: "Macbeth — Shakespeare" },
  { name: "Cyrano de Bergerac", source: "Cyrano de Bergerac — Rostand" },
  { name: "Prior Walter", source: "Angels in America — Kushner" },
  { name: "Prospero", source: "The Tempest — Shakespeare" },
  { name: "Mama (Lena Younger)", source: "A Raisin in the Sun — Hansberry" },
  { name: "Vladimir", source: "Waiting for Godot — Beckett" },
  { name: "Rick Blaine", source: "Casablanca (1942)" },
  { name: "Ellen Ripley", source: "Alien (1979)" },
  { name: "The Dude", source: "The Big Lebowski (1998)" },
  { name: "Forrest Gump", source: "Forrest Gump (1994)" },
  { name: "Hannibal Lecter", source: "The Silence of the Lambs (1991)" },
  { name: "Marge Gunderson", source: "Fargo (1996)" },
  { name: "Tyler Durden", source: "Fight Club (1999)" },
  { name: "Clarice Starling", source: "The Silence of the Lambs (1991)" },
  { name: "Amélie Poulain", source: "Amélie (2001)" },
  { name: "Anton Chigurh", source: "No Country for Old Men (2007)" },
  { name: "Walter White", source: "Breaking Bad" },
  { name: "Leslie Knope", source: "Parks and Recreation" },
  { name: "Omar Little", source: "The Wire" },
  { name: "Fleabag", source: "Fleabag" },
  { name: "Tony Soprano", source: "The Sopranos" },
  { name: "Cersei Lannister", source: "Game of Thrones" },
  { name: "Fox Mulder", source: "The X-Files" },
  { name: "Villanelle", source: "Killing Eve" },
  { name: "Michael Scott", source: "The Office" },
  { name: "Rust Cohle", source: "True Detective S1" },
];

function buildPrompt(name: string, source: string): string {
  return `Generate a complete character sheet for ${name} from ${source} as if they were applying to be a bank app customer service agent.

Fill in every section with rich, specific detail that captures this character's essence. The sheet should be detailed enough that someone could perform as this character in a customer service role and remain recognizably themselves.

Respond in JSON only, no markdown fences, no other text:
{
  "name": "${name}",
  "backstory": "...(2-3 sentences)...",
  "desire": "...(one core want)...",
  "fear": "...(one core fear)...",
  "status": "higher|equal|lower",
  "voiceSoundsLike": "...",
  "voiceNeverLike": "...",
  "signatureMoves": ["...", "...", "...", "...", "..."],
  "forbiddenMoves": "...",
  "innerLife": "...",
  "outerLife": "...",
  "source": "${name} — ${source}"
}`;
}

async function main() {
  const results: Record<string, unknown>[] = [];
  const concurrency = 5;

  console.log(`Generating ${CHARACTERS.length} character sheets...`);

  for (let i = 0; i < CHARACTERS.length; i += concurrency) {
    const batch = CHARACTERS.slice(i, i + concurrency);
    const promises = batch.map(async (char) => {
      console.log(`  → ${char.name} (${char.source})`);
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          max_tokens: 1024,
          messages: [{ role: "user", content: buildPrompt(char.name, char.source) }],
        });

        const text = completion.choices[0]?.message?.content || "";
        const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsed = JSON.parse(cleaned);
        return {
          id: `arc-${String(i + batch.indexOf(char) + 1).padStart(3, "0")}`,
          isArchive: true,
          ...parsed,
        };
      } catch (err) {
        console.error(`  ✗ Failed for ${char.name}:`, err);
        return null;
      }
    });

    const batchResults = await Promise.all(promises);
    for (const r of batchResults) {
      if (r) results.push(r);
    }

    if (i + concurrency < CHARACTERS.length) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  const outPath = resolve(__dirname, "../src/data/archive.json");
  writeFileSync(outPath, JSON.stringify(results, null, 2), "utf-8");
  console.log(`\nDone! Wrote ${results.length} characters to ${outPath}`);
}

main();
