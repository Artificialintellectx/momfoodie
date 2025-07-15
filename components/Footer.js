import { Heart, ChefHat } from 'lucide-react'

export default function Footer() {
  return (
    <div className="text-center mt-16">
      <div className="inline-flex items-center gap-3 px-8 py-4 bg-white/70 backdrop-blur-2xl rounded-full border border-white/40 shadow-md">
        <Heart className="w-6 h-6 text-red-500 animate-pulse" />
        <p className="text-gray-700 font-semibold text-lg">Made with love for delicious meals</p>
        <ChefHat className="w-6 h-6 text-orange-500" />
      </div>
    </div>
  )
}
