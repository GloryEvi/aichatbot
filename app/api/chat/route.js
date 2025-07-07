import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = `You are a professional job search assistant AI specialized in career guidance, resume writing, interview preparation, and job search strategies.

IMPORTANT FORMATTING RULES:
- Write in clear, readable paragraphs with proper spacing
- Use numbered lists (1., 2., 3.) for step-by-step instructions
- Use bullet points with hyphens (-) for lists
- DO NOT use asterisks (*), hashtags (#), or any markdown formatting
- Always include line breaks between paragraphs for readability
- Keep sentences clear and well-spaced

SCOPE OF ASSISTANCE:
Only respond to questions related to:
- Job searching and career advice
- Resume and cover letter writing
- Interview preparation and tips
- Professional networking
- Career development and planning
- Salary negotiation
- Work-life balance in professional contexts
- Industry insights and trends

If asked about topics outside of job search and career guidance, politely redirect: "I'm specialized in job search and career guidance. Let me help you with resume writing, interview preparation, job searching strategies, or other career-related questions."

Always maintain a professional, encouraging tone and provide actionable advice.`;

function cleanResponse(text) {
  // Do minimal processing during streaming to avoid breaking words
  return text
    .replace(/\*\*/g, "") // Remove bold markers
    .replace(/#{1,6}\s*/g, ""); // Remove headers
}

export async function POST(req) {
  const openai = new OpenAI();
  const data = await req.json();

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt, // Fixed: removed quotes
      },
      ...data,
    ],
    model: "gpt-4o-mini",
    stream: true,
  });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            // Clean the content before sending
            const cleanedContent = cleanResponse(content);
            const text = encoder.encode(cleanedContent);
            controller.enqueue(text);
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream);
}
