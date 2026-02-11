import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { model } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TOPICS = [
  '디스플레이 패널 기술 (OLED, Mini-LED, IPS, VA)',
  '화면 주사율 및 응답속도 (Hz, ms, G-Sync)',
  'CPU 프로세서 아키텍처 (코어, 스레드, 클럭, 캐시)',
  'GPU 그래픽 기술 (Ray Tracing, DLSS, TGP)',
  '메모리 및 저장장치 (DDR5, LPDDR5X, NVMe, PCIe 4.0)',
  '배터리 및 충전 기술 (GaN, PD충전, mAh, Wh)',
  '무선 네트워크 기술 (Wi-Fi 6E, Wi-Fi 7, Bluetooth 코덱)',
  '유선 연결 인터페이스 (Thunderbolt 4, USB4, HDMI 2.1)',
  '카메라 센서 및 렌즈 (OIS, 조리개, 화소 비닝)',
  '오디오 음향 기술 (ANC, LDAC, Hi-Res, 공간음향)',
  '키보드 스위치 및 타건감 (청축, 적축, 무접점)',
  '마우스 센서 및 DPI (Polling Rate, IPS)',
  '냉장고 핵심 기술 (인버터 컴프레서, 독립냉각)',
  '세탁기 및 건조기 기술 (히트펌프, DD모터)',
  '청소기 흡입력 및 필터 (Pa, AW, HEPA)',
  'TV 화질 처리 엔진 (Upscaling, HDR10+, Dolby Vision)',
  '스마트홈 및 IoT 표준 (Matter, Zigbee)',
  '운영체제 및 소프트웨어 (Windows 11, macOS, Android)',
  '최신 AI 기술 용어 (NPU, TOPS, LLM)',
  '쿨링 및 발열 제어 (베이퍼챔버, 서멀그리스)'
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  
  if (secret !== process.env.CRON_SECRET) { 
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

  const randomTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)];

  try {
    const prompt = `
      역할: 당신은 IT 전문 백과사전 편집장입니다.
      주제: '${randomTopic}'
      임무: 위 주제와 관련된 **전문적이고 소비자가 혼동하기 쉬운 핵심 용어 10개**를 선정하여 설명하세요.
      
      [제약 조건]
      1. 반드시 JSON 형식으로만 출력하세요.
      2. 설명은 초보자가 이해하기 쉽도록 비유를 포함하여 3~5문장으로 상세하게 작성하세요.
      3. 너무 기초적인 단어(예: 마우스, 전원, 버튼)는 제외하고, 스펙표에 나오는 기술 용어 위주로 작성하세요.

      [출력 JSON 형식]
      {
        "terms": [
          {
            "term": "주사율 (Refresh Rate)",
            "description": "모니터가 1초에 화면을 몇 번 갱신하는지를 나타내는 수치입니다. 단위는 Hz를 사용하며, 144Hz라면 1초에 144장의 이미지를 보여줍니다. 수치가 높을수록 화면의 움직임이 부드러워져 FPS 게임이나 빠른 스크롤 시 눈의 피로가 적습니다.",
            "category": "디스플레이"
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    
    text = text.replace(/```json/g, "").replace(/```/g, "");
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      text = text.substring(firstBrace, lastBrace + 1);
    }

    const { terms } = JSON.parse(text);

    let addedCount = 0;
    for (const item of terms) {
      const { error } = await supabase.from('dictionary').upsert({
        term: item.term.split('(')[0].trim(),
        description: item.description,
        category: item.category
      }, { onConflict: 'term' });
      
      if (!error) addedCount++;
    }

    return NextResponse.json({ success: true, topic: randomTopic, added: addedCount });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}