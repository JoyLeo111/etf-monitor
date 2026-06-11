const https = require('https');
const fs = require('fs');
const ETFs = [
  {code:'518880',market:'1',name:'华安黄金ETF'},
  {code:'517520',market:'1',name:'华安黄金股ETF'},
  {code:'510300',market:'1',name:'沪深300ETF'},
  {code:'513100',market:'1',name:'纳指100'},
  {code:'513500',market:'1',name:'标普500'},
  {code:'513180',market:'1',name:'恒生科技'},
];
function fetch(url) {
  return new Promise((resolve, reject) => {
    const opts = { hostname:'push2.eastmoney.com', path: url, headers:{ 'User-Agent':'Mozilla/5.0', 'Referer':'https://quote.eastmoney.com/' }, timeout:10000 };
    https.get(opts, r => { let d=''; r.on('data',c=>d+=c); r.on('end',()=>resolve(JSON.parse(d))); }).on('error',reject);
  });
}
(async () => {
  try {
    const secids = ETFs.map(e=>e.market+'.'+e.code).join(',');
    const path = '/api/qt/ulist.np/get?fltt=2&fields=f2,f3,f4,f5,f6,f12,f14,f15,f16,f17,f18,f20,f21&secids='+encodeURIComponent(secids);
    const data = await fetch(path);
    if (data?.data?.diff) {
      data.data.diff.forEach(i => { const e=ETFs.find(x=>x.code===String(i.f12)); if(e) i.displayName=e.name; });
      data.updateTime = new Date().toLocaleString('zh-CN',{timeZone:'Asia/Shanghai'});
      fs.mkdirSync('data', {recursive:true});
      fs.writeFileSync('data/data.json', JSON.stringify(data));
      console.log('OK:', data.data.diff.length, 'ETFs');
    } else { console.error('No data'); process.exit(1); }
  } catch(e) { console.error('Error:', e.message); process.exit(1); }
})();