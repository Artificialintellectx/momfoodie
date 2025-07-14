import { ChefHat, Heart } from 'lucide-react'

export default function Header() {
  return (
    <div className="text-center mb-12">
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="relative">
          <ChefHat className="w-12 h-12 text-orange-600" />
          <Heart className="w-4 h-4 text-red-500 absolute -top-1 -right-1 animate-pulse" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          MomFoodie
        </h1>
      </div>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
        Never wonder what to cook again! Get personalized meal suggestions for breakfast, lunch, or dinner based on your dietary preferences.
      </p>
    </div>
  )
}
