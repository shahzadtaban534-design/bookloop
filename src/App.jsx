import React, { useState, useMemo, useEffect } from 'react';

const INITIAL_BOOKS = [
  {
    id: 'book-1',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    genre: 'Fiction',
    condition: 'Like New',
    price: 12.50,
    originalPrice: 26.00,
    description: 'A beautiful novel about all the choices that go into a life well lived. Only read once, perfect condition spine.',
    coverEmoji: '🌌',
    coverBg: 'from-indigo-900 to-purple-800 text-indigo-100',
    sellerName: 'Sarah Jenkins',
    sellerId: 'user-sarah',
    listedAt: '2026-05-15'
  },
  {
    id: 'book-2',
    title: 'Atomic Habits',
    author: 'James Clear',
    genre: 'Self-Help',
    condition: 'Good',
    price: 9.99,
    originalPrice: 18.00,
    description: 'An easy & proven way to build good habits & break bad ones. Some light highlighting on chapter 3.',
    coverEmoji: '⚡',
    coverBg: 'from-amber-500 to-orange-600 text-white',
    sellerName: 'David Chen',
    sellerId: 'user-david',
    listedAt: '2026-05-18'
  },
  {
    id: 'book-3',
    title: 'Dune (Deluxe Edition)',
    author: 'Frank Herbert',
    genre: 'Sci-Fi',
    condition: 'Fair',
    price: 8.00,
    originalPrice: 22.50,
    description: 'Classic sci-fi masterpiece. Cover has a small crease, and pages are slightly yellowed, but fully readable.',
    coverEmoji: '🏜️',
    coverBg: 'from-amber-700 to-yellow-800 text-yellow-100',
    sellerName: 'Marcus Miller',
    sellerId: 'user-marcus',
    listedAt: '2026-05-20'
  },
  {
    id: 'book-4',
    title: 'Educated',
    author: 'Tara Westover',
    genre: 'Biography',
    condition: 'Like New',
    price: 11.20,
    originalPrice: 28.00,
    description: 'An unforgettable memoir about the power of learning and family. Bought brand new, outstanding shape.',
    coverEmoji: '🎓',
    coverBg: 'from-teal-700 to-emerald-800 text-emerald-100',
    sellerName: 'Elena Rostova',
    sellerId: 'user-elena',
    listedAt: '2026-05-22'
  }
];

const GENRES = ['All', 'Fiction', 'Self-Help', 'Sci-Fi', 'Biography', 'Mystery', 'Children', 'Textbook'];
const CONDITIONS = ['All', 'Like New', 'Good', 'Fair'];

export default function App() {
  const [books, setBooks] = useState(INITIAL_BOOKS);
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'dashboard' | 'checkout'
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [cart, setCart] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  
  // Checkout & Card Payment Gateway Form States
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentReceipt, setPaymentReceipt] = useState(null);

  // New Listing Form States
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newGenre, setNewGenre] = useState('Fiction');
  const [newCondition, setNewCondition] = useState('Good');
  const [newPrice, setNewPrice] = useState('');
  const [newOriginalPrice, setNewOriginalPrice] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newEmoji, setNewEmoji] = useState('📖');
  const [newBg, setNewBg] = useState('from-indigo-600 to-blue-500 text-white');

  // Simulated Logged-In User Profile State
  const [currentUser, setCurrentUser] = useState({
    id: 'user-logged',
    name: 'You (Alex Carter)',
    balance: 120.00,
    listedBooks: [],
    purchasedBooks: [],
    salesCount: 0,
    totalEarnings: 0.00
  });

  // Interactive Confetti Overlay State
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiParticles, setConfettiParticles] = useState([]);

  // Toast Notification Manager
  const addToast = (text, type = 'success') => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4500);
  };

  const triggerConfetti = () => {
    setShowConfetti(true);
    const colors = ['#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6', '#f43f5e'];
    const particles = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      size: Math.random() * 8 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 1.2,
      duration: Math.random() * 2 + 1.5,
      rotation: Math.random() * 360,
      spinSpeed: Math.random() * 8 - 4
    }));
    setConfettiParticles(particles);
    setTimeout(() => {
      setShowConfetti(false);
    }, 4000);
  };

  // Commission Constants (20% to Platform Admin)
  const COMMISSION_RATE = 0.20;
  const calculateCommission = (price) => parseFloat((price * COMMISSION_RATE).toFixed(2));
  const calculateSellerShare = (price) => parseFloat((price * (1 - COMMISSION_RATE)).toFixed(2));

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 16);
    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2);
    }
    setCardExpiry(value);
  };

  const handleCvcChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 3);
    setCardCvc(value);
  };

  const handleAddBookListing = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAuthor.trim() || !newPrice) {
      addToast("Please fill out the Title, Author, and Sale Price.", "warning");
      return;
    }

    const listPrice = parseFloat(newPrice);
    if (isNaN(listPrice) || listPrice <= 0) {
      addToast("Please provide a valid selling price greater than $0.", "warning");
      return;
    }

    const commissionVal = calculateCommission(listPrice);
    const payoutVal = calculateSellerShare(listPrice);

    const newBookObj = {
      id: `custom-${Date.now()}`,
      title: newTitle,
      author: newAuthor,
      genre: newGenre,
      condition: newCondition,
      price: listPrice,
      originalPrice: parseFloat(newOriginalPrice) || parseFloat((listPrice * 2.1).toFixed(2)),
      description: newDesc || 'A pre-loved book in search of a brand new adventure.',
      coverEmoji: newEmoji,
      coverBg: newBg,
      sellerName: currentUser.name,
      sellerId: currentUser.id,
      listedAt: new Date().toISOString().split('T')[0]
    };

    setBooks((prev) => [newBookObj, ...prev]);
    setCurrentUser((prev) => ({
      ...prev,
      listedBooks: [newBookObj, ...prev.listedBooks]
    }));

    // Reset Form
    setNewTitle('');
    setNewAuthor('');
    setNewPrice('');
    setNewOriginalPrice('');
    setNewDesc('');
    
    addToast(`"${newBookObj.title}" listed! You'll receive $${payoutVal.toFixed(2)} on a sale (after 20% platform commission).`, 'success');
    triggerConfetti();
  };

  const handleAddToCart = (book) => {
    if (book.sellerId === currentUser.id) {
      addToast("This is your listing! You cannot purchase your own book.", "warning");
      return;
    }
    if (cart.some(item => item.id === book.id)) {
      addToast(`"${book.title}" is already in your checkout list.`, "warning");
      return;
    }
    setCart((prev) => [...prev, book]);
    addToast(`"${book.title}" added to your shopping cart!`, "success");
  };

  const handleRemoveFromCart = (bookId) => {
    setCart((prev) => prev.filter(item => item.id !== bookId));
    addToast("Removed item from checkout cart.", "info");
  };

  const handleCheckoutComplete = (e) => {
    if (e) e.preventDefault();
    const subtotal = cart.reduce((acc, b) => acc + b.price, 0);
    if (subtotal === 0) return;

    if (!cardName.trim()) {
      addToast("Please input the cardholder's full name.", "warning");
      return;
    }
    if (cardNumber.replace(/\s/g, '').length < 16) {
      addToast("Please enter a valid 16-digit card number.", "warning");
      return;
    }
    if (cardExpiry.length < 5) {
      addToast("Please enter a valid expiry date (MM/YY).", "warning");
      return;
    }
    if (cardCvc.length < 3) {
      addToast("Please enter a valid 3-digit CVV.", "warning");
      return;
    }

    setIsProcessingPayment(true);
    addToast("Authorizing online credit card payment...", "info");

    setTimeout(() => {
      setIsProcessingPayment(false);
      
      const adminCommission = cart.reduce((acc, item) => acc + calculateCommission(item.price), 0);
      const sellerPayout = cart.reduce((acc, item) => acc + calculateSellerShare(item.price), 0);

      const receipt = {
        id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toLocaleString(),
        total: subtotal,
        adminFee: adminCommission,
        sellerPayout: sellerPayout,
        cardLast4: cardNumber.slice(-4),
        items: [...cart]
      };

      setCurrentUser((prev) => ({
        ...prev,
        purchasedBooks: [...prev.purchasedBooks, ...cart]
      }));

      // Remove purchased books from active marketplace display
      const purchasedIds = cart.map(item => item.id);
      setBooks(prev => prev.filter(b => !purchasedIds.includes(b.id)));

      setPaymentReceipt(receipt);
      setCart([]);
      
      // Clear payment credentials
      setCardName('');
      setCardNumber('');
      setCardExpiry('');
      setCardCvc('');

      triggerConfetti();
      addToast(`Payment Processed! Platform commission of $${adminCommission.toFixed(2)} was securely routed.`, "success");
    }, 2500);
  };

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            book.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = selectedGenre === 'All' || book.genre === selectedGenre;
      const matchesCondition = selectedCondition === 'All' || book.condition === selectedCondition;
      return matchesSearch && matchesGenre && matchesCondition;
    });
  }, [books, searchQuery, selectedGenre, selectedCondition]);

  const handleSubscribeNewsletter = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) {
      addToast("Please enter a valid email address.", "warning");
      return;
    }
    setNewsletterSubscribed(true);
    addToast("Successfully subscribed to BookLoop digest!", "success");
    triggerConfetti();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col relative overflow-x-hidden">
      
      {}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {confettiParticles.map((p) => (
            <div
              key={p.id}
              className="absolute rounded"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size * 1.5}px`,
                backgroundColor: p.color,
                opacity: 0.9,
                transform: `rotate(${p.rotation}deg)`,
                animation: `fall ${p.duration}s linear ${p.delay}s infinite`,
              }}
            />
          ))}
          <style>{`
            @keyframes fall {
              0% { top: -5%; transform: translateY(0) rotate(0deg); }
              100% { top: 110%; transform: translateY(100vh) rotate(720deg); }
            }
          `}</style>
        </div>
      )}

      {}
      <div className="fixed bottom-6 right-6 z-50 space-y-3 max-w-sm w-full pointer-events-none">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-4 rounded-2xl shadow-xl border flex items-start gap-3 pointer-events-auto transform transition-all duration-350 translate-y-0 animate-bounce-short ${
              n.type === 'success' ? 'bg-emerald-900 border-emerald-700 text-emerald-100' :
              n.type === 'warning' ? 'bg-amber-900 border-amber-700 text-amber-100' :
              'bg-slate-900 border-slate-700 text-slate-100'
            }`}
          >
            <span className="text-lg">
              {n.type === 'success' ? '✨' : n.type === 'warning' ? '⚠️' : 'ℹ️'}
            </span>
            <p className="text-xs font-semibold leading-relaxed flex-1">{n.text}</p>
          </div>
        ))}
      </div>

      {}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-100 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo */}
          <button 
            onClick={() => { setCurrentView('home'); setSelectedBook(null); }}
            className="flex items-center gap-2.5 group text-left focus:outline-none"
          >
            <span className="text-3xl bg-indigo-550 p-2 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-lg shadow-indigo-100 text-white transform group-hover:rotate-6 transition-all">📚</span>
            <div>
              <span className="text-xl font-black text-slate-900 tracking-tight block">BookLoop</span>
              <span className="text-[10px] text-indigo-600 font-extrabold tracking-widest uppercase -mt-1 block">Secondhand Hub</span>
            </div>
          </button>

          {/* Nav Items */}
          <nav className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => { setCurrentView('home'); setSelectedBook(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                currentView === 'home' 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Marketplace
            </button>

            <button
              onClick={() => { setCurrentView('dashboard'); setSelectedBook(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentView === 'dashboard' 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>My Studio</span>
              <span className="inline-block w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
            </button>

            <button
              onClick={() => { setCurrentView('checkout'); setSelectedBook(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative border ${
                currentView === 'checkout' 
                  ? 'bg-indigo-600 text-white border-indigo-600' 
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>🛒 Checkout</span>
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {cart.length}
                </span>
              )}
            </button>
          </nav>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1">

        {}
        {currentView === 'home' && !selectedBook && (
          <div>
            {/* Hero banner */}
            <section className="bg-gradient-to-b from-slate-100 to-slate-50 py-16 px-4 border-b border-slate-200/50">
              <div className="max-w-5xl mx-auto text-center space-y-6">
                <span className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-800 text-[11px] font-extrabold uppercase px-3.5 py-1.5 rounded-full tracking-wider border border-indigo-100/50">
                  🌱 20% platform commission supports clean earth recycling
                </span>
                <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-none">
                  Sell Your Books, <br className="hidden sm:inline" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Keep 80% of Profits!</span>
                </h1>
                <p className="text-slate-600 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
                  Upload your pre-loved textbooks, fiction, and journals. Buy verified books with instant secure online checkout, and pass on the magic of storytelling!
                </p>
                
                <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold rounded-xl shadow-lg shadow-indigo-200 hover:scale-102 transition-all text-xs uppercase tracking-wide"
                  >
                    List a Book Now
                  </button>
                  <a
                    href="#directory"
                    className="px-6 py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-extrabold rounded-xl transition-all text-xs uppercase tracking-wide"
                  >
                    Browse Directory
                  </a>
                </div>
              </div>
            </section>

            {/* Filter & Catalog Directory */}
            <section id="directory" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
              
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
                  
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                    <input
                      type="text"
                      placeholder="Search title, author, or keyword..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs font-semibold transition-all"
                    />
                  </div>

                  {/* Filter Genres */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">Genre:</span>
                    {GENRES.map((genre) => (
                      <button
                        key={genre}
                        onClick={() => setSelectedGenre(genre)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          selectedGenre === genre
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>

                </div>

                <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Condition:</span>
                    {CONDITIONS.map((cond) => (
                      <button
                        key={cond}
                        onClick={() => setSelectedCondition(cond)}
                        className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all border ${
                          selectedCondition === cond
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                            : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {cond}
                      </button>
                    ))}
                  </div>

                  <p className="text-xs text-slate-400 ml-auto font-medium">
                    Showing <strong className="text-slate-700">{filteredBooks.length}</strong> matching books
                  </p>
                </div>
              </div>

              {/* Books Grid */}
              {filteredBooks.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 py-16 text-center space-y-4 max-w-lg mx-auto">
                  <span className="text-5xl">📚</span>
                  <h3 className="text-lg font-bold text-slate-800">No books found in this filter</h3>
                  <p className="text-slate-500 text-xs leading-relaxed max-w-sm mx-auto">
                    Try altering your keywords or lowering your selection restrictions. Alternatively, be the first to list a book in this space!
                  </p>
                  <button
                    onClick={() => { setSelectedGenre('All'); setSelectedCondition('All'); setSearchQuery(''); }}
                    className="text-xs font-extrabold text-indigo-600 hover:underline"
                  >
                    Reset Search Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredBooks.map((book) => {
                    const discount = Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100);
                    return (
                      <div 
                        key={book.id}
                        className="bg-white rounded-3xl border border-slate-200/80 hover:border-slate-300/90 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                      >
                        {/* Simulated cover */}
                        <div className={`h-52 bg-gradient-to-br ${book.coverBg} flex flex-col justify-between p-5 relative overflow-hidden shrink-0`}>
                          <div className="flex justify-between items-start">
                            <span className="bg-white/20 backdrop-blur-md text-white text-[10px] uppercase font-bold px-2.5 py-1 rounded-full">
                              {book.genre}
                            </span>
                            {discount > 0 && (
                              <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded">
                                Save {discount}%
                              </span>
                            )}
                          </div>

                          <div className="text-center py-4 transform group-hover:scale-110 transition-all duration-300">
                            <span className="text-5xl block filter drop-shadow">{book.coverEmoji}</span>
                          </div>

                          <div className="text-[10px] bg-black/30 backdrop-blur-sm text-slate-100 rounded-lg p-1.5 text-center font-bold">
                            Condition: <span className="text-white uppercase">{book.condition}</span>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-1">
                            <h3 className="font-extrabold text-slate-900 text-sm line-clamp-1 group-hover:text-indigo-600 transition-colors">
                              {book.title}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">by {book.author}</p>
                            <p className="text-[11px] text-slate-400 line-clamp-2 pt-1 leading-normal">
                              {book.description}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                            <div>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-xl font-extrabold text-indigo-950">${book.price.toFixed(2)}</span>
                                <span className="text-xs text-slate-400 line-through">${book.originalPrice.toFixed(2)}</span>
                              </div>
                              <span className="text-[9px] text-slate-400 block font-medium">Listed by {book.sellerName}</span>
                            </div>

                            <button
                              onClick={() => handleAddToCart(book)}
                              className="px-3 py-2 bg-slate-900 hover:bg-indigo-600 text-white font-extrabold rounded-xl transition-all text-xs flex items-center gap-1.5"
                            >
                              <span>Buy</span>
                              <span>+</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </section>
          </div>
        )}

        {}
        {selectedBook && (
          <section className="max-w-4xl mx-auto px-4 py-12">
            <button
              onClick={() => setSelectedBook(null)}
              className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600"
            >
              ← Back to Marketplace
            </button>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl grid grid-cols-1 md:grid-cols-12 gap-8 p-6 sm:p-8">
              
              {/* Left Cover Block */}
              <div className="md:col-span-5 flex flex-col items-center">
                <div className={`w-full max-w-[280px] h-96 bg-gradient-to-br ${selectedBook.coverBg} rounded-3xl flex flex-col justify-between p-6 shadow-md text-center`}>
                  <span className="bg-white/20 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full self-start">
                    {selectedBook.genre}
                  </span>
                  <span className="text-8xl my-auto block filter drop-shadow">{selectedBook.coverEmoji}</span>
                  <div className="bg-black/25 text-white py-2 rounded-xl text-xs uppercase font-bold">
                    Condition: {selectedBook.condition}
                  </div>
                </div>
              </div>

              {/* Right Description Block */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                      Book Directory File
                    </span>
                    <h1 className="text-3xl font-extrabold text-slate-950 mt-2">{selectedBook.title}</h1>
                    <p className="text-slate-500 font-semibold text-sm mt-1">Written by {selectedBook.author}</p>
                  </div>

                  <p className="text-slate-600 text-sm leading-relaxed">{selectedBook.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-2xl p-4 text-xs font-medium">
                    <div>
                      <span className="text-slate-400 block uppercase text-[10px] font-bold">Date Listed</span>
                      <strong className="text-slate-700">{selectedBook.listedAt}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase text-[10px] font-bold">Seller Profile</span>
                      <strong className="text-slate-700">{selectedBook.sellerName}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-6">
                  <div>
                    <span className="text-slate-400 text-xs block font-bold">Lister Price</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-indigo-950">${selectedBook.price.toFixed(2)}</span>
                      <span className="text-slate-400 line-through text-sm">${selectedBook.originalPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAddToCart(selectedBook)}
                      className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl shadow-lg shadow-indigo-200 text-xs uppercase tracking-wider transition-all"
                    >
                      Add To Shopping Queue
                    </button>
                    <button
                      onClick={() => setSelectedBook(null)}
                      className="px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </section>
        )}

        {}
        {currentView === 'checkout' && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-8 flex items-center gap-3">
              <span>Checkout Counter</span>
              <span className="bg-indigo-100 text-indigo-800 text-xs font-extrabold px-3 py-1.5 rounded-full">{cart.length} Books Selected</span>
            </h1>

            {paymentReceipt ? (
              <div className="bg-white rounded-3xl border border-emerald-200 p-8 text-center max-w-xl mx-auto shadow-xl space-y-6">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">✓</div>
                <div>
                  <h3 className="text-2xl font-extrabold text-slate-900">Payment Approved!</h3>
                  <p className="text-slate-500 text-sm mt-1">Receipt reference: <strong className="font-mono text-slate-700">{paymentReceipt.id}</strong></p>
                </div>

                <div className="divide-y divide-slate-100 bg-slate-50 rounded-2xl p-6 text-left text-xs space-y-3">
                  <div className="flex justify-between text-slate-500">
                    <span>Payment Date:</span>
                    <span className="font-semibold text-slate-800">{paymentReceipt.date}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 pt-3">
                    <span>Card Charged:</span>
                    <span className="font-semibold text-slate-800">•••• •••• •••• {paymentReceipt.cardLast4}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 pt-3">
                    <span>Admin Commission Received (20%):</span>
                    <span className="font-extrabold text-indigo-600">${paymentReceipt.adminFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 pt-3">
                    <span>Seller Revenue Shared (80%):</span>
                    <span className="font-semibold text-emerald-600">${paymentReceipt.sellerPayout.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 pt-3 text-sm font-extrabold">
                    <span>Total Charged:</span>
                    <span>${paymentReceipt.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-400">
                  These books have been added to your Library under your "My Studio" control dashboard.
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => { setPaymentReceipt(null); setCurrentView('home'); }}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all text-xs"
                  >
                    Browse More Books
                  </button>
                  <button
                    onClick={() => { setPaymentReceipt(null); setCurrentView('dashboard'); }}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl transition-all text-xs"
                  >
                    View Purchased Library
                  </button>
                </div>
              </div>
            ) : cart.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 py-16 px-4 text-center max-w-xl mx-auto">
                <div className="text-6xl mb-4">🛒</div>
                <h3 className="text-xl font-bold text-slate-800">Your checkout queue is currently empty</h3>
                <p className="text-slate-500 text-sm mt-2">Browse the marketplace directory to discover stellar pre-loved books starting at low prices.</p>
                <button
                  onClick={() => setCurrentView('home')}
                  className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all"
                >
                  Return to Home
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Cart list items */}
                <div className="lg:col-span-7 space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200/85 p-5 flex items-center gap-4 hover:shadow-md transition-all relative overflow-hidden"
                    >
                      <div className={`w-16 h-20 rounded-xl ${item.coverBg} flex items-center justify-center text-3xl shrink-0`}>
                        {item.coverEmoji}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] uppercase font-bold text-indigo-600 tracking-wide">{item.genre}</span>
                          <span className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded uppercase font-bold">{item.condition}</span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm line-clamp-1 mt-0.5">{item.title}</h3>
                        <p className="text-xs text-slate-500">by {item.author}</p>
                        <p className="text-[11px] text-slate-400 mt-1">Listed by {item.sellerName}</p>
                      </div>

                      <div className="text-right flex flex-col items-end gap-2">
                        <span className="font-extrabold text-lg text-indigo-950">${item.price.toFixed(2)}</span>
                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="text-[11px] font-bold text-rose-500 hover:text-rose-700 hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing summary & Secure card gateway form */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
                    <h3 className="font-extrabold text-slate-900 text-lg">Purchase Order Summary</h3>
                    
                    <div className="space-y-3.5 border-b border-slate-100 pb-5 text-sm">
                      <div className="flex justify-between text-slate-600">
                        <span>Subtotal ({cart.length} items)</span>
                        <span className="font-bold text-slate-900">${cart.reduce((acc, item) => acc + item.price, 0).toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between text-slate-600 text-xs">
                        <span>Packing & Shipping Fees</span>
                        <span className="text-emerald-600 font-bold uppercase">Free Eco-Shipping</span>
                      </div>

                      {/* Highly visible 20% Commission alert block */}
                      <div className="bg-indigo-50/70 rounded-2xl p-4 border border-indigo-100 space-y-2">
                        <p className="font-bold text-xs text-indigo-900 flex items-center gap-1.5">
                          <span className="text-base">🚀</span> Platform Fee Breakdown
                        </p>
                        <p className="text-[11px] text-slate-600 leading-normal">
                          Your purchase supports sustainability! A <strong>20% platform commission ($
                          {cart.reduce((acc, item) => acc + calculateCommission(item.price), 0).toFixed(2)}
                          )</strong> is taken from the total to keep BookLoop running. The remainder gets dispatched instantly to individual sellers.
                        </p>
                        <div className="h-px bg-indigo-200/50 my-1"></div>
                        <div className="flex justify-between text-[11px] text-indigo-950">
                          <span>Combined Seller Payouts (80%):</span>
                          <span className="font-bold">${cart.reduce((acc, item) => acc + calculateSellerShare(item.price), 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Credit Card Details Inputs */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Credit or Debit Card</span>
                        <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded font-semibold flex items-center gap-1">
                          🔒 Secure Encrypted
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Cardholder Name</label>
                          <input
                            type="text"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            placeholder="John Doe"
                            disabled={isProcessingPayment}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Card Number</label>
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            placeholder="4000 1234 5678 9010"
                            disabled={isProcessingPayment}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm font-mono tracking-widest"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Expiry Date</label>
                            <input
                              type="text"
                              value={cardExpiry}
                              onChange={handleExpiryChange}
                              placeholder="MM/YY"
                              disabled={isProcessingPayment}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm font-semibold text-center"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">CVV / CVC</label>
                            <input
                              type="password"
                              value={cardCvc}
                              onChange={handleCvcChange}
                              placeholder="•••"
                              disabled={isProcessingPayment}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm font-mono text-center"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Complete Checkout Button */}
                    <button
                      onClick={handleCheckoutComplete}
                      disabled={isProcessingPayment}
                      className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold py-4 rounded-xl shadow-lg shadow-indigo-200 hover:scale-101 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessingPayment ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing Secured Payment...
                        </>
                      ) : (
                        `Pay & Authorize Order • $${cart.reduce((acc, item) => acc + item.price, 0).toFixed(2)}`
                      )}
                    </button>
                  </div>
                </div>

              </div>
            )}
          </section>
        )}

        {}
        {currentView === 'dashboard' && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
            
            {/* Header greeting */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
              <div>
                <span className="bg-indigo-500 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full">
                  Verified Publisher Account
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">{currentUser.name}</h2>
                <p className="text-indigo-200 text-xs mt-1">Track your active listings, list custom books, and check on-chain or platform payouts.</p>
              </div>

              <div className="flex gap-4 sm:gap-6">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <span className="text-slate-300 text-[10px] uppercase block font-semibold">Active Listings</span>
                  <span className="text-2xl font-black">{currentUser.listedBooks.length} Books</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <span className="text-slate-300 text-[10px] uppercase block font-semibold">Library Purchases</span>
                  <span className="text-2xl font-black">{currentUser.purchasedBooks.length} Books</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: List a book form */}
              <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Upload Secondhand Book</h3>
                  <p className="text-xs text-slate-500 mt-1">Specify detailed properties, set your asking price, and start selling instantly.</p>
                </div>

                <form onSubmit={handleAddBookListing} className="space-y-4">
                  
                  {/* Title & Author */}
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Book Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="The Great Gatsby"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs font-semibold transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Author Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="F. Scott Fitzgerald"
                        value={newAuthor}
                        onChange={(e) => setNewAuthor(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs font-semibold transition-all"
                      />
                    </div>
                  </div>

                  {/* Genre & Condition dropdowns */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Genre Category</label>
                      <select
                        value={newGenre}
                        onChange={(e) => setNewGenre(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs font-bold transition-all text-slate-700"
                      >
                        {GENRES.slice(1).map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Physical Condition</label>
                      <select
                        value={newCondition}
                        onChange={(e) => setNewCondition(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs font-bold transition-all text-slate-700"
                      >
                        {CONDITIONS.slice(1).map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Prices and live Commission dynamic calculator */}
                  <div className="space-y-3.5 bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/75">
                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Asking Price ($) *</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          placeholder="10.00"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs font-extrabold text-indigo-950 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Original Retail Price ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="22.50"
                          value={newOriginalPrice}
                          onChange={(e) => setNewOriginalPrice(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs font-semibold text-slate-600 transition-all"
                        />
                      </div>
                    </div>

                    {/* Live Commission Display */}
                    {newPrice && parseFloat(newPrice) > 0 && (
                      <div className="space-y-1 pt-2 text-[11px] border-t border-indigo-100/50">
                        <div className="flex justify-between text-slate-600">
                          <span>Platform Commission (20%):</span>
                          <span className="font-extrabold text-rose-500">-${calculateCommission(parseFloat(newPrice)).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-indigo-950 font-extrabold text-xs">
                          <span>Your Net Payout (80%):</span>
                          <span className="text-emerald-600">${calculateSellerShare(parseFloat(newPrice)).toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Graphic Cover Customizer */}
                  <div className="grid grid-cols-2 gap-3.5 pt-1">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Cover Symbol/Emoji</label>
                      <input
                        type="text"
                        maxLength={2}
                        value={newEmoji}
                        onChange={(e) => setNewEmoji(e.target.value)}
                        placeholder="📖"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Cover Color Palette</label>
                      <select
                        value={newBg}
                        onChange={(e) => setNewBg(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-700"
                      >
                        <option value="from-indigo-600 to-blue-500 text-white">Neon Indigo</option>
                        <option value="from-amber-500 to-orange-600 text-white">Electric Orange</option>
                        <option value="from-emerald-700 to-teal-800 text-emerald-100">Forest Emerald</option>
                        <option value="from-rose-500 to-pink-600 text-white">Pastel Rose</option>
                        <option value="from-slate-700 to-slate-900 text-slate-100">Deep Slate</option>
                      </select>
                    </div>
                  </div>

                  {/* Brief description */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Item Description</label>
                    <textarea
                      rows={2}
                      placeholder="e.g., Paperback, 2018 reprint. Minor scuffs on corner of the front jacket..."
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs font-semibold transition-all leading-normal"
                    ></textarea>
                  </div>

                  {/* Submission Trigger */}
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold rounded-xl shadow-md transition-all uppercase tracking-wider text-xs"
                  >
                    Confirm & Publish Listing
                  </button>

                </form>
              </div>

              {/* Right Column: Active Listings & Library */}
              <div className="lg:col-span-7 space-y-8">
                
                {/* Active Listings Container */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
                  <h3 className="text-lg font-extrabold text-slate-900 flex items-center justify-between">
                    <span>Your Active Bookstore Listings</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold">
                      {currentUser.listedBooks.length} Listed
                    </span>
                  </h3>

                  {currentUser.listedBooks.length === 0 ? (
                    <div className="bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 py-12 px-4 text-center">
                      <span className="text-4xl block mb-2">📥</span>
                      <p className="text-xs font-bold text-slate-700">You haven't uploaded any books yet</p>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                        Fill out the upload form on the left to start selling pre-loved books and receiving earnings instantly!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                      {currentUser.listedBooks.map((item) => (
                        <div
                          key={item.id}
                          className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3.5 hover:bg-white hover:border-slate-200 transition-all"
                        >
                          <div className={`w-11 h-14 rounded bg-gradient-to-br ${item.coverBg} flex items-center justify-center text-xl shrink-0`}>
                            {item.coverEmoji}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-extrabold text-slate-900 text-xs truncate">{item.title}</h4>
                            <p className="text-[10px] text-slate-400">by {item.author}</p>
                            <span className="inline-block mt-1 text-[9px] bg-indigo-50 text-indigo-700 font-extrabold px-1.5 py-0.5 rounded">
                              {item.genre}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="font-extrabold text-sm text-indigo-950 block">${item.price.toFixed(2)}</span>
                            <span className="text-[9px] text-emerald-600 font-bold block">
                              Payout: ${calculateSellerShare(item.price).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Library/Purchased books Container */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
                  <h3 className="text-lg font-extrabold text-slate-900 flex items-center justify-between">
                    <span>Your Digital Library Purchases</span>
                    <span className="text-[10px] bg-emerald-550/10 text-emerald-700 px-3 py-1 rounded-full font-bold">
                      {currentUser.purchasedBooks.length} Secured
                    </span>
                  </h3>

                  {currentUser.purchasedBooks.length === 0 ? (
                    <div className="bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 py-12 px-4 text-center">
                      <span className="text-4xl block mb-2">🎁</span>
                      <p className="text-xs font-bold text-slate-700">No books purchased yet</p>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                        Head over to the online marketplace directory to secure items with credit card payment simulator.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {currentUser.purchasedBooks.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 bg-emerald-50/30 border border-emerald-100/50 rounded-2xl flex gap-3"
                        >
                          <span className="text-3xl shrink-0">{item.coverEmoji}</span>
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 text-xs truncate leading-normal">{item.title}</h4>
                            <p className="text-[10px] text-slate-500">by {item.author}</p>
                            <span className="inline-flex items-center gap-1 text-[9px] text-emerald-700 font-bold mt-1">
                              <span>✓ Secured</span>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          </section>
        )}

      </main>

      {}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
            
            {/* Logo/branding block */}
            <div className="md:col-span-4 space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl bg-indigo-600 p-1.5 rounded-xl text-white">📚</span>
                <span className="text-lg font-extrabold text-white tracking-tight">BookLoop Marketplace</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                BookLoop is the eco-friendly alternative to textbook consumption. We support student sustainability by charging just a 20% platform routing commission to cover costs.
              </p>
              <p className="text-[10px] text-slate-500">
                © 2026 BookLoop, Inc. All Rights Reserved.
              </p>
            </div>

            {/* Newsletter Subscription block */}
            <div className="md:col-span-5 space-y-4">
              <h4 className="text-white font-extrabold text-xs uppercase tracking-wider">Join Our Marketplace Digest</h4>
              <p className="text-xs text-slate-400">
                Receive the latest catalog arrivals, study updates, and neighborhood secondhand deals directly to your inbox.
              </p>

              {newsletterSubscribed ? (
                <div className="bg-emerald-950/40 border border-emerald-800 p-4 rounded-xl text-emerald-300 text-xs text-center font-bold">
                  ✓ Outstanding! You are subscribed to BookLoop Digest.
                </div>
              ) : (
                <form onSubmit={handleSubscribeNewsletter} className="flex gap-2">
                  <input
                    type="email"
                    required
                    placeholder="student@university.edu"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all uppercase"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>

            {/* Commission and policies links */}
            <div className="md:col-span-3 space-y-4 text-xs">
              <h4 className="text-white font-extrabold text-xs uppercase tracking-wider">Platform Rates</h4>
              <div className="space-y-2 text-slate-400">
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span>Seller Revenue Share:</span>
                  <strong className="text-emerald-400 font-black">80%</strong>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span>Owner Commission:</span>
                  <strong className="text-indigo-400 font-black">20%</strong>
                </div>
                <div className="flex justify-between">
                  <span>Online Credit Processing:</span>
                  <strong className="text-white">Secure Sandbox</strong>
                </div>
              </div>
            </div>

          </div>

        </div>
      </footer>

    </div>
  );
}
