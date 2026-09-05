# Ukil (উকিল) - Civic Legal & Financial Q&A Platform

A modern, civic legal and financial advice platform for Bangladesh. Citizens can submit issues anonymously without signing up and track their inquiries using secure tracking codes. Verified Bar Council advocates and chartered accountants provide statutory citations and remedial advice.

## Tech Stack
- **Framework**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Backend & Database**: Supabase (PostgreSQL, Auth, Storage)
- **Icons**: Lucide React

## Features
- **Zero-Signup Citizen Q&A**: Post legal and corruption grievances anonymously with instant tracking codes.
- **Verified Expert Advice**: Authenticated Bar advocates and chartered accountants publish statutory solutions.
- **Dynamic Lawyer Portal**: Dedicated lawyer dashboard with custom photo uploads via Supabase Storage, real-time profile editing, consultation requests, and published advice management.
- **Professional Directory**: Searchable directory of verified advocates and financial practitioners.
- **1-on-1 Consultations**: Direct chamber consultation booking with verified advocates.

## Setup & Local Development
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment on Vercel

When deploying to [Vercel](https://vercel.com), do not commit `.env.local` to Git. Instead, set the following Environment Variables in your Vercel Project Settings (**Settings > Environment Variables**):

| Variable Name | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project API URL | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Project public anon key | `eyJhbGciOiJIUz...` |

Both variables must be enabled for **Production**, **Preview**, and **Development** environments in Vercel.

