import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { trpc } from '@/providers/trpc';
import { ShoppingCart } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function FoodGallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const { data: listings } = trpc.food.listActive.useQuery();

  useEffect(() => {
    if (!sectionRef.current) return;

    const headerEls = sectionRef.current.querySelectorAll('.gallery-header-anim');
    gsap.fromTo(
      headerEls,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', toggleActions: 'play none none none' },
      }
    );

    const cards = sectionRef.current.querySelectorAll('.food-card');
    gsap.fromTo(
      cards,
      { opacity: 0, y: 80 },
      {
        opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: cards[0] || sectionRef.current, start: 'top 85%', toggleActions: 'play none none none' },
      }
    );
  }, [listings]);

  // Fallback data if API hasn't loaded yet
  const fallbackListings = [
    { id: 1, restaurantName: "Bella's Kitchen", foodName: "Shepherd's Pie", description: "Classic British comfort food with golden mashed potato topping", quantity: 5, discountedPrice: "3.00", currency: "USDC", imageUrl: "/images/food-1.jpg", category: "British" },
    { id: 2, restaurantName: "Sakura Bento", foodName: "Salmon Roll Set", description: "Fresh salmon nigiri and maki rolls with premium wasabi", quantity: 3, discountedPrice: "5.50", currency: "USDC", imageUrl: "/images/food-2.jpg", category: "Japanese" },
    { id: 3, restaurantName: "Nonna's", foodName: "Truffle Pasta", description: "Handmade fettuccine with shaved black truffle and parmesan", quantity: 4, discountedPrice: "4.00", currency: "USDC", imageUrl: "/images/food-3.jpg", category: "Italian" },
    { id: 4, restaurantName: "Green Bowl", foodName: "Mediterranean Salad", description: "Mixed greens with feta, olives, cherry tomatoes, and hummus", quantity: 8, discountedPrice: "2.50", currency: "USDC", imageUrl: "/images/food-4.jpg", category: "Healthy" },
    { id: 5, restaurantName: "Deli Express", foodName: "Club Sandwich", description: "Triple-decker with turkey, bacon, lettuce, tomato, and avocado", quantity: 6, discountedPrice: "3.50", currency: "USDC", imageUrl: "/images/food-5.jpg", category: "American" },
    { id: 6, restaurantName: "Sweet End", foodName: "Tiramisu Slice", description: "Classic Italian dessert with espresso-soaked ladyfingers", quantity: 4, discountedPrice: "2.00", currency: "USDC", imageUrl: "/images/food-6.jpg", category: "Dessert" },
  ];

  const displayListings = listings && listings.length > 0 ? listings : fallbackListings;

  return (
    <section
      id="marketplace"
      ref={sectionRef}
      className="w-full bg-[#03045E]"
      style={{ padding: '140px 24px' }}
    >
      <div className="mx-auto" style={{ maxWidth: 1280 }}>
        <p className="gallery-header-anim font-mono-label text-[#4CC9F0] mb-4">SURPLUS MARKETPLACE</p>
        <h2 className="gallery-header-anim font-display text-white mb-16" style={{ fontSize: 'clamp(48px, 6vw, 80px)' }}>
          Available Now
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayListings.map((item) => (
            <div
              key={item.id}
              className="food-card group relative overflow-hidden rounded-2xl transition-all duration-400"
              style={{
                background: '#0A0A1A',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              {/* Image */}
              <div className="relative overflow-hidden" style={{ height: 220 }}>
                <img
                  src={item.imageUrl || '/images/food-1.jpg'}
                  alt={item.foodName}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A1A] to-transparent opacity-60" />
              </div>

              {/* Info */}
              <div className="p-6">
                <p className="font-mono-label text-[#FF6B35] mb-2">{item.restaurantName}</p>
                <h3 className="font-display text-white text-xl mb-1">{item.foodName}</h3>
                <p className="text-[#A0A0B0] text-sm mb-4 line-clamp-2">{item.description || ''}</p>

                <div className="flex items-center justify-between">
                  <span className="font-display text-[#4CC9F0]" style={{ fontSize: 28 }}>
                    {item.discountedPrice} {item.currency}
                  </span>
                  <span
                    className="font-mono-label px-3 py-1 rounded-full"
                    style={{
                      background: 'rgba(46, 204, 113, 0.15)',
                      color: '#2ECC71',
                      fontSize: 11,
                    }}
                  >
                    {item.quantity} left
                  </span>
                </div>

                <button className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl font-display text-sm transition-all duration-300"
                  style={{
                    background: 'rgba(255, 107, 53, 0.1)',
                    border: '1px solid rgba(255, 107, 53, 0.3)',
                    color: '#FF6B35',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#FF6B35';
                    e.currentTarget.style.color = '#03045E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 107, 53, 0.1)';
                    e.currentTarget.style.color = '#FF6B35';
                  }}
                >
                  <ShoppingCart size={16} />
                  Buy Now
                </button>
              </div>

              {/* Hover border effect */}
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none transition-all duration-400 opacity-0 group-hover:opacity-100"
                style={{
                  border: '1px solid rgba(255, 107, 53, 0.5)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
