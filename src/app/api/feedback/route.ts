// import { NextRequest, NextResponse } from "next/server";
// import fs from "fs";
// import path from "path";

// export async function POST(req: NextRequest) {
//   try {
//     const { name, email, suggestion } = await req.json();

//     if (!name || !email || !suggestion) {
//       return NextResponse.json({ error: "All fields required" }, { status: 400 });
//     }

//     const content = `Name: ${name}\nEmail: ${email}\nSuggestion: ${suggestion}\n---\n`;

//     const filePath = path.join(process.cwd(), "/temp_DB/response.txt");
//     fs.appendFileSync(filePath, content, "utf8");

//     return NextResponse.json({ success: true, message: "Feedback saved!" }, { status: 200 });
//   } catch (error) {
//     console.error("Error writing to file:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  const body = await req.json();

  const { name, email, subject, message } = body;
  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const content = `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage: ${message}\n---\n`;

  const filePath = path.join(process.cwd(), "/temp_DB/response.txt");
  await writeFile(filePath, content, { flag: "a" });

  return NextResponse.json({ message: "Feedback received!" });
}
