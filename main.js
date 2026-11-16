const $ = id => document.getElementById(id);
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
const watch = () => document.querySelectorAll('.reveal:not(.in)').forEach(el => io.observe(el));
$('year').textContent = new Date().getFullYear();

// 小音效（直接合成）
let ac;
function blip(freqs, vol = .13, len = .5, gap = .11) {
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    freqs.forEach((f, i) => {
      const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + i * gap;
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.001, t + len);
      o.connect(g).connect(ac.destination); o.start(t); o.stop(t + len + .05);
    });
  } catch (e) {}
}

// 文学史
const ERAS = [
  { k: '先秦', y: '秦统一以前', t: '源头', p: '中国文学从这里开始。《诗经》是第一部诗歌总集，屈原是第一位留下名字的大诗人。',
    d: [['诗歌', '《诗经》《楚辞》'], ['诸子散文', '《论语》《孟子》《庄子》'], ['历史散文', '《左传》《战国策》']], q: '路漫漫其修远兮，吾将上下而求索。', s: '屈原《离骚》' },
  { k: '两汉', y: '西汉、东汉', t: '铺陈与叙事', p: '赋写得铺张华丽，史书写得像小说一样好看，民间的歌也被收了起来。',
    d: [['汉赋', '司马相如《子虚赋》《上林赋》'], ['史传', '司马迁《史记》、班固《汉书》'], ['乐府与古诗', '《孔雀东南飞》《陌上桑》《古诗十九首》']], q: '青青河畔草，郁郁园中柳。', s: '《古诗十九首》' },
  { k: '魏晋南北朝', y: '三国到隋以前', t: '文学的自觉', p: '人们开始认真想：什么是好文章。诗里有了个人的性情，也有了山水和田园。',
    d: [['建安文学', '曹操、曹丕、曹植'], ['田园与山水', '陶渊明、谢灵运'], ['小说与文论', '《世说新语》、刘勰《文心雕龙》'], ['民歌', '《木兰诗》《西洲曲》']], q: '采菊东篱下，悠然见南山。', s: '陶渊明《饮酒》其五' },
  { k: '唐', y: '隋唐五代', t: '诗的高峰', p: '说到唐代，先想到诗。除了诗，散文在改革，小说也成了气候。',
    d: [['诗', '王勃、王维、李白、杜甫、白居易、李商隐'], ['古文运动', '韩愈、柳宗元'], ['唐传奇', '《莺莺传》《李娃传》'], ['晚唐五代词', '温庭筠、李煜']], q: '海上生明月，天涯共此时。', s: '张九龄《望月怀远》' },
  { k: '宋', y: '北宋、南宋', t: '词的高峰', p: '词本来是配着曲子唱的，到宋代成了一代文学的代表，有婉约，也有豪放。',
    d: [['词', '柳永、苏轼、李清照、辛弃疾'], ['诗文', '欧阳修、王安石、陆游'], ['话本', '说书人的底本，白话小说的前身']], q: '大江东去，浪淘尽，千古风流人物。', s: '苏轼《念奴娇·赤壁怀古》' },
  { k: '元', y: '元代', t: '戏上了台', p: '文人走进勾栏瓦舍写戏，戏曲第一次站到了文学的中心。',
    d: [['杂剧', '关汉卿《窦娥冤》、王实甫《西厢记》'], ['散曲', '马致远《天净沙·秋思》'], ['南戏', '高明《琵琶记》']], q: '枯藤老树昏鸦，小桥流水人家。', s: '马致远《天净沙·秋思》' },
  { k: '明清', y: '明代、清代', t: '小说的时代', p: '长篇小说成熟了，四大名著都在这时候定型。戏曲也出了几部传世之作。',
    d: [['四大名著', '《三国演义》《水浒传》《西游记》《红楼梦》'], ['其他小说', '《儒林外史》《聊斋志异》'], ['戏曲', '汤显祖《牡丹亭》、洪昇《长生殿》、孔尚任《桃花扇》']], q: '满纸荒唐言，一把辛酸泪。', s: '曹雪芹《红楼梦》' },
  { k: '近代', y: '鸦片战争到五四前', t: '求变', p: '时代变了，文学也急着变。有人要改诗，有人要改小说，为后来的新文学开了路。',
    d: [['诗', '龚自珍《己亥杂诗》、黄遵宪与“诗界革命”'], ['小说', '梁启超倡“小说界革命”，《官场现形记》《老残游记》'], ['文论', '王国维《人间词话》']], q: '落红不是无情物，化作春泥更护花。', s: '龚自珍《己亥杂诗》' },
];
const tabs = $('tl-tabs'), panel = $('tl-panel');
function showEra(i, quiet) {
  const e = ERAS[i];
  [...tabs.children].forEach((b, j) => { b.classList.toggle('on', j === i); b.setAttribute('aria-selected', j === i); });
  panel.innerHTML = `<div class="tl-era">${e.k}</div><div class="tl-body"><h3>${e.t}</h3><p>${e.p}</p><dl>${e.d.map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join('')}</dl><p class="tl-line">${e.q}<span>${e.s}</span></p></div>`;
  panel.classList.remove('swap'); void panel.offsetWidth; panel.classList.add('swap');
  if (!quiet) blip([392 + i * 30]);
}
tabs.innerHTML = ERAS.map((e, i) => `<button type="button" role="tab" data-i="${i}">${e.k}<small>${e.y}</small></button>`).join('');
tabs.onclick = e => { const b = e.target.closest('button'); if (b) showEra(+b.dataset.i); };
showEra(0, true);

// 古今异义
const WORDS = [
  ['走', '跑', '今天说“走”是慢慢走，古人说“走”是跑。', '兔走触株，折颈而死。', '《韩非子·五蠹》'],
  ['汤', '热水', '不是喝的汤，是烧热的水。', '及其日中如探汤。', '《列子·汤问》'],
  ['涕', '眼泪', '古人的“涕”是眼泪，鼻涕叫“泗”。', '独怆然而涕下。', '陈子昂《登幽州台歌》'],
  ['妻子', '妻子和儿女', '是两个词：妻，和子。', '率妻子邑人来此绝境。', '陶渊明《桃花源记》'],
  ['去', '离开', '“去国”不是到那个国家去，是离开国都。', '去国怀乡，忧谗畏讥。', '范仲淹《岳阳楼记》'],
  ['兵', '兵器', '先指武器，后来才指拿武器的人。', '收天下之兵，聚之咸阳。', '贾谊《过秦论》'],
  ['股', '大腿', '“悬梁刺股”刺的是大腿。', '引锥自刺其股，血流至足。', '《战国策·秦策一》'],
  ['池', '护城河', '“城池”就是城墙加护城河。', '城非不高也，池非不深也。', '《孟子·公孙丑下》'],
];
$('cards').innerHTML = WORDS.map(([w, m, n, ex, src]) => `<button class="wcard reveal" type="button" aria-label="${w}，点一下看古义"><div><span class="face a"><b>${w}</b><span>古时候是什么意思？</span></span><span class="face b"><strong>${w} = ${m}</strong><span>${n}</span><em>「${ex}」</em><small>${src}</small></span></div></button>`).join('');
$('cards').onclick = e => { const c = e.target.closest('.wcard'); if (c) { c.classList.toggle('flip'); blip([c.classList.contains('flip') ? 587 : 440], .1, .3); } };
watch();

// 今日一句
const LINES = [
  ['学而不思则罔，思而不学则殆。', '《论语·为政》'], ['知之者不如好之者，好之者不如乐之者。', '《论语·雍也》'], ['不积跬步，无以至千里。', '《荀子·劝学》'],
  ['读书破万卷，下笔如有神。', '杜甫《奉赠韦左丞丈二十二韵》'], ['文章千古事，得失寸心知。', '杜甫《偶题》'], ['千淘万漉虽辛苦，吹尽狂沙始到金。', '刘禹锡《浪淘沙》'],
  ['腹有诗书气自华。', '苏轼《和董传留别》'], ['博观而约取，厚积而薄发。', '苏轼《稼说送张琥》'], ['纸上得来终觉浅，绝知此事要躬行。', '陆游《冬夜读书示子聿》'],
  ['问渠那得清如许？为有源头活水来。', '朱熹《观书有感》'],
];
let lastLine = -1;
function showLine(quiet) {
  let i; do { i = Math.floor(Math.random() * LINES.length); } while (i === lastLine); lastLine = i;
  const t = $('q-text'), s = $('q-src');
  t.textContent = LINES[i][0]; s.textContent = '—— ' + LINES[i][1];
  [t, s].forEach(el => { el.classList.remove('swap'); void el.offsetWidth; el.classList.add('swap'); });
  if (!quiet) blip([523, 659]);
}
$('q-btn').onclick = () => showLine();
showLine(true);

// 背景音乐：一进站先试着播；被浏览器挡下来的话，第一次点或碰画面就开始
const bgm = $('bgm'), mbtn = $('music');
let fade, musicTouched = false;
const ramp = (to, done) => {
  clearInterval(fade);
  let ticks = 0;
  fade = setInterval(() => {
    const v = bgm.volume + (to > bgm.volume ? .04 : -.06);
    if (++ticks > 25 || (to > bgm.volume && v >= to) || (to <= bgm.volume && v <= to)) { bgm.volume = to; clearInterval(fade); done && done(); }
    else bgm.volume = Math.max(0, Math.min(1, v));
  }, 80);
};
const setMusic = on => {
  mbtn.classList.toggle('on', on); mbtn.setAttribute('aria-pressed', on);
  if (on) { bgm.volume = 0; bgm.play().then(() => ramp(.5)).catch(() => setMusic(false)); }
  else ramp(0, () => bgm.pause());
};
mbtn.onclick = e => { e.stopPropagation(); musicTouched = true; setMusic(bgm.paused || !mbtn.classList.contains('on')); };
mbtn.addEventListener('pointerdown', () => { musicTouched = true; }, true);
const autoStart = () => {
  ['pointerdown', 'keydown', 'touchend'].forEach(ev => removeEventListener(ev, autoStart, true));
  if (!musicTouched && bgm.paused) setMusic(true);
};
['pointerdown', 'keydown', 'touchend'].forEach(ev => addEventListener(ev, autoStart, true));
bgm.volume = 0;
bgm.play().then(() => { if (!musicTouched) { mbtn.classList.add('on'); mbtn.setAttribute('aria-pressed', true); ramp(.5); } }).catch(() => {});
