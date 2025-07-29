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
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white">
      <header className="p-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src="/uweh-logo.jpg" alt="Logo" className="w-10 h-10 rounded-full object-cover" />
            <h1 className="text-2xl font-bold">Uwehs Trade HUB</h1>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-4">
            <a href="#features" className="hover:underline">Features</a>
            <a href="#pricing" className="hover:underline">Pricing</a>
            <a href="#profits" className="hover:underline">Trade Setups</a>
            <a href="/login" className="bg-white text-black px-4 py-2 rounded-xl hover:bg-gray-200 transition">Login</a>
          </nav>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden mt-4 px-4 space-y-3">
            <a href="#features" className="block hover:underline">Features</a>
            <a href="#pricing" className="block hover:underline">Pricing</a>
            <a href="#profits" className="block hover:underline">Trade Setups</a>
            <a href="/login" className="block bg-white text-black px-4 py-2 rounded-xl w-max hover:bg-gray-200 transition">Login</a>
          </div>
        )}
      </header>


      <section className="py-24 px-6 text-center max-w-4xl mx-auto">
        <h2 className="text-5xl font-extrabold mb-6">Trade Smarter. Earn Better.</h2>
        <p className="text-xl text-white/70 mb-10">Join a trusted space where you grow with every trade — reliable signals, clear pricing, and real results.</p>
        <a href="/register" className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl text-lg font-semibold transition">Get Started</a>
      </section>

      <section className="py-20 px-6 bg-blue-950 text-white text-center">
        <h2 className="text-4xl font-bold mb-4">Join Our Free Telegram Channel</h2>
        <p className="text-white/80 mb-6">Get free trading signals and updates daily. Our Telegram community helps you stay ahead with the market.</p>
        <a
          href="https://t.me/oshilafxacademy"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl text-lg font-semibold transition"
        >
          Join Telegram
        </a>
      </section>

      <section id="features" className="py-20 bg-white text-black">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 px-6">
          <div className="p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition">
            <h3 className="text-xl font-bold mb-2">Private Signal Room</h3>
            <p>Only your paid subscribers can access premium trading calls securely.</p>
          </div>
          <div className="p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition">
            <h3 className="text-xl font-bold mb-2">Telegram Push Updates</h3>
            <p>Instantly deliver accurate and timely alerts to all your clients via Telegram.</p>
          </div>
          <div className="p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition">
            <h3 className="text-xl font-bold mb-2">Designed for Traders</h3>
            <p>Built with you in mind — clean layout, fast performance, and intuitive flows for seamless trading support.</p>
          </div>
        </div>
      </section>

      <section id="profits" className="py-20 bg-gray-900 text-white px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-8">Our Trade Setups & Profits</h2>
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

      <section className="py-20 px-6 bg-white text-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Why Choose UwehFx?</h2>
          <ul className="space-y-4 text-left max-w-md mx-auto text-lg">
            <li className="flex items-start">
              <span className="text-green-600 font-bold text-xl mr-2">✓</span>
              Consistent Daily Signals from Market Experts
            </li>
            <li className="flex items-start">
              <span className="text-green-600 font-bold text-xl mr-2">✓</span>
              Transparent Trade History and Updates
            </li>
            <li className="flex items-start">
              <span className="text-green-600 font-bold text-xl mr-2">✓</span>
              Strong Community with Real-Time Support
            </li>
          </ul>
        </div>
      </section>


      {/* Mentorship Section */}
      <section className="py-20 px-6 bg-gray-100 text-gray-900">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-4">1-on-1 Mentorship</h2>
            <p className="text-lg text-gray-700 mb-4">
              Ready to level up your trading journey? Work directly with UwehFX to master strategy, psychology, and consistent profits.
            </p>
            <a href="https://t.me/UWEHFX" target="_blank" rel="noopener noreferrer" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition">
              Apply Now
            </a>
          </div>
          <div className="flex justify-center">
            <img
              src="/acc-manage.jpg"
              alt="Mentorship"
              className="rounded-2xl shadow-lg max-h-80 object-cover"
            />
          </div>
        </div>
      </section>

            <section id="pricing" className="py-20 px-6 bg-white text-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 text-blue-800">Choose Your Plan</h2>
          <p className="text-gray-600 mb-12">Flexible pricing for every trader. Upgrade anytime.</p>
          <div className="grid md:grid-cols-4 gap-6">
            {/* Pricing Cards */}
            {[
              { title: 'Bronze', price: '$15 / 2 Weeks', benefits: ['Access to VIP Signal Room', 'Telegram Notifications'] },
              { title: 'Silver', price: '$30 / 1 Month', benefits: ['Everything in Bronze', 'Priority Entry Signals'] },
              { title: 'Gold', price: '$60 / 2 Months', benefits: ['All Silver Features', 'Weekly Market Breakdown'] },
              { title: 'Platinum', price: '$360 / 1 Year', benefits: ['Everything Unlocked', '1-on-1 Strategy Session', 'Lifetime Chart Templates'] },
            ].map(({ title, price, benefits }) => (
              <div key={title} className="p-6 rounded-xl shadow-lg border border-blue-200 hover:shadow-xl transition">
                <h3 className="text-xl font-bold text-blue-700">{title}</h3>
                <p className="my-2 text-lg font-semibold">{price}</p>
                <ul className="text-sm text-gray-700 mb-4 space-y-1">
                  {benefits.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
                <a href="/login" className="bg-blue-600 text-white w-full py-2 rounded-xl hover:bg-blue-700 transition block text-center">Subscribe</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-950 text-white py-10 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-2">Uwehs Trade HUB</h3>
            <p className="text-sm text-white/70">Empowering traders through education, signals, and community. Let&apos;s grow together.</p>

          </div>
          <div>
            <h4 className="text-lg font-semibold mb-2">Contact</h4>
            <p>Email: <a href="@gmail.com" className="underline">@gmail.com</a></p>
            <p>Phone: +2347049507442</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-2">Follow Us</h4>
            <div className="space-x-4">
              <a href="https://t.me/milkingwithuwehs" target="_blank" className="hover:underline">Telegram</a>
              <a href="https://instagram.com/oshilafxhttps://www.instagram.com/uwehstradehub?igsh=MTgxcTNmcjVxMGNreg==" target="_blank" className="hover:underline">Instagram</a>
              <a href="https://x.com/uwehstradehub?s=21" target="_blank" className="hover:underline">X (Twitter)</a>
            </div>
          </div>
        </div>
        <div className="text-center text-white/50 text-sm mt-10">
          © {new Date().getFullYear()} UwehFX. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
