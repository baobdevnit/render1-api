# render1-api

Demo nestjs app deploy to Render
---

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

---

## 🚀 Tài Liệu Bàn Giao Cho Front-End Developer

Tài liệu kỹ thuật chi tiết, hợp đồng dữ liệu TypeScript, cấu hình CORS, kịch bản xác thực và kiến trúc mẫu dành cho đội ngũ phát triển Front-End được lưu trữ tại:
👉 **[Xem Tài Liệu Bàn Giao Front-End (docs/FRONTEND_HANDOVER.md)](file:///d:/Code/render1/my-first-api/docs/FRONTEND_HANDOVER.md)**

- **Scalar API Reference (Interactive UI):** `http://localhost:3000/scalar`
- **OpenAPI Schema:** `http://localhost:3000/openapi.json`
- **Tài khoản Admin kiểm thử:** `admin@example.com` / `Admin@123456`

---

## Project setup

```bash
npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
npm install -g @nestjs/mau
mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Observability

In production applications, observability is essential for understanding how your system behaves, detecting issues early, and maintaining reliable performance.

[NestJS Observe](https://observe.nestjs.com) automatically instruments your NestJS application, giving you deep visibility into your system with minimal setup:

- **Distributed tracing:** Follow requests across services and understand how they flow through your system.
- **Waterfall analysis:** Visualize request execution and identify slow operations, bottlenecks, and unexpected delays.
- **Performance analysis:** Analyze application performance in real time and quickly pinpoint areas that need optimization.
- **Metrics:** Track key application and infrastructure metrics to understand system health and performance trends.
- **Logging:** Centralize and correlate logs with traces and other telemetry to make debugging easier.
- **Error tracking:** Detect errors quickly and investigate their root causes with the surrounding context.
- **SLA monitoring:** Track service-level objectives and identify when your application is approaching or exceeding defined thresholds.
- **Alarms and alerts:** Set up alerts for critical errors, performance degradation, SLA violations, and other anomalies so your team can react quickly.

This project is already instrumented. Create a free account at [observe.nestjs.com](https://observe.nestjs.com), add an application, and paste the generated app key and secret into the `ObserveModule.forRoot()` call in `src/app.module.ts`.

The free plan needs no payment details and covers 300,000 events a month. You can also browse the [live demo](https://www.observe-demo.nestjs.com/dashboard) first - the whole dashboard over a busy service's data, with nothing to install.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Auto-instrument your application with [NestJS Observe](https://observe.nestjs.com). Distributed tracing, metrics, and logging made easy. Error tracking and performance monitoring for your NestJS applications.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Phân quyền Admin & Quản lý người dùng

### 1. Khởi tạo tài khoản Admin (Seed)

Bạn có thể khởi tạo tài khoản có cờ Admin bằng một trong hai cách:

- **Cách 1 (CLI Seed script):**
  Chạy lệnh seed trong terminal:

  ```bash
  npm run seed
  ```

  *(Tài khoản mặc định: `admin@example.com` / `Admin@123456`, có thể tùy biến qua biến môi trường `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` trong `.env`)*

- **Cách 2 (Supabase SQL Editor):**
  Mở **Supabase Dashboard -> SQL Editor** và chạy nội dung trong file [supabase-seed.sql](file:///d:/Code/render1/my-first-api/supabase-seed.sql) hoặc [supabase-schema.sql](file:///d:/Code/render1/my-first-api/supabase-schema.sql).

### 2. Xem danh sách người dùng đã đăng ký (Chỉ Admin)

Endpoint được bảo vệ bởi [`AuthGuard`](file:///d:/Code/render1/my-first-api/src/auth/guards/auth.guard.ts) và [`RolesGuard`](file:///d:/Code/render1/my-first-api/src/auth/guards/roles.guard.ts):

- **Route:** `GET /users` (hoặc alias `GET /admin/users`)
- **Headers:** `Authorization: Bearer <ADMIN_JWT_TOKEN>`
- **Response:**
  - `200 OK`: Trả về mảng danh sách người dùng đã đăng ký (đã loại bỏ mật khẩu hash).
  - `401 Unauthorized`: Chưa truyền token hoặc token không hợp lệ.
  - `403 Forbidden`: Người dùng thường (`role: 'user'`) không được phép truy cập.

---

## Health Check API (Chuẩn IETF Draft)

Dự án cung cấp endpoint kiểm tra định kỳ (Health Check) tuân thủ tiêu chuẩn RFC Draft: **"Health Check Response Format for HTTP APIs"** (`draft-inadarei-api-health-check`):

- **Endpoints:**
  - `GET /health` (và alias `GET /healthz`): Kiểm tra sức khỏe toàn diện (Uptime, Memory, kết nối cơ sở dữ liệu Supabase).
  - `GET /health/live`: Liveness Probe cho orchestrator (kiểm tra tiến trình Node.js cục bộ).
  - `GET /health/ready`: Readiness Probe (kiểm tra khả năng sẵn sàng của Supabase DB).
- **MIME Type:** `Content-Type: application/health+json; charset=utf-8`
- **Cache Header:** `Cache-Control: no-cache, no-store, must-revalidate`
- **HTTP Status Code Mapping:**
  - `200 OK`: Khi `status` là `"pass"` hoặc `"warn"`.
  - `503 Service Unavailable`: Khi `status` là `"fail"`.
- **Cấu trúc JSON mẫu:**

```json
{
  "status": "pass",
  "version": "1",
  "releaseId": "0.0.1",
  "notes": ["Tất cả hệ thống và dịch vụ phụ thuộc đều hoạt động bình thường."],
  "serviceId": "my-first-api",
  "description": "Health status for my-first-api conforming to IETF Draft specification",
  "checks": {
    "system:uptime": [
      {
        "componentId": "node-process",
        "componentType": "system",
        "status": "pass",
        "observedValue": 3600,
        "observedUnit": "s",
        "time": "2026-11-05T05:44:00.000Z",
        "output": "Tiến trình hoạt động ổn định trong 3600 giây"
      }
    ],
    "system:memory": [
      {
        "componentId": "node-heap",
        "componentType": "system",
        "status": "pass",
        "observedValue": 45.32,
        "observedUnit": "MB",
        "time": "2026-11-05T05:44:00.000Z",
        "output": "Bộ nhớ sử dụng bình thường: 45.32MB / 60.5MB"
      }
    ],
    "datastore:supabase": [
      {
        "componentId": "supabase-database",
        "componentType": "datastore",
        "status": "pass",
        "observedValue": 25,
        "observedUnit": "ms",
        "time": "2026-11-05T05:44:00.000Z",
        "output": "Kết nối Supabase phản hồi trong 25ms"
      }
    ]
  },
  "links": {
    "self": "/health",
    "docs": "/scalar"
  }
}
```

- **Tích hợp Render:** File [render.yaml](file:///d:/Code/render1/my-first-api/render.yaml) đã được cấu hình thuộc tính `healthCheckPath: /health` để Render tự động ping định kỳ, hỗ trợ zero-downtime deploy và tự phục hồi khi có sự cố.

---

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
