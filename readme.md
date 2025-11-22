# 🏡 HomeSage – Scalable Real Estate Rental Platform

**Tech:** Next.js + Node.js + AWS (Cognito, EC2, RDS, S3, API Gateway, Amplify)

HomeSage is a **full‑stack, enterprise‑grade Real Estate Rental Application** built with modern web technologies and cloud‑native infrastructure. It enables property owners, tenants, and admins to manage **listings, leases, applications, and user profiles** within a scalable architecture powered by AWS.

This project was inspired by Ed Roh's tutorial and adapted to the repo at `https://github.com/HeatBlastee/HomeSage-rental-app`.

---

## 🚀 Features

### 🖥️ Frontend (Next.js App Router)

* **Next.js** + **TypeScript**
* **Redux Toolkit** + **RTK Query** for state management and data fetching
* **Tailwind CSS** + **Shadcn UI** for styling and components
* **React Hook Form** + **Zod** for form handling & validation
* Map integration using **Leaflet** (via `react-leaflet`) — client side only
* Smooth UI interactions via CSS / Tailwind utilities (no Framer Motion)
* Pages & flows:

  * Landing & public listings
  * Property Details
  * Owner / Tenant Dashboards
  * Applications & Lease Management
  * Settings & Profile

### 🛠️ Backend (Node.js, Express)

* **Express.js** REST API
* **PostgreSQL + PostGIS** for geospatial queries and persistent data
* **Prisma** ORM for typed DB models and migrations
* Image uploads to **S3**
* Deployed using **EC2** behind **API Gateway** (recommended)
* Geocoding with **Nominatim** (or your preferred geocoding service)

### ☁️ AWS Infrastructure

* **Cognito** for authentication (Sign up / Sign in / JWT)
* **EC2** for backend server(s)
* **RDS** (Postgres) for database
* **S3** for file / image storage
* **API Gateway** for routing / edge
* **Amplify** (optional) for frontend hosting
* IAM / VPC / Security Groups for secure networking

---
### Dashboard

![Dashboard](public/dashboard.png)

## 🏗 Architecture (High level)

```
Next.js (Amplify) → API Gateway → EC2 → Express.js → RDS (Postgres + PostGIS)
                         └── S3 (image storage)
Cognito ⇄ Next.js & Backend (JWT validation)
```

Networking notes:

* Keep RDS in a private subnet
* Allow only required ports from EC2 / API Gateway via security groups

---

## 📁 Project structure (recommended)

```
HomeSage-rental-app/
├─ client/        # Next.js app (App Router)
├─ server/         # Express API, Prisma
└─ README.md
```

---

## ⚙️ Tech stack summary

**Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Shadcn UI, Redux Toolkit, RTK Query, React Hook Form, Zod, Leaflet (`react-leaflet`).

**Backend:** Node.js, Express, Prisma, PostgreSQL + PostGIS, S3 uploads, Cognito integration.

**AWS:** Cognito, EC2, RDS, S3, API Gateway, Amplify, IAM, VPC.

---

## 🔧 Local setup & development

> These instructions assume you have Node >=16, npm or yarn, and PostgreSQL installed (or you plan to use a remote RDS instance).

### 1. Clone

```bash
git clone https://github.com/HeatBlastee/HomeSage-rental-app.git
cd HomeSage-rental-app
```

### 2. Frontend

```bash
cd client
npm install
```

Create `.env.local` in `frontend/` with the values below (customize for your environment):

```
NEXT_PUBLIC_API_URL="https://your-api-gateway-or-backend-url"
NEXT_PUBLIC_COGNITO_USER_POOL_ID="your-cognito-pool-id"
NEXT_PUBLIC_COGNITO_CLIENT_ID="your-cognito-client-id"
NEXT_PUBLIC_LEAFLET_TILE_URL="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
```

**Important:** Leaflet and `react-leaflet` are client-only. In Next.js you should import them dynamically to avoid SSR errors. Example snippet:

```ts
// components/Map.tsx
import dynamic from 'next/dynamic';

const MapContainer = dynamic(() => import('./LeafletMap'), { ssr: false });
export default function MapWrapper(props: any) {
  return <MapContainer {...props} />;
}
```

Run frontend locally:

```bash
npm run dev
```

---

### 3. Backend

```bash
cd ../server
npm install
```

Create `.env` in `server/` (example):

```
DATABASE_URL="postgresql://username:password@host:5432/dbname"
S3_BUCKET="your-s3-bucket-name"
AWS_REGION="your-aws-region"
COGNITO_POOL_ID="your-cognito-pool-id"
COGNITO_CLIENT_ID="your-cognito-client-id"
```

Run Prisma migrations and generate client:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

Start dev server:

```bash
npm run dev
```

> Production: use PM2 or a process manager, and serve behind Nginx with proper TLS.

---

## ☁️ Deployment (overview)

### Backend (EC2)

1. Launch an **EC2** instance (Ubuntu) inside your VPC.
2. Configure Security Group to allow only necessary inbound ports (e.g., 80/443 via ALB, SSH for admins only).
3. Install Node, PM2, and Git on the instance.
4. Pull the backend, install deps and set production environment variables.
5. Use `pm2` to run the app and keep it alive.
6. Use Nginx or API Gateway in front of EC2 for routing & SSL.

### Database (RDS Postgres)

* Create an RDS Postgres instance and enable PostGIS extension.
* Place RDS in private subnets and restrict inbound to EC2 security group.
* Store DB credentials in a secrets manager or environment variables.

### Frontend (Amplify)

* Connect the GitHub repo to Amplify, set environment variables, and deploy.
* Alternatively use Vercel or Netlify.

### S3 (images)

* Create an S3 bucket, set reasonable CORS and bucket policies, and create an IAM role for upload access from the backend.

---

## ✅ Implemented / Planned features

* Authentication (AWS Cognito): sign up, sign in, password reset
* Property CRUD (owner flows)
* Applications & lease workflows (apply, approve, reject)
* Image upload & management via S3
* Search with filters & geospatial queries (PostGIS)
* Map display using Leaflet & `react-leaflet`
* Admin dashboard scaffolding

---

## 🔒 Security & best practices

* Validate Cognito JWT tokens in backend middleware
* Never commit `.env` or credentials to Git
* Use HTTPS for all public endpoints
* Limit public access to RDS (private subnet)
* Use IAM policies with least privilege for S3
* Configure AWS Budgets to avoid unexpected charges

---

## 🧩 Notes & Tips

* **Leaflet in Next.js**: Leaflet manipulates `window` and `document`. Use dynamic imports (`ssr: false`) for components relying on Leaflet or `react-leaflet`.
* **Geocoding**: Nominatim usage is rate‑limited — for production choose a commercial geocoding service (Mapbox, Here, Google) or host your own instance.
* **Image handling**: For large uploads consider a pre-signed S3 upload from the backend to let clients upload directly to S3.

---



*Made with ❤️ for HomeSage — enjoy building!*
