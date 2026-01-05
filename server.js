import { Telegraf, Markup } from 'telegraf';
import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import crypto from 'crypto';
import cors from 'cors';

const app = express();
app.use(cors());
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const bot = new Telegraf('8477294476:AAH0iRp0L9OC5MybNrJupCGL8k92wSGGRjs');

let game = { players: [], status: 'waiting', timer: 15, bank: 0, secret: '', number: 37807, forcedWinner: null };
let crash = { multiplier: 1.0, status: 'betting', timer: 10, bets: [], crashAt: 2.50 };

function broadcast(data) {
    wss.clients.forEach(c => c.readyState === 1 && c.send(JSON.stringify(data)));
}

// --- ROLL IT ENGINE ---
function initRoll() {
    game = { ...game, players: [], status: 'waiting', timer: 15, bank: 0, secret: crypto.randomBytes(16).toString('hex'), number: game.number + 1, forcedWinner: null };
    broadcast({ type: 'SYNC_ROLL', roll: game });
}

function startRollSpin() {
    if (game.players.length === 0) return initRoll();
    game.status = 'spinning';
    let winner;
    if (game.forcedWinner) {
        winner = game.players.find(p => p.userId === game.forcedWinner) || game.players[0];
    } else {
        const ticket = Math.random() * game.bank;
        let curr = 0; winner = game.players[0];
        for (const p of game.players) { curr += p.bet; if (ticket < curr) { winner = p; break; } }
    }
    broadcast({ type: 'ROLL_START', winnerId: winner.userId, roll: game });
    setTimeout(() => {
        const bankItems = game.players.flatMap(p => p.itemIds || []);
        broadcast({ type: 'RESULT', winner: {...winner, items: bankItems}, bank: game.bank, gameNumber: game.number });
        setTimeout(initRoll, 7000);
    }, 4500);
}

// --- CRASH ENGINE ---
function startCrashFlight() {
    crash.status = 'flying';
    let current = 1.0;
    const interval = setInterval(() => {
        current += current * 0.005;
        if (current >= crash.crashAt) {
            clearInterval(interval);
            crash.status = 'crashed';
            broadcast({ type: 'CRASH_END', multiplier: current.toFixed(2) });
            setTimeout(() => {
                crash = { multiplier: 1.0, status: 'betting', timer: 10, crashAt: (Math.random() * 5 + 1.1).toFixed(2) };
                broadcast({ type: 'SYNC_CRASH', crash });
            }, 5000);
        } else {
            broadcast({ type: 'CRASH_TICK', multiplier: current.toFixed(2) });
        }
    }, 100);
}

setInterval(() => {
    if (game.status === 'starting') {
        game.timer--;
        broadcast({ type: 'ROLL_TIMER', timer: game.timer });
        if (game.timer <= 0) startRollSpin();
    }
    if (crash.status === 'betting') {
        crash.timer--;
        broadcast({ type: 'CRASH_TIMER', timer: crash.timer });
        if (crash.timer <= 0) startCrashFlight();
    }
}, 1000);

wss.on('connection', (ws) => {
    ws.on('message', (raw) => {
        const msg = JSON.parse(raw);
        if (msg.type === 'BET_ROLL' && (game.status === 'waiting' || game.status === 'starting')) {
            let p = game.players.find(x => x.userId === msg.userId);
            if (p) { p.bet += msg.bet; if (msg.giftId) p.itemIds.push(msg.giftId); }
            else { game.players.push({ userId: msg.userId, name: msg.name, bet: msg.bet, itemIds: msg.giftId ? [msg.giftId] : [], photo: msg.photo }); }
            game.bank += msg.bet;
            if (game.players.length >= 2 && game.status === 'waiting') game.status = 'starting';
            broadcast({ type: 'SYNC_ROLL', roll: game });
        }
        if (msg.type === 'ADMIN_ACTION' && msg.code === '981898') {
            if (msg.action === 'GIVE_MONEY') broadcast({ type: 'UPDATE_BAL', targetId: msg.targetId, amount: msg.amount, cur: msg.cur });
            if (msg.action === 'INSTANT_ROLL') startRollSpin();
            if (msg.action === 'SET_CRASH') crash.crashAt = parseFloat(msg.value);
        }
    });
    ws.send(JSON.stringify({ type: 'SYNC_ROLL', roll: game }));
    ws.send(JSON.stringify({ type: 'SYNC_CRASH', crash: crash }));
});

bot.start((ctx) => {
    ctx.reply('🎄 Welcome to PWP Arena 2025!', Markup.inlineKeyboard([
        [Markup.button.webApp('ИГРАТЬ 🎮', 'ТВОЯ_ССЫЛКА_NETLIFY')]
    ]));
});

initRoll();
bot.launch();
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server started on ${PORT}`));
