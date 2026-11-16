// 两个小游戏：对下句、作家作品连连看
const store = { get: k => { try { return +localStorage.getItem(k) || 0; } catch (e) { return 0; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };

// 一、对下句
const POEMS = [
  ['海内存知己，', '天涯若比邻。', '王勃《送杜少府之任蜀州》'], ['会当凌绝顶，', '一览众山小。', '杜甫《望岳》'],
  ['长风破浪会有时，', '直挂云帆济沧海。', '李白《行路难》'], ['但愿人长久，', '千里共婵娟。', '苏轼《水调歌头》'],
  ['采菊东篱下，', '悠然见南山。', '陶渊明《饮酒》'], ['关关雎鸠，在河之洲。', '窈窕淑女，君子好逑。', '《诗经·关雎》'],
  ['路漫漫其修远兮，', '吾将上下而求索。', '屈原《离骚》'], ['问君能有几多愁？', '恰似一江春水向东流。', '李煜《虞美人》'],
  ['落霞与孤鹜齐飞，', '秋水共长天一色。', '王勃《滕王阁序》'], ['大漠孤烟直，', '长河落日圆。', '王维《使至塞上》'],
  ['春蚕到死丝方尽，', '蜡炬成灰泪始干。', '李商隐《无题》'], ['人生自古谁无死？', '留取丹心照汗青。', '文天祥《过零丁洋》'],
  ['枯藤老树昏鸦，', '小桥流水人家。', '马致远《天净沙·秋思》'], ['蒹葭苍苍，', '白露为霜。', '《诗经·蒹葭》'],
  ['老骥伏枥，', '志在千里。', '曹操《龟虽寿》'], ['无边落木萧萧下，', '不尽长江滚滚来。', '杜甫《登高》'],
  ['两情若是久长时，', '又岂在朝朝暮暮。', '秦观《鹊桥仙》'], ['山重水复疑无路，', '柳暗花明又一村。', '陆游《游山西村》'],
  ['满纸荒唐言，', '一把辛酸泪。', '曹雪芹《红楼梦》'], ['众里寻他千百度，', '蓦然回首，那人却在，灯火阑珊处。', '辛弃疾《青玉案·元夕》'],
];
const RANK = n => n === 10 ? '状元' : n >= 8 ? '进士' : n >= 6 ? '举人' : n >= 4 ? '秀才' : '童生';
let g1 = { list: [], i: 0, score: 0, lock: false };
$('g1-best').textContent = store.get('jj-poem');
function g1Next() {
  if (g1.i >= g1.list.length) return g1End();
  const [up, down] = g1.list[g1.i];
  const opts = shuffle([down, ...shuffle(POEMS.filter(p => p[1] !== down)).slice(0, 3).map(p => p[1])]);
  $('g1-n').textContent = g1.i + 1; $('g1-q').textContent = up; $('g1-src').textContent = '';
  $('g1-opts').innerHTML = opts.map(o => `<button type="button">${o}</button>`).join('');
  g1.lock = false;
}
function g1End() {
  const s = g1.score, best = Math.max(s, store.get('jj-poem')); store.set('jj-poem', best); $('g1-best').textContent = best;
  $('g1-q').textContent = `十题答对 ${s} 题`; $('g1-src').textContent = ''; $('g1-opts').innerHTML = '';
  $('g1-msg').textContent = `功名：${RANK(s)}。` + (s === 10 ? '金榜题名！' : s >= 6 ? '再读几首，下回更高。' : '没关系，多读就会了。');
  $('g1-start').textContent = '再考一次'; $('g1-start').hidden = false;
  blip(s >= 6 ? [523, 659, 784, 1047] : [440, 392]);
}
$('g1-start').onclick = () => {
  g1 = { list: shuffle(POEMS).slice(0, 10), i: 0, score: 0, lock: false };
  $('g1-score').textContent = 0; $('g1-msg').textContent = '选出正确的下句。'; $('g1-start').hidden = true; g1Next();
};
$('g1-opts').onclick = e => {
  const b = e.target.closest('button'); if (!b || g1.lock) return;
  g1.lock = true;
  const [, down, src] = g1.list[g1.i], right = b.textContent === down;
  [...$('g1-opts').children].forEach(x => { x.disabled = true; if (x.textContent === down) x.classList.add('ok'); });
  if (right) { g1.score++; $('g1-score').textContent = g1.score; $('g1-msg').textContent = pick(['对了。', '正是。', '答得好。']); blip([659, 880]); }
  else { b.classList.add('no'); $('g1-msg').textContent = '可惜，正确的是绿色那句。'; blip([330, 262]); }
  $('g1-src').textContent = '—— ' + src;
  g1.i++; setTimeout(g1Next, right ? 1100 : 1900);
};

// 二、作家作品连连看
const PAIRS = [
  ['屈原', '《离骚》'], ['司马迁', '《史记》'], ['陶渊明', '《桃花源记》'], ['王羲之', '《兰亭集序》'], ['刘勰', '《文心雕龙》'], ['李白', '《将进酒》'],
  ['杜甫', '《春望》'], ['白居易', '《长恨歌》'], ['韩愈', '《师说》'], ['柳宗元', '《捕蛇者说》'], ['范仲淹', '《岳阳楼记》'], ['苏轼', '《赤壁赋》'],
  ['李清照', '《声声慢》'], ['关汉卿', '《窦娥冤》'], ['王实甫', '《西厢记》'], ['汤显祖', '《牡丹亭》'], ['罗贯中', '《三国演义》'], ['施耐庵', '《水浒传》'],
  ['吴承恩', '《西游记》'], ['曹雪芹', '《红楼梦》'], ['蒲松龄', '《聊斋志异》'], ['吴敬梓', '《儒林外史》'], ['孔尚任', '《桃花扇》'], ['洪昇', '《长生殿》'],
];
let g2 = { on: false, done: 0, miss: 0, t0: 0, timer: 0, sel: null };
const g2Best = () => store.get('jj-match');
function g2Start() {
  const set = shuffle(PAIRS).slice(0, 6), L = shuffle(set), R = shuffle(set);
  $('g2-board').innerHTML = L.map((l, i) => `<button type="button" class="l" data-k="${l[0]}">${l[0]}</button><button type="button" class="r" data-k="${R[i][0]}">${R[i][1]}</button>`).join('');
  clearInterval(g2.timer);
  g2 = { on: true, done: 0, miss: 0, t0: Date.now(), sel: null, timer: setInterval(() => { $('g2-t').textContent = Math.floor((Date.now() - g2.t0) / 1000); }, 250) };
  $('g2-n').textContent = 0; $('g2-miss').textContent = 0; $('g2-t').textContent = 0;
  $('g2-msg').textContent = g2Best() ? `最快纪录 ${g2Best()} 秒。` : '先点作家，再点作品（反过来也行）。'; $('g2-start').textContent = '换一组';
}
$('g2-start').onclick = g2Start;
$('g2-board').onclick = e => {
  const b = e.target.closest('button'); if (!b || !g2.on || b.classList.contains('done')) return;
  const a = g2.sel;
  if (!a || a === b || a.className.split(' ')[0] === b.className.split(' ')[0]) { if (a) a.classList.remove('sel'); g2.sel = a === b ? null : b; if (g2.sel) b.classList.add('sel'); blip([494], .08, .2); return; }
  a.classList.remove('sel'); g2.sel = null;
  if (a.dataset.k === b.dataset.k) {
    a.classList.add('done'); b.classList.add('done'); $('g2-n').textContent = ++g2.done; blip([659, 880]);
    if (g2.done === 6) {
      clearInterval(g2.timer); g2.on = false;
      const sec = Math.max(1, Math.round((Date.now() - g2.t0) / 1000)), old = g2Best(), rec = !old || sec < old;
      if (rec) store.set('jj-match', sec);
      $('g2-t').textContent = sec;
      $('g2-msg').textContent = `全部连上，用时 ${sec} 秒，连错 ${g2.miss} 次。` + (rec ? '新纪录！' : `最快 ${old} 秒。`); $('g2-start').textContent = '再来一组';
      blip([523, 659, 784, 1047]);
    }
  } else {
    $('g2-miss').textContent = ++g2.miss; [a, b].forEach(x => { x.classList.add('bad'); setTimeout(() => x.classList.remove('bad'), 400); }); blip([330, 262]);
  }
};
window.JJ = { POEMS, PAIRS };
