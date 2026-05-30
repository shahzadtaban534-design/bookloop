import React, { useState, useMemo, useEffect } from 'react';

const GENRES = ['All','Fiction','Self-Help','Sci-Fi','Biography','Mystery','Children','Textbook'];
const CONDITIONS = ['All','Like New','Good','Fair'];
const COMMISSION_RATE = 0.20;
const pkr = (n) => 'PKR ' + Number(n).toLocaleString('en-PK');
const load = (k,fb) => { try { const v=localStorage.getItem(k); return v?JSON.parse(v):fb; } catch { return fb; } };
const save = (k,v) => { try { localStorage.setItem(k,JSON.stringify(v)); } catch {} };
const inp = "w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-base font-medium text-slate-800 transition-all";

export default function App() {
  const [books, setBooks]         = useState(() => load('bl_books',[]));
  const [orders, setOrders]       = useState(() => load('bl_orders',[]));
  const [wallet, setWallet]       = useState(() => load('bl_wallet',{balance:0,transactions:[]}));
  const [subscribers, setSubs]    = useState(() => load('bl_subs',[]));
  const [view, setView]           = useState('home');
  const [searchQuery, setSearch]  = useState('');
  const [selGenre, setGenre]      = useState('All');
  const [selCond, setCond]        = useState('All');
  const [toasts, setToasts]       = useState([]);
  const [subEmail, setSubEmail]   = useState('');
  const [confetti, setConfetti]   = useState([]);

  // Checkout
  const [cbk, setCbk]       = useState(null); // checkoutBook
  const [cStep, setCStep]   = useState(1);
  const [bName, setBName]   = useState('');
  const [bAddr, setBAddr]   = useState('');
  const [bPhone, setBPhone] = useState('');
  const [payM, setPayM]     = useState('EasyPaisa');
  const [placed, setPlaced] = useState(null);

  // Sell
  const [sTitle, setSTitle]   = useState('');
  const [sAuth, setSAuth]     = useState('');
  const [sGenre, setSGenre]   = useState('Fiction');
  const [sCond, setSCond]     = useState('Good');
  const [sPrice, setSPrice]   = useState('');
  const [sPhone, setSPhone]   = useState('');
  const [sCity, setSCity]     = useState('');
  const [sDesc, setSDesc]     = useState('');
  const [sCover, setSCover]   = useState(null);

  // Wallet
  const [wAmt, setWAmt]     = useState('');
  const [wMethod, setWMeth] = useState('EasyPaisa');
  const [wAcc, setWAcc]     = useState('');

  useEffect(()=>save('bl_books',books),[books]);
  useEffect(()=>save('bl_orders',orders),[orders]);
  useEffect(()=>save('bl_wallet',wallet),[wallet]);
  useEffect(()=>save('bl_subs',subscribers),[subscribers]);

  const toast = (text, type='success') => {
    const id=Date.now();
    setToasts(p=>[...p,{id,text,type}]);
    setTimeout(()=>setToasts(p=>p.filter(n=>n.id!==id)),4000);
  };

  const boom = () => {
    const colors=['#f59e0b','#3b82f6','#10b981','#ec4899','#8b5cf6','#f43f5e'];
    setConfetti(Array.from({length:55}).map((_,i)=>({id:i,x:Math.random()*100,size:Math.random()*7+4,color:colors[i%6],delay:Math.random()*0.8,dur:Math.random()*2+1.5})));
    setTimeout(()=>setConfetti([]),4000);
  };

  const calc = p => ({commission:Math.round(p*COMMISSION_RATE), sellerNet:Math.round(p*0.8)});

  const listBook = (e) => {
    e.preventDefault();
    const price=parseInt(sPrice);
    if(!sTitle.trim()||!sAuth.trim()||!price||!sPhone.trim()){toast('Fill Title, Author, Price & WhatsApp.','warning');return;}
    if(price<50){toast('Min price is PKR 50.','warning');return;}
    const book={id:`bk-${Date.now()}`,title:sTitle,author:sAuth,genre:sGenre,condition:sCond,price,phone:sPhone,city:sCity,description:sDesc||'A pre-loved book looking for a new home.',coverImage:sCover,listedAt:new Date().toLocaleDateString('en-PK'),status:'available'};
    setBooks(p=>[book,...p]);
    setSTitle('');setSAuth('');setSPrice('');setSPhone('');setSCity('');setSDesc('');setSCover(null);
    toast(`"${book.title}" listed! You'll receive ${pkr(calc(price).sellerNet)} on sale.`);
    boom(); nav('home');
  };

  const openCheckout = (book) => {
    setCbk(book);setCStep(1);setBName('');setBAddr('');setBPhone('');setPayM('EasyPaisa');setPlaced(null);setView('checkout');
    window.scrollTo(0,0);
  };

  const placeOrder = () => {
    if(!bName.trim()||!bAddr.trim()||!bPhone.trim()){toast('Fill all delivery details.','warning');return;}
    const order={id:'BL-'+Math.floor(10000+Math.random()*90000),bookId:cbk.id,bookTitle:cbk.title,bookAuthor:cbk.author,bookPhone:cbk.phone,price:cbk.price,buyerName:bName,buyerAddress:bAddr,buyerPhone:bPhone,payMethod:payM,status:'Processing',fundsStatus:'held',date:new Date().toLocaleDateString('en-PK')};
    setOrders(p=>[order,...p]);
    setBooks(p=>p.map(b=>b.id===cbk.id?{...b,status:'sold'}:b));
    setWallet(p=>({...p,transactions:[{id:Date.now(),type:'debit',label:`Payment held — "${cbk.title}"`,amount:cbk.price,status:'held',date:new Date().toLocaleDateString('en-PK')},...p.transactions]}));
    setPlaced(order);boom();
    toast('✅ Order placed! Seller will WhatsApp you.');
  };

  const confirmDelivery = (oid) => {
    const o=orders.find(x=>x.id===oid); if(!o) return;
    const {commission,sellerNet}=calc(o.price);
    setOrders(p=>p.map(x=>x.id===oid?{...x,status:'Delivered',fundsStatus:'released'}:x));
    setWallet(p=>({balance:p.balance+commission,transactions:[
      {id:Date.now(),type:'credit',label:`Commission — "${o.bookTitle}"`,amount:commission,status:'released',date:new Date().toLocaleDateString('en-PK')},
      {id:Date.now()-1,type:'credit',label:`Seller payout — "${o.bookTitle}"`,amount:sellerNet,status:'released',date:new Date().toLocaleDateString('en-PK')},
      ...p.transactions
    ]}));
    toast(`✅ Delivered! You earned ${pkr(commission)} commission.`);
  };

  const doWithdraw = (e) => {
    e.preventDefault();
    const amt=parseInt(wAmt);
    if(!amt||amt<=0){toast('Enter valid amount.','warning');return;}
    if(amt>wallet.balance){toast('Insufficient balance.','warning');return;}
    if(!wAcc.trim()){toast('Enter account details.','warning');return;}
    setWallet(p=>({balance:p.balance-amt,transactions:[{id:Date.now(),type:'debit',label:`Withdrawal via ${wMethod} → ${wAcc}`,amount:amt,status:'pending',date:new Date().toLocaleDateString('en-PK')},...p.transactions]}));
    setWAmt('');setWAcc('');
    toast(`Withdrawal of ${pkr(amt)} initiated!`);
  };

  const doSubscribe = (e) => {
    e.preventDefault();
    if(!subEmail.trim()||!subEmail.includes('@')){toast('Enter valid email.','warning');return;}
    if(subscribers.includes(subEmail)){toast('Already subscribed!','warning');return;}
    setSubs(p=>[...p,subEmail]);
    toast(`✉️ Subscribed! Alerts will go to ${subEmail}.`);
    setSubEmail('');boom();
  };

  const filteredBooks = useMemo(()=>books.filter(b=>{
    if(b.status==='sold') return false;
    const q=searchQuery.toLowerCase();
    return (b.title.toLowerCase().includes(q)||b.author.toLowerCase().includes(q))&&
      (selGenre==='All'||b.genre===selGenre)&&(selCond==='All'||b.condition===selCond);
  }),[books,searchQuery,selGenre,selCond]);

  const nav = (v) => { setView(v); setPlaced(null); window.scrollTo(0,0); };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 font-sans flex flex-col relative overflow-x-hidden" style={{paddingBottom:'72px'}}>

      {/* Confetti */}
      {confetti.length>0&&(
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {confetti.map(p=><div key={p.id} className="absolute rounded" style={{left:`${p.x}%`,top:'-5%',width:`${p.size}px`,height:`${p.size*1.5}px`,backgroundColor:p.color,animation:`fall ${p.dur}s linear ${p.delay}s infinite`}}/>)}
          <style>{`@keyframes fall{0%{top:-5%;transform:rotate(0deg)}100%{top:110%;transform:translateY(100vh) rotate(720deg)}}`}</style>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed bottom-20 left-3 right-3 sm:bottom-6 sm:left-auto sm:right-5 sm:max-w-sm z-50 space-y-2 pointer-events-none">
        {toasts.map(n=>(
          <div key={n.id} className={`p-4 rounded-2xl shadow-2xl flex items-start gap-3 pointer-events-auto ${n.type==='success'?'bg-emerald-900 border border-emerald-700 text-emerald-100':n.type==='warning'?'bg-amber-900 border border-amber-700 text-amber-100':'bg-slate-900 border border-slate-700 text-slate-100'}`}>
            <span className="text-lg flex-shrink-0">{n.type==='success'?'✨':n.type==='warning'?'⚠️':'ℹ️'}</span>
            <p className="text-sm font-semibold leading-snug">{n.text}</p>
          </div>
        ))}
      </div>

      {/* TOP HEADER */}
      <header className="sticky top-0 bg-white border-b border-slate-200 z-40" style={{boxShadow:'0 1px 3px rgba(0,0,0,0.06)'}}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={()=>nav('home')} className="flex items-center gap-2.5 group">
            <span className="text-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 w-9 h-9 rounded-xl flex items-center justify-center transform group-active:scale-95 transition-all">📚</span>
            <div className="leading-none">
              <span className="text-lg font-black text-slate-900 tracking-tight block">BookLoop</span>
              <span className="text-[9px] text-indigo-500 font-extrabold tracking-widest uppercase block leading-none">Pakistan</span>
            </div>
          </button>
          {/* Wallet chip — always visible */}
          <button onClick={()=>nav('wallet')} className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-bold active:scale-95 transition-all">
            <span>💰</span>
            <span>{pkr(wallet.balance)}</span>
          </button>
        </div>
      </header>

      <main className="flex-1">

        {/* ══════════════ HOME ══════════════ */}
        {view==='home'&&(
          <div>
            {/* Hero */}
            <section className="bg-gradient-to-b from-indigo-950 to-slate-900 px-4 pt-8 pb-10 text-center">
              <span className="inline-flex items-center gap-1.5 bg-white/10 text-indigo-200 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
                🌱 PKR · Escrow · 20% commission
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3">
                Buy & Sell Books<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-violet-300">Across Pakistan</span>
              </h1>
              <p className="text-slate-300 text-sm max-w-xs mx-auto mb-6 leading-relaxed">
                List your books in PKR. Funds held safe until delivery confirmed. Seller keeps 80%.
              </p>
              {/* Trust pills */}
              <div className="flex flex-wrap justify-center gap-2 mb-7">
                {[['🔒','Escrow'],['📱','WhatsApp'],['💰','PKR Wallet'],['✅','No Card']].map(([i,l])=>(
                  <span key={l} className="bg-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-full">{i} {l}</span>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row justify-center gap-3 max-w-xs mx-auto sm:max-w-none">
                <button onClick={()=>nav('sell')} className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-extrabold rounded-2xl shadow-lg text-base active:scale-95 transition-all">
                  + List a Book
                </button>
                <a href="#dir" className="w-full sm:w-auto px-8 py-4 bg-white/10 border border-white/20 text-white font-bold rounded-2xl text-base text-center">
                  Browse ↓
                </a>
              </div>
            </section>

            {/* Subscribe bar */}
            <div className="bg-slate-800 px-4 py-4">
              <form onSubmit={doSubscribe} className="max-w-md mx-auto flex gap-2">
                <input type="email" placeholder="Get book alerts — your@email.com" value={subEmail} onChange={e=>setSubEmail(e.target.value)}
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                <button type="submit" className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm px-4 py-3 rounded-xl flex-shrink-0 active:scale-95 transition-all">Subscribe</button>
              </form>
            </div>

            {/* Search + Filters */}
            <section id="dir" className="max-w-7xl mx-auto px-3 pt-4 pb-2 space-y-3">
              <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm space-y-3">
                {/* Search */}
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                  <input type="text" placeholder="Search title or author..." value={searchQuery} onChange={e=>setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"/>
                </div>
                {/* Genre horizontal scroll */}
                <div className="overflow-x-auto -mx-1 px-1 pb-1" style={{scrollbarWidth:'none'}}>
                  <div className="flex gap-2 w-max">
                    {GENRES.map(g=>(
                      <button key={g} onClick={()=>setGenre(g)} className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${selGenre===g?'bg-slate-900 text-white':'bg-slate-100 text-slate-600'}`}>{g}</button>
                    ))}
                  </div>
                </div>
                {/* Condition + count */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Condition:</span>
                  {CONDITIONS.map(c=>(
                    <button key={c} onClick={()=>setCond(c)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all active:scale-95 ${selCond===c?'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold':'border-slate-200 text-slate-500'}`}>{c}</button>
                  ))}
                  <span className="ml-auto text-xs text-slate-400"><strong className="text-slate-700">{filteredBooks.length}</strong> books</span>
                </div>
              </div>
            </section>

            {/* Books Grid */}
            <section className="max-w-7xl mx-auto px-3 py-3 pb-6">
              {filteredBooks.length===0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 py-16 text-center">
                  <div className="text-6xl mb-3">📭</div>
                  <h3 className="text-lg font-bold text-slate-700">No books listed yet</h3>
                  <p className="text-slate-400 text-sm mt-1">Be the first to sell!</p>
                  <button onClick={()=>nav('sell')} className="mt-5 px-7 py-3.5 bg-indigo-600 text-white font-bold rounded-2xl text-sm active:scale-95 transition-all">List a Book</button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredBooks.map(book=>{
                    const {sellerNet}=calc(book.price);
                    return (
                      <div key={book.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm active:scale-98 transition-all flex flex-col">
                        {/* Cover */}
                        <div className="relative bg-slate-100 overflow-hidden" style={{aspectRatio:'3/4'}}>
                          {book.coverImage
                            ?<img src={book.coverImage} alt={book.title} className="w-full h-full object-cover"/>
                            :<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-violet-100 text-5xl">📖</div>
                          }
                          <span className="absolute top-2 left-2 bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">{book.condition}</span>
                          {book.city&&<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent py-2 px-2"><p className="text-white text-[9px] font-bold truncate">📍 {book.city}</p></div>}
                        </div>
                        {/* Info */}
                        <div className="p-3 flex flex-col flex-1 justify-between">
                          <div>
                            <p className="font-extrabold text-slate-900 text-xs leading-tight line-clamp-2">{book.title}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5 truncate">by {book.author}</p>
                          </div>
                          <div className="mt-2.5 flex items-end justify-between gap-1">
                            <div>
                              <p className="font-extrabold text-indigo-700 text-sm leading-none">{pkr(book.price)}</p>
                              <p className="text-[9px] text-slate-400 mt-0.5">Seller gets {pkr(sellerNet)}</p>
                            </div>
                            <button onClick={()=>openCheckout(book)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs px-3 py-2 rounded-xl transition-all active:scale-95 flex-shrink-0">Buy</button>
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

        {/* ══════════════ SELL ══════════════ */}
        {view==='sell'&&(
          <section className="max-w-lg mx-auto px-4 py-6">
            <h1 className="text-2xl font-extrabold text-slate-900 mb-1">List Your Book</h1>
            <p className="text-slate-500 text-sm mb-5">You keep 80% · Platform takes 20%</p>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <form onSubmit={listBook} className="space-y-4">

                <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Book Title *</label>
                <input type="text" placeholder="The Alchemist" value={sTitle} onChange={e=>setSTitle(e.target.value)} className={inp}/></div>

                <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Author *</label>
                <input type="text" placeholder="Paulo Coelho" value={sAuth} onChange={e=>setSAuth(e.target.value)} className={inp}/></div>

                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Genre</label>
                  <select value={sGenre} onChange={e=>setSGenre(e.target.value)} className={inp}>
                    {GENRES.slice(1).map(g=><option key={g}>{g}</option>)}
                  </select></div>
                  <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Condition</label>
                  <select value={sCond} onChange={e=>setSCond(e.target.value)} className={inp}>
                    {CONDITIONS.slice(1).map(c=><option key={c}>{c}</option>)}
                  </select></div>
                </div>

                {/* Price breakdown */}
                <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Asking Price (PKR) *</label>
                  <input type="number" inputMode="numeric" placeholder="500" value={sPrice} onChange={e=>setSPrice(e.target.value)} min="50" className={inp}/>
                  {sPrice&&parseInt(sPrice)>=50&&(()=>{
                    const {commission,sellerNet}=calc(parseInt(sPrice));
                    return(
                      <div className="mt-3 space-y-1.5 text-sm border-t border-indigo-200 pt-3">
                        <div className="flex justify-between text-slate-600"><span>Platform (20%)</span><span className="font-bold text-rose-500">−{pkr(commission)}</span></div>
                        <div className="flex justify-between font-extrabold text-base"><span>You receive</span><span className="text-emerald-600">{pkr(sellerNet)}</span></div>
                      </div>
                    );
                  })()}
                </div>

                <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">WhatsApp Number * <span className="normal-case font-normal">(buyer contacts you here)</span></label>
                <input type="tel" inputMode="tel" placeholder="+92 300 1234567" value={sPhone} onChange={e=>setSPhone(e.target.value)} className={inp}/></div>

                <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">City / Area</label>
                <input type="text" placeholder="Lahore, DHA Phase 4" value={sCity} onChange={e=>setSCity(e.target.value)} className={inp}/></div>

                {/* Photo upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Book Cover Photo</label>
                  <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl py-7 px-4 cursor-pointer transition-all text-center active:scale-98 ${sCover?'border-indigo-400 bg-indigo-50':'border-slate-300 bg-slate-50 hover:border-indigo-400'}`}>
                    {sCover
                      ?<><img src={sCover} alt="preview" className="h-32 object-contain rounded-xl mb-2"/><span className="text-sm text-indigo-600 font-bold">Tap to change photo</span></>
                      :<><span className="text-5xl mb-2">📷</span><span className="text-base font-bold text-slate-600">Tap to upload photo</span><span className="text-sm text-slate-400 mt-1">JPG, PNG — max 2MB</span></>
                    }
                    <input type="file" accept="image/*" className="hidden" onChange={e=>{
                      const f=e.target.files[0]; if(!f) return;
                      if(f.size>2*1024*1024){toast('Max 2MB image.','warning');return;}
                      const r=new FileReader(); r.onload=ev=>setSCover(ev.target.result); r.readAsDataURL(f);
                    }}/>
                  </label>
                  {sCover&&<button type="button" onClick={()=>setSCover(null)} className="mt-1.5 text-sm text-red-500 font-bold">Remove photo</button>}
                </div>

                <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Description</label>
                <textarea rows={3} placeholder="Condition notes, edition, etc." value={sDesc} onChange={e=>setSDesc(e.target.value)} className={inp+' resize-none'}/></div>

                <button type="submit" className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-extrabold rounded-2xl shadow-md text-base uppercase tracking-wide active:scale-95 transition-all">
                  Publish Listing
                </button>
              </form>
            </div>
          </section>
        )}

        {/* ══════════════ CHECKOUT ══════════════ */}
        {view==='checkout'&&(
          <section className="max-w-lg mx-auto px-4 py-6">
            {placed?(
              <div className="bg-white rounded-2xl border border-emerald-200 p-6 text-center shadow-xl space-y-5">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-4xl">✓</div>
                <div>
                  <h3 className="text-2xl font-extrabold text-slate-900">Order Placed!</h3>
                  <p className="text-slate-400 text-sm mt-1">#{placed.id}</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 text-left space-y-3">
                  {[['Book',placed.bookTitle],['Amount',pkr(placed.price)],['Deliver to',placed.buyerAddress],['Payment',placed.payMethod]].map(([k,v])=>(
                    <div key={k} className="flex justify-between gap-4"><span className="text-slate-400 text-sm flex-shrink-0">{k}</span><span className="font-bold text-sm text-right break-words max-w-[65%]">{v}</span></div>
                  ))}
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-800 text-left leading-relaxed">
                  📱 Seller will WhatsApp you on <strong>{placed.buyerPhone}</strong>. After you receive the book, go to <strong>Orders</strong> → tap <strong>Confirm Delivery</strong> to release funds.
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={()=>nav('home')} className="py-4 bg-indigo-600 text-white font-bold rounded-2xl text-sm active:scale-95 transition-all">Browse More</button>
                  <button onClick={()=>nav('orders')} className="py-4 bg-slate-100 text-slate-800 font-bold rounded-2xl text-sm active:scale-95 transition-all">My Orders</button>
                </div>
              </div>
            ):cbk?(
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xl">
                <h2 className="text-xl font-extrabold text-slate-900 mb-0.5">Checkout</h2>
                <p className="text-slate-500 text-sm mb-5 truncate">Buying: <strong>{cbk.title}</strong></p>

                {/* Steps */}
                <div className="flex mb-6">
                  {['Delivery','Payment','Confirm'].map((s,i)=>(
                    <div key={s} className={`flex-1 text-center text-xs pb-2.5 border-b-2 font-bold ${cStep===i+1?'border-indigo-500 text-indigo-600':cStep>i+1?'border-emerald-500 text-emerald-600':'border-slate-200 text-slate-400'}`}>
                      {cStep>i+1?'✓ ':''}{s}
                    </div>
                  ))}
                </div>

                {cStep===1&&(
                  <div className="space-y-4">
                    <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Full Name *</label>
                    <input type="text" placeholder="Muhammad Ali" value={bName} onChange={e=>setBName(e.target.value)} className={inp}/></div>
                    <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Delivery Address *</label>
                    <textarea rows={3} placeholder="House No, Street, Block, Area, City" value={bAddr} onChange={e=>setBAddr(e.target.value)} className={inp+' resize-none'}/></div>
                    <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">WhatsApp Number *</label>
                    <input type="tel" inputMode="tel" placeholder="+92 300 1234567" value={bPhone} onChange={e=>setBPhone(e.target.value)} className={inp}/></div>
                    <button onClick={()=>{if(!bName.trim()||!bAddr.trim()||!bPhone.trim()){toast('Fill all fields.','warning');return;}setCStep(2);}}
                      className="w-full py-4 bg-indigo-600 text-white font-extrabold rounded-2xl text-base active:scale-95 transition-all">
                      Continue →
                    </button>
                  </div>
                )}

                {cStep===2&&(
                  <div className="space-y-4">
                    <p className="text-sm text-slate-500 font-medium">How will you pay?</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[['EasyPaisa','📱'],['JazzCash','💚'],['Bank Transfer','🏦']].map(([m,i])=>(
                        <button key={m} onClick={()=>setPayM(m)} className={`border-2 rounded-2xl p-4 text-xs font-bold text-center transition-all active:scale-95 ${payM===m?'border-indigo-500 bg-indigo-50 text-indigo-700':'border-slate-200 text-slate-600'}`}>
                          <div className="text-3xl mb-1.5">{i}</div>{m}
                        </button>
                      ))}
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 space-y-2.5">
                      {[['Book price',pkr(cbk.price)],['Platform fee (incl.)',pkr(calc(cbk.price).commission)]].map(([k,v])=>(
                        <div key={k} className="flex justify-between text-sm text-slate-500"><span>{k}</span><span className="font-bold text-slate-800">{v}</span></div>
                      ))}
                      <div className="flex justify-between font-extrabold border-t border-slate-200 pt-2.5 text-lg"><span>Total</span><span className="text-indigo-700">{pkr(cbk.price)}</span></div>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-sm text-emerald-800">🔒 Funds held in escrow until you confirm delivery.</div>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={()=>setCStep(1)} className="py-4 bg-slate-100 text-slate-700 font-bold rounded-2xl text-sm active:scale-95 transition-all">← Back</button>
                      <button onClick={()=>setCStep(3)} className="py-4 bg-indigo-600 text-white font-extrabold rounded-2xl text-sm active:scale-95 transition-all">Review →</button>
                    </div>
                  </div>
                )}

                {cStep===3&&(
                  <div className="space-y-4">
                    <div className="bg-slate-50 rounded-2xl p-4 space-y-2.5">
                      {[['Book',cbk.title],['Name',bName],['Address',bAddr],['Contact',bPhone],['Payment',payM]].map(([k,v])=>(
                        <div key={k} className="flex justify-between gap-4 text-sm"><span className="text-slate-400 flex-shrink-0">{k}</span><span className="font-bold text-right break-words max-w-[65%]">{v}</span></div>
                      ))}
                      <div className="flex justify-between font-extrabold border-t border-slate-200 pt-2.5 text-lg"><span>Total</span><span className="text-indigo-700">{pkr(cbk.price)}</span></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={()=>setCStep(2)} className="py-4 bg-slate-100 text-slate-700 font-bold rounded-2xl text-sm active:scale-95 transition-all">← Back</button>
                      <button onClick={placeOrder} className="py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-extrabold rounded-2xl text-sm active:scale-95 transition-all">Confirm & Pay ✓</button>
                    </div>
                  </div>
                )}
              </div>
            ):(
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🛒</div>
                <h3 className="text-lg font-bold">No book selected</h3>
                <button onClick={()=>nav('home')} className="mt-5 px-7 py-3.5 bg-indigo-600 text-white font-bold rounded-2xl text-sm active:scale-95 transition-all">Browse Books</button>
              </div>
            )}
          </section>
        )}

        {/* ══════════════ ORDERS ══════════════ */}
        {view==='orders'&&(
          <section className="max-w-2xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-extrabold text-slate-900 mb-5">My Orders</h1>
            {orders.length===0?(
              <div className="bg-white rounded-2xl border border-slate-200 py-16 text-center">
                <div className="text-6xl mb-3">📦</div>
                <h3 className="text-lg font-bold">No orders yet</h3>
                <button onClick={()=>nav('home')} className="mt-5 px-7 py-3.5 bg-indigo-600 text-white font-bold rounded-2xl text-sm active:scale-95 transition-all">Browse Books</button>
              </div>
            ):(
              <div className="space-y-3">
                {orders.map(order=>{
                  const {commission}=calc(order.price);
                  const badge=order.status==='Delivered'?'bg-emerald-100 text-emerald-700':order.status==='Processing'?'bg-amber-100 text-amber-700':'bg-blue-100 text-blue-700';
                  return(
                    <div key={order.id} className="bg-white rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="min-w-0 flex-1 mr-3">
                          <p className="text-[10px] text-slate-400">#{order.id} · {order.date}</p>
                          <h3 className="font-extrabold text-slate-900 text-base leading-tight truncate">{order.bookTitle}</h3>
                          <p className="text-xs text-slate-500">{order.bookAuthor}</p>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0 ${badge}`}>{order.status}</span>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 text-sm space-y-1.5 mb-3">
                        {[['Amount',pkr(order.price)],['Deliver to',order.buyerAddress],['Payment',order.payMethod],['Seller',order.bookPhone]].map(([k,v])=>(
                          <div key={k} className="flex justify-between gap-3"><span className="text-slate-400 flex-shrink-0">{k}</span><span className="font-bold text-right break-words max-w-[60%]">{v}</span></div>
                        ))}
                        <div className="flex justify-between gap-3 border-t border-slate-200 pt-1.5"><span className="text-slate-400">Commission (20%)</span><span className="font-bold text-emerald-600">{pkr(commission)}</span></div>
                      </div>
                      <div className="flex gap-2">
                        {order.status==='Processing'&&(
                          <button onClick={()=>confirmDelivery(order.id)} className="flex-1 py-3.5 bg-emerald-600 text-white font-bold rounded-xl text-sm active:scale-95 transition-all">✓ Confirm Delivery</button>
                        )}
                        <a href={`https://wa.me/${order.bookPhone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
                          className="px-4 py-3.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm text-center active:scale-95 transition-all">💬 WhatsApp</a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ══════════════ WALLET ══════════════ */}
        {view==='wallet'&&(
          <section className="max-w-2xl mx-auto px-4 py-6 space-y-4">
            {/* Balance card */}
            <div className="bg-gradient-to-br from-indigo-900 to-violet-900 rounded-2xl p-6 text-white" style={{background:'linear-gradient(135deg,#1e1b4b,#4c1d95)'}}>
              <p className="text-indigo-300 text-xs uppercase font-bold tracking-wider mb-2">Your BookLoop Wallet</p>
              <p className="text-5xl font-black text-amber-400">{pkr(wallet.balance)}</p>
              <p className="text-indigo-300 text-sm mt-1">Available balance · Withdraw anytime</p>
            </div>

            {/* Withdraw form */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="font-extrabold text-slate-900 text-lg mb-4">Withdraw Funds</h3>
              {wallet.balance===0?(
                <p className="text-slate-400 text-sm">No balance yet. Earn commission when buyers confirm delivery.</p>
              ):(
                <form onSubmit={doWithdraw} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Amount (PKR)</label>
                    <input type="number" inputMode="numeric" placeholder="Enter amount" value={wAmt} onChange={e=>setWAmt(e.target.value)} max={wallet.balance} className={inp}/></div>
                    <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Method</label>
                    <select value={wMethod} onChange={e=>setWMeth(e.target.value)} className={inp}>
                      <option>EasyPaisa</option><option>JazzCash</option><option>Bank Transfer</option>
                    </select></div>
                  </div>
                  <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Mobile Number / IBAN</label>
                  <input type="text" inputMode="tel" placeholder="+92 300 1234567 or IBAN" value={wAcc} onChange={e=>setWAcc(e.target.value)} className={inp}/></div>
                  <button type="submit" className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-extrabold rounded-2xl text-base active:scale-95 transition-all">
                    Withdraw Funds
                  </button>
                </form>
              )}
            </div>

            {/* Transaction history */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-900">Transaction History</h3>
              </div>
              {wallet.transactions.length===0?(
                <div className="py-10 text-center text-slate-400 text-sm">No transactions yet</div>
              ):wallet.transactions.map(t=>(
                <div key={t.id} className="flex items-center px-4 py-4 border-b border-slate-100 last:border-none gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${t.type==='credit'?'bg-emerald-100 text-emerald-700':t.status==='held'?'bg-amber-100 text-amber-700':'bg-red-100 text-red-600'}`}>
                    {t.type==='credit'?'↑':t.status==='held'?'⏳':'↓'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 leading-tight line-clamp-2">{t.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{t.date}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`font-extrabold text-base ${t.type==='credit'?'text-emerald-600':'text-red-500'}`}>{t.type==='credit'?'+':'-'}{pkr(t.amount)}</p>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${t.status==='held'?'bg-amber-100 text-amber-700':t.status==='released'?'bg-emerald-100 text-emerald-700':'bg-slate-100 text-slate-500'}`}>{t.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>

      {/* ══ BOTTOM TAB BAR ══ */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200" style={{boxShadow:'0 -2px 12px rgba(0,0,0,0.06)',paddingBottom:'env(safe-area-inset-bottom,0px)'}}>
        <div className="grid grid-cols-4 max-w-lg mx-auto">
          {[['home','🏠','Browse'],['sell','➕','Sell'],['orders','📦','Orders'],['wallet','💰','Wallet']].map(([v,icon,label])=>(
            <button key={v} onClick={()=>nav(v)} className={`flex flex-col items-center justify-center py-3 gap-0.5 transition-all active:bg-slate-50 ${view===v?'text-indigo-600':'text-slate-400'}`}>
              <span className="text-2xl leading-none">{icon}</span>
              <span className="text-[10px] font-bold leading-none mt-0.5">{label}</span>
              {view===v&&<span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-0.5"/>}
            </button>
          ))}
        </div>
      </nav>

    </div>
  );
}
