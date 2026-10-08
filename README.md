# 2컷 포토부스

2컷 사진을 찍고 메시지를 담아 포토카드로 저장하거나 링크로 공유하는 웹 포토부스입니다.

- 배포: https://photobooth-yr.vercel.app
- 스택: Next.js (App Router), React, Vercel Blob

## 흐름

1. **Intro** — 받는 사람 / 메시지 / 보내는 사람 입력
2. **Capture** — 카운트다운 후 2컷 촬영
3. **Printing** — 출력 연출
4. **PhotoCard** — 포토카드 저장, 공유 링크 생성

## 공유 링크

사진을 압축해 Vercel Blob(private)에 JSON으로 저장하고 `/share/[id]` 링크로 공유합니다.
예전 방식의 `/share#<압축 데이터>` 링크도 계속 열립니다.

## 로컬 실행

```bash
npm install
vercel env pull .env.local   # BLOB_READ_WRITE_TOKEN
npm run dev
```

| 환경변수 | 설명 |
|---|---|
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob 스토어 토큰 (스토어 연결 시 자동 생성) |
| `BLOB_ACCESS` | 선택. public 스토어를 쓸 때만 `public` |

## 구조

```
app/
  page.tsx                 화면 단계(intro → shooting → printing → reveal) 전환
  components/              화면 및 UI 컴포넌트
  api/share/route.ts       공유 데이터 업로드 → ID 발급
  share/[id]/page.tsx      공유 카드 보기
  share/page.tsx           예전 해시 링크 호환
  lib/share.ts             공유 데이터 타입·검증
  lib/browser.ts           사진 압축, 다운로드, 공유 시트 등 브라우저 유틸
```
