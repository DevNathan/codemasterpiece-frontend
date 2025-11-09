# ---------- BUILD ----------
FROM node:25-alpine AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

# pnpm 전역 설치 (corepack 쓰지 않음)
RUN npm i -g pnpm@9.12.2

# deps 캐시
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 소스 복사
COPY . .

# 퍼블릭 ENV만 굽는다
# (NEXT_PUBLIC_* 만 들어있는 .env.build 를 레포에 둔다)
COPY .env.build .env.production

# Next 빌드 (standalone)
RUN pnpm build

# ---------- RUNTIME ----------
FROM node:25-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# standalone에 필요한 것만
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/standalone ./

# 엔트리포인트: 런타임 ENV(서버 전용) 주입 후 실행
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/app/entrypoint.sh"]
