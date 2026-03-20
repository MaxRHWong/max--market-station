import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'zh';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    markets: "Markets",
    trade: "Trade",
    derivatives: "Derivatives",
    news: "News",
    connectWallet: "Connect Wallet",
    globalMarkets: "Global Markets",
    cryptoAssets: "Crypto Assets",
    all: "All",
    defi: "DeFi",
    layer1: "Layer 1",
    systemStatus: "SYSTEM STATUS",
    optimal: "OPTIMAL",
    operational: "All systems operational",
    asset: "Asset",
    price: "Price (USD)",
    change24h: "24h Change",
    volume24h: "Volume (24h)",
    trend7d: "7d Trend",
    chartTitle: "1m OHLC Chart",
    latestNews: "Latest News",
    viewAll: "View All",
    open: "Open",
    high: "High",
    low: "Low",
    close: "Close"
  },
  zh: {
    markets: "市场",
    trade: "交易",
    derivatives: "衍生品",
    news: "新闻",
    connectWallet: "连接钱包",
    globalMarkets: "环球市场",
    cryptoAssets: "加密资产",
    all: "全部",
    defi: "DeFi",
    layer1: "Layer 1",
    systemStatus: "系统状态",
    optimal: "运行良好",
    operational: "所有系统运行正常",
    asset: "资产",
    price: "价格 (USD)",
    change24h: "24小时涨跌",
    volume24h: "24小时成交量",
    trend7d: "7天走势",
    chartTitle: "1分钟 K线图",
    latestNews: "最新资讯",
    viewAll: "查看全部",
    open: "开盘",
    high: "最高",
    low: "最低",
    close: "收盘"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('zh');

  const t = (key: string) => {
    return translations[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
