# MedCare Frontend Architecture

Frontend này được tổ chức theo hướng `Clean Architecture + feature-based` để dễ mở rộng cho các sprint tiếp theo của hệ thống đặt lịch khám và xem kết quả y tế.

## Stack

- React 19 + Vite
- TypeScript strict mode
- TailwindCSS v4
- shadcn/ui style primitives
- React Router DOM
- Zustand
- Axios
- TanStack Query
- React Hook Form + Zod

## Folder Structure

```txt
src/
  app/          # bootstrap app, router, providers, global styles
  core/         # config, HTTP client, utilities dùng xuyên app
  shared/       # reusable UI, layouts, feedback states
  features/
    auth/
    dashboard/
    appointments/
    medical-results/
    invoices/
```

Mỗi feature ưu tiên tách theo:

```txt
feature/
  api/          # raw HTTP call
  services/     # normalize dữ liệu, orchestration
  hooks/        # async/query/mutation logic
  components/   # UI component của feature
  pages/        # route-level page
  schemas/      # Zod validation
  types/        # domain type
```

## API Pattern

1. UI không gọi `axios` trực tiếp.
2. `api/*` chỉ lo giao tiếp endpoint.
3. `services/*` chuẩn hóa response và business-facing contract.
4. `hooks/*` bọc `useQuery` / `useMutation`.
5. `pages` và `components` chỉ consume hook hoặc props typed sẵn.

## Auth Flow

1. `auth-store` lưu `accessToken`, `refreshToken`, `user`.
2. `httpClient` tự attach bearer token qua interceptor.
3. `AuthBootstrapper` khôi phục session khi app mount.
4. `ProtectedRoute` chặn route private.
5. `GuestRoute` chặn người đã đăng nhập quay lại login/register.
6. Khi API trả `401`, store bị clear để tránh session lỗi.

## Responsive Strategy

- Mobile-first, padding và grid khởi đầu từ `375px`.
- Tablet dùng `md` cho bố cục 2 cột và card stack linh hoạt.
- Desktop dùng `xl` và `lg` cho sidebar, dashboard split view.
- Mobile navigation cố định đáy để phù hợp thao tác một tay.
- Tất cả CTA chính giữ chiều cao tối thiểu 44px.

## Coding Convention

- Chỉ dùng TypeScript typed đầy đủ.
- Không viết business logic trong page/component.
- Không hard-code data nghiệp vụ trong UI.
- Tất cả form phải đi qua `Zod + RHF`.
- Dùng `PageHeader`, `Card`, `EmptyState`, `Skeleton`, `StatusBadge` để tránh UI trùng lặp.
- Mọi async state phải có loading hoặc error state rõ ràng.

## Environment

Tạo biến môi trường cho frontend:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Suggested Next Backend Contracts

- `POST /auth/login`
- `POST /auth/register`
- `GET /auth/me`
- `GET /patients/dashboard-overview`
- `GET /appointments/upcoming`
- `GET /doctors`
- `GET /medical-results`
- `GET /invoices`
