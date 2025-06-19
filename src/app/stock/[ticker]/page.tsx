'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import StockChart from '@/components/StockChart';
import { 
  BarChart, 
  TrendingUp, 
  TrendingDown,
  ArrowLeft,
  Calendar,
  DollarSign,
  LineChart,
  Newspaper,
  Brain,
  Users,
  PieChart,
  Lightbulb,
  PlusSquare,
  MinusSquare,
  AlertCircle
} from 'lucide-react';
import dayjs from 'dayjs'; // Import dayjs for date manipulation
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrBefore);
import 'dayjs/locale/ko'; // Import Korean locale
dayjs.locale('ko'); // Set locale to Korean

// Utility function to generate more varied sample data for longData
const generateMoreVariedData = (basePrice: number, points: number, volatility: number = 0.02) => {
    const result = [];
    let lastPrice = basePrice;
    for (let i = 0; i < points; i++) {
        const change = (Math.random() - 0.5) * volatility * lastPrice;
        lastPrice = lastPrice + change;
        if (lastPrice < basePrice * 0.8) lastPrice = basePrice * 0.8; // Prevent excessive drops
        if (lastPrice > basePrice * 1.2) lastPrice = basePrice * 1.2; // Prevent excessive gains
        result.push(lastPrice);
    }
    return result;
};

// Utility function to generate more varied sample data with dates
const generateDateAwareData = (startDate: dayjs.Dayjs, endDate: dayjs.Dayjs, points: number, basePrice: number, volatility: number = 0.02) => {
    const totalDays = endDate.diff(startDate, 'day');
    // Ensure we have at least 2 points for a line chart if possible
    const numPoints = Math.max(points, 2);
    // Adjust interval calculation to ensure the end date is included as the last point
    const interval = numPoints > 1 ? Math.max(Math.floor(totalDays / (numPoints - 1)), 1) : 1; 

    const result = [];
    let currentDate = dayjs(startDate);
    let lastPrice = basePrice;

    for (let i = 0; i < numPoints; i++) {
        const change = (Math.random() - 0.5) * volatility * lastPrice;
        let currentPrice = lastPrice + change;
        
        // Ensure price is a finite number
        if (!isFinite(currentPrice)) {
          currentPrice = result.length > 0 ? result[result.length - 1].price : basePrice; // Use previous price or base price if not finite
        }
        if (currentPrice < basePrice * 0.7) currentPrice = basePrice * 0.7; // Prevent excessive drops
        if (currentPrice > basePrice * 1.3) currentPrice = basePrice * 1.3; // Prevent excessive gains

        // Synthesize OHLC data based on currentPrice and lastPrice
        const open = lastPrice;
        const close = currentPrice;
        const high = Math.max(open, close) + Math.abs(change) * 0.5; // High is max of open/close plus some volatility
        const low = Math.min(open, close) - Math.abs(change) * 0.5; // Low is min of open/close minus some volatility

        // Ensure OHLC are finite numbers
        const validatedOpen = isFinite(open) ? open : (result.length > 0 ? result[result.length - 1].open : basePrice);
        const validatedClose = isFinite(close) ? close : (result.length > 0 ? result[result.length - 1].close : basePrice);
        const validatedHigh = isFinite(high) ? high : Math.max(validatedOpen, validatedClose) + (result.length > 0 ? Math.abs(validatedClose - result[result.length - 1].close) : Math.abs(change)) * 0.5; // Use previous or calculated volatility
        const validatedLow = isFinite(low) ? low : Math.min(validatedOpen, validatedClose) - (result.length > 0 ? Math.abs(validatedClose - result[result.length - 1].close) : Math.abs(change)) * 0.5; // Use previous or calculated volatility
        
        result.push({
            date: currentDate.valueOf(), // Store date as timestamp
            price: validatedClose, // 'price' can still be used for tooltips or other general price reference
            open: validatedOpen,
            high: validatedHigh,
            low: validatedLow,
            close: validatedClose,
            isUp: validatedClose >= validatedOpen // Determine if the candlestick is bullish (green)
        });

        lastPrice = validatedClose; // Update lastPrice for the next iteration using the validated close

        // Move to the next date, ensuring we don't exceed the end date before the last point
        if (i < numPoints - 1) { 
          let nextDate = currentDate.add(interval, 'day');
          while (nextDate.day() === 0 || nextDate.day() === 6) { // 0 = Sunday, 6 = Saturday
            nextDate = nextDate.add(1, 'day');
          }
           // If the next date goes beyond the end date before the last point, set the current date to the interval that hits the end date at the last point
           if (nextDate.isAfter(endDate) && i < numPoints - 2) {
              // Calculate remaining days and points to determine a smaller interval
              const remainingDays = endDate.diff(currentDate, 'day');
              const remainingPoints = numPoints - 1 - i;
              const smallerInterval = Math.max(Math.floor(remainingDays / remainingPoints), 1);
              currentDate = currentDate.add(smallerInterval, 'day');
           } else if (i === numPoints - 2) { // For the second to last point, the next date should be the endDate
              currentDate = endDate;
           } 
            else {
             currentDate = nextDate;
           }
        } else if (i === numPoints - 1 && dayjs(result[i].date).isBefore(endDate)) {
             // Ensure the very last point is exactly on the end date
             result[i].date = endDate.valueOf();
        }
    }
    
     // Final adjustment to ensure the last data point date is exactly the endDate if needed
    if (result.length > 0) {
       result[result.length - 1].date = endDate.valueOf();
    }

    return result;
};

// Define the end date for the charts
const chartEndDate = dayjs('2025-05-30');

// S&P 500 상위 종목 데이터 (샘플 데이터) - Updated with date-aware longData
const sp500StocksData: {[ticker: string]: any} = {
  AAPL: { 
    name: 'Apple Inc.',
    price: 178.52, // Using price from the expanded list for consistency
    change: 2.41, // Using change from the expanded list
    marketCap: '2.8T', // Using marketCap from the expanded list
    pe: 28.5,
    dividend: 0.65,
    volume: '58.3M',
    avg_volume: '62.1M',
    high_52w: 182.5,
    low_52w: 142.2,
    // data: [150, 152, 148, 155, 160, 158, 162, 165, 163, 167, 170, 172, 175, 178], // Removed short data array
    longData: generateDateAwareData(chartEndDate.subtract(5, 'year'), chartEndDate, 500, 150, 0.01), // Generate 5 years of data points
    sentiment: 'positive',
    aiPrediction: { // Keep existing sample AI prediction for Apple
      day7: { price: 185.8, change: 4.4 }, // Use 7-day from original request
      month1: { price: 195.5, change: 8.3 }, // Placeholder from original request
      month6: { price: 220.0, change: 23.1 }, // Placeholder from original request
      confidence: 78
    },
    analysts: { // Keep existing sample analysts data for Apple
      buy: 25,
      hold: 8,
      sell: 2,
      targetPrice: 195.2,
      targetChange: 9.7
    },
    news: [ // Keep existing sample news for Apple
      { title: '애플, 아이폰 16 생산량 증가 계획', date: '2024-06-25', source: 'Tech Times', sentiment: 'positive' },
      { title: '애플 Apple Intelligence AI 기능 공개, iOS 18 베타 출시', date: '2024-06-22', source: 'CNBC', sentiment: 'positive' },
      { title: '애플, 자율주행차 프로젝트 축소 보도', date: '2024-06-18', source: 'Bloomberg', sentiment: 'negative' },
      { title: '애플, 중국 시장 점유율 회복 움직임', date: '2024-06-15', source: 'Reuters', sentiment: 'neutral' }
    ],
    financials: { // Keep existing sample financials for Apple
      revenue: { value: '94.8B', growth: 4.8 },
      netIncome: { value: '23.6B', growth: 5.2 },
      ebitda: { value: '32.1B', growth: 3.9 },
      eps: { value: '1.53', growth: 6.2 }
    },
  },
  MSFT: { 
    name: 'Microsoft Corporation',
    price: 285.76, change: 1.85, marketCap: '2.65T',
    pe: 35.1,
    dividend: 0.75,
    volume: '25.1M',
    avg_volume: '28.5M',
    high_52w: 290.0,
    low_52w: 220.5,
    // data: [250, 255, 252, 258, 265, 260, 268, 275, 270, 278, 280, 282, 285], // Removed short data array
    longData: generateDateAwareData(chartEndDate.subtract(5, 'year'), chartEndDate, 500, 250, 0.01), // Generate 5 years of data points
    sentiment: 'positive',
    aiPrediction: {
      day7: { price: 290.1, change: 1.5 },
      month1: { price: 305.0, change: 6.7 },
      month6: { price: 330.0, change: 15.5 },
      confidence: 85
    },
    analysts: {
      buy: 30,
      hold: 5,
      sell: 1,
      targetPrice: 310.5,
      targetChange: 8.7
    },
    news: [
      { title: '마이크로소프트, AI 투자 확대 발표', date: '2024-06-26', source: 'Reuters', sentiment: 'positive' },
      { title: 'MSFT 클라우드 사업 성장세 지속', date: '2024-06-20', source: 'Bloomberg', sentiment: 'positive' },
      { title: 'EU, 마이크로소프트 반독점 조사 착수', date: '2024-06-14', source: 'Financial Times', sentiment: 'negative' }
    ],
    financials: {
      revenue: { value: '61.9B', growth: 17.0 },
      netIncome: { value: '21.9B', growth: 20.0 },
      ebitda: { value: '30.5B', growth: 18.5 },
      eps: { value: '2.94', growth: 21.0 }
    },
    investmentPoints: {
      strengths: [
        '• 클라우드 컴퓨팅 (Azure) 시장 리더십 강화',
        '• 강력한 엔터프라이즈 소프트웨어 및 서비스 포트폴리오',
        '• AI 및 신기술 분야 투자 확대'
      ],
      risks: [
        '• 클라우드 시장 경쟁 심화',
        '• 반독점 규제 리스크',
        '• 대규모 투자에 따른 비용 증가'
      ]
    }
  },
  AMZN: {
    name: 'Amazon.com Inc.',
    price: 147.03, change: 3.21, marketCap: '1.5T',
    pe: 55.2,
    dividend: 0.0,
    volume: '45.6M',
    avg_volume: '50.2M',
    high_52w: 150.0,
    low_52w: 105.0,
    // data: [130, 132, 128, 135, 140, 138, 142, 145, 143, 147], // Removed short data array
    longData: generateDateAwareData(chartEndDate.subtract(5, 'year'), chartEndDate, 500, 120, 0.015), // Generate 5 years of data points
    sentiment: 'positive',
    aiPrediction: {
      day7: { price: 150.5, change: 2.3 },
      month1: { price: 158.0, change: 7.5 },
      month6: { price: 170.0, change: 15.0 },
      confidence: 82
    },
    analysts: {
      buy: 40,
      hold: 3,
      sell: 0,
      targetPrice: 165.0,
      targetChange: 12.2
    },
    news: [
      { title: '아마존, AWS 성장 가속화 전망', date: '2024-06-27', source: 'TechCrunch', sentiment: 'positive' },
      { title: '아마존, 신규 물류 센터 투자 확대', date: '2024-06-21', source: 'Wall Street Journal', sentiment: 'positive' },
      { title: '온라인 쇼핑 경쟁 심화, 아마존 전략 변화 모색', date: '2024-06-16', source: 'New York Times', sentiment: 'neutral' }
    ],
    financials: {
      revenue: { value: '143.3B', growth: 13.0 },
      netIncome: { value: '10.7B', growth: 3.0 },
      ebitda: { value: '23.5B', growth: 15.0 },
      eps: { value: '0.98', growth: 5.0 }
    },
  },
  GOOGL: {
    name: 'Alphabet Inc. (Class A)',
    price: 132.58, change: 1.53, marketCap: '1.4T',
    pe: 25.5,
    dividend: 0.0,
    volume: '30.5M',
    avg_volume: '35.0M',
    high_52w: 135.0,
    low_52w: 100.0,
    // data: [120, 125, 122, 128, 130, 127, 131, 133], // Removed short data array
    longData: generateDateAwareData(chartEndDate.subtract(5, 'year'), chartEndDate, 500, 110, 0.012), // Generate 5 years of data points
    sentiment: 'neutral',
    aiPrediction: {
      day7: { price: 134.0, change: 1.1 },
      month1: { price: 138.0, change: 4.1 },
      month6: { price: 145.0, change: 9.4 },
      confidence: 75
    },
    analysts: {
      buy: 35,
      hold: 7,
      sell: 1,
      targetPrice: 140.0,
      targetChange: 5.6
    },
    news: [
      { title: '구글, AI 모델 발표 경쟁 가열', date: '2024-06-28', source: 'TechCrunch', sentiment: 'positive' },
      { title: '알파벳 자율주행 부문 웨이모, 투자 유치 성공', date: '2024-06-22', source: 'Reuters', sentiment: 'positive' }
    ],
    financials: {
      revenue: { value: '80.5B', growth: 15.0 },
      netIncome: { value: '25.4B', growth: 20.0 },
      ebitda: { value: '35.0B', growth: 18.0 },
      eps: { value: '1.20', growth: 22.0 }
    },
  },
  META: {
    name: 'Meta Platforms Inc.',
    price: 245.12, change: 2.15, marketCap: '1.2T',
    pe: 38.0,
    dividend: 0.0,
    volume: '15.8M',
    avg_volume: '18.0M',
    high_52w: 250.0,
    low_52w: 180.0,
    // data: [220, 225, 230, 235, 240, 238, 242, 245], // Removed short data array
    longData: generateDateAwareData(chartEndDate.subtract(5, 'year'), chartEndDate, 500, 200, 0.02), // Generate 5 years of data points
    sentiment: 'positive',
    aiPrediction: {
      day7: { price: 248.0, change: 1.2 },
      month1: { price: 255.0, change: 4.0 },
      month6: { price: 270.0, change: 10.1 },
      confidence: 70
    },
    analysts: {
      buy: 28,
      hold: 10,
      sell: 3,
      targetPrice: 260.0,
      targetChange: 6.0
    },
    news: [
      { title: '메타버스 투자 성과 가시화, 메타 주가 상승', date: '2024-06-29', source: 'Business Insider', sentiment: 'positive' },
      { title: '메타, 새로운 VR 헤드셋 출시 임박', date: '2024-06-24', source: 'The Verge', sentiment: 'positive' }
    ],
    financials: {
      revenue: { value: '40.1B', growth: 27.0 },
      netIncome: { value: '11.6B', growth: 35.0 },
      ebitda: { value: '18.0B', growth: 30.0 },
      eps: { value: '4.32', growth: 38.0 }
    },
  },
  TSLA: {
    name: 'Tesla Inc.',
    price: 910.27, change: -1.23, marketCap: '0.9T',
    pe: 100.5,
    dividend: 0.0,
    volume: '40.1M',
    avg_volume: '45.0M',
    high_52w: 1000.0,
    low_52w: 700.0,
    // data: [850, 860, 840, 880, 900, 890, 910], // Removed short data array
    longData: generateDateAwareData(chartEndDate.subtract(5, 'year'), chartEndDate, 500, 800, 0.03), // Generate 5 years of data points
    sentiment: 'negative',
    aiPrediction: {
      day7: { price: 905.0, change: -0.6 },
      month1: { price: 880.0, change: -3.3 },
      month6: { price: 800.0, change: -12.1 },
      confidence: 60
    },
    analysts: {
      buy: 15,
      hold: 12,
      sell: 8,
      targetPrice: 950.0,
      targetChange: 4.4
    },
    news: [
      { title: '테슬라, 사이버트럭 생산량 목표 하향 조정', date: '2024-06-30', source: 'Reuters', sentiment: 'negative' },
      { title: '테슬라, 새로운 배터리 기술 개발 소식', date: '2024-06-25', source: 'Electrek', sentiment: 'positive' }
    ],
    financials: {
      revenue: { value: '25.2B', growth: 3.0 },
      netIncome: { value: '2.5B', growth: -5.0 },
      ebitda: { value: '4.0B', growth: 0.0 },
      eps: { value: '0.75', growth: -7.0 }
    },
  },
  NVDA: {
    name: 'NVIDIA Corporation',
    price: 295.45, change: 4.52, marketCap: '3.0T',
    pe: 65.0,
    dividend: 0.04,
    volume: '50.5M',
    avg_volume: '55.0M',
    high_52w: 300.0,
    low_52w: 200.0,
    // data: [280, 285, 290, 295], // Removed short data array
    longData: generateDateAwareData(chartEndDate.subtract(5, 'year'), chartEndDate, 500, 220, 0.025), // Generate 5 years of data points
    sentiment: 'positive',
    aiPrediction: {
      day7: { price: 300.0, change: 1.5 },
      month1: { price: 320.0, change: 8.0 },
      month6: { price: 350.0, change: 18.5 },
      confidence: 90
    },
    analysts: {
      buy: 45,
      hold: 2,
      sell: 0,
      targetPrice: 330.0,
      targetChange: 11.7
    },
    news: [
      { title: '엔비디아, AI 칩 수요 폭발적 증가 전망', date: '2024-07-01', source: 'Bloomberg', sentiment: 'positive' },
      { title: '새로운 엔비디아 GPU 출시, 시장 기대감 고조', date: '2024-06-26', source: 'Tech Times', sentiment: 'positive' }
    ],
    financials: {
      revenue: { value: '26.0B', growth: 260.0 },
      netIncome: { value: '14.0B', growth: 400.0 },
      ebitda: { value: '15.0B', growth: 350.0 },
      eps: { value: '5.50', growth: 450.0 }
    },
  },
  JPM: { name: 'JPMorgan Chase & Co.', price: 182.36, change: 0.83, marketCap: '0.5T',
    pe: 12.0, dividend: 2.50, volume: '10.2M', avg_volume: '11.0M', high_52w: 185.0, low_52w: 140.0,
    // data: [170, 175, 172, 178, 180, 182], // Removed short data array
    longData: generateDateAwareData(chartEndDate.subtract(5, 'year'), chartEndDate, 500, 160, 0.008), // Generate 5 years of data points
    sentiment: 'neutral',
    aiPrediction: { day7: { price: 183.0, change: 0.3 }, month1: { price: 185.0, change: 1.4 }, month6: { price: 190.0, change: 4.2 }, confidence: 65 },
    analysts: { buy: 20, hold: 15, sell: 5, targetPrice: 190.0, targetChange: 4.2 },
    news: [{ title: 'JP모건, 금리 인상 전망에 주가 상승', date: '2024-06-29', source: 'Financial Times', sentiment: 'positive' }],
    financials: { revenue: { value: '42.0B', growth: 8.0 }, netIncome: { value: '13.5B', growth: 10.0 }, ebitda: { value: '18.0B', growth: 9.0 }, eps: { value: '4.50', growth: 11.0 } }
  },
  JNJ: { name: 'Johnson & Johnson', price: 156.81, change: -0.62, marketCap: '0.4T',
    pe: 22.0, dividend: 3.00, volume: '8.5M', avg_volume: '9.0M', high_52w: 160.0, low_52w: 130.0,
    // data: [158, 157, 156, 157, 156], // Removed short data array
    longData: generateDateAwareData(chartEndDate.subtract(5, 'year'), chartEndDate, 500, 140, 0.007), // Generate 5 years of data points
    sentiment: 'neutral',
    aiPrediction: { day7: { price: 156.0, change: -0.5 }, month1: { price: 155.0, change: -1.1 }, month6: { price: 158.0, change: 0.7 }, confidence: 60 },
    analysts: { buy: 18, hold: 14, sell: 6, targetPrice: 162.0, targetChange: 3.3 },
    news: [{ title: '존슨앤드존슨, 신약 개발 파이프라인 발표', date: '2024-06-28', source: 'Pharmaceutical News', sentiment: 'positive' }],
    financials: { revenue: { value: '21.4B', growth: 5.0 }, netIncome: { value: '6.0B', growth: 7.0 }, ebitda: { value: '9.0B', growth: 6.0 }, eps: { value: '2.20', growth: 8.0 } }
  },
  V: { name: 'Visa Inc.', price: 275.44, change: 1.24, marketCap: '0.5T',
    pe: 30.0, dividend: 0.80, volume: '7.0M', avg_volume: '7.5M', high_52w: 280.0, low_52w: 220.0,
    // data: [270, 272, 275], // Removed short data array
    longData: generateDateAwareData(chartEndDate.subtract(5, 'year'), chartEndDate, 500, 240, 0.01), // Generate 5 years of data points
    sentiment: 'positive',
    aiPrediction: { day7: { price: 278.0, change: 0.9 }, month1: { price: 285.0, change: 3.5 }, month6: { price: 300.0, change: 8.9 }, confidence: 70 },
    analysts: { buy: 25, hold: 10, sell: 2, targetPrice: 290.0, targetChange: 5.3 },
    news: [{ title: '비자, 디지털 결제 시장 성장 전망에 수혜', date: '2024-06-27', source: 'Fintech News', sentiment: 'positive' }],
    financials: { revenue: { value: '8.8B', growth: 12.0 }, netIncome: { value: '4.5B', growth: 15.0 }, ebitda: { value: '6.0B', growth: 14.0 }, eps: { value: '2.10', growth: 18.0 } }
  },
  BRK_B: { name: 'Berkshire Hathaway Inc. (Class B)', price: 362.10, change: 0.55, marketCap: '0.8T',
    pe: 20.0, dividend: 0.0, volume: '4.5M', avg_volume: '5.0M', high_52w: 365.0, low_52w: 320.0,
    // data: [358, 360, 362], // Removed short data array
    longData: generateDateAwareData(chartEndDate.subtract(5, 'year'), chartEndDate, 500, 330, 0.005), // Generate 5 years of data points
    sentiment: 'positive',
    aiPrediction: { day7: { price: 363.0, change: 0.2 }, month1: { price: 365.0, change: 0.8 }, month6: { price: 370.0, change: 2.2 }, confidence: 68 },
    analysts: { buy: 10, hold: 8, sell: 1, targetPrice: 375.0, targetChange: 3.6 },
    news: [{ title: '버크셔 해서웨이, 주요 기업 지분 확대 소식', date: '2024-06-30', source: 'Financial Times', sentiment: 'positive' }],
    financials: { revenue: { value: '88.0B', growth: 6.0 }, netIncome: { value: '12.0B', growth: 4.0 }, ebitda: { value: '15.0B', growth: 5.0 }, eps: { value: '8.00', growth: 7.0 } }
  },
  UNH: { name: 'UnitedHealth Group Incorporated', price: 490.67, change: 1.12, marketCap: '0.5T',
    pe: 25.0, dividend: 1.50, volume: '3.0M', avg_volume: '3.5M', high_52w: 495.0, low_52w: 400.0,
    // data: [480, 485, 490], // Removed short data array
    longData: generateDateAwareData(chartEndDate.subtract(5, 'year'), chartEndDate, 500, 420, 0.009), // Generate 5 years of data points
    sentiment: 'positive',
    aiPrediction: { day7: { price: 493.0, change: 0.5 }, month1: { price: 500.0, change: 1.9 }, month6: { price: 520.0, change: 6.0 }, confidence: 72 },
    analysts: { buy: 22, hold: 10, sell: 3, targetPrice: 510.0, targetChange: 3.9 },
    news: [{ title: '유나이티드헬스, 보험 가입자 증가 발표', date: '2024-06-28', source: 'Healthcare News', sentiment: 'positive' }],
    financials: { revenue: { value: '92.0B', growth: 10.0 }, netIncome: { value: '8.5B', growth: 12.0 }, ebitda: { value: '12.0B', growth: 11.0 }, eps: { value: '9.50', growth: 14.0 } }
  },
  LLY: { name: 'Eli Lilly and Company', price: 850.30, change: 2.80, marketCap: '0.7T',
    pe: 60.0, dividend: 1.00, volume: '2.5M', avg_volume: '3.0M', high_52w: 860.0, low_52w: 600.0,
    data: [830, 840, 850],
    longData: [600, 650, 700, 750, 800, 830, 840, 850, ...generateMoreVariedData(850, 200, 0.015)],
    sentiment: 'positive',
    aiPrediction: { day7: { price: 855.0, change: 0.6 }, month1: { price: 870.0, change: 2.3 }, month6: { price: 900.0, change: 5.8 }, confidence: 88 },
    analysts: { buy: 28, hold: 5, sell: 1, targetPrice: 880.0, targetChange: 3.5 },
    news: [{ title: '일라이 릴리, 비만 치료제 임상 결과 발표', date: '2024-06-29', source: 'BioPharma Dive', sentiment: 'positive' }],
    financials: { revenue: { value: '9.5B', growth: 25.0 }, netIncome: { value: '2.0B', growth: 30.0 }, ebitda: { value: '3.0B', growth: 28.0 }, eps: { value: '2.80', growth: 35.0 } }
  },
  TSM: { name: 'Taiwan Semiconductor Manufacturing Company Limited', price: 175.00, change: 3.10, marketCap: '0.9T',
    pe: 28.0, dividend: 1.80, volume: '20.0M', avg_volume: '22.0M', high_52w: 180.0, low_52w: 130.0,
    data: [160, 165, 170, 175],
    longData: [130, 140, 150, 160, 165, 170, 175, ...generateMoreVariedData(175, 200, 0.02)],
    sentiment: 'positive',
    aiPrediction: { day7: { price: 178.0, change: 1.7 }, month1: { price: 185.0, change: 5.7 }, month6: { price: 200.0, change: 14.3 }, confidence: 85 },
    analysts: { buy: 30, hold: 6, sell: 2, targetPrice: 190.0, targetChange: 8.6 },
    news: [{ title: 'TSMC, 차세대 반도체 생산 계획 발표', date: '2024-07-01', source: 'Digitimes', sentiment: 'positive' }],
    financials: { revenue: { value: '20.0B', growth: 15.0 }, netIncome: { value: '8.0B', growth: 18.0 }, ebitda: { value: '12.0B', growth: 17.0 }, eps: { value: '1.50', growth: 20.0 } }
  },
  XOM: { name: 'Exxon Mobil Corporation', price: 110.50, change: -0.75, marketCap: '0.4T',
    pe: 10.0, dividend: 4.00, volume: '15.0M', avg_volume: '16.0M', high_52w: 115.0, low_52w: 90.0,
    data: [112, 111, 110.5],
    longData: [90, 95, 100, 105, 110, 112, 111, 110.5, ...generateMoreVariedData(110.5, 200, 0.01)],
    sentiment: 'negative',
    aiPrediction: { day7: { price: 110.0, change: -0.5 }, month1: { price: 108.0, change: -2.3 }, month6: { price: 105.0, change: -5.0 }, confidence: 60 },
    analysts: { buy: 12, hold: 15, sell: 8, targetPrice: 115.0, targetChange: 4.1 },
    news: [{ title: '엑손모빌, 유가 하락에 따른 실적 우려', date: '2024-06-29', source: 'OilPrice.com', sentiment: 'negative' }],
    financials: { revenue: { value: '85.0B', growth: -5.0 }, netIncome: { value: '10.0B', growth: -8.0 }, ebitda: { value: '15.0B', growth: -6.0 }, eps: { value: '2.00', growth: -10.0 } }
  },
  MA: { name: 'Mastercard Incorporated', price: 430.15, change: 1.60, marketCap: '0.4T',
    pe: 35.0, dividend: 0.50, volume: '5.0M', avg_volume: '5.5M', high_52w: 435.0, low_52w: 380.0,
    data: [420, 425, 430],
    longData: [380, 390, 400, 410, 420, 425, 430, ...generateMoreVariedData(430, 200, 0.01)],
    sentiment: 'positive',
    aiPrediction: { day7: { price: 433.0, change: 0.7 }, month1: { price: 440.0, change: 2.3 }, month6: { price: 455.0, change: 5.8 }, confidence: 75 },
    analysts: { buy: 28, hold: 7, sell: 1, targetPrice: 445.0, targetChange: 3.4 },
    news: [{ title: '마스터카드, 글로벌 결제량 증가 발표', date: '2024-06-28', source: 'Payments Dive', sentiment: 'positive' }],
    financials: { revenue: { value: '6.5B', growth: 10.0 }, netIncome: { value: '3.0B', growth: 13.0 }, ebitda: { value: '4.0B', growth: 12.0 }, eps: { value: '3.00', growth: 15.0 } }
  },
  PG: { name: 'The Procter & Gamble Company', price: 155.20, change: 0.30, marketCap: '0.3T',
    pe: 23.0, dividend: 2.50, volume: '6.0M', avg_volume: '6.5M', high_52w: 158.0, low_52w: 140.0,
    data: [154, 155, 155.2],
    longData: [140, 145, 150, 154, 155, 155.2, ...generateMoreVariedData(155.2, 200, 0.006)],
    sentiment: 'neutral',
    aiPrediction: { day7: { price: 155.5, change: 0.2 }, month1: { price: 156.0, change: 0.5 }, month6: { price: 158.0, change: 1.8 }, confidence: 60 },
    analysts: { buy: 15, hold: 12, sell: 3, targetPrice: 160.0, targetChange: 3.1 },
    news: [{ title: 'P&G, 분기 실적 예상치 부합', date: '2024-06-27', source: 'Seeking Alpha', sentiment: 'neutral' }],
    financials: { revenue: { value: '20.5B', growth: 3.0 }, netIncome: { value: '5.0B', growth: 5.0 }, ebitda: { value: '7.0B', growth: 4.0 }, eps: { value: '1.80', growth: 6.0 } }
  },
  HD: { name: 'The Home Depot, Inc.', price: 345.90, change: -0.45, marketCap: '0.35T',
    pe: 20.0, dividend: 2.00, volume: '4.0M', avg_volume: '4.5M', high_52w: 350.0, low_52w: 300.0,
    data: [348, 347, 345.9],
    longData: [300, 310, 320, 330, 340, 348, 347, 345.9, ...generateMoreVariedData(345.9, 200, 0.012)],
    sentiment: 'negative',
    aiPrediction: { day7: { price: 345.0, change: -0.2 }, month1: { price: 342.0, change: -1.1 }, month6: { price: 335.0, change: -3.1 }, confidence: 60 },
    analysts: { buy: 18, hold: 10, sell: 4, targetPrice: 355.0, targetChange: 2.6 },
    news: [{ title: '홈디포, 주택 시장 둔화 우려에 주가 하락', date: '2024-06-30', source: 'HousingWire', sentiment: 'negative' }],
    financials: { revenue: { value: '42.0B', growth: -1.0 }, netIncome: { value: '4.5B', growth: -3.0 }, ebitda: { value: '6.0B', growth: -2.0 }, eps: { value: '4.00', growth: -4.0 } }
  },
  BAC: { name: 'Bank of America Corporation', price: 39.80, change: 0.50, marketCap: '0.3T',
    pe: 11.0, dividend: 2.20, volume: '25.0M', avg_volume: '28.0M', high_52w: 40.0, low_52w: 30.0,
    data: [38.5, 39.0, 39.8],
    longData: [30.0, 32.0, 34.0, 36.0, 38.0, 38.5, 39.0, 39.8, ...generateMoreVariedData(39.8, 200, 0.008)],
    sentiment: 'positive',
    aiPrediction: { day7: { price: 40.0, change: 0.5 }, month1: { price: 41.0, change: 3.0 }, month6: { price: 43.0, change: 8.0 }, confidence: 68 },
    analysts: { buy: 20, hold: 15, sell: 5, targetPrice: 42.0, targetChange: 5.5 },
    news: [{ title: '뱅크오브아메리카, 금리 인상 수혜 전망', date: '2024-06-29', source: 'Banking Dive', sentiment: 'positive' }],
    financials: { revenue: { value: '25.0B', growth: 7.0 }, netIncome: { value: '7.0B', growth: 9.0 }, ebitda: { value: '10.0B', growth: 8.0 }, eps: { value: '0.80', growth: 10.0 } }
  },
  KO: { name: 'The Coca-Cola Company', price: 62.10, change: 0.20, marketCap: '0.27T',
    pe: 24.0, dividend: 3.10, volume: '10.0M', avg_volume: '11.0M', high_52w: 63.0, low_52w: 58.0,
    data: [61.5, 61.8, 62.1],
    longData: [58.0, 59.0, 60.0, 61.0, 61.5, 61.8, 62.1, ...generateMoreVariedData(62.1, 200, 0.005)],
    sentiment: 'neutral',
    aiPrediction: { day7: { price: 62.3, change: 0.3 }, month1: { price: 62.8, change: 1.1 }, month6: { price: 63.5, change: 2.3 }, confidence: 65 },
    analysts: { buy: 15, hold: 10, sell: 2, targetPrice: 64.0, targetChange: 3.1 },
    news: [{ title: '코카콜라, 신제품 출시 및 마케팅 강화', date: '2024-06-27', source: 'Beverage Industry', sentiment: 'positive' }],
    financials: { revenue: { value: '11.5B', growth: 5.0 }, netIncome: { value: '3.0B', growth: 6.0 }, ebitda: { value: '4.5B', growth: 5.5 }, eps: { value: '0.70', growth: 7.0 } }
  },
  PEP: { name: 'PepsiCo, Inc.', price: 175.50, change: 0.35, marketCap: '0.24T',
    pe: 25.0, dividend: 2.80, volume: '8.0M', avg_volume: '8.5M', high_52w: 178.0, low_52w: 160.0,
    data: [174.0, 175.0, 175.5],
    longData: [160.0, 165.0, 170.0, 174.0, 175.0, 175.5, ...generateMoreVariedData(175.5, 200, 0.006)],
    sentiment: 'neutral',
    aiPrediction: { day7: { price: 176.0, change: 0.3 }, month1: { price: 177.0, change: 0.9 }, month6: { price: 179.0, change: 2.0 }, confidence: 68 },
    analysts: { buy: 18, hold: 10, sell: 2, targetPrice: 180.0, targetChange: 2.6 },
    news: [{ title: '펩시코, 스낵 사업 부문 성장세 발표', date: '2024-06-28', source: 'FoodBev Media', sentiment: 'positive' }],
    financials: { revenue: { value: '23.0B', growth: 6.0 }, netIncome: { value: '3.5B', growth: 7.0 }, ebitda: { value: '5.0B', growth: 6.5 }, eps: { value: '1.30', growth: 8.0 } }
  },
  COST: { name: 'Costco Wholesale Corporation', price: 780.20, change: 1.80, marketCap: '0.34T',
    pe: 45.0, dividend: 0.70, volume: '3.0M', avg_volume: '3.5M', high_52w: 785.0, low_52w: 650.0,
    data: [770, 775, 780.2],
    longData: [650, 680, 700, 720, 740, 760, 770, 775, 780.2, ...generateMoreVariedData(780.2, 200, 0.01)],
    sentiment: 'positive',
    aiPrediction: { day7: { price: 783.0, change: 0.4 }, month1: { price: 790.0, change: 1.2 }, month6: { price: 810.0, change: 3.8 }, confidence: 70 },
    analysts: { buy: 20, hold: 8, sell: 1, targetPrice: 800.0, targetChange: 2.5 },
    news: [{ title: '코스트코, 회원 수 증가 및 매출 성장 발표', date: '2024-06-29', source: 'Retail Dive', sentiment: 'positive' }],
    financials: { revenue: { value: '60.0B', growth: 8.0 }, netIncome: { value: '2.0B', growth: 10.0 }, ebitda: { value: '3.0B', growth: 9.0 }, eps: { value: '4.50', growth: 12.0 } }
  },
  CMCSA: { name: 'Comcast Corporation', price: 45.60, change: 0.40, marketCap: '0.18T',
    pe: 15.0, dividend: 2.30, volume: '12.0M', avg_volume: '13.0M', high_52w: 46.0, low_52w: 38.0,
    data: [44.5, 45.0, 45.6],
    longData: [38.0, 40.0, 42.0, 44.0, 44.5, 45.0, 45.6, ...generateMoreVariedData(45.6, 200, 0.012)],
    sentiment: 'neutral',
    aiPrediction: { day7: { price: 45.8, change: 0.4 }, month1: { price: 46.5, change: 2.0 }, month6: { price: 48.0, change: 5.3 }, confidence: 62 },
    analysts: { buy: 15, hold: 10, sell: 3, targetPrice: 47.0, targetChange: 3.1 },
    news: [{ title: '컴캐스트, 스트리밍 서비스 가입자 증가 추세', date: '2024-06-28', source: 'Variety', sentiment: 'positive' }],
    financials: { revenue: { value: '30.0B', growth: 4.0 }, netIncome: { value: '3.5B', growth: 5.0 }, ebitda: { value: '10.0B', growth: 4.5 }, eps: { value: '0.80', growth: 6.0 } }
  },
  T: { name: 'AT&T Inc.', price: 17.20, change: -0.10, marketCap: '0.12T',
    pe: 8.0, dividend: 6.00, volume: '30.0M', avg_volume: '35.0M', high_52w: 18.0, low_52w: 15.0,
    data: [17.5, 17.3, 17.2],
    longData: [15.0, 16.0, 17.0, 17.5, 17.3, 17.2, ...generateMoreVariedData(17.2, 200, 0.015)],
    sentiment: 'negative',
    aiPrediction: { day7: { price: 17.1, change: -0.6 }, month1: { price: 16.8, change: -2.3 }, month6: { price: 16.0, change: -7.0 }, confidence: 55 },
    analysts: { buy: 10, hold: 15, sell: 8, targetPrice: 17.5, targetChange: 1.7 },
    news: [{ title: 'AT&T, 통신 시장 경쟁 심화로 인한 매출 압박', date: '2024-06-30', source: 'Telecom Industry News', sentiment: 'negative' }],
    financials: { revenue: { value: '30.0B', growth: -2.0 }, netIncome: { value: '4.0B', growth: -5.0 }, ebitda: { value: '11.0B', growth: -3.0 }, eps: { value: '0.50', growth: -6.0 } }
  },
};

// 더 많은 주식 데이터를 추가할 수 있음

// 주가 데이터 기간 옵션
const timeRanges = [
  { label: '1주', value: '1w' },
  { label: '1개월', value: '1m' },
  { label: '3개월', value: '3m' },
  { label: '6개월', value: '6m' },
  { label: '1년', value: '1y' },
  { label: '5년', value: '5y' }
];

// 애널리스트 의견 컴포넌트
const AnalystOpinions = ({ analysts }: { analysts: any }) => {
  const totalAnalysts = analysts.buy + analysts.hold + analysts.sell;
  const buyPercentage = (analysts.buy / totalAnalysts) * 100;
  const holdPercentage = (analysts.hold / totalAnalysts) * 100;
  const sellPercentage = (analysts.sell / totalAnalysts) * 100;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-gray-500">애널리스트 의견 ({totalAnalysts}명)</div>
        <div className="text-sm font-medium">목표가: ${analysts.targetPrice?.toFixed(2) ?? 'N/A'} <span className="text-green-600">(+{analysts.targetChange?.toFixed(2) ?? 'N/A'}%)</span></div>
      </div>
      
      <div className="flex w-full h-8 rounded-full overflow-hidden">
        <div className="bg-green-500" style={{ width: `${buyPercentage}%` }}></div>
        <div className="bg-yellow-400" style={{ width: `${holdPercentage}%` }}></div>
        <div className="bg-red-500" style={{ width: `${sellPercentage}%` }}></div>
      </div>
      
      <div className="flex justify-between">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-sm">매수 ({analysts.buy})</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <span className="text-sm">보유 ({analysts.hold})</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-sm">매도 ({analysts.sell})</span>
        </div>
      </div>
    </div>
  );
};

// 관련 뉴스 컴포넌트
const NewsItem = ({ news }: { news: any }) => {
  const getBadgeColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="border-b border-gray-200 pb-3 mb-3 last:border-0 last:mb-0 last:pb-0">
      <div className="flex justify-between mb-1">
        <span className={`text-xs px-2 py-0.5 rounded-full ${getBadgeColor(news.sentiment)}`}>
          {news.sentiment === 'positive' ? '긍정적' : news.sentiment === 'negative' ? '부정적' : '중립적'}
        </span>
        <span className="text-xs text-gray-500">{news.date}</span>
      </div>
      <h4 className="font-medium mb-1">{news.title}</h4>
      <div className="text-xs text-gray-500">{news.source}</div>
    </div>
  );
};

export default function StockDetail() {
  const router = useRouter();
  const params = useParams();
  const [stock, setStock] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('1m');
  
  // 선택된 기간에 따라 데이터 반환 함수
  const getTimeRangeData = (stock: any, range: string) => {
    if (!stock || !stock.longData) return [];
    
    // Use the fixed end date for all ranges
    const endDate = dayjs('2025-05-30');
    let startDate;
    const dataPointsToInclude: dayjs.Dayjs[] = []; // Array to store the dates to include

    switch (range) {
      case '1w': {
        startDate = endDate.subtract(1, 'week');
        // Generate all dates within the 1-week range and filter out weekends
        let currentDate = dayjs(startDate);
        while (currentDate.isSameOrBefore(endDate, 'day')) {
            if (currentDate.day() !== 0 && currentDate.day() !== 6) { // Exclude Sunday (0) and Saturday (6)
                dataPointsToInclude.push(dayjs(currentDate));
            }
            currentDate = currentDate.add(1, 'day');
        }
        break;
      }
      case '1m':
        startDate = endDate.subtract(1, 'month');
         // For longer periods, we can use the existing data generation approach with a fixed number of points
        return generateDateAwareData(startDate, endDate, 30, stock.longData[0]?.price || stock.price); // Roughly 30 data points for a month
      case '3m':
        startDate = endDate.subtract(3, 'month');
        return generateDateAwareData(startDate, endDate, 90, stock.longData[0]?.price || stock.price); // Roughly 90 data points for 3 months
      case '6m':
        startDate = endDate.subtract(6, 'month');
        return generateDateAwareData(startDate, endDate, 180, stock.longData[0]?.price || stock.price); // Roughly 180 data points for 6 months
      case '1y':
        startDate = endDate.subtract(1, 'year');
        return generateDateAwareData(startDate, endDate, 250, stock.longData[0]?.price || stock.price); // Roughly 250 trading days
      case '5y':
        startDate = endDate.subtract(5, 'year');
        return generateDateAwareData(startDate, endDate, 500, stock.longData[0]?.price || stock.price); // Use the existing 500 points for 5 years
      default:
        // Default to 1 month if range is not matched
        startDate = endDate.subtract(1, 'month');
        return generateDateAwareData(startDate, endDate, 30, stock.longData[0]?.price || stock.price);
    }

    // For '1w' case: Filter the longData to include only the calculated dates
    if (range === '1w') {
        const weekData = stock.longData.filter((dataPoint: any) => {
            const dataDate = dayjs(dataPoint.date);
            // Check if the data point date is one of the dates we want to include
            return dataPointsToInclude.some(dateToInclude => dataDate.isSame(dateToInclude, 'day'));
        });
        // If we didn't find enough data points for the week, generate synthetic data for the exact dates
        if (weekData.length < dataPointsToInclude.length) {
             const basePriceForWeek = weekData.length > 0 ? weekData[0].price : stock.price;
             // Generate data points for the exact dates determined for the week
             const syntheticWeekData = dataPointsToInclude.map(date => {
                 // Find the closest existing data point to use as a base, or use the overall base price
                 const closestDataPoint = stock.longData.reduce((prev: any, curr: any) => {
                     const prevDiff = Math.abs(dayjs(prev.date).diff(date, 'day'));
                     const currDiff = Math.abs(dayjs(curr.date).diff(date, 'day'));
                     return (prevDiff < currDiff) ? prev : curr;
                 }, stock.longData[0] || { price: stock.price, date: dayjs(stock.longData[0]?.date).valueOf() }); // Provide a default if longData is empty
                 
                 // Simple price generation based on the closest data point, adding some noise
                 const price = closestDataPoint.price + (Math.random() - 0.5) * (closestDataPoint.price * 0.01); // Add 1% volatility
                 return {
                     date: date.valueOf(),
                     price: price,
                     // Synthesize basic OHLC for consistency, though not strictly needed for a line chart
                     open: price * 0.99,
                     high: price * 1.005,
                     low: price * 0.995,
                     close: price
                 };
             });
             return syntheticWeekData;
        }
        return weekData;
    }

    // Add a validation step to filter out invalid data points for all ranges
    const validatedData = stock.longData.filter((dataPoint: any) =>
      dataPoint && typeof dataPoint === 'object' &&
      typeof dataPoint.price === 'number' && isFinite(dataPoint.price)
    );

    return validatedData;
  };
  
  // 확장 데이터 생성 (더 긴 기간 시뮬레이션)
  const generateExtendedData = (lastDataPoint: { date: string, price: number }, additionalPoints: number) => {
    if (!lastDataPoint) return [];
    
    const result = [];
    const volatility = 0.02; // 2% 변동성
    let lastPrice = lastDataPoint.price;
    let currentDate = dayjs(lastDataPoint.date);
    
    for (let i = 0; i < additionalPoints; i++) {
      // 랜덤 변동성 적용
      const change = (Math.random() - 0.5) * volatility * lastPrice;
      lastPrice = lastPrice + change;
      // Ensure price is a finite number
      if (!isFinite(lastPrice)) {
         lastPrice = result.length > 0 ? result[result.length - 1].price : lastDataPoint.price; // Use previous generated price or last known price if not finite
      }
      // 음수 방지
      if (lastPrice < 0) lastPrice = lastDataPoint.price * 0.5; // Use the original last price as a base for preventing negative
      
      // Move to the next date, skipping weekends for simplicity in sample data
      let nextDate = currentDate.add(1, 'day');
      while (nextDate.day() === 0 || nextDate.day() === 6) { // 0 = Sunday, 6 = Saturday
        nextDate = nextDate.add(1, 'day');
      }
      currentDate = nextDate;
      
      result.push({ date: currentDate.format('YYYY-MM-DD'), price: lastPrice });
    }
    
    return result;
  };
  
  useEffect(() => {
    // 로그인 상태 확인
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    if (isLoggedIn !== 'true') {
      alert('로그인이 필요합니다.')
      router.push('/login')
      return
    }

    // URL에서 ticker 값을 가져옴
    const ticker = params.ticker as string;
    
    // 데이터 로딩 시뮬레이션
    setTimeout(() => {
      if (ticker && sp500StocksData[ticker]) {
        // Fetch the specific stock data, or use a placeholder if not fully available
        const basicStockData = sp500StocksData[ticker];
        setStock({
            ...basicStockData,
            // Ensure nested structures exist or are null
            aiPrediction: basicStockData.aiPrediction || null,
            analysts: basicStockData.analysts || null,
            news: basicStockData.news || [],
            financials: basicStockData.financials || null,
        });
      }
      setIsLoading(false);
    }, 500);
  }, [params, router]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">주식 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }
  
  if (!stock) {
    return (
      <div className="min-h-screen p-6">
        <Button variant="outline" onClick={() => router.push('/')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> 홈으로 돌아가기
        </Button>
        
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">종목을 찾을 수 없습니다</h2>
          <p className="text-gray-600">
            요청하신 주식 종목을 찾을 수 없습니다. 올바른 티커를 입력하셨는지 확인해주세요.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <Button variant="outline" onClick={() => router.push('/')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> 홈으로 돌아가기
      </Button>
      
      {/* 주식 기본 정보 헤더 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{params.ticker}</h1>
              <span className="text-gray-500">|</span>
              <p className="text-gray-600">{stock.name}</p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-3xl font-bold">${stock.price?.toFixed(2) ?? 'N/A'}</span>
              <span className={`flex items-center text-lg ${stock.change !== undefined && stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stock.change !== undefined && stock.change >= 0 ? (
                  <TrendingUp className="mr-1 h-5 w-5" />
                ) : stock.change !== undefined && stock.change < 0 ? (
                  <TrendingDown className="mr-1 h-5 w-5" />
                ) : null}
                {stock.change?.toFixed(2) ?? 'N/A'}%
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <p className="text-gray-500">시가총액</p>
              <p className="font-medium">${stock.marketCap ?? 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500">P/E</p>
              <p className="font-medium">{stock.pe?.toFixed(2) ?? 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500">배당률</p>
              <p className="font-medium">{stock.dividend?.toFixed(2) ?? 'N/A'}%</p>
            </div>
            <div>
              <p className="text-gray-500">거래량</p>
              <p className="font-medium">{stock.volume ?? 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500">52주 최고</p>
              <p className="font-medium">${stock.high_52w?.toFixed(2) ?? 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500">52주 최저</p>
              <p className="font-medium">${stock.low_52w?.toFixed(2) ?? 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* 메인 컨텐츠 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 차트 및 주요 정보 (좌측 및 중앙) */}
        <div className="lg:col-span-2 space-y-6">
          {/* 주가 차트 */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>주가 차트</CardTitle>
                <div className="flex space-x-1">
                  {timeRanges.map((range) => (
                    <Button 
                      key={range.value}
                      variant={timeRange === range.value ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setTimeRange(range.value)}
                      className="text-xs h-7 px-2"
                    >
                      {range.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                 {/* Stock Chart component */}
                <StockChart 
                  data={getTimeRangeData(stock, timeRange)} 
                  ticker={params.ticker as string} 
                />
              </div>
            </CardContent>
          </Card>
          
          {/* 재무 지표 */}
          <Card>
            <CardHeader>
              <CardTitle>최근 분기 재무 지표</CardTitle>
            </CardHeader>
            <CardContent>
              {stock.financials ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">매출</div>
                    <div className="font-bold text-lg">{stock.financials.revenue?.value ?? 'N/A'}</div>
                    <div className={`text-xs ${stock.financials.revenue?.growth !== undefined && stock.financials.revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stock.financials.revenue?.growth !== undefined ? `${stock.financials.revenue.growth >= 0 ? '+' : ''}${stock.financials.revenue.growth.toFixed(2)}% YoY` : 'N/A'}
                  </div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">순이익</div>
                    <div className="font-bold text-lg">{stock.financials.netIncome?.value ?? 'N/A'}</div>
                    <div className={`text-xs ${stock.financials.netIncome?.growth !== undefined && stock.financials.netIncome.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stock.financials.netIncome?.growth !== undefined ? `${stock.financials.netIncome.growth >= 0 ? '+' : ''}${stock.financials.netIncome.growth.toFixed(2)}% YoY` : 'N/A'}
                  </div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">EBITDA</div>
                    <div className="font-bold text-lg">{stock.financials.ebitda?.value ?? 'N/A'}</div>
                    <div className={`text-xs ${stock.financials.ebitda?.growth !== undefined && stock.financials.ebitda.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stock.financials.ebitda?.growth !== undefined ? `${stock.financials.ebitda.growth >= 0 ? '+' : ''}${stock.financials.ebitda.growth.toFixed(2)}% YoY` : 'N/A'}
                  </div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">EPS</div>
                    <div className="font-bold text-lg">${stock.financials.eps?.value ?? 'N/A'}</div>
                    <div className={`text-xs ${stock.financials.eps?.growth !== undefined && stock.financials.eps.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stock.financials.eps?.growth !== undefined ? `${stock.financials.eps.growth >= 0 ? '+' : ''}${stock.financials.eps.growth.toFixed(2)}% YoY` : 'N/A'}
                  </div>
                </div>
              </div>
              ) : (
                 <div className="py-6 text-center text-gray-500">재무 지표 정보를 불러올 수 없습니다.</div>
              )}
            </CardContent>
          </Card>
          
          {/* AI 예측 */}
          <Card className="border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-green-700" />
                AI 기반 주가 예측
              </CardTitle>
              <CardDescription>
                머신러닝 알고리즘을 통해 예측된 주가 움직임 (신뢰도: {stock.aiPrediction?.confidence ?? 'N/A'}%)
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-4">
              {stock.aiPrediction ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="text-sm text-gray-500 mb-1">7일 후 예상</div>
                    <div className="font-bold text-lg">
                      ${stock.aiPrediction.day7?.price?.toFixed(2) ?? 'N/A'}
                    </div>
                    <div
                      className={`text-xs ${
                        stock.aiPrediction.day7?.change !== undefined && stock.aiPrediction.day7.change >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {stock.aiPrediction.day7?.change !== undefined ? `${stock.aiPrediction.day7.change >= 0 ? "+" : ""}${stock.aiPrediction.day7.change.toFixed(2)}%` : 'N/A'}
                  </div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="text-sm text-gray-500 mb-1">1개월 후 예상</div>
                    <div className="font-bold text-lg">{stock.aiPrediction.month1?.price !== undefined ? `$${stock.aiPrediction.month1.price.toFixed(2)}` : 'N/A'}</div>
                    <div className={`text-xs ${stock.aiPrediction.month1?.change !== undefined ? (stock.aiPrediction.month1.change >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-500'}`}>
                      {stock.aiPrediction.month1?.change !== undefined ? `${stock.aiPrediction.month1.change >= 0 ? '+' : ''}${stock.aiPrediction.month1.change.toFixed(2)}%` : ''}
                  </div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="text-sm text-gray-500 mb-1">6개월 후 예상</div>
                    <div className="font-bold text-lg">{stock.aiPrediction.month6?.price !== undefined ? `$${stock.aiPrediction.month6.price.toFixed(2)}` : 'N/A'}</div>
                    <div className={`text-xs ${stock.aiPrediction.month6?.change !== undefined ? (stock.aiPrediction.month6.change >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-500'}`}>
                      {stock.aiPrediction.month6?.change !== undefined ? `${stock.aiPrediction.month6.change >= 0 ? '+' : ''}${stock.aiPrediction.month6.change.toFixed(2)}%` : ''}
                  </div>
                </div>
              </div>
              ) : (
                 <div className="py-6 text-center text-gray-500">AI 예측 정보를 불러올 수 없습니다.</div>
              )}
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">AI 분석 인사이트:</p>
                    <p>
                      {stock.sentiment === 'positive' 
                        ? `현재 ${stock.name}의 기술적 지표와 뉴스 감성이 긍정적입니다. 단기적으로 상승 추세가 이어질 것으로 예상됩니다.`
                        : stock.sentiment === 'negative'
                        ? `현재 ${stock.name}의 기술적 지표와 뉴스 감성이 부정적입니다. 단기적으로 하락 압력이 있을 수 있습니다.`
                        : `현재 ${stock.name}의 지표들이 혼합된 신호를 보내고 있습니다. 추가적인 확인이 필요합니다.`
                      }
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* 사이드바 정보 (우측) */}
        <div className="space-y-6">
          {/* 애널리스트 의견 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-700" />
                애널리스트 의견
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stock.analysts ? (
              <AnalystOpinions analysts={stock.analysts} />
              ) : (
                 <div className="py-6 text-center text-gray-500">애널리스트 의견 정보를 불러올 수 없습니다.</div>
              )}
            </CardContent>
          </Card>
          
          {/* 투자 포인트 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-gray-700" />
                투자 포인트
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <PlusSquare className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-700">강점</p>
                    <ul className="text-sm space-y-1 mt-1">
                      {(stock.investmentPoints?.strengths ?? [
                        '• 안정적인 수익성 및 현금 흐름',
                        '• 강력한 브랜드 및 시장 선도적 위치',
                        '• 지속적인 혁신 및 R&D 투자'
                      ]).map((point, idx) => <li key={idx}>{point}</li>)}
                    </ul>
                  </div>
                </div>
                <div className="flex gap-2">
                  <MinusSquare className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-red-700">위험 요소</p>
                    <ul className="text-sm space-y-1 mt-1">
                      {(stock.investmentPoints?.risks ?? [
                        '• 경쟁 심화로 인한 수익성 압박',
                        '• 규제 환경 변화 가능성',
                        '• 밸류에이션 부담'
                      ]).map((point, idx) => <li key={idx}>{point}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* 관련 뉴스 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-gray-700" />
                관련 뉴스
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stock.news && stock.news.length > 0 ? (
                 stock.news.map((news, index) => (
                <NewsItem key={index} news={news} />
                 ))
              ) : (
                 <div className="py-6 text-center text-gray-500">관련 뉴스를 불러올 수 없습니다.</div>
              )}
              
              <Button variant="outline" className="w-full mt-2">
                뉴스 더 보기
              </Button>
            </CardContent>
          </Card>
          
          {/* 주요 일정 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-700" />
                주요 일정
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 rounded-full">
                      <DollarSign className="h-4 w-4 text-blue-700" />
                    </div>
                    <span className="text-sm">다음 실적 발표</span>
                  </div>
                  <span className="text-sm font-medium">2025.08.15</span> {/* Updated date */}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-green-100 rounded-full">
                      <LineChart className="h-4 w-4 text-green-700" />
                    </div>
                    <span className="text-sm">배당금 지급일</span>
                  </div>
                  <span className="text-sm font-medium">2025.09.01</span> {/* Updated date */}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 