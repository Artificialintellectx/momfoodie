import { Heart, ChefHat } from 'lucide-react'

export default function Footer() {
  return (
    <div className="text-center mt-12">
      <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/60 backdrop-blur-sm rounded-full border border-white/30">
        <Heart className="w-5 h-5 text-red-500 animate-pulse" />
        <p className="text-gray-600 font-medium">Made with love for delicious meals</p>
        <ChefHat className="w-5 h-5 text-orange-500" />
      </div>
    </div>
  )
}
