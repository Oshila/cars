'use client'

import { useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/autoplay'
import { Autoplay } from 'swiper/modules'

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const sliderImages = Array.from({ length: 14 }, (_, i) => `/profits/sample${i + 1}.jpg`)

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <header className="p-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src="/alchemy-logo.jpg" alt="Alchemy Logo" className="w-10 h-10 rounded-full object-cover" />
            <h1 className="text-2xl font-bold tracking-wide">Alchemy Traders Network</h1>
          </div>

          <nav className="hidden md:flex space-x-6">
            <a href="#features" className="hover:underline">Features</a>
            <a href="#pricing" className="hover:underline">Pricing</a>
            <a href="#profits" className="hover:underline">Setups</a>
            <a href="/login" className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200 transition">Login</a>
          </nav>

          <button
            className="md:hidden text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden mt-4 px-4 space-y-3">
            <a href="#features" className="block hover:underline">Features</a>
            <a href="#pricing" className="block hover:underline">Pricing</a>
            <a href="#profits" className="block hover:underline">Setups</a>
            <a href="/login" className="block bg-white text-black px-4 py-2 rounded w-max hover:bg-gray-200 transition">Login</a>
          </div>
        )}
      </header>

  <section className="relative min-h-[90vh] flex items-center justify-center text-center text-white overflow-hidden bg-black">
  {/* Background Image */}
  <div className="absolute inset-0 z-0 flex items-center justify-center">
    <img
      src="/alchemy-hero.jpg" // Make sure the image is in public/
      alt="Alchemy Background"
      className="max-w-[90%] max-h-[90%] object-contain opacity-20"
    />
  </div>

  {/* Foreground Text */}
  <div className="relative z-10 px-6 max-w-3xl">
    <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
      Trade Like an <span className="text-yellow-400">Alchemist</span>
    </h1>
    <p className="text-xl text-white/80 mb-8">
      Master the market with precision, clarity, and strategy — one signal at a time.
    </p>
    <a
      href="/register"
      className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-xl text-lg font-semibold transition"
    >
      Get Started
    </a>
  </div>
</section>



      <section className="py-20 px-6 text-center bg-gray-900">
        <h2 className="text-4xl font-bold mb-4">Join Our Free Telegram Channel</h2>
        <p className="text-white/70 mb-6">Daily signals. Real gains. No noise.</p>
        <a
          href="https://t.me/alchemytradersnetwork"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
        >
          Join Telegram
        </a>
      </section>

      <section id="features" className="py-20 bg-black text-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 px-6">
          <div className="p-6 rounded-xl border border-white/10 bg-gray-950 hover:shadow-md transition">
            <h3 className="text-xl font-bold mb-2">Private Signal Room</h3>
            <p>Only subscribers access premium calls, updated live.</p>
          </div>
          <div className="p-6 rounded-xl border border-white/10 bg-gray-950 hover:shadow-md transition">
            <h3 className="text-xl font-bold mb-2">Telegram Alerts</h3>
            <p>Real-time alerts delivered directly to your Telegram app.</p>
          </div>
          <div className="p-6 rounded-xl border border-white/10 bg-gray-950 hover:shadow-md transition">
            <h3 className="text-xl font-bold mb-2">Built For Traders</h3>
            <p>Minimal, fast, and effective for serious market players.</p>
          </div>
        </div>
      </section>

      <section id="profits" className="py-20 bg-white text-black px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-8">Trade Setups & Results</h2>
          <Swiper
            slidesPerView={'auto'}
            spaceBetween={20}
            loop
            autoplay={{ delay: 2500, disableOnInteraction: false }}
            modules={[Autoplay]}
            className="w-full"
          >
            {sliderImages.map((src, index) => (
              <SwiperSlide key={index} className="!w-auto">
                <img
                  src={src}
                  alt={`Sample ${index + 1}`}
                  className="h-56 md:h-64 rounded-xl object-cover"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      <section id="pricing" className="py-20 px-6 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-white/60 mb-12">Clear pricing. Flexible access. Consistent value.</p>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { title: 'Bronze', price: '$15 / 2 Weeks', benefits: ['VIP Signal Room', 'Telegram Alerts'] },
              { title: 'Silver', price: '$30 / 1 Month', benefits: ['+ Priority Signals', 'Trade Recaps'] },
              { title: 'Gold', price: '$60 / 2 Months', benefits: ['+ Weekly Reviews', 'Exclusive Setups'] },
              { title: 'Platinum', price: '$360 / Year', benefits: ['All Access', '1-on-1 Mentorship', 'Chart Templates'] },
            ].map(({ title, price, benefits }) => (
              <div key={title} className="p-6 bg-gray-900 border border-white/10 rounded-xl hover:shadow-lg transition">
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="my-2 text-lg font-semibold">{price}</p>
                <ul className="text-sm text-white/70 mb-4 space-y-1">
                  {benefits.map((b, i) => <li key={i}>• {b}</li>)}
                </ul>
                <a href="/login" className="bg-white text-black w-full py-2 rounded-xl hover:bg-gray-300 transition block text-center">Subscribe</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white text-black">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-4">1-on-1 With Alchemist</h2>
            <p className="text-lg mb-4">Get direct mentorship on strategy, psychology, and consistent results — tailored to your trading journey.</p>
            <a href="https://t.me/the_alchemist99" target="_blank" rel="noopener noreferrer" className="inline-block bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition">
              Apply Now
            </a>
          </div>
          <div className="flex justify-center">
            <img
              src="/alchemy-manage.jpg"
              alt="Mentorship"
              className="rounded-2xl shadow-lg max-h-80 object-cover"
            />
          </div>
        </div>
      </section>

      <footer className="bg-black text-white py-10 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-2">Alchemy Traders Network</h3>
            <p className="text-sm text-white/60">Empowering traders with knowledge, clarity, and confidence.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-2">Contact</h4>
            <p>Email: <a href="mailto:alchemyfx@gmail.com" className="underline">alchemyfx@gmail.com</a></p>
            <p>Phone: +230000000</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-2">Follow Alchemist</h4>
            <div className="space-y-1 text-sm">
              <a href="https://t.me/alchemytradersnetwork" target="_blank" className="hover:underline block">Telegram Channel</a>
              <a href="https://instagram.com/yannemmy01" target="_blank" className="hover:underline block">Instagram</a>
              <a href="https://x.com/lqd_alchemist?s=21" target="_blank" className="hover:underline block">X (Twitter)</a>
            </div>
          </div>
        </div>
       <div className="text-center text-white/40 text-sm mt-10">
  © {new Date().getFullYear()} Alchemy Traders Network. All rights reserved.
</div>

      </footer>
    </div>
  )
}
