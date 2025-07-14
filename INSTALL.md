# Quick Installation Guide

## Step 1: Install Dependencies
```bash
cd momfoodie
npm install
```

## Step 2: Set Up Environment Variables
1. Copy `.env.local` to `.env.local.example` if you want to keep a template
2. Edit `.env.local` and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Step 3: Set Up Database (Optional)
1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Go to SQL Editor in your dashboard
4. Copy and paste the contents of `database-setup.sql`
5. Run the SQL to create tables and sample data

## Step 4: Run the App
```bash
npm run dev
```

Open http://localhost:3000 in your browser!

## Step 5: Build for Production
```bash
npm run build
npm start
```

## Troubleshooting
- If the app doesn't load suggestions, it will use fallback data
- Make sure Node.js 18+ is installed
- Check console for any errors

That's it! Your wife now has a beautiful meal suggestion app! 🍽️
