export const WHEEL_COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#eab308', '#22c55e', '#06b6d4'];

export const ITEMS_DATA = {
    'ring_10k': { img: 'https://i.ibb.co/vz6mD8N/ring1.png', name: 'Nail Ring', value: 10000, rarity: 'mythic' },
    'ring_5k': { img: 'https://i.ibb.co/vz6mD8N/ring2.png', name: 'Gold Ring', value: 5000, rarity: 'mythic' },
    'bag_2k': { img: 'https://i.ibb.co/vz6mD8N/bag.png', name: 'Luxury Bag', value: 2500, rarity: 'legendary' },
    'potion': { img: 'https://i.ibb.co/vz6mD8N/potion.png', name: 'Love Potion', value: 1000, rarity: 'legendary' },
    'plum': { img: 'https://i.ibb.co/vz6mD8N/plum.png', name: 'Silver Plum', value: 1000, rarity: 'legendary' },
    'bear': { img: 'https://i.ibb.co/vz6mD8N/bear.png', name: 'Teddy Bear', value: 500, rarity: 'epic' },
    'box': { img: 'https://i.ibb.co/vz6mD8N/box.png', name: 'Heart Box', value: 400, rarity: 'epic' },
    'hat': { img: 'https://i.ibb.co/vz6mD8N/hat.png', name: 'Santa Hat', value: 50, rarity: 'rare' },
    'globe': { img: 'https://i.ibb.co/vz6mD8N/globe.png', name: 'Snow Globe', value: 75, rarity: 'rare' },
    'snake': { img: 'https://i.ibb.co/vz6mD8N/snake.png', name: 'Snake 2025', value: 25, rarity: 'common' }
};

export const CASES_DATA = [
    { id: 'mythic', name: 'Mythic Box', price: 500, items: ['ring_10k', 'ring_5k', 'bag_2k', 'potion'], color: 'from-yellow-400 to-orange-600', badge: 'TOP' },
    { id: 'ny', name: 'NY 2025', price: 50, items: ['hat', 'globe', 'snake', 'bear', 'box'], color: 'from-blue-500 to-purple-600', badge: 'NEW' }
];

export const Utils = {
    getWinnerAngle: (players, winnerId) => {
        const total = players.reduce((s, p) => s + p.bet, 0);
        let startAngle = 0;
        for (const p of players) {
            const slice = (p.bet / total) * 360;
            if (p.userId === winnerId) return 360 - (startAngle + (Math.random() * 0.4 + 0.3) * slice);
            startAngle += slice;
        }
        return 0;
    },
    getPointOnWheel: (angle, radius) => {
        const rad = (angle - 90) * Math.PI / 180;
        return { x: 100 + radius * Math.cos(rad), y: 100 + radius * Math.sin(rad) };
    }
};
