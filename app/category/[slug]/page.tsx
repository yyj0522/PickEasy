import { Metadata } from 'next';
import CategoryClient from './CategoryClient';

const CATEGORY_MAP: Record<string, string> = {
  laptop: '노트북',
  monitor: '모니터',
  mouse: '마우스',
  keyboard: '키보드',
  tablet: '태블릿',
  cleaner: '청소기',
  dryer: '드라이기',
  audio: '음향기기',
  massage: '안마기',
  watch: '스마트워치',
  camera: '카메라',
  accessory: 'IT소품',
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const categoryName = CATEGORY_MAP[slug] || slug.toUpperCase();

  return {
    title: `${categoryName} 추천 가이드 및 인기 순위 | PickEasy`,
    description: `실패 없는 ${categoryName} 쇼핑을 위한 AI 분석 가이드. ${categoryName} 스펙 비교, 최저가 정보, 추천 제품을 확인하세요.`,
    openGraph: {
      title: `이달의 ${categoryName} 추천 베스트`,
      description: '고민은 AI가, 선택은 빠르게. 픽이지에서 최적의 모델을 찾아드립니다.',
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CategoryClient slug={slug} />;
}