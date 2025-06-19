'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Search, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';

interface StockData {
  name: string;
  price: number;
  change: number;
  marketCap: string;
  [key: string]: any;
}

interface MarketIndexData {
  name: string;
  price: number;
  change: number;
  history: number[];
  [key: string]: any;
}

interface NewsItemData {
  title: string;
  time: string;
  source: string;
  image: string; // URL of the image
}

const sampleStocksData: {[ticker: string]: StockData} = {
  AAPL: { name: 'Apple Inc.', price: 178.52, change: 2.41, marketCap: '2.8T' },
  MSFT: { name: 'Microsoft Corporation', price: 285.76, change: 1.85, marketCap: '2.65T' },
  AMZN: { name: 'Amazon.com Inc.', price: 147.03, change: 3.21, marketCap: '1.5T' },
  GOOGL: { name: 'Alphabet Inc. (Class A)', price: 132.58, change: 1.53, marketCap: '1.4T' },
  META: { name: 'Meta Platforms Inc.', price: 245.12, change: 2.15, marketCap: '1.2T' },
  TSLA: { name: 'Tesla Inc.', price: 910.27, change: -1.23, marketCap: '0.9T' },
  NVDA: { name: 'NVIDIA Corporation', price: 295.45, change: 4.52, marketCap: '3.0T' },
  JPM: { name: 'JPMorgan Chase & Co.', price: 182.36, change: 0.83, marketCap: '0.5T' },
  JNJ: { name: 'Johnson & Johnson', price: 156.81, change: -0.62, marketCap: '0.4T' },
  V: { name: 'Visa Inc.', price: 275.44, change: 1.24, marketCap: '0.5T' },
};

// Sample historical data for sparklines
const nasdaqHistory = [18900, 18950, 19050, 19100, 19150, 19080, 19100.94];
const sp500History = [5800, 5820, 5850, 5870, 5900, 5890, 5888.55];
const vixHistory = [19.5, 19.2, 19.0, 18.8, 19.1, 19.05, 18.99];
const djiHistory = [38500, 38600, 38700, 38750, 38800, 38780, 38712.21];

const sampleMarketIndices: {[key: string]: MarketIndexData} = {
  NASDAQ: { name: '나스닥', price: 19100.94, change: -98.22, history: nasdaqHistory },
  SP500: { name: 'S&P 500', price: 5888.55, change: -32.99, history: sp500History },
  VIX: { name: 'VIX', price: 18.99, change: -0.32, history: vixHistory },
  DJI: { name: '다우존스', price: 38712.21, change: 15.23, history: djiHistory },
};

// Sample news data
const sampleNewsData: NewsItemData[] = [
  {
    title: 'UBS, 30% 더 오를 것..."공급망 재고 우려 줄어"',
    time: '1시간 전',
    source: '이데일리',
    image: 'https://picsum.photos/id/1015/80/60', // Sample image URL
  },
  {
    title: '엔비디아 호실적에도 젠슨황 "수출 규제 장기적 타격, 中에 이득"',
    time: '24분 전',
    source: '서울경제',
    image: 'https://picsum.photos/id/1025/80/60', // Sample image URL
  },
   {
    title: '엔비디아 훈풍에 어느새 \'21만닉스\'...데이터센터·전력株 급등',
    time: '33분 전',
    source: '매일경제',
    image: 'https://picsum.photos/id/1033/80/60', // Sample image URL
  },
   {
    title: '리 오토, 실적 부진에 개장전↓..."中 전기차 시장 경쟁 치열"',
    time: '2시간 전',
    source: '이데일리',
    image: 'https://picsum.photos/id/1041/80/60', // Sample image URL
  },
    {
    title: '트럼프, 관세 살리기 위해 우회경로? 긴급 항소?',
    time: '2시간 전',
    source: '한국경제',
    image: 'https://picsum.photos/id/1050/80/60', // Sample image URL
  },
];

const parseMarketCap = (marketCap: string): number => {
  const value = parseFloat(marketCap);
  if (isNaN(value)) return 0;
  const suffix = marketCap.slice(-1).toUpperCase();
  switch (suffix) {
    case 'T': return value * 1e12;
    case 'B': return value * 1e9;
    case 'M': return value * 1e6;
    default: return value;
  }
};

// Simple Sparkline component
const SparklineChart: React.FC<{ data: number[]; isPositive: boolean }> = ({ data, isPositive }) => {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min === 0 ? 1 : max - min; // Avoid division by zero

  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 100 100" className="w-16 h-8 inline-block"> {/* Adjusted size */}
      <polyline
        fill="none"
        stroke={isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'} // Tailwind green-500/red-500 approximate
        strokeWidth="5" // Adjusted stroke width for visibility
        points={points}
        vectorEffect="non-scaling-stroke" // Prevent stroke scaling
      />
    </svg>
  );
};

// News Headline Item component
const NewsHeadlineItem: React.FC<{ news: NewsItemData }> = ({ news }) => {
  return (
    <div className="flex items-center gap-4 border-b border-gray-200 pb-3 mb-3 last:border-0 last:mb-0 last:pb-0">
      <div className="flex-grow">
        <h4 className="font-medium text-gray-900 line-clamp-2">{news.title}</h4>
        <div className="text-xs text-gray-500 mt-1">
          {news.time} • {news.source}
        </div>
      </div>
      <img src={news.image} alt={news.title} className="w-20 h-20 object-cover rounded-md flex-shrink-0" />
    </div>
  );
};

export default function StocksOverview() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // 로그인 상태 확인
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    if (isLoggedIn !== 'true') {
      alert('로그인이 필요합니다.')
      router.push('/login')
      return
    }
  }, [router])

  const sortedAndFilteredStocks = useMemo(() => {
    const stocksArray = Object.entries(sampleStocksData).map(([ticker, data]) => ({
      ticker,
      ...data,
      marketCapValue: parseMarketCap(data.marketCap),
    }));

    const filtered = stocksArray.filter(
      (stock) =>
        stock.ticker.includes(searchTerm.toUpperCase()) ||
        stock.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => b.marketCapValue - a.marketCapValue);

    return filtered;
  }, [searchTerm]);

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <Link href="/">
        <Button variant="outline" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> 홈으로 돌아가기
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>S&P 500 종목 시가총액 순위</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="종목 티커 또는 이름 검색"
                    className="pl-10 py-6 border-gray-300 rounded-xl"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {sortedAndFilteredStocks.length > 0 ? (
                <div className="overflow-y-auto pr-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-left">순위</TableHead>
                        <TableHead className="text-left">티커</TableHead>
                        <TableHead className="text-left">종목명</TableHead>
                        <TableHead className="text-right">현재가</TableHead>
                        <TableHead className="text-right">변동률</TableHead>
                        <TableHead className="text-right">시가총액</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedAndFilteredStocks.map((stock, index) => (
                        <TableRow key={stock.ticker}>
                          <TableCell className="py-3 px-2">{index + 1}</TableCell>
                          <TableCell className="py-3 px-2 font-semibold text-gray-900">
                            <Link href={`/stock/${stock.ticker}`} className="hover:text-blue-600">
                              {stock.ticker}
                            </Link>
                          </TableCell>
                          <TableCell className="py-3 px-2 text-gray-800">{stock.name}</TableCell>
                          <TableCell className="py-3 px-2 text-right text-gray-800">${stock.price.toFixed(2)}</TableCell>
                          <TableCell className={`py-3 px-2 text-right font-medium ${
                            stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            <div className="flex items-center justify-end gap-1">
                              {stock.change >= 0 ?
                                <TrendingUp className="h-4 w-4" /> :
                                <TrendingDown className="h-4 w-4" />
                              }
                              {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                            </div>
                          </TableCell>
                          <TableCell className="py-3 px-2 text-right text-gray-800">{stock.marketCap}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-10 text-center text-gray-500">
                  <p className="text-lg font-medium">검색 결과가 없습니다.</p>
                  <p className="mt-2">다른 키워드로 검색해보세요.</p>
                </div>
              )}

            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>주요 시장 지수</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(sampleMarketIndices).map(([key, indexData]) => (
                <div key={key} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-800">{indexData.name}</span>
                    <span className={`text-sm font-medium ${indexData.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {indexData.change >= 0 ? '+' : ''}{indexData.change.toFixed(2)} ({((indexData.change / (indexData.price - indexData.change)) * 100).toFixed(2)}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <SparklineChart data={indexData.history} isPositive={indexData.change >= 0} />
                    <div>
                      <div className="font-bold text-lg text-blue-600">{indexData.price.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>실시간 뉴스 헤드라인</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4"> {/* Added space-y-4 for spacing between news items */}
              {/* Render sample news data */}
              {sampleNewsData.map((news, index) => (
                <NewsHeadlineItem key={index} news={news} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 