import React, { useState } from 'react';
import { WHEEL_COLORS, Utils, CASES_DATA, ITEMS_DATA } from './config';
import { ShoppingBag, Trophy, ChevronUp, X, UserPlus, Rocket, LayoutGrid } from 'lucide-react';

export const ArenaSelector = ({ setTab }) => (
    <div className="p-6 grid grid-cols-1 gap-6 animate-in fade-in">
        <div className="text-center py-8">
            <h1 className="text-3xl font-black italic text-indigo-900 uppercase">Arena Selector</h1>
        </div>
        <button onClick={() => setTab('roll')} className="h-44 bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[2.5rem] text-white shadow-xl flex flex-col items-center justify-center">
            <span className="text-6xl">🎰</span><span className="font-black italic text-xl mt-2 uppercase">Roll It!</span>
        </button>
        <button onClick={() => setTab('crash')} className="h-44 bg-gradient-to-br from-red-600 to-orange-600 rounded-[2.5rem] text-white shadow-xl flex flex-col items-center justify-center">
            <span className="text-6xl">🚀</span><span className="font-black italic text-xl mt-2 uppercase">Crash Arena</span>
        </button>
    </div>
);

export const RollGame = ({ game, rotation, onBet, timer, inventory, onGiftBet }) => {
  const [showDrawer, setShowDrawer] = useState(false);
  const [mode, setMode] = useState('stars');
  const total = game.bank || 1;
  let currentAngle = 0;

  return (
    <div className="p-4 pb-40 space-y-6 text-center animate-in fade-in">
      <div className="flex justify-between items-center bg-indigo-50 p-2 rounded-full border border-indigo-100 px-6 shadow-inner">
        <span className="text-indigo-900 font-black text-xs uppercase tracking-widest leading-none">Bank: ⭐ {game.bank}</span>
      </div>

      <div className="relative w-80 h-80 mx-auto">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-40 w-1.5 h-10 bg-indigo-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.8)]"></div>
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl" 
             style={{ transform: `rotate(${rotation}deg)`, transition: game.status === 'spinning' ? 'transform 3s cubic-bezier(0.15, 0, 0.15, 1)' : 'none' }}>
          <circle cx="100" cy="100" r="95" fill="white" />
          {game.players.map((p, i) => {
            const slice = (p.bet / total) * 360;
            const mid = Utils.getPointOnWheel(currentAngle + slice/2, 65);
            const x1 = 100 + 90 * Math.cos((currentAngle - 90) * Math.PI / 180);
            const y1 = 100 + 90 * Math.sin((currentAngle - 90) * Math.PI / 180);
            currentAngle += slice;
            const x2 = 100 + 90 * Math.cos((currentAngle - 90) * Math.PI / 180);
            const y2 = 100 + 90 * Math.sin((currentAngle - 90) * Math.PI / 180);
            return (
              <g key={i}>
                <path d={`M 100 100 L ${x1} ${y1} A 90 90 0 ${slice > 180 ? 1 : 0} 1 ${x2} ${y2} Z`} fill={WHEEL_COLORS[i % WHEEL_COLORS.length]} stroke="white" strokeWidth="1.5" />
                <foreignObject x={mid.x-10} y={mid.y-10} width="20" height="20">
                  <img src={p.photo} className="rounded-full border border-white shadow-sm" />
                </foreignObject>
              </g>
            );
          })}
          <circle cx="100" cy="100" r="35" fill="white" />
          <text x="100" y="108" textAnchor="middle" fill="#312e81" fontSize="16" fontWeight="900" className="italic uppercase">
            {game.status === 'starting' ? `${timer}s` : 'PWP'}
          </text>
        </svg>
      </div>

      <div className="bg-white/50 border border-white rounded-[2rem] p-6 max-h-56 overflow-y-auto no-scrollbar shadow-inner">
        {game.players.map((p, i) => (
          <div key={i} className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3 text-left">
              <img src={p.photo} className="w-8 h-8 rounded-full" />
              <div>
                <div className="text-[10px] font-black text-indigo-900 leading-none">{p.name}</div>
                <div className="flex gap-1 mt-1">{p.itemIds?.map((id, idx) => <img key={idx} src={ITEMS_DATA[id]?.img} className="w-3 h-3 object-contain" />)}</div>
              </div>
            </div>
            <div className="text-right">
                <div className="text-[10px] font-black text-indigo-600 leading-none">{p.bet} ⭐</div>
                <div className="text-[8px] font-bold text-indigo-300 uppercase tracking-tighter mt-1">{((p.bet/total)*100).toFixed(0)}% chance</div>
            </div>
          </div>
        ))}
      </div>

      <div className={`fixed inset-x-0 bottom-0 bg-white rounded-t-[3rem] shadow-2xl transition-transform duration-500 z-[60] ${showDrawer ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="p-8">
          <div className="w-12 h-1 bg-indigo-100 rounded-full mx-auto mb-6" onClick={()=>setShowDrawer(false)}></div>
          <div className="flex bg-indigo-50 p-1 rounded-xl mb-6">
            <button onClick={()=>setMode('stars')} className={`flex-1 py-2 rounded-lg text-xs font-black uppercase ${mode==='stars'?'bg-indigo-600 text-white shadow-sm':'text-indigo-300'}`}>Stars</button>
            <button onClick={()=>setMode('gifts')} className={`flex-1 py-2 rounded-lg text-xs font-black uppercase ${mode==='gifts'?'bg-indigo-600 text-white shadow-sm':'text-indigo-300'}`}>My Gifts</button>
          </div>
          {mode === 'stars' ? (
            <div className="grid grid-cols-5 gap-2">
              {[5, 10, 25, 50, 100].map(v => (
                <button key={v} onClick={()=>{onBet(v); setShowDrawer(false);}} className="bg-indigo-50 py-4 rounded-2xl font-black text-indigo-900 active:scale-90 transition text-xs">+{v}</button>
              ))}
            </div>
          ) : (
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
              {inventory.map((it, i) => (
                <button key={i} onClick={()=>{onGiftBet(it); setShowDrawer(false);}} className="bg-indigo-50 p-3 rounded-2xl min-w-[80px] active:scale-90 transition">
                  <img src={it.img} className="w-10 h-10 mx-auto mb-1 object-contain" />
                  <div className="text-[7px] font-black text-indigo-400">⭐ {it.value}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {!showDrawer && <button onClick={()=>setShowDrawer(true)} className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-10 py-4 rounded-full font-black uppercase italic shadow-2xl">Place Bet <ChevronUp size={16} className="inline ml-1"/></button>}
    </div>
  );
};

export const CrashGame = ({ game, userId }) => (
    <div className="p-6 space-y-8 text-center animate-in fade-in">
        <div className="space-y-1"><h2 className="text-3xl font-black italic uppercase text-indigo-900 tracking-tighter leading-none">Crash Arena</h2></div>
        <div className={`text-8xl font-black italic tracking-tighter ${game.status === 'crashed' ? 'text-red-500 scale-110' : 'text-indigo-600'} transition-all duration-100`}>{game.multiplier}x</div>
        <div className="relative h-64 bg-indigo-900/5 rounded-[3rem] border border-indigo-100 flex items-end justify-center pb-10">
            {game.status === 'flying' && <Rocket size={64} className="text-indigo-600 animate-bounce" />}
            {game.status === 'crashed' && <div className="text-6xl animate-ping">💥</div>}
        </div>
        <button className="w-full bg-indigo-600 text-white py-6 rounded-[2.5rem] font-black uppercase italic shadow-xl">Bet 100</button>
    </div>
);

export const CasesTab = ({ inventory, openCase, userStars, onSell }) => {
    const [rolling, setRolling] = useState(false);
    const [rollItems, setRollItems] = useState([]);
    const [modal, setModal] = useState(null);

    const startRoll = (c) => {
        if (userStars < c.price) return alert('Мало ⭐');
        const items = Array.from({length: 60}, () => ITEMS_DATA[c.items[Math.floor(Math.random()*c.items.length)]]);
        const winId = c.items[Math.floor(Math.random()*c.items.length)];
        const winItem = ITEMS_DATA[winId];
        items[55] = winItem;
        setRollItems(items); setRolling(true);
        setTimeout(() => { setRolling(false); setModal(winItem); openCase(c, winId); }, 5000);
    };

    return (
        <div className="p-4 pb-32 space-y-6">
            <h2 className="text-xl font-black italic uppercase text-indigo-900 tracking-tighter">Mystery Boxes</h2>
            {rolling && (
                <div className="fixed inset-0 z-[100] bg-indigo-950/98 flex flex-col items-center justify-center">
                    <div className="relative w-full h-32 border-y border-white/10 overflow-hidden flex items-center bg-black/20">
                        <div className="absolute left-1/2 -translate-x-1/2 h-full w-0.5 bg-yellow-400 z-50"></div>
                        <div className="flex animate-case-roll gap-2 px-[50%]">
                            {rollItems.map((it, i) => <div key={i} className="min-w-[100px] h-[100px] bg-white/5 rounded-2xl flex items-center justify-center p-4"><img src={it.img} className="w-full h-full object-contain" /></div>)}
                        </div>
                    </div>
                </div>
            )}
            {modal && (
                <div className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center p-8 backdrop-blur-xl">
                    <div className="text-center space-y-6 animate-in zoom-in">
                        <img src={modal.img} className="w-40 h-40 mx-auto drop-shadow-[0_0_30px_#fff]" />
                        <h2 className="text-3xl font-black text-white italic uppercase">{modal.name}</h2>
                        <button onClick={()=>setModal(null)} className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase italic">Take it!</button>
                    </div>
                </div>
            )}
            <div className="space-y-4">
                {CASES_DATA.map(c => (
                    <div key={c.id} className={`bg-gradient-to-br ${c.color} p-0.5 rounded-[2rem] shadow-md`}>
                        <div className="bg-white/95 rounded-[1.9rem] p-5 flex items-center justify-between">
                            <div className="flex items-center gap-4 text-left">
                                <div className="text-4xl">🎁</div>
                                <div><div className="text-[8px] font-black text-indigo-400 uppercase leading-none mb-1">{c.badge}</div><div className="font-black italic text-md uppercase leading-none">{c.name}</div><div className="text-[10px] font-bold text-gray-400 mt-1">Price: ⭐ {c.price}</div></div>
                            </div>
                            <button onClick={()=>startRoll(c)} className="bg-indigo-600 text-white h-10 px-6 rounded-xl font-black uppercase text-[10px]">Open</button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-4 gap-2 pt-6">
                {inventory.map((it, i) => <div key={i} onClick={() => confirm(`Sell for ${Math.floor(it.value*0.85)} ⭐?`) && onSell(it)} className="aspect-square bg-white border border-indigo-50 rounded-2xl flex items-center justify-center p-3 shadow-sm active:scale-95 transition"><img src={it.img} className="w-full h-full object-contain" /></div>)}
            </div>
        </div>
    );
};

export const AdminPanel = ({ onAction, close }) => {
    const [id, setId] = useState('');
    const [val, setVal] = useState('');
    return (
        <div className="fixed inset-0 z-[200] bg-black/98 p-8 flex flex-col items-center justify-center animate-in fade-in">
            <div className="w-full max-w-sm space-y-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-3xl font-black italic text-yellow-400 uppercase">Owner Terminal</h2>
                    <button onClick={close} className="p-3 bg-red-600 rounded-full shadow-lg"><X size={24} color="white"/></button>
                </div>
                <input value={id} onChange={e=>setId(e.target.value)} placeholder="TARGET USER ID" className="w-full bg-white/5 border border-white/10 p-5 rounded-3xl text-center text-white font-black outline-none focus:border-indigo-500" />
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={()=>onAction('GIVE_MONEY', {targetId: id, amount: 5000, cur: 'coins'})} className="bg-indigo-600 text-white p-5 rounded-3xl font-black uppercase text-[10px]">Give 5k Coins</button>
                    <button onClick={()=>onAction('INSTANT_ROLL')} className="bg-white text-black p-5 rounded-3xl font-black uppercase text-[10px]">Spin Arena Now</button>
                </div>
                <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/5">
                    <input value={val} onChange={e=>setVal(e.target.value)} placeholder="Next Crash At (2.50)" className="w-full bg-black border border-white/10 p-4 rounded-2xl text-center text-white mb-3 font-bold" />
                    <button onClick={()=>onAction('SET_CRASH', {value: val})} className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-[10px]">Set Crash Point</button>
                </div>
            </div>
        </div>
    );
};

export const WinnerModal = ({ winner, bank, gameNumber, onClose }) => {
    if (!winner) return null;
    return (
        <div className="fixed inset-0 z-[100] bg-indigo-900/60 flex items-center justify-center p-6 backdrop-blur-md">
            <div className="bg-white w-full max-w-sm rounded-[4rem] p-10 text-center shadow-2xl relative">
                <div className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.5em] mb-6">Game #{gameNumber}</div>
                <img src={winner.photo} className="w-28 h-28 rounded-full mx-auto mb-6 border-4 border-indigo-600 shadow-xl" />
                <h2 className="text-4xl font-black italic text-indigo-950 uppercase tracking-tighter leading-none">{winner.name}</h2>
                <p className="text-indigo-400 font-bold uppercase text-[10px] tracking-widest mt-4 mb-10">Won <span className="text-indigo-600 font-black">⭐ {bank}</span></p>
                <div className="flex justify-center gap-3 mb-10 overflow-x-auto py-2 no-scrollbar">
                    <div className="bg-indigo-50 p-4 rounded-[2.5rem] min-w-[90px]"><div className="text-2xl mb-1">💰</div><div className="text-[8px] font-black text-indigo-300 uppercase">Stars</div></div>
                    {winner.items?.map((id, i) => <div key={i} className="bg-indigo-50 p-4 rounded-[2.5rem] min-w-[90px] flex flex-col items-center"><img src={ITEMS_DATA[id]?.img} className="w-12 h-12 object-contain" /><div className="text-[7px] font-black text-indigo-300 uppercase mt-1">NFT</div></div>)}
                </div>
                <button onClick={onClose} className="w-full bg-indigo-600 text-white py-6 rounded-[2.5rem] font-black uppercase italic active:scale-95 transition">Continue</button>
            </div>
        </div>
    );
};
