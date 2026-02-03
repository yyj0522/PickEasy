// app/lib/search.ts

export async function searchWeb(query: string) {
  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": process.env.SERPER_API_KEY || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: query,
        gl: "kr", // 한국
        hl: "ko", // 한국어
        num: 5,   // 상위 5개 결과만 (비용 절약)
      }),
    });

    if (!response.ok) throw new Error("Serper API Failed");

    const data = await response.json();
    
    if (!data.organic || data.organic.length === 0) return "";

    // AI에게 줄 요약본 (제목, 링크, 가격 정보 포함)
    return data.organic.map((r: any) => {
      const priceInfo = r.richSnippet?.price ? ` (가격: ${r.richSnippet.price})` : "";
      return `- 제목: ${r.title}\n- 링크: ${r.link}\n- 내용: ${r.snippet}${priceInfo}`;
    }).join("\n\n");

  } catch (error) {
    console.error("Search Error:", error);
    return ""; 
  }
}