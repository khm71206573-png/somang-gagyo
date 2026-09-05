"use client";

import { useState } from "react";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

// 오프라인에서도 열람 가능해야 하는 화면의 쿼리 키만 골라서 영속화한다.
// (대시보드 = 오늘의 묵상/통독 분량 요약, devotion = 묵상 상세, bible-progress = 통독 분량 상세)
const OFFLINE_QUERY_KEYS = ["dashboard", "devotion", "bible-progress"];

// 영속 캐시에 담기는 데이터 모양이 바뀌면 이 값을 올린다.
// 값이 달라지면 예전 캐시는 복원되지 않고 버려지므로, 배포 직후 옛 모양의
// 캐시가 새 화면으로 흘러드는 것을 막을 수 있다.
// v2 : 통독 전체 진행표(oldTestament/newTestament) 추가
// v3 : 홈 화면 기도제목 요약(prayerSummary) 추가, 기도제목 목록 제거
// v4 : 통독 응원 현황(cheerCount/hasCheeredToday) 추가
// v5 : 묵상 나눔에 devotionId/isMine 추가
// v6 : 홈 기도제목 요약이 최근 내용 목록(contents)을 담도록 변경
// v7 : 통독 일시중지 상태(isPaused) 추가
// v8 : 통독 플랜 다중 진행 (홈 bibleReadings 배열, 통독탭 planTabs)
// v9 : 홈 공지 배너 목록(announcements) 추가
// v10 : 찬양콘티 기준일을 "다가오는 주일"로 변경 (sundayLabel·isUpcoming)
const CACHE_BUSTER = "v10";

const noopStorage: Storage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  key: () => null,
  length: 0,
};

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            retry: 1,
          },
        },
      }),
  );

  const [persister] = useState(() =>
    createSyncStoragePersister({
      storage: typeof window !== "undefined" ? window.localStorage : noopStorage,
      key: "hopebridge-offline-cache",
    }),
  );

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        buster: CACHE_BUSTER,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) =>
            query.state.status === "success" &&
            OFFLINE_QUERY_KEYS.includes(String(query.queryKey[0])),
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
