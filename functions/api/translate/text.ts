import { buildSystemInstruction, GEMINI_MODEL } from '../../_lib/translate-prompt';

interface Env {
  GEMINI_API_KEY: string;
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  try {
    const apiKey = context.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'GEMINI_API_KEY가 설정되지 않았습니다' }, { status: 500 });
    }

    const { text, tone } = (await context.request.json()) as { text?: string; tone?: string };
    if (!text?.trim()) {
      return Response.json({ error: '가사를 입력해주세요' }, { status: 400 });
    }

    const systemInstruction = buildSystemInstruction(tone);

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [{ parts: [{ text }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      },
    );

    if (!geminiRes.ok) {
      const geminiError = await geminiRes.text();
      console.error('Gemini API error:', geminiRes.status, geminiError);
      return Response.json({ error: '번역에 실패했습니다' }, { status: 500 });
    }

    const data = (await geminiRes.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) {
      console.error('Gemini API returned empty response:', JSON.stringify(data));
      return Response.json({ error: '번역 결과가 비어 있습니다' }, { status: 500 });
    }

    const result = JSON.parse(responseText);
    return Response.json({ result });
  } catch (error) {
    console.error('Translation error:', error);
    return Response.json({ error: '번역에 실패했습니다' }, { status: 500 });
  }
};
