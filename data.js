window.FPRES_DATA = {
  games: [
    {id:'1091500', name:'Cyberpunk 2077', platform:'Steam', region:'GLOBAL', price:2399, rating:4.98, reviews:12842, seller:'GameKey', genre:'RPG / Action'},
    {id:'1245620', name:'ELDEN RING', platform:'Steam', region:'GLOBAL', price:2099, rating:4.97, reviews:8421, seller:'KeyStore', genre:'Action / RPG'},
    {id:'730', name:'Counter-Strike 2', platform:'Steam', region:'GLOBAL', price:1299, rating:4.98, reviews:15310, seller:'PlayMarket', genre:'Shooter'},
    {id:'570', name:'Dota 2', platform:'Steam', region:'GLOBAL', price:499, rating:4.96, reviews:19442, seller:'GameKey', genre:'MOBA'},
    {id:'553850', name:'HELLDIVERS 2', platform:'Steam', region:'GLOBAL', price:1699, rating:4.95, reviews:4982, seller:'KeyStore', genre:'Co-op / Shooter'},
    {id:'1174180', name:'Red Dead Redemption 2', platform:'Steam', region:'GLOBAL', price:1899, rating:4.96, reviews:15310, seller:'GameKey', genre:'Action / Adventure'},
    {id:'1086940', name:"Baldur's Gate 3", platform:'Steam', region:'GLOBAL', price:2799, rating:4.99, reviews:8421, seller:'PlayMarket', genre:'RPG'},
    {id:'2669320', name:'EA SPORTS FC 25', platform:'Steam', region:'GLOBAL', price:2199, rating:4.86, reviews:5230, seller:'DigitalLab', genre:'Sports'},
    {id:'1938090', name:'Call of Duty', platform:'Steam', region:'GLOBAL', price:2499, rating:4.84, reviews:9112, seller:'GameHub', genre:'Shooter'},
    {id:'271590', name:'Grand Theft Auto V', platform:'Steam', region:'GLOBAL', price:899, rating:4.93, reviews:11240, seller:'PlayMarket', genre:'Action / Open World'}
  ],
  sellers:[
    {slug:'gamekey',name:'GameKey',rating:4.98,sales:12842,success:99.7,online:true},
    {slug:'keystore',name:'KeyStore',rating:4.97,sales:9441,success:99.5,online:true},
    {slug:'playmarket',name:'PlayMarket',rating:4.96,sales:8230,success:99.6,online:true},
    {slug:'digitallab',name:'DigitalLab',rating:4.95,sales:6121,success:99.3,online:true},
    {slug:'gamehub',name:'GameHub',rating:4.92,sales:5883,success:99.1,online:false}
  ],
  offerVariants:['GLOBAL','EU','CIS','Steam'],
};
window.fpresImg = id => `https://cdn.cloudflare.steamstatic.com/steam/apps/${id}/header.jpg`;
window.money = n => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
