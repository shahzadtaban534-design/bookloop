import React, { useState, useMemo, useEffect, useRef } from 'react';

const GENRES = ['All','Fiction','Self-Help','Sci-Fi','Biography','Mystery','Children','Textbook'];
const CONDITIONS = ['All','Like New','Good','Fair'];
const COMMISSION_RATE = 0.20;
const pkr = (n) => 'PKR ' + Number(n).toLocaleString('en-PK');
const load = (k,fb) => { try { const v=localStorage.getItem(k); return v?JSON.parse(v):fb; } catch { return fb; } };
const save = (k,v) => { try { localStorage.setItem(k,JSON.stringify(v)); } catch {} };
const inp = "w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-base font-medium text-slate-800 transition-all";

const FAMOUS_BOOKS = [
  { title:'The Alchemist', author:'Paulo Coelho', emoji:'⚗️', color:'#D4A017', bg:'#1a0a00' },
  { title:'Atomic Habits', author:'James Clear', emoji:'⚡', color:'#F97316', bg:'#1c0a00' },
  { title:'Rich Dad Poor Dad', author:'Robert Kiyosaki', emoji:'💰', color:'#16A34A', bg:'#001a06' },
  { title:'1984', author:'George Orwell', emoji:'👁️', color:'#DC2626', bg:'#1a0000' },
  { title:'Sapiens', author:'Yuval Noah Harari', emoji:'🦴', color:'#7C3AED', bg:'#0d0020' },
  { title:'Harry Potter', author:'J.K. Rowling', emoji:'⚡', color:'#B45309', bg:'#1a0f00' },
  { title:'Think & Grow Rich', author:'Napoleon Hill', emoji:'🧠', color:'#0891B2', bg:'#00101a' },
  { title:'The 48 Laws', author:'Robert Greene', emoji:'♟️', color:'#6D28D9', bg:'#0a001a' },
  { title:'Dune', author:'Frank Herbert', emoji:'🏜️', color:'#D97706', bg:'#1a1000' },
  { title:'To Kill a Mockingbird', author:'Harper Lee', emoji:'🐦', color:'#059669', bg:'#00150a' },
  { title:'The Great Gatsby', author:'F. Scott Fitzgerald', emoji:'🥂', color:'#B45309', bg:'#1a0e00' },
  { title:'Ikigai', author:'Héctor García', emoji:'🌸', color:'#DB2777', bg:'#1a0010' },
];

const CATEGORIES = [
  { label:'Textbooks', emoji:'🎓', from:'#3B82F6', to:'#4F46E5', genre:'Textbook' },
  { label:'Fiction',   emoji:'📖', from:'#8B5CF6', to:'#7C3AED', genre:'Fiction' },
  { label:'Self-Help', emoji:'💡', from:'#F59E0B', to:'#D97706', genre:'Self-Help' },
  { label:'Children',  emoji:'🧸', from:'#EC4899', to:'#DB2777', genre:'Children' },
  { label:'Sci-Fi',    emoji:'🚀', from:'#06B6D4', to:'#0891B2', genre:'Sci-Fi' },
  { label:'Biography', emoji:'🏛️', from:'#10B981', to:'#059669', genre:'Biography' },
];

const HERO_SLIDES = [
  {
    tag:'Pakistan\'s Book Marketplace',
    heading:'Refresh Your Shelf.\nFind Hidden Gems.',
    sub:'The sustainable way to love books — buy and sell pre-loved books across Pakistan.',
    cta:'Browse Books', cta2:'Sell a Book',
    accent:'#D4A017', bg:'linear-gradient(135deg,#0f1923 0%,#1a2e1a 100%)',
    emoji:['📚','📖','✍️','🔖','📝'],
  },
  {
    tag:'For Students',
    heading:'Study Smarter,\nNot Harder.',
    sub:'Affordable textbooks at a fraction of the original price. Save money, learn more.',
    cta:'Browse Textbooks', cta2:'List Yours',
    accent:'#F97316', bg:'linear-gradient(135deg,#0f1923 0%,#1a1a2e 100%)',
    emoji:['🎓','📐','📏','🔬','📊'],
  },
  {
    tag:'Got Old Books?',
    heading:'Declutter & Earn.\nSell Today.',
    sub:'Turn your old books into PKR. List in 60 seconds. Seller keeps 80% of every sale.',
    cta:'Start Selling', cta2:'See How It Works',
    accent:'#10B981', bg:'linear-gradient(135deg,#0f1923 0%,#1a2818 100%)',
    emoji:['💰','🏷️','📦','✅','🎯'],
  },
];

export default function App() {
  const [books, setBooks]       = useState(() => load('bl_books',[]));
  const [orders, setOrders]     = useState(() => load('bl_orders',[]));
  const [wallet, setWallet]     = useState(() => load('bl_wallet',{balance:0,transactions:[]}));
  const [subscribers, setSubs]  = useState(() => load('bl_subs',[]));
  const [view, setView]         = useState('home');
  const [searchQuery, setSearch]= useState('');
  const [selGenre, setGenre]    = useState('All');
  const [selCond, setCond]      = useState('All');
  const [sortBy, setSortBy]     = useState('newest');
  const [toasts, setToasts]     = useState([]);
  const [subEmail, setSubEmail] = useState('');
  const [confetti, setConfetti] = useState([]);
  const [heroSlide, setHeroSlide] = useState(0);
  const [bookCarouselIdx, setBookCarouselIdx] = useState(0);
  const [visibleCards, setVisibleCards] = useState(new Set());
  const heroTimer = useRef(null);
  const carouselTimer = useRef(null);
  const observerRef = useRef(null);

  // Checkout
  const [cbk,setCbk]=useState(null);
  const [cStep,setCStep]=useState(1);
  const [bName,setBName]=useState('');
  const [bAddr,setBAddr]=useState('');
  const [bPhone,setBPhone]=useState('');
  const [payM,setPayM]=useState('EasyPaisa');
  const [placed,setPlaced]=useState(null);

  // Sell
  const [sTitle,setSTitle]=useState('');
  const [sAuth,setSAuth]=useState('');
  const [sGenre,setSGenre]=useState('Fiction');
  const [sCond,setSCond]=useState('Good');
  const [sPrice,setSPrice]=useState('');
  const [sPhone,setSPhone]=useState('');
  const [sCity,setSCity]=useState('');
  const [sDesc,setSDesc]=useState('');
  const [sCover,setSCover]=useState(null);

  // Wallet
  const [wAmt,setWAmt]=useState('');
  const [wMeth,setWMeth]=useState('EasyPaisa');
  const [wAcc,setWAcc]=useState('');

  useEffect(()=>save('bl_books',books),[books]);
  useEffect(()=>save('bl_orders',orders),[orders]);
  useEffect(()=>save('bl_wallet',wallet),[wallet]);
  useEffect(()=>save('bl_subs',subscribers),[subscribers]);

  // Hero auto-slide
  useEffect(()=>{
    heroTimer.current=setInterval(()=>setHeroSlide(p=>(p+1)%HERO_SLIDES.length),4500);
    return()=>clearInterval(heroTimer.current);
  },[]);

  // Famous books carousel
  useEffect(()=>{
    carouselTimer.current=setInterval(()=>setBookCarouselIdx(p=>(p+1)%(FAMOUS_BOOKS.length-3)),2500);
    return()=>clearInterval(carouselTimer.current);
  },[]);

  // Intersection observer for scroll animations
  useEffect(()=>{
    observerRef.current=new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting) setVisibleCards(p=>new Set([...p,e.target.dataset.id]));
      });
    },{threshold:0.1});
    document.querySelectorAll('[data-id]').forEach(el=>observerRef.current.observe(el));
    return()=>observerRef.current?.disconnect();
  },[view,books]);

  const toast=(text,type='success')=>{
    const id=Date.now();
    setToasts(p=>[...p,{id,text,type}]);
    setTimeout(()=>setToasts(p=>p.filter(n=>n.id!==id)),4000);
  };

  const boom=()=>{
    const cols=['#f59e0b','#3b82f6','#10b981','#ec4899','#8b5cf6','#f43f5e'];
    setConfetti(Array.from({length:60}).map((_,i)=>({id:i,x:Math.random()*100,size:Math.random()*7+4,color:cols[i%6],delay:Math.random()*0.8,dur:Math.random()*2+1.5})));
    setTimeout(()=>setConfetti([]),4000);
  };

  const calc=p=>({commission:Math.round(p*COMMISSION_RATE),sellerNet:Math.round(p*0.8)});

  const listBook=(e)=>{
    e.preventDefault();
    const price=parseInt(sPrice);
    if(!sTitle.trim()||!sAuth.trim()||!price||!sPhone.trim()){toast('Fill Title, Author, Price & WhatsApp.','warning');return;}
    if(price<50){toast('Min price is PKR 50.','warning');return;}
    const book={id:`bk-${Date.now()}`,title:sTitle,author:sAuth,genre:sGenre,condition:sCond,price,phone:sPhone,city:sCity,description:sDesc||'A pre-loved book looking for a new home.',coverImage:sCover,listedAt:new Date().toLocaleDateString('en-PK'),listedTs:Date.now(),status:'available',views:0};
    setBooks(p=>[book,...p]);
    setSTitle('');setSAuth('');setSPrice('');setSPhone('');setSCity('');setSDesc('');setSCover(null);
    toast(`"${book.title}" listed! You'll receive ${pkr(calc(price).sellerNet)} on sale.`);
    boom();nav('home');
  };

  const openCheckout=(book)=>{
    setBooks(p=>p.map(b=>b.id===book.id?{...b,views:(b.views||0)+1}:b));
    setCbk(book);setCStep(1);setBName('');setBAddr('');setBPhone('');setPayM('EasyPaisa');setPlaced(null);setView('checkout');window.scrollTo(0,0);
  };

  const placeOrder=()=>{
    if(!bName.trim()||!bAddr.trim()||!bPhone.trim()){toast('Fill all delivery details.','warning');return;}
    const order={id:'BL-'+Math.floor(10000+Math.random()*90000),bookId:cbk.id,bookTitle:cbk.title,bookAuthor:cbk.author,bookPhone:cbk.phone,price:cbk.price,buyerName:bName,buyerAddress:bAddr,buyerPhone:bPhone,payMethod:payM,status:'Processing',fundsStatus:'held',date:new Date().toLocaleDateString('en-PK'),timeline:[{label:'Placed',done:true},{label:'Contacted',done:false},{label:'Shipped',done:false},{label:'Delivered',done:false}]};
    setOrders(p=>[order,...p]);
    setBooks(p=>p.map(b=>b.id===cbk.id?{...b,status:'sold'}:b));
    setWallet(p=>({...p,transactions:[{id:Date.now(),type:'debit',label:`Payment held — "${cbk.title}"`,amount:cbk.price,status:'held',date:new Date().toLocaleDateString('en-PK')},...p.transactions]}));
    setPlaced(order);boom();
    toast('✅ Order placed! Seller will WhatsApp you.');
  };

  const confirmDelivery=(oid)=>{
    const o=orders.find(x=>x.id===oid);if(!o)return;
    const {commission,sellerNet}=calc(o.price);
    setOrders(p=>p.map(x=>x.id===oid?{...x,status:'Delivered',fundsStatus:'released',timeline:x.timeline.map(t=>({...t,done:true}))}:x));
    setWallet(p=>({balance:p.balance+commission,transactions:[
      {id:Date.now(),type:'credit',label:`Commission — "${o.bookTitle}"`,amount:commission,status:'released',date:new Date().toLocaleDateString('en-PK')},
      {id:Date.now()-1,type:'credit',label:`Seller payout — "${o.bookTitle}"`,amount:sellerNet,status:'released',date:new Date().toLocaleDateString('en-PK')},
      ...p.transactions
    ]}));
    boom();toast(`✅ Delivered! You earned ${pkr(commission)} commission.`);
  };

  const doWithdraw=(e)=>{
    e.preventDefault();
    const amt=parseInt(wAmt);
    if(!amt||amt<=0){toast('Enter valid amount.','warning');return;}
    if(amt>wallet.balance){toast('Insufficient balance.','warning');return;}
    if(!wAcc.trim()){toast('Enter account details.','warning');return;}
    setWallet(p=>({balance:p.balance-amt,transactions:[{id:Date.now(),type:'debit',label:`Withdrawal via ${wMeth} → ${wAcc}`,amount:amt,status:'pending',date:new Date().toLocaleDateString('en-PK')},...p.transactions]}));
    setWAmt('');setWAcc('');
    toast(`Withdrawal of ${pkr(amt)} initiated!`);
  };

  const doSubscribe=(e)=>{
    e.preventDefault();
    if(!subEmail.trim()||!subEmail.includes('@')){toast('Enter valid email.','warning');return;}
    if(subscribers.includes(subEmail)){toast('Already subscribed!','warning');return;}
    setSubs(p=>[...p,subEmail]);
    toast(`✉️ Subscribed! Alerts will go to ${subEmail}.`);
    setSubEmail('');boom();
  };

  const filteredBooks=useMemo(()=>{
    let b=books.filter(bk=>{
      if(bk.status==='sold')return false;
      const q=searchQuery.toLowerCase();
      return(bk.title.toLowerCase().includes(q)||bk.author.toLowerCase().includes(q))&&
        (selGenre==='All'||bk.genre===selGenre)&&(selCond==='All'||bk.condition===selCond);
    });
    if(sortBy==='price_low')b=[...b].sort((a,c)=>a.price-c.price);
    else if(sortBy==='price_high')b=[...b].sort((a,c)=>c.price-a.price);
    else if(sortBy==='popular')b=[...b].sort((a,c)=>(c.views||0)-(a.views||0));
    else b=[...b].sort((a,c)=>(c.listedTs||0)-(a.listedTs||0));
    return b;
  },[books,searchQuery,selGenre,selCond,sortBy]);

  const nav=(v)=>{setView(v);setPlaced(null);window.scrollTo(0,0);};

  const slide=HERO_SLIDES[heroSlide];

  const BookCard=({book,idx=0})=>{
    const {sellerNet}=calc(book.price);
    const condColor=book.condition==='Like New'?'#16A34A':book.condition==='Good'?'#D97706':'#6B7280';
    return(
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden flex flex-col group cursor-pointer"
        style={{boxShadow:'0 2px 8px rgba(0,0,0,0.06)',transition:'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',transform:'translateY(0)'}}
        onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-6px)';e.currentTarget.style.boxShadow='0 20px 40px rgba(0,0,0,0.15)';}}
        onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.06)';}}>
        <div className="relative bg-stone-100 overflow-hidden" style={{aspectRatio:'3/4'}}>
          {book.coverImage
            ?<img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" style={{transition:'transform 0.4s ease'}}
               onMouseEnter={e=>e.target.style.transform='scale(1.08)'}
               onMouseLeave={e=>e.target.style.transform='scale(1)'}/>
            :<div className="w-full h-full flex items-center justify-center text-5xl" style={{background:'linear-gradient(135deg,#fef3c7,#fde68a)'}}>📖</div>
          }
          <span className="absolute top-2 left-2 text-white text-[9px] font-bold px-2 py-1 rounded-full" style={{background:condColor}}>{book.condition}</span>
          {book.city&&<div className="absolute bottom-0 left-0 right-0 py-2 px-2" style={{background:'linear-gradient(to top,rgba(0,0,0,0.7),transparent)'}}><p className="text-white text-[9px] font-bold truncate">📍 {book.city}</p></div>}
          {/* Hover overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{background:'rgba(0,0,0,0.35)'}}>
            <button onClick={()=>openCheckout(book)} className="text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xl transform scale-90 group-hover:scale-100 transition-transform duration-200" style={{background:'#D97706'}}>
              Buy Now
            </button>
          </div>
        </div>
        <div className="p-3 flex flex-col flex-1 justify-between">
          <div>
            <p className="font-extrabold text-slate-900 text-xs leading-tight line-clamp-2">{book.title}</p>
            <p className="text-[10px] text-slate-500 mt-0.5 truncate">by {book.author}</p>
            <div className="flex mt-1">{'★★★★★'.split('').map((s,i)=><span key={i} className="text-amber-400 text-[10px]">{s}</span>)}</div>
          </div>
          <div className="mt-2.5 flex items-end justify-between gap-1">
            <div>
              <p className="font-extrabold text-sm leading-none" style={{color:'#92400E'}}>{pkr(book.price)}</p>
              <p className="text-[9px] text-slate-400 mt-0.5">Seller gets {pkr(sellerNet)}</p>
            </div>
            <button onClick={()=>openCheckout(book)} className="text-white font-extrabold text-xs px-3 py-2 rounded-xl transition-all active:scale-95 flex-shrink-0 shadow-sm" style={{background:'#D97706'}}>Buy</button>
          </div>
        </div>
      </div>
    );
  };

  return(
    <div className="min-h-screen text-slate-900 font-sans flex flex-col overflow-x-hidden" style={{background:'#FAFAF7',paddingBottom:'72px'}}>

      <style>{`
        @keyframes fall{0%{top:-5%;transform:rotate(0deg)}100%{top:110%;transform:translateY(100vh) rotate(720deg)}}
        @keyframes fadeSlideUp{0%{opacity:0;transform:translateY(24px)}100%{opacity:1;transform:translateY(0)}}
        @keyframes floatBook{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-12px) rotate(3deg)}}
        @keyframes pulse-ring{0%{transform:scale(0.8);opacity:1}100%{transform:scale(2);opacity:0}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes slideInLeft{0%{opacity:0;transform:translateX(-30px)}100%{opacity:1;transform:translateX(0)}}
        @keyframes bounceIn{0%{transform:scale(0.3);opacity:0}50%{transform:scale(1.05)}70%{transform:scale(0.9)}100%{transform:scale(1);opacity:1}}
        @keyframes spin-slow{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
        @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        .fade-slide-up{animation:fadeSlideUp 0.6s ease forwards}
        .float-book{animation:floatBook 3s ease-in-out infinite}
        .shimmer-bg{background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);background-size:200% 100%;animation:shimmer 1.5s infinite}
        .marquee-inner{animation:marquee 30s linear infinite}
        .marquee-inner:hover{animation-play-state:paused}
      `}</style>

      {/* Confetti */}
      {confetti.length>0&&(
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {confetti.map(p=><div key={p.id} className="absolute rounded" style={{left:`${p.x}%`,top:'-5%',width:`${p.size}px`,height:`${p.size*1.5}px`,backgroundColor:p.color,animation:`fall ${p.dur}s linear ${p.delay}s infinite`}}/>)}
        </div>
      )}

      {/* Toasts */}
      <div className="fixed bottom-20 left-3 right-3 sm:bottom-6 sm:left-auto sm:right-5 sm:max-w-sm z-50 space-y-2 pointer-events-none">
        {toasts.map(n=>(
          <div key={n.id} className={`p-4 rounded-2xl shadow-2xl flex items-start gap-3 pointer-events-auto ${n.type==='success'?'bg-emerald-900 border border-emerald-700 text-emerald-100':n.type==='warning'?'bg-amber-900 border border-amber-700 text-amber-100':'bg-slate-900 border border-slate-700 text-slate-100'}`}
            style={{animation:'bounceIn 0.4s ease forwards'}}>
            <span className="text-lg flex-shrink-0">{n.type==='success'?'✨':n.type==='warning'?'⚠️':'ℹ️'}</span>
            <p className="text-sm font-semibold leading-snug">{n.text}</p>
          </div>
        ))}
      </div>

      {/* ══ HEADER ══ */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200" style={{boxShadow:'0 2px 12px rgba(0,0,0,0.07)'}}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          {/* CSS Logo */}
          <button onClick={()=>nav('home')} className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="relative w-10 h-10 flex-shrink-0">
              <div className="absolute inset-0 rounded-xl" style={{background:'linear-gradient(135deg,#1a3a2a,#2d6a4f)'}}/>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-black text-white" style={{fontFamily:'Georgia,serif',textShadow:'0 1px 3px rgba(0,0,0,0.3)'}}>B</span>
                <span className="text-base font-black" style={{color:'#D4A017',marginLeft:'-3px',fontFamily:'Georgia,serif'}}>L</span>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center" style={{background:'#D4A017'}}>
                <span className="text-[6px]">🌿</span>
              </div>
            </div>
            <div className="leading-none">
              <div className="flex items-baseline">
                <span className="text-base font-black tracking-tight" style={{color:'#1a3a2a'}}>Book</span>
                <span className="text-base font-black tracking-tight" style={{color:'#D4A017'}}>Loop</span>
              </div>
              <span className="text-[9px] font-bold tracking-widest uppercase block" style={{color:'#6B7280'}}>Pakistan's Book Market</span>
            </div>
          </button>

          {/* Search desktop */}
          <div className="hidden sm:flex flex-1 max-w-md relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm">🔍</span>
            <input type="text" placeholder="Search books, authors..." value={searchQuery} onChange={e=>{setSearch(e.target.value);if(view!=='home')nav('home');}}
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none text-sm transition-all"/>
          </div>

          {/* Wallet */}
          <button onClick={()=>nav('wallet')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border active:scale-95 transition-all flex-shrink-0" style={{background:'#FFFBEB',color:'#92400E',borderColor:'#FDE68A'}}>
            <span>💰</span><span className="hidden sm:inline">{pkr(wallet.balance)}</span><span className="sm:hidden">{wallet.balance>0?pkr(wallet.balance):'Wallet'}</span>
          </button>
        </div>
      </header>

      <main className="flex-1">

        {/* ══════════════════════ HOME ══════════════════════ */}
        {view==='home'&&(
          <div>

            {/* ── HERO CAROUSEL ── */}
            <section className="relative overflow-hidden" style={{background:slide.bg,minHeight:'320px',transition:'background 0.8s ease'}}>
              {/* Floating book emojis background */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {slide.emoji.map((e,i)=>(
                  <div key={i} className="absolute text-4xl opacity-10 float-book" style={{
                    left:`${10+i*18}%`,top:`${20+i*10}%`,
                    animationDelay:`${i*0.6}s`,animationDuration:`${3+i*0.5}s`
                  }}>{e}</div>
                ))}
                {/* Glowing orb */}
                <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full opacity-20" style={{background:slide.accent,filter:'blur(80px)'}}/>
                <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full opacity-10" style={{background:slide.accent,filter:'blur(60px)'}}/>
              </div>

              <div className="relative max-w-7xl mx-auto px-4 py-10 sm:py-14">
                <div key={heroSlide} style={{animation:'fadeSlideUp 0.6s ease forwards'}}>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full mb-4" style={{background:'rgba(255,255,255,0.1)',color:slide.accent,border:`1px solid ${slide.accent}40`}}>
                    🌟 {slide.tag}
                  </span>
                  <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight mb-3 whitespace-pre-line" style={{color:'#FAF7F2'}}>
                    {slide.heading.split('\n').map((line,i)=>(
                      <span key={i}>{i===0?line:<><br/><span style={{color:slide.accent}}>{line}</span></>}</span>
                    ))}
                  </h1>
                  <p className="text-sm sm:text-base mb-7 max-w-lg" style={{color:'#C9B89A'}}>{slide.sub}</p>
                  <div className="flex flex-col sm:flex-row gap-3 max-w-xs sm:max-w-none">
                    <button onClick={()=>{if(slide.cta.includes('Sell')||slide.cta.includes('Start'))nav('sell');else document.getElementById('browse')?.scrollIntoView({behavior:'smooth'});}}
                      className="px-7 py-3.5 font-extrabold rounded-2xl text-sm text-white active:scale-95 transition-all shadow-lg" style={{background:`linear-gradient(135deg,${slide.accent},${slide.accent}bb)`}}>
                      {slide.cta}
                    </button>
                    <button onClick={()=>nav('sell')} className="px-7 py-3.5 font-bold rounded-2xl text-sm active:scale-95 transition-all" style={{background:'rgba(255,255,255,0.08)',color:'#FAF7F2',border:'1px solid rgba(255,255,255,0.2)'}}>
                      {slide.cta2}
                    </button>
                  </div>
                </div>

                {/* Slide dots */}
                <div className="flex gap-2 mt-8">
                  {HERO_SLIDES.map((_,i)=>(
                    <button key={i} onClick={()=>{setHeroSlide(i);clearInterval(heroTimer.current);heroTimer.current=setInterval(()=>setHeroSlide(p=>(p+1)%HERO_SLIDES.length),4500);}}
                      className="rounded-full transition-all duration-300" style={{width:i===heroSlide?'24px':'8px',height:'8px',background:i===heroSlide?slide.accent:'rgba(255,255,255,0.3)'}}/>
                  ))}
                </div>
              </div>
            </section>

            {/* ── MARQUEE TRUST BAR ── */}
            <div className="overflow-hidden py-3 border-y border-amber-200" style={{background:'#FFFBEB'}}>
              <div className="flex marquee-inner whitespace-nowrap" style={{width:'200%'}}>
                {[...Array(2)].map((_,rep)=>(
                  <div key={rep} className="flex gap-8 px-4">
                    {['🔒 Escrow Protected','⭐ Verified Listings','📱 WhatsApp Delivery','💸 Instant PKR Payouts','📦 Buyer Protection','✅ Free to List','🌱 Eco Friendly','🏅 Trusted Marketplace'].map(item=>(
                      <span key={item} className="text-xs font-bold flex-shrink-0" style={{color:'#92400E'}}>{item}</span>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* ── CATEGORIES ── */}
            <section className="max-w-7xl mx-auto px-4 pt-8 pb-4">
              <h2 className="text-xl font-extrabold text-slate-900 mb-4">Browse by Category</h2>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {CATEGORIES.map((cat,i)=>(
                  <button key={cat.label} onClick={()=>{setGenre(cat.genre);document.getElementById('browse')?.scrollIntoView({behavior:'smooth'});}}
                    className="rounded-2xl p-4 flex flex-col items-center gap-2 text-white shadow-md active:scale-95 transition-all duration-200 relative overflow-hidden group"
                    style={{background:`linear-gradient(135deg,${cat.from},${cat.to})`,animationDelay:`${i*0.1}s`}}
                    data-id={`cat-${i}`}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity" style={{background:'white'}}/>
                    <span className="text-3xl transform group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300">{cat.emoji}</span>
                    <span className="text-xs font-extrabold">{cat.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* ── FAMOUS BOOKS CAROUSEL ── */}
            <section className="max-w-7xl mx-auto px-4 py-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">📚 Popular on BookLoop</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Looking for these? Someone might be selling them.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>setBookCarouselIdx(p=>Math.max(0,p-1))} className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-sm text-stone-500 hover:bg-stone-100 active:scale-95 transition-all">←</button>
                  <button onClick={()=>setBookCarouselIdx(p=>Math.min(FAMOUS_BOOKS.length-4,p+1))} className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-sm text-stone-500 hover:bg-stone-100 active:scale-95 transition-all">→</button>
                </div>
              </div>
              <div className="overflow-hidden">
                <div className="flex gap-3 transition-transform duration-500 ease-in-out" style={{transform:`translateX(calc(-${bookCarouselIdx * (100/4)}% - ${bookCarouselIdx*12}px))`}}>
                  {FAMOUS_BOOKS.map((book,i)=>(
                    <div key={i} className="flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer group active:scale-95 transition-all duration-200 relative"
                      style={{width:'calc(25% - 9px)',minWidth:'140px',background:book.bg,border:`1px solid ${book.color}30`}}
                      onClick={()=>{ setSearch(book.title); document.getElementById('browse')?.scrollIntoView({behavior:'smooth'}); }}>
                      <div className="p-4 pb-3">
                        <div className="text-4xl mb-3 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">{book.emoji}</div>
                        <p className="font-extrabold text-sm leading-tight line-clamp-2" style={{color:book.color}}>{book.title}</p>
                        <p className="text-[10px] mt-1 opacity-60 text-white truncate">{book.author}</p>
                      </div>
                      <div className="px-4 py-2 text-[10px] font-bold" style={{background:`${book.color}20`,color:book.color}}>Search on BookLoop →</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── LISTED BOOKS ── */}
            <section id="browse" className="max-w-7xl mx-auto px-4 pb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-extrabold text-slate-900">All Books</h2>
                <span className="text-xs text-slate-400"><strong className="text-slate-700">{filteredBooks.length}</strong> available</span>
              </div>

              {/* Mobile search */}
              <div className="sm:hidden mb-3 relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">🔍</span>
                <input type="text" placeholder="Search..." value={searchQuery} onChange={e=>setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none text-sm"/>
              </div>

              <div className="bg-white rounded-2xl border border-stone-200 p-3 mb-4 shadow-sm space-y-3">
                <div className="overflow-x-auto pb-1" style={{scrollbarWidth:'none'}}>
                  <div className="flex gap-2" style={{width:'max-content'}}>
                    {GENRES.map(g=>(
                      <button key={g} onClick={()=>setGenre(g)} className="px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95" style={selGenre===g?{background:'#1C1208',color:'white'}:{background:'#F5F5F0',color:'#6B7280'}}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider">Condition:</span>
                  {CONDITIONS.map(c=>(
                    <button key={c} onClick={()=>setCond(c)} className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all" style={selCond===c?{background:'#FFFBEB',borderColor:'#F59E0B',color:'#92400E',fontWeight:'700'}:{borderColor:'#E7E5E4',color:'#6B7280'}}>
                      {c}
                    </button>
                  ))}
                  <select value={sortBy} onChange={e=>setSortBy(e.target.value)} className="ml-auto text-xs font-bold border border-stone-200 rounded-xl px-3 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-400">
                    <option value="newest">Newest</option>
                    <option value="price_low">Price ↑</option>
                    <option value="price_high">Price ↓</option>
                    <option value="popular">Popular</option>
                  </select>
                </div>
              </div>

              {filteredBooks.length===0?(
                <div className="bg-white rounded-2xl border border-stone-200 py-16 text-center" style={{animation:'fadeSlideUp 0.5s ease forwards'}}>
                  <div className="text-6xl mb-3 float-book">📭</div>
                  <h3 className="text-lg font-bold text-slate-700">No books found</h3>
                  <p className="text-slate-400 text-sm mt-1">{books.filter(b=>b.status==='available').length===0?'Be the first to list a book!':'Try different filters.'}</p>
                  <button onClick={()=>nav('sell')} className="mt-5 px-7 py-3.5 text-white font-bold rounded-2xl text-sm active:scale-95 transition-all" style={{background:'linear-gradient(135deg,#D97706,#EA580C)'}}>List a Book</button>
                </div>
              ):(
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredBooks.map((book,i)=><BookCard key={book.id} book={book} idx={i}/>)}
                </div>
              )}
            </section>

            {/* ── HOW IT WORKS ── */}
            <section className="px-4 py-10" style={{background:'linear-gradient(135deg,#1C1208,#2d1f0e)'}}>
              <div className="max-w-7xl mx-auto">
                <h2 className="text-xl font-extrabold text-center mb-8" style={{color:'#FAF7F2'}}>How BookLoop Works</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    {n:'1',icon:'📸',title:'List Your Book',sub:'Upload photo + set PKR price in 60 seconds'},
                    {n:'2',icon:'🛒',title:'Buyer Purchases',sub:'Funds held safely in escrow'},
                    {n:'3',icon:'📱',title:'WhatsApp Connect',sub:'Seller contacts buyer to arrange delivery'},
                    {n:'4',icon:'✅',title:'Confirm & Get Paid',sub:'Buyer confirms → 80% released to seller'},
                  ].map((s,i)=>(
                    <div key={i} className="text-center p-4 rounded-2xl" style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)'}}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl mx-auto mb-3" style={{background:'rgba(212,160,23,0.2)',border:'1px solid #D4A01740'}}>
                        {s.icon}
                      </div>
                      <p className="text-xs font-extrabold mb-1" style={{color:'#D4A017'}}>Step {s.n}</p>
                      <p className="text-sm font-bold mb-1" style={{color:'#FAF7F2'}}>{s.title}</p>
                      <p className="text-xs" style={{color:'#C9B89A'}}>{s.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── SUBSCRIBE ── */}
            <section className="max-w-7xl mx-auto px-4 py-8">
              <div className="rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-5 relative overflow-hidden" style={{background:'linear-gradient(135deg,#1C1208,#3D2B1A)'}}>
                <div className="absolute right-0 top-0 w-48 h-48 rounded-full opacity-10" style={{background:'#D4A017',filter:'blur(60px)',transform:'translate(30%,-30%)'}}/>
                <div className="flex-1 text-center sm:text-left relative z-10">
                  <p className="font-extrabold text-xl mb-1" style={{color:'#FAF7F2'}}>📬 Get Book Alerts</p>
                  <p className="text-sm" style={{color:'#C9B89A'}}>Be the first to know when new books are listed. Automated emails, no spam.</p>
                </div>
                <form onSubmit={doSubscribe} className="flex gap-2 w-full sm:w-auto relative z-10">
                  <input type="email" placeholder="your@email.com" value={subEmail} onChange={e=>setSubEmail(e.target.value)}
                    className="flex-1 sm:w-56 rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-400" style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)'}}/>
                  <button type="submit" className="px-5 py-3 font-bold text-sm rounded-xl flex-shrink-0 text-white active:scale-95 transition-all" style={{background:'#D97706'}}>Subscribe</button>
                </form>
              </div>
            </section>

          </div>
        )}

        {/* ══════════════════════ SELL ══════════════════════ */}
        {view==='sell'&&(
          <section className="max-w-lg mx-auto px-4 py-6" style={{animation:'fadeSlideUp 0.5s ease forwards'}}>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-1">List Your Book</h1>
            <p className="text-slate-500 text-sm mb-5">You keep <strong className="text-emerald-600">80%</strong> · Platform takes <strong className="text-rose-500">20%</strong></p>
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
              <form onSubmit={listBook} className="space-y-4">
                <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Book Title *</label>
                <input type="text" placeholder="The Alchemist" value={sTitle} onChange={e=>setSTitle(e.target.value)} className={inp}/></div>
                <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Author *</label>
                <input type="text" placeholder="Paulo Coelho" value={sAuth} onChange={e=>setSAuth(e.target.value)} className={inp}/></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Genre</label>
                  <select value={sGenre} onChange={e=>setSGenre(e.target.value)} className={inp}>{GENRES.slice(1).map(g=><option key={g}>{g}</option>)}</select></div>
                  <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Condition</label>
                  <select value={sCond} onChange={e=>setSCond(e.target.value)} className={inp}>{CONDITIONS.slice(1).map(c=><option key={c}>{c}</option>)}</select></div>
                </div>
                <div className="rounded-2xl p-4 border" style={{background:'#FFFBEB',borderColor:'#FDE68A'}}>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Asking Price (PKR) *</label>
                  <input type="number" inputMode="numeric" placeholder="500" value={sPrice} onChange={e=>setSPrice(e.target.value)} min="50" className={inp}/>
                  {sPrice&&parseInt(sPrice)>=50&&(()=>{const {commission,sellerNet}=calc(parseInt(sPrice));return(
                    <div className="mt-3 space-y-1.5 text-sm border-t pt-3" style={{borderColor:'#FDE68A'}}>
                      <div className="flex justify-between text-slate-600"><span>Platform (20%)</span><span className="font-bold text-rose-500">−{pkr(commission)}</span></div>
                      <div className="flex justify-between font-extrabold text-base"><span>You receive</span><span className="text-emerald-600">{pkr(sellerNet)}</span></div>
                    </div>
                  );})()}
                </div>
                <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">WhatsApp Number *</label>
                <input type="tel" inputMode="tel" placeholder="+92 300 1234567" value={sPhone} onChange={e=>setSPhone(e.target.value)} className={inp}/></div>
                <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">City / Area</label>
                <input type="text" placeholder="Lahore, DHA Phase 4" value={sCity} onChange={e=>setSCity(e.target.value)} className={inp}/></div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Book Cover Photo</label>
                  <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl py-7 px-4 cursor-pointer transition-all text-center ${sCover?'border-amber-400':'border-stone-300 bg-stone-50 hover:border-amber-400'}`} style={sCover?{background:'#FFFBEB'}:{}}>
                    {sCover?<><img src={sCover} alt="preview" className="h-32 object-contain rounded-xl mb-2"/><span className="text-sm font-bold" style={{color:'#B45309'}}>Tap to change</span></>
                      :<><span className="text-5xl mb-2">📷</span><span className="text-base font-bold text-slate-600">Tap to upload photo</span><span className="text-sm text-slate-400 mt-1">JPG, PNG — max 2MB</span></>}
                    <input type="file" accept="image/*" className="hidden" onChange={e=>{const f=e.target.files[0];if(!f)return;if(f.size>2*1024*1024){toast('Max 2MB.','warning');return;}const r=new FileReader();r.onload=ev=>setSCover(ev.target.result);r.readAsDataURL(f);}}/>
                  </label>
                  {sCover&&<button type="button" onClick={()=>setSCover(null)} className="mt-1.5 text-sm text-red-500 font-bold">Remove</button>}
                </div>
                <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Description</label>
                <textarea rows={3} placeholder="Condition notes, edition, etc." value={sDesc} onChange={e=>setSDesc(e.target.value)} className={inp+' resize-none'}/></div>
                <button type="submit" className="w-full py-4 text-white font-extrabold rounded-2xl shadow-md text-base uppercase tracking-wide active:scale-95 transition-all" style={{background:'linear-gradient(135deg,#D97706,#EA580C)'}}>
                  🚀 Publish Listing
                </button>
              </form>
            </div>
          </section>
        )}

        {/* ══════════════════════ CHECKOUT ══════════════════════ */}
        {view==='checkout'&&(
          <section className="max-w-lg mx-auto px-4 py-6" style={{animation:'fadeSlideUp 0.5s ease forwards'}}>
            {placed?(
              <div className="bg-white rounded-2xl border border-emerald-200 p-6 text-center shadow-xl space-y-5">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-4xl" style={{animation:'bounceIn 0.6s ease forwards'}}>✓</div>
                <h3 className="text-2xl font-extrabold text-slate-900">Order Placed!</h3>
                <p className="text-slate-400 text-sm">#{placed.id}</p>
                <div className="bg-slate-50 rounded-2xl p-4 text-left space-y-3">
                  {[['Book',placed.bookTitle],['Amount',pkr(placed.price)],['Deliver to',placed.buyerAddress],['Payment',placed.payMethod]].map(([k,v])=>(
                    <div key={k} className="flex justify-between gap-4"><span className="text-slate-400 text-sm flex-shrink-0">{k}</span><span className="font-bold text-sm text-right break-words max-w-[65%]">{v}</span></div>
                  ))}
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-800 text-left">📱 Seller will WhatsApp you on <strong>{placed.buyerPhone}</strong>. After receiving, go to <strong>Orders → Confirm Delivery</strong>.</div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={()=>nav('home')} className="py-4 text-white font-bold rounded-2xl text-sm active:scale-95 transition-all" style={{background:'#D97706'}}>Browse More</button>
                  <button onClick={()=>nav('orders')} className="py-4 bg-slate-100 text-slate-800 font-bold rounded-2xl text-sm active:scale-95 transition-all">My Orders</button>
                </div>
              </div>
            ):cbk?(
              <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xl">
                <h2 className="text-xl font-extrabold text-slate-900 mb-0.5">Checkout</h2>
                <p className="text-slate-500 text-sm mb-5 truncate">Buying: <strong>{cbk.title}</strong></p>
                <div className="flex mb-6">
                  {['Delivery','Payment','Confirm'].map((s,i)=>(
                    <div key={s} className="flex-1 text-center text-xs pb-2.5 border-b-2 font-bold transition-all" style={{borderColor:cStep===i+1?'#D97706':cStep>i+1?'#16A34A':'#E7E5E4',color:cStep===i+1?'#B45309':cStep>i+1?'#16A34A':'#9CA3AF'}}>
                      {cStep>i+1?'✓ ':''}{s}
                    </div>
                  ))}
                </div>
                {cStep===1&&(
                  <div className="space-y-4" style={{animation:'fadeSlideUp 0.4s ease forwards'}}>
                    <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Full Name *</label>
                    <input type="text" placeholder="Muhammad Ali" value={bName} onChange={e=>setBName(e.target.value)} className={inp}/></div>
                    <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Delivery Address *</label>
                    <textarea rows={3} placeholder="House No, Street, Block, Area, City" value={bAddr} onChange={e=>setBAddr(e.target.value)} className={inp+' resize-none'}/></div>
                    <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">WhatsApp Number *</label>
                    <input type="tel" inputMode="tel" placeholder="+92 300 1234567" value={bPhone} onChange={e=>setBPhone(e.target.value)} className={inp}/></div>
                    <button onClick={()=>{if(!bName.trim()||!bAddr.trim()||!bPhone.trim()){toast('Fill all fields.','warning');return;}setCStep(2);}} className="w-full py-4 text-white font-extrabold rounded-2xl text-base active:scale-95 transition-all" style={{background:'#D97706'}}>Continue →</button>
                  </div>
                )}
                {cStep===2&&(
                  <div className="space-y-4" style={{animation:'fadeSlideUp 0.4s ease forwards'}}>
                    <p className="text-sm text-slate-500 font-medium">How will you pay?</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[['EasyPaisa','📱'],['JazzCash','💚'],['Bank Transfer','🏦']].map(([m,i])=>(
                        <button key={m} onClick={()=>setPayM(m)} className="border-2 rounded-2xl p-4 text-xs font-bold text-center transition-all active:scale-95" style={payM===m?{borderColor:'#D97706',background:'#FFFBEB',color:'#92400E'}:{borderColor:'#E7E5E4',color:'#6B7280'}}>
                          <div className="text-3xl mb-1.5">{i}</div>{m}
                        </button>
                      ))}
                    </div>
                    <div className="bg-stone-50 rounded-2xl p-4 space-y-2.5">
                      {[['Book price',pkr(cbk.price)],['Platform fee (incl.)',pkr(calc(cbk.price).commission)]].map(([k,v])=>(
                        <div key={k} className="flex justify-between text-sm text-slate-500"><span>{k}</span><span className="font-bold text-slate-800">{v}</span></div>
                      ))}
                      <div className="flex justify-between font-extrabold border-t border-stone-200 pt-2.5 text-lg"><span>Total</span><span style={{color:'#92400E'}}>{pkr(cbk.price)}</span></div>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-sm text-emerald-800">🔒 Funds held in escrow until you confirm delivery.</div>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={()=>setCStep(1)} className="py-4 bg-stone-100 text-slate-700 font-bold rounded-2xl text-sm active:scale-95 transition-all">← Back</button>
                      <button onClick={()=>setCStep(3)} className="py-4 text-white font-extrabold rounded-2xl text-sm active:scale-95 transition-all" style={{background:'#D97706'}}>Review →</button>
                    </div>
                  </div>
                )}
                {cStep===3&&(
                  <div className="space-y-4" style={{animation:'fadeSlideUp 0.4s ease forwards'}}>
                    <div className="bg-stone-50 rounded-2xl p-4 space-y-2.5">
                      {[['Book',cbk.title],['Name',bName],['Address',bAddr],['Contact',bPhone],['Payment',payM]].map(([k,v])=>(
                        <div key={k} className="flex justify-between gap-4 text-sm"><span className="text-slate-400 flex-shrink-0">{k}</span><span className="font-bold text-right break-words max-w-[65%]">{v}</span></div>
                      ))}
                      <div className="flex justify-between font-extrabold border-t border-stone-200 pt-2.5 text-lg"><span>Total</span><span style={{color:'#92400E'}}>{pkr(cbk.price)}</span></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={()=>setCStep(2)} className="py-4 bg-stone-100 text-slate-700 font-bold rounded-2xl text-sm active:scale-95 transition-all">← Back</button>
                      <button onClick={placeOrder} className="py-4 text-white font-extrabold rounded-2xl text-sm active:scale-95 transition-all" style={{background:'linear-gradient(135deg,#D97706,#EA580C)'}}>Confirm & Pay ✓</button>
                    </div>
                  </div>
                )}
              </div>
            ):(
              <div className="text-center py-20">
                <div className="text-6xl mb-4 float-book">🛒</div>
                <h3 className="text-lg font-bold">No book selected</h3>
                <button onClick={()=>nav('home')} className="mt-5 px-7 py-3.5 text-white font-bold rounded-2xl text-sm active:scale-95 transition-all" style={{background:'#D97706'}}>Browse Books</button>
              </div>
            )}
          </section>
        )}

        {/* ══════════════════════ ORDERS ══════════════════════ */}
        {view==='orders'&&(
          <section className="max-w-2xl mx-auto px-4 py-6" style={{animation:'fadeSlideUp 0.5s ease forwards'}}>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-5">My Orders</h1>
            {orders.length===0?(
              <div className="bg-white rounded-2xl border border-stone-200 py-16 text-center">
                <div className="text-6xl mb-3 float-book">📦</div>
                <h3 className="text-lg font-bold">No orders yet</h3>
                <button onClick={()=>nav('home')} className="mt-5 px-7 py-3.5 text-white font-bold rounded-2xl text-sm active:scale-95 transition-all" style={{background:'#D97706'}}>Browse Books</button>
              </div>
            ):(
              <div className="space-y-4">
                {orders.map(order=>{
                  const {commission}=calc(order.price);
                  const statusStyle=order.status==='Delivered'?{bg:'#ECFDF5',color:'#065F46'}:order.status==='Processing'?{bg:'#FFFBEB',color:'#92400E'}:{bg:'#EFF6FF',color:'#1E40AF'};
                  const tl=order.timeline||[{label:'Placed',done:true},{label:'Contacted',done:false},{label:'Shipped',done:false},{label:'Delivered',done:false}];
                  return(
                    <div key={order.id} className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5" style={{boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="min-w-0 flex-1 mr-3">
                          <p className="text-[10px] text-slate-400">#{order.id} · {order.date}</p>
                          <h3 className="font-extrabold text-slate-900 text-base leading-tight truncate">{order.bookTitle}</h3>
                          <p className="text-xs text-slate-500">{order.bookAuthor}</p>
                        </div>
                        <span className="text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0" style={{background:statusStyle.bg,color:statusStyle.color}}>{order.status}</span>
                      </div>
                      {/* Timeline */}
                      <div className="mb-4 relative px-2">
                        <div className="absolute top-3 left-6 right-6 h-0.5" style={{background:'#E7E5E4'}}/>
                        <div className="absolute top-3 left-6 h-0.5 transition-all duration-700" style={{background:'#16A34A',right:`${(1-tl.filter(t=>t.done).length/tl.length)*80+10}%`}}/>
                        <div className="flex justify-between relative">
                          {tl.map((t,i)=>(
                            <div key={i} className="flex flex-col items-center gap-1 z-10">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300" style={t.done?{background:'#16A34A',borderColor:'#16A34A',color:'white'}:{background:'white',borderColor:'#E7E5E4',color:'#9CA3AF'}}>
                                {t.done?'✓':i+1}
                              </div>
                              <p className="text-[8px] font-bold text-center leading-tight" style={{color:t.done?'#16A34A':'#9CA3AF'}}>{t.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-stone-50 rounded-xl p-3 text-sm space-y-1.5 mb-3">
                        {[['Amount',pkr(order.price)],['Address',order.buyerAddress],['Payment',order.payMethod],['Seller',order.bookPhone]].map(([k,v])=>(
                          <div key={k} className="flex justify-between gap-3"><span className="text-slate-400 flex-shrink-0">{k}</span><span className="font-bold text-right break-words max-w-[60%]">{v}</span></div>
                        ))}
                        <div className="flex justify-between border-t border-stone-200 pt-1.5"><span className="text-slate-400">Your commission</span><span className="font-bold text-emerald-600">{pkr(commission)}</span></div>
                      </div>
                      <div className="flex gap-2">
                        {order.status==='Processing'&&<button onClick={()=>confirmDelivery(order.id)} className="flex-1 py-3.5 text-white font-bold rounded-xl text-sm active:scale-95 transition-all" style={{background:'#16A34A'}}>✓ Confirm Delivery</button>}
                        <a href={`https://wa.me/${order.bookPhone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="px-4 py-3.5 font-bold rounded-xl text-sm text-center active:scale-95 transition-all" style={{background:'#F5F5F0',color:'#374151'}}>💬 WhatsApp</a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ══════════════════════ WALLET ══════════════════════ */}
        {view==='wallet'&&(
          <section className="max-w-2xl mx-auto px-4 py-6 space-y-4" style={{animation:'fadeSlideUp 0.5s ease forwards'}}>
            <div className="rounded-2xl p-6 text-white relative overflow-hidden" style={{background:'linear-gradient(135deg,#1C1208,#3D2B1A)'}}>
              <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full opacity-20" style={{background:'#D4A017',filter:'blur(40px)'}}/>
              <p className="text-xs uppercase font-bold tracking-wider mb-2 relative z-10" style={{color:'#C9B89A'}}>Your BookLoop Wallet</p>
              <p className="text-5xl font-black relative z-10" style={{color:'#FCD34D'}}>{pkr(wallet.balance)}</p>
              <p className="text-sm mt-1 relative z-10" style={{color:'#C9B89A'}}>Available · Withdraw anytime</p>
            </div>
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <h3 className="font-extrabold text-slate-900 text-lg mb-4">Withdraw Funds</h3>
              {wallet.balance===0?<p className="text-slate-400 text-sm">No balance yet. Earn commission when buyers confirm delivery.</p>:(
                <form onSubmit={doWithdraw} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Amount (PKR)</label>
                    <input type="number" inputMode="numeric" placeholder="Enter amount" value={wAmt} onChange={e=>setWAmt(e.target.value)} max={wallet.balance} className={inp}/></div>
                    <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Method</label>
                    <select value={wMeth} onChange={e=>setWMeth(e.target.value)} className={inp}><option>EasyPaisa</option><option>JazzCash</option><option>Bank Transfer</option></select></div>
                  </div>
                  <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Mobile / IBAN</label>
                  <input type="text" inputMode="tel" placeholder="+92 300 1234567 or IBAN" value={wAcc} onChange={e=>setWAcc(e.target.value)} className={inp}/></div>
                  <button type="submit" className="w-full py-4 text-white font-extrabold rounded-2xl text-base active:scale-95 transition-all" style={{background:'linear-gradient(135deg,#D97706,#EA580C)'}}>Withdraw Funds</button>
                </form>
              )}
            </div>
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-stone-100"><h3 className="font-extrabold text-slate-900">Transaction History</h3></div>
              {wallet.transactions.length===0?<div className="py-10 text-center text-slate-400 text-sm">No transactions yet</div>:
                wallet.transactions.map(t=>(
                  <div key={t.id} className="flex items-center px-4 py-4 border-b border-stone-100 last:border-none gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0" style={t.type==='credit'?{background:'#ECFDF5',color:'#16A34A'}:t.status==='held'?{background:'#FFFBEB',color:'#D97706'}:{background:'#FEF2F2',color:'#DC2626'}}>
                      {t.type==='credit'?'↑':t.status==='held'?'⏳':'↓'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 leading-tight line-clamp-2">{t.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{t.date}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-extrabold text-base" style={{color:t.type==='credit'?'#16A34A':'#DC2626'}}>{t.type==='credit'?'+':'-'}{pkr(t.amount)}</p>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={t.status==='held'?{background:'#FFFBEB',color:'#D97706'}:t.status==='released'?{background:'#ECFDF5',color:'#16A34A'}:{background:'#F5F5F0',color:'#6B7280'}}>{t.status}</span>
                    </div>
                  </div>
                ))
              }
            </div>
          </section>
        )}

      </main>

      {/* ══ BOTTOM TAB BAR ══ */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-stone-200" style={{boxShadow:'0 -2px 16px rgba(0,0,0,0.08)',paddingBottom:'env(safe-area-inset-bottom,0px)'}}>
        <div className="grid grid-cols-4 max-w-lg mx-auto">
          {[['home','🏠','Browse'],['sell','➕','Sell'],['orders','📦','Orders'],['wallet','💰','Wallet']].map(([v,icon,label])=>(
            <button key={v} onClick={()=>nav(v)} className="flex flex-col items-center justify-center py-3 gap-0.5 transition-all active:bg-stone-50 relative" style={{color:view===v?'#B45309':'#9CA3AF'}}>
              {view===v&&<div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full" style={{background:'#D97706'}}/>}
              <span className="text-2xl leading-none">{icon}</span>
              <span className="text-[10px] font-bold leading-none mt-0.5">{label}</span>
            </button>
          ))}
        </div>
      </nav>

    </div>
  );
}
