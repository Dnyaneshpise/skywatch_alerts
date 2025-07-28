import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  const body = await req.json();

  const { name, email, subject, message, topic } = body;

  // Validate all fields including topic
  if (!name || !email || !subject || !message || !topic) {
    return NextResponse.json(
      { error: "All fields are required including topic" },
      { status: 400 }
    );
  }

  const content = `
Name: ${name}
Email: ${email}
Subject: ${subject}
Topic: ${topic}
Message: ${message}
---
`;

  const filePath = path.join(process.cwd(), "/temp_DB/response.txt");

  try {
    await writeFile(filePath, content, { flag: "a" });
    return NextResponse.json({ message: "Feedback received!" });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to write feedback" },
      { status: 500 }
    );
  }
}
