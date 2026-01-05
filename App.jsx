import './index.css';
import React, { useState, useEffect, useRef } from 'react';
import { RollGame, CrashGame, ArenaSelector, AdminPanel, WinnerModal, CasesTab } from './Interface';
import { Utils, ITEMS_DATA } from './config';

export default function App() {
  const [userId] = useState(() => localStorage.getItem('arena_id') || Math.floor(100000 + Math.random() * 900000).toString());
  const [name] = useState(() => window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name || 'Admin');
  const [photo] = useState(() => window.Telegram?.WebApp?.initDataUnsafe?.user?.photo_url || 'https://via.placeholder.com/100');

  const [user, setUser] = useState(() => {
    const s = localStorage.getItem('user_arena_v10');
    return s ? JSON.parse(s) : { coins: 11325, stars: 100, inventory: [] };
  });

  const [tab, setTab] = useState('selector');
  const [adminMode, setAdminMode] = useState(false);
  const [roll, setRoll] = useState({ players: [], status: 'waiting', timer: 15, bank: 0 });
  const [crash, setCrash] = useState({ multiplier: 1.0, status: 'betting', timer: 10 });
  const [rotation, setRotation] = useState(0);
  const [winnerData, setWinnerData] = useState(null);
  
  const socket = useRef(null);

  useEffect(() => {
    localStorage.setItem('arena_id', userId);
    // ТВОЯ ССЫЛКА ОТ RENDER
    const socketUrl = window.location.hostname === 'localhost' ? `ws://${window.location.host}/ws` : `wss://artemka-arena.onrender.com/ws`;
    socket.current = new WebSocket(socketUrl);
    
    socket.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'SYNC_ROLL') { setRoll(data.roll); if (data.roll.status === 'waiting') {setRotation(0); setWinnerData(null);}}
      if (data.type === 'SYNC_CRASH') setCrash(data.crash);
      if (data.type === 'ROLL_TIMER') setRoll(p => ({...p, timer: data.timer}));
      if (data.type === 'CRASH_TIMER') setCrash(p => ({...p, timer: data.timer}));
      if (data.type === 'CRASH_TICK') setCrash(p => ({...p, multiplier: parseFloat(data.multiplier), status: 'flying'}));
      if (data.type === 'ROLL_START') {
          const target = Utils.getWinnerAngle(data.roll.players, data.winnerId);
          setRotation(r => r + 5400 + target);
          setRoll(p => ({...p, status: 'spinning'}));
      }
      if (data.type === 'RESULT') {
          setWinnerData(data);
          if (data.winner.userId === userId) {
            setUser(u => ({...u, coins: u.coins + data.bank, inventory: [...u.inventory, ...data.winner.items.map(id=>({...ITEMS_DATA[id], instanceId: Math.random()}))]}));
          }
      }
      if (data.type === 'UPDATE_BAL' && data.targetId === userId) {
          setUser(u => ({...u, [data.cur]: u[data.cur] + data.amount}));
      }
    };
    return () => socket.current.close();
  }, [userId]);

  useEffect(() => localStorage.setItem('user_arena_v10', JSON.stringify(user)), [user]);

  const onBetRoll = (amount) => {
    if (user.coins < amount || roll.status === 'spinning') return;
    socket.current.send(JSON.stringify({ type: 'BET_ROLL', userId, name, bet: amount, photo }));
    setUser(u => ({ ...u, coins: u.coins - amount }));
  };

  const onGiftBet = (gift) => {
      if (roll.status === 'spinning') return;
      const itemId = Object.keys(ITEMS_DATA).find(k=>ITEMS_DATA[k].name === gift.name);
      socket.current.send(JSON.stringify({ type: 'BET_ROLL', userId, name, bet: gift.value, giftId: itemId, photo }));
      setUser(u => ({ ...u, inventory: u.inventory.filter(i => i.instanceId !== gift.instanceId) }));
  };

  const openCase = (c, itemId) => {
    setUser(u => ({ ...u, stars: u.stars - c.price, inventory: [...u.inventory, {...ITEMS_DATA[itemId], instanceId: Math.random()}] }));
  };

  return (
    <div className="min-h-screen bg-[#f8faff] font-sans selection:bg-indigo-500 overflow-x-hidden">
      <header className="p-6 flex justify-between bg-white/60 backdrop-blur-xl sticky top-0 z-40 border-b border-indigo-50">
        <div className="font-black italic text-indigo-900" onClick={() => {
            const code = prompt('ADMIN:'); if(code === '981898') setAdminMode(true);
        }}>ID: {userId}</div>
        <div className="bg-indigo-600 px-5 py-2 rounded-full shadow-lg text-white font-black text-xs">{user.coins} 🪙</div>
      </header>

      <main>
        {adminMode ? <AdminPanel onAction={(a, p) => socket.current.send(JSON.stringify({type:'ADMIN_ACTION', code:'981898', action:a, ...p}))} close={()=>setAdminMode(false)} /> : (
            <>
                {tab === 'selector' && <ArenaSelector setTab={setTab} />}
                {tab === 'roll' && <RollGame game={roll} rotation={rotation} onBet={onBetRoll} userId={userId} timer={roll.timer} inventory={user.inventory} onGiftBet={onGiftBet} />}
                {tab === 'crash' && <CrashGame game={crash} userId={userId} />}
                {tab === 'cases' && <CasesTab inventory={user.inventory} openCase={openCase} userStars={user.stars} onSell={(g)=>setUser(u=>({...u, stars: u.stars+Math.floor(g.value*0.85), inventory: u.inventory.filter(i=>i.instanceId!==g.instanceId)}))} />}
            </>
        )}
      </main>

      <WinnerModal winner={winnerData?.winner} bank={winnerData?.bank} gameNumber={winnerData?.gameNumber} onClose={() => setWinnerData(null)} />
      
      {tab !== 'selector' && !adminMode && (
          <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
              <div className="bg-white border border-indigo-50 p-2 rounded-full shadow-2xl pointer-events-auto flex gap-4 px-6">
                <button onClick={()=>setTab('selector')} className={`p-2 rounded-full ${tab==='selector'?'text-indigo-600':'text-gray-400'}`}><LayoutGrid/></button>
                <button onClick={()=>setTab('roll')} className={`p-2 rounded-full ${tab==='roll'?'text-indigo-600':'text-gray-400'}`}><Trophy/></button>
                <button onClick={()=>setTab('cases')} className={`p-2 rounded-full ${tab==='cases'?'text-indigo-600':'text-gray-400'}`}><ShoppingBag/></button>
              </div>
          </div>
      )}
    </div>
  );
}
