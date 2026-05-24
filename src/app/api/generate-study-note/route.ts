import { NextRequest, NextResponse } from "next/server";

type OpenAITextBlock = {
  type?: string;
  text?: string;
};

type OpenAIOutputItem = {
  type?: string;
  content?: OpenAITextBlock[];
};

function extractText(output: OpenAIOutputItem[] | undefined) {
  if (!output) {
    return "";
  }

  return output
    .flatMap((item) => item.content ?? [])
    .filter((block) => block.type === "output_text" && typeof block.text === "string")
    .map((block) => block.text?.trim() ?? "")
    .filter(Boolean)
    .join("\n\n");
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      apiKey?: string;
      model?: string;
      prompt?: string;
    };

    const apiKey = typeof body.apiKey === "string" ? body.apiKey.trim() : "";
    const model = typeof body.model === "string" ? body.model.trim() : "";
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";

    if (!apiKey || !model || !prompt) {
      return NextResponse.json({ error: "apiKey, model, prompt が必要です。" }, { status: 400 });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        tools: [{ type: "web_search_preview" }],
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text: "You are a concise Japanese study coach for the IT Passport exam (ITパスポート) and the Intellectual Property Management Skills Test Grade 3 (知的財産管理技能検定3級). Use web search when it helps. Give current, practical study notes with bullet points and clearly separate facts from tips.",
              },
            ],
          },
          {
            role: "user",
            content: [{ type: "input_text", text: prompt }],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `OpenAI API error: ${errorText}` },
        { status: response.status }
      );
    }

    const data = (await response.json()) as { output?: OpenAIOutputItem[] };
    const text = extractText(data.output);

    if (!text) {
      return NextResponse.json({ error: "応答本文を取得できませんでした。" }, { status: 502 });
    }

    return NextResponse.json({ text });
  } catch (error) {
    const message = error instanceof Error ? error.message : "不明なエラーが発生しました。";
    return NextResponse.json({ error: `AI生成に失敗しました: ${message}` }, { status: 500 });
  }
}
