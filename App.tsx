
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Home, 
  Package, 
  Users, 
  User as UserIcon, 
  PlusCircle, 
  ArrowDownCircle, 
  History, 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  Copy, 
  ChevronRight, 
  LogOut, 
  Camera, 
  MessageCircle, 
  Send, 
  AlertCircle,
  Eye,
  CreditCard,
  Building,
  MapPin,
  Clock,
  RotateCcw,
  Trophy,
  Lock,
  Zap,
  Star,
  ExternalLink
} from 'lucide-react';
import { User, Page, InvestmentPlan, Transaction, UserInvestment } from './types';
import { INVESTMENT_PLANS, BANK_DETAILS, APP_CONFIG, SUPPORT_LINKS } from './constants';

// --- Helper Functions ---
const generateId = () => Math.random().toString(36).substring(2, 9);
const formatNPR = (amount: number) => `NPR ${amount.toLocaleString()}`;

const HIMALAYA_IMAGES = {
  hero: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=1000",
  peak: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800",
  login: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=400&h=400",
  card: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&q=80&w=600",
  spin: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?auto=format&fit=crop&q=80&w=1000",
  pattern: "https://www.transparenttextures.com/patterns/cubes.png"
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>(Page.LOGIN);
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('himalayan_users');
    return saved ? JSON.parse(saved) : [];
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('himalayan_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [userInvestments, setUserInvestments] = useState<UserInvestment[]>(() => {
    const saved = localStorage.getItem('himalayan_investments');
    return saved ? JSON.parse(saved) : [];
  });
  const [showWelcome, setShowWelcome] = useState(false);
  const [withdrawalToConfirm, setWithdrawalToConfirm] = useState<{ amount: number; bank: string; holder: string; acc: string } | null>(null);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  
  const [selectedDepositAmount, setSelectedDepositAmount] = useState(1000);
  const [depositScreenshot, setDepositScreenshot] = useState('');
  const [showPendingDepositMessage, setShowPendingDepositMessage] = useState(false);
  const [historyTab, setHistoryTab] = useState<'deposit' | 'withdraw'>('deposit');

  const spinRewards = [50, 100, 150, 200, 250, 300];

  // Spin Wheel State
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<number | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('himalayan_users', JSON.stringify(users));
    localStorage.setItem('himalayan_transactions', JSON.stringify(transactions));
    localStorage.setItem('himalayan_investments', JSON.stringify(userInvestments));
  }, [users, transactions, userInvestments]);

  // Sync current user
  useEffect(() => {
    if (currentUser) {
      const freshUser = users.find(u => u.id === currentUser.id);
      if (freshUser) setCurrentUser(freshUser);
    }
  }, [users]);

  // Auth Functions
  const handleRegister = (phone: string, pass: string, refCode?: string) => {
    if (phone.length !== 10) {
      alert("कृपया १० अंकको मोबाइल नम्बर हाल्नुहोस्।");
      return;
    }
    const fullPhone = `+977 ${phone}`;
    if (users.find(u => u.phoneNumber === fullPhone)) {
      alert("यो मोबाइल नम्बर पहिले नै दर्ता भइसकेको छ।");
      return;
    }

    const newUser: User = {
      id: generateId(),
      phoneNumber: fullPhone,
      password: pass,
      referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      referredBy: refCode || undefined,
      balance: APP_CONFIG.welcomeBonus,
      totalEarnings: 0,
      hasInvested: false,
      isAdmin: phone === '9800000000',
      registrationDate: new Date().toISOString(),
      spinChances: 0
    };

    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    setShowWelcome(true);
    setCurrentPage(Page.HOME);
  };

  const handleLogin = (phone: string, pass: string) => {
    const fullPhone = phone.startsWith('+977') ? phone : `+977 ${phone}`;
    const user = users.find(u => u.phoneNumber === fullPhone && u.password === pass);
    if (user) {
      setCurrentUser(user);
      if (user.isAdmin) setCurrentPage(Page.ADMIN);
      else setCurrentPage(Page.HOME);
    } else {
      alert("प्रवेश अस्वीकृत। मोबाइल नम्बर वा पासवर्ड मिलेन।");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage(Page.LOGIN);
    setDepositScreenshot('');
    setShowPendingDepositMessage(false);
  };

  const dailyCheckIn = () => {
    if (!currentUser) return;
    const today = new Date().toISOString().split('T')[0];
    if (currentUser.lastCheckIn === today) {
      alert("आजको बोनस पहिले नै प्राप्त भइसकेको छ। भोलि फेरि प्रयास गर्नुहोस्।");
      return;
    }
    const updatedUser = { ...currentUser, balance: currentUser.balance + APP_CONFIG.dailyCheckInBonus, lastCheckIn: today };
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    setTransactions([{
      id: generateId(), userId: currentUser.id, amount: APP_CONFIG.dailyCheckInBonus, type: 'check-in', status: 'approved', timestamp: new Date().toISOString()
    }, ...transactions]);
    alert("चेक-इन सफल! तपाईंको खातामा १० रुपैयाँ थपिएको छ।");
  };

  const handleDeposit = (amount: number, screenshot: string) => {
    if (!currentUser) return;
    const newTrans: Transaction = {
      id: generateId(), userId: currentUser.id, amount, type: 'deposit', status: 'pending', timestamp: new Date().toISOString(), screenshot, bankDetails: JSON.stringify(BANK_DETAILS)
    };
    setTransactions([newTrans, ...transactions]);
    setDepositScreenshot('');
    setShowPendingDepositMessage(true);
  };

  const initiateWithdraw = (amount: number, bank: string, holder: string, acc: string) => {
    if (!currentUser) return;
    if (!currentUser.hasInvested) { alert("रकम निकाल्नको लागि कम्तिमा एउटा VIP लगानी सक्रिय हुनुपर्छ।"); return; }
    if (amount < APP_CONFIG.minWithdraw) { alert(`न्यूनतम निकासी ${formatNPR(APP_CONFIG.minWithdraw)} हुनुपर्छ।`); return; }
    if (amount > currentUser.balance) { alert("तपाईंको खातामा पर्याप्त ब्यालेन्स छैन।"); return; }
    if (!bank || !holder || !acc) { alert("कृपया बैंक विवरणहरू पूर्ण रूपमा भर्नुहोस्।"); return; }
    setWithdrawalToConfirm({ amount, bank, holder, acc });
  };

  const confirmWithdraw = () => {
    if (!currentUser || withdrawalToConfirm === null) return;
    const { amount, bank, holder, acc } = withdrawalToConfirm;
    const updatedUser = { ...currentUser, balance: currentUser.balance - amount };
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    setTransactions([{
      id: generateId(), userId: currentUser.id, amount: amount * (1 - APP_CONFIG.withdrawFee), type: 'withdraw', status: 'pending', timestamp: new Date().toISOString(), bankDetails: JSON.stringify({ bank, holder, acc })
    }, ...transactions]);
    setWithdrawalToConfirm(null);
    alert("निकासी अनुरोध सफल भयो। प्रमाणिकरणको लागि केहि समय लाग्न सक्छ।");
    setCurrentPage(Page.PROFILE);
  };

  const handleInvest = (plan: InvestmentPlan) => {
    if (!currentUser) return;
    if (currentUser.balance < plan.price) { alert("अपर्याप्त ब्यालेन्स। कृपया पहिले खाता रिचार्ज गर्नुहोस्।"); setCurrentPage(Page.DEPOSIT); return; }
    const updatedUser = { ...currentUser, balance: currentUser.balance - plan.price, hasInvested: true };
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    setUserInvestments([{
      id: generateId(), userId: currentUser.id, planId: plan.id, amount: plan.price, dailyProfit: plan.dailyProfit, startDate: new Date().toISOString(), expiryDate: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000).toISOString(), status: 'active'
    }, ...userInvestments]);
    alert(`${plan.name} सक्रिय भयो! तपाईंको दैनिक नाफा सुरु भएको छ।`);
    setCurrentPage(Page.PRODUCTS);
  };

  const handleSpin = () => {
    if (!currentUser || currentUser.spinChances <= 0 || isSpinning) return;
    setIsSpinning(true);
    setSpinResult(null);
    const randomIndex = Math.floor(Math.random() * spinRewards.length);
    const winAmount = spinRewards[randomIndex];
    
    const segmentAngle = 360 / spinRewards.length;
    const extraDegrees = segmentAngle * randomIndex;
    const totalRotation = (360 * 10) + (360 - extraDegrees); 

    if (wheelRef.current) {
      wheelRef.current.style.transition = 'transform 5s cubic-bezier(0.15, 0, 0.15, 1)';
      wheelRef.current.style.transform = `rotate(${totalRotation}deg)`;
    }

    setTimeout(() => {
      setIsSpinning(false);
      setSpinResult(winAmount);
      const updatedUser = { ...currentUser, balance: currentUser.balance + winAmount, spinChances: currentUser.spinChances - 1 };
      setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
      setTransactions([{
        id: generateId(), userId: currentUser.id, amount: winAmount, type: 'spin', status: 'approved', timestamp: new Date().toISOString()
      }, ...transactions]);
      
      if (wheelRef.current) {
        wheelRef.current.style.transition = 'none';
        wheelRef.current.style.transform = `rotate(${360 - extraDegrees}deg)`;
      }
    }, 5200);
  };

  const approveTransaction = (transId: string) => {
    const trans = transactions.find(t => t.id === transId);
    if (!trans) return;
    let updatedUsers = [...users];
    if (trans.type === 'deposit') {
      const uIdx = updatedUsers.findIndex(u => u.id === trans.userId);
      if (uIdx !== -1) {
        updatedUsers[uIdx] = { ...updatedUsers[uIdx], balance: updatedUsers[uIdx].balance + trans.amount };
        if (trans.amount >= 1000 && updatedUsers[uIdx].referredBy) {
          const invIdx = updatedUsers.findIndex(u => u.referralCode === updatedUsers[uIdx].referredBy);
          if (invIdx !== -1) updatedUsers[invIdx] = { ...updatedUsers[invIdx], spinChances: (updatedUsers[invIdx].spinChances || 0) + 1 };
        }
      }
    }
    setUsers(updatedUsers);
    setTransactions(transactions.map(t => t.id === transId ? { ...t, status: 'approved' } : t));
  };

  const rejectTransaction = (transId: string) => {
    setTransactions(transactions.map(t => t.id === transId ? { ...t, status: 'rejected' } : t));
  };

  // --- UI Components ---

  const Navbar = () => (
    <div className="fixed bottom-6 left-6 right-6 z-50">
      <div className="bg-white/90 backdrop-blur-xl premium-shadow border border-white/20 rounded-[32px] px-6 py-4 flex justify-between items-center">
        <button onClick={() => setCurrentPage(Page.HOME)} className={`flex flex-col items-center gap-1 transition-all ${currentPage === Page.HOME ? 'text-primary scale-110' : 'text-gray-400 opacity-60'}`}>
          <Home size={22} strokeWidth={2.5} />
          <span className="text-[10px] font-black uppercase tracking-wider">होम</span>
        </button>
        <button onClick={() => setCurrentPage(Page.PRODUCTS)} className={`flex flex-col items-center gap-1 transition-all ${currentPage === Page.PRODUCTS ? 'text-primary scale-110' : 'text-gray-400 opacity-60'}`}>
          <Zap size={22} strokeWidth={2.5} />
          <span className="text-[10px] font-black uppercase tracking-wider">लगानी</span>
        </button>
        <button onClick={() => setCurrentPage(Page.TEAM)} className={`flex flex-col items-center gap-1 transition-all ${currentPage === Page.TEAM ? 'text-primary scale-110' : 'text-gray-400 opacity-60'}`}>
          <Users size={22} strokeWidth={2.5} />
          <span className="text-[10px] font-black uppercase tracking-wider">नेटवर्क</span>
        </button>
        <button onClick={() => setCurrentPage(Page.PROFILE)} className={`flex flex-col items-center gap-1 transition-all ${currentPage === Page.PROFILE ? 'text-primary scale-110' : 'text-gray-400 opacity-60'}`}>
          <UserIcon size={22} strokeWidth={2.5} />
          <span className="text-[10px] font-black uppercase tracking-wider">मेरो प्रोफाइल</span>
        </button>
      </div>
    </div>
  );

  const StatusBadge = ({ status }: { status: string }) => {
    const config = {
      approved: { text: "स्विकृत", cls: "bg-emerald-50 text-emerald-600 border-emerald-100" },
      pending: { text: "प्रतिक्षामा", cls: "bg-amber-50 text-amber-600 border-amber-100" },
      rejected: { text: "अस्विकृत", cls: "bg-rose-50 text-rose-600 border-rose-100" }
    };
    const s = config[status as keyof typeof config] || { text: status, cls: "" };
    return (
      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${s.cls}`}>
        {s.text}
      </span>
    );
  };

  const renderPage = () => {
    if (showPendingDepositMessage) {
      return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center bg-cover bg-center" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.92), rgba(255,255,255,0.92)), url(${HIMALAYA_IMAGES.peak})` }}>
           <div className="w-32 h-32 bg-primary/5 text-primary rounded-full flex items-center justify-center mb-8 animate-pulse border-4 border-white premium-shadow">
              <ShieldCheck size={56} strokeWidth={1.5} />
           </div>
           <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">प्रमाणिकरण हुँदैछ</h2>
           <p className="text-gray-500 text-sm font-medium leading-relaxed mb-10 px-4">तपाईंको निक्षेपको प्रमाण जाँच गरिँदैछ। यस प्रक्रियालाई ३०-६० मिनेट लाग्न सक्छ।</p>
           <button onClick={() => { setShowPendingDepositMessage(false); setCurrentPage(Page.PROFILE); }} className="w-full bg-primary text-white py-5 rounded-[24px] font-black primary-glow active:scale-95 transition-all">
             प्रोफाइल हेर्नुहोस्
           </button>
        </div>
      );
    }

    switch (currentPage) {
      case Page.HOME:
        return (
          <div className="page-transition pb-32">
            <div className="relative h-[420px] w-full overflow-hidden shadow-2xl rounded-b-[60px]">
              <img src={HIMALAYA_IMAGES.hero} alt="Nepal Himalayas" className="w-full h-full object-cover scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/40 to-transparent flex flex-col justify-end p-10">
                <div className="flex items-center gap-2 mb-3">
                   <div className="w-8 h-px bg-primary"></div>
                   <span className="text-[10px] font-extrabold uppercase tracking-[0.4em] text-white/60">लन्च: ७ जनवरी २०२४</span>
                </div>
                <h1 className="text-4xl font-black text-white leading-none tracking-tighter mb-4 uppercase">हिमालयन<br/><span className="text-primary">लगानी</span> हब</h1>
                <div className="flex gap-3">
                  <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                    <MapPin size={10} className="text-primary" />
                    <span className="text-[9px] font-black text-white/80 uppercase tracking-widest">नेपाल प्रमाणीकरण</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                    <ShieldCheck size={10} className="text-emerald-400" />
                    <span className="text-[9px] font-black text-white/80 uppercase tracking-widest">सुरक्षित हब</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 -mt-12 relative z-10 space-y-8">
              <div className="bg-white rounded-[40px] p-8 premium-shadow grid grid-cols-4 gap-4 border border-gray-100">
                <button onClick={() => setCurrentPage(Page.DEPOSIT)} className="flex flex-col items-center gap-2 group">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center transition-all group-active:scale-90 shadow-sm"><PlusCircle size={24} strokeWidth={2.5}/></div>
                  <span className="text-[10px] font-black uppercase text-gray-500">निक्षेप</span>
                </button>
                <button onClick={() => setCurrentPage(Page.WITHDRAW)} className="flex flex-col items-center gap-2 group">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center transition-all group-active:scale-90 shadow-sm"><ArrowDownCircle size={24} strokeWidth={2.5}/></div>
                  <span className="text-[10px] font-black uppercase text-gray-500">निकासी</span>
                </button>
                <button onClick={() => setCurrentPage(Page.SPIN_WHEEL)} className="flex flex-col items-center gap-2 group">
                  <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center transition-all group-active:scale-90 shadow-sm"><RotateCcw size={24} strokeWidth={2.5}/></div>
                  <span className="text-[10px] font-black uppercase text-gray-500">स्पिन</span>
                </button>
                <button onClick={() => window.open(SUPPORT_LINKS.telegramGroup, '_blank')} className="flex flex-col items-center gap-2 group">
                  <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center transition-all group-active:scale-90 shadow-sm"><MessageCircle size={24} strokeWidth={2.5}/></div>
                  <span className="text-[10px] font-black uppercase text-gray-500">सहयोग</span>
                </button>
              </div>

              {/* Telegram Promo */}
              <div onClick={() => window.open(SUPPORT_LINKS.telegramGroup, '_blank')} className="bg-gradient-to-r from-sky-500 to-sky-600 p-6 rounded-[32px] text-white premium-shadow flex items-center justify-between cursor-pointer active:scale-95 transition-all">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                       <Send size={24} />
                    </div>
                    <div>
                       <p className="font-black text-lg tracking-tight leading-none">टेलिग्राम हबमा जोडिनुहोस्</p>
                       <p className="text-[10px] font-bold opacity-80 uppercase mt-1">नयाँ अपडेट र उपहारहरू प्राप्त गर्नुहोस्</p>
                    </div>
                 </div>
                 <ExternalLink size={20} className="opacity-60" />
              </div>

              <div className="flex items-center justify-between px-2">
                 <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                   <div className="w-2 h-8 bg-primary rounded-full"></div>
                   VIP लगानीका अवसरहरू
                 </h2>
                 <button onClick={() => setCurrentPage(Page.PRODUCTS)} className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1">सबै हेर्नुहोस् <ChevronRight size={14}/></button>
              </div>

              <div className="space-y-6">
                {INVESTMENT_PLANS.slice(0, 3).map(plan => (
                  <div key={plan.id} className="bg-white rounded-[48px] overflow-hidden premium-shadow border border-gray-50 relative group active:scale-[0.98] transition-all">
                    <div className="h-3 bg-primary/10"></div>
                    <div className="p-8">
                      <div className="flex justify-between items-start mb-8">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center"><Zap size={24} strokeWidth={2.5}/></div>
                           <div>
                              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">{plan.name}</h3>
                              <div className="flex items-center gap-1">
                                <Star size={10} className="fill-amber-400 text-amber-400" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">१५% दैनिक नाफा</span>
                              </div>
                           </div>
                        </div>
                        <div className="bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                           <span className="text-[10px] font-black text-emerald-700">प्रमाणित</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 mb-8">
                         <div className="bg-gray-50 p-3 rounded-2xl text-center">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">मूल्य</span>
                            <span className="text-sm font-black text-gray-900">{formatNPR(plan.price)}</span>
                         </div>
                         <div className="bg-emerald-50/30 p-3 rounded-2xl text-center">
                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest block mb-1">दैनिक</span>
                            <span className="text-sm font-black text-emerald-700">+{formatNPR(plan.dailyProfit)}</span>
                         </div>
                         <div className="bg-gray-50 p-3 rounded-2xl text-center">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">अवधि</span>
                            <span className="text-sm font-black text-gray-900">{plan.duration} दिन</span>
                         </div>
                      </div>

                      <button onClick={() => handleInvest(plan)} className="w-full bg-primary text-white py-5 rounded-[24px] font-black text-lg primary-glow flex items-center justify-center gap-2 transition-all active:scale-95">
                        अहिले लगानी गर्नुहोस्
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case Page.PRODUCTS:
        return (
          <div className="page-transition pb-32 pt-10 px-6 space-y-10">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 bg-white rounded-[24px] premium-shadow border border-gray-100 flex items-center justify-center text-primary"><Zap size={28} strokeWidth={2.5}/></div>
               <div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">VIP लगानी क्याटलग</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">आफ्नो आम्दानी बढाउनुहोस्</p>
               </div>
            </div>
            
            <div className="space-y-6">
               {INVESTMENT_PLANS.map(plan => (
                  <div key={plan.id} className="bg-white rounded-[40px] p-8 premium-shadow border border-gray-50 relative overflow-hidden group active:scale-[0.98] transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="flex justify-between items-center mb-6 relative z-10">
                      <h3 className="text-2xl font-black text-gray-900 tracking-tight">{plan.name}</h3>
                      <div className="text-right">
                         <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">लगानी मूल्य</span>
                         <span className="text-xl font-black text-primary">{formatNPR(plan.price)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 mb-8 relative z-10">
                       <div className="space-y-1">
                          <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">दैनिक आम्दानी</p>
                          <p className="text-lg font-black text-gray-900">+{formatNPR(plan.dailyProfit)}</p>
                       </div>
                       <div className="w-px h-8 bg-gray-100"></div>
                       <div className="space-y-1">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">अवधि</p>
                          <p className="text-lg font-black text-gray-900">{plan.duration} दिन</p>
                       </div>
                    </div>
                    <button onClick={() => handleInvest(plan)} className="w-full bg-gray-900 text-white py-5 rounded-[24px] font-black active:scale-95 transition-all shadow-xl shadow-gray-200 uppercase tracking-widest">
                      लगानी सुरु गर्नुहोस्
                    </button>
                  </div>
               ))}
            </div>
          </div>
        );

      case Page.PROFILE:
        return (
          <div className="page-transition pb-40">
             <div className="bg-white rounded-b-[60px] pt-16 pb-12 px-8 premium-shadow border-b border-gray-100 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.95), rgba(255,255,255,0.95)), url(${HIMALAYA_IMAGES.pattern})` }}>
                <div className="flex items-center gap-6 mb-12">
                   <div className="w-24 h-24 rounded-[32px] overflow-hidden border-4 border-white premium-shadow">
                      <img src={`https://picsum.photos/seed/${currentUser?.id}/200`} alt="Avatar" className="w-full h-full object-cover" />
                   </div>
                   <div>
                      <h2 className="text-3xl font-black text-gray-900 tracking-tighter leading-none mb-2">{currentUser?.phoneNumber}</h2>
                      <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full w-fit">
                         <ShieldCheck size={12} strokeWidth={3} />
                         <span className="text-[10px] font-black uppercase tracking-widest">प्रमाणित सदस्य</span>
                      </div>
                   </div>
                </div>

                <div className="bg-primary p-10 rounded-[48px] text-white primary-glow relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent"></div>
                   <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                   
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">कुल ब्यालेन्स</p>
                   <h3 className="text-5xl font-black tracking-tighter mb-12 leading-none">{formatNPR(currentUser?.balance || 0)}</h3>
                   
                   <div className="flex gap-4 relative z-10">
                      <button onClick={() => setCurrentPage(Page.DEPOSIT)} className="flex-1 bg-white text-primary py-5 rounded-3xl font-black text-sm shadow-2xl active:scale-95 transition-all uppercase tracking-widest">रिचार्ज</button>
                      <button onClick={() => setCurrentPage(Page.WITHDRAW)} className="flex-1 bg-white/20 text-white py-5 rounded-3xl font-black text-sm backdrop-blur-md border border-white/20 active:scale-95 transition-all uppercase tracking-widest">निकासी</button>
                   </div>
                </div>
             </div>

             <div className="px-8 mt-10 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                   <div onClick={() => setCurrentPage(Page.SPIN_WHEEL)} className="bg-white p-6 rounded-[32px] border border-gray-100 premium-shadow flex flex-col items-center gap-3 active:scale-95 transition-all group">
                      <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-sm"><RotateCcw size={22} strokeWidth={2.5}/></div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">स्पिन मौका</span>
                      <span className="text-2xl font-black text-gray-900">{currentUser?.spinChances || 0}</span>
                   </div>
                   <div onClick={dailyCheckIn} className="bg-white p-6 rounded-[32px] border border-gray-100 premium-shadow flex flex-col items-center gap-3 active:scale-95 transition-all group">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm"><History size={22} strokeWidth={2.5}/></div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">दैनिक बोनस</span>
                      <span className="text-sm font-black text-indigo-600 uppercase tracking-widest">प्राप्त गर्नुहोस्</span>
                   </div>
                </div>

                <div className="bg-white rounded-[40px] overflow-hidden premium-shadow border border-gray-100 p-2">
                   <div onClick={() => setCurrentPage(Page.HISTORY)} className="p-6 flex items-center justify-between rounded-3xl hover:bg-gray-50 active:bg-gray-100 transition-all">
                      <div className="flex items-center gap-5">
                         <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center"><History size={20} strokeWidth={2.5}/></div>
                         <span className="text-lg font-black text-gray-800 tracking-tight">लेनदेन ईतिहास</span>
                      </div>
                      <ChevronRight size={20} className="text-gray-300" />
                   </div>
                   <div onClick={() => window.open(SUPPORT_LINKS.telegramGroup, '_blank')} className="p-6 flex items-center justify-between rounded-3xl hover:bg-gray-50 active:bg-gray-100 transition-all">
                      <div className="flex items-center gap-5">
                         <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center"><MessageCircle size={20} strokeWidth={2.5}/></div>
                         <span className="text-lg font-black text-gray-800 tracking-tight">सम्पर्क र सहयोग</span>
                      </div>
                      <ChevronRight size={20} className="text-gray-300" />
                   </div>
                   <div onClick={handleLogout} className="p-6 flex items-center justify-between rounded-3xl hover:bg-rose-50 transition-all">
                      <div className="flex items-center gap-5">
                         <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center"><LogOut size={20} strokeWidth={2.5}/></div>
                         <span className="text-lg font-black text-rose-600 tracking-tight">बाहिर जानुहोस्</span>
                      </div>
                   </div>
                </div>

                {currentUser?.isAdmin && (
                  <div onClick={() => setCurrentPage(Page.ADMIN)} className="w-full bg-gray-900 text-white p-8 rounded-[40px] border-t-8 border-primary primary-glow active:scale-[0.98] transition-all cursor-pointer">
                    <div className="flex items-center gap-5">
                       <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                          <ShieldCheck size={32} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-1">प्रशासक नियन्त्रण</p>
                          <p className="text-2xl font-black tracking-tight leading-none uppercase">एडमिन टर्मिनल</p>
                       </div>
                    </div>
                  </div>
                )}

                <div className="text-center opacity-30 pt-10">
                   <img src={HIMALAYA_IMAGES.peak} alt="Peak" className="w-full h-24 object-cover rounded-[32px] mb-3 grayscale" />
                   <p className="text-[8px] font-black tracking-[1em] uppercase">हिमालयन लगानी हब</p>
                </div>
             </div>
          </div>
        );

      case Page.SPIN_WHEEL:
        return (
          <div className="page-transition min-h-screen bg-white pb-40 pt-10 px-8 flex flex-col items-center bg-cover bg-center" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.92), rgba(255,255,255,0.92)), url(${HIMALAYA_IMAGES.spin})` }}>
            <div className="w-full flex items-center justify-between mb-8">
               <button onClick={() => setCurrentPage(Page.HOME)} className="bg-white p-4 rounded-3xl premium-shadow border border-gray-100"><XCircle size={24} className="text-gray-400"/></button>
               <div className="text-center">
                  <h2 className="text-2xl font-black text-gray-900 leading-none uppercase">लक्की स्पिन</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">पुरस्कार जित्न स्पिन गर्नुहोस्</p>
               </div>
               <div className="w-12"></div>
            </div>

            <div className="bg-primary/5 p-10 rounded-[48px] border-2 border-primary/10 w-full mb-12 flex flex-col items-center backdrop-blur-sm shadow-inner">
               <div className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4">स्पिन मौका</div>
               <div className="flex items-center gap-3">
                  <RotateCcw className={`text-primary ${isSpinning ? 'animate-spin' : ''}`} size={42} strokeWidth={3} />
                  <span className="text-6xl font-black text-gray-900 tracking-tighter">{currentUser?.spinChances || 0}</span>
               </div>
               <p className="text-[9px] font-bold text-gray-400 mt-4 uppercase tracking-[0.2em] text-center px-4 leading-relaxed">तपाईंले रिफर गरेका साथीले १०००+ रिचार्ज गरेमा थप स्पिन पाउनुहुनेछ!</p>
            </div>

            <div className="relative w-80 h-80 mb-16 select-none">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 z-20">
                  <div className="w-10 h-14 bg-rose-600 rounded-b-3xl shadow-2xl border-2 border-white flex items-center justify-center">
                     <div className="w-1.5 h-8 bg-white/20 rounded-full animate-pulse"></div>
                  </div>
               </div>
               
               <div ref={wheelRef} className="w-full h-full rounded-full border-[10px] border-white shadow-[0_30px_60px_-15px_rgba(93,63,211,0.5)] relative overflow-hidden bg-white transition-all ease-out">
                  {spinRewards.map((r, i) => (
                    <div 
                      key={i} 
                      className="absolute w-full h-full flex items-center justify-center origin-center"
                      style={{ 
                        transform: `rotate(${i * (360 / spinRewards.length)}deg)`,
                      }}
                    >
                      <div className="absolute top-0 w-full h-1/2 flex flex-col items-center pt-8" style={{ transform: `rotate(30deg)` }}>
                         <span className="text-white font-black text-4xl drop-shadow-xl">{r}</span>
                      </div>
                      <div className="absolute inset-0" style={{ 
                        background: i % 2 === 0 ? 'var(--primary)' : '#7C4DFF', 
                        clipPath: 'polygon(50% 50%, 0 0, 100% 0)',
                        zIndex: -1
                      }}></div>
                    </div>
                  ))}
                  <div className="absolute inset-0 m-auto w-24 h-24 bg-white rounded-full premium-shadow z-10 border-[10px] border-primary flex flex-col items-center justify-center overflow-hidden">
                    <div className="w-4 h-4 bg-primary rounded-full relative z-10 animate-ping"></div>
                    <div className="w-4 h-4 bg-primary rounded-full relative z-10"></div>
                  </div>
               </div>
            </div>

            {spinResult && !isSpinning && (
              <div className="mb-10 p-8 bg-emerald-100 border-2 border-emerald-200 rounded-[40px] text-center animate-bounce shadow-2xl w-full">
                <Trophy className="mx-auto text-emerald-600 mb-2" size={48} strokeWidth={2.5}/>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">विजेता पुरस्कार</p>
                <p className="text-4xl font-black text-emerald-700 leading-none">+{formatNPR(spinResult)}</p>
              </div>
            )}

            <button onClick={handleSpin} disabled={!currentUser || currentUser.spinChances <= 0 || isSpinning} className={`w-full py-6 rounded-[32px] font-black text-2xl tracking-tighter shadow-2xl transition-all ${currentUser && currentUser.spinChances > 0 && !isSpinning ? 'bg-primary text-white primary-glow active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
              {isSpinning ? 'स्पिन हुँदैछ...' : 'स्पिन गर्नुहोस्'}
            </button>
          </div>
        );

      case Page.DEPOSIT:
        return (
          <div className="page-transition pb-40 pt-10 px-6 space-y-10">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <button onClick={() => setCurrentPage(Page.HOME)} className="bg-white p-4 rounded-3xl premium-shadow border border-gray-100"><ChevronRight className="rotate-180 text-gray-400"/></button>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none uppercase">खाता<br/><span className="text-primary">रिचार्ज</span></h2>
               </div>
            </div>

            <div className="bg-white p-8 rounded-[48px] premium-shadow border border-gray-50 space-y-10">
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                     <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                     रकम छनौट गर्नुहोस्
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                     {[1000, 2000, 3000, 4000, 5000, 6000, 10000].map(amt => (
                        <button key={amt} onClick={() => setSelectedDepositAmount(amt)} className={`py-5 rounded-[24px] font-black text-lg transition-all border-2 ${selectedDepositAmount === amt ? 'border-primary bg-primary/5 text-primary scale-105 premium-shadow' : 'border-gray-50 bg-gray-50 text-gray-400 active:scale-95'}`}>
                           {amt.toLocaleString()}
                        </button>
                     ))}
                  </div>
               </div>

               <div className="bg-gray-900 p-8 rounded-[40px] text-white shadow-2xl space-y-8 relative overflow-hidden border border-white/5">
                  <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent"></div>
                  <div className="flex items-center gap-3 opacity-60">
                     <Building size={16} />
                     <p className="text-[10px] font-black uppercase tracking-widest leading-none">{BANK_DETAILS.bankName}</p>
                  </div>
                  <div className="space-y-6 relative z-10">
                     <div>
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">खातावालाको नाम</p>
                        <p className="text-xl font-black tracking-tight">{BANK_DETAILS.accountName}</p>
                     </div>
                     <div className="bg-white/10 p-6 rounded-3xl border border-white/10 flex justify-between items-center group active:scale-95 transition-all" onClick={() => { navigator.clipboard.writeText(BANK_DETAILS.accountNo); alert("खाता नम्बर कपी गरियो!"); }}>
                        <div>
                           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">खाता नम्बर</p>
                           <p className="text-3xl font-black font-mono tracking-tighter text-primary group-hover:text-white transition-colors">{BANK_DETAILS.accountNo}</p>
                        </div>
                        <Copy size={24} className="text-white/20" />
                     </div>
                     <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-[10px] font-bold text-amber-200 uppercase tracking-widest leading-relaxed">
                        सूचना: कृपया माथि दिइएको आधिकारिक बैंक खातामा मात्र रकम जम्मा गर्नुहोस्।
                     </div>
                  </div>
               </div>

               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                     <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                     ट्रान्सफरको प्रमाण (Screenshot)
                  </p>
                  <label className="border-4 border-dashed border-gray-100 rounded-[48px] h-72 flex flex-col items-center justify-center space-y-4 cursor-pointer bg-gray-50/50 hover:bg-gray-100 transition-all overflow-hidden relative shadow-inner group">
                     {depositScreenshot ? (
                        <>
                           <img src={depositScreenshot} alt="Verification" className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md">
                              <button onClick={(e) => { e.preventDefault(); setDepositScreenshot(''); }} className="bg-rose-500 text-white px-8 py-4 rounded-[24px] font-black flex items-center gap-2 shadow-2xl active:scale-90">
                                 <XCircle size={20}/>
                                 <span>तस्विर हटाउनुहोस्</span>
                              </button>
                           </div>
                        </>
                     ) : (
                        <>
                           <div className="w-20 h-20 bg-white rounded-[28px] premium-shadow border border-gray-100 flex items-center justify-center text-primary group-hover:scale-110 group-hover:rotate-12 transition-all">
                              <Camera size={42} strokeWidth={2}/>
                           </div>
                           <div className="text-center px-8">
                              <span className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-1">स्क्रिनसट अपलोड गर्नुहोस्</span>
                              <p className="text-[9px] font-bold text-gray-300 uppercase">पूरा ट्रान्सफर प्रमाण देखिने गरी फोटो खिच्नुहोस्।</p>
                           </div>
                           <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                 const reader = new FileReader();
                                 reader.onload = (ev) => setDepositScreenshot(ev.target?.result as string);
                                 reader.readAsDataURL(file);
                              }
                           }} />
                        </>
                     )}
                  </label>
               </div>

               <button disabled={!depositScreenshot} onClick={() => handleDeposit(selectedDepositAmount, depositScreenshot)} className={`w-full py-6 rounded-[32px] font-black text-xl shadow-2xl transition-all ${depositScreenshot ? 'bg-primary text-white primary-glow active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                  प्रमाणीकरणको लागि पठाउनुहोस्
               </button>
            </div>
          </div>
        );

      case Page.WITHDRAW:
        return (
          <div className="page-transition pb-40 pt-10 px-6 space-y-10">
            <div className="flex items-center gap-4">
               <button onClick={() => setCurrentPage(Page.PROFILE)} className="bg-white p-4 rounded-3xl premium-shadow border border-gray-100"><ChevronRight className="rotate-180 text-gray-400"/></button>
               <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none uppercase">रकम<br/><span className="text-primary">निकासी</span></h2>
            </div>

            <div className="bg-white p-8 rounded-[48px] premium-shadow border border-gray-50 space-y-10">
               <div className="bg-primary p-10 rounded-[40px] text-white primary-glow relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-white/10 to-transparent"></div>
                  <div className="relative z-10 flex flex-col items-center">
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">निकाल्न मिल्ने ब्यालेन्स</p>
                     <span className="text-5xl font-black tracking-tighter mb-4">{formatNPR(currentUser?.balance || 0)}</span>
                     <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                        <Lock size={10} className="text-emerald-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest">निकासीका लागि उपलब्ध</span>
                     </div>
                  </div>
               </div>

               <div className="space-y-8">
                  <div>
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4 ml-2">निकाल्ने रकम (NPR)</label>
                     <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 font-black text-xl tracking-tight">NPR</span>
                        <input id="withdraw-amt" type="number" placeholder={`न्यूनतम ${APP_CONFIG.minWithdraw}`} className="w-full pl-24 p-6 bg-gray-50 border border-gray-100 rounded-[32px] focus:outline-none focus:bg-white focus:border-primary/30 font-black text-2xl placeholder:text-gray-200 transition-all shadow-inner" />
                     </div>
                  </div>

                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-2">प्राप्त गर्ने बैंकको विवरण</label>
                     <div className="relative group">
                        <Building size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" />
                        <input id="w-bank" type="text" placeholder="बैंकको नाम" className="w-full pl-16 p-5 bg-gray-50 border border-gray-100 rounded-3xl focus:outline-none focus:bg-white focus:border-primary/30 text-sm font-black shadow-inner" />
                     </div>
                     <div className="relative group">
                        <UserIcon size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" />
                        <input id="w-name" type="text" placeholder="खातावालाको पूरा नाम" className="w-full pl-16 p-5 bg-gray-50 border border-gray-100 rounded-3xl focus:outline-none focus:bg-white focus:border-primary/30 text-sm font-black shadow-inner" />
                     </div>
                     <div className="relative group">
                        <CreditCard size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" />
                        <input id="w-acc" type="text" placeholder="खाता नम्बर" className="w-full pl-16 p-5 bg-gray-50 border border-gray-100 rounded-3xl focus:outline-none focus:bg-white focus:border-primary/30 text-sm font-black font-mono shadow-inner tracking-tighter" />
                     </div>
                  </div>

                  <div className="bg-rose-50 p-6 rounded-[36px] space-y-3 border border-rose-100 shadow-inner">
                     <div className="flex items-center gap-2 text-rose-600">
                        <AlertCircle size={16} strokeWidth={2.5}/>
                        <p className="text-[10px] font-black uppercase tracking-widest leading-none">निकासी नियमहरू</p>
                     </div>
                     <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-black text-rose-400 uppercase tracking-widest">
                           <span>निकासी शुल्क</span>
                           <span className="text-rose-600">२०%</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-black text-rose-400 uppercase tracking-widest">
                           <span>समय</span>
                           <span className="text-rose-600">०९:०० - १७:००</span>
                        </div>
                     </div>
                  </div>
               </div>

               <button onClick={() => {
                  const amt = Number((document.getElementById('withdraw-amt') as HTMLInputElement).value);
                  const b = (document.getElementById('w-bank') as HTMLInputElement).value;
                  const n = (document.getElementById('w-name') as HTMLInputElement).value;
                  const a = (document.getElementById('w-acc') as HTMLInputElement).value;
                  initiateWithdraw(amt, b, n, a);
               }} className="w-full bg-primary text-white py-6 rounded-[32px] font-black text-xl primary-glow active:scale-95 transition-all flex items-center justify-center gap-3 shadow-2xl uppercase tracking-widest">
                  निकासी अनुरोध गर्नुहोस्
                  <Zap size={20} className="fill-white" />
               </button>
            </div>
          </div>
        );

      case Page.HISTORY:
        const filteredTrans = transactions.filter(t => t.userId === currentUser?.id && t.type === (historyTab === 'deposit' ? 'deposit' : 'withdraw'));
        return (
          <div className="page-transition pb-40 pt-10 px-6 space-y-10">
             <div className="flex items-center gap-4">
                <button onClick={() => setCurrentPage(Page.PROFILE)} className="bg-white p-4 rounded-3xl premium-shadow border border-gray-100"><ChevronRight className="rotate-180 text-gray-400"/></button>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none uppercase">लेनदेन<br/><span className="text-primary">ईतिहास</span></h2>
             </div>

             <div className="flex bg-gray-100 p-2 rounded-[32px] shadow-inner">
                <button onClick={() => setHistoryTab('deposit')} className={`flex-1 py-4 rounded-[24px] font-black text-[10px] uppercase tracking-widest transition-all ${historyTab === 'deposit' ? 'bg-white text-primary premium-shadow' : 'text-gray-400'}`}>निक्षेप</button>
                <button onClick={() => setHistoryTab('withdraw')} className={`flex-1 py-4 rounded-[24px] font-black text-[10px] uppercase tracking-widest transition-all ${historyTab === 'withdraw' ? 'bg-white text-primary premium-shadow' : 'text-gray-400'}`}>निकासी</button>
             </div>

             {filteredTrans.length === 0 ? (
               <div className="bg-white p-24 rounded-[48px] text-center border border-gray-100 premium-shadow">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 opacity-20"><History size={42}/></div>
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.5em]">कुनै ईतिहास छैन</p>
               </div>
             ) : (
               <div className="space-y-4">
                  {filteredTrans.map(t => (
                    <div key={t.id} className="bg-white p-6 rounded-[32px] premium-shadow border border-gray-50 flex items-center justify-between group hover:border-primary/20 transition-all">
                       <div className="flex items-center gap-5">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${t.status === 'approved' ? 'bg-emerald-50 text-emerald-500' : t.status === 'pending' ? 'bg-amber-50 text-amber-500' : 'bg-rose-50 text-rose-500'}`}>
                             {t.type === 'deposit' ? <PlusCircle size={22} strokeWidth={2.5}/> : <ArrowDownCircle size={22} strokeWidth={2.5}/>}
                          </div>
                          <div>
                             <p className="font-black text-gray-900 tracking-tight text-lg leading-none mb-1 uppercase">{t.type === 'deposit' ? 'निक्षेप' : 'निकासी'}</p>
                             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{new Date(t.timestamp).toLocaleDateString()}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className={`text-xl font-black tracking-tighter mb-1 ${t.type === 'withdraw' ? 'text-rose-500' : 'text-emerald-600'}`}>{formatNPR(t.amount)}</p>
                          <StatusBadge status={t.status} />
                       </div>
                    </div>
                  ))}
               </div>
             )}
          </div>
        );

      case Page.TEAM:
        const directRefs = users.filter(u => u.referredBy === currentUser?.referralCode);
        return (
          <div className="page-transition pb-40 pt-10 px-6 space-y-10">
             <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white rounded-[24px] premium-shadow border border-gray-100 flex items-center justify-center text-primary"><Users size={28} strokeWidth={2.5}/></div>
                <div>
                   <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none uppercase">नेटवर्क<br/><span className="text-primary">हब</span></h2>
                </div>
             </div>

             <div className="bg-gray-950 p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/20 to-transparent"></div>
                <div className="space-y-8 relative z-10">
                   <div>
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                        <div className="w-1.5 h-3 bg-primary rounded-full"></div>
                        तपाईंको रिफर कोड
                      </p>
                      <div className="bg-white/10 p-6 rounded-[32px] border border-white/10 flex justify-between items-center group active:scale-95 transition-all" onClick={() => { navigator.clipboard.writeText(currentUser?.referralCode || ''); alert("रिफर कोड कपी गरियो!"); }}>
                         <span className="text-4xl font-black tracking-[0.2em] font-mono text-primary group-hover:text-white transition-colors">{currentUser?.referralCode}</span>
                         <Copy size={24} className="text-white/20" />
                      </div>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                        <div className="w-1.5 h-3 bg-primary rounded-full"></div>
                        सिधै जोड्ने लिंक
                      </p>
                      <div className="bg-white/10 p-4 rounded-2xl border border-white/10 flex justify-between items-center text-[10px] font-bold text-white/60">
                         <span className="truncate mr-4 italic">himalayan-hub.net/join?ref={currentUser?.referralCode}</span>
                         <Copy size={16} className="shrink-0" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(`https://himalayan-hub.net/join?ref=${currentUser?.referralCode}`); alert("लिंक कपी गरियो!"); }} />
                      </div>
                   </div>
                </div>
             </div>

             <div className="space-y-4">
                <div className="bg-white p-6 rounded-[32px] premium-shadow border border-gray-100 flex items-center justify-between shadow-sm">
                   <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-black">L1</div>
                      <div>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">स्तर १</p>
                         <p className="text-lg font-black text-gray-900 tracking-tight">प्रत्यक्ष बोनस (२५%)</p>
                      </div>
                   </div>
                   <span className="bg-primary text-white px-4 py-2 rounded-2xl font-black text-sm">{directRefs.length}</span>
                </div>
                <div className="bg-white p-6 rounded-[32px] premium-shadow border border-gray-100 flex items-center justify-between opacity-50 grayscale pointer-events-none shadow-sm">
                   <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black">L2</div>
                      <div>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">स्तर २</p>
                         <p className="text-lg font-black text-gray-900 tracking-tight">नेटवर्क बोनस (४%)</p>
                      </div>
                   </div>
                   <ChevronRight size={24} className="text-gray-200" />
                </div>
             </div>

             <div className="bg-primary/5 p-10 rounded-[48px] border-2 border-primary/10 text-center premium-shadow">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-2">कुल नेटवर्क आम्दानी</p>
                <p className="text-5xl font-black text-primary tracking-tighter">{formatNPR(currentUser?.totalEarnings || 0)}</p>
             </div>
          </div>
        );

      case Page.ADMIN:
        const pendingTransactions = transactions.filter(t => t.status === 'pending');
        return (
          <div className="page-transition min-h-screen bg-gray-50 pb-40 pt-10 px-8 space-y-12">
             <div className="flex justify-between items-center">
                <h2 className="text-4xl font-black text-gray-950 tracking-tighter uppercase">एडमिन कन्ट्रोल</h2>
                <button onClick={handleLogout} className="bg-rose-50 text-rose-600 px-6 py-3 rounded-2xl font-black text-xs border border-rose-100 shadow-sm active:scale-95 transition-all">बाहिर जानुहोस्</button>
             </div>

             <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[40px] premium-shadow border border-gray-100 relative overflow-hidden">
                   <div className="absolute -top-10 -left-10 w-24 h-24 bg-primary/5 rounded-full blur-2xl"></div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">कुल सदस्य</p>
                   <p className="text-5xl font-black text-gray-900 tracking-tighter">{users.length}</p>
                </div>
                <div className="bg-white p-8 rounded-[40px] premium-shadow border border-gray-100 relative overflow-hidden">
                   <div className="absolute -top-10 -left-10 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl"></div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">प्रतिक्षामा रहेका</p>
                   <p className="text-5xl font-black text-amber-500 tracking-tighter">{pendingTransactions.length}</p>
                </div>
             </div>

             <div className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm"><Zap size={20} strokeWidth={2.5}/></div>
                <h3 className="font-black text-2xl text-gray-800 tracking-tight">भेरिफिकेशन बाँकी</h3>
             </div>

             {pendingTransactions.length === 0 ? (
               <div className="bg-white p-24 rounded-[48px] text-center border border-gray-100 premium-shadow">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 opacity-20"><History size={42}/></div>
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.5em]">अहिले केहि छैन</p>
               </div>
             ) : (
               <div className="space-y-8">
                  {pendingTransactions.map(t => {
                     const u = users.find(usr => usr.id === t.userId);
                     let wd = null;
                     if (t.type === 'withdraw' && t.bankDetails) { try { wd = JSON.parse(t.bankDetails); } catch(e) {} }
                     
                     return (
                        <div key={t.id} className="bg-white p-8 rounded-[48px] premium-shadow border border-gray-100 space-y-8 relative overflow-hidden group">
                           <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                 <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${t.type === 'deposit' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{t.type === 'deposit' ? 'निक्षेप' : 'निकासी'}</span>
                                 <p className="text-2xl font-black text-gray-900 tracking-tight">{u?.phoneNumber}</p>
                              </div>
                              <div className="text-right">
                                 <p className="text-3xl font-black text-primary tracking-tighter leading-none mb-1">{formatNPR(t.amount)}</p>
                                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(t.timestamp).toLocaleString()}</p>
                              </div>
                           </div>

                           {t.type === 'deposit' && t.screenshot && (
                              <div className="relative h-72 rounded-[40px] overflow-hidden border-4 border-gray-50 shadow-inner group">
                                 <img src={t.screenshot} alt="Audit" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                 <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm" onClick={() => setEnlargedImage(t.screenshot || null)}>
                                    <button className="bg-white text-gray-950 px-8 py-4 rounded-[24px] font-black flex items-center gap-3 shadow-2xl active:scale-95 transition-all">
                                       <Eye size={20}/>
                                       तस्विर हेर्नुहोस्
                                    </button>
                                 </div>
                              </div>
                           )}

                           {t.type === 'withdraw' && wd && (
                              <div className="bg-gray-50 p-8 rounded-[40px] border border-gray-100 space-y-6 shadow-inner">
                                 <div className="flex items-center gap-3 text-gray-400">
                                    <Building size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">बैंक विवरण</span>
                                 </div>
                                 <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm font-black text-gray-900">
                                       <span className="text-[10px] text-gray-400 uppercase">बैंक</span>
                                       <span>{wd.bank}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-black text-gray-900">
                                       <span className="text-[10px] text-gray-400 uppercase">खातावाला</span>
                                       <span>{wd.holder}</span>
                                    </div>
                                    <div className="bg-white p-6 rounded-3xl border border-gray-200 flex justify-between items-center group active:scale-95 transition-all" onClick={() => { navigator.clipboard.writeText(wd.acc); alert("खाता नम्बर कपी गरियो!"); }}>
                                       <div className="space-y-1">
                                          <span className="text-[9px] font-black text-gray-400 uppercase block tracking-widest">खाता नम्बर</span>
                                          <span className="text-2xl font-black font-mono tracking-tighter text-primary">{wd.acc}</span>
                                       </div>
                                       <Copy size={24} className="text-gray-200 group-hover:text-primary transition-colors" />
                                    </div>
                                 </div>
                              </div>
                           )}

                           <div className="grid grid-cols-2 gap-4">
                              <button onClick={() => approveTransaction(t.id)} className="bg-emerald-600 text-white py-6 rounded-[28px] font-black text-lg primary-glow flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all">
                                 <CheckCircle size={22} strokeWidth={2.5}/>
                                 स्विकृत
                              </button>
                              <button onClick={() => rejectTransaction(t.id)} className="bg-rose-500 text-white py-6 rounded-[28px] font-black text-lg shadow-2xl shadow-rose-500/30 active:scale-95 transition-all flex items-center justify-center gap-3">
                                 <XCircle size={22} strokeWidth={2.5}/>
                                 अस्विकृत
                              </button>
                           </div>
                        </div>
                     );
                  })}
               </div>
             )}
          </div>
        );

      case Page.LOGIN:
      case Page.REGISTER:
        const isReg = currentPage === Page.REGISTER;
        return (
          <div className="page-transition min-h-screen bg-white p-8 flex flex-col justify-center">
             <div className="mb-12 text-center">
                <div className="w-32 h-32 mx-auto mb-8 rounded-[48px] overflow-hidden premium-shadow border-4 border-white animate-pulse">
                   <img src={HIMALAYA_IMAGES.login} alt="Portal" className="w-full h-full object-cover" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tighter leading-none mb-3 uppercase">हिमालयन<br/><span className="text-primary">लगानी</span> हब</h1>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] mb-1">सुरक्षित लगानी पोर्टल</p>
             </div>

             <div className="space-y-8">
                <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 ml-2">मोबाइल नम्बर (+९७७)</label>
                   <div className="bg-gray-50/50 border border-gray-100 rounded-[28px] p-5 flex items-center shadow-inner group focus-within:border-primary/30 transition-all">
                      <span className="text-gray-400 font-bold mr-3">+977</span>
                      <input id="auth-phone" type="tel" maxLength={10} placeholder="९८XXXXXXXX" className="bg-transparent w-full focus:outline-none font-black text-lg tracking-widest" />
                   </div>
                </div>
                <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 ml-2">पासवर्ड</label>
                   <div className="bg-gray-50/50 border border-gray-100 rounded-[28px] p-5 flex items-center shadow-inner focus-within:border-primary/30 transition-all">
                      <Lock className="text-gray-300 mr-3" size={20}/>
                      <input id="auth-pass" type="password" placeholder="********" className="bg-transparent w-full focus:outline-none font-black text-lg tracking-widest" />
                   </div>
                </div>
                {isReg && (
                   <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 ml-2">रिफर कोड (यदि छ भने)</label>
                      <div className="bg-gray-50/50 border border-gray-100 rounded-[28px] p-5 flex items-center shadow-inner focus-within:border-primary/30 transition-all">
                         <Users className="text-gray-300 mr-3" size={20}/>
                         <input id="auth-ref" type="text" placeholder="CODE123" className="bg-transparent w-full focus:outline-none font-black text-lg tracking-widest uppercase" />
                      </div>
                   </div>
                )}
                
                <button onClick={() => {
                   const p = (document.getElementById('auth-phone') as HTMLInputElement).value;
                   const pw = (document.getElementById('auth-pass') as HTMLInputElement).value;
                   const r = isReg ? (document.getElementById('auth-ref') as HTMLInputElement).value : '';
                   isReg ? handleRegister(p, pw, r) : handleLogin(p, pw);
                }} className="w-full bg-primary text-white py-6 rounded-[32px] font-black text-xl primary-glow active:scale-95 transition-all shadow-2xl uppercase tracking-tighter">
                   {isReg ? 'नयाँ खाता खोल्नुहोस्' : 'लगइन गर्नुहोस्'}
                </button>

                <p className="text-center text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                   {isReg ? 'पहिले नै खाता छ?' : 'नयाँ हुनुहुन्छ?'} 
                   <span onClick={() => setCurrentPage(isReg ? Page.LOGIN : Page.REGISTER)} className="text-primary font-black ml-1 cursor-pointer underline underline-offset-4">
                      {isReg ? 'यहाँ लगइन गर्नुहोस्' : 'दर्ता गर्नुहोस्'}
                   </span>
                </p>
             </div>
          </div>
        );

      default: return null;
    }
  };

  // --- Modals ---

  const WelcomeModal = () => (
    <div className="fixed inset-0 z-[100] bg-gray-950/80 backdrop-blur-xl flex items-center justify-center p-6 page-transition">
       <div className="bg-white rounded-[60px] p-10 w-full max-w-sm text-center space-y-10 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
          <div className="w-24 h-24 bg-primary/10 text-primary rounded-[32px] flex items-center justify-center mx-auto shadow-inner border border-primary/5">
             <Trophy size={48} strokeWidth={2}/>
          </div>
          <div className="space-y-2">
             <h2 className="text-3xl font-black text-gray-950 tracking-tight leading-none uppercase">स्वागत छ!</h2>
             <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">लन्च मिति: ७ जनवरी २०२४</p>
          </div>
          <div className="bg-emerald-50 p-8 rounded-[40px] border-2 border-emerald-100 shadow-inner space-y-4">
             <div>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-1 leading-none">साइनअप बोनस</p>
                <p className="text-3xl font-black text-emerald-700 tracking-tighter">{formatNPR(APP_CONFIG.welcomeBonus)}</p>
             </div>
             <div className="h-px bg-emerald-100 mx-4"></div>
             <div>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-1 leading-none">दैनिक बोनस</p>
                <p className="text-2xl font-black text-emerald-700 tracking-tighter">{formatNPR(APP_CONFIG.dailyCheckInBonus)}</p>
             </div>
          </div>
          
          <div className="space-y-4">
             <button onClick={() => setShowWelcome(false)} className="w-full bg-primary text-white py-6 rounded-[32px] font-black text-xl primary-glow active:scale-95 transition-all shadow-2xl uppercase tracking-widest">
                सुरु गरौं
             </button>
             <button onClick={() => window.open(SUPPORT_LINKS.telegramGroup, '_blank')} className="w-full bg-sky-500 text-white py-4 rounded-[32px] font-black text-sm active:scale-95 transition-all flex items-center justify-center gap-2">
                <Send size={18} />
                टेलिग्राम हबमा जोडिनुहोस्
             </button>
          </div>
       </div>
    </div>
  );

  const WithdrawalConfirmationModal = () => {
    if (!withdrawalToConfirm) return null;
    const f = withdrawalToConfirm.amount * APP_CONFIG.withdrawFee;
    const net = withdrawalToConfirm.amount - f;
    return (
      <div className="fixed inset-0 z-[100] bg-gray-950/80 backdrop-blur-xl flex items-center justify-center p-6 page-transition">
        <div className="bg-white rounded-[60px] p-10 w-full max-w-sm space-y-10 border border-white/20 shadow-2xl">
           <div className="text-center space-y-3">
              <div className="w-20 h-20 bg-primary/5 text-primary rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-inner">
                 <ShieldCheck size={40} strokeWidth={2}/>
              </div>
              <h3 className="text-3xl font-black text-gray-950 tracking-tighter leading-none uppercase">निकासी पुष्टि</h3>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em]">विवरण जाँच गर्नुहोस्</p>
           </div>
           <div className="bg-gray-50 p-8 rounded-[40px] space-y-5 shadow-inner border border-gray-100">
              <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-gray-400">
                 <span>कुल रकम</span>
                 <span className="text-gray-900">{formatNPR(withdrawalToConfirm.amount)}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-gray-400">
                 <span>निकासी शुल्क (२०%)</span>
                 <span className="text-rose-500">-{formatNPR(f)}</span>
              </div>
              <div className="h-px bg-gray-200"></div>
              <div className="flex justify-between items-center">
                 <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">प्राप्त हुने रकम</span>
                 <span className="text-3xl font-black text-primary tracking-tighter">{formatNPR(net)}</span>
              </div>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setWithdrawalToConfirm(null)} className="py-5 rounded-[24px] bg-gray-100 text-gray-500 font-black text-xs uppercase tracking-widest active:scale-95 transition-all">रद्द गर्नुहोस्</button>
              <button onClick={confirmWithdraw} className="py-5 rounded-[24px] bg-primary text-white font-black text-xs uppercase tracking-widest primary-glow active:scale-95 transition-all shadow-2xl">पुष्टि गर्नुहोस्</button>
           </div>
        </div>
      </div>
    );
  };

  const ImageZoomModal = () => {
    if (!enlargedImage) return null;
    return (
      <div className="fixed inset-0 z-[110] bg-gray-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 page-transition">
        <button onClick={() => setEnlargedImage(null)} className="absolute top-10 right-10 bg-white/10 text-white p-5 rounded-full backdrop-blur-md border border-white/20 active:scale-90 transition-all z-[120]">
          <XCircle size={32} />
        </button>
        <div className="w-full h-full flex items-center justify-center">
          <img src={enlargedImage} alt="Record" className="max-w-full max-h-[80vh] object-contain rounded-[40px] shadow-2xl border-4 border-white/10" />
        </div>
        <div className="mt-12 flex items-center gap-3 opacity-40">
           <MapPin size={16} className="text-white"/>
           <p className="text-white font-black text-[10px] uppercase tracking-[1em]">आधिकारिक भेरिफिकेशन रेकर्ड</p>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 relative overflow-x-hidden selection:bg-primary selection:text-white">
      {renderPage()}
      {currentUser && !currentUser.isAdmin && !showPendingDepositMessage && <Navbar />}
      {showWelcome && <WelcomeModal />}
      <WithdrawalConfirmationModal />
      <ImageZoomModal />
      
      {/* Background Silhouettes Decor */}
      <div className="fixed bottom-0 left-0 right-0 -z-10 h-64 opacity-[0.03] pointer-events-none overflow-hidden">
         <img src={HIMALAYA_IMAGES.peak} className="w-full h-full object-cover scale-150 rotate-180" />
      </div>
    </div>
  );
}
