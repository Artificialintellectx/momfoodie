# MomFoodie - Meal Suggestion App

A beautiful, responsive web application that helps you decide what to cook for breakfast, lunch, or dinner based on your dietary preferences. Features authentic Nigerian dishes alongside international options.

![MomFoodie Screenshot](https://via.placeholder.com/800x400/ea580c/ffffff?text=MomFoodie+Meal+Suggestions)

## 🌟 Features

- **Meal Type Selection**: Choose from breakfast, lunch, or dinner
- **Dietary Preferences**: Filter by dietary needs (vegetarian, vegan, gluten-free, low-carb, high-protein)
- **Nigerian Cuisine Focus**: Authentic Nigerian dishes with detailed ingredients
- **Fallback System**: Works even without database connection
- **Mobile Responsive**: Beautiful design that works on all devices
- **Share Functionality**: Share recipes with friends and family
- **Progressive Web App**: Can be installed on mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (optional but recommended)

### Installation

1. **Clone or download the project**
   ```bash
   cd /Users/ugome/Desktop/momfoodie
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local .env.local.example
   ```
   
   Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

4. **Set up the database (optional)**
   
   If using Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to the SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `database-setup.sql`
   - Run the SQL commands to create tables and sample data

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:3000` to see the app!

## 🗄️ Database Setup

### Using Supabase (Recommended)

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Fill in your project details

2. **Run Database Setup**
   - Go to your Supabase dashboard
   - Navigate to "SQL Editor"
   - Copy the contents of `database-setup.sql`
   - Paste and execute the SQL

3. **Get Your Credentials**
   - Go to Settings → API
   - Copy your project URL and anon public key
   - Add them to your `.env.local` file

### Database Schema

The app uses a single table `meal_suggestions` with:
- `id` (Primary Key)
- `name` (Recipe name)
- `description` (Recipe description)
- `meal_type` (breakfast/lunch/dinner)
- `dietary_preference` (any/vegetarian/vegan/gluten-free/low-carb/high-protein)
- `prep_time` (Preparation time)
- `ingredients` (Array of ingredients)
- `created_at` (Timestamp)

## 🍽️ Sample Meals Included

### Breakfast
- Akara and Bread
- Moi Moi
- Yam and Egg Sauce
- Plantain Pancakes
- And more...

### Lunch
- Jollof Rice
- Egusi Soup with Pounded Yam
- Fried Rice Nigerian Style
- Amala and Ewedu
- And more...

### Dinner
- Pepper Soup
- Rice and Stew
- Plantain and Beans Porridge
- Catfish Pepper Soup
- And more...

## 🛠️ Built With

- **Next.js 14** - React framework
- **React 18** - UI library
- **Tailwind CSS 3** - Styling
- **Supabase** - Backend and database
- **Lucide React** - Icons
- **TypeScript** - Type safety

## 📱 Progressive Web App

MomFoodie can be installed as a PWA on mobile devices:

1. Open the app in your mobile browser
2. Look for the "Add to Home Screen" option
3. Install the app for offline access

## 🎨 Customization

### Adding New Meals

1. **Via Database**: Add new entries to the `meal_suggestions` table
2. **Via Code**: Update the `fallbackSuggestions` object in `pages/index.js`

### Styling

The app uses Tailwind CSS. Key color scheme:
- Primary: Orange (#ea580c)
- Secondary: Red (#dc2626)
- Accent: Pink/Purple gradients

### Dietary Preferences

Currently supports:
- Any (no restrictions)
- Vegetarian
- Vegan
- Gluten-free
- Low-carb
- High-protein

Add new preferences by updating the `dietaryPreferences` array.

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Deploy to Netlify

1. Build the project: `npm run build`
2. Upload the `out` folder to Netlify
3. Configure environment variables

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📧 Support

If you need help setting up the app:

1. Check the troubleshooting section below
2. Open an issue on GitHub
3. Contact us at support@momfoodie.com

## 🐛 Troubleshooting

### App doesn't load suggestions
- Check if Supabase credentials are correct
- Verify database table exists
- App will use fallback suggestions if database fails

### Styling issues
- Clear browser cache
- Ensure Tailwind CSS is loading properly
- Check for CSS conflicts

### Build errors
- Ensure Node.js 18+ is installed
- Delete `node_modules` and run `npm install`
- Check for TypeScript errors

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Nigerian cuisine inspirations
- Supabase for the amazing backend
- Next.js team for the excellent framework
- All the food lovers who inspired this project

---

Made with ❤️ for delicious meals and happy families!
