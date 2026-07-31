// LLM connection tester — works with OpenAI-compatible endpoints
// and Anthropic's native API.

interface TestParams {
  provider: string;
  model: string;
  apiKey: string;
  baseUrl: string;
}

interface TestResult {
  success: boolean;
  latencyMs: number;
  modelResponse?: string;
  error?: string;
}

export async function testLLMConnection(params: TestParams): Promise<TestResult> {
  const { provider, model, apiKey, baseUrl } = params;
  const start = Date.now();

  try {
    let response: string | null = null;
    let error: string | null = null;

    if (provider === "anthropic") {
      // Anthropic has its own API format
      const res = await fetch(`${baseUrl}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: 50,
          messages: [
            { role: "user", content: "Respond with exactly: FANTASY_READY" },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        response = data.content?.[0]?.text ?? "OK";
      } else {
        const data = await res.json().catch(() => ({}));
        error = data.error?.message ?? `HTTP ${res.status}`;
      }
    } else {
      // OpenAI-compatible (OpenAI, z.ai, Together, custom, etc.)
      const url = baseUrl.endsWith("/")
        ? `${baseUrl}chat/completions`
        : `${baseUrl}/chat/completions`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          max_tokens: 50,
          temperature: 0,
          messages: [
            { role: "user", content: "Respond with exactly: FANTASY_READY" },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        response = data.choices?.[0]?.message?.content ?? "OK";
      } else {
        const data = await res.json().catch(() => ({}));
        error = data.error?.message ?? `HTTP ${res.status}`;
      }
    }

    const latencyMs = Date.now() - start;

    if (response !== null) {
      return { success: true, latencyMs, modelResponse: response };
    }

    return { success: false, latencyMs, error: error ?? "Unknown error" };
  } catch (err) {
    const latencyMs = Date.now() - start;
    return {
      success: false,
      latencyMs,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
