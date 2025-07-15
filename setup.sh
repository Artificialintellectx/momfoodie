#!/bin/bash

# Mummyfoodie Setup Script
echo "🍽️  Setting up Mummyfoodie..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local file not found"
    echo "📝 Please create .env.local with your Supabase credentials:"
    echo ""
    echo "NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here"
    echo ""
else
    echo "✅ Environment file found"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Set up your Supabase database using database-setup.sql"
echo "2. Add your Supabase credentials to .env.local"
echo "3. Run 'npm run dev' to start the development server"
echo ""
echo "Visit http://localhost:3000 to see your app!"
echo ""
echo "Happy cooking! 👨‍🍳👩‍🍳"
