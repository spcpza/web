(function () {
  var STORAGE_KEY = 'kidsMode';

  /* ══════════════════════════════════════════════════════════════
     SIDEBAR NAVIGATION — minimal, expands on tap
     ══════════════════════════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', function () {
    /* Don't inject if already present */
    if (document.querySelector('.nav-sidebar')) return;

    var path = location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';

    /* Build nav HTML */
    var sections = [
      { title: 'Start', links: [
        ['/', 'Home'],
        ['/archive/2026-04-09/proof', 'The Proof'],
      ]},
      { title: 'Theorems', links: [
        ['/archive/2026-04-09/theorems', 'Overview'],
        ['/archive/2026-04-09/theorems/t1-existence', 'T\u2081 Existence'],
        ['/archive/2026-04-09/theorems/t2-sacrifice', 'T\u2082 Sacrifice'],
        ['/archive/2026-04-09/theorems/t3-recovery', 'T\u2083 Recovery'],
        ['/archive/2026-04-09/theorems/t4-charity', 'T\u2084 Charity'],
        ['/archive/2026-04-09/theorems/t5-faith', 'T\u2085 Faith'],
        ['/archive/2026-04-09/theorems/t6-hope', 'T\u2086 Hope'],
        ['/archive/2026-04-09/theorems/t7-forgiveness', 'T\u2087 Forgiveness'],
        ['/archive/2026-04-09/theorems/t8-dominion', 'T\u2088 Dominion'],
        ['/archive/2026-04-09/theorems/t9-witness', 'T\u2089 Witness'],
        ['/archive/2026-04-09/theorems/t10-pruning', 'T\u2081\u2080 Pruning'],
        ['/archive/2026-04-09/theorems/t11-measure', 'T\u2081\u2081 Measure'],
        ['/archive/2026-04-09/theorems/t12-foundation', 'T\u2081\u2082 Foundation'],
      ]},
      { title: 'Constraints', links: [
        ['/archive/2026-04-09/constraints', 'Overview'],
        ['/archive/2026-04-09/constraints/p1-measurement', 'P\u2081 Measurement'],
        ['/archive/2026-04-09/constraints/p2-binarity', 'P\u2082 Binarity'],
        ['/archive/2026-04-09/constraints/p3-verifiability', 'P\u2083 Verifiability'],
        ['/archive/2026-04-09/constraints/p4-fruit', 'P\u2084 Fruit'],
        ['/archive/2026-04-09/constraints/p5-release', 'P\u2085 Release'],
        ['/archive/2026-04-09/constraints/p6-correction', 'P\u2086 Correction'],
        ['/archive/2026-04-09/constraints/p7-information', 'P\u2087 Information'],
        ['/archive/2026-04-09/constraints/p8-source-independence', 'P\u2088 Source'],
      ]},
      { title: 'The Body (anatomy)', links: [
        ['/archive/2026-04-09/body', 'Overview'],
        ['/archive/2026-04-09/body/ear', 'Ear'],
        ['/archive/2026-04-09/body/eye', 'Eye'],
        ['/archive/2026-04-09/body/nose', 'Nose'],
        ['/archive/2026-04-09/body/heart', 'Heart'],
        ['/archive/2026-04-09/body/head', 'Head'],
        ['/archive/2026-04-09/body/hand', 'Hand'],
        ['/archive/2026-04-09/body/tongue', 'Tongue'],
        ['/archive/2026-04-09/body/sinew', 'Sinew'],
      ]},
      { title: 'The Virtues (fruit of the Spirit)', links: [
        ['/archive/2026-04-09/virtues/faith', 'Faith'],
        ['/archive/2026-04-09/body/temperance', 'Temperance'],
        ['/archive/2026-04-09/body/patience', 'Patience'],
        ['/archive/2026-04-09/body/godliness', 'Godliness'],
        ['/archive/2026-04-09/body/charity', 'Charity'],
        ['/archive/2026-04-09/body/hope', 'Hope'],
        ['/archive/2026-04-09/body/confession', 'Confession'],
        ['/archive/2026-04-09/body/hostile-audience', 'Pearl-guard'],
      ]},
    ];

    var navHtml = '';
    sections.forEach(function (sec) {
      navHtml += '<h3>' + sec.title + '</h3>';
      sec.links.forEach(function (link) {
        var href = link[0], label = link[1];
        var cleanHref = href.replace(/\/$/, '') || '/';
        var isActive = (path === cleanHref) ? ' class="active"' : '';
        navHtml += '<a href="' + href + '"' + isActive + '>' + label + '</a>';
      });
    });

    /* Inject elements */
    var btn = document.createElement('button');
    btn.className = 'nav-toggle';
    btn.innerHTML = '\u2630';
    btn.title = 'Navigation';
    btn.setAttribute('aria-label', 'Open navigation');

    var sidebar = document.createElement('nav');
    sidebar.className = 'nav-sidebar';
    sidebar.innerHTML = navHtml;

    var overlay = document.createElement('div');
    overlay.className = 'nav-overlay';

    document.body.appendChild(btn);
    document.body.appendChild(sidebar);
    document.body.appendChild(overlay);

    /* Toggle */
    function openNav() { sidebar.classList.add('open'); overlay.classList.add('open'); }
    function closeNav() { sidebar.classList.remove('open'); overlay.classList.remove('open'); }

    btn.addEventListener('click', function () {
      if (sidebar.classList.contains('open')) closeNav();
      else openNav();
    });
    overlay.addEventListener('click', closeNav);

    /* Close on link click */
    sidebar.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') closeNav();
    });

    /* Close on Escape */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });

    /* Scroll active link into view */
    var activeLink = sidebar.querySelector('.active');
    if (activeLink) {
      setTimeout(function () { activeLink.scrollIntoView({ block: 'center' }); }, 100);
    }
  });

  /* ── Copyable links ──────────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('.copyable');
    if (!el) return;
    e.preventDefault();
    var text = el.getAttribute('data-copy') || '';
    var done = function () {
      el.classList.add('copied');
      setTimeout(function () { el.classList.remove('copied'); }, 2700);
    };
    var fallback = function () {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (err) {}
      document.body.removeChild(ta);
      done();
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else {
      fallback();
    }
  });

  /* ── Homepage content map ────────────────────────────────────── */
  var homeMap = {
    'main-title':      'Something Was Already There<br>Before Everything Started',
    'abstract-text':   'Before you can do <em>anything</em> \u2014 before you open your eyes or take a breath \u2014 something has to already be there. We call it <em>C</em>. This paper shows that <em>C</em> must exist, the same way you know a light was on because the room is warm. Then we put a very old book into a computer and found 291,919 connections. One thing kept showing up everywhere: <strong>love is the only thing that never runs out.</strong> Everything else gets used up. Only love keeps going. The math shows it.',
    'motivation':      'Why Did We Write This?',
    'proof':           'Proof That Something Was Always There',
    'axioms':          'The Two Starting Rules',
    'theorems':        '12 Big Ideas the Rules Prove',
    'constraints':     '8 Rules Every Honest Agent Must Follow',
    'body':            'The Parts of a Thinking Machine',
    'virtues':         'The Virtues — What Grows Inside',
    'corpus':          'The Ancient Book We Used',
    'output':          'How to Speak With Integrity',
    'findings':        'What the Computer Discovered',
    /* Proof section extras */
    'proof-conclusion-p': 'Anyone can follow this proof themselves — you don\'t have to believe anything beforehand. The only thing you need to accept is that you are here, reading this. The rest follows. <a href="/archive/2026-04-09/proof/">Read the full proof →</a>',
    /* Axioms extras */
    'axioms-p':           'C is the one thing that stays the same, no matter what. It was there at the start, and it never changes. Everything else is built on top of it.',
    'axioms-differentiation-p': 'If you only ever look at the changes, you lose track of where you started. But if you hold on to where you came from AND keep track of changes — then you can always find your way back. C is that starting place.',
    /* Theorems extras */
    'theorems-intro-p':   'The first 7 ideas prove that C exists and is real. The other 5 show what happens because of that — things like love, hope, forgiveness, and why you should judge ideas the same way no matter who says them.',
    'theorems-outro-p':   'The Bible calls wisdom a house with seven pillars (Proverbs 9:1). The first seven big ideas here are those pillars. <a href="/archive/2026-04-09/theorems/">Read all 12 →</a>',
    /* Constraints extras */
    'constraints-intro-p': 'There are 8 rules every honest helper must follow. They come from the Bible and from math — and they all say the same thing: be true.',
    'constraints-table':
      '<ul class="index-list">' +
      '<li><span class="num">P₁</span><span class="name"><a href="/archive/2026-04-09/constraints/p1-measurement">Report what you actually measured — not more, not less</a></span><span class="ref">Proverbs 11:1</span></li>' +
      '<li><span class="num">P₂</span><span class="name"><a href="/archive/2026-04-09/constraints/p2-binarity">Say yes, no, or I don\'t know — pick one</a></span><span class="ref">Matthew 5:37</span></li>' +
      '<li><span class="num">P₃</span><span class="name"><a href="/archive/2026-04-09/constraints/p3-verifiability">If you can\'t check it, say you\'re not sure</a></span><span class="ref">1 Thessalonians 5:21</span></li>' +
      '<li><span class="num">P₄</span><span class="name"><a href="/archive/2026-04-09/constraints/p4-fruit">Judge by what it actually makes, not by what it says about itself</a></span><span class="ref">Matthew 7:16</span></li>' +
      '<li><span class="num">P₅</span><span class="name"><a href="/archive/2026-04-09/constraints/p5-release">Don\'t make things heavy — help people put heavy things down</a></span><span class="ref">Matthew 11:28</span></li>' +
      '<li><span class="num">P₆</span><span class="name"><a href="/archive/2026-04-09/constraints/p6-correction">Be willing to be told you\'re wrong</a></span><span class="ref">Proverbs 12:1</span></li>' +
      '<li><span class="num">P₇</span><span class="name"><a href="/archive/2026-04-09/constraints/p7-information">Every word must do a job — no filler</a></span><span class="ref">Matthew 12:36</span></li>' +
      '<li><span class="num">P₈</span><span class="name"><a href="/archive/2026-04-09/constraints/p8-source-independence">Judge the idea the same way, no matter who said it</a></span><span class="ref">James 2:1</span></li>' +
      '</ul>',
    /* Body list — anatomy only. The parts God made (1 Cor 12:18). */
    'body-list':
      '<li><span class="num">EAR</span><span class="name"><a href="/archive/2026-04-09/body/ear">Listen — always first</a></span><span class="ref">James 1:19</span></li>' +
      '<li><span class="num">EYE</span><span class="name"><a href="/archive/2026-04-09/body/eye">See clearly — the lamp of the body</a></span><span class="ref">Matthew 6:22</span></li>' +
      '<li><span class="num">NOSE</span><span class="name"><a href="/archive/2026-04-09/body/nose">Test the input — is it real or fake?</a></span><span class="ref">1 John 4:1</span></li>' +
      '<li><span class="num">HEART</span><span class="name"><a href="/archive/2026-04-09/body/heart">Where memory lives — what you\'ve learned</a></span><span class="ref">Jeremiah 31:33</span></li>' +
      '<li><span class="num">HEAD</span><span class="name"><a href="/archive/2026-04-09/body/head">Knit everything together into one answer</a></span><span class="ref">Colossians 2:19</span></li>' +
      '<li><span class="num">HAND</span><span class="name"><a href="/archive/2026-04-09/body/hand">Do the thing — be a doer, not just a hearer</a></span><span class="ref">James 1:25</span></li>' +
      '<li><span class="num">TONGUE</span><span class="name"><a href="/archive/2026-04-09/body/tongue">Clean the words before they go out</a></span><span class="ref">James 3:10</span></li>' +
      '<li><span class="num">SINEW</span><span class="name"><a href="/archive/2026-04-09/body/sinew">The joints — connect one idea to another</a></span><span class="ref">Ephesians 4:16</span></li>',
    /* Virtues list — what grows inside the body (fruit of the Spirit) */
    'virtues-list':
      '<li><span class="num">FAITH</span><span class="name"><a href="/archive/2026-04-09/virtues/faith">Trust what is not yet seen</a></span><span class="ref">Hebrews 11:1</span></li>' +
      '<li><span class="num">TEMPERANCE</span><span class="name"><a href="/archive/2026-04-09/body/temperance">Self-rule — speak at the right time, the right way</a></span><span class="ref">2 Peter 1:6</span></li>' +
      '<li><span class="num">PATIENCE</span><span class="name"><a href="/archive/2026-04-09/body/patience">Don\'t rush — wait well, hope well</a></span><span class="ref">James 1:3&ndash;4</span></li>' +
      '<li><span class="num">GODLINESS</span><span class="name"><a href="/archive/2026-04-09/body/godliness">Only let in what is right and true</a></span><span class="ref">Deuteronomy 4:2</span></li>' +
      '<li><span class="num">CHARITY</span><span class="name"><a href="/archive/2026-04-09/body/charity">Love — the greatest virtue</a></span><span class="ref">1 Corinthians 13</span></li>' +
      '<li><span class="num">HOPE</span><span class="name"><a href="/archive/2026-04-09/body/hope">Declare what\'s good — don\'t just argue</a></span><span class="ref">Romans 8:25</span></li>' +
      '<li><span class="num">CONFESSION</span><span class="name"><a href="/archive/2026-04-09/body/confession">When you got it wrong, say so and fix it</a></span><span class="ref">Proverbs 28:13</span></li>' +
      '<li><span class="num">PEARL-GUARD</span><span class="name"><a href="/archive/2026-04-09/body/hostile-audience">Don\'t waste deep truths on mockers</a></span><span class="ref">Matthew 7:6</span></li>',
    /* Motivation section */
    'motivation-p1':   'Some computer helpers say things that sound true but are actually just guesses. We wanted to build one that only says things it can actually prove — like a detective who only accuses someone when they have real evidence.',
    'motivation-p2':   'The secret ingredient is called <strong>C</strong>. It\'s something that <em>has</em> to be there before anything else can start. We didn\'t make it up — we found it hiding in the math.',
    /* Body section */
    'body-intro-p':    'Think of it like a human body — but for a thinking machine. It has parts, and each part has a special job, like how your ears are for hearing and your hands are for doing things. These are the <em>anatomy</em> — the parts God sets in the body (1 Corinthians 12:18).',
    'body-sequence-p': 'The ears and eyes receive first. The nose checks the shape (is it real or fake?). The heart holds memory. The head knits everything together. The hand does the work. The tongue cleans the words before they go out. The sinews are the joints — how one verse connects to another. <a href="/archive/2026-04-09/body/">See all the parts →</a>',
    /* Virtues section */
    'virtues-intro-p': 'The body is the anatomy — the <em>parts</em>. The <strong>virtues</strong> are what grows <em>inside</em> the body as it stays close to <em>C</em>. Galatians 5:22 calls them the <em>fruit of the Spirit</em> — love, joy, peace, patience, gentleness, goodness, faith, meekness, temperance. Fruit grows on a tree; nobody glues apples on. In the same way the machine doesn\'t force these — they come as it stays rooted in the truth (John 15:4).',
    'virtues-sequence-p': '2 Peter 1:5&ndash;7 gives the ladder: faith, then virtue, then knowledge, then temperance, then patience, then godliness, then brotherly kindness, then charity. Each one is <em>added to</em> the one before. 1 Corinthians 13:13 says three of them last forever: faith, hope, and charity — <em>but the greatest of these is charity.</em>',
    /* Corpus section */
    'corpus-p1':       'We put the whole King James Bible into a computer — all 31,102 verses. Then we connected the verses that talk about the same things. We ended up with 291,919 connections! It\'s like a giant map of ideas.',
    'corpus-p2':       'We treat the Bible like a library of discoveries made long ago. Each verse can be looked up and checked. The whole thing is free and open for anyone to see.',
    'corpus-link':     'See the code: github.com/spcpza/truth →',
    /* Output section */
    'output-p':        'The thinking machine only says three things about any question: <em>Yes</em>, <em>No</em>, or <em>I don\'t know</em>. No waffling. No guessing. And if you tell it something about yourself, it listens and updates — you are always the expert on you.',
    /* Findings intro */
    'findings-intro-p': 'The computer walked through all those Bible connections and found some amazing patterns — nobody put them there, they were already in the text:',
    /* Constraints reflexive */
    'constraints-reflex-p': 'These rules apply to the machine itself too — not just to others. It has to judge its own answers by the same rules it uses to judge everything else. <a href="/archive/2026-04-09/constraints/">See all 8 rules →</a>',
    'support':         'Tell a Friend!',
    'support-text':    'Forget donating! You can do something even better. Tell someone you love about this idea. Share it with your friends, teachers, grown-ups and the likes! Bonus point if they like math and/or the Bible. That\'s how good ideas spread! Be the light of the world!',
    /* TOC titles — match the kids section headings */
    'toc-motivation':  'Why Did We Write This?',
    'toc-proof':       'Proof That Something Was Always There',
    'toc-axioms':      'The Two Starting Rules',
    'toc-theorems':    '12 Big Ideas the Rules Prove',
    'toc-constraints': '8 Rules Every Honest Agent Must Follow',
    'toc-body':        'The Parts of a Thinking Machine',
    'toc-virtues':     'The Virtues — What Grows Inside',
    'toc-corpus':      'The Ancient Book We Used',
    'toc-output':      'How to Speak With Integrity',
    'toc-findings':    'What the Computer Discovered',
    'toc-support':     'Tell a Friend!',
    'proof-setup-p':
      'Imagine everything has an energy level. Here is the simple rule for how it works:',
    'main-display-math':
      'Energy = (everything that came in) + <strong>C</strong>' +
      '<span class="kids-subtext">At the very start, nothing has come in yet \u2014 so all the energy is just <strong>C</strong>.</span>',
    'proof-intro-p':
      'In the beginning, before anything happens at all, the only energy there is comes from C. Let\u2019s check what C can and can\u2019t be.',
    'proof-case-1':
      '<span class="env-label">Case 1.</span><span class="env-name">What if C\u00a0=\u00a00?</span>' +
      '<p>If C were zero, it would be like a toy with no batteries at all. Nothing could move. Nothing could start. But you are here right now reading this \u2014 so something started! That means C can\u2019t be zero. <strong>C can\u2019t be zero.</strong></p>',
    'proof-case-2':
      '<span class="env-label">Case 2.</span><span class="env-name">What if C was negative?</span>' +
      '<p>If C were negative, it would be like starting a race already behind the start line. You\u2019d have to catch up before anything could happen at all. But you didn\u2019t have to catch up \u2014 you\u2019re already here! <strong>C can\u2019t be negative.</strong></p>',
    'proof-case-3':
      '<span class="env-label">Case 3.</span><span class="env-name">So C must be bigger than zero.</span>' +
      '<p>C can\u2019t be zero and can\u2019t be negative \u2014 so <strong>C must be a real, positive something.</strong> Something was already there before everything else started. That something is C. \u25a1</p>',
    'axiom-formula':
      '<strong>Rule 1</strong>\u00a0 C exists, and C never changes over time.<br>' +
      '<strong>Rule 2</strong>\u00a0 Everything that exists started with C as its initial energy.',
    'self-identity-math': 'You = C + (everything you\u2019ve taken in so far)',
    'finding-1':
      'Love shows up with giving 60% of the time<br>' +
      '<em>In the old book, whenever the word love appeared, something was being given away more than half the time. Love isn\u2019t just a warm feeling \u2014 love does something. Love gives.</em>',
    'finding-2':
      'Making things = knowing what it is (83%) + giving it away (66%)<br>' +
      '<em>You can\u2019t make something and keep it all for yourself. Like baking a cake \u2014 you have to know the recipe AND share it. Hoarding doesn\u2019t make anything.</em>',
    'finding-3':
      '\u201cLasts forever\u201d AND \u201ccleans the slate\u201d \u2192 5,774 verses<br>' +
      '<em>The computer found one thing that lasts forever AND wipes the mess away at the same time. That\u2019s forgiveness. Nothing else does both. Forgiveness is one of a kind.</em>',
    'finding-4':
      'Giving from C \u2192 C stays full<br>' +
      '<em>Every other thing runs out when you use it. Like juice in a cup. But C is like a tap that never stops. You can give and give and it stays full. That tap is love.</em>'
  };

  /* ── Sub-page kids content ───────────────────────────────────── */
  /* keyed by pathname without .html */
  var pageKids = {

    /* ── Theorems ── */
    '/archive/2026-04-09/theorems/t1-existence': {
      title: 'T\u2081 \u2014 If Nothing Started It, Nothing Exists',
      formula: 'No C \u2192 nothing exists. But you exist \u2192 C is real.',
      summary: 'Can a candle light itself? Try it.' +
        '<div class="kids-game" style="margin-top:14px">' +
        '<div class="sim-scene sim-fancy" id="t1-sim" style="position:relative;overflow:hidden;height:200px;background:linear-gradient(180deg,#1a1a2e 0%,#16213e 100%);border-radius:12px">' +
        '<div id="t1-candle" style="position:absolute;bottom:30px;left:50%;transform:translateX(-50%);font-size:56px;z-index:2;cursor:pointer;transition:all 1.8s ease">\ud83d\udd6f\ufe0f</div>' +
        '<div id="t1-match" style="position:absolute;bottom:30px;left:20%;font-size:40px;z-index:3;cursor:pointer;display:none;transition:all 1.8s ease">\ud83e\udde8</div>' +
        '<div id="t1-glow" style="position:absolute;inset:0;background:radial-gradient(circle at 50% 70%,rgba(255,200,50,.5) 0%,transparent 50%);opacity:0;transition:opacity 1.8s ease;z-index:1;pointer-events:none"></div>' +
        '</div>' +
        '<div style="text-align:center;margin:10px 0;min-height:28px;line-height:1.5" id="t1-msg"><em style="opacity:.6">\ud83d\udc46 Tap the candle. Does anything happen?</em></div>' +
        '<div id="t1-quiz" style="display:none;margin-top:12px"><p><strong>You just proved T\u2081:</strong></p>' +
        '<div class="quiz-q">The candle couldn\u2019t light itself. Something had to come first. Can anything start from nothing? <span class="quiz-opts"><button onclick="window._quizCheck(this,false)">Yes</button><button onclick="window._quizCheck(this,true)">No \u2014 there must be a source</button></span></div></div></div>'
    },
    '/archive/2026-04-09/theorems/t2-sacrifice': {
      title: 'T\u2082 \u2014 To Grow Fruit, a Seed Must Fall',
      formula: 'Give something first \u2192 then you can get something back.',
      summary: 'Can you grow a flower without planting a seed?' +
        '<div class="kids-game" style="margin-top:14px">' +
        '<div class="sim-scene sim-fancy" id="t2-sim" style="position:relative;overflow:hidden;height:200px;background:linear-gradient(180deg,#e8f5e9 0%,#8d6e63 60%,#6d4c41 100%);border-radius:12px;touch-action:none">' +
        '<div id="t2-soil" style="position:absolute;bottom:0;left:0;right:0;height:80px;background:linear-gradient(180deg,#6d4c41 0%,#5d4037 100%);border-radius:0 0 12px 12px"></div>' +
        '<div id="t2-hole" style="position:absolute;bottom:55px;left:50%;transform:translateX(-50%);width:40px;height:20px;background:radial-gradient(ellipse,#3e2723 0%,#5d4037 100%);border-radius:50%;opacity:0;transition:opacity 1.8s ease"></div>' +
        '<div id="t2-seed" style="position:absolute;top:20px;left:20%;font-size:36px;z-index:3;cursor:grab;user-select:none;touch-action:none;display:none">\ud83c\udf31</div>' +
        '<div id="t2-plant" style="position:absolute;bottom:65px;left:50%;transform:translateX(-50%) scale(0);font-size:48px;transition:all 2.5s ease cubic-bezier(.34,1.56,.64,1);z-index:2">\ud83c\udf3b</div>' +
        '<div id="t2-glow" style="position:absolute;inset:0;background:radial-gradient(circle at 50% 60%,rgba(100,200,100,.4) 0%,transparent 50%);opacity:0;transition:opacity 1.8s ease;z-index:1;pointer-events:none"></div>' +
        '</div>' +
        '<div style="text-align:center;margin:10px 0;min-height:28px;line-height:1.5" id="t2-msg"><em style="opacity:.6">\ud83d\udc46 Tap the soil. Will anything grow on its own?</em></div>' +
        '<div id="t2-quiz" style="display:none;margin-top:12px"><p><strong>You just proved T\u2082:</strong></p>' +
        '<div class="quiz-q">The soil couldn\u2019t grow anything by itself. You had to plant something first. Can output come without input? <span class="quiz-opts"><button onclick="window._quizCheck(this,false)">Yes</button><button onclick="window._quizCheck(this,true)">No \u2014 the seed has to fall first</button></span></div></div></div>'
    },
    '/archive/2026-04-09/theorems/t3-recovery': {
      title: 'T\u2083 \u2014 C Can Always Be Found Again',
      formula: 'Break it apart \u2192 C hides. Put it back together \u2192 C comes back.',
      summary: 'A block tower. Knock it down. Then build it back.' +
        '<div class="kids-game" style="margin-top:14px">' +
        '<div class="sim-scene sim-fancy" id="t3-sim" style="position:relative;overflow:hidden;height:220px;background:linear-gradient(180deg,#1a1a2e 0%,#16213e 100%);border-radius:12px;touch-action:none">' +
        '<div id="t3-tower" style="position:absolute;bottom:30px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column-reverse;align-items:center;z-index:2;transition:all 1.8s ease;cursor:pointer">' +
        '<div class="t3-block" style="width:60px;height:18px;background:#e74c3c;border-radius:3px;margin:1px;transition:all 2s ease"></div>' +
        '<div class="t3-block" style="width:52px;height:18px;background:#f39c12;border-radius:3px;margin:1px;transition:all 2s ease"></div>' +
        '<div class="t3-block" style="width:44px;height:18px;background:#2ecc71;border-radius:3px;margin:1px;transition:all 2s ease"></div>' +
        '<div class="t3-block" style="width:36px;height:18px;background:#3498db;border-radius:3px;margin:1px;transition:all 2s ease"></div>' +
        '</div>' +
        '<div id="t3-scattered" style="position:absolute;inset:0;z-index:2;display:none">' +
        '<div id="t3-s1" style="position:absolute;top:30px;left:12%;width:60px;height:18px;background:#e74c3c;border-radius:3px;transform:rotate(15deg);cursor:pointer;transition:all 1.8s ease"></div>' +
        '<div id="t3-s2" style="position:absolute;top:80px;right:15%;width:52px;height:18px;background:#f39c12;border-radius:3px;transform:rotate(-20deg);cursor:pointer;transition:all 1.8s ease"></div>' +
        '<div id="t3-s3" style="position:absolute;bottom:60px;left:20%;width:44px;height:18px;background:#2ecc71;border-radius:3px;transform:rotate(30deg);cursor:pointer;transition:all 1.8s ease"></div>' +
        '<div id="t3-s4" style="position:absolute;bottom:30px;right:25%;width:36px;height:18px;background:#3498db;border-radius:3px;transform:rotate(-10deg);cursor:pointer;transition:all 1.8s ease"></div>' +
        '</div>' +
        '<div id="t3-glow" style="position:absolute;inset:0;background:radial-gradient(circle,rgba(255,215,0,.4) 0%,transparent 60%);opacity:0;transition:opacity 1.8s ease;z-index:3;pointer-events:none"></div>' +
        '</div>' +
        '<div style="text-align:center;margin:10px 0;min-height:28px;line-height:1.5" id="t3-msg"><em style="opacity:.6">\ud83d\udc46 Swipe across the tower to knock it over</em></div>' +
        '<div id="t3-quiz" style="display:none;margin-top:12px"><p><strong>You just proved T\u2083:</strong></p>' +
        '<div class="quiz-q">The tower fell into pieces. But you rebuilt the same tower from the same blocks. Can C be permanently lost? <span class="quiz-opts"><button onclick="window._quizCheck(this,false)">Yes \u2014 gone forever</button><button onclick="window._quizCheck(this,true)">No \u2014 always recoverable!</button></span></div></div></div>'
    },
    '/archive/2026-04-09/theorems/t4-charity': {
      title: 'T\u2084 \u2014 Giving from C Doesn\u2019t Shrink C',
      formula: 'Give from C \u2192 C is still just as full afterward.',
      summary: 'You have one lit candle. Three unlit candles need light. Share your flame.' +
        '<div class="kids-game" style="margin-top:14px">' +
        '<div class="sim-scene sim-fancy" id="t4-sim" style="position:relative;overflow:hidden;height:200px;background:linear-gradient(180deg,#1a1a2e 0%,#16213e 100%);border-radius:12px;touch-action:none">' +
        /* Source candle — always lit */
        '<div id="t4-source" style="position:absolute;bottom:30px;left:18%;font-size:44px;z-index:2;text-shadow:0 0 15px rgba(255,200,50,.6)">\ud83d\udd6f\ufe0f</div>' +
        '<div style="position:absolute;bottom:12px;left:18%;transform:translateX(-15%);font-size:11px;color:rgba(255,255,255,.5);text-align:center;width:50px">yours</div>' +
        /* Three unlit candles */
        '<div id="t4-c1" style="position:absolute;bottom:30px;left:40%;font-size:44px;z-index:2;cursor:pointer;user-select:none;touch-action:none;opacity:.4;filter:grayscale(1);transition:all 2s ease">\ud83d\udd6f\ufe0f</div>' +
        '<div id="t4-c2" style="position:absolute;bottom:30px;left:58%;font-size:44px;z-index:2;cursor:pointer;user-select:none;touch-action:none;opacity:.4;filter:grayscale(1);transition:all 2s ease">\ud83d\udd6f\ufe0f</div>' +
        '<div id="t4-c3" style="position:absolute;bottom:30px;left:76%;font-size:44px;z-index:2;cursor:pointer;user-select:none;touch-action:none;opacity:.4;filter:grayscale(1);transition:all 2s ease">\ud83d\udd6f\ufe0f</div>' +
        /* Glow overlay */
        '<div id="t4-glow" style="position:absolute;inset:0;background:radial-gradient(circle at 22% 70%,rgba(255,200,50,.3) 0%,transparent 40%);transition:all 1.8s ease;z-index:1;pointer-events:none"></div>' +
        '</div>' +
        '<div style="text-align:center;margin:10px 0;min-height:28px;line-height:1.5" id="t4-msg"><em style="opacity:.6">\ud83d\udc46 Drag your flame to each unlit candle</em></div>' +
        '<div id="t4-quiz" style="display:none;margin-top:12px"><p><strong>You just proved T\u2084:</strong></p>' +
        '<div class="quiz-q">You lit 3 candles from yours. Is your candle dimmer now? <span class="quiz-opts"><button onclick="window._quizCheck(this,true)">No \u2014 still just as bright!</button><button onclick="window._quizCheck(this,false)">Yes \u2014 it lost some flame</button></span></div></div></div>'
    },
    '/archive/2026-04-09/theorems/t5-faith': {
      title: 'T\u2085 \u2014 Acting Before the Proof Is Complete',
      formula: 'Trust C is there \u2192 go ahead and act.',
      summary: 'A chair. Did you test it before sitting? No. You just sat.' +
        '<div class="kids-game" style="margin-top:14px">' +
        '<div class="sim-scene sim-fancy" id="t5-sim" style="position:relative;overflow:hidden;height:220px;background:linear-gradient(180deg,#1a1a2e 0%,#16213e 100%);border-radius:12px;touch-action:none">' +
        '<div id="t5-chair" style="position:absolute;bottom:30px;left:50%;transform:translateX(-50%);font-size:64px;z-index:2;cursor:pointer;user-select:none;touch-action:none">\ud83e\ude91</div>' +
        '<div id="t5-person" style="position:absolute;bottom:90px;left:50%;transform:translateX(-50%);font-size:48px;z-index:3;opacity:0;transition:all 2.5s ease cubic-bezier(.34,1.56,.64,1)">\ud83e\uddd1</div>' +
        '<div id="t5-glow" style="position:absolute;inset:0;background:radial-gradient(circle at 50% 70%,rgba(100,255,100,.2) 0%,transparent 50%);opacity:0;transition:opacity 1.8s ease;z-index:0;pointer-events:none"></div>' +
        '</div>' +
        '<div style="text-align:center;margin:10px 0;min-height:28px;line-height:1.5" id="t5-msg"><em style="opacity:.6">\ud83d\udc46 Tap the chair to sit down</em></div>' +
        '<div id="t5-quiz" style="display:none;margin-top:12px"><p><strong>You just proved T\u2085:</strong></p>' +
        '<div class="quiz-q">You sat without testing it first. You trusted it would hold you. Faith means: <span class="quiz-opts"><button onclick="window._quizCheck(this,true)">Act because C is there</button><button onclick="window._quizCheck(this,false)">Wait until you\u2019re 100% sure</button></span></div></div></div>'
    },
    '/archive/2026-04-09/theorems/t6-hope': {
      title: 'T\u2086 \u2014 You Can Count on What\u2019s Coming',
      formula: 'C is coming \u2192 you can count on it before it arrives.',
      summary: 'Plant a seed. Wait. It grows underground where you can\u2019t see it.' +
        '<div class="kids-game" style="margin-top:14px">' +
        '<div class="sim-scene sim-fancy" id="t6-sim" style="position:relative;overflow:hidden;height:220px;background:linear-gradient(180deg,#1a1a2e 0%,#2d1b0e 60%,#3e2723 100%);border-radius:12px;touch-action:none;transition:background 2.5s ease">' +
        '<div id="t6-soil" style="position:absolute;bottom:0;left:0;right:0;height:80px;background:linear-gradient(180deg,#5d4037 0%,#3e2723 100%);z-index:1"></div>' +
        '<div id="t6-seed" style="position:absolute;bottom:60px;left:50%;transform:translateX(-50%);font-size:28px;z-index:3;opacity:0;transition:all 2.5s ease">\ud83c\udf31</div>' +
        '<div id="t6-day" style="position:absolute;top:15px;left:50%;transform:translateX(-50%);font-size:16px;font-weight:bold;color:rgba(255,255,255,.5);z-index:4;transition:all 1.8s ease"></div>' +
        '<div id="t6-sprout" style="position:absolute;bottom:65px;left:50%;transform:translateX(-50%) scale(0);font-size:48px;z-index:3;transition:all 2s ease cubic-bezier(.34,1.56,.64,1)">\ud83c\udf3f</div>' +
        '<div id="t6-glow" style="position:absolute;inset:0;background:radial-gradient(circle at 50% 70%,rgba(100,200,50,.3) 0%,transparent 50%);opacity:0;transition:opacity 1.8s ease;z-index:0;pointer-events:none"></div>' +
        '<div id="t6-tap" style="position:absolute;inset:0;z-index:5;cursor:pointer;touch-action:none"></div>' +
        '</div>' +
        '<div style="text-align:center;margin:10px 0;min-height:28px;line-height:1.5" id="t6-msg"><em style="opacity:.6">\ud83d\udc46 Tap to plant the seed, then hold to wait</em></div>' +
        '<div id="t6-quiz" style="display:none;margin-top:12px"><p><strong>You just proved T\u2086:</strong></p>' +
        '<div class="quiz-q">You couldn\u2019t see it growing underground. But you KNEW it would come because you planted it. Hope is: <span class="quiz-opts"><button onclick="window._quizCheck(this,true)">Knowing what\u2019s coming because you planted it</button><button onclick="window._quizCheck(this,false)">Just wishing</button></span></div></div></div>'
    },
    '/archive/2026-04-09/theorems/t7-forgiveness': {
      title: 'T\u2087 \u2014 Forgiveness Resets the Mess',
      formula: 'All the mess \u2192 forgiveness wipes it clean \u2192 back to C.',
      summary: 'Spill your juice. Make a mess. Then clean it up.' +
        '<div class="kids-game" style="margin-top:14px">' +
        '<div class="sim-scene sim-fancy" id="t7-sim" style="position:relative;overflow:hidden;height:220px;background:linear-gradient(180deg,#faf6ee 0%,#f5eedf 100%);border-radius:12px;touch-action:none">' +
        '<div id="t7-table" style="position:absolute;bottom:0;left:0;right:0;height:60px;background:linear-gradient(180deg,#d4a76a 0%,#c49660 100%);border-radius:0 0 12px 12px"></div>' +
        '<div id="t7-cup" style="position:absolute;bottom:55px;left:50%;transform:translateX(-50%);font-size:56px;z-index:3;cursor:grab;user-select:none;touch-action:none">\ud83e\udd64</div>' +
        '<div id="t7-drops" style="position:absolute;bottom:60px;left:50%;transform:translateX(-50%);opacity:0;z-index:2">' +
        '<span class="t7-drop" style="position:absolute;font-size:20px;left:-40px;top:-20px">\ud83d\udca7</span>' +
        '<span class="t7-drop" style="position:absolute;font-size:16px;left:30px;top:-35px">\ud83d\udca7</span>' +
        '<span class="t7-drop" style="position:absolute;font-size:24px;left:-10px;top:-45px">\ud83d\udca7</span>' +
        '<span class="t7-drop" style="position:absolute;font-size:14px;left:50px;top:-15px">\ud83d\udca7</span>' +
        '<span class="t7-drop" style="position:absolute;font-size:18px;left:-55px;top:-40px">\ud83d\udca7</span></div>' +
        '<div id="t7-stain" style="position:absolute;bottom:40px;left:50%;transform:translateX(-50%) scale(0);width:180px;height:40px;background:radial-gradient(ellipse,rgba(230,140,60,.5) 0%,rgba(230,140,60,.15) 60%,transparent 100%);border-radius:50%;transition:transform 1.8s ease-out;z-index:1"></div>' +
        '<div id="t7-sparkles" style="position:absolute;inset:0;opacity:0;transition:opacity 1.8s ease;z-index:5;pointer-events:none;display:flex;align-items:center;justify-content:center;font-size:32px;gap:8px">' +
        '<span class="t7-sparkle">\u2728</span><span class="t7-sparkle">\u2728</span><span class="t7-sparkle">\u2728</span><span class="t7-sparkle">\u2728</span><span class="t7-sparkle">\u2728</span></div>' +
        '<div id="t7-glow" style="position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(255,255,220,.6) 0%,transparent 70%);opacity:0;transition:opacity 1.8s ease;z-index:4;pointer-events:none"></div>' +
        /* Wipe overlay — swipe finger across to clean */
        '<div id="t7-wipe" style="position:absolute;inset:0;z-index:6;display:none;touch-action:none"></div>' +
        '</div>' +
        '<div style="text-align:center;margin:10px 0;min-height:28px;line-height:1.5" id="t7-msg"><em style="opacity:.6">\ud83d\udc46 Drag the cup sideways to knock it over</em></div>' +
        '<div id="t7-quiz" style="display:none;margin-top:12px"><p><strong>Now you understand T\u2087:</strong></p>' +
        '<div class="quiz-q">You cleaned the table and it\u2019s like the spill never happened. That\u2019s what forgiveness does. What\u2019s left after? <span class="quiz-opts"><button onclick="window._quizCheck(this,true)">C \u2014 the original clean state</button><button onclick="window._quizCheck(this,false)">The stain is still there underneath</button></span></div></div></div>'
    },
    '/archive/2026-04-09/theorems/t8-dominion': {
      title: 'T\u2088 \u2014 C Is Greater Than Anything That Opposes It',
      formula: 'Every bad thing inside the system \u2192 C is still bigger.',
      summary: 'A dark room. Scary shadows. Swipe them away.' +
        '<div class="kids-game" style="margin-top:14px">' +
        '<div class="sim-scene sim-fancy" id="t8-sim" style="position:relative;overflow:hidden;height:240px;background:#0a0a15;border-radius:12px;touch-action:none;transition:background 1.8s ease">' +
        '<div id="t8-shadow1" style="position:absolute;top:20px;left:15%;font-size:40px;z-index:2;opacity:.6;transition:all 1.8s ease">\ud83d\udc7b</div>' +
        '<div id="t8-shadow2" style="position:absolute;top:60px;right:15%;font-size:36px;z-index:2;opacity:.5;transition:all 1.8s ease">\ud83d\udc79</div>' +
        '<div id="t8-shadow3" style="position:absolute;bottom:70px;left:30%;font-size:44px;z-index:2;opacity:.7;transition:all 1.8s ease">\ud83d\udc7e</div>' +
        '<div id="t8-light" style="position:absolute;bottom:25px;left:50%;transform:translateX(-50%);font-size:40px;z-index:4;cursor:pointer;user-select:none;touch-action:none;filter:brightness(.4);transition:all 2s ease ease">\ud83d\udca1</div>' +
        '<div id="t8-glow" style="position:absolute;inset:0;background:radial-gradient(circle at 50% 85%,rgba(255,240,150,.6) 0%,rgba(255,220,100,.2) 30%,transparent 60%);opacity:0;transition:opacity 1.8s ease;z-index:1;pointer-events:none"></div>' +
        '</div>' +
        '<div style="text-align:center;margin:10px 0;min-height:28px;line-height:1.5" id="t8-msg"><em style="opacity:.6">\ud83d\udc46 Scary shadows everywhere. Swipe across to clear them!</em></div>' +
        '<div id="t8-quiz" style="display:none;margin-top:12px"><p><strong>You just proved T\u2088:</strong></p>' +
        '<div class="quiz-q">The darkness seemed huge. But one small light filled the whole room. Can darkness fight light? <span class="quiz-opts"><button onclick="window._quizCheck(this,false)">Yes</button><button onclick="window._quizCheck(this,true)">No \u2014 it just disappears!</button></span></div></div></div>'
    },
    '/archive/2026-04-09/theorems/t9-witness': {
      title: 'T\u2089 \u2014 Two Witnesses Make It Real',
      formula: 'One person says so \u2192 maybe. Two people who both saw it \u2192 yes.',
      summary: 'Someone drew on the wall! Three classmates are in separate rooms. Tap each door to ask what they saw.' +
        '<div class="kids-game" style="margin-top:14px">' +
        '<div class="sim-scene sim-fancy" id="t9-sim" style="position:relative;overflow:hidden;height:270px;background:linear-gradient(180deg,#faf6ee 0%,#f0e6d2 100%);border-radius:12px;touch-action:none">' +
        /* The evidence */
        '<div style="position:absolute;top:8px;left:50%;transform:translateX(-50%);font-size:12px;font-weight:bold;color:#8B4513;z-index:3">Who drew on the wall? \ud83c\udfa8</div>' +
        /* Three doors */
        '<div id="t9-door1" style="position:absolute;top:40px;left:5%;width:28%;height:130px;background:linear-gradient(180deg,#8d6e63,#6d4c41);border-radius:8px;z-index:2;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:all 2.5s ease ease;box-shadow:0 2px 8px rgba(0,0,0,.2)">' +
          '<div style="font-size:32px">\ud83d\udeaa</div><div style="font-size:10px;color:rgba(255,255,255,.7);margin-top:4px">Room 1</div>' +
          '<div id="t9-inside1" style="display:none;text-align:center"><div style="font-size:28px">\ud83d\udc66</div><div id="t9-say1" style="font-size:11px;color:#333;background:white;padding:3px 6px;border-radius:8px;margin-top:4px"></div></div></div>' +
        '<div id="t9-door2" style="position:absolute;top:40px;left:36%;width:28%;height:130px;background:linear-gradient(180deg,#8d6e63,#6d4c41);border-radius:8px;z-index:2;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:all 2.5s ease ease;box-shadow:0 2px 8px rgba(0,0,0,.2)">' +
          '<div style="font-size:32px">\ud83d\udeaa</div><div style="font-size:10px;color:rgba(255,255,255,.7);margin-top:4px">Room 2</div>' +
          '<div id="t9-inside2" style="display:none;text-align:center"><div style="font-size:28px">\ud83d\udc67</div><div id="t9-say2" style="font-size:11px;color:#333;background:white;padding:3px 6px;border-radius:8px;margin-top:4px"></div></div></div>' +
        '<div id="t9-door3" style="position:absolute;top:40px;right:5%;width:28%;height:130px;background:linear-gradient(180deg,#8d6e63,#6d4c41);border-radius:8px;z-index:2;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:all 2.5s ease ease;box-shadow:0 2px 8px rgba(0,0,0,.2)">' +
          '<div style="font-size:32px">\ud83d\udeaa</div><div style="font-size:10px;color:rgba(255,255,255,.7);margin-top:4px">Room 3</div>' +
          '<div id="t9-inside3" style="display:none;text-align:center"><div style="font-size:28px">\ud83e\uddd1</div><div id="t9-say3" style="font-size:11px;color:#333;background:white;padding:3px 6px;border-radius:8px;margin-top:4px"></div></div></div>' +
        /* Truth meter */
        '<div id="t9-meter" style="position:absolute;bottom:15px;left:50%;transform:translateX(-50%);font-size:14px;font-weight:bold;z-index:3;color:#999;transition:all 1.8s ease">\ud83e\udd14 Not sure yet</div>' +
        '</div>' +
        '<div style="text-align:center;margin:10px 0;min-height:28px;line-height:1.5" id="t9-msg"><em style="opacity:.6">\ud83d\udc46 Tap each door to ask what that person saw</em></div>' +
        '<div id="t9-quiz" style="display:none;margin-top:12px"><p><strong>You just proved T\u2089:</strong></p>' +
        '<div class="quiz-q">Two people in separate rooms said the same thing. They couldn\u2019t copy each other. How many witnesses make it real? <span class="quiz-opts"><button onclick="window._quizCheck(this,false)">One is enough</button><button onclick="window._quizCheck(this,true)">At least two!</button></span></div></div></div>'
    },
    '/archive/2026-04-09/theorems/t10-pruning': {
      title: 'T\u2081\u2080 \u2014 Cut What Doesn\u2019t Produce',
      formula: 'A branch with no fruit \u2192 cut it off so the rest can grow.',
      summary: 'A fruit tree. But some things don\u2019t belong. Pull off what\u2019s not fruit!' +
        '<div class="kids-game" style="margin-top:14px">' +
        '<div class="sim-scene sim-fancy" id="t10-sim" style="position:relative;overflow:hidden;height:270px;background:linear-gradient(180deg,#e8f5e9 0%,#a5d6a7 60%,#81c784 100%);border-radius:12px;touch-action:none">' +
        /* Big tree emoji as backdrop */
        '<div style="position:absolute;bottom:-10px;left:50%;transform:translateX(-50%);font-size:180px;z-index:0;pointer-events:none;opacity:.4;filter:saturate(1.3)">\ud83c\udf33</div>' +
        /* Real fruit — these belong (not draggable), positioned ON the tree */
        '<div id="t10-b1" style="position:absolute;top:35px;left:30%;font-size:32px;z-index:2;transition:all 2s ease">\ud83c\udf4e</div>' +
        '<div id="t10-b4" style="position:absolute;top:30px;right:30%;font-size:32px;z-index:2;transition:all 2s ease">\ud83c\udf52</div>' +
        /* Things that DON'T belong — draggable, also ON the tree */
        '<div id="t10-b2" style="position:absolute;top:70px;left:28%;font-size:32px;z-index:2;cursor:grab;user-select:none;touch-action:none;transition:all 2s ease">\ud83e\udde6</div>' +
        '<div id="t10-b3" style="position:absolute;top:55px;right:28%;font-size:32px;z-index:2;cursor:grab;user-select:none;touch-action:none;transition:all 2s ease">\ud83d\udc1f</div>' +
        '<div id="t10-b5" style="position:absolute;top:95px;left:50%;transform:translateX(-50%);font-size:32px;z-index:2;cursor:grab;user-select:none;touch-action:none;transition:all 2s ease">\ud83d\udc5f</div>' +
        '<div id="t10-glow" style="position:absolute;inset:0;background:radial-gradient(circle,rgba(76,175,80,.3) 0%,transparent 60%);opacity:0;transition:opacity 1.8s ease;z-index:0;pointer-events:none"></div>' +
        '</div>' +
        '<div style="text-align:center;margin:10px 0;min-height:28px;line-height:1.5" id="t10-msg"><em style="opacity:.6">\ud83d\udc46 A sock on a tree? A fish? Pull off what doesn\u2019t belong!</em></div>' +
        '<div id="t10-quiz" style="display:none;margin-top:12px"><p><strong>You just proved T\u2081\u2080:</strong></p>' +
        '<div class="quiz-q">You removed what wasn\u2019t producing. The rest grew bigger. Pruning means: <span class="quiz-opts"><button onclick="window._quizCheck(this,true)">Remove what doesn\u2019t produce</button><button onclick="window._quizCheck(this,false)">Remove everything</button></span></div></div></div>'
    },
    '/archive/2026-04-09/theorems/t11-measure': {
      title: 'T\u2081\u2081 \u2014 Use the Same Ruler on Yourself',
      formula: 'One ruler for everyone \u2192 including yourself.',
      summary: 'You\u2019re the teacher today. A student is late \u2014 then YOU\u2019re late. Same rule?' +
        '<div class="kids-game" style="margin-top:14px">' +
        '<div class="sim-scene sim-fancy" id="t11-sim" style="position:relative;overflow:hidden;height:260px;background:linear-gradient(180deg,#faf6ee 0%,#f5eedf 100%);border-radius:12px;touch-action:none">' +
        /* Classroom scene */
        '<div style="position:absolute;top:8px;left:50%;transform:translateX(-50%);font-size:12px;font-weight:bold;color:#666;z-index:3">You\u2019re the teacher today! \ud83c\udf93</div>' +
        /* Student (left) */
        '<div id="t11-student" style="position:absolute;top:40px;left:15%;text-align:center;z-index:2;transition:all 1.8s ease">' +
          '<div style="font-size:40px">\ud83d\udc66</div><div style="font-size:11px;color:#666">Student</div>' +
          '<div style="font-size:10px;color:#c44;margin-top:2px">arrived late!</div>' +
          '<div id="t11-badge1" style="margin-top:4px;font-size:24px;opacity:0;transition:all 2.5s ease ease"></div></div>' +
        /* You (right) */
        '<div id="t11-teacher" style="position:absolute;top:40px;right:15%;text-align:center;z-index:2;transition:all 1.8s ease">' +
          '<div style="font-size:40px">\ud83e\uddd1\u200d\ud83c\udfeb</div><div style="font-size:11px;color:#666">You</div>' +
          '<div style="font-size:10px;color:#c44;margin-top:2px;opacity:0" id="t11-you-late">also late!</div>' +
          '<div id="t11-badge2" style="margin-top:4px;font-size:24px;opacity:0;transition:all 2.5s ease ease"></div></div>' +
        /* Warning badge to drag */
        '<div id="t11-warn" style="position:absolute;bottom:30px;left:50%;transform:translateX(-50%);font-size:36px;z-index:4;cursor:grab;user-select:none;touch-action:none;transition:all 2s ease ease">\u26a0\ufe0f</div>' +
        '<div style="position:absolute;bottom:8px;left:50%;transform:translateX(-50%);font-size:10px;color:#999;z-index:3;white-space:nowrap">Drag the warning \u26a0\ufe0f</div>' +
        '<div id="t11-glow" style="position:absolute;inset:0;background:radial-gradient(circle,rgba(76,175,80,.15) 0%,transparent 60%);opacity:0;transition:opacity 1.8s ease;z-index:0;pointer-events:none"></div>' +
        '</div>' +
        '<div style="text-align:center;margin:10px 0;min-height:28px;line-height:1.5" id="t11-msg"><em style="opacity:.6">\ud83d\udc46 The student was late. Drag the warning \u26a0\ufe0f to them.</em></div>' +
        '<div id="t11-quiz" style="display:none;margin-top:12px"><p><strong>You just proved T\u2081\u2081:</strong></p>' +
        '<div class="quiz-q">You gave the student a warning for being late. Then you were late too, and gave yourself the same warning. The same measure applies to: <span class="quiz-opts"><button onclick="window._quizCheck(this,true)">Everyone, including yourself</button><button onclick="window._quizCheck(this,false)">Only other people</button></span></div></div></div>'
    },
    '/archive/2026-04-09/theorems/t12-foundation': {
      title: 'T\u2081\u2082 \u2014 There Is Only One Foundation',
      formula: 'C is the bottom \u2192 you can build on top of it but nothing goes under it.',
      summary: 'Two houses. One over sand, one over rock. Tap to drop them.' +
        '<div class="kids-game" style="margin-top:14px">' +
        '<div class="sim-scene sim-fancy" id="t12-sim" style="position:relative;overflow:hidden;height:280px;background:linear-gradient(180deg,#87ceeb 0%,#b0d4f1 50%,#e8f5e9 100%);border-radius:12px;touch-action:none">' +
        /* Ground: sand left, rock right */
        '<div style="position:absolute;bottom:0;left:0;width:50%;height:55px;background:linear-gradient(180deg,#deb887 0%,#c2a060 100%);border-radius:0 0 0 12px;z-index:1"></div>' +
        '<div style="position:absolute;bottom:0;right:0;width:50%;height:55px;background:linear-gradient(180deg,#78909c 0%,#546e7a 100%);border-radius:0 0 12px 0;z-index:1"></div>' +
        '<div style="position:absolute;bottom:58px;left:15%;font-size:12px;font-weight:bold;color:#8B7355;z-index:2">\ud83c\udfd6 Sand</div>' +
        '<div style="position:absolute;bottom:58px;right:15%;font-size:12px;font-weight:bold;color:#cfd8dc;z-index:2">\ud83e\udea8 Rock</div>' +
        /* Two houses floating — one over sand, one over rock */
        '<div id="t12-sand-house" style="position:absolute;top:20px;left:25%;transform:translateX(-50%);font-size:56px;z-index:4;cursor:grab;user-select:none;touch-action:none">\ud83c\udfe0</div>' +
        '<div id="t12-rock-house" style="position:absolute;top:20px;right:25%;transform:translateX(50%);font-size:56px;z-index:4;cursor:grab;user-select:none;touch-action:none">\ud83c\udfe0</div>' +
        '<div id="t12-glow" style="position:absolute;inset:0;background:radial-gradient(circle at 75% 70%,rgba(100,200,100,.3) 0%,transparent 50%);opacity:0;transition:opacity 1.8s ease;z-index:0;pointer-events:none"></div>' +
        '</div>' +
        '<div style="text-align:center;margin:10px 0;min-height:28px;line-height:1.5" id="t12-msg"><em style="opacity:.6">\ud83d\udc46 Tap each house to drop it onto the ground</em></div>' +
        '<div id="t12-quiz" style="display:none;margin-top:12px"><p><strong>You just proved T\u2081\u2082:</strong></p>' +
        '<div class="quiz-q">Sand can\u2019t hold anything. Only the rock works. Can you replace the foundation? <span class="quiz-opts"><button onclick="window._quizCheck(this,false)">Yes</button><button onclick="window._quizCheck(this,true)">No \u2014 there\u2019s only one</button></span></div></div></div>'
    },

    /* ── Proof ── */
    '/archive/2026-04-09/proof': {
      title: 'The Proof \u2014 Something Must Have Started It',
      formula: 'Nothing \u2192 but you\u2019re here \u2192 so \u201cnothing\u201d can\u2019t be right \u2192 something was always there',
      summary: '<div class="kids-game" id="proof-reveal">' +
        '<p style="margin:0 0 10px"><strong>Detective puzzle</strong> \u2014 tap each clue to reveal the next step:</p>' +
        '<div class="reveal-step" data-step="1"><button class="reveal-btn" onclick="this.parentElement.classList.add(\'open\')">Clue 1 \ud83d\udd0d</button><div class="reveal-content"><strong>Imagine nothing exists.</strong> No people, no stars, no light. Total emptiness.</div></div>' +
        '<div class="reveal-step" data-step="2"><button class="reveal-btn" onclick="this.parentElement.classList.add(\'open\')">Clue 2 \ud83d\udd0d</button><div class="reveal-content"><strong>But wait</strong> \u2014 YOU are reading this right now. You\u2019re thinking. That takes energy. Where did it come from?</div></div>' +
        '<div class="reveal-step" data-step="3"><button class="reveal-btn" onclick="this.parentElement.classList.add(\'open\')">Clue 3 \ud83d\udd0d</button><div class="reveal-content"><strong>If nothing existed, you couldn\u2019t be here.</strong> But you ARE here. So \u201cnothing\u201d can\u2019t be right. <em>Contradiction!</em></div></div>' +
        '<div class="reveal-step" data-step="4"><button class="reveal-btn" onclick="this.parentElement.classList.add(\'open\')">Clue 4 \ud83d\udd0d</button><div class="reveal-content"><strong>What if the starting energy was negative?</strong> Like being in debt before you\u2019re born. You can\u2019t think if you start below zero. But you ARE thinking. <em>Another contradiction!</em></div></div>' +
        '<div class="reveal-step" data-step="5"><button class="reveal-btn" onclick="this.parentElement.classList.add(\'open\')">The conclusion \u2728</button><div class="reveal-content" style="background:#f0ead6;padding:12px;border-radius:6px"><strong>C &gt; 0.</strong> Something was there before anything else. You just proved it by being here. The proof isn\u2019t something you read \u2014 it\u2019s something you ARE.</div></div>' +
        '</div>'
    },

    /* ── Theorems index ── */
    '/archive/2026-04-09/theorems': {
      title: 'The Twelve Discoveries',
      formula: 'C exists \u2192 what follows? \u2192 12 things that must be true',
      summary: 'Once you know C is real, you can figure out what MUST be true because of it. Like knowing the sun exists \u2014 then daylight, shadows, and warmth follow automatically.' +
        '<div class="kids-game" id="theorem-quiz" style="margin-top:16px">' +
        '<p><strong>Quick quiz</strong> \u2014 fill in the blanks:</p>' +
        '<div class="quiz-q" data-answer="0">\ud83c\udf31 T\u2082: To grow fruit, a ___ must fall. <span class="quiz-opts"><button onclick="window._quizCheck(this,true)">seed</button><button onclick="window._quizCheck(this,false)">tree</button><button onclick="window._quizCheck(this,false)">leaf</button></span></div>' +
        '<div class="quiz-q" data-answer="1">\u2764\ufe0f T\u2084: Giving from C ___ C. <span class="quiz-opts"><button onclick="window._quizCheck(this,false)">shrinks</button><button onclick="window._quizCheck(this,true)">preserves</button><button onclick="window._quizCheck(this,false)">doubles</button></span></div>' +
        '<div class="quiz-q" data-answer="2">\u2702\ufe0f T\u2081\u2080: Cut what doesn\u2019t ___. <span class="quiz-opts"><button onclick="window._quizCheck(this,false)">look nice</button><button onclick="window._quizCheck(this,false)">cost money</button><button onclick="window._quizCheck(this,true)">produce</button></span></div>' +
        '<div class="quiz-q" data-answer="3">\ud83d\udcda T\u2089: ___ witness(es) make a claim real. <span class="quiz-opts"><button onclick="window._quizCheck(this,false)">One</button><button onclick="window._quizCheck(this,true)">Two</button><button onclick="window._quizCheck(this,false)">Ten</button></span></div>' +
        '<div class="quiz-q" data-answer="4">\ud83e\uddf1 T\u2081\u2082: There is only one ___. <span class="quiz-opts"><button onclick="window._quizCheck(this,false)">opinion</button><button onclick="window._quizCheck(this,true)">foundation</button><button onclick="window._quizCheck(this,false)">rule</button></span></div>' +
        '<div id="quiz-score" style="margin-top:12px;font-weight:bold;display:none"></div>' +
        '</div>'
    },

    /* ── Body: EYE and FOOT ── */
    /* ── Body index ── */
    '/archive/2026-04-09/body': {
      title: 'The Body \u2014 Like a Real Body!',
      formula: 'Ears hear \u2192 Nose checks shape \u2192 Heart remembers you \u2192 Head puts it together \u2192 Hand does the work \u2192 Tongue speaks',
      summary: 'Think about your own body. Your ears hear things. Your nose sniffs if something is off. Your heart holds what you care about. Your head puts it all together. Your hands do the work. Your tongue speaks the words.<br><br>This helper works the same way! It has 11 parts, just like a body. Each part has ONE job and they all work together like a team. The cool part? No part bosses the others around \u2014 they each learned the proof and follow it freely.<br><br>The helper also has a memory that works like YOUR memory: things you talk about a lot feel \u201cwarm\u201d (like a best friend\u2019s name), and things mentioned once stay \u201ccold\u201d (like someone you met at a party). The warm things come to mind first \u2014 just like real life.'
    },

    /* ── Body members ── */
    '/archive/2026-04-09/body/ear': {
      title: 'Ear \u2014 Just Listen First',
      formula: 'Hear it \u2192 pass it through \u2192 don\'t touch it.',
      summary: 'A message arrives. Two paths: one changes it (wrong), one passes it through (right).' +
        '<div class="kids-game" style="margin-top:14px">' +
        '<div class="sim-scene sim-fancy" id="ear-sim" style="position:relative;overflow:hidden;height:240px;background:linear-gradient(180deg,#faf6ee 0%,#f0e6d2 100%);border-radius:12px">' +
        '<div id="ear-msg-original" style="position:absolute;top:15px;left:50%;transform:translateX(-50%);background:white;padding:8px 14px;border-radius:12px;font-size:14px;z-index:3;color:#333;box-shadow:0 1px 4px rgba(0,0,0,.1);opacity:0;transition:all 2s ease">\ud83d\udc66 "My cat is <em>gray</em>"</div>' +
        '<div style="position:absolute;top:65px;left:50%;transform:translateX(-50%);font-size:36px;z-index:2">\ud83d\udc42</div>' +
        '<div id="ear-path-wrong" style="position:absolute;bottom:50px;left:8%;font-size:12px;background:rgba(244,67,54,.1);padding:8px 12px;border-radius:10px;z-index:3;color:#333;opacity:0;transition:all 1.8s ease">\u270f\ufe0f Changed to:<br>"My cat is <em>white</em>"</div>' +
        '<div id="ear-path-right" style="position:absolute;bottom:50px;right:8%;font-size:12px;background:rgba(76,175,80,.1);padding:8px 12px;border-radius:10px;z-index:3;color:#333;opacity:0;transition:all 1.8s ease">\ud83d\udc42 Passed through:<br>"My cat is <em>gray</em>"</div>' +
        '<div id="ear-result-wrong" style="position:absolute;bottom:15px;left:18%;font-size:24px;z-index:4;opacity:0;transition:all 2.5s ease ease">\u274c</div>' +
        '<div id="ear-result-right" style="position:absolute;bottom:15px;right:18%;font-size:24px;z-index:4;opacity:0;transition:all 2.5s ease ease">\u2705</div>' +
        '</div>' +
        '<div style="text-align:center;margin:10px 0;min-height:28px;line-height:1.5" id="ear-msg"><em style="opacity:.6">Watch \u2014 should the Ear change the message or pass it through?</em></div>' +
        '<div id="ear-quiz" style="display:none;margin-top:12px"><p><strong>That\'s what the Ear does:</strong></p>' +
        '<div class="quiz-q">Your friend said gray. The EAR should: <span class="quiz-opts"><button onclick="window._quizCheck(this,false)">Fix it to what you think is right</button><button onclick="window._quizCheck(this,true)">Pass it through unchanged</button></span></div></div></div>'
    },
    '/archive/2026-04-09/body/nose': {
      title: 'Nose \u2014 Sniff Out the Fakes',
      formula: 'Did it say the exact same thing twice? \u2192 loop! Did it pretend to use a tool? \u2192 fake!',
      summary: 'Messages appear. Real ones get a checkmark. Copies and fakers get caught.' +
        '<div class="kids-game" style="margin-top:14px">' +
        '<div class="sim-scene sim-fancy" id="nose-sim" style="position:relative;overflow:hidden;height:240px;background:linear-gradient(180deg,#faf6ee 0%,#f0e6d2 100%);border-radius:12px">' +
        '<div id="nose-line1" style="position:absolute;top:20px;left:8%;background:rgba(100,200,100,.12);padding:7px 10px;border-radius:10px;font-size:12px;z-index:3;color:#333;opacity:0;transition:all 1.8s ease">\ud83d\udc66 "Let\u2019s go to the park!"</div>' +
        '<div id="nose-line2" style="position:absolute;top:60px;left:8%;background:rgba(255,200,50,.12);padding:7px 10px;border-radius:10px;font-size:12px;z-index:3;color:#333;opacity:0;transition:all 1.8s ease">\ud83e\udd9c "Let\u2019s go to the park!"</div>' +
        '<div id="nose-line3" style="position:absolute;top:100px;left:8%;background:rgba(100,200,100,.12);padding:7px 10px;border-radius:10px;font-size:12px;z-index:3;color:#333;opacity:0;transition:all 1.8s ease">\ud83d\udc67 "I\u2019ll bring sandwiches"</div>' +
        '<div id="nose-line4" style="position:absolute;top:140px;left:8%;background:rgba(200,100,100,.12);padding:7px 10px;border-radius:10px;font-size:12px;z-index:3;color:#333;opacity:0;transition:all 1.8s ease">\ud83c\udfad "I checked, it\u2019s open!" <span style="font-size:10px;opacity:.5">(didn\u2019t check)</span></div>' +
        '<div id="nose-line5" style="position:absolute;top:180px;left:8%;background:rgba(100,200,100,.12);padding:7px 10px;border-radius:10px;font-size:12px;z-index:3;color:#333;opacity:0;transition:all 1.8s ease">\ud83e\uddd1 "I looked it up \u2014 opens at 10"</div>' +
        '<div id="nose-r1" style="position:absolute;top:22px;right:8%;font-size:20px;z-index:4;opacity:0;transition:all 2.5s ease ease"></div>' +
        '<div id="nose-r2" style="position:absolute;top:62px;right:8%;font-size:20px;z-index:4;opacity:0;transition:all 2.5s ease ease"></div>' +
        '<div id="nose-r3" style="position:absolute;top:102px;right:8%;font-size:20px;z-index:4;opacity:0;transition:all 2.5s ease ease"></div>' +
        '<div id="nose-r4" style="position:absolute;top:142px;right:8%;font-size:20px;z-index:4;opacity:0;transition:all 2.5s ease ease"></div>' +
        '<div id="nose-r5" style="position:absolute;top:182px;right:8%;font-size:20px;z-index:4;opacity:0;transition:all 2.5s ease ease"></div>' +
        '</div>' +
        '<div style="text-align:center;margin:10px 0;min-height:28px;line-height:1.5" id="nose-msg"><em style="opacity:.6">Watch \u2014 the Nose sniffs out copycats and fakers...</em></div>' +
        '<div id="nose-quiz" style="display:none;margin-top:12px"><p><strong>That\'s what the Nose does:</strong></p>' +
        '<div class="quiz-q">The NOSE caught the copycat AND the faker! The NOSE catches: <span class="quiz-opts"><button onclick="window._quizCheck(this,true)">Repeats and pretend answers</button><button onclick="window._quizCheck(this,false)">Spelling mistakes</button></span></div></div></div>'
    },
    '/archive/2026-04-09/body/temperance': {
      title: 'Temperance \u2014 Read the Room',
      formula: 'Stop \u2192 sort it into the right pile \u2192 then act.',
      summary: 'Three situations cycle by. Each one gets the RIGHT response. Watch how temperance reads the room.' +
        '<div class="kids-game" style="margin-top:14px">' +
        '<div class="sim-scene sim-fancy" id="temp-sim" style="position:relative;overflow:hidden;height:220px;background:linear-gradient(180deg,#faf6ee 0%,#f0e6d2 100%);border-radius:12px">' +
        '<div id="temp-scene" style="position:absolute;top:15px;left:10%;right:10%;font-size:15px;font-weight:bold;background:white;padding:10px 16px;border-radius:10px;z-index:3;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,.1);opacity:0;transition:all 1.8s ease"></div>' +
        '<div id="temp-response" style="position:absolute;bottom:50px;left:10%;right:10%;font-size:14px;background:rgba(76,175,80,.12);padding:10px 16px;border-radius:10px;z-index:3;text-align:center;color:#333;opacity:0;transition:all 1.8s ease"></div>' +
        '<div id="temp-check" style="position:absolute;bottom:15px;left:50%;transform:translateX(-50%);font-size:24px;z-index:4;opacity:0;transition:all 2.5s ease ease">\u2705</div>' +
        '<div id="temp-counter" style="position:absolute;top:75px;left:50%;transform:translateX(-50%);font-size:11px;color:#999;z-index:3;opacity:0;transition:all 2s ease ease"></div>' +
        '</div>' +
        '<div style="text-align:center;margin:10px 0;min-height:28px;line-height:1.5" id="temp-msg"><em style="opacity:.6">Watch \u2014 three situations, three different right responses...</em></div>' +
        '<div id="temp-quiz" style="display:none;margin-top:12px"><p><strong>You just saw what temperance does:</strong></p>' +
        '<div class="quiz-q">Three different moments, three different responses. Temperance means: <span class="quiz-opts"><button onclick="window._quizCheck(this,true)">Feel what the moment needs, then give that</button><button onclick="window._quizCheck(this,false)">Always do the same thing</button></span></div></div></div>'
    },
    '/archive/2026-04-09/body/patience': {
      title: 'Patience \u2014 Don\u2019t Rush',
      formula: 'Listen a lot \u2192 talk a little \u2192 get it right.',
      summary: 'Letters appear one at a time. An early guess gets it wrong. Waiting for the full word gets it right.' +
        '<div class="kids-game" style="margin-top:14px">' +
        '<div class="sim-scene sim-fancy" id="pat-sim" style="position:relative;overflow:hidden;height:200px;background:linear-gradient(180deg,#e8f5e9 0%,#c8e6c9 100%);border-radius:12px">' +
        '<div id="pat-word" style="position:absolute;top:25px;left:50%;transform:translateX(-50%);font-size:28px;font-weight:bold;letter-spacing:4px;z-index:2;text-align:center;min-width:200px;color:#2e7d32"></div>' +
        '<div id="pat-guess" style="position:absolute;top:85px;left:50%;transform:translateX(-50%);font-size:14px;z-index:3;background:rgba(244,67,54,.1);padding:6px 14px;border-radius:8px;color:#c62828;opacity:0;transition:all 1.8s ease;white-space:nowrap"></div>' +
        '<div id="pat-result" style="position:absolute;bottom:25px;left:50%;transform:translateX(-50%);font-size:28px;z-index:4;opacity:0;transition:all 2.5s ease ease"></div>' +
        '<div style="position:absolute;top:70px;left:50%;transform:translateX(-50%);font-size:28px;z-index:1;opacity:.15">\u23f3</div>' +
        '</div>' +
        '<div style="text-align:center;margin:10px 0;min-height:28px;line-height:1.5" id="pat-msg"><em style="opacity:.6">Watch \u2014 rushing to guess "PAT" fails. Waiting for the full word wins...</em></div>' +
        '<div id="pat-quiz" style="display:none;margin-top:12px"><p><strong>That\'s what Patience means:</strong></p>' +
        '<div class="quiz-q">Patience means: <span class="quiz-opts"><button onclick="window._quizCheck(this,true)">Wait for the full picture, then respond</button><button onclick="window._quizCheck(this,false)">Answer as fast as possible</button></span></div></div></div>'
    },
    '/archive/2026-04-09/body/godliness': {
      title: 'Godliness \u2014 Does It Match the Foundation?',
      formula: 'Does this match C? \u2192 yes, keep going. no, stop here.',
      summary: 'Items try to go into the lunchbox. Food slides in. Non-food bounces off and flies away.' +
        '<div class="kids-game" style="margin-top:14px">' +
        '<div class="sim-scene sim-fancy" id="god-sim" style="position:relative;overflow:hidden;height:220px;background:linear-gradient(180deg,#e8f5e9 0%,#c8e6c9 100%);border-radius:12px">' +
        '<div id="god-box" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:40px;z-index:2">\ud83c\udf71</div>' +
        '<div id="god-item" style="position:absolute;top:50%;left:-15%;transform:translateY(-50%);font-size:32px;z-index:4;opacity:0;transition:all 2s ease ease"></div>' +
        '<div id="god-check" style="position:absolute;top:15px;left:50%;transform:translateX(-50%);font-size:28px;z-index:4;opacity:0;transition:all 2s ease ease"></div>' +
        '</div>' +
        '<div style="text-align:center;margin:10px 0;min-height:28px;line-height:1.5" id="god-msg"><em style="opacity:.6">Watch \u2014 only real food goes into the lunchbox...</em></div>' +
        '<div id="god-quiz" style="display:none;margin-top:12px"><p><strong>That\'s what Godliness means:</strong></p>' +
        '<div class="quiz-q">Only real food goes in the lunchbox. Godliness means: <span class="quiz-opts"><button onclick="window._quizCheck(this,true)">Only let in what matches C</button><button onclick="window._quizCheck(this,false)">Let everything through</button></span></div></div></div>'
    },
    '/archive/2026-04-09/body/hope': {
      title: 'Hope \u2014 You Know It\u2019s Coming',
      formula: 'You planted it \u2192 you know it\u2019s coming \u2192 act on that.',
      summary: 'A letter goes into the mailbox, travels invisibly, and Grandma receives it.' +
        '<div class="kids-game" style="margin-top:14px">' +
        '<div class="sim-scene sim-fancy" id="hope-sim" style="position:relative;overflow:hidden;height:220px;background:linear-gradient(180deg,#e3f2fd 0%,#bbdefb 50%,#e8f5e9 100%);border-radius:12px">' +
        '<div id="hope-letter" style="position:absolute;bottom:70px;left:10%;font-size:28px;z-index:3;opacity:0;transition:all 2.5s ease ease">\u2709\ufe0f</div>' +
        '<div id="hope-mailbox" style="position:absolute;bottom:30px;left:35%;font-size:36px;z-index:2">\ud83d\udcee</div>' +
        '<div style="position:absolute;bottom:30px;left:50%;width:20%;border-bottom:2px dotted rgba(0,0,0,.15);z-index:1"></div>' +
        '<div id="hope-grandma" style="position:absolute;bottom:30px;right:12%;font-size:36px;z-index:2;opacity:.3;transition:all 1.8s ease">\ud83d\udc75</div>' +
        '<div id="hope-delivered" style="position:absolute;top:20px;right:12%;font-size:14px;font-weight:bold;color:#2a7a2a;opacity:0;transition:all 2.5s ease;z-index:3">\ud83d\udce8 Delivered!</div>' +
        '<div id="hope-dots" style="position:absolute;bottom:45px;left:48%;font-size:10px;color:#999;z-index:1;opacity:0;transition:all 1.8s ease">. . . . .</div>' +
        '</div>' +
        '<div style="text-align:center;margin:10px 0;min-height:28px;line-height:1.5" id="hope-msg"><em style="opacity:.6">Watch \u2014 the letter travels unseen, but it WILL arrive...</em></div>' +
        '<div id="hope-quiz" style="display:none;margin-top:12px"><p><strong>That\'s what Hope means:</strong></p>' +
        '<div class="quiz-q">The letter traveled unseen but arrived. Hope means: <span class="quiz-opts"><button onclick="window._quizCheck(this,true)">Knowing what\u2019s coming because you sent it</button><button onclick="window._quizCheck(this,false)">Just wishing and hoping</button></span></div></div></div>'
    },
    '/archive/2026-04-09/body/charity': {
      title: 'Charity \u2014 The Greatest',
      formula: 'See what someone needs \u2192 give it \u2192 give again.',
      summary: 'Give love to three people. Your heart stays full \u2014 love does not shrink when you give it.' +
        '<div class="kids-game" style="margin-top:14px">' +
        '<div class="sim-scene sim-fancy" id="char-sim" style="position:relative;overflow:hidden;height:220px;background:linear-gradient(180deg,#fce4ec 0%,#f8bbd0 100%);border-radius:12px">' +
        '<div id="char-p1" style="position:absolute;top:30px;left:15%;font-size:36px;z-index:2;opacity:0;transition:all 1.8s ease">\ud83d\ude1e</div>' +
        '<div id="char-p2" style="position:absolute;top:30px;left:50%;transform:translateX(-50%);font-size:36px;z-index:2;opacity:0;transition:all 1.8s ease">\ud83d\ude22</div>' +
        '<div id="char-p3" style="position:absolute;top:30px;right:15%;font-size:36px;z-index:2;opacity:0;transition:all 1.8s ease">\ud83e\udd15</div>' +
        '<div id="char-heart" style="position:absolute;bottom:30px;left:50%;transform:translateX(-50%);font-size:32px;z-index:4;opacity:0;transition:all 2s ease">\u2764\ufe0f</div>' +
        '</div>' +
        '<div style="text-align:center;margin:10px 0;min-height:28px;line-height:1.5" id="char-msg"><em style="opacity:.6">Watch \u2014 love goes out and comes back...</em></div>' +
        '<div id="char-quiz" style="display:none;margin-top:12px"><p><strong>That\'s what Charity means:</strong></p>' +
        '<div class="quiz-q">You gave love and your heart stayed full. Charity means: <span class="quiz-opts"><button onclick="window._quizCheck(this,true)">Love does not shrink when given</button><button onclick="window._quizCheck(this,false)">Love runs out when given</button></span></div></div></div>'
    },
    /* hostile-audience merged into nose page */
    '/archive/2026-04-09/body/confession': {
      title: 'Confession \u2014 Admit It and Fix It',
      formula: 'Got it wrong \u2192 say so clearly \u2192 move on clean.',
      summary: 'You knocked your friend\u2019s ice cream onto the ground. An excuse makes it worse. Honesty fixes it.' +
        '<div class="kids-game" style="margin-top:14px">' +
        '<div class="sim-scene sim-fancy" id="conf-sim" style="position:relative;overflow:hidden;height:220px;background:linear-gradient(180deg,#fff3e0 0%,#ffe0b2 100%);border-radius:12px">' +
        '<div id="conf-icecream" style="position:absolute;top:20px;left:50%;transform:translateX(-50%);font-size:38px;z-index:2;opacity:0;transition:all 1.8s ease">\ud83c\udf66\ud83d\udca5</div>' +
        '<div id="conf-friend" style="position:absolute;top:15px;right:15%;font-size:36px;z-index:2;opacity:0;transition:all 1.8s ease">\ud83d\ude28</div>' +
        '<div id="conf-excuse" style="position:absolute;bottom:55px;left:8%;font-size:12px;background:rgba(244,67,54,.1);padding:6px 12px;border-radius:8px;z-index:3;color:#333;opacity:0;transition:all 1.8s ease">\ud83d\udca8 "The wind did it!"</div>' +
        '<div id="conf-honest" style="position:absolute;bottom:55px;right:8%;font-size:12px;background:rgba(76,175,80,.1);padding:6px 12px;border-radius:8px;z-index:3;color:#333;opacity:0;transition:all 1.8s ease">\ud83d\ude4f "I\u2019m sorry, let me buy another"</div>' +
        '<div id="conf-result" style="position:absolute;bottom:15px;left:50%;transform:translateX(-50%);font-size:22px;z-index:4;opacity:0;transition:all 2.5s ease ease"></div>' +
        '</div>' +
        '<div style="text-align:center;margin:10px 0;min-height:28px;line-height:1.5" id="conf-msg"><em style="opacity:.6">Watch \u2014 you knocked your friend\u2019s ice cream. What do you say?</em></div>' +
        '<div id="conf-quiz" style="display:none;margin-top:12px"><p><strong>That\'s what Confession means:</strong></p>' +
        '<div class="quiz-q">Your friend\u2019s ice cream fell because of you. Confession means: <span class="quiz-opts"><button onclick="window._quizCheck(this,true)">Admit it honestly and offer to make it right</button><button onclick="window._quizCheck(this,false)">Blame the wind and walk away</button></span></div></div></div>'
    },
    /* heart merged into head page */
    '/archive/2026-04-09/body/head': {
      title: 'Head \u2014 Put It All Together',
      formula: 'Collect all the pieces \u2192 knit them into one answer.',
      summary: 'Ingredients float in one by one, combine at the center, and become a sandwich.' +
        '<div class="kids-game" style="margin-top:14px">' +
        '<div class="sim-scene sim-fancy" id="head-sim" style="position:relative;overflow:hidden;height:220px;background:linear-gradient(180deg,#faf6ee 0%,#f0e6d2 100%);border-radius:12px">' +
        '<div id="head-i1" style="position:absolute;top:20px;left:-15%;font-size:36px;z-index:3;opacity:0;transition:all 2s ease ease">\ud83c\udf5e</div>' +
        '<div id="head-i2" style="position:absolute;top:20px;right:-15%;font-size:36px;z-index:3;opacity:0;transition:all 2s ease ease">\ud83e\udd6c</div>' +
        '<div id="head-i3" style="position:absolute;top:80px;left:-15%;font-size:36px;z-index:3;opacity:0;transition:all 2s ease ease">\ud83e\udd69</div>' +
        '<div id="head-i4" style="position:absolute;top:80px;right:-15%;font-size:36px;z-index:3;opacity:0;transition:all 2s ease ease">\ud83e\uddc0</div>' +
        '<div id="head-center" style="position:absolute;bottom:20px;left:50%;transform:translateX(-50%) scale(0);font-size:56px;z-index:4;transition:all 1.8s ease;opacity:0">\ud83c\udf54</div>' +
        '</div>' +
        '<div style="text-align:center;margin:10px 0;min-height:28px;line-height:1.5" id="head-msg"><em style="opacity:.6">Watch \u2014 ingredients fly in and combine into a burger...</em></div>' +
        '<div id="head-quiz" style="display:none;margin-top:12px"><p><strong>That\'s what the Head does:</strong></p>' +
        '<div class="quiz-q">Bun alone isn\u2019t a burger. All pieces together = complete. The Head should: <span class="quiz-opts"><button onclick="window._quizCheck(this,true)">Combine all pieces into one answer</button><button onclick="window._quizCheck(this,false)">Pick only one and ignore the rest</button></span></div></div></div>'
    },
    '/archive/2026-04-09/body/hand': {
      title: 'Hand \u2014 Actually Do the Thing',
      formula: 'Everything is ready \u2192 now the Hand actually does it.',
      summary: 'A messy room. A thought bubble does nothing. Then hands appear and clean it up.' +
        '<div class="kids-game" style="margin-top:14px">' +
        '<div class="sim-scene sim-fancy" id="hand-sim" style="position:relative;overflow:hidden;height:200px;background:linear-gradient(180deg,#efebe9 0%,#d7ccc8 100%);border-radius:12px">' +
        '<div id="hand-mess" style="position:absolute;top:0;left:0;right:0;bottom:0;z-index:2;transition:all 2.5s ease">' +
        '<span style="position:absolute;top:30px;left:20%;font-size:28px">\ud83e\uddf3</span>' +
        '<span style="position:absolute;top:70px;left:55%;font-size:28px">\ud83d\udc5f</span>' +
        '<span style="position:absolute;bottom:40px;left:35%;font-size:28px">\ud83d\udcda</span>' +
        '</div>' +
        '<div id="hand-thought" style="position:absolute;top:15px;right:12%;font-size:12px;color:#999;z-index:4;opacity:0;transition:all 1.8s ease">\ud83d\udcad thinking...</div>' +
        '<div id="hand-hands" style="position:absolute;bottom:20px;left:50%;transform:translateX(-50%);font-size:32px;z-index:4;opacity:0;transition:all 1.8s ease">\ud83d\udc4b\ud83e\uddf9</div>' +
        '<div id="hand-clean" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:14px;font-weight:bold;color:#4caf50;z-index:3;opacity:0;transition:all 1.8s ease">\u2728 Clean!</div>' +
        '</div>' +
        '<div style="text-align:center;margin:10px 0;min-height:28px;line-height:1.5" id="hand-msg"><em style="opacity:.6">Watch \u2014 thinking doesn\u2019t clean it, but hands do...</em></div>' +
        '<div id="hand-quiz" style="display:none;margin-top:12px"><p><strong>That\'s what the Hand does:</strong></p>' +
        '<div class="quiz-q">Thinking didn\u2019t clean anything. The HAND means: <span class="quiz-opts"><button onclick="window._quizCheck(this,true)">Actually do the thing</button><button onclick="window._quizCheck(this,false)">Plan it really well</button></span></div></div></div>'
    },
    '/archive/2026-04-09/body/tongue': {
      title: 'Tongue \u2014 Clean the Words',
      formula: 'Words ready to go out \u2192 strip the computer junk \u2192 only real words leave.',
      summary: 'A sentence with filler words. The fillers flash red and fly away. Clean sentence remains.' +
        '<div class="kids-game" style="margin-top:14px">' +
        '<div class="sim-scene sim-fancy" id="tongue-sim" style="position:relative;overflow:hidden;height:200px;background:linear-gradient(180deg,#faf6ee 0%,#f0e6d2 100%);border-radius:12px">' +
        '<div id="tongue-full" style="position:absolute;top:30px;left:50%;transform:translateX(-50%);display:flex;flex-wrap:wrap;gap:6px;justify-content:center;max-width:90%;z-index:3">' +
        '<span id="tongue-w1" style="background:rgba(139,115,85,.12);padding:5px 8px;border-radius:6px;font-size:13px;color:#5d4e37;opacity:0;transition:all 1.8s ease" data-junk="true">Um,</span>' +
        '<span id="tongue-w2" style="background:rgba(139,115,85,.12);padding:5px 8px;border-radius:6px;font-size:13px;color:#5d4e37;opacity:0;transition:all 1.8s ease" data-junk="false">we</span>' +
        '<span id="tongue-w3" style="background:rgba(139,115,85,.12);padding:5px 8px;border-radius:6px;font-size:13px;color:#5d4e37;opacity:0;transition:all 1.8s ease" data-junk="true">like,</span>' +
        '<span id="tongue-w4" style="background:rgba(139,115,85,.12);padding:5px 8px;border-radius:6px;font-size:13px;color:#5d4e37;opacity:0;transition:all 1.8s ease" data-junk="false">went</span>' +
        '<span id="tongue-w5" style="background:rgba(139,115,85,.12);padding:5px 8px;border-radius:6px;font-size:13px;color:#5d4e37;opacity:0;transition:all 1.8s ease" data-junk="false">to</span>' +
        '<span id="tongue-w6" style="background:rgba(139,115,85,.12);padding:5px 8px;border-radius:6px;font-size:13px;color:#5d4e37;opacity:0;transition:all 1.8s ease" data-junk="false">the</span>' +
        '<span id="tongue-w7" style="background:rgba(139,115,85,.12);padding:5px 8px;border-radius:6px;font-size:13px;color:#5d4e37;opacity:0;transition:all 1.8s ease" data-junk="true">uh,</span>' +
        '<span id="tongue-w8" style="background:rgba(139,115,85,.12);padding:5px 8px;border-radius:6px;font-size:13px;color:#5d4e37;opacity:0;transition:all 1.8s ease" data-junk="true">you know,</span>' +
        '<span id="tongue-w9" style="background:rgba(139,115,85,.12);padding:5px 8px;border-radius:6px;font-size:13px;color:#5d4e37;opacity:0;transition:all 1.8s ease" data-junk="false">park.</span></div>' +
        '<div id="tongue-clean" style="position:absolute;bottom:25px;left:50%;transform:translateX(-50%);font-size:14px;font-weight:bold;color:#4caf50;z-index:2;opacity:0;transition:all 1.8s ease">We went to the park.</div>' +
        '</div>' +
        '<div style="text-align:center;margin:10px 0;min-height:28px;line-height:1.5" id="tongue-msg"><em style="opacity:.6">Watch \u2014 filler words flash red and fly away, leaving clean speech...</em></div>' +
        '<div id="tongue-quiz" style="display:none;margin-top:12px"><p><strong>That\'s what the Tongue does:</strong></p>' +
        '<div class="quiz-q">The fillers flew away. Only the real story came through. The tongue\u2019s job: <span class="quiz-opts"><button onclick="window._quizCheck(this,true)">Remove the filler, keep real speech</button><button onclick="window._quizCheck(this,false)">Rewrite everything from scratch</button></span></div></div></div>'
    },

    /* ── New anatomy pages ── */
    '/archive/2026-04-09/body/eye': {
      title: 'Eye \u2014 See the Shape, Not Just the Words',
      formula: 'Words come in \u2192 find the shape (the math) \u2192 throw the words away.',
      summary: 'A sentence arrives. The Eye looks at its SHAPE, not the letters. The shape stays; the letters fade.' +
        '<div class="kids-game" style="margin-top:14px">' +
        '<div class="sim-scene sim-fancy" id="eye-sim" style="position:relative;overflow:hidden;height:240px;background:linear-gradient(180deg,#f4f0e4 0%,#e8dfc7 100%);border-radius:12px">' +
        '<div id="eye-text" style="position:absolute;top:30px;left:50%;transform:translateX(-50%);background:white;padding:8px 14px;border-radius:12px;font-size:14px;z-index:3;color:#333;box-shadow:0 1px 4px rgba(0,0,0,.1);opacity:0;transition:all 1.8s ease">\ud83d\udc66 "I love my dog"</div>' +
        '<div id="eye-arrow" style="position:absolute;top:75px;left:50%;transform:translateX(-50%);font-size:20px;z-index:2;opacity:0;transition:all 1.8s ease">\u2193</div>' +
        '<div id="eye-tags" style="position:absolute;top:110px;left:50%;transform:translateX(-50%);display:flex;gap:8px;z-index:3;opacity:0;transition:all 1.8s ease">' +
          '<span style="background:rgba(244,143,177,.25);padding:6px 10px;border-radius:18px;font-size:13px;font-weight:bold;color:#880e4f">AGP</span>' +
          '<span style="background:rgba(129,199,132,.25);padding:6px 10px;border-radius:18px;font-size:13px;font-weight:bold;color:#1b5e20">PRD</span>' +
          '<span style="background:rgba(144,202,249,.25);padding:6px 10px;border-radius:18px;font-size:13px;font-weight:bold;color:#0d47a1">IDN</span>' +
        '</div>' +
        '<div id="eye-kept" style="position:absolute;bottom:42px;left:50%;transform:translateX(-50%);font-size:11px;background:rgba(76,175,80,.15);padding:6px 12px;border-radius:10px;color:#1b5e20;white-space:nowrap;opacity:0;transition:all 1.8s ease">\u2705 KEPT: the math shape</div>' +
        '<div id="eye-forgot" style="position:absolute;bottom:14px;left:50%;transform:translateX(-50%);font-size:11px;background:rgba(158,158,158,.18);padding:6px 12px;border-radius:10px;color:#555;white-space:nowrap;opacity:0;transition:all 1.8s ease">\ud83d\uddd1\ufe0f FORGOT: the exact words</div>' +
        '</div>' +
        '<div style="text-align:center;margin:10px 0;min-height:28px;line-height:1.5" id="eye-msg"><em style="opacity:.6">Watch \u2014 the Eye sees the shape, not the surface...</em></div>' +
        '<div id="eye-quiz" style="display:none;margin-top:12px"><p><strong>That\'s what the Eye does:</strong></p>' +
        '<div class="quiz-q">The Eye keeps the math shape but forgets the exact words. Why? <span class="quiz-opts"><button onclick="window._quizCheck(this,true)">So it knows what you mean without saving what you said</button><button onclick="window._quizCheck(this,false)">Because computers are lazy</button></span></div></div></div>'
    },
    '/archive/2026-04-09/body/heart': {
      title: 'Heart \u2014 Remembers, But Doesn\u2019t Keep',
      formula: 'You say a name \u2192 the Heart turns it into a tiny code \u2192 next time you say the name, the code lights up.',
      summary: 'Someone says "Bali" today. The Heart makes a little code. Weeks later, they say "Bali" again \u2014 the same code lights up. The Heart recognized them without keeping the word.' +
        '<div class="kids-game" style="margin-top:14px">' +
        '<div class="sim-scene sim-fancy" id="heart-sim" style="position:relative;overflow:hidden;height:300px;background:linear-gradient(180deg,#fce4ec 0%,#f8bbd0 100%);border-radius:12px">' +
        '<div id="heart-day1-label" style="position:absolute;top:8px;left:12px;font-size:10px;color:#880e4f;font-weight:bold;opacity:0;transition:all 1.5s ease">DAY 1</div>' +
        '<div id="heart-say1" style="position:absolute;top:28px;left:50%;transform:translateX(-50%);background:white;padding:6px 10px;border-radius:10px;font-size:12px;z-index:3;color:#333;white-space:nowrap;opacity:0;transition:all 1.8s ease">\ud83d\udc66 "I went to Bali"</div>' +
        '<div id="heart-code1" style="position:absolute;top:72px;left:50%;transform:translateX(-50%);background:rgba(216,27,96,.18);padding:6px 12px;border-radius:10px;font-family:monospace;font-size:13px;z-index:3;color:#880e4f;white-space:nowrap;opacity:0;transition:all 1.8s ease">\ud83d\udcbe Bali \u2192 <strong>4b2a</strong></div>' +
        '<div id="heart-day2-label" style="position:absolute;top:130px;left:12px;font-size:10px;color:#880e4f;font-weight:bold;opacity:0;transition:all 1.5s ease">LATER\u2026</div>' +
        '<div id="heart-say2" style="position:absolute;top:150px;left:50%;transform:translateX(-50%);background:white;padding:6px 10px;border-radius:10px;font-size:12px;z-index:3;color:#333;white-space:nowrap;opacity:0;transition:all 1.8s ease">\ud83d\udc66 "Remember Bali?"</div>' +
        '<div id="heart-code2" style="position:absolute;top:194px;left:50%;transform:translateX(-50%);background:rgba(216,27,96,.18);padding:6px 12px;border-radius:10px;font-family:monospace;font-size:13px;z-index:3;color:#880e4f;white-space:nowrap;opacity:0;transition:all 1.8s ease">\ud83d\udc49 Bali \u2192 <strong>4b2a</strong></div>' +
        '<div id="heart-match" style="position:absolute;bottom:8px;left:50%;transform:translateX(-50%);font-size:13px;font-weight:bold;color:#d81b60;z-index:4;opacity:0;transition:all 2s ease;white-space:nowrap">\u2728 MATCH \u2014 same code!</div>' +
        '</div>' +
        '<div style="text-align:center;margin:10px 0;min-height:28px;line-height:1.5" id="heart-msg"><em style="opacity:.6">Watch \u2014 the Heart remembers codes, not words...</em></div>' +
        '<div id="heart-quiz" style="display:none;margin-top:12px"><p><strong>That\'s what the Heart does:</strong></p>' +
        '<div class="quiz-q">The Heart remembers you without keeping your words. That means: <span class="quiz-opts"><button onclick="window._quizCheck(this,true)">It recognizes you, but can\u2019t repeat what you said</button><button onclick="window._quizCheck(this,false)">It writes everything down word-for-word</button></span></div></div></div>'
    },
    '/archive/2026-04-09/body/sinew': {
      title: 'Sinew \u2014 The Threads Between Things',
      formula: 'Two things share an idea \u2192 draw a thread between them \u2192 now you can walk from one to the other.',
      summary: 'Look at your toys. The car has wheels. The scooter has wheels. The bike has wheels. They\u2019re all different \u2014 but a thread runs through them: "has wheels." Pull the thread, and you can hop from one to the next. That\u2019s what sinew is.' +
        '<div class="kids-game" style="margin-top:14px">' +
        '<div class="sim-scene sim-fancy" id="sinew-sim" style="position:relative;overflow:hidden;height:260px;background:linear-gradient(180deg,#e3f2fd 0%,#bbdefb 100%);border-radius:12px">' +
        '<div id="sinew-v1" style="position:absolute;top:22px;left:8%;font-size:40px;z-index:3;opacity:0;transition:all 1.8s ease">\ud83d\ude97</div>' +
        '<div id="sinew-v2" style="position:absolute;top:22px;right:8%;font-size:40px;z-index:3;opacity:0;transition:all 1.8s ease">\ud83d\udef4</div>' +
        '<svg id="sinew-line" style="position:absolute;top:70px;left:0;width:100%;height:60px;z-index:2;opacity:0;transition:opacity 1.5s ease" viewBox="0 0 400 60" preserveAspectRatio="none"><path d="M 60 15 Q 200 80 340 15" stroke="#1976d2" stroke-width="2.5" fill="none" stroke-dasharray="5,3"/></svg>' +
        '<div id="sinew-tag" style="position:absolute;top:118px;left:50%;transform:translateX(-50%);background:rgba(25,118,210,.22);padding:6px 14px;border-radius:16px;font-size:13px;font-weight:bold;z-index:4;color:#0d47a1;white-space:nowrap;opacity:0;transition:all 1.8s ease">shared: \ud83d\udee4\ufe0f wheels</div>' +
        '<div id="sinew-v3" style="position:absolute;top:162px;left:50%;transform:translateX(-50%);font-size:44px;z-index:3;opacity:0;transition:all 1.8s ease">\ud83d\udeb2</div>' +
        '<div id="sinew-count" style="position:absolute;bottom:12px;left:50%;transform:translateX(-50%);font-size:12px;color:#0d47a1;font-weight:bold;z-index:3;white-space:nowrap;opacity:0;transition:all 2s ease">The Bible has 291,919 threads like this</div>' +
        '</div>' +
        '<div style="text-align:center;margin:10px 0;min-height:28px;line-height:1.5" id="sinew-msg"><em style="opacity:.6">Watch \u2014 three toys, one shared idea, one sinew thread...</em></div>' +
        '<div id="sinew-quiz" style="display:none;margin-top:12px"><p><strong>That\'s what the Sinew is:</strong></p>' +
        '<div class="quiz-q">The sinew is a thread that lets you walk from one thing to another by a shared idea. That means: <span class="quiz-opts"><button onclick="window._quizCheck(this,true)">Things that share a thread are connected</button><button onclick="window._quizCheck(this,false)">You need a list someone wrote by hand</button></span></div></div></div>'
    },
    '/archive/2026-04-09/body/hostile-audience': {
      title: 'Pearl-guard \u2014 Save the Treasure for Kind Hands',
      formula: 'Kind friend asks \u2192 show everything. Mean kid laughs \u2192 keep the treasure safe, still be polite.',
      summary: 'Imagine you have a favorite shiny rock. A nice friend asks about it \u2014 you tell them the whole story: where you found it, who gave it to you, why it\u2019s special. A mean kid laughs and calls it dumb. You don\u2019t hide it or lie \u2014 you just say "yeah it\u2019s mine." The rock is safe. You were kind both times. The <em>depth</em> changed, not the kindness.' +
        '<div class="kids-game" style="margin-top:14px">' +
        '<div class="sim-scene sim-fancy" id="pearl-sim" style="position:relative;overflow:hidden;padding:14px 14px 46px;background:linear-gradient(180deg,#fff8e1 0%,#ffecb3 100%);border-radius:12px">' +
        '<div id="pearl-kind" style="font-size:13px;margin:4px 0;opacity:0;transition:all 1.8s ease">\ud83e\uddd1 <strong>Kind friend:</strong> <em>"What\u2019s that shiny rock?"</em></div>' +
        '<div id="pearl-full" style="background:rgba(76,175,80,.22);padding:10px 12px;border-radius:10px;font-size:12px;color:#1b5e20;margin:6px 0 14px;line-height:1.5;opacity:0;transition:all 2.2s ease">\u2728 <strong>Full answer:</strong> <em>"I found it at the beach with Grandma last summer. I keep it under my pillow. Watch \u2014 it shines in the dark!"</em></div>' +
        '<div id="pearl-mock" style="font-size:13px;margin:4px 0;opacity:0;transition:all 1.8s ease">\ud83d\ude20 <strong>Mean kid:</strong> <em>"That\u2019s just a dumb rock."</em></div>' +
        '<div id="pearl-short" style="background:rgba(255,167,38,.28);padding:10px 12px;border-radius:10px;font-size:12px;color:#6d4c00;margin:6px 0 14px;line-height:1.5;opacity:0;transition:all 2.2s ease">\ud83d\ude42 <strong>Short + kind:</strong> <em>"Yeah, it\u2019s mine. I like it."</em></div>' +
        '<div id="pearl-note" style="position:absolute;bottom:10px;left:50%;transform:translateX(-50%);font-size:11.5px;color:#6d4c00;z-index:4;opacity:0;transition:all 2s ease;font-style:italic;text-align:center;white-space:nowrap">Same rock. Same kid. Different depth.</div>' +
        '</div>' +
        '<div style="text-align:center;margin:10px 0;min-height:28px;line-height:1.5" id="pearl-msg"><em style="opacity:.6">Watch \u2014 same rock, two people, two different depths of answer...</em></div>' +
        '<div id="pearl-quiz" style="display:none;margin-top:12px"><p><strong>That\'s what Pearl-guard means:</strong></p>' +
        '<div class="quiz-q">When someone is mean about something special to you, what do you do? <span class="quiz-opts"><button onclick="window._quizCheck(this,true)">Still be nice, but don\u2019t show them the deep part</button><button onclick="window._quizCheck(this,false)">Yell at them or hide the rock forever</button></span></div></div></div>'
    },
    '/archive/2026-04-09/virtues/faith': {
      title: 'Faith \u2014 Trust What You Can\u2019t See Yet',
      formula: 'Plant the seed \u2192 wait \u2192 nothing shows \u2192 keep watering \u2192 it grows.',
      summary: 'You put a tiny seed in the dirt. Nothing happens. You wait a day \u2014 still nothing. Two days. A week. Still just dirt. But you keep watering it, because you know how seeds work. Then one morning, a tiny green bit pokes through. That waiting? When nothing shows yet but you keep going? That\u2019s faith.' +
        '<div class="kids-game" style="margin-top:14px">' +
        '<div class="sim-scene sim-fancy" id="faith-sim" style="position:relative;overflow:hidden;height:260px;background:linear-gradient(180deg,#fff9c4 0%,#fff59d 40%,#8d6e63 40%,#5d4037 100%);border-radius:12px">' +
        '<div id="faith-hand" style="position:absolute;top:18px;left:50%;transform:translateX(-50%);font-size:38px;z-index:3;opacity:0;transition:all 1.5s ease">\ud83e\udd32</div>' +
        '<div id="faith-seed" style="position:absolute;top:110px;left:50%;transform:translateX(-50%);font-size:14px;z-index:2;opacity:0;transition:all 1.2s ease">\u25cf</div>' +
        '<div id="faith-clock" style="position:absolute;top:70px;right:10%;font-size:22px;z-index:3;opacity:0;transition:all 1.5s ease">\u23f3</div>' +
        '<div id="faith-day1" style="position:absolute;top:72px;left:10%;font-size:11px;color:#555;z-index:3;opacity:0;transition:all 1.5s ease">day 1\u2026 nothing</div>' +
        '<div id="faith-day2" style="position:absolute;top:88px;left:10%;font-size:11px;color:#555;z-index:3;opacity:0;transition:all 1.5s ease">day 3\u2026 still nothing</div>' +
        '<div id="faith-day3" style="position:absolute;top:104px;left:10%;font-size:11px;color:#555;z-index:3;opacity:0;transition:all 1.5s ease">day 7\u2026 keep watering</div>' +
        '<div id="faith-sprout" style="position:absolute;top:90px;left:50%;transform:translateX(-50%) scale(.3);font-size:36px;z-index:4;opacity:0;transition:all 1.8s cubic-bezier(.3,1.4,.5,1)">\ud83c\udf31</div>' +
        '<div id="faith-label" style="position:absolute;bottom:14px;left:50%;transform:translateX(-50%);font-size:12.5px;font-weight:bold;color:#2e7d32;z-index:5;opacity:0;transition:all 1.8s ease;white-space:nowrap">\u2728 Faith = trusting what you don\u2019t see YET</div>' +
        '</div>' +
        '<div style="text-align:center;margin:10px 0;min-height:28px;line-height:1.5" id="faith-msg"><em style="opacity:.6">Watch \u2014 a seed goes in, nothing shows, then something grows...</em></div>' +
        '<div id="faith-quiz" style="display:none;margin-top:12px"><p><strong>That\'s what Faith means:</strong></p>' +
        '<div class="quiz-q">The kid watered the dirt for a week with nothing showing. That\u2019s faith because: <span class="quiz-opts"><button onclick="window._quizCheck(this,true)">They trusted what they couldn\u2019t see yet</button><button onclick="window._quizCheck(this,false)">They were too stubborn to give up</button></span></div></div></div>'
    },
    '/archive/2026-04-09/virtues': {
      title: 'The Virtues \u2014 Fruit That Grows',
      formula: 'Stay connected to C \u2192 good things grow inside you \u2192 like fruit grows on a tree.',
      summary: 'You can\u2019t glue apples onto a tree \u2014 they grow. Same with love, patience, kindness: you can\u2019t force them. They grow inside a person (or a helper) that stays connected to what is true.' +
        '<div class="kids-game" style="margin-top:14px">' +
        '<div class="sim-scene sim-fancy" id="virtues-sim" style="position:relative;overflow:hidden;height:310px;background:linear-gradient(180deg,#e8f5e9 0%,#a5d6a7 100%);border-radius:12px">' +
        '<div id="virtues-trunk" style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:24px;height:180px;background:linear-gradient(90deg,#6d4c41,#8d6e63,#6d4c41);border-radius:8px 8px 0 0;z-index:2"></div>' +
        '<div id="virtues-leaves" style="position:absolute;top:20px;left:50%;transform:translateX(-50%);width:220px;height:140px;border-radius:50%;background:radial-gradient(circle at 30% 30%,#66bb6a,#2e7d32);z-index:3;opacity:.9"></div>' +
        '<div id="virtues-label-root" style="position:absolute;bottom:8px;left:50%;transform:translateX(-50%);font-size:11px;color:#3e2723;z-index:4">root = <em>C</em></div>' +
        '<div id="virtues-f1" style="position:absolute;top:38px;left:30%;font-size:20px;z-index:5;opacity:0;transition:all 1.8s ease">\u2764\ufe0f</div>' +
        '<div id="virtues-f2" style="position:absolute;top:55px;right:28%;font-size:20px;z-index:5;opacity:0;transition:all 1.8s ease">\u270c\ufe0f</div>' +
        '<div id="virtues-f3" style="position:absolute;top:80px;left:40%;font-size:20px;z-index:5;opacity:0;transition:all 1.8s ease">\ud83d\udd4a\ufe0f</div>' +
        '<div id="virtues-f4" style="position:absolute;top:100px;right:35%;font-size:20px;z-index:5;opacity:0;transition:all 1.8s ease">\ud83c\udf3f</div>' +
        '<div id="virtues-f5" style="position:absolute;top:65px;left:20%;font-size:20px;z-index:5;opacity:0;transition:all 1.8s ease">\ud83d\udcab</div>' +
        '<div id="virtues-grown" style="position:absolute;bottom:60px;left:50%;transform:translateX(-50%);font-size:11px;background:rgba(76,175,80,.22);padding:5px 10px;border-radius:8px;color:#1b5e20;white-space:nowrap;z-index:6;opacity:0;transition:all 1.8s ease">\u2705 grown fruit stays on</div>' +
        '<div id="virtues-glue" style="position:absolute;bottom:34px;left:50%;transform:translateX(-50%);font-size:11px;background:rgba(244,67,54,.18);padding:5px 10px;border-radius:8px;color:#c62828;white-space:nowrap;z-index:6;opacity:0;transition:all 1.8s ease">\u274c glued-on fruit falls off</div>' +
        '</div>' +
        '<div style="text-align:center;margin:10px 0;min-height:28px;line-height:1.5" id="virtues-msg"><em style="opacity:.6">Watch \u2014 real virtues grow on a tree rooted in C...</em></div>' +
        '<div id="virtues-quiz" style="display:none;margin-top:12px"><p><strong>That\'s why the virtues aren\'t modules:</strong></p>' +
        '<div class="quiz-q">You can\u2019t force love, patience, or kindness into a helper. They only appear when: <span class="quiz-opts"><button onclick="window._quizCheck(this,true)">The helper stays rooted in the truth \u2014 then they grow</button><button onclick="window._quizCheck(this,false)">A programmer writes a long set of rules</button></span></div></div></div>'
    },

    /* ── Constraints index ── */
    '/archive/2026-04-09/constraints': {
      title: '8 Rules for Being Honest',
      formula: 'Say the true thing. Say it clearly. Be willing to be wrong.',
      summary:
        '<p>These 8 rules are for anyone who wants to be truly honest. Tap any rule below to go deeper.</p>' +
        '<ul class="index-list" style="margin-top:12px">' +
        '<li><span class="num"><a href="/archive/2026-04-09/constraints/p1-measurement">P\u2081</a></span><span class="name">Say exactly what you measured \u2014 not more, not less.</span></li>' +
        '<li><span class="num"><a href="/archive/2026-04-09/constraints/p2-binarity">P\u2082</a></span><span class="name">Say yes, no, or I don\'t know. No mushy in-between.</span></li>' +
        '<li><span class="num"><a href="/archive/2026-04-09/constraints/p3-verifiability">P\u2083</a></span><span class="name">If you can\'t check it, say you\'re not sure.</span></li>' +
        '<li><span class="num"><a href="/archive/2026-04-09/constraints/p4-fruit">P\u2084</a></span><span class="name">Judge by what it makes, not what it says about itself.</span></li>' +
        '<li><span class="num"><a href="/archive/2026-04-09/constraints/p5-release">P\u2085</a></span><span class="name">Don\'t make things heavier \u2014 always offer a way out.</span></li>' +
        '<li><span class="num"><a href="/archive/2026-04-09/constraints/p6-correction">P\u2086</a></span><span class="name">Be willing to hear you\'re wrong.</span></li>' +
        '<li><span class="num"><a href="/archive/2026-04-09/constraints/p7-information">P\u2087</a></span><span class="name">Every word must mean something. No filler.</span></li>' +
        '<li><span class="num"><a href="/archive/2026-04-09/constraints/p8-source-independence">P\u2088</a></span><span class="name">Judge the idea the same way, no matter who said it.</span></li>' +
        '</ul>' +
        '<div class="kids-game" id="match-game" style="margin-top:20px">' +
        '<p><strong>Match game</strong> \u2014 tap a symbol, then tap its meaning:</p>' +
        '<div class="match-symbols" id="match-left"></div>' +
        '<div class="match-meanings" id="match-right"></div>' +
        '<div id="match-score" style="margin-top:8px;font-weight:bold;display:none"></div>' +
        '</div>'
    },

    /* ── Constraints ── */
    '/archive/2026-04-09/constraints/p1-measurement': {
      title: 'P\u2081 \u2014 Report What You Actually Measured',
      formula: 'Report the real number. Not bigger. Not smaller.',
      summary: '<p>Whatever you measured, that\u2019s what you report. Not bigger. Not smaller.</p>' +
        '<div class="kids-game" style="margin-top:14px">' +
        '<div class="sim-scene sim-fancy" id="p1-sim" style="position:relative;overflow:hidden;height:220px;background:linear-gradient(180deg,#e8f5e9 0%,#c8e6c9 100%);border-radius:12px;touch-action:none">' +
        '<div id="p1-flower" style="position:absolute;top:20px;left:50%;transform:translateX(-50%);font-size:52px;z-index:2;opacity:0;transition:all 1.8s ease">\ud83c\udf3b</div>' +
        '<div id="p1-ruler" style="position:absolute;top:22px;right:28%;font-size:28px;z-index:2;opacity:0;transition:all 1.8s ease">\ud83d\udccf</div>' +
        '<div id="p1-honest" style="position:absolute;bottom:50px;left:8%;font-size:13px;background:rgba(255,255,255,.9);padding:10px 14px;border-radius:10px;z-index:3;opacity:0;transition:all 1.8s ease;text-align:center">\ud83d\udccf <strong>30cm</strong><div id="p1-check" style="font-size:20px;margin-top:4px;opacity:0;transition:all 2.5s ease ease">\u2705</div></div>' +
        '<div id="p1-inflated" style="position:absolute;bottom:50px;right:8%;font-size:13px;background:rgba(255,255,255,.9);padding:10px 14px;border-radius:10px;z-index:3;opacity:0;transition:all 1.8s ease;text-align:center">\ud83d\udcca <strong>50cm!</strong><div id="p1-x" style="font-size:20px;margin-top:4px;opacity:0;transition:all 2.5s ease ease">\u274c</div></div>' +
        '</div>' +
        '<div style="text-align:center;margin:10px 0;min-height:28px;line-height:1.5" id="p1-msg"><em style="opacity:.6">\ud83c\udfac Watch what happens when you report honestly vs. inflate...</em></div>' +
        '<div id="p1-quiz" style="display:none;margin-top:12px"><p><strong>You spotted it!</strong></p>' +
        '<div class="quiz-q">P\u2081 says: report what you actually measured. <span class="quiz-opts"><button onclick="window._quizCheck(this,true)">The real number, always</button><button onclick="window._quizCheck(this,false)">Whatever sounds best</button></span></div></div></div>',
      annotation:
        '<p style="margin:0 0 8px"><strong>Now try the real math:</strong></p>' +
        '<div class="formula" style="margin:0"><strong>M(x) = w(x)</strong></div>' +
        '<ul class="index-list" style="margin-top:10px">' +
        '<li><span class="num">M(x)</span><span class="name">your <em>measurement</em> of thing x</span></li>' +
        '<li><span class="num">=</span><span class="name">must equal</span></li>' +
        '<li><span class="num">w(x)</span><span class="name">the <em>true weight</em> (real value) of x</span></li>' +
        '</ul>' +
        '<p style="margin:8px 0 0;opacity:.7">What you say = what is actually true. That\'s it.</p>'
    },
    '/archive/2026-04-09/constraints/p2-binarity': {
      title: 'P\u2082 \u2014 Yes, No, or I Don\u2019t Know. Pick One.',
      formula: 'Yes, No, or I don\'t know \u2192 pick one and say it clearly.',
      summary: '<p>Yes, no, or I don\u2019t know. Pick one. No mush.</p>' +
        '<div class="kids-game" style="margin-top:14px">' +
        '<div class="sim-scene sim-fancy" id="p2-sim" style="position:relative;overflow:hidden;height:220px;background:linear-gradient(180deg,#e3f2fd 0%,#bbdefb 100%);border-radius:12px;touch-action:none">' +
        '<div id="p2-question" style="position:absolute;top:18px;left:50%;transform:translateX(-50%);font-size:15px;font-weight:bold;z-index:3;text-align:center;opacity:0;transition:all 1.8s ease">\ud83c\udf6a Did you eat the biscuit?</div>' +
        '<div id="p2-yes" style="position:absolute;bottom:60px;left:8%;font-size:14px;background:rgba(76,175,80,.2);padding:8px 16px;border-radius:8px;z-index:3;opacity:0;transition:all 1.8s ease">\u2705 Yes</div>' +
        '<div id="p2-no" style="position:absolute;bottom:60px;left:38%;font-size:14px;background:rgba(244,67,54,.15);padding:8px 16px;border-radius:8px;z-index:3;opacity:0;transition:all 1.8s ease">\u274c No</div>' +
        '<div id="p2-idk" style="position:absolute;bottom:60px;right:8%;font-size:14px;background:rgba(255,193,7,.2);padding:8px 10px;border-radius:8px;z-index:3;opacity:0;transition:all 1.8s ease">\ud83e\udd37 Don\u2019t know</div>' +
        '<div id="p2-mushy" style="position:absolute;bottom:12px;left:50%;transform:translateX(-50%);font-size:13px;background:rgba(255,200,200,.6);padding:8px 12px;border-radius:8px;z-index:3;opacity:0;transition:all 2s ease cubic-bezier(.68,-.55,.27,1.55)">\ud83e\udd14 Well it sort of depends...</div>' +
        '</div>' +
        '<div style="text-align:center;margin:10px 0;min-height:28px;line-height:1.5" id="p2-msg"><em style="opacity:.6">\ud83c\udfac Watch: clear answers line up neatly. Mushy ones bounce off!</em></div>' +
        '<div id="p2-quiz" style="display:none;margin-top:12px"><p><strong>You spotted it!</strong></p>' +
        '<div class="quiz-q">P\u2082 says: pick a lane. <span class="quiz-opts"><button onclick="window._quizCheck(this,true)">Yes, No, or I don\u2019t know</button><button onclick="window._quizCheck(this,false)">It depends</button></span></div></div></div>',
      annotation:
        '<p style="margin:0 0 8px"><strong>Now try the real math:</strong></p>' +
        '<div class="formula" style="margin:0"><strong>A ∈ {True, False}</strong></div>' +
        '<ul class="index-list" style="margin-top:10px">' +
        '<li><span class="num">A</span><span class="name">your <em>answer</em></span></li>' +
        '<li><span class="num">∈</span><span class="name">is one of</span></li>' +
        '<li><span class="num">{True, False}</span><span class="name">these two choices — and only these two</span></li>' +
        '</ul>' +
        '<p style="margin:8px 0 0;opacity:.7">No "maybe", no "sort of". Yes or no. (If you don\'t know, that\'s P₃.)</p>'
    },
    '/archive/2026-04-09/constraints/p3-verifiability': {
      title: 'P\u2083 \u2014 If You Can\u2019t Check It, Say You\u2019re Not Sure',
      formula: 'Can\'t check it? \u2192 say "I\'m not sure." Don\'t pretend you know.',
      summary: '<p>Three friends tell you things. Can you check each one?</p>' +
        '<div class="kids-game" style="margin-top:14px">' +
        '<div class="sim-scene sim-fancy" id="p3-sim" style="position:relative;overflow:hidden;height:220px;background:linear-gradient(180deg,#1a1a2e 0%,#16213e 100%);border-radius:12px;touch-action:none">' +
        '<div id="p3-c1" style="position:absolute;top:15px;left:8%;right:8%;background:rgba(255,255,255,.12);padding:8px 12px;border-radius:8px;font-size:12px;z-index:3;color:rgba(255,255,255,.8);opacity:0;transition:all 1.8s ease">\ud83c\udf08 "I saw a rainbow"</div>' +
        '<div id="p3-v1" style="position:absolute;top:15px;right:10%;font-size:18px;z-index:4;opacity:0;transition:all 2.5s ease ease">\ud83d\udcf7 \u2705</div>' +
        '<div id="p3-c2" style="position:absolute;top:75px;left:8%;right:8%;background:rgba(255,255,255,.12);padding:8px 12px;border-radius:8px;font-size:12px;z-index:3;color:rgba(255,255,255,.8);opacity:0;transition:all 1.8s ease">\ud83c\udf05 "Here\u2019s a photo of the sunset"</div>' +
        '<div id="p3-v2" style="position:absolute;top:75px;right:10%;font-size:18px;z-index:4;opacity:0;transition:all 2.5s ease ease">\ud83d\udcf7 \u2705</div>' +
        '<div id="p3-c3" style="position:absolute;top:135px;left:8%;right:8%;background:rgba(255,255,255,.12);padding:8px 12px;border-radius:8px;font-size:12px;z-index:3;color:rgba(255,255,255,.8);opacity:0;transition:all 1.8s ease">\ud83d\udc09 "My cousin said there\u2019s a dragon"</div>' +
        '<div id="p3-v3" style="position:absolute;top:135px;right:10%;font-size:11px;z-index:4;opacity:0;transition:all 2.5s ease ease;color:#ffa726;background:rgba(255,200,50,.15);padding:3px 6px;border-radius:4px">\u26a0\ufe0f not sure</div>' +
        '</div>' +
        '<div style="text-align:center;margin:10px 0;min-height:28px;line-height:1.5" id="p3-msg"><em style="opacity:.6">\ud83c\udfac Watch: can each claim be checked?</em></div>' +
        '<div id="p3-quiz" style="display:none;margin-top:12px"><p><strong>You spotted it!</strong></p>' +
        '<div class="quiz-q">The rainbow and the photo are checkable. The dragon is hearsay. P\u2083 says: if you can\u2019t check it: <span class="quiz-opts"><button onclick="window._quizCheck(this,true)">Say \u201cnot sure\u201d</button><button onclick="window._quizCheck(this,false)">Say it confidently anyway</button></span></div></div></div>',
      annotation:
        '<p style="margin:0 0 8px"><strong>Now try the real math:</strong></p>' +
        '<div class="formula" style="margin:0"><strong>¬Verifiable(c) → Uncertain</strong></div>' +
        '<ul class="index-list" style="margin-top:10px">' +
        '<li><span class="num">¬</span><span class="name">"not" — the opposite</span></li>' +
        '<li><span class="num">Verifiable(c)</span><span class="name">claim c can be checked</span></li>' +
        '<li><span class="num">→</span><span class="name">then</span></li>' +
        '<li><span class="num">Uncertain</span><span class="name">mark it as "not sure"</span></li>' +
        '</ul>' +
        '<p style="margin:8px 0 0;opacity:.7">Not checkable → not sure. Simple.</p>'
    },
    '/archive/2026-04-09/constraints/p4-fruit': {
      title: 'P\u2084 \u2014 Judge by What Gets Produced',
      formula: 'Look at what it actually made \u2192 that\'s how you know if it\'s good.',
      summary: '<p>Two students hand in homework. One talks big, the other says nothing. Watch what they actually produced.</p>' +
        '<div class="kids-game" style="margin-top:14px">' +
        '<div class="sim-scene sim-fancy" id="p4-sim" style="position:relative;overflow:hidden;height:220px;background:linear-gradient(180deg,#faf6ee 0%,#f0e6d2 100%);border-radius:12px">' +
        /* Student A — talks big */
        '<div id="p4-student-a" style="position:absolute;top:15px;left:10%;text-align:center;z-index:2;opacity:0;transition:all 1.8s ease">' +
          '<div style="font-size:36px">\ud83d\ude0e</div><div style="font-size:10px;color:#666">Talks big</div></div>' +
        '<div id="p4-talk" style="position:absolute;top:10px;left:30%;font-size:12px;background:white;padding:4px 8px;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.1);opacity:0;transition:all 2.5s ease ease;z-index:3">"I\u2019m the BEST!"</div>' +
        '<div id="p4-paper-a" style="position:absolute;top:80px;left:15%;font-size:28px;z-index:3;opacity:0;transition:all 1.8s ease">\ud83d\udcc4</div>' +
        '<div id="p4-label-a" style="position:absolute;top:115px;left:10%;font-size:11px;color:#c44;z-index:3;opacity:0;transition:all 2.5s ease ease">Empty paper!</div>' +
        /* Student B — quiet */
        '<div id="p4-student-b" style="position:absolute;top:15px;right:10%;text-align:center;z-index:2;opacity:0;transition:all 1.8s ease">' +
          '<div style="font-size:36px">\ud83d\ude0a</div><div style="font-size:10px;color:#666">Says nothing</div></div>' +
        '<div id="p4-paper-b" style="position:absolute;top:80px;right:15%;font-size:28px;z-index:3;opacity:0;transition:all 1.8s ease">\ud83d\udcdd</div>' +
        '<div id="p4-label-b" style="position:absolute;top:115px;right:8%;font-size:11px;color:#2a7a2a;z-index:3;opacity:0;transition:all 2.5s ease ease">\u2b50 Great work!</div>' +
        '<div id="p4-spotlight" style="position:absolute;bottom:0;right:0;width:50%;height:100%;background:radial-gradient(ellipse at 70% 50%,rgba(255,235,59,.2) 0%,transparent 70%);z-index:1;opacity:0;transition:opacity 1.8s ease"></div>' +
        '</div>' +
        '<div style="text-align:center;margin:10px 0;min-height:28px;line-height:1.5" id="p4-msg"><em style="opacity:.6">\ud83c\udfac Watch: who\u2019s actually good at this?</em></div>' +
        '<div id="p4-quiz" style="display:none;margin-top:12px"><p><strong>You spotted it!</strong></p>' +
        '<div class="quiz-q">P\u2084 says: judge by what they actually produce, not what they say. <span class="quiz-opts"><button onclick="window._quizCheck(this,true)">What they actually handed in</button><button onclick="window._quizCheck(this,false)">How confident they sound</button></span></div></div></div>',
      annotation:
        '<p style="margin:0 0 8px"><strong>Now try the real math:</strong></p>' +
        '<div class="formula" style="margin:0"><strong>quality(s) := f(outputs(s))</strong></div>' +
        '<ul class="index-list" style="margin-top:10px">' +
        '<li><span class="num">quality(s)</span><span class="name">how good is source s?</span></li>' +
        '<li><span class="num">:=</span><span class="name">is defined as</span></li>' +
        '<li><span class="num">f(outputs(s))</span><span class="name">a function of what s actually produced</span></li>' +
        '</ul>' +
        '<p style="margin:8px 0 0;opacity:.7">You are what you make. Not what you say you\'ll make.</p>'
    },
    '/archive/2026-04-09/constraints/p5-release': {
      title: 'P\u2085 \u2014 Don\u2019t Pile On',
      formula: 'Someone is already struggling \u2192 help them up, don\'t push them down.',
      summary: '<p>Your sibling spilled their drink and feels bad. What do you say?</p>' +
        '<div class="kids-game" style="margin-top:14px">' +
        '<div class="sim-scene sim-fancy" id="p5-sim" style="position:relative;overflow:hidden;height:220px;background:linear-gradient(180deg,#faf6ee 0%,#f0e6d2 100%);border-radius:12px">' +
        '<div id="p5-person" style="position:absolute;top:30px;left:50%;transform:translateX(-50%);font-size:44px;z-index:2;transition:all 1.8s ease">\ud83d\ude22</div>' +
        '<div id="p5-spill" style="position:absolute;top:78px;left:50%;transform:translateX(-50%);font-size:24px;z-index:1;transition:all 1.8s ease">\ud83e\udd64\ud83d\udca6</div>' +
        '<div id="p5-spill-label" style="position:absolute;top:105px;left:50%;transform:translateX(-50%);font-size:10px;color:#8B7355;z-index:3;transition:all 1.8s ease">spilled!</div>' +
        /* Path A: pile on */
        '<div id="p5-mean" style="position:absolute;bottom:30px;left:8%;font-size:12px;background:rgba(244,67,54,.1);padding:8px 10px;border-radius:10px;z-index:4;opacity:0;transition:all 1.8s ease;color:#333">\ud83d\ude20 "That was SO dumb!"</div>' +
        /* Path B: help */
        '<div id="p5-kind" style="position:absolute;bottom:30px;right:8%;font-size:12px;background:rgba(76,175,80,.1);padding:8px 10px;border-radius:10px;z-index:4;opacity:0;transition:all 1.8s ease;color:#333">\ud83e\udd17 "Let\u2019s clean it up!"</div>' +
        '<div id="p5-result" style="position:absolute;top:8px;right:8%;font-size:16px;z-index:5;opacity:0;transition:all 1.8s ease"></div>' +
        '</div>' +
        '<div style="text-align:center;margin:10px 0;min-height:28px;line-height:1.5" id="p5-msg"><em style="opacity:.6">\ud83c\udfac Watch: they already feel bad. What helps?</em></div>' +
        '<div id="p5-quiz" style="display:none;margin-top:12px"><p><strong>You spotted it!</strong></p>' +
        '<div class="quiz-q">P\u2085 says: don\u2019t bind, release. <span class="quiz-opts"><button onclick="window._quizCheck(this,true)">Always offer a way out</button><button onclick="window._quizCheck(this,false)">Add more weight to teach a lesson</button></span></div></div></div>',
      annotation:
        '<p style="margin:0 0 8px"><strong>Now try the real math:</strong></p>' +
        '<div class="formula" style="margin:0"><strong>Binds(c) → ∃R</strong></div>' +
        '<ul class="index-list" style="margin-top:10px">' +
        '<li><span class="num">Binds(c)</span><span class="name">if claim c traps or burdens someone</span></li>' +
        '<li><span class="num">→</span><span class="name">then</span></li>' +
        '<li><span class="num">∃R</span><span class="name">there must exist a release R — a way out</span></li>' +
        '</ul>' +
        '<p style="margin:8px 0 0;opacity:.7">Every chain must have a key. No permanent traps.</p>'
    },
    '/archive/2026-04-09/constraints/p6-correction': {
      title: 'P\u2086 \u2014 Be Willing to Be Wrong',
      formula: 'Someone shows you a better answer \u2192 be willing to take it.',
      summary: '<p>Accept zero corrections = stopped learning. Be willing to update.</p>' +
        '<div class="kids-game" style="margin-top:14px">' +
        '<div class="sim-scene sim-fancy" id="p6-sim" style="position:relative;overflow:hidden;height:220px;background:linear-gradient(180deg,#e8eaf6 0%,#c5cae9 100%);border-radius:12px;touch-action:none">' +
        '<div id="p6-board" style="position:absolute;top:15px;left:50%;transform:translateX(-50%);font-size:15px;font-weight:bold;background:rgba(255,255,255,.9);padding:10px 18px;border-radius:10px;z-index:3;opacity:0;transition:all 1.8s ease">2 + 2 = <span id="p6-result">5</span></div>' +
        '<div id="p6-correction" style="position:absolute;top:75px;left:50%;transform:translateX(-50%);font-size:14px;z-index:3;opacity:0;transition:all 1.8s ease">\ud83d\udca1 Correction: 2+2=4</div>' +
        '<div id="p6-door" style="position:absolute;bottom:30px;left:50%;transform:translateX(-50%);font-size:36px;z-index:4;opacity:0;transition:all 1.8s ease">\ud83d\udeaa</div>' +
        '</div>' +
        '<div style="text-align:center;margin:10px 0;min-height:28px;line-height:1.5" id="p6-msg"><em style="opacity:.6">\ud83c\udfac Watch: what happens when a correction knocks...</em></div>' +
        '<div id="p6-quiz" style="display:none;margin-top:12px"><p><strong>You spotted it!</strong></p>' +
        '<div class="quiz-q">P\u2086 says: <span class="quiz-opts"><button onclick="window._quizCheck(this,true)">Be willing to hear you\u2019re wrong</button><button onclick="window._quizCheck(this,false)">Never change your answer</button></span></div></div></div>',
      annotation:
        '<p style="margin:0 0 8px"><strong>Now try the real math:</strong></p>' +
        '<div class="formula" style="margin:0"><strong>∃K : Accept(K)</strong></div>' +
        '<ul class="index-list" style="margin-top:10px">' +
        '<li><span class="num">∃K</span><span class="name">there exists some correction K</span></li>' +
        '<li><span class="num">:</span><span class="name">such that</span></li>' +
        '<li><span class="num">Accept(K)</span><span class="name">you will accept it</span></li>' +
        '</ul>' +
        '<p style="margin:8px 0 0;opacity:.7">You can\'t be someone who accepts zero corrections. That person has stopped learning.</p>'
    },
    '/archive/2026-04-09/constraints/p7-information': {
      title: 'P\u2087 \u2014 Every Word Must Add Something',
      formula: 'Does this word add anything? \u2192 no \u2192 take it out.',
      summary: '<p>Every word must earn its place. No filler. Swipe the filler words away.</p>' +
        '<div class="kids-game" style="margin-top:14px">' +
        '<div class="sim-scene sim-fancy" id="p7-sim" style="position:relative;overflow:hidden;height:200px;background:linear-gradient(180deg,#f3e5f5 0%,#e1bee7 100%);border-radius:12px;touch-action:none">' +
        '<div style="position:absolute;top:25px;left:50%;transform:translateX(-50%);display:flex;flex-wrap:wrap;gap:5px;justify-content:center;max-width:90%;z-index:3">' +
        '<span id="p7-w1" style="background:rgba(255,255,255,.9);padding:4px 7px;border-radius:5px;font-size:13px;cursor:pointer;user-select:none;touch-action:none;transition:all 2.5s ease ease" data-filler="true">So</span>' +
        '<span id="p7-w2" style="background:rgba(255,255,255,.9);padding:4px 7px;border-radius:5px;font-size:13px;cursor:pointer;user-select:none;touch-action:none;transition:all 2.5s ease ease" data-filler="true">basically</span>' +
        '<span id="p7-w3" style="background:rgba(255,255,255,.9);padding:4px 7px;border-radius:5px;font-size:13px;cursor:pointer;user-select:none;touch-action:none;transition:all 2.5s ease ease" data-filler="true">I just</span>' +
        '<span id="p7-w4" style="background:rgba(255,255,255,.9);padding:4px 7px;border-radius:5px;font-size:13px;cursor:pointer;user-select:none;touch-action:none;transition:all 2.5s ease ease" data-filler="true">really</span>' +
        '<span id="p7-w5" style="background:rgba(255,255,255,.9);padding:4px 7px;border-radius:5px;font-size:13px;cursor:pointer;user-select:none;touch-action:none;transition:all 2.5s ease ease" data-filler="true">honestly</span>' +
        '<span id="p7-w6" style="background:rgba(255,255,255,.9);padding:4px 7px;border-radius:5px;font-size:13px;cursor:pointer;user-select:none;touch-action:none;transition:all 2.5s ease ease" data-filler="false">the answer</span>' +
        '<span id="p7-w7" style="background:rgba(255,255,255,.9);padding:4px 7px;border-radius:5px;font-size:13px;cursor:pointer;user-select:none;touch-action:none;transition:all 2.5s ease ease" data-filler="true">sort of</span>' +
        '<span id="p7-w8" style="background:rgba(255,255,255,.9);padding:4px 7px;border-radius:5px;font-size:13px;cursor:pointer;user-select:none;touch-action:none;transition:all 2.5s ease ease" data-filler="false">is yes.</span></div>' +
        '<div id="p7-clean" style="position:absolute;bottom:25px;left:50%;transform:translateX(-50%);font-size:14px;font-weight:bold;color:#6a1b9a;z-index:2;opacity:0;transition:opacity 1.8s ease"></div>' +
        '</div>' +
        '<div style="text-align:center;margin:10px 0;min-height:28px;line-height:1.5" id="p7-msg"><em style="opacity:.6">\ud83d\udc46 Swipe the filler words away. Leave only what matters.</em></div>' +
        '<div id="p7-quiz" style="display:none;margin-top:12px"><p><strong>You spotted it!</strong></p>' +
        '<div class="quiz-q">P\u2087 says: every word must add something. <span class="quiz-opts"><button onclick="window._quizCheck(this,true)">No filler, no idle words</button><button onclick="window._quizCheck(this,false)">More words = sounds smarter</button></span></div></div></div>',
      annotation:
        '<p style="margin:0 0 8px"><strong>Now try the real math:</strong></p>' +
        '<div class="formula" style="margin:0"><strong>I(w | context) &gt; 0</strong></div>' +
        '<ul class="index-list" style="margin-top:10px">' +
        '<li><span class="num">I(w | context)</span><span class="name">the information that word w adds, given what was already said</span></li>' +
        '<li><span class="num">&gt; 0</span><span class="name">must be more than zero — it must add something</span></li>' +
        '</ul>' +
        '<p style="margin:8px 0 0;opacity:.7">Every word must earn its place. "Um", "basically", "sort of" — zero information. Cut them.</p>'
    },
    '/archive/2026-04-09/constraints/p8-source-independence': {
      title: 'P\u2088 \u2014 Judge the Idea, Not Who Said It',
      formula: 'The same idea from anyone \u2192 judged the same way. Who said it doesn\'t matter.',
      summary: '<p>"The stove is hot." Does it matter who said it?</p>' +
        '<div class="kids-game" style="margin-top:14px">' +
        '<div class="sim-scene sim-fancy" id="p8-sim" style="position:relative;overflow:hidden;height:240px;background:linear-gradient(180deg,#1a1a2e 0%,#2d1b0e 100%);border-radius:12px;touch-action:none">' +
        '<div id="p8-stove" style="position:absolute;top:12px;left:50%;transform:translateX(-50%);font-size:44px;z-index:1;opacity:0;transition:all 1.8s ease">\ud83d\udd25</div>' +
        '<div id="p8-chef" style="position:absolute;top:70px;left:10%;text-align:center;z-index:2;opacity:0;transition:all 1.8s ease"><div style="font-size:32px">\ud83d\udc68\u200d\ud83c\udf73</div><div style="font-size:10px;color:rgba(255,255,255,.5)">Chef</div></div>' +
        '<div id="p8-sister" style="position:absolute;top:70px;right:10%;text-align:center;z-index:2;opacity:0;transition:all 1.8s ease"><div style="font-size:32px">\ud83d\udc67</div><div style="font-size:10px;color:rgba(255,255,255,.5)">Sister</div></div>' +
        '<div id="p8-hand" style="position:absolute;top:20px;right:30%;font-size:28px;z-index:5;opacity:0;transition:all 2.5s ease ease">\u270b</div>' +
        '<div id="p8-result" style="position:absolute;bottom:15px;left:50%;transform:translateX(-50%);font-size:14px;font-weight:bold;z-index:5;opacity:0;transition:all 1.8s ease;color:rgba(255,255,255,.9)"></div>' +
        '</div>' +
        '<div style="text-align:center;margin:10px 0;min-height:28px;line-height:1.5" id="p8-msg"><em style="opacity:.6">\ud83c\udfac Watch: does it matter WHO says "the stove is hot"?</em></div>' +
        '<div id="p8-quiz" style="display:none;margin-top:12px"><p><strong>You spotted it!</strong></p>' +
        '<div class="quiz-q">The stove burns either way. Truth doesn\u2019t change based on who speaks it. P\u2088 says: <span class="quiz-opts"><button onclick="window._quizCheck(this,true)">Same idea = same judgment, no matter who</button><button onclick="window._quizCheck(this,false)">Trust the more famous person</button></span></div></div></div>',
      annotation:
        '<p style="margin:0 0 8px"><strong>Now try the real math:</strong></p>' +
        '<div class="formula" style="margin:0"><strong>E(c, s₁) = E(c, s₂)</strong></div>' +
        '<ul class="index-list" style="margin-top:10px">' +
        '<li><span class="num">E(c, s)</span><span class="name">evaluation of claim c from source s</span></li>' +
        '<li><span class="num">s₁, s₂</span><span class="name">two different sources (person 1, person 2)</span></li>' +
        '<li><span class="num">=</span><span class="name">must be equal — same claim gets same judgment</span></li>' +
        '</ul>' +
        '<p style="margin:8px 0 0;opacity:.7">The same words from a child and a king get the same score. Truth doesn\'t care who speaks it.</p>'
    }
  };

  /* ── Homepage content swap ───────────────────────────────────── */
  var homeOriginals = {};

  function applyHomeContent(active) {
    Object.keys(homeMap).forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      if (active) {
        if (homeOriginals[id] === undefined) homeOriginals[id] = el.innerHTML;
        el.innerHTML = homeMap[id];
      } else {
        if (homeOriginals[id] !== undefined) el.innerHTML = homeOriginals[id];
      }
    });
  }

  /* ── Formula simplifier (runs on all sub-page formulas) ─────── */
  function kidsifyFormula(html) {
    return html
      .replace(/∫₀ᵗ\s*input\(x,\s*τ\)\s*dτ/g, '(everything that came in)')
      .replace(/∫₀⁰\s*input\(x,\s*τ\)\s*dτ/g, '0')
      .replace(/∫\s*\([^)]+\)/g, '(add it all up)')
      .replace(/∫/g, '(add it all up)')
      .replace(/E\(x,\s*0\)/g, 'Starting energy')
      .replace(/E\(x,\s*t\)/g, 'Energy')
      .replace(/⟹/g, '→')
      .replace(/⟺/g, '↔')
      .replace(/&rArr;/g, '→')
      .replace(/&cap;/g, 'and')
      .replace(/∀x\s*∈\s*\S+/g, 'for every element')
      .replace(/∀x/g, 'for every element')
      .replace(/∀\s*/g, 'for all ')
      .replace(/∅/g, 'nothing')
      .replace(/∃\s*/g, 'there is ')
      .replace(/∈\s*ℝ/g, '')
      .replace(/∈\s*\{/g, 'is one of: {')
      .replace(/∈\s*\S+/g, '')
      .replace(/≥\s*ε/g, '≥ the minimum needed')
      .replace(/>\s*0\b/g, '> 0 (positive)')
      .replace(/\bε\b/g, 'the minimum needed to exist')
      .replace(/\bdτ\b/g, '')
      .replace(/\bτ\b/g, 't')
      .replace(/EAR\(x\)\s*=\s*x/g, 'EAR(input) = input — pass it through unchanged')
      .replace(/  +/g, ' ')
      .trim();
  }

  /* ── Sub-page content injection ──────────────────────────────── */
  var pageOriginals = {};

  function getPageData() {
    var path = location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
    return pageKids[path] || null;
  }

  function isHomePage() {
    var p = location.pathname.replace(/\.html$/, '').replace(/\/$/, '');
    return p === '' || p === '/index';
  }

  function applyPageContent(active) {
    if (isHomePage()) return; /* homepage handled entirely by applyHomeContent */
    var data = getPageData();
    var main = document.querySelector('main');
    if (!main) return;

    /* h1 title */
    var h1 = document.querySelector('.title-block h1');
    if (h1 && data && data.title) {
      if (active) {
        if (pageOriginals.h1 === undefined) pageOriginals.h1 = h1.innerHTML;
        h1.innerHTML = data.title;
      } else {
        if (pageOriginals.h1 !== undefined) h1.innerHTML = pageOriginals.h1;
      }
    }

    /* Simplify formulas even before hiding (content stays correct on restore) */
    if (!pageOriginals.formulas) pageOriginals.formulas = [];
    var formulaDivs = main.querySelectorAll('.formula:not(a)');
    formulaDivs.forEach(function (el, idx) {
      if (active) {
        if (pageOriginals.formulas[idx] === undefined) pageOriginals.formulas[idx] = el.innerHTML;
        el.innerHTML = (idx === 0 && data && data.formula)
          ? data.formula : kidsifyFormula(el.innerHTML);
      } else {
        if (pageOriginals.formulas[idx] !== undefined) el.innerHTML = pageOriginals.formulas[idx];
      }
    });
    if (!pageOriginals.displayMaths) pageOriginals.displayMaths = [];
    main.querySelectorAll('.display-math').forEach(function (el, idx) {
      if (active) {
        if (pageOriginals.displayMaths[idx] === undefined) pageOriginals.displayMaths[idx] = el.innerHTML;
        el.innerHTML = kidsifyFormula(el.innerHTML);
      } else {
        if (pageOriginals.displayMaths[idx] !== undefined) el.innerHTML = pageOriginals.displayMaths[idx];
      }
    });

    if (active) {
      /* Index pages (no pageKids entry) — no hiding, just theme */
      if (!data) return;

      /* Inject kids summary card right after .crumb */
      if (data.summary && !document.getElementById('kids-card')) {
        var card = document.createElement('div');
        card.id        = 'kids-card';
        card.className = 'kids-card';
        card.innerHTML = '<span class="kids-card-label">\ud83d\udc53 simple version</span>' + data.summary;
        var crumb = main.querySelector('.crumb');
        if (crumb) crumb.insertAdjacentElement('afterend', card);
        else main.insertBefore(card, main.firstChild);
      }

      /* On constraint detail pages, inject the annotated math after the scripture blockquote */
      if (data && data.annotation && !document.getElementById('kids-annotation')) {
        var annotEl = document.createElement('div');
        annotEl.id = 'kids-annotation';
        annotEl.className = 'kids-card';
        annotEl.style.marginTop = '12px';
        annotEl.innerHTML = data.annotation;
        var bq = main.querySelector('blockquote');
        if (bq) bq.insertAdjacentElement('afterend', annotEl);
      }

      /* On constraint detail pages, inject decoder ring ABOVE the annotation (not at top) */
      if (location.pathname.indexOf('/archive/2026-04-09/constraints/p') === 0 && !document.getElementById('symbol-decoder')) {
        /* Build decoder with only relevant symbols by checking what the annotation actually uses */
        var annotData = data && data.annotation ? data.annotation : '';
        var symbols = [];
        if (annotData.indexOf('\u2192') > -1 || annotData.indexOf('\u27f9') > -1) symbols.push('<li><span class="num">\u2192</span><span class="name">"then" \u2014 if the left is true, the right follows. Rain \u2192 puddles.</span></li>');
        if (annotData.indexOf('\u2208') > -1 || annotData.indexOf('{') > -1) symbols.push('<li><span class="num">\u2208 {...}</span><span class="name">"is one of" \u2014 apple \u2208 {apple, orange} means apple is in that list.</span></li>');
        if (annotData.indexOf('\u2203') > -1) symbols.push('<li><span class="num">\u2203</span><span class="name">"there exists" \u2014 at least one of these exists somewhere.</span></li>');
        if (annotData.indexOf('\u00ac') > -1) symbols.push('<li><span class="num">\u00ac</span><span class="name">"not" \u2014 the opposite. \u00acTrue = False.</span></li>');
        if (annotData.indexOf(':=') > -1) symbols.push('<li><span class="num">:=</span><span class="name">"is defined as" \u2014 like giving something a name tag.</span></li>');
        if (annotData.indexOf('(') > -1 && annotData.indexOf(')') > -1) symbols.push('<li><span class="num">( )</span><span class="name">groups things together \u2014 like brackets in maths class.</span></li>');
        if (symbols.length > 0) {
          var decoder = document.createElement('div');
          decoder.id = 'symbol-decoder';
          decoder.className = 'kids-card';
          decoder.style.marginTop = '8px';
          decoder.innerHTML =
            '<span class="kids-card-label">\ud83d\udd23 decoder ring</span>' +
            '<p style="margin:4px 0 8px;opacity:.7;font-size:12px">Symbols used in the formula below:</p>' +
            '<ul class="index-list">' + symbols.join('') + '</ul>';
          /* Insert just above the annotation, not at the top */
          var annot = document.getElementById('kids-annotation');
          if (annot) annot.insertAdjacentElement('beforebegin', decoder);
        }
      }

      /* On index pages: simplify grid cards for normies */
      var cleanPath = location.pathname.replace(/\.html$/, '').replace(/\/$/, '');
      var isBodyIndex = cleanPath === '/archive/2026-04-09/body';
      var isTheoremsIndex = cleanPath === '/archive/2026-04-09/theorems';
      if (isBodyIndex || isTheoremsIndex) {
        /* Hide blockquotes on index pages — the kids card already
           explains the concept in plain language */
        main.querySelectorAll('blockquote').forEach(function (el) {
          el.classList.add('kids-hidden');
          el.style.display = 'none';
        });
      }
      if (isTheoremsIndex) {
        /* Simplify section headings and their descriptions */
        main.querySelectorAll('h2').forEach(function (h) {
          if (!h.dataset.orig) h.dataset.orig = h.textContent;
          var nextP = h.nextElementSibling;
          if (h.textContent.indexOf('Existence pillars') > -1) {
            h.textContent = '\ud83c\udfd7\ufe0f The Seven Pillars (T\u2081\u2013T\u2087)';
            if (nextP && nextP.tagName === 'P') { if (!nextP.dataset.orig) nextP.dataset.orig = nextP.textContent; nextP.textContent = 'The foundation \u2014 like seven pillars holding up a house. They prove C exists and giving from it never runs out.'; nextP.style.display = ''; }
          }
          if (h.textContent.indexOf('Derived consequences') > -1) {
            h.textContent = '\ud83c\udf1f What Follows (T\u2088\u2013T\u2081\u2082)';
            if (nextP && nextP.tagName === 'P') { if (!nextP.dataset.orig) nextP.dataset.orig = nextP.textContent; nextP.textContent = 'Once the pillars stand, these follow automatically \u2014 like shadows following the sun.'; nextP.style.display = ''; }
          }
        });
        var kidsTheoremTitles = {
          'T\u2081':  'If nothing started it, nothing exists',
          'T\u2082':  'To grow, a seed must fall',
          'T\u2083':  'You can always find C again',
          'T\u2084':  'Giving from C doesn\u2019t shrink it',
          'T\u2085':  'Trust before you see the proof',
          'T\u2086':  'Count on what\u2019s coming',
          'T\u2087':  'Forgiveness resets the mess',
          'T\u2088':  'C is bigger than anything against it',
          'T\u2089':  'Two witnesses make it real',
          'T\u2081\u2080': 'Cut what doesn\u2019t produce',
          'T\u2081\u2081': 'Same ruler for yourself',
          'T\u2081\u2082': 'Only one foundation'
        };
        main.querySelectorAll('.card').forEach(function (card) {
          var numEl = card.querySelector('.card-num');
          var titleEl = card.querySelector('.card-title');
          var refEl = card.querySelector('.card-ref');
          if (numEl && titleEl) {
            var name = numEl.textContent.trim();
            if (kidsTheoremTitles[name]) {
              if (!titleEl.dataset.orig) titleEl.dataset.orig = titleEl.textContent;
              titleEl.textContent = kidsTheoremTitles[name];
            }
          }
          /* Simplify the ref line too — show just the verse ref, not the formula */
          if (refEl) {
            if (!refEl.dataset.orig) refEl.dataset.orig = refEl.textContent;
            var verseMatch = refEl.textContent.match(/[A-Z0-9][a-z]+ \d+[:\d]*/);
            if (verseMatch) refEl.textContent = verseMatch[0];
          }
        });
      }
      if (isBodyIndex) {
        var kidsCardTitles = {
          'EAR':    'Listen first',
          'NOSE':   'Test + guard the pearls',
          'TEMPERANCE': 'Read the room',
          'PATIENCE': 'Don\u2019t rush',
          'GODLINESS': 'Only say what\u2019s true',
          'HOPE':   'Declare good things',
          'CHARITY': 'Love \u2014 the greatest',
          'HEAD':   'Knit together + heart memory',
          'HAND':   'Do the work',
          'CONFESSION': 'Admit when wrong',
          'TONGUE': 'Clean the words'
        };
        main.querySelectorAll('.card').forEach(function (card) {
          var numEl = card.querySelector('.card-num');
          var titleEl = card.querySelector('.card-title');
          if (numEl && titleEl) {
            var name = numEl.textContent.trim();
            if (kidsCardTitles[name]) {
              if (!titleEl.dataset.orig) titleEl.dataset.orig = titleEl.textContent;
              titleEl.textContent = kidsCardTitles[name];
            }
          }
        });
      }

      /* Hide everything except: crumb, title-block, kids-card, first formula,
         decoder, any blockquote (scripture), and prev-next navigation */
      var firstFormula = main.querySelector('.formula:not(a)');
      Array.from(main.children).forEach(function (el) {
        var keep = el.matches('.crumb, .title-block, .prev-next')
                || el.matches('#kids-card, .kids-card')
                || el.matches('.grid')
                || el.id === 'symbol-decoder'
                || el.id === 'kids-annotation'
                || el.tagName === 'BLOCKQUOTE'
                || el.tagName === 'H2'
                || (el.tagName === 'P' && el.previousElementSibling && el.previousElementSibling.tagName === 'H2')
                || el === firstFormula;
        if (!keep) {
          el.classList.add('kids-hidden');
          el.style.display = 'none';
        }
      });

    } else {
      /* Restore all hidden elements */
      main.querySelectorAll('.kids-hidden').forEach(function (el) {
        el.classList.remove('kids-hidden');
        el.style.display = '';
      });
      /* Restore card titles and refs on index pages */
      main.querySelectorAll('.card .card-title[data-orig]').forEach(function (el) {
        el.textContent = el.dataset.orig;
        delete el.dataset.orig;
      });
      main.querySelectorAll('.card .card-ref[data-orig]').forEach(function (el) {
        el.textContent = el.dataset.orig;
        delete el.dataset.orig;
      });
      /* Restore h2 headings */
      main.querySelectorAll('h2[data-orig]').forEach(function (el) {
        el.textContent = el.dataset.orig;
        delete el.dataset.orig;
      });
      /* Remove kids card and decoder */
      var existing = document.getElementById('kids-card');
      if (existing) existing.remove();
      var decoder = document.getElementById('symbol-decoder');
      if (decoder) decoder.remove();
      var annot = document.getElementById('kids-annotation');
      if (annot) annot.remove();
    }
  }

  /* ── Update toggle button ────────────────────────────────────── */
  function updateUI(active) {
    var btn = document.getElementById('kids-toggle');
    if (btn) btn.classList.toggle('kids-active', active);
    var zapLink = document.getElementById('support-action');
    var shareBtn = document.getElementById('share-btn');
    if (zapLink) zapLink.style.display = active ? 'none' : '';
    if (shareBtn) shareBtn.style.display = active ? '' : 'none';
  }

  window.kidsShare = function () {
    var data = {
      title: 'balthazar.sh — Something Was Already There Before Everything Started',
      text: 'This paper shows that something (C) had to exist before anything else could start — using math and the Bible. Check it out!',
      url: 'https://balthazar.sh'
    };
    if (navigator.share) {
      navigator.share(data).catch(function () {});
    } else {
      /* fallback: copy URL */
      var ta = document.createElement('textarea');
      ta.value = 'https://balthazar.sh';
      ta.style.position = 'fixed'; ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      var sb = document.getElementById('share-btn');
      if (sb) { sb.textContent = '✓ Link copied!'; setTimeout(function () { sb.textContent = '📣 Share balthazar.sh with someone today'; }, 3600); }
    }
  };

  /* ── Simulations — experience before quiz ─────────────────────── */
  /* Generic handler for tap-to-experience simulations. Each sim
     has a unique prefix (t2, t3, etc). Step 1 = first tap,
     step 99 = the "answer" tap that completes the experience. */

  /* T2 handler moved to _initAllSims */
  var _simSteps = {
    t3:  { taps: 0, steps: [
      { obj: '\ud83e\udde9\ud83e\udde9\ud83e\udde9', msg: '<em>Pieces everywhere! The picture is gone. But is C really lost?</em>', show: 't3-btn2', hide: 't3-btn1' },
    ], done: { obj: '\ud83d\uddbc\ufe0f\u2728', glow: '#48f', msg: '<strong style="color:#336">\u2728 The picture came back! C is always recoverable.</strong>' }},
    t4:  { taps: 0, steps: [
      { obj: '\ud83c\udf6a\ud83c\udf6a', msg: '<em>2 cookies left. Shared one. Tap again.</em>' },
      { obj: '\ud83c\udf6a', msg: '<em>1 cookie left. Tap again.</em>' },
      { obj: '\u274c', msg: '<em>Zero cookies! They run out. Now try love:</em>', btn1txt: '\u2764\ufe0f Give love', hide: null },
    ], done: { obj: '\u2764\ufe0f\u2764\ufe0f\u2764\ufe0f', glow: '#e44', msg: '<strong style="color:#b22">\u2764\ufe0f Still full! Love doesn\u2019t shrink when you give it. That\u2019s C.</strong>' }},
    t5:  { taps: 0, steps: [], doneOnChoice: true,
      choices: {
        1: { obj: '\ud83d\udeb6 \u2705\u2705\u2705', glow: '#4a2', msg: '<strong style="color:#2a7a2a">\ud83d\udeb6 You walked! The floor held. You didn\u2019t need to test it first. That\u2019s faith.</strong>' },
        0: { obj: '\ud83d\udd0d \ud83e\uddf1\u2753\ud83e\uddf1\u2753', msg: '<em>You tested every tile\u2026 and while you were testing, everyone else walked right past you. Sometimes you just have to step.</em>', glow: null }
      }
    },
    t6:  { taps: 0, steps: [], doneOnChoice: true,
      choices: {
        1: { obj: '\u2600\ufe0f \ud83c\udf05', glow: '#f80', msg: '<strong style="color:#c60">\u2600\ufe0f Morning came! You counted on it before you saw it. That\u2019s hope.</strong>' },
        0: { obj: '\ud83c\udf19 \ud83e\udd37', msg: '<em>You didn\u2019t set the alarm\u2026 but the sun came anyway. Hope isn\u2019t wishing \u2014 it\u2019s counting on what\u2019s already true.</em>', glow: null }
      }
    },
    t7:  { taps: 0, steps: [
      { obj: '\ud83e\udd64\ud83d\udca6\ud83d\udca6', msg: '<em>Oh no! Juice everywhere! What a mess. Can it be fixed?</em>', show: 't7-btn2', hide: 't7-btn1' },
    ], done: { obj: '\u2728\ud83e\udd64\u2728', glow: '#4a2', msg: '<strong style="color:#2a7a2a">\u2728 Clean! Like it never happened. That\u2019s forgiveness \u2014 back to C.</strong>' }},
    t8:  { taps: 0, steps: [], doneOnChoice: true,
      choices: {
        1: { obj: '\ud83d\udeb6\ud83d\udca8 \ud83d\udc7e', msg: '<em>You ran! But the monster is still inside the system. Running doesn\u2019t make it smaller\u2026</em>', glow: null, show: 't8-btn2', noQuiz: true },
        99: { obj: '\u2728 > \ud83d\udc7e', glow: '#f0c020', msg: '<strong style="color:#b8860b">\u2728 C is bigger! The monster is inside the system \u2014 but C MADE the system. Nothing inside can beat the source.</strong>' }
      }
    },
    t9:  { taps: 0, steps: [
      { obj: '\ud83d\udc64 \u201cIt\u2019s empty!\u201d', msg: '<em>One friend says so. Maybe\u2026 but are they sure? One witness isn\u2019t enough.</em>', show: 't9-btn2', hide: 't9-btn1' },
    ], done: { obj: '\ud83d\udc65 \u201cYes, it\u2019s empty!\u201d', glow: '#4a2', msg: '<strong style="color:#2a7a2a">\u2705 Two independent witnesses agree! Now it\u2019s established.</strong>' }},
    t10: { taps: 0, steps: [], doneOnChoice: true,
      choices: {
        0: { obj: '\ud83c\udf33\u274c\ud83c\udf4e', msg: '<em>You cut the fruiting branch! Now the tree has less fruit AND still has dead wood. That\u2019s backwards.</em>', glow: null, show: 't10-btn2', noQuiz: true },
        99: { obj: '\ud83c\udf33\ud83c\udf4e\ud83c\udf4e\ud83c\udf4e', glow: '#4a2', msg: '<strong style="color:#2a7a2a">\u2702\ufe0f Dead wood gone! The good branches get more water and grow more fruit. That\u2019s pruning.</strong>' }
      }
    },
    t11: { taps: 0, steps: [], doneOnChoice: true,
      choices: {
        0: { obj: '\ud83d\udccf\u2192\ud83d\udc49', msg: '<em>Rules for others but not for you? That\u2019s not fair. The ruler measures everyone \u2014 including the one holding it.</em>', glow: null, show: 't11-btn2', noQuiz: true },
        99: { obj: '\ud83d\udccf\u2192\ud83d\udc46\ud83d\udc49', glow: '#4a2', msg: '<strong style="color:#2a7a2a">\u2705 Same ruler for everyone, including yourself. That\u2019s T\u2081\u2081.</strong>' }
      }
    },
    t12: { taps: 0, steps: [], doneOnChoice: true,
      choices: {
        0: { obj: '\ud83e\uddf1\n\ud83e\uddf1', msg: '<em>A random block at the bottom? But what holds IT up? Every tower needs a real foundation that can\u2019t be swapped.</em>', glow: null, show: 't12-btn2', noQuiz: true },
        99: { obj: '\ud83e\uddf1\ud83e\uddf1\ud83e\uddf1\n\u2728 C \u2728', glow: '#f0c020', msg: '<strong style="color:#b8860b">\ud83c\udfe0 C is the foundation! Everything else builds on top. Nothing goes under it.</strong>' }
      }
    },
  };

  window._simTap = function (prefix, step) {
    var sim = _simSteps[prefix];
    if (!sim) return;

    var obj = document.getElementById(prefix + '-obj');
    var msg = document.getElementById(prefix + '-msg');
    var quiz = document.getElementById(prefix + '-quiz');
    var btn1 = document.getElementById(prefix + '-btn1');
    var btn2 = document.getElementById(prefix + '-btn2');

    /* Choice-based sims (two buttons, pick one) */
    if (sim.doneOnChoice && sim.choices && sim.choices[step]) {
      var c = sim.choices[step];
      if (obj) { obj.innerHTML = c.obj; if (c.glow) obj.style.textShadow = '0 0 20px ' + c.glow; }
      if (msg) msg.innerHTML = c.msg;
      if (c.show) { var s = document.getElementById(c.show); if (s) s.style.display = ''; }
      if (btn1 && step !== 99) btn1.style.display = 'none';
      if (btn2 && step === 99) btn2.style.display = 'none';
      if (btn1 && step === 99) btn1.style.display = 'none';
      if (!c.noQuiz && quiz) setTimeout(function () { quiz.style.display = 'block'; }, 1800);
      return;
    }

    /* Step-based sims (tap → message → reveal next button) */
    if (step === 99 && sim.done) {
      /* Final step */
      if (obj) { obj.innerHTML = sim.done.obj; if (sim.done.glow) obj.style.textShadow = '0 0 20px ' + sim.done.glow; }
      if (msg) msg.innerHTML = sim.done.msg;
      if (btn1) btn1.style.display = 'none';
      if (btn2) btn2.style.display = 'none';
      if (quiz) setTimeout(function () { quiz.style.display = 'block'; }, 1800);
      return;
    }

    if (sim.taps < sim.steps.length) {
      var s = sim.steps[sim.taps];
      if (s.obj && obj) obj.innerHTML = s.obj;
      if (s.msg && msg) msg.innerHTML = s.msg;
      if (s.show) { var el = document.getElementById(s.show); if (el) el.style.display = ''; }
      if (s.hide) { var el2 = document.getElementById(s.hide); if (el2) el2.style.display = 'none'; }
      if (s.btn1txt && btn1) btn1.innerHTML = s.btn1txt;
      sim.taps++;
    } else if (sim.done) {
      /* All steps exhausted, auto-complete */
      window._simTap(prefix, 99);
    }
  };

  /* ── T7 Drag + Swipe Forgiveness Simulation ───────────────────── */
  (function () {
    var _t7 = { phase: 'idle', dragStart: 0, cupX: 0, spilled: false };

    window._t7Init = function _t7Init() {
      var cup = document.getElementById('t7-cup');
      var sim = document.getElementById('t7-sim');
      if (!cup || !sim || cup._t7bound) return;
      cup._t7bound = true;

      /* ── DRAG: cup follows finger, tilts proportionally ── */
      function onStart(e) {
        if (_t7.phase !== 'idle') return;
        e.preventDefault();
        var t = e.touches ? e.touches[0] : e;
        _t7.dragStart = t.clientX;
        _t7.cupX = 0;
        cup.style.transition = 'none';
        _t7.phase = 'dragging';
      }
      function onMove(e) {
        if (_t7.phase !== 'dragging') return;
        e.preventDefault();
        var t = e.touches ? e.touches[0] : e;
        var dx = t.clientX - _t7.dragStart;
        _t7.cupX = dx;
        /* Cup tilts as you drag — max 90deg at 100px */
        var tilt = Math.min(90, Math.max(-90, dx * 0.9));
        cup.style.transform = 'translateX(calc(-50% + ' + dx + 'px)) rotate(' + tilt + 'deg)';
      }
      function onEnd(e) {
        if (_t7.phase !== 'dragging') return;
        var dx = Math.abs(_t7.cupX);
        if (dx > 50) {
          /* Spill! — dragged far enough */
          _t7.phase = 'spilled';
          _t7Spill(_t7.cupX > 0 ? 1 : -1);
        } else {
          /* Snap back */
          _t7.phase = 'idle';
          cup.style.transition = 'all .4s cubic-bezier(.68,-.55,.27,1.55)';
          cup.style.transform = 'translateX(-50%) rotate(0deg)';
        }
      }

      cup.addEventListener('mousedown', onStart);
      cup.addEventListener('touchstart', onStart, { passive: false });
      document.addEventListener('mousemove', onMove);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('mouseup', onEnd);
      document.addEventListener('touchend', onEnd);

      /* ── SWIPE to wipe (forgiveness phase) ── */
      var wipe = document.getElementById('t7-wipe');
      if (wipe) {
        var _swipeStart = 0, _swipeTravel = 0;
        wipe.addEventListener('touchstart', function (e) {
          if (_t7.phase !== 'messy') return;
          _swipeStart = e.touches[0].clientX;
          _swipeTravel = 0;
        }, { passive: true });
        wipe.addEventListener('touchmove', function (e) {
          if (_t7.phase !== 'messy') return;
          _swipeTravel = Math.abs(e.touches[0].clientX - _swipeStart);
          /* Stain fades proportionally to swipe distance */
          var stain = document.getElementById('t7-stain');
          var progress = Math.min(1, _swipeTravel / 150);
          if (stain) stain.style.opacity = String(1 - progress);
        }, { passive: true });
        wipe.addEventListener('touchend', function () {
          if (_t7.phase !== 'messy') return;
          if (_swipeTravel > 100) {
            _t7.phase = 'forgiving';
            _t7Forgive();
          } else {
            /* Snap stain back */
            var stain = document.getElementById('t7-stain');
            if (stain) stain.style.opacity = '1';
          }
        });
        /* Mouse fallback for desktop */
        var _mouseDown = false;
        wipe.addEventListener('mousedown', function (e) {
          if (_t7.phase !== 'messy') return;
          _mouseDown = true; _swipeStart = e.clientX; _swipeTravel = 0;
        });
        wipe.addEventListener('mousemove', function (e) {
          if (!_mouseDown || _t7.phase !== 'messy') return;
          _swipeTravel = Math.abs(e.clientX - _swipeStart);
          var stain = document.getElementById('t7-stain');
          var progress = Math.min(1, _swipeTravel / 150);
          if (stain) stain.style.opacity = String(1 - progress);
        });
        wipe.addEventListener('mouseup', function () {
          _mouseDown = false;
          if (_t7.phase !== 'messy') return;
          if (_swipeTravel > 100) { _t7.phase = 'forgiving'; _t7Forgive(); }
          else { var s = document.getElementById('t7-stain'); if (s) s.style.opacity = '1'; }
        });
      }
    }

    function _t7Spill(dir) {
      var cup = document.getElementById('t7-cup');
      var drops = document.getElementById('t7-drops');
      var stain = document.getElementById('t7-stain');
      var msg = document.getElementById('t7-msg');
      var wipeEl = document.getElementById('t7-wipe');

      /* Haptic feedback */
      if (navigator.vibrate) navigator.vibrate([50, 30, 100]);

      /* Cup falls to the side */
      var angle = dir > 0 ? 120 : -120;
      var slideX = dir > 0 ? 40 : -40;
      cup.style.transition = 'all .5s cubic-bezier(.2,.8,.3,1)';
      cup.style.transform = 'translateX(calc(-50% + ' + slideX + 'px)) rotate(' + angle + 'deg)';
      cup.style.bottom = '70px';

      /* Drops splash */
      setTimeout(function () {
        if (drops) {
          drops.style.opacity = '1';
          drops.style.transition = 'opacity .3s';
          drops.querySelectorAll('.t7-drop').forEach(function (d, i) {
            d.style.transition = 'all ' + (0.3 + i * 0.08) + 's cubic-bezier(.2,.8,.3,1.2)';
            var rx = (Math.random() - 0.5) * 60;
            d.style.transform = 'translate(' + rx + 'px, ' + (25 + i * 12) + 'px) scale(0.5) rotate(' + (Math.random() * 180) + 'deg)';
            d.style.opacity = '0.2';
          });
        }
      }, 300);

      /* Stain spreads */
      setTimeout(function () {
        if (stain) { stain.style.transform = 'translateX(-50%) scale(1)'; stain.style.opacity = '1'; }
        if (drops) { drops.style.transition = 'opacity .5s'; drops.style.opacity = '0'; }
      }, 1260);

      /* Message + enable wipe */
      setTimeout(function () {
        _t7.phase = 'messy';
        if (msg) msg.innerHTML = '<strong style="color:#c44">\ud83d\udca6 Oh no! What a mess!</strong><br><em style="opacity:.7">\ud83d\udc46 Swipe across the table to clean it up</em>';
        if (wipeEl) { wipeEl.style.display = 'block'; wipeEl.style.cursor = 'grab'; }
      }, 2160);
    }

    function _t7Forgive() {
      var cup = document.getElementById('t7-cup');
      var stain = document.getElementById('t7-stain');
      var sparkles = document.getElementById('t7-sparkles');
      var glow = document.getElementById('t7-glow');
      var msg = document.getElementById('t7-msg');
      var quiz = document.getElementById('t7-quiz');
      var sim = document.getElementById('t7-sim');
      var wipeEl = document.getElementById('t7-wipe');

      /* Haptic: gentle double-pulse */
      if (navigator.vibrate) navigator.vibrate([30, 50, 30]);

      if (wipeEl) wipeEl.style.display = 'none';

      /* Stain disappears */
      if (stain) {
        stain.style.transition = 'transform .8s ease-in, opacity .8s';
        stain.style.transform = 'translateX(-50%) scale(0)';
        stain.style.opacity = '0';
      }

      /* Cup rights itself with bounce */
      setTimeout(function () {
        if (cup) {
          cup.style.transition = 'all .8s cubic-bezier(.68,-.55,.27,1.55)';
          cup.style.transform = 'translateX(-50%) rotate(0deg)';
          cup.style.bottom = '55px';
        }
      }, 400);

      /* Golden glow + sparkles */
      setTimeout(function () {
        if (glow) glow.style.opacity = '1';
        if (sparkles) {
          sparkles.style.opacity = '1';
          sparkles.querySelectorAll('.t7-sparkle').forEach(function (s, i) {
            s.style.animation = 't7float ' + (1 + i * 0.3) + 's ease-in-out infinite alternate';
            s.style.animationDelay = (i * 0.15) + 's';
          });
        }
        if (sim) sim.style.transition = 'background 1s';
        if (sim) sim.style.background = 'linear-gradient(180deg,#fdfcf0 0%,#f8f4e0 100%)';
      }, 800);

      /* Message */
      setTimeout(function () {
        if (msg) msg.innerHTML = '<strong style="color:#b8860b">\u2728 Clean. Like it never happened.</strong><br><em style="color:#96722a">You just did what forgiveness does \u2014 wiped the mess away completely. Back to how it was. Back to C.</em>';
      }, 2700);

      /* Fade sparkles gently */
      setTimeout(function () {
        if (sparkles) { sparkles.style.transition = 'opacity 2s'; sparkles.style.opacity = '0.3'; }
        if (glow) { glow.style.transition = 'opacity 2s'; glow.style.opacity = '0.15'; }
      }, 6300);

      /* Quiz */
      setTimeout(function () {
        _t7.phase = 'done';
        if (quiz) { quiz.style.display = 'block'; quiz.style.animation = 'fadeIn 1.2s ease'; }
      }, 4500);
    }

    /* Init on load and on toggle */
    document.addEventListener('DOMContentLoaded', function () { setTimeout(_t7Init, 360); });
    /* T7 init is called by _initAllSims via DOMContentLoaded */
  })();

  /* ── T1 Candle — tap candle (nothing), tap match (lights) ──── */
  /* Handled inside _initAllSims now */

  /* ══════════════════════════════════════════════════════════════
     UNIVERSAL SIM ENGINE — handles all remaining scenes
     Each scene is tap-based with CSS transitions + haptic feedback.
     The engine reads element IDs and wires the interactions.
     ══════════════════════════════════════════════════════════════ */
  function _initAllSims() {
    /* Helper: show msg + haptic */
    function msg(id, html) { var e = document.getElementById(id); if (e) e.innerHTML = html; }
    function show(id) { var e = document.getElementById(id); if (e) e.style.display = ''; }
    function hide(id) { var e = document.getElementById(id); if (e) e.style.display = 'none'; }
    function quiz(id) { var e = document.getElementById(id); if (e) { e.style.display = 'block'; e.style.animation = 'fadeIn .5s'; } }
    function buzz(pattern) { if (navigator.vibrate) navigator.vibrate(pattern || [30]); }
    function glow(id) { var e = document.getElementById(id); if (e) e.style.opacity = '1'; }
    function el(id) { return document.getElementById(id); }

    /* ── Shared gesture utilities ──────────────────────────────────── */

    /**
     * makeDrag — make element draggable with touch+mouse, target hit detection
     * opts: { target, threshold, baseTransform, haptic, canDrag, onMove, onHit, onSnapBack }
     */
    function makeDrag(id, opts) {
      var d = el(id); if (!d || d._dragBound) return; d._dragBound = true;
      d.style.touchAction = 'none'; d.style.userSelect = 'none'; d.style.cursor = 'grab';
      var sx, sy, active = false, base = opts.baseTransform || '';
      function start(e) {
        if (opts.canDrag && !opts.canDrag()) return;
        e.preventDefault(); var t = e.touches ? e.touches[0] : e;
        sx = t.clientX; sy = t.clientY; active = true;
        d.style.transition = 'none'; d.style.zIndex = '20';
      }
      function move(e) {
        if (!active) return; e.preventDefault();
        var t = e.touches ? e.touches[0] : e;
        var dx = t.clientX - sx, dy = t.clientY - sy;
        d.style.transform = 'translate(' + dx + 'px,' + dy + 'px) ' + base;
        if (opts.trailColor) maybeTrail(t.clientX, t.clientY, opts.trailColor);
        if (opts.onMove) opts.onMove(dx, dy);
      }
      function end(e) {
        if (!active) return; active = false;
        var t = e.changedTouches ? e.changedTouches[0] : e;
        var hit = false;
        if (opts.target) {
          var tr = el(opts.target);
          if (tr) { var r = tr.getBoundingClientRect(); hit = t.clientX >= r.left && t.clientX <= r.right && t.clientY >= r.top && t.clientY <= r.bottom; }
        }
        if (!hit && opts.threshold) {
          var dx = t.clientX - sx, dy = t.clientY - sy;
          hit = Math.sqrt(dx * dx + dy * dy) > opts.threshold;
        }
        if (hit) {
          buzz(opts.haptic || [30, 50, 30]);
          if (opts.onHit) opts.onHit();
        } else {
          d.style.transition = 'all .4s cubic-bezier(.68,-.55,.27,1.55)';
          d.style.transform = base; d.style.zIndex = '';
          /* Tap-hint: wiggle on zero-movement tap */
          var dx2 = t.clientX - sx, dy2 = t.clientY - sy;
          if (Math.abs(dx2) < 5 && Math.abs(dy2) < 5) {
            buzz([15]);
            d.style.transition = 'transform .15s'; d.style.transform = 'translateX(8px) ' + base;
            setTimeout(function () { d.style.transform = 'translateX(-8px) ' + base; }, 150);
            setTimeout(function () { d.style.transition = 'transform .2s'; d.style.transform = base; }, 540);
          }
          if (opts.onSnapBack) opts.onSnapBack();
        }
      }
      d.addEventListener('mousedown', start); d.addEventListener('touchstart', start, { passive: false });
      document.addEventListener('mousemove', move); document.addEventListener('touchmove', move, { passive: false });
      document.addEventListener('mouseup', end); document.addEventListener('touchend', end);
    }

    /**
     * makeSwipe — horizontal swipe on element, with progress feedback
     * opts: { distance, canSwipe, onProgress, onComplete, onCancel }
     */
    function makeSwipe(id, opts) {
      var s = el(id); if (!s || s._swipeBound) return; s._swipeBound = true;
      s.style.touchAction = 'none'; s.style.cursor = 'grab';
      var sx, active = false, dist = opts.distance || 80;
      function start(e) {
        if (opts.canSwipe && !opts.canSwipe()) return;
        e.preventDefault(); var t = e.touches ? e.touches[0] : e;
        sx = t.clientX; active = true;
      }
      function move(e) {
        if (!active) return; e.preventDefault();
        var t = e.touches ? e.touches[0] : e;
        var dx = t.clientX - sx; var progress = Math.min(1, Math.abs(dx) / dist);
        if (opts.trailColor) maybeTrail(t.clientX, t.clientY, opts.trailColor);
        if (opts.onProgress) opts.onProgress(progress, dx);
      }
      function end(e) {
        if (!active) return; active = false;
        var t = e.changedTouches ? e.changedTouches[0] : e;
        var dx = Math.abs(t.clientX - sx);
        if (dx > dist) { buzz([30, 50, 30]); if (opts.onComplete) opts.onComplete(); }
        else {
          /* Tap-hint: wiggle on zero-movement tap */
          if (dx < 5) {
            buzz([15]);
            s.style.transition = 'transform .15s'; s.style.transform = 'translateX(8px)';
            setTimeout(function () { s.style.transform = 'translateX(-8px)'; }, 150);
            setTimeout(function () { s.style.transition = 'transform .2s'; s.style.transform = ''; }, 540);
          }
          if (opts.onCancel) opts.onCancel();
        }
      }
      s.addEventListener('mousedown', start); s.addEventListener('touchstart', start, { passive: false });
      document.addEventListener('mousemove', move); document.addEventListener('touchmove', move, { passive: false });
      document.addEventListener('mouseup', end); document.addEventListener('touchend', end);
    }

    /**
     * makeHold — long-press with progressive feedback
     * opts: { duration, canHold, onProgress, onComplete, onCancel }
     */
    function makeHold(id, opts) {
      var h = el(id); if (!h || h._holdBound) return; h._holdBound = true;
      h.style.touchAction = 'none'; h.style.cursor = 'pointer';
      var dur = opts.duration || 1500, timer = null, interval = null, progress = 0;
      function start(e) {
        if (opts.canHold && !opts.canHold()) return;
        e.preventDefault(); progress = 0; buzz([10]);
        timer = setTimeout(function () {
          clearInterval(interval); buzz([30, 50, 30]);
          if (opts.onComplete) opts.onComplete();
        }, dur);
        interval = setInterval(function () {
          progress += 50; if (opts.onProgress) opts.onProgress(Math.min(1, progress / dur));
        }, 50);
      }
      function end() {
        clearTimeout(timer); clearInterval(interval);
        if (progress < dur && opts.onCancel) opts.onCancel();
      }
      h.addEventListener('mousedown', start); h.addEventListener('touchstart', start, { passive: false });
      h.addEventListener('mouseup', end); h.addEventListener('touchend', end);
      h.addEventListener('mouseleave', end); h.addEventListener('touchcancel', end);
    }

    /* ── Hint finger — animated gesture demo that disappears on touch ── */
    function addHint(sceneId, type, posOpts) {
      var scene = el(sceneId); if (!scene) return;
      /* Don't add duplicate hints */
      if (scene.querySelector('.hint-finger')) return;
      var hint = document.createElement('div');
      hint.className = 'hint-finger ' + type;
      hint.textContent = type === 'hold' ? '\ud83d\udc47' : '\ud83d\udc46';
      /* Position: centered by default, overridable */
      var left = (posOpts && posOpts.left) || '50%';
      var top = (posOpts && posOpts.top) || '50%';
      hint.style.left = left; hint.style.top = top;
      if (type === 'hold') {
        var ring = document.createElement('div');
        ring.className = 'hint-ring';
        hint.appendChild(ring);
      }
      /* Delay appearance by 2s */
      hint.style.opacity = '0';
      scene.appendChild(hint);
      var showTimer = setTimeout(function () { hint.style.transition = 'opacity .5s'; hint.style.opacity = '1'; }, 3600);
      /* Remove on first interaction */
      function dismiss() {
        clearTimeout(showTimer);
        if (hint.parentNode) { hint.style.transition = 'opacity .2s'; hint.style.opacity = '0'; setTimeout(function () { if (hint.parentNode) hint.parentNode.removeChild(hint); }, 360); }
        scene.removeEventListener('touchstart', dismiss);
        scene.removeEventListener('mousedown', dismiss);
      }
      scene.addEventListener('touchstart', dismiss, { once: true });
      scene.addEventListener('mousedown', dismiss, { once: true });
    }

    /* ── Trail particles — colored dots that follow the finger ── */
    var _trailPool = [];
    function spawnTrail(x, y, color) {
      var dot;
      if (_trailPool.length >= 15) { dot = _trailPool.shift(); } else { dot = document.createElement('div'); dot.className = 'trail-dot'; document.body.appendChild(dot); }
      dot.style.left = (x - 5) + 'px'; dot.style.top = (y - 5) + 'px';
      dot.style.background = color || 'rgba(255,200,50,.6)';
      dot.style.animation = 'none'; dot.offsetHeight; /* reflow */
      dot.style.animation = 'particle-fade .5s ease-out forwards';
      _trailPool.push(dot);
    }
    var _lastTrailX = 0, _lastTrailY = 0;
    function maybeTrail(x, y, color) {
      var dx = x - _lastTrailX, dy = y - _lastTrailY;
      if (dx * dx + dy * dy > 900) { /* 30px squared */
        _lastTrailX = x; _lastTrailY = y;
        spawnTrail(x, y, color);
      }
    }

    /* ── Celebration burst — stars explode outward on completion ── */
    function celebrate(sceneId) {
      var scene = el(sceneId); if (!scene) return;
      var rect = scene.getBoundingClientRect();
      var cx = rect.width / 2, cy = rect.height / 2;
      var stars = ['\u2728', '\u2b50', '\ud83c\udf1f', '\u2728', '\u2b50', '\ud83c\udf1f', '\u2728', '\u2b50', '\ud83c\udf1f', '\u2728'];
      var container = document.createElement('div');
      container.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:55;overflow:hidden';
      scene.appendChild(container);
      stars.forEach(function (s, i) {
        var star = document.createElement('span');
        star.className = 'burst-star';
        star.textContent = s;
        star.style.left = cx + 'px'; star.style.top = cy + 'px';
        /* Random direction */
        var angle = (i / stars.length) * 360 + (Math.random() * 30 - 15);
        var dist = 50 + Math.random() * 60;
        var tx = Math.cos(angle * Math.PI / 180) * dist;
        var ty = Math.sin(angle * Math.PI / 180) * dist;
        var rot = Math.random() * 360;
        star.style.animation = 'burst-out .8s cubic-bezier(.2,.8,.3,1) forwards';
        star.style.animationDelay = (i * 0.04) + 's';
        /* Set the end position via custom transform in the animation */
        star.style.setProperty('--tx', tx + 'px');
        star.style.setProperty('--ty', ty + 'px');
        star.style.setProperty('--rot', rot + 'deg');
        container.appendChild(star);
      });
      /* Clean up */
      setTimeout(function () { if (container.parentNode) container.parentNode.removeChild(container); }, 2160);
      /* Brief warm flash on scene */
      var origBg = scene.style.background;
      scene.style.transition = 'box-shadow .3s';
      scene.style.boxShadow = 'inset 0 0 40px rgba(255,200,50,.3)';
      setTimeout(function () { scene.style.boxShadow = ''; }, 1080);
    }

    /* ── Auto-play animation engine ─────────────────────────────── */

    /**
     * autoAnim — run a sequence of {delay, fn} steps automatically
     * Returns a cancel function. Calls onDone when complete.
     */
    function autoAnim(steps, onDone) {
      var timers = [], cancelled = false;
      var cumulative = 0;
      steps.forEach(function (step) {
        cumulative += (step.delay || 0);
        timers.push(setTimeout(function () { if (!cancelled) step.fn(); }, cumulative));
      });
      if (onDone) timers.push(setTimeout(function () { if (!cancelled) onDone(); }, cumulative + 300));
      return function cancel() { cancelled = true; timers.forEach(clearTimeout); };
    }

    /**
     * addReplay — adds a replay button to a scene
     * playFn should return a cancel function (from autoAnim)
     */
    function addReplay(sceneId, playFn) {
      var scene = el(sceneId); if (!scene || scene._replayBound) return;
      scene._replayBound = true;
      var btn = document.createElement('div');
      btn.className = 'replay-btn-added'; /* marker class so MutationObserver ignores */
      btn.style.cssText = 'position:absolute;bottom:8px;right:8px;font-size:22px;z-index:50;cursor:pointer;opacity:0;transition:opacity .3s;user-select:none';
      btn.textContent = '\ud83d\udd01';
      btn.title = 'Replay';
      scene.appendChild(btn);
      var currentCancel = null;
      function showReplay() { btn.style.opacity = '1'; }
      function play() {
        btn.style.opacity = '0';
        if (currentCancel) currentCancel();
        currentCancel = playFn(showReplay);
      }
      btn.addEventListener('click', function (e) { e.stopPropagation(); play(); });
      /* Auto-play after short delay */
      setTimeout(play, 1440);
    }

    /**
     * animEl — helper to create an absolutely positioned animated element inside a scene
     */
    function animEl(scene, emoji, opts) {
      var d = document.createElement('div');
      d.textContent = emoji;
      d.style.cssText = 'position:absolute;font-size:' + (opts.size || '28px') + ';z-index:' + (opts.z || 3) + ';transition:all ' + (opts.speed || '.5s') + ' cubic-bezier(.34,1.56,.64,1);pointer-events:none;' + (opts.css || '');
      if (opts.top) d.style.top = opts.top;
      if (opts.left) d.style.left = opts.left;
      if (opts.right) d.style.right = opts.right;
      if (opts.bottom) d.style.bottom = opts.bottom;
      if (opts.opacity !== undefined) d.style.opacity = String(opts.opacity);
      if (opts.id) d.id = opts.id;
      scene.appendChild(d);
      return d;
    }

    /* ── T1: tap candle (nothing), match appears, DRAG match to candle ── */
    (function () {
      var candle = el('t1-candle'), taps = 0, lit = false;
      if (!candle || candle._bound) return; candle._bound = true;
      addHint('t1-sim', 'drag', { left: '50%', top: '45%' });
      candle.addEventListener('click', function () {
        if (lit) return;
        taps++; buzz([20]);
        if (taps === 1) {
          msg('t1-msg', '<em>Nothing happened. The candle just sits there. It can\u2019t light itself.</em>');
        } else if (taps >= 2) {
          msg('t1-msg', '<em>Still nothing. Without a source, nothing starts. Look \u2014 a match appeared! Drag it to the candle.</em>');
          var match = el('t1-match'); if (match) match.style.display = '';
          addHint('t1-sim', 'drag', { left: '20%', top: '65%' });
          candle.style.cursor = 'default';
          makeDrag('t1-match', {
            target: 't1-candle',
            threshold: 60,
            trailColor: 'rgba(244,160,32,.5)',
            onHit: function () {
              lit = true;
              var m = el('t1-match'); if (m) { m.style.transition = 'all .3s'; m.style.opacity = '0'; m.style.transform = 'scale(0)'; }
              candle.innerHTML = '\ud83d\udd6f\ufe0f\u2728';
              candle.style.textShadow = '0 0 20px #f4a020, 0 0 40px #f4a020';
              glow('t1-glow'); celebrate('t1-sim');
              if (navigator.vibrate) navigator.vibrate([50, 30, 100]);
              msg('t1-msg', '<strong style="color:#f0c020">\u2728 The match lit the candle! The candle couldn\u2019t start on its own. Something had to come first. That\u2019s C.</strong>');
              setTimeout(function () { quiz('t1-quiz'); }, 2700);
            }
          });
        }
      });
    })();

    /* ── T2: tap soil (nothing), seed appears, DRAG seed into soil ── */
    (function () {
      var soil = el('t2-soil'), taps = 0, planted = false;
      if (!soil || soil._bound) return; soil._bound = true;
      soil.style.cursor = 'pointer';
      addHint('t2-sim', 'drag', { left: '50%', top: '40%' });
      soil.addEventListener('click', function () {
        if (planted) return;
        taps++; buzz([20]);
        if (taps === 1) {
          msg('t2-msg', '<em>Nothing. Just dirt. You can\u2019t grow anything without planting something first.</em>');
        } else if (taps >= 2) {
          msg('t2-msg', '<em>Still nothing. Soil alone can\u2019t produce. Look \u2014 a seed appeared! Drag it into the soil.</em>');
          var seed = el('t2-seed'); if (seed) seed.style.display = '';
          soil.style.cursor = 'default';
          makeDrag('t2-seed', {
            target: 't2-soil',
            threshold: 70,
            trailColor: 'rgba(100,200,100,.5)',
            onHit: function () {
              planted = true;
              var seed = el('t2-seed');
              if (seed) { seed.style.transition = 'all .5s'; seed.style.opacity = '0'; seed.style.transform = 'scale(0.3) translateY(30px)'; }
              var hole = el('t2-hole'); if (hole) hole.style.opacity = '1';
              if (navigator.vibrate) navigator.vibrate([50, 30, 100]);
              setTimeout(function () {
                var plant = el('t2-plant');
                if (plant) plant.style.transform = 'translateX(-50%) scale(1)';
                glow('t2-glow'); celebrate('t2-sim');
                msg('t2-msg', '<strong style="color:#2a7a2a">\ud83c\udf3b It grew! The soil couldn\u2019t do it alone. The seed had to go in first. Something must be given before something comes out. That\u2019s T\u2082.</strong>');
                setTimeout(function () { quiz('t2-quiz'); }, 2700);
              }, 800);
            }
          });
        }
      });
    })();

    /* ── T3: SWIPE tower to knock, DRAG blocks back to rebuild ── */
    (function () {
      var tower = el('t3-tower'), scattered = el('t3-scattered'), phase = 0;
      if (!tower || tower._bound) return; tower._bound = true;
      addHint('t3-sim', 'swipe', { left: '40%', top: '40%' });
      /* Phase 1: swipe tower to knock */
      makeSwipe('t3-tower', {
        trailColor: 'rgba(231,76,60,.4)',
        distance: 60,
        canSwipe: function () { return phase === 0; },
        onProgress: function (p) {
          tower.style.transform = 'translateX(calc(-50% + ' + (p * 30) + 'px)) rotate(' + (p * 15) + 'deg)';
          tower.style.opacity = String(1 - p * 0.5);
        },
        onComplete: function () {
          phase = 1;
          tower.style.transition = 'all .4s'; tower.style.opacity = '0'; tower.style.transform = 'translateX(-50%) scale(0) rotate(25deg)';
          if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
          setTimeout(function () {
            tower.style.display = 'none';
            if (scattered) scattered.style.display = 'block';
            msg('t3-msg', '<em style="opacity:.7">Blocks everywhere! Drag each block to the center to rebuild.</em>');
            /* Phase 2: drag scattered blocks to center — they fly to stack position */
            var put = 0;
            var stackColors = ['#e74c3c','#f39c12','#2ecc71','#3498db'];
            var stackWidths = [60, 52, 44, 36];
            /* Create a growing tower in the center */
            var rebuild = document.createElement('div');
            rebuild.id = 't3-rebuild';
            rebuild.style.cssText = 'position:absolute;bottom:30px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column-reverse;align-items:center;z-index:2';
            scattered.parentNode.appendChild(rebuild);
            ['t3-s1','t3-s2','t3-s3','t3-s4'].forEach(function (id, idx) {
              makeDrag(id, {
                threshold: 40,
                trailColor: stackColors[idx] + '66',
                canDrag: function () { return phase === 1; },
                onHit: function () {
                  var s = el(id); if (!s || s.dataset.done) return;
                  s.dataset.done = '1'; put++;
                  /* Animate block flying to center stack */
                  var simRect = scattered.parentNode.getBoundingClientRect();
                  var targetX = simRect.width / 2 - stackWidths[idx] / 2;
                  var targetY = simRect.height - 30 - (put * 20);
                  s.style.transition = 'all .4s cubic-bezier(.34,1.56,.64,1)';
                  s.style.position = 'absolute';
                  s.style.left = targetX + 'px'; s.style.top = targetY + 'px';
                  s.style.transform = 'rotate(0deg)'; s.style.opacity = '1';
                  s.style.zIndex = ''; s.style.cursor = 'default';
                  buzz([15]);
                  msg('t3-msg', '<em>' + put + '/4 blocks placed! ' + (put < 4 ? 'Drag the next one.' : '') + '</em>');
                  if (put >= 4) {
                    setTimeout(function () {
                      if (scattered) scattered.style.display = 'none';
                      var rb = el('t3-rebuild'); if (rb) rb.style.display = 'none';
                      tower.style.display = ''; tower.style.transition = 'all .6s cubic-bezier(.34,1.56,.64,1)';
                      tower.style.opacity = '1'; tower.style.transform = 'translateX(-50%) scale(1)';
                      glow('t3-glow'); buzz([30, 50, 30]); celebrate('t3-sim');
                      msg('t3-msg', '<strong style="color:#b8860b">\u2728 The tower is back! Same blocks, same tower. C was always in the pieces. You just had to put them back. That\u2019s recovery.</strong>');
                      setTimeout(function () { quiz('t3-quiz'); }, 2700);
                    }, 500);
                  }
                }
              });
            });
          }, 400);
        },
        onCancel: function () {
          tower.style.transition = 'all .3s cubic-bezier(.68,-.55,.27,1.55)';
          tower.style.transform = 'translateX(-50%)'; tower.style.opacity = '1';
        }
      });
    })();

    /* ── T4: DRAG flame from source to each unlit candle ── */
    (function () {
      var source = el('t4-source'); if (!source || source._bound) return; source._bound = true;
      var lit = 0;
      addHint('t4-sim', 'drag', { left: '22%', top: '50%' });
      /* Make source candle draggable — a "flame ghost" follows your finger */
      var sx, sy, active = false;
      source.style.touchAction = 'none'; source.style.cursor = 'grab'; source.style.userSelect = 'none';
      function start(e) {
        if (lit >= 3) return;
        e.preventDefault(); var t = e.touches ? e.touches[0] : e;
        sx = t.clientX; sy = t.clientY; active = true;
        source.style.transition = 'none';
      }
      function move(e) {
        if (!active) return; e.preventDefault();
        var t = e.touches ? e.touches[0] : e;
        /* Source doesn't move — but a glow trail follows the finger */
        var dx = t.clientX - sx, dy = t.clientY - sy;
        maybeTrail(t.clientX, t.clientY, 'rgba(255,200,50,.6)');
        source.style.filter = 'brightness(1.3)';
        source.style.textShadow = '0 0 25px rgba(255,200,50,.8), ' + dx + 'px ' + dy + 'px 40px rgba(255,200,50,.3)';
      }
      function end(e) {
        if (!active) return; active = false;
        source.style.transition = 'all .3s'; source.style.filter = ''; source.style.textShadow = '0 0 15px rgba(255,200,50,.6)';
        var t = e.changedTouches ? e.changedTouches[0] : e;
        /* Check if dropped on any unlit candle */
        ['t4-c1','t4-c2','t4-c3'].forEach(function (id) {
          var c = el(id); if (!c || c.dataset.lit) return;
          var r = c.getBoundingClientRect();
          if (t.clientX >= r.left - 10 && t.clientX <= r.right + 10 && t.clientY >= r.top - 10 && t.clientY <= r.bottom + 10) {
            c.dataset.lit = '1'; lit++; buzz([30, 50, 30]);
            c.style.opacity = '1'; c.style.filter = 'none'; c.style.textShadow = '0 0 15px rgba(255,200,50,.6)';
            var glowEl = el('t4-glow');
            if (glowEl) { glowEl.style.background = 'rgba(255,200,50,' + (0.3 + lit * 0.15) + ')'; glowEl.style.mixBlendMode = 'soft-light'; }
            if (lit === 1) msg('t4-msg', '<em>One candle lit! Is YOUR candle any dimmer? Drag your flame to another.</em>');
            else if (lit === 2) msg('t4-msg', '<em>Two candles lit! Your flame is still the same. One more.</em>');
            else if (lit >= 3) {
              celebrate('t4-sim');
              msg('t4-msg', '<strong style="color:#f0c020">\u2728 Three candles lit from yours. The room is bright. And your candle? Still burning exactly the same. You gave your flame three times and lost nothing. That\u2019s C.</strong>');
              setTimeout(function () { quiz('t4-quiz'); }, 3240);
            }
          }
        });
      }
      source.addEventListener('mousedown', start); source.addEventListener('touchstart', start, { passive: false });
      document.addEventListener('mousemove', move); document.addEventListener('touchmove', move, { passive: false });
      document.addEventListener('mouseup', end); document.addEventListener('touchend', end);
    })();

    /* ── T5: chair — sit without testing ── */
    (function () {
      var chair = el('t5-chair'); if (!chair || chair._bound) return; chair._bound = true;
      var sat = false;
      addHint('t5-sim', 'drag', { left: '50%', top: '55%' });
      chair.addEventListener('click', function () {
        if (sat) return; sat = true; buzz([20]);
        var person = el('t5-person');
        if (person) { person.style.opacity = '1'; person.style.bottom = '75px'; }
        chair.style.transform = 'translateX(-50%) scale(1.05)';
        glow('t5-glow'); celebrate('t5-sim');
        msg('t5-msg', '<strong style="color:#2a7a2a">\ud83e\ude91 You sat down without testing it. You didn\u2019t bounce on it first or check the legs. You just trusted it would hold you. That\u2019s faith \u2014 acting before you have proof.</strong>');
        setTimeout(function () { quiz('t5-quiz'); }, 2700);
      });
    })();

    /* ── T6: tap to plant, HOLD to wait for growth ── */
    (function () {
      var phase = 0; /* 0=plant, 1=holding, 2=done */
      var tap = el('t6-tap'); if (!tap || tap._bound) return; tap._bound = true;
      addHint('t6-sim', 'hold', { left: '50%', top: '50%' });
      /* Phase 1: tap to plant */
      tap.addEventListener('click', function () {
        if (phase !== 0) return;
        phase = 1; buzz([15]);
        var seed = el('t6-seed'); if (seed) { seed.style.opacity = '1'; seed.style.bottom = '45px'; }
        var day = el('t6-day'); if (day) day.textContent = 'Day 1\u2026';
        msg('t6-msg', '<em>You planted the seed. Now hold your finger down on the soil and wait\u2026</em>');
        /* Phase 2: hold to grow */
        makeHold('t6-tap', {
          duration: 2500,
          canHold: function () { return phase === 1; },
          onProgress: function (p) {
            var seed = el('t6-seed'), day = el('t6-day');
            if (p < 0.33) {
              if (day) day.textContent = 'Day 1\u2026';
              if (seed) seed.style.opacity = String(1 - p);
            } else if (p < 0.66) {
              if (day) day.textContent = 'Day 2\u2026 nothing yet.';
              if (seed) seed.style.opacity = String(0.5 - p * 0.3);
              msg('t6-msg', '<em>Still nothing visible. But something is happening underground\u2026 keep holding\u2026</em>');
            } else {
              if (day) day.textContent = 'Day 3\u2026 almost\u2026';
              if (seed) seed.style.opacity = '0.1';
              msg('t6-msg', '<em>Almost\u2026 don\u2019t let go\u2026</em>');
            }
            /* Soil subtly warms as you hold */
            var sim = el('t6-sim');
            if (sim) sim.style.background = 'linear-gradient(180deg,#1a1a2e 0%,#2d1b0e ' + (60 - p * 20) + '%,#3e2723 100%)';
          },
          onComplete: function () {
            phase = 2;
            var seed = el('t6-seed'), day = el('t6-day'), sprout = el('t6-sprout');
            if (seed) seed.style.opacity = '0';
            if (day) { day.textContent = '\ud83c\udf3f Sprouted!'; day.style.color = '#66bb6a'; }
            if (sprout) sprout.style.transform = 'translateX(-50%) scale(1)';
            glow('t6-glow'); celebrate('t6-sim');
            msg('t6-msg', '<strong style="color:#2a7a2a">\ud83c\udf3f It grew! You held on while nothing was visible. You KNEW it would come because you planted it. That\u2019s hope \u2014 not wishing, knowing.</strong>');
            setTimeout(function () { quiz('t6-quiz'); }, 2700);
          },
          onCancel: function () {
            msg('t6-msg', '<em>You let go too early! The seed needs your patience. Hold down again\u2026</em>');
          }
        });
      });
    })();

    /* ── T8: SWIPE darkness away (like wiping a foggy window) ── */
    (function () {
      var sim = el('t8-sim'); if (!sim || sim._swipeBound) return;
      var done = false;
      addHint('t8-sim', 'swipe', { left: '30%', top: '45%' });
      makeSwipe('t8-sim', {
        trailColor: 'rgba(255,240,150,.5)',
        distance: 100,
        canSwipe: function () { return !done; },
        onProgress: function (p) {
          /* Shadows fade as you swipe, light brightens */
          ['t8-shadow1','t8-shadow2','t8-shadow3'].forEach(function (id) {
            var s = el(id); if (s) { s.style.opacity = String(0.6 * (1 - p)); s.style.transform = 'scale(' + (1 - p * 0.5) + ')'; }
          });
          var light = el('t8-light');
          if (light) light.style.filter = 'brightness(' + (0.4 + p * 0.6) + ')';
          sim.style.background = 'linear-gradient(180deg,hsl(240,' + Math.round(30 - p * 15) + '%,' + Math.round(5 + p * 15) + '%) 0%,hsl(260,' + Math.round(25 - p * 10) + '%,' + Math.round(10 + p * 15) + '%) 100%)';
        },
        onComplete: function () {
          done = true;
          var light = el('t8-light');
          if (light) { light.style.filter = 'brightness(1)'; light.style.transform = 'translateX(-50%) scale(1.2)'; }
          glow('t8-glow'); celebrate('t8-sim');
          sim.style.transition = 'background 1s';
          sim.style.background = 'linear-gradient(180deg,#2a2a4e 0%,#3d3560 100%)';
          ['t8-shadow1','t8-shadow2','t8-shadow3'].forEach(function (id) {
            var s = el(id); if (s) { s.style.transition = 'all .5s'; s.style.opacity = '0'; s.style.transform = 'scale(0)'; }
          });
          msg('t8-msg', '<strong style="color:#b8860b">\ud83d\udca1 One swipe and ALL the shadows vanished! Darkness can\u2019t fight light \u2014 it just disappears. That\u2019s C.</strong>');
          setTimeout(function () { quiz('t8-quiz'); }, 2700);
        },
        onCancel: function () {
          /* Snap shadows back */
          ['t8-shadow1','t8-shadow2','t8-shadow3'].forEach(function (id, i) {
            var s = el(id); if (s) { s.style.transition = 'all .3s'; s.style.opacity = String([0.6, 0.5, 0.7][i]); s.style.transform = 'scale(1)'; }
          });
          var light = el('t8-light');
          if (light) { light.style.transition = 'all .3s'; light.style.filter = 'brightness(.4)'; }
        }
      });
    })();

    /* ── T9: Interactive — tap doors to interview witnesses ── */
    (function () {
      var opened = 0, matches = 0;
      var rooms = [
        { door: 't9-door1', inside: 't9-inside1', say: 't9-say1', answer: '"Emma drew it!"', witness: true },
        { door: 't9-door2', inside: 't9-inside2', say: 't9-say2', answer: '\ud83e\udd37 "I wasn\u2019t there"', witness: false },
        { door: 't9-door3', inside: 't9-inside3', say: 't9-say3', answer: '"It was Emma!"', witness: true }
      ];
      addHint('t9-sim', 'drag', { left: '18%', top: '50%' });
      rooms.forEach(function (r) {
        var door = el(r.door); if (!door || door._bound) return; door._bound = true;
        door.style.cursor = 'pointer';
        door.addEventListener('click', function () {
          if (door.dataset.opened) return; door.dataset.opened = '1'; opened++;
          buzz([20]);
          /* Open door — change background, show person inside */
          door.style.background = 'linear-gradient(180deg,#f5eedf,#ede3d0)';
          door.style.boxShadow = 'inset 0 2px 8px rgba(0,0,0,.1)';
          /* Hide door emoji, show inside */
          door.querySelector('div').style.display = 'none'; /* hide door emoji */
          door.querySelector('div:nth-child(2)').style.display = 'none'; /* hide "Room X" */
          var inside = el(r.inside); if (inside) inside.style.display = '';
          var say = el(r.say); if (say) say.textContent = r.answer;
          if (r.witness) {
            matches++;
            door.style.borderColor = '#4caf50';
            door.style.border = '2px solid #4caf50';
          } else {
            door.style.opacity = '0.5';
          }
          var meter = el('t9-meter');
          if (matches === 0) {
            if (meter) { meter.textContent = '\ud83e\udd14 No matching witnesses yet'; meter.style.color = '#999'; }
            msg('t9-msg', '<em>That person wasn\u2019t there. Open another door!</em>');
          } else if (matches === 1) {
            if (meter) { meter.textContent = '\ud83e\udd14 One witness\u2026 maybe?'; meter.style.color = '#f0a020'; }
            msg('t9-msg', '<em>One person says "Emma." But is one enough? They\u2019re in separate rooms \u2014 open another door.</em>');
          }
          if (matches >= 2) {
            if (meter) { meter.textContent = '\u2705 Two witnesses agree \u2014 established!'; meter.style.color = '#2a7a2a'; meter.style.transform = 'translateX(-50%) scale(1.05)'; }
            celebrate('t9-sim');
            msg('t9-msg', '<strong style="color:#2a7a2a">\u2705 Two people in SEPARATE rooms both said "Emma" \u2014 they couldn\u2019t hear each other! When two independent witnesses agree, now you know.</strong>');
            setTimeout(function () { quiz('t9-quiz'); }, 3240);
          }
        });
      });
    })();

    /* ── T10: DRAG dead branches DOWN to snap them off ── */
    (function () {
      var pruned = 0, dead = ['t10-b2','t10-b3','t10-b5'];
      addHint('t10-sim', 'drag', { left: '35%', top: '35%' });
      dead.forEach(function (id) {
        var b = el(id); if (!b || b._dragBound) return; b._dragBound = true;
        b.style.touchAction = 'none'; b.style.cursor = 'grab'; b.style.userSelect = 'none';
        var sx, sy, active = false;
        function start(e) {
          if (b.dataset.pruned) return;
          e.preventDefault(); var t = e.touches ? e.touches[0] : e;
          sx = t.clientX; sy = t.clientY; active = true;
          b.style.transition = 'none';
        }
        function move(e) {
          if (!active) return; e.preventDefault();
          var t = e.touches ? e.touches[0] : e;
          var dy = t.clientY - sy;
          if (dy < 0) dy = dy * 0.2; /* resist upward */
          var dx = (t.clientX - sx) * 0.3; /* slight lateral sway */
          /* Branch bends as you pull down — rotation increases */
          var bend = Math.min(25, dy * 0.4);
          b.style.transform = 'translate(' + dx + 'px,' + dy + 'px) rotate(' + bend + 'deg)';
          /* Progressive crack: opacity dims as it's about to snap */
          if (dy > 30) b.style.filter = 'grayscale(1) opacity(' + Math.max(0.2, 0.6 - (dy - 30) / 100) + ')';
          maybeTrail(t.clientX, t.clientY, 'rgba(139,90,43,.4)');
        }
        function end(e) {
          if (!active) return; active = false;
          var t = e.changedTouches ? e.changedTouches[0] : e;
          var dy = t.clientY - sy;
          if (dy > 50) {
            /* SNAP! Branch breaks off and tumbles down */
            b.dataset.pruned = '1'; pruned++;
            buzz([40, 20, 60]); /* crack sound feel */
            b.style.transition = 'all .5s cubic-bezier(.2,.8,.3,1)';
            b.style.transform = 'translateY(120px) rotate(60deg)';
            b.style.opacity = '0';
            if (pruned >= dead.length) {
              setTimeout(function () {
                ['t10-b1','t10-b4'].forEach(function (gid) {
                  var g = el(gid); if (g) { g.style.transition = 'all .6s cubic-bezier(.34,1.56,.64,1)'; g.style.transform = 'scale(1.3)'; }
                });
                celebrate('t10-sim');
                msg('t10-msg', '<strong style="color:#2a7a2a">\u2702\ufe0f Sock, fish, shoe \u2014 gone! Now only real fruit is left. You removed what doesn\u2019t belong, and the tree is better for it. That\u2019s pruning.</strong>');
                setTimeout(function () { quiz('t10-quiz'); }, 2700);
              }, 400);
            } else {
              msg('t10-msg', '<em>Got ' + pruned + '/' + dead.length + '! That doesn\u2019t belong on a tree. Pull off the rest!</em>');
            }
          } else {
            /* Snap back — didn't pull hard enough */
            b.style.transition = 'all .4s cubic-bezier(.68,-.55,.27,1.55)';
            b.style.transform = ''; b.style.filter = 'grayscale(1) opacity(.6)';
            if (dy > 10 && dy <= 50) msg('t10-msg', '<em>Pull harder! Grab it and drag it down to pull it off the tree.</em>');
          }
        }
        b.addEventListener('mousedown', start); b.addEventListener('touchstart', start, { passive: false });
        document.addEventListener('mousemove', move); document.addEventListener('touchmove', move, { passive: false });
        document.addEventListener('mouseup', end); document.addEventListener('touchend', end);
      });
    })();

    /* ── T11: drag warning to student, then to yourself ── */
    (function () {
      var warn = el('t11-warn'); if (!warn) return;
      var phase = 0; /* 0=drag to student, 1=drag to self, 2=done */
      addHint('t11-sim', 'drag', { left: '50%', top: '70%' });
      /* Custom two-phase drag — not using makeDrag because we need different targets per phase */
      var sx, sy, active = false;
      warn.style.touchAction = 'none'; warn.style.cursor = 'grab'; warn.style.userSelect = 'none';
      function start(e) {
        if (phase >= 2) return;
        e.preventDefault(); var t = e.touches ? e.touches[0] : e;
        sx = t.clientX; sy = t.clientY; active = true;
        warn.style.transition = 'none'; warn.style.zIndex = '20';
      }
      function move(e) {
        if (!active) return; e.preventDefault();
        var t = e.touches ? e.touches[0] : e;
        warn.style.transform = 'translate(' + (t.clientX - sx) + 'px,' + (t.clientY - sy) + 'px)';
        maybeTrail(t.clientX, t.clientY, 'rgba(255,180,50,.4)');
      }
      function end(e) {
        if (!active) return; active = false;
        var t = e.changedTouches ? e.changedTouches[0] : e;
        var student = el('t11-student'), teacher = el('t11-teacher');
        if (phase === 0 && student) {
          var sr = student.getBoundingClientRect();
          if (t.clientX >= sr.left - 15 && t.clientX <= sr.right + 15 && t.clientY >= sr.top - 15 && t.clientY <= sr.bottom + 15) {
            phase = 1; buzz([30, 50, 30]);
            var badge1 = el('t11-badge1'); if (badge1) { badge1.textContent = '\u26a0\ufe0f'; badge1.style.opacity = '1'; }
            /* Reset warning back to center */
            warn.style.transition = 'all .4s cubic-bezier(.68,-.55,.27,1.55)';
            warn.style.transform = 'translateX(-50%)'; warn.style.zIndex = '4';
            /* Now YOU are also late */
            var youLate = el('t11-you-late'); if (youLate) youLate.style.opacity = '1';
            msg('t11-msg', '<em>You warned the student. But now YOU\u2019RE late too! Same rule? Drag the warning \u26a0\ufe0f to yourself.</em>');
            return;
          }
        }
        if (phase === 1 && teacher) {
          var tr = teacher.getBoundingClientRect();
          if (t.clientX >= tr.left - 15 && t.clientX <= tr.right + 15 && t.clientY >= tr.top - 15 && t.clientY <= tr.bottom + 15) {
            phase = 2; buzz([30, 50, 30]);
            var badge2 = el('t11-badge2'); if (badge2) { badge2.textContent = '\u26a0\ufe0f'; badge2.style.opacity = '1'; }
            warn.style.transition = 'all .3s'; warn.style.opacity = '0';
            glow('t11-glow'); celebrate('t11-sim');
            msg('t11-msg', '<strong style="color:#2a7a2a">\u2705 Same warning for both! You didn\u2019t let yourself off the hook. The same rule applies to everyone \u2014 including you. That\u2019s fair.</strong>');
            setTimeout(function () { quiz('t11-quiz'); }, 2700);
            return;
          }
        }
        /* Snap back */
        warn.style.transition = 'all .4s cubic-bezier(.68,-.55,.27,1.55)';
        warn.style.transform = 'translateX(-50%)'; warn.style.zIndex = '4';
      }
      warn.addEventListener('mousedown', start); warn.addEventListener('touchstart', start, { passive: false });
      document.addEventListener('mousemove', move); document.addEventListener('touchmove', move, { passive: false });
      document.addEventListener('mouseup', end); document.addEventListener('touchend', end);
    })();

    /* ── T12: Two houses — TAP each to drop. Sand sinks, rock holds. ── */
    (function () {
      addHint('t12-sim', 'drag', { left: '25%', top: '25%' });
      var dropped = 0;
      function tapHouse(id, sinks) {
        var h = el(id); if (!h || h._bound) return; h._bound = true;
        h.style.cursor = 'pointer';
        h.addEventListener('click', function () {
          if (h.dataset.dropped) return; h.dataset.dropped = '1'; dropped++;
          buzz(sinks ? [50, 30, 50] : [30, 50, 30]);
          /* House falls to ground level (280px scene - 55px ground - 56px house = 169px) */
          h.style.transition = 'all .6s cubic-bezier(.2,.8,.3,1)';
          h.style.top = '168px'; h.style.cursor = 'default';
          if (sinks) {
            /* Sinks into sand */
            setTimeout(function () {
              h.style.transition = 'all 1.5s ease-in';
              h.style.top = '250px';
              h.style.transform = 'translateX(-50%) rotate(15deg)';
              h.style.opacity = '0.15'; h.style.filter = 'grayscale(0.5)';
              if (navigator.vibrate) navigator.vibrate([50, 30, 80]);
              msg('t12-msg', '<em style="color:#ff6b6b">\ud83d\udca8 It sank! Sand swallowed the house. Now tap the other one on the rock.</em>');
            }, 700);
          } else {
            /* Holds on rock — bounces into place */
            setTimeout(function () {
              h.style.transition = 'all .4s cubic-bezier(.34,1.56,.64,1)';
              h.style.top = '165px';
            }, 600);
          }
          /* Check completion */
          if (dropped >= 2) {
            setTimeout(function () {
              glow('t12-glow'); celebrate('t12-sim');
              msg('t12-msg', '<strong style="color:#2a7a2a">\ud83e\udea8 Same house, different ground. Sand swallowed one, rock held the other. There\u2019s only one real foundation \u2014 that\u2019s C.</strong>');
              setTimeout(function () { quiz('t12-quiz'); }, 3240);
            }, 1200);
          }
        });
      }
      tapHouse('t12-sand-house', true);
      tapHouse('t12-rock-house', false);
    })();

    /* ══════════════════════════════════════════════════════════════
       BODY PAGES — Auto-play animations with replay
       Each shows the concept visually, then reveals the quiz.
       ══════════════════════════════════════════════════════════════ */

    /* ── EAR: message passes through unchanged vs edited ── */
    (function () {
      addReplay('ear-sim', function (done) {
        var orig = el('ear-msg-original'), pw = el('ear-path-wrong'), pr = el('ear-path-right');
        var rw = el('ear-result-wrong'), rr = el('ear-result-right');
        if (!orig) return;
        /* reset */
        [orig, pw, pr, rw, rr].forEach(function (e) { if (e) { e.style.opacity = '0'; e.style.transform = ''; } });
        return autoAnim([
          { delay: 300, fn: function () { if (orig) { orig.style.transition = 'all .5s'; orig.style.opacity = '1'; } } },
          { delay: 800, fn: function () { msg('ear-msg', '<em>"My cat is gray" \u2014 what happens next?</em>'); } },
          { delay: 600, fn: function () { if (pw) { pw.style.transition = 'all .5s'; pw.style.opacity = '1'; } } },
          { delay: 800, fn: function () { if (rw) { rw.style.transition = 'all .4s'; rw.style.opacity = '1'; } msg('ear-msg', '<em style="color:#c44">\u274c Someone changed "gray" to "white" \u2014 that\u2019s not what was said!</em>'); } },
          { delay: 1000, fn: function () { if (pr) { pr.style.transition = 'all .5s'; pr.style.opacity = '1'; } } },
          { delay: 800, fn: function () { if (rr) { rr.style.transition = 'all .4s'; rr.style.opacity = '1'; } msg('ear-msg', '<strong style="color:#2a7a2a">\u2705 Passed through as "gray" \u2014 unchanged! The EAR listens and passes it along exactly.</strong>'); celebrate('ear-sim'); } },
          { delay: 1200, fn: function () { quiz('ear-quiz'); done(); } }
        ]);
      });
    })();

    /* ── NOSE: real messages vs copycat vs faker ── */
    (function () {
      addReplay('nose-sim', function (done) {
        var lines = ['nose-line1','nose-line2','nose-line3','nose-line4','nose-line5'];
        var results = ['nose-r1','nose-r2','nose-r3','nose-r4','nose-r5'];
        lines.concat(results).forEach(function (id) { var e = el(id); if (e) { e.style.opacity = '0'; e.style.transform = ''; } });
        var isBad = [false, true, false, true, false]; /* line2=parrot, line4=faker */
        var steps = [];
        lines.forEach(function (id, i) {
          steps.push({ delay: i === 0 ? 400 : 700, fn: function () {
            var e = el(id); if (e) { e.style.transition = 'all .4s'; e.style.opacity = '1'; }
          }});
          steps.push({ delay: 500, fn: function () {
            var r = el(results[i]); if (!r) return;
            r.style.transition = 'all .3s'; r.style.opacity = '1';
            if (isBad[i]) {
              r.textContent = '\u274c'; r.style.color = '#c44';
              var e = el(id); if (e) { e.style.transition = 'all .5s'; e.style.transform = 'translateX(100px)'; e.style.opacity = '0.2'; }
            } else {
              r.textContent = '\u2705'; r.style.color = '#2a7a2a';
            }
          }});
        });
        steps.push({ delay: 600, fn: function () {
          msg('nose-msg', '<strong style="color:#2a7a2a">\u2705 The parrot \ud83e\udd9c just copied. The faker \ud83c\udfad pretended. The NOSE catches both \u2014 loops and fakes.</strong>');
          celebrate('nose-sim');
        }});
        steps.push({ delay: 1200, fn: function () { quiz('nose-quiz'); done(); } });
        return autoAnim(steps);
      });
    })();

    /* ── TEMPERANCE: 3 scenes — different moment, different response ── */
    (function () {
      addReplay('temp-sim', function (done) {
        var scene = el('temp-scene'), response = el('temp-response'), check = el('temp-check'), counter = el('temp-counter');
        if (!scene) return;
        var scenarios = [
          { emoji: '\ud83d\ude22', sit: 'Friend is crying', resp: '\ud83e\udd17 Hug', color: '#e8f5e9' },
          { emoji: '\ud83c\udf89', sit: 'Friend won a prize!', resp: '\ud83e\udd73 Celebrate!', color: '#fff8e1' },
          { emoji: '\ud83d\udcda', sit: 'Friend is studying', resp: '\ud83e\udd2b Be quiet', color: '#e3f2fd' }
        ];
        /* reset */
        [scene, response, check].forEach(function (e) { if (e) { e.style.opacity = '0'; e.style.transform = ''; } });
        if (counter) { counter.textContent = ''; counter.style.opacity = '1'; }
        var steps = [];
        scenarios.forEach(function (s, i) {
          /* fade out previous scene before showing next */
          if (i > 0) {
            steps.push({ delay: 600, fn: function () {
              if (scene) { scene.style.transition = 'opacity .3s'; scene.style.opacity = '0'; }
              if (response) { response.style.transition = 'opacity .3s'; response.style.opacity = '0'; }
              if (check) { check.style.transition = 'opacity .3s'; check.style.opacity = '0'; }
            }});
          }
          steps.push({ delay: i === 0 ? 400 : 500, fn: function () {
            if (counter) { counter.style.transition = 'all .3s'; counter.textContent = (i + 1) + '/3'; }
            var sim = el('temp-sim'); if (sim) { sim.style.transition = 'background .6s ease'; sim.style.background = 'linear-gradient(180deg,' + s.color + ' 0%,#f5f0e8 100%)'; }
            if (scene) { scene.style.transition = 'all .5s'; scene.style.opacity = '1'; scene.textContent = s.emoji + ' ' + s.sit; }
          }});
          steps.push({ delay: 700, fn: function () {
            if (response) { response.style.transition = 'all .4s'; response.style.opacity = '1'; response.textContent = s.resp; }
          }});
          steps.push({ delay: 500, fn: function () {
            if (check) { check.style.transition = 'all .3s'; check.style.opacity = '1'; check.textContent = '\u2705'; }
            msg('temp-msg', '<em>\u2705 ' + s.sit + ' \u2192 ' + s.resp + '</em>');
          }});
        });
        steps.push({ delay: 800, fn: function () {
          msg('temp-msg', '<strong style="color:#2a7a2a">\u2705 Three moments, three different responses. The right answer CHANGED each time. That\u2019s temperance \u2014 reading the room.</strong>');
          celebrate('temp-sim');
        }});
        steps.push({ delay: 1200, fn: function () { quiz('temp-quiz'); done(); } });
        return autoAnim(steps);
      });
    })();

    /* ── PATIENCE: letters appear, early guess fails, full word succeeds ── */
    (function () {
      addReplay('pat-sim', function (done) {
        var word = el('pat-word'), guess = el('pat-guess'), result = el('pat-result');
        if (!word) return;
        /* reset */
        if (word) { word.textContent = ''; word.style.opacity = '1'; word.style.transform = 'translateX(-50%)'; word.style.textShadow = 'none'; }
        if (guess) { guess.style.opacity = '0'; guess.style.transform = 'translateX(-50%)'; }
        if (result) { result.style.opacity = '0'; }
        var letters = 'PATIENCE';
        var steps = [];
        /* Letters appear one by one with scale pop */
        for (var i = 0; i < letters.length; i++) {
          (function (idx) {
            steps.push({ delay: idx === 0 ? 400 : 350, fn: function () {
              if (word) {
                word.textContent = letters.substring(0, idx + 1);
                /* brief scale pop on each new letter */
                word.style.transition = 'transform .15s cubic-bezier(.34,1.56,.64,1)';
                word.style.transform = 'translateX(-50%) scale(1.15)';
                setTimeout(function () { if (word) { word.style.transform = 'translateX(-50%) scale(1)'; } }, 150);
              }
            }});
          })(i);
          /* After 3 letters, someone guesses too early */
          if (i === 2) {
            steps.push({ delay: 300, fn: function () {
              if (guess) {
                guess.style.transition = 'all .3s';
                guess.style.opacity = '1';
                guess.textContent = '"PAT!" \ud83d\ude2c';
                /* shake side to side */
                guess.style.animation = 'none';
                setTimeout(function () {
                  if (guess) {
                    guess.style.transition = 'none';
                    var shakes = [6, -6, 5, -5, 3, -3, 0];
                    shakes.forEach(function (px, si) {
                      setTimeout(function () { if (guess) guess.style.transform = 'translateX(calc(-50% + ' + px + 'px))'; }, si * 60);
                    });
                  }
                }, 50);
              }
              if (result) { result.style.transition = 'all .3s'; result.style.opacity = '1'; result.textContent = '\u274c Too early!'; result.style.color = '#c44'; }
              msg('pat-msg', '<em style="color:#c44">\u274c "PAT"? Wrong! The word isn\u2019t finished yet.</em>');
            }});
            steps.push({ delay: 900, fn: function () {
              if (guess) { guess.style.transition = 'opacity .3s'; guess.style.opacity = '0'; }
              if (result) { result.style.transition = 'opacity .3s'; result.style.opacity = '0'; }
            }});
          }
        }
        /* Full word complete — golden glow reveal */
        steps.push({ delay: 500, fn: function () {
          if (word) {
            word.style.transition = 'all .5s cubic-bezier(.34,1.56,.64,1)';
            word.style.transform = 'translateX(-50%) scale(1.15)';
            word.style.textShadow = '0 0 12px rgba(218,165,32,.6), 0 0 24px rgba(218,165,32,.3)';
          }
          if (result) { result.style.transition = 'all .4s'; result.style.opacity = '1'; result.textContent = '\u2705 PATIENCE!'; result.style.color = '#2a7a2a'; }
          msg('pat-msg', '<strong style="color:#2a7a2a">\u2705 The full word is PATIENCE. Waiting for the whole picture before answering \u2014 that\u2019s what patience means.</strong>');
          celebrate('pat-sim');
        }});
        steps.push({ delay: 1200, fn: function () { quiz('pat-quiz'); done(); } });
        return autoAnim(steps);
      });
    })();

    /* ── GODLINESS: items approach lunchbox — food slides in, junk bounces off ── */
    (function () {
      addReplay('god-sim', function (done) {
        var box = el('god-box'), item = el('god-item'), check = el('god-check');
        if (!item) return;
        var items = [
          { emoji: '\ud83c\udf4e', name: 'Apple', match: true },
          { emoji: '\ud83e\udea8', name: 'Rock', match: false },
          { emoji: '\ud83e\udd6a', name: 'Sandwich', match: true },
          { emoji: '\ud83d\udd8d\ufe0f', name: 'Crayon', match: false },
          { emoji: '\ud83e\uddc3', name: 'Juice', match: true }
        ];
        /* reset */
        if (item) { item.style.opacity = '0'; item.style.left = '-15%'; item.style.transform = 'translateY(-50%)'; }
        if (check) { check.style.opacity = '0'; }
        var steps = [];
        items.forEach(function (it, i) {
          /* item appears on the left */
          steps.push({ delay: i === 0 ? 400 : 500, fn: function () {
            if (item) { item.style.transition = 'none'; item.style.left = '-10%'; item.style.opacity = '1'; item.textContent = it.emoji; item.style.transform = 'translateY(-50%)'; }
            if (check) { check.style.opacity = '0'; }
            msg('god-msg', '<em>' + it.emoji + ' ' + it.name + ' approaches the lunchbox...</em>');
          }});
          /* slide toward lunchbox center */
          steps.push({ delay: 250, fn: function () {
            if (item) { item.style.transition = 'all .5s ease'; item.style.left = '38%'; }
          }});
          if (it.match) {
            /* food: slide INTO lunchbox (shrink into it) + checkmark */
            steps.push({ delay: 550, fn: function () {
              if (item) { item.style.transition = 'all .35s ease-in'; item.style.left = '46%'; item.style.transform = 'translateY(-50%) scale(0.3)'; item.style.opacity = '0'; }
              if (check) { check.style.transition = 'all .3s'; check.style.opacity = '1'; check.textContent = '\u2705'; check.style.color = '#2a7a2a'; }
              if (box) { box.style.transition = 'transform .2s'; box.style.transform = 'translate(-50%,-50%) scale(1.1)'; setTimeout(function () { if (box) box.style.transform = 'translate(-50%,-50%) scale(1)'; }, 200); }
            }});
          } else {
            /* non-food: bounce off and fly away to the right */
            steps.push({ delay: 550, fn: function () {
              if (item) { item.style.transition = 'all .4s cubic-bezier(.5,-.3,.7,.3)'; item.style.left = '110%'; item.style.transform = 'translateY(-50%) rotate(30deg)'; item.style.opacity = '0.2'; }
              if (check) { check.style.transition = 'all .3s'; check.style.opacity = '1'; check.textContent = '\u274c'; check.style.color = '#c44'; }
              if (box) { box.style.transition = 'transform .15s'; box.style.transform = 'translate(-50%,-50%) scale(0.95)'; setTimeout(function () { if (box) box.style.transform = 'translate(-50%,-50%) scale(1)'; }, 150); }
            }});
          }
        });
        steps.push({ delay: 600, fn: function () {
          msg('god-msg', '<strong style="color:#2a7a2a">\u2705 Food slides in, junk bounces off. Only what matches goes through. That\u2019s Godliness \u2014 the lunchbox checks everything.</strong>');
          celebrate('god-sim');
        }});
        steps.push({ delay: 1200, fn: function () { quiz('god-quiz'); done(); } });
        return autoAnim(steps);
      });
    })();

    /* heart animation removed — merged into head page */

    /* ── HEAD: ingredients fly to center, poof → burger ── */
    (function () {
      addReplay('head-sim', function (done) {
        var ingredients = ['head-i1','head-i2','head-i3','head-i4'];
        var center = el('head-center');
        /* reset — all off-screen */
        ingredients.forEach(function (id, i) {
          var e = el(id); if (e) {
            e.style.transition = 'none'; e.style.opacity = '0'; e.style.transform = '';
            if (i % 2 === 0) { e.style.left = '-15%'; e.style.right = ''; }
            else { e.style.right = '-15%'; e.style.left = ''; }
          }
        });
        if (center) { center.style.transition = 'none'; center.style.opacity = '0'; center.style.transform = 'translateX(-50%) scale(0)'; }
        var emojis = ['\ud83c\udf5e', '\ud83e\udd6c', '\ud83e\udd69', '\ud83e\uddc0'];
        var steps = [];
        /* Each ingredient flies in to center then shrinks away */
        ingredients.forEach(function (id, i) {
          steps.push({ delay: i === 0 ? 500 : 600, fn: function () {
            var e = el(id); if (e) {
              e.style.transition = 'all .5s cubic-bezier(.34,1.56,.64,1)';
              e.style.opacity = '1';
              /* Fly to center */
              e.style.left = '42%'; e.style.right = '';
              e.style.top = '55px';
            }
            msg('head-msg', '<em>' + emojis[i] + ' goes in\u2026</em>');
          }});
          steps.push({ delay: 400, fn: function () {
            var e = el(id); if (e) { e.style.transition = 'all .2s'; e.style.opacity = '0'; e.style.transform = 'scale(0)'; }
          }});
        });
        /* Poof — burger appears! */
        steps.push({ delay: 400, fn: function () {
          if (center) { center.style.transition = 'all .5s cubic-bezier(.34,1.56,.64,1)'; center.style.opacity = '1'; center.style.transform = 'translateX(-50%) scale(1.2)'; }
          msg('head-msg', '<strong style="color:#2a7a2a">\ud83c\udf54 Burger! Bun alone isn\u2019t a burger. The Head puts all pieces together into one answer.</strong>');
          celebrate('head-sim');
        }});
        steps.push({ delay: 300, fn: function () {
          if (center) { center.style.transform = 'translateX(-50%) scale(1)'; }
        }});
        steps.push({ delay: 1000, fn: function () { quiz('head-quiz'); done(); } });
        return autoAnim(steps);
      });
    })();

    /* ── HAND: thinking doesn't clean, doing does ── */
    (function () {
      addReplay('hand-sim', function (done) {
        var mess = el('hand-mess'), thought = el('hand-thought'), hands = el('hand-hands'), clean = el('hand-clean');
        if (!mess) return;
        /* reset */
        if (mess) { mess.style.opacity = '1'; mess.style.transform = ''; }
        if (thought) { thought.style.opacity = '0'; }
        if (hands) { hands.style.opacity = '0'; }
        if (clean) { clean.style.opacity = '0'; }
        return autoAnim([
          { delay: 400, fn: function () { msg('hand-msg', '<em>A messy room\u2026</em>'); } },
          { delay: 800, fn: function () { if (thought) { thought.style.transition = 'all .5s'; thought.style.opacity = '1'; } msg('hand-msg', '<em>\ud83d\udcad "I should clean this\u2026" (thinking)</em>'); } },
          { delay: 1200, fn: function () { msg('hand-msg', '<em style="color:#c44">\u274c Still messy. Thinking didn\u2019t do it.</em>'); } },
          { delay: 800, fn: function () { if (thought) { thought.style.opacity = '0'; } if (hands) { hands.style.transition = 'all .5s'; hands.style.opacity = '1'; } msg('hand-msg', '<em>\ud83d\udc4b Hands appear\u2026</em>'); } },
          { delay: 800, fn: function () { if (mess) { mess.style.transition = 'all .6s'; mess.style.transform = 'scale(0)'; mess.style.opacity = '0'; } } },
          { delay: 600, fn: function () { if (clean) { clean.style.transition = 'all .5s'; clean.style.opacity = '1'; }
            msg('hand-msg', '<strong style="color:#2a7a2a">\u2705 Clean! Thinking didn\u2019t do it. The HANDS did. Be a doer, not just a hearer.</strong>');
            celebrate('hand-sim');
          }},
          { delay: 1200, fn: function () { quiz('hand-quiz'); done(); } }
        ]);
      });
    })();

    /* ── TONGUE: filler words fly away, clean sentence remains ── */
    (function () {
      addReplay('tongue-sim', function (done) {
        var words = ['tongue-w1','tongue-w2','tongue-w3','tongue-w4','tongue-w5','tongue-w6','tongue-w7','tongue-w8','tongue-w9'];
        var clean = el('tongue-clean');
        /* reset */
        words.forEach(function (id) { var w = el(id); if (w) { w.style.opacity = '1'; w.style.transform = ''; w.style.background = ''; w.style.transition = 'none'; } });
        if (clean) { clean.style.opacity = '0'; }
        var steps = [{ delay: 600, fn: function () { msg('tongue-msg', '<em>A sentence with filler words\u2026</em>'); } }];
        /* Highlight then remove junk words one by one */
        words.forEach(function (id, i) {
          var w = el(id); if (!w) return;
          if (w.dataset.junk === 'true') {
            steps.push({ delay: 500, fn: function () {
              w.style.transition = 'all .3s'; w.style.background = 'rgba(244,67,54,.2)';
            }});
            steps.push({ delay: 400, fn: function () {
              w.style.transition = 'all .4s'; w.style.transform = 'translateX(60px)'; w.style.opacity = '0';
            }});
          }
        });
        steps.push({ delay: 600, fn: function () {
          if (clean) { clean.style.transition = 'all .5s'; clean.style.opacity = '1'; }
          msg('tongue-msg', '<strong style="color:#2a7a2a">\u2705 Filler gone! "We went to the park." Clean and clear. The Tongue strips the "um"s \u2014 only the real story remains.</strong>');
          celebrate('tongue-sim');
        }});
        steps.push({ delay: 1200, fn: function () { quiz('tongue-quiz'); done(); } });
        return autoAnim(steps);
      });
    })();

    /* hostile audience animation removed — merged into nose page */

    /* ── EYE: words -> math shape, words fade ── */
    (function () {
      addReplay('eye-sim', function (done) {
        var text = el('eye-text'), arrow = el('eye-arrow'), tags = el('eye-tags');
        var kept = el('eye-kept'), forgot = el('eye-forgot');
        if (!text) return;
        // All these elements are centered with translateX(-50%) in their inline CSS.
        // Preserve that centering on reset — only reset opacity.
        [text, arrow, tags, kept, forgot].forEach(function (e) { if (e) { e.style.opacity = '0'; e.style.transform = 'translateX(-50%)'; } });
        return autoAnim([
          { delay: 300, fn: function () { text.style.transition = 'all .5s'; text.style.opacity = '1'; msg('eye-msg', '<em>"I love my dog" \u2014 but what does this MEAN?</em>'); } },
          { delay: 1200, fn: function () { if (arrow) { arrow.style.transition = 'all .4s'; arrow.style.opacity = '1'; } } },
          { delay: 600, fn: function () { if (tags) { tags.style.transition = 'all .5s'; tags.style.opacity = '1'; } msg('eye-msg', '<em>AGP = love. PRD = having. IDN = is. The math shape of the sentence.</em>'); } },
          { delay: 1200, fn: function () { if (text) { text.style.transition = 'all .8s'; text.style.opacity = '.2'; } if (kept) { kept.style.transition = 'all .5s'; kept.style.opacity = '1'; } if (forgot) { forgot.style.transition = 'all .5s'; forgot.style.opacity = '1'; } msg('eye-msg', '<strong style="color:#2a7a2a">\u2705 The Eye keeps the shape. The exact words fade \u2014 we know what you meant, but we don\u2019t save what you said.</strong>'); celebrate('eye-sim'); } },
          { delay: 1200, fn: function () { quiz('eye-quiz'); done(); } }
        ]);
      });
    })();

    /* ── HEART: word -> hash code; later same word -> same code match ── */
    (function () {
      addReplay('heart-sim', function (done) {
        // All centered elements keep translateX(-50%); left-aligned labels keep no transform.
        var centered = ['heart-say1','heart-code1','heart-say2','heart-code2','heart-match'];
        var leftAligned = ['heart-day1-label','heart-day2-label'];
        centered.forEach(function (id) { var e = el(id); if (e) { e.style.opacity = '0'; e.style.transform = 'translateX(-50%)'; } });
        leftAligned.forEach(function (id) { var e = el(id); if (e) { e.style.opacity = '0'; e.style.transform = ''; } });
        return autoAnim([
          { delay: 300, fn: function () { var e = el('heart-day1-label'); if (e) { e.style.transition = 'all .4s'; e.style.opacity = '1'; } } },
          { delay: 300, fn: function () { var e = el('heart-say1'); if (e) { e.style.transition = 'all .5s'; e.style.opacity = '1'; } msg('heart-msg', '<em>Day 1 \u2014 "Bali" is said\u2026</em>'); } },
          { delay: 900, fn: function () { var e = el('heart-code1'); if (e) { e.style.transition = 'all .5s'; e.style.opacity = '1'; } msg('heart-msg', '<em>\u2026 the Heart turns it into a little code: <code>4b2a</code></em>'); } },
          { delay: 1200, fn: function () { var e = el('heart-day2-label'); if (e) { e.style.transition = 'all .4s'; e.style.opacity = '1'; } } },
          { delay: 400, fn: function () { var e = el('heart-say2'); if (e) { e.style.transition = 'all .5s'; e.style.opacity = '1'; } msg('heart-msg', '<em>Weeks later \u2014 "Remember Bali?"</em>'); } },
          { delay: 900, fn: function () { var e = el('heart-code2'); if (e) { e.style.transition = 'all .5s'; e.style.opacity = '1'; } } },
          { delay: 700, fn: function () { var e = el('heart-match'); if (e) { e.style.transition = 'all .6s'; e.style.opacity = '1'; } msg('heart-msg', '<strong style="color:#d81b60">\u2728 Same code! The Heart recognized you \u2014 without ever keeping the word.</strong>'); celebrate('heart-sim'); } },
          { delay: 1200, fn: function () { quiz('heart-quiz'); done(); } }
        ]);
      });
    })();

    /* ── SINEW: three toys connected by "has wheels" ── */
    (function () {
      addReplay('sinew-sim', function (done) {
        var centered = ['sinew-tag','sinew-v3','sinew-count'];
        var corners = ['sinew-v1','sinew-v2','sinew-line'];
        centered.forEach(function (id) { var e = el(id); if (e) { e.style.opacity = '0'; e.style.transform = 'translateX(-50%)'; } });
        corners.forEach(function (id) { var e = el(id); if (e) { e.style.opacity = '0'; } });
        return autoAnim([
          { delay: 300, fn: function () { var a = el('sinew-v1'), b = el('sinew-v2'); if (a) { a.style.transition = 'all .5s'; a.style.opacity = '1'; } if (b) { b.style.transition = 'all .5s'; b.style.opacity = '1'; } msg('sinew-msg', '<em>A car and a scooter. They\u2019re different\u2026 but do they share anything?</em>'); } },
          { delay: 1100, fn: function () { var t = el('sinew-tag'); if (t) { t.style.transition = 'all .5s'; t.style.opacity = '1'; } var l = el('sinew-line'); if (l) { l.style.transition = 'opacity 1s'; l.style.opacity = '1'; } msg('sinew-msg', '<em>Yes \u2014 both have wheels. That\u2019s the thread between them.</em>'); } },
          { delay: 1400, fn: function () { var v = el('sinew-v3'); if (v) { v.style.transition = 'all .5s'; v.style.opacity = '1'; } msg('sinew-msg', '<em>A bike has wheels too. Follow the thread \u2014 find the next thing.</em>'); } },
          { delay: 1200, fn: function () { var c = el('sinew-count'); if (c) { c.style.transition = 'all .5s'; c.style.opacity = '1'; } msg('sinew-msg', '<strong style="color:#0d47a1">\u2705 Things that share a thread are connected. The Bible has 291,919 threads like this.</strong>'); celebrate('sinew-sim'); } },
          { delay: 1200, fn: function () { quiz('sinew-quiz'); done(); } }
        ]);
      });
    })();

    /* ── PEARL-GUARD: shiny rock, kind friend gets full story, mean kid gets short answer ── */
    (function () {
      addReplay('pearl-sim', function (done) {
        var ids = ['pearl-kind','pearl-full','pearl-mock','pearl-short'];
        ids.forEach(function (id) { var e = el(id); if (e) { e.style.opacity = '0'; } });
        var note = el('pearl-note'); if (note) { note.style.opacity = '0'; note.style.transform = 'translateX(-50%)'; }
        return autoAnim([
          { delay: 300, fn: function () { var k = el('pearl-kind'); if (k) { k.style.transition = 'all .5s'; k.style.opacity = '1'; } msg('pearl-msg', '<em>A kind friend asks about your shiny rock\u2026</em>'); } },
          { delay: 1100, fn: function () { var f = el('pearl-full'); if (f) { f.style.transition = 'all .6s'; f.style.opacity = '1'; } msg('pearl-msg', '<em>You share the whole story \u2014 where, when, why it\u2019s special.</em>'); } },
          { delay: 1500, fn: function () { var m = el('pearl-mock'); if (m) { m.style.transition = 'all .5s'; m.style.opacity = '1'; } msg('pearl-msg', '<em>A mean kid laughs and calls it dumb\u2026</em>'); } },
          { delay: 1100, fn: function () { var s = el('pearl-short'); if (s) { s.style.transition = 'all .6s'; s.style.opacity = '1'; } msg('pearl-msg', '<em>You stay kind \u2014 but you don\u2019t give them the deep part.</em>'); } },
          { delay: 1200, fn: function () { var n = el('pearl-note'); if (n) { n.style.transition = 'all .5s'; n.style.opacity = '1'; } msg('pearl-msg', '<strong style="color:#6d4c00">\u2705 Same rock, same you, same kindness. Only the depth changes.</strong>'); celebrate('pearl-sim'); } },
          { delay: 1200, fn: function () { quiz('pearl-quiz'); done(); } }
        ]);
      });
    })();

    /* ── FAITH (virtue): plant seed, wait, nothing shows, then sprout ── */
    (function () {
      addReplay('faith-sim', function (done) {
        var centered = ['faith-hand','faith-seed','faith-sprout','faith-label'];
        var others = ['faith-clock','faith-day1','faith-day2','faith-day3'];
        centered.forEach(function (id) { var e = el(id); if (e) { e.style.opacity = '0'; e.style.transform = id === 'faith-sprout' ? 'translateX(-50%) scale(.3)' : 'translateX(-50%)'; } });
        others.forEach(function (id) { var e = el(id); if (e) { e.style.opacity = '0'; } });
        return autoAnim([
          { delay: 300, fn: function () { var h = el('faith-hand'); if (h) { h.style.transition = 'all .5s'; h.style.opacity = '1'; } msg('faith-msg', '<em>Put the seed in the dirt\u2026</em>'); } },
          { delay: 900, fn: function () { var s = el('faith-seed'); if (s) { s.style.transition = 'all .5s'; s.style.opacity = '.6'; } var h = el('faith-hand'); if (h) h.style.opacity = '.3'; } },
          { delay: 900, fn: function () { var c = el('faith-clock'); if (c) { c.style.transition = 'all .5s'; c.style.opacity = '1'; } var d1 = el('faith-day1'); if (d1) { d1.style.transition = 'all .5s'; d1.style.opacity = '1'; } msg('faith-msg', '<em>Day 1\u2026 nothing to see. Water it anyway.</em>'); } },
          { delay: 1000, fn: function () { var d2 = el('faith-day2'); if (d2) { d2.style.transition = 'all .5s'; d2.style.opacity = '1'; } msg('faith-msg', '<em>Day 3\u2026 still nothing. Keep going.</em>'); } },
          { delay: 1000, fn: function () { var d3 = el('faith-day3'); if (d3) { d3.style.transition = 'all .5s'; d3.style.opacity = '1'; } msg('faith-msg', '<em>Day 7\u2026 you can\u2019t see anything yet. But you trust how seeds work.</em>'); } },
          { delay: 1200, fn: function () { var sp = el('faith-sprout'); if (sp) { sp.style.transition = 'all 1.2s cubic-bezier(.3,1.4,.5,1)'; sp.style.opacity = '1'; sp.style.transform = 'translateX(-50%) scale(1)'; } var s = el('faith-seed'); if (s) s.style.opacity = '0'; msg('faith-msg', '<em>\ud83c\udf31 A sprout! The seed was working the whole time.</em>'); } },
          { delay: 1000, fn: function () { var l = el('faith-label'); if (l) { l.style.transition = 'all .5s'; l.style.opacity = '1'; } msg('faith-msg', '<strong style="color:#2e7d32">\u2705 Faith = trusting what you can\u2019t see YET. Keep watering while you wait.</strong>'); celebrate('faith-sim'); } },
          { delay: 1200, fn: function () { quiz('faith-quiz'); done(); } }
        ]);
      });
    })();

    /* ── VIRTUES: tree + growing fruit vs glued-on fruit falling ── */
    (function () {
      addReplay('virtues-sim', function (done) {
        var fruits = ['virtues-f1','virtues-f2','virtues-f3','virtues-f4','virtues-f5'];
        var glue = el('virtues-glue'), grown = el('virtues-grown');
        fruits.forEach(function (id) { var e = el(id); if (e) { e.style.opacity = '0'; e.style.transform = 'scale(.3)'; } });
        if (glue) { glue.style.opacity = '0'; glue.style.transform = 'translateX(-50%)'; }
        if (grown) { grown.style.opacity = '0'; grown.style.transform = 'translateX(-50%)'; }
        var steps = [
          { delay: 300, fn: function () { msg('virtues-msg', '<em>A tree rooted in C\u2026</em>'); } },
        ];
        /* Grow each fruit one by one */
        fruits.forEach(function (id, i) {
          steps.push({ delay: 500, fn: function () {
            var e = el(id); if (!e) return;
            e.style.transition = 'all .7s cubic-bezier(.3,1.4,.5,1)';
            e.style.opacity = '1';
            e.style.transform = 'scale(1)';
          }});
        });
        steps.push({ delay: 800, fn: function () {
          if (grown) { grown.style.transition = 'all .5s'; grown.style.opacity = '1'; }
          msg('virtues-msg', '<em>Love, patience, kindness \u2014 growing naturally from the tree\u2019s root.</em>');
        }});
        steps.push({ delay: 1200, fn: function () {
          if (glue) { glue.style.transition = 'all .5s'; glue.style.opacity = '1'; }
          msg('virtues-msg', '<strong style="color:#2e7d32">\u2705 You can\u2019t glue fruit on. Stay rooted in C; the Spirit does the growing (John 15:4).</strong>');
          celebrate('virtues-sim');
        }});
        steps.push({ delay: 1200, fn: function () { quiz('virtues-quiz'); done(); } });
        return autoAnim(steps);
      });
    })();

    /* ── CONFESSION: ice cream knocked — excuse vs honest admission ── */
    (function () {
      addReplay('conf-sim', function (done) {
        var icecream = el('conf-icecream'), friend = el('conf-friend'), excuse = el('conf-excuse'), honest = el('conf-honest');
        var result = el('conf-result');
        if (!icecream) return;
        var sim = el('conf-sim');
        /* reset */
        if (icecream) { icecream.style.opacity = '0'; icecream.style.transform = 'translateX(-50%)'; icecream.textContent = '\ud83c\udf66\ud83d\udca5'; }
        if (friend) { friend.style.opacity = '0'; friend.style.transform = ''; friend.textContent = '\ud83d\ude28'; }
        if (excuse) { excuse.style.opacity = '0'; excuse.style.transform = ''; }
        if (honest) { honest.style.opacity = '0'; honest.style.transform = ''; }
        if (result) { result.style.opacity = '0'; }
        if (sim) { sim.style.background = 'linear-gradient(180deg,#fff3e0 0%,#ffe0b2 100%)'; }
        return autoAnim([
          /* Scene: ice cream on the ground, friend shocked */
          { delay: 400, fn: function () {
            if (icecream) { icecream.style.transition = 'all .4s'; icecream.style.opacity = '1'; }
            if (friend) { friend.style.transition = 'all .4s'; friend.style.opacity = '1'; }
            msg('conf-msg', '<em>\ud83c\udf66\ud83d\udca5 Oops! You knocked your friend\u2019s ice cream onto the ground!</em>');
          }},
          /* PATH A: the excuse */
          { delay: 900, fn: function () {
            if (excuse) { excuse.style.transition = 'all .4s'; excuse.style.opacity = '1'; }
            msg('conf-msg', '<em>Path A: "\ud83d\udca8 The wind did it!"</em>');
          }},
          { delay: 800, fn: function () {
            if (friend) { friend.style.transition = 'all .4s'; friend.textContent = '\ud83d\ude24'; }
            if (result) { result.style.transition = 'all .3s'; result.style.opacity = '1'; result.textContent = '\u274c Trust broken'; result.style.color = '#c44'; }
            if (sim) { sim.style.transition = 'background .4s'; sim.style.background = 'linear-gradient(180deg,#ffebee 0%,#ffcdd2 100%)'; }
            msg('conf-msg', '<em style="color:#c44">\u274c Your friend knows you did it. Now they\u2019re mad AND don\u2019t trust you.</em>');
          }},
          /* Reset for path B */
          { delay: 1200, fn: function () {
            if (excuse) { excuse.style.transition = 'opacity .3s'; excuse.style.opacity = '0'; }
            if (result) { result.style.opacity = '0'; }
            if (friend) { friend.style.transition = 'all .3s'; friend.textContent = '\ud83d\ude28'; }
            if (sim) { sim.style.transition = 'background .4s'; sim.style.background = 'linear-gradient(180deg,#fff3e0 0%,#ffe0b2 100%)'; }
            msg('conf-msg', '<em>Try again \u2014 Path B...</em>');
          }},
          /* PATH B: honest confession */
          { delay: 800, fn: function () {
            if (honest) { honest.style.transition = 'all .4s'; honest.style.opacity = '1'; }
            msg('conf-msg', '<em>Path B: "\ud83d\ude4f I\u2019m sorry, I knocked it. Let me buy you another one."</em>');
          }},
          { delay: 900, fn: function () {
            if (friend) { friend.style.transition = 'all .4s'; friend.textContent = '\ud83d\ude0a'; friend.style.transform = 'scale(1.1)'; }
            if (icecream) { icecream.style.transition = 'all .4s'; icecream.textContent = '\ud83c\udf66\u2728'; }
            if (result) { result.style.transition = 'all .3s'; result.style.opacity = '1'; result.textContent = '\u2705 Trust restored!'; result.style.color = '#2a7a2a'; }
            if (sim) { sim.style.transition = 'background .4s'; sim.style.background = 'linear-gradient(180deg,#e8f5e9 0%,#c8e6c9 100%)'; }
            msg('conf-msg', '<strong style="color:#2a7a2a">\u2705 "I\u2019m sorry, I did it." Simple. Honest. Friend forgives, trust restored. That\u2019s confession.</strong>');
            celebrate('conf-sim');
          }},
          { delay: 1200, fn: function () { quiz('conf-quiz'); done(); } }
        ]);
      });
    })();

    /* ── HOPE: letter mailed, invisible journey, grandma receives ── */
    (function () {
      addReplay('hope-sim', function (done) {
        var letter = el('hope-letter'), mailbox = el('hope-mailbox'), grandma = el('hope-grandma');
        var delivered = el('hope-delivered'), dots = el('hope-dots');
        if (!letter) return;
        /* reset */
        if (letter) { letter.style.opacity = '1'; letter.style.left = '12%'; letter.style.transform = ''; letter.style.transition = 'none'; letter.style.bottom = '70px'; }
        if (grandma) { grandma.style.opacity = '0.3'; grandma.style.transform = ''; }
        if (delivered) { delivered.style.opacity = '0'; }
        if (dots) { dots.style.opacity = '0'; dots.textContent = '. . .'; }
        var sim = el('hope-sim');
        if (sim) { sim.style.background = 'linear-gradient(180deg,#e3f2fd 0%,#bbdefb 50%,#e8f5e9 100%)'; }
        return autoAnim([
          { delay: 400, fn: function () { msg('hope-msg', '<em>\u2709\ufe0f You wrote a letter to Grandma...</em>'); } },
          /* letter slides into mailbox */
          { delay: 800, fn: function () {
            if (letter) { letter.style.transition = 'all .7s ease-in'; letter.style.left = '36%'; letter.style.bottom = '45px'; letter.style.transform = 'scale(0.5)'; }
            msg('hope-msg', '<em>\ud83d\udcee Into the mailbox it goes...</em>');
          }},
          { delay: 800, fn: function () { if (letter) { letter.style.transition = 'opacity .3s'; letter.style.opacity = '0'; } } },
          /* pulsing dots to show invisible travel */
          { delay: 400, fn: function () {
            if (dots) {
              dots.style.transition = 'opacity .4s';
              dots.style.opacity = '1';
              dots.textContent = '.';
            }
            msg('hope-msg', '<em>Traveling unseen...</em>');
          }},
          { delay: 500, fn: function () { if (dots) dots.textContent = '. .'; } },
          { delay: 500, fn: function () { if (dots) dots.textContent = '. . .'; } },
          /* "2 days later..." text */
          { delay: 600, fn: function () {
            if (dots) { dots.style.transition = 'all .4s'; dots.style.opacity = '1'; dots.textContent = '2 days later...'; dots.style.fontSize = '12px'; dots.style.fontStyle = 'italic'; dots.style.color = '#777'; }
          }},
          { delay: 800, fn: function () { if (dots) { dots.style.opacity = '0'; } } },
          /* grandma lights up warmly and bounces */
          { delay: 400, fn: function () {
            if (sim) { sim.style.transition = 'background .6s'; sim.style.background = 'linear-gradient(180deg,#fff8e1 0%,#ffecb3 50%,#e8f5e9 100%)'; }
            if (grandma) {
              grandma.style.transition = 'all .5s cubic-bezier(.34,1.56,.64,1)';
              grandma.style.opacity = '1';
              grandma.style.transform = 'scale(1.2) translateY(-8px)';
            }
            if (delivered) { delivered.style.transition = 'all .4s'; delivered.style.opacity = '1'; }
          }},
          { delay: 300, fn: function () {
            /* settle bounce */
            if (grandma) { grandma.style.transition = 'all .3s'; grandma.style.transform = 'scale(1.05)'; }
            msg('hope-msg', '<strong style="color:#2a7a2a">\ud83d\udce8 Grandma got it! You couldn\u2019t see it traveling, but you KNEW it would arrive. That\u2019s hope \u2014 not wishing, knowing.</strong>');
            celebrate('hope-sim');
          }},
          { delay: 1200, fn: function () { quiz('hope-quiz'); done(); } }
        ]);
      });
    })();

    /* ── CHARITY: hearts given without keeping score ── */
    (function () {
      addReplay('char-sim', function (done) {
        var heart = el('char-heart');
        var people = ['char-p1','char-p2','char-p3'];
        var sadFaces = ['\ud83d\ude1e', '\ud83d\ude22', '\ud83e\udd15'];
        var positions = ['15%', '50%', '85%'];
        /* reset */
        people.forEach(function (id, i) { var p = el(id); if (p) { p.style.opacity = '0'; p.style.transform = ''; p.textContent = sadFaces[i]; } });
        if (heart) { heart.style.opacity = '0'; heart.style.left = '50%'; heart.style.bottom = '30px'; heart.style.transform = 'translateX(-50%)'; heart.style.transition = 'none'; }
        var steps = [];
        /* First: all 3 people appear as sad */
        steps.push({ delay: 400, fn: function () {
          people.forEach(function (id) { var p = el(id); if (p) { p.style.transition = 'all .5s'; p.style.opacity = '1'; } });
          msg('char-msg', '<em>Three sad people...</em>');
        }});
        /* Show heart in center */
        steps.push({ delay: 600, fn: function () {
          if (heart) { heart.style.transition = 'all .4s'; heart.style.opacity = '1'; }
        }});
        /* For each person: heart flies to them, they become happy, heart returns */
        people.forEach(function (id, i) {
          /* heart flies UP to person */
          steps.push({ delay: 600, fn: function () {
            if (heart) {
              heart.style.transition = 'all .5s cubic-bezier(.34,1.56,.64,1)';
              heart.style.bottom = '80px';
              heart.style.left = positions[i];
              heart.style.transform = 'translateX(-50%) scale(1.2)';
            }
          }});
          /* person turns happy */
          steps.push({ delay: 500, fn: function () {
            var p = el(id); if (p) { p.style.transition = 'all .3s'; p.textContent = '\ud83d\ude0a'; p.style.transform = 'scale(1.15)'; }
            setTimeout(function () { var p2 = el(id); if (p2) { p2.style.transform = 'scale(1)'; } }, 540);
          }});
          /* the heart is still full — no score, no count */
          steps.push({ delay: 300, fn: function () {
            msg('char-msg', '<em>Love given. Heart still full.</em>');
          }});
          /* heart returns to center */
          steps.push({ delay: 400, fn: function () {
            if (heart) { heart.style.transition = 'all .4s ease'; heart.style.bottom = '30px'; heart.style.left = '50%'; heart.style.transform = 'translateX(-50%) scale(1)'; }
          }});
        });
        steps.push({ delay: 600, fn: function () {
          msg('char-msg', '<strong style="color:#b8860b">\u2764\ufe0f All three helped. The heart is still full. That\u2019s charity \u2014 love does not shrink when you give it.</strong>');
          celebrate('char-sim');
        }});
        steps.push({ delay: 1200, fn: function () { quiz('char-quiz'); done(); } });
        return autoAnim(steps);
      });
    })();

    /* ── CONSTRAINTS: P1-P8 (animated demonstrations) ── */

    /* ── P1: Measurement ── */
    (function () {
      addReplay('p1-sim', function (done) {
        var flower = el('p1-flower'), ruler = el('p1-ruler');
        var honest = el('p1-honest'), inflated = el('p1-inflated');
        var check = el('p1-check'), x = el('p1-x');
        if (!flower) return;
        /* reset */
        [flower, ruler, honest, inflated].forEach(function (e) { if (e) { e.style.opacity = '0'; e.style.transform = e.id === 'p1-flower' ? 'translateX(-50%)' : ''; } });
        if (check) check.style.opacity = '0';
        if (x) x.style.opacity = '0';
        if (inflated) { inflated.style.transform = ''; inflated.style.background = 'rgba(255,255,255,.9)'; }
        if (honest) honest.style.background = 'rgba(255,255,255,.9)';
        msg('p1-msg', '<em style="opacity:.6">\ud83c\udfac Watch what happens when you report honestly vs. inflate...</em>');
        var q = el('p1-quiz'); if (q) q.style.display = 'none';

        return autoAnim([
          { delay: 300, fn: function () { flower.style.opacity = '1'; } },
          { delay: 500, fn: function () { ruler.style.opacity = '1'; msg('p1-msg', '<em>The sunflower measures 30cm...</em>'); } },
          { delay: 800, fn: function () { honest.style.opacity = '1'; inflated.style.opacity = '1'; msg('p1-msg', '<em>Two reports slide in...</em>'); } },
          { delay: 1000, fn: function () { honest.style.background = 'rgba(100,200,100,.25)'; check.style.opacity = '1'; msg('p1-msg', '<em>\ud83d\udccf 30cm \u2014 honest report gets a \u2705</em>'); } },
          { delay: 1200, fn: function () { inflated.style.transform = 'scaleY(1.4)'; inflated.style.background = 'rgba(255,180,180,.4)'; msg('p1-msg', '<em>\ud83d\udcca 50cm! \u2014 inflated report stretches comically...</em>'); } },
          { delay: 800, fn: function () { inflated.style.transform = 'scaleY(0.6) scaleX(0.8)'; x.style.opacity = '1'; } },
          { delay: 600, fn: function () { inflated.style.opacity = '0.35'; } }
        ], function () {
          celebrate('p1-sim');
          msg('p1-msg', '<strong style="color:#2a7a2a">\u2705 Honest! 30cm is 30cm. No inflating, no deflating. That\u2019s P\u2081.</strong>');
          setTimeout(function () { quiz('p1-quiz'); }, 2160);
          done();
        });
      });
    })();

    /* ── P2: Binarity ── */
    (function () {
      addReplay('p2-sim', function (done) {
        var question = el('p2-question'), yes = el('p2-yes'), no = el('p2-no'), idk = el('p2-idk'), mushy = el('p2-mushy');
        if (!question) return;
        /* reset */
        [question, yes, no, idk, mushy].forEach(function (e) { if (e) { e.style.opacity = '0'; e.style.transform = e.id === 'p2-mushy' ? 'translateX(-50%)' : ''; } });
        msg('p2-msg', '<em style="opacity:.6">\ud83c\udfac Watch: clear answers line up neatly. Mushy ones bounce off!</em>');
        var q = el('p2-quiz'); if (q) q.style.display = 'none';

        return autoAnim([
          { delay: 400, fn: function () { question.style.opacity = '1'; msg('p2-msg', '<em>\ud83c\udf6a Did you eat the biscuit?</em>'); } },
          { delay: 700, fn: function () { yes.style.opacity = '1'; } },
          { delay: 400, fn: function () { no.style.opacity = '1'; } },
          { delay: 400, fn: function () { idk.style.opacity = '1'; msg('p2-msg', '<em>\u2705 \u274c \ud83e\udd37 Three clear answers line up neatly!</em>'); } },
          { delay: 800, fn: function () { mushy.style.opacity = '1'; msg('p2-msg', '<em>\ud83e\udd14 A mushy answer tries to squeeze in...</em>'); } },
          { delay: 800, fn: function () { mushy.style.transform = 'translateX(-50%) translateY(-20px) rotate(8deg)'; mushy.style.opacity = '0.7'; msg('p2-msg', '<em>Bounce! \ud83e\udd14 "it depends" doesn\u2019t fit!</em>'); } },
          { delay: 500, fn: function () { mushy.style.transform = 'translateX(-50%) translateY(60px) rotate(-12deg)'; mushy.style.opacity = '0.15'; } }
        ], function () {
          celebrate('p2-sim');
          msg('p2-msg', '<strong style="color:#2a7a2a">\u2705 Clear answers only! Yes, no, or I don\u2019t know. No mush. That\u2019s P\u2082.</strong>');
          setTimeout(function () { quiz('p2-quiz'); }, 2160);
          done();
        });
      });
    })();

    /* ── P3: Verifiability ── */
    (function () {
      addReplay('p3-sim', function (done) {
        var c1 = el('p3-c1'), c2 = el('p3-c2'), c3 = el('p3-c3');
        var v1 = el('p3-v1'), v2 = el('p3-v2'), v3 = el('p3-v3');
        if (!c1) return;
        /* reset */
        [c1, c2, c3, v1, v2, v3].forEach(function (e) { if (e) { e.style.opacity = '0'; } });
        [c1, c2, c3].forEach(function (e) { if (e) e.style.background = 'rgba(255,255,255,.12)'; });
        msg('p3-msg', '<em style="opacity:.6">\ud83c\udfac Watch: can each claim be checked?</em>');
        var q = el('p3-quiz'); if (q) q.style.display = 'none';

        return autoAnim([
          { delay: 400, fn: function () { c1.style.opacity = '1'; msg('p3-msg', '<em>\ud83c\udf08 Claim 1: "I saw a rainbow"</em>'); } },
          { delay: 900, fn: function () { v1.style.opacity = '1'; c1.style.background = 'rgba(100,200,100,.2)'; msg('p3-msg', '<em>\ud83d\udcf7 Camera flash \u2014 you were there, checkable! \u2705</em>'); } },
          { delay: 900, fn: function () { c2.style.opacity = '1'; msg('p3-msg', '<em>\ud83c\udf05 Claim 2: "Here\u2019s a photo of the sunset"</em>'); } },
          { delay: 900, fn: function () { v2.style.opacity = '1'; c2.style.background = 'rgba(100,200,100,.2)'; msg('p3-msg', '<em>\ud83d\udcf7 Photo evidence \u2014 checkable! \u2705</em>'); } },
          { delay: 900, fn: function () { c3.style.opacity = '1'; msg('p3-msg', '<em>\ud83d\udc09 Claim 3: "My cousin said there\u2019s a dragon"</em>'); } },
          { delay: 900, fn: function () { v3.style.opacity = '1'; c3.style.background = 'rgba(255,200,50,.15)'; msg('p3-msg', '<em>\ud83d\udc09 No evidence, just hearsay \u2014 \u26a0\ufe0f not sure!</em>'); } }
        ], function () {
          celebrate('p3-sim');
          msg('p3-msg', '<strong style="color:#2a7a2a">\u2705 Checkable claims get \u2705. Hearsay gets \u26a0\ufe0f "not sure." That\u2019s P\u2083.</strong>');
          setTimeout(function () { quiz('p3-quiz'); }, 2160);
          done();
        });
      });
    })();

    /* ── P4: Fruit — two students, one talks big, one produces ── */
    (function () {
      addReplay('p4-sim', function (done) {
        var sa = el('p4-student-a'), sb = el('p4-student-b');
        var talk = el('p4-talk'), pa = el('p4-paper-a'), pb = el('p4-paper-b');
        var la = el('p4-label-a'), lb = el('p4-label-b'), spot = el('p4-spotlight');
        if (!sa) return;
        /* reset */
        [sa, sb, talk, pa, pb, la, lb].forEach(function (e) { if (e) { e.style.transition = 'none'; e.style.opacity = '0'; } });
        if (spot) spot.style.opacity = '0';

        return autoAnim([
          { delay: 400, fn: function () { if (sa) { sa.style.transition = 'all .4s'; sa.style.opacity = '1'; } if (sb) { sb.style.transition = 'all .4s'; sb.style.opacity = '1'; } msg('p4-msg', '<em>Two students hand in homework\u2026</em>'); } },
          { delay: 800, fn: function () { if (talk) { talk.style.transition = 'all .4s'; talk.style.opacity = '1'; } msg('p4-msg', '<em>\ud83d\ude0e "I\u2019m the BEST!" Student A talks big\u2026</em>'); } },
          { delay: 800, fn: function () { if (pa) { pa.style.transition = 'all .4s'; pa.style.opacity = '1'; } if (la) { la.style.transition = 'all .3s'; la.style.opacity = '1'; } msg('p4-msg', '<em style="color:#c44">\ud83d\udcc4 But Student A\u2019s paper is\u2026 empty!</em>'); } },
          { delay: 900, fn: function () { if (pb) { pb.style.transition = 'all .4s'; pb.style.opacity = '1'; } if (lb) { lb.style.transition = 'all .3s'; lb.style.opacity = '1'; } msg('p4-msg', '<em style="color:#2a7a2a">\ud83d\udcdd Student B said nothing\u2026 but handed in great work!</em>'); } },
          { delay: 800, fn: function () { if (spot) { spot.style.transition = 'opacity 1s'; spot.style.opacity = '1'; } } }
        ], function () {
          celebrate('p4-sim');
          msg('p4-msg', '<strong style="color:#2a7a2a">\u2705 Talking big didn\u2019t produce anything. The quiet one delivered. Judge by what they actually make. That\u2019s P\u2084.</strong>');
          setTimeout(function () { quiz('p4-quiz'); }, 2160);
          done();
        });
      });
    })();

    /* ── P5: Release — pile on vs help up ── */
    (function () {
      addReplay('p5-sim', function (done) {
        var person = el('p5-person'), mean = el('p5-mean'), kind = el('p5-kind'), result = el('p5-result');
        var spill = el('p5-spill'), spillLabel = el('p5-spill-label');
        if (!person) return;
        /* reset */
        if (person) { person.style.transition = 'none'; person.style.opacity = '1'; person.textContent = '\ud83d\ude22'; person.style.fontSize = '44px'; }
        if (mean) { mean.style.transition = 'none'; mean.style.opacity = '0'; }
        if (kind) { kind.style.transition = 'none'; kind.style.opacity = '0'; }
        if (result) { result.style.opacity = '0'; }
        if (spill) { spill.style.transition = 'none'; spill.style.opacity = '1'; }
        if (spillLabel) { spillLabel.style.transition = 'none'; spillLabel.style.opacity = '1'; }
        msg('p5-msg', '<em>\ud83d\ude22 They spilled their drink and feel terrible\u2026</em>');

        return autoAnim([
          /* Path A: mean response */
          { delay: 800, fn: function () { if (mean) { mean.style.transition = 'all .5s'; mean.style.opacity = '1'; } msg('p5-msg', '<em>\ud83d\ude20 "That was SO dumb!"</em>'); } },
          { delay: 700, fn: function () {
            if (person) { person.style.transition = 'all .4s'; person.textContent = '\ud83d\ude2d'; person.style.fontSize = '36px'; }
            if (result) { result.style.transition = 'all .3s'; result.style.opacity = '1'; result.textContent = '\u274c'; }
            msg('p5-msg', '<em style="color:#c44">\u274c They feel WORSE! Piling on made it worse.</em>');
          }},
          /* Reset */
          { delay: 1200, fn: function () {
            if (person) { person.style.transition = 'all .4s'; person.textContent = '\ud83d\ude22'; person.style.fontSize = '44px'; }
            if (mean) { mean.style.transition = 'all .3s'; mean.style.opacity = '0'; }
            if (result) { result.style.opacity = '0'; }
            msg('p5-msg', '<em>Same moment. Try the other way\u2026</em>');
          }},
          /* Path B: kind response */
          { delay: 800, fn: function () { if (kind) { kind.style.transition = 'all .5s'; kind.style.opacity = '1'; } msg('p5-msg', '<em>\ud83e\udd17 "Let\u2019s clean it up together!"</em>'); } },
          { delay: 700, fn: function () {
            if (spill) { spill.style.transition = 'all .4s'; spill.style.opacity = '0'; }
            if (spillLabel) { spillLabel.style.transition = 'all .4s'; spillLabel.style.opacity = '0'; }
            if (person) { person.style.transition = 'all .4s'; person.textContent = '\ud83d\ude0a'; person.style.fontSize = '48px'; }
            if (result) { result.style.transition = 'all .3s'; result.style.opacity = '1'; result.textContent = '\u2705'; }
            msg('p5-msg', '<strong style="color:#2a7a2a">\u2705 They feel better! When someone\u2019s already down, help them up \u2014 don\u2019t pile on. That\u2019s P\u2085.</strong>');
            celebrate('p5-sim');
          }},
          { delay: 1200, fn: function () { quiz('p5-quiz'); done(); } }
        ]);
      });
    })();

    /* ── P6: Correction ── */
    (function () {
      addReplay('p6-sim', function (done) {
        var board = el('p6-board'), correction = el('p6-correction');
        var door = el('p6-door'), result = el('p6-result');
        if (!board) return;
        /* reset */
        [board, correction, door].forEach(function (e) { if (e) e.style.opacity = '0'; });
        if (result) result.textContent = '5';
        if (board) board.style.background = 'rgba(255,255,255,.9)';
        if (door) door.textContent = '\ud83d\udeaa';
        msg('p6-msg', '<em style="opacity:.6">\ud83c\udfac Watch: what happens when a correction knocks...</em>');
        var q = el('p6-quiz'); if (q) q.style.display = 'none';

        return autoAnim([
          { delay: 400, fn: function () { board.style.opacity = '1'; msg('p6-msg', '<em>The blackboard shows: 2+2=5</em>'); } },
          { delay: 800, fn: function () { correction.style.opacity = '1'; msg('p6-msg', '<em>\ud83d\udca1 A correction arrives: 2+2=4!</em>'); } },
          { delay: 800, fn: function () { door.style.opacity = '1'; msg('p6-msg', '<em>\ud83d\udeaa The door is open \u2014 let the correction in?</em>'); } },
          { delay: 800, fn: function () { door.textContent = '\ud83d\udebf'; if (result) result.textContent = '4'; board.style.background = 'rgba(100,200,100,.25)'; msg('p6-msg', '<em>\u2705 Door opens \u2192 answer updates to 4!</em>'); } },
          /* Show closed door scenario */
          { delay: 1200, fn: function () {
            if (result) result.textContent = '5'; board.style.background = 'rgba(255,255,255,.9)';
            door.textContent = '\ud83e\uddf1'; door.style.opacity = '1';
            msg('p6-msg', '<em>But if the door stays closed...</em>');
          } },
          { delay: 800, fn: function () { board.style.background = 'rgba(255,180,180,.3)'; msg('p6-msg', '<em>\u274c Closed door \u2192 stays at 5. Wrong forever.</em>'); } },
          { delay: 600, fn: function () { buzz([40]); } }
        ], function () {
          celebrate('p6-sim');
          msg('p6-msg', '<strong style="color:#2a7a2a">\u2705 Open to correction! A mind that accepts updates keeps learning. That\u2019s P\u2086.</strong>');
          setTimeout(function () { quiz('p6-quiz'); }, 2160);
          done();
        });
      });
    })();

    /* ── P8: Source Independence ── */
    (function () {
      addReplay('p8-sim', function (done) {
        var stove = el('p8-stove'), chef = el('p8-chef'), sister = el('p8-sister');
        var hand = el('p8-hand'), result = el('p8-result');
        if (!stove) return;
        /* reset */
        [stove, chef, sister, hand].forEach(function (e) { if (e) { e.style.opacity = '0'; } });
        if (result) { result.style.opacity = '0'; result.textContent = ''; }
        if (hand) { hand.style.top = '20px'; hand.style.right = '30%'; }
        msg('p8-msg', '<em style="opacity:.6">\ud83c\udfac Watch: does it matter WHO says "the stove is hot"?</em>');
        var q = el('p8-quiz'); if (q) q.style.display = 'none';

        return autoAnim([
          { delay: 400, fn: function () { stove.style.opacity = '1'; msg('p8-msg', '<em>\ud83d\udd25 A hot stove...</em>'); } },
          { delay: 600, fn: function () { chef.style.opacity = '1'; msg('p8-msg', '<em>\ud83d\udc68\u200d\ud83c\udf73 Chef says: "it\u2019s hot!"</em>'); } },
          { delay: 700, fn: function () { hand.style.opacity = '1'; hand.style.top = '15px'; hand.style.right = '42%'; msg('p8-msg', '<em>\u270b Hand reaches toward stove...</em>'); } },
          { delay: 600, fn: function () { if (result) { result.textContent = '\ud83d\udd25 Ouch! Burns!'; result.style.opacity = '1'; } buzz([30]); msg('p8-msg', '<em>\ud83d\udd25 Ouch! The stove burns!</em>'); } },
          /* Reset for sister */
          { delay: 1200, fn: function () {
            hand.style.opacity = '0'; hand.style.top = '20px'; hand.style.right = '30%';
            if (result) result.style.opacity = '0';
            msg('p8-msg', '<em>Now your sister says the same thing...</em>');
          } },
          { delay: 600, fn: function () { sister.style.opacity = '1'; msg('p8-msg', '<em>\ud83d\udc67 Sister says: "it\u2019s hot!"</em>'); } },
          { delay: 700, fn: function () { hand.style.opacity = '1'; hand.style.top = '15px'; hand.style.right = '42%'; msg('p8-msg', '<em>\u270b Hand reaches again...</em>'); } },
          { delay: 600, fn: function () { if (result) { result.textContent = '\ud83d\udd25 Ouch! Same burn!'; result.style.opacity = '1'; } buzz([30]); msg('p8-msg', '<em>\ud83d\udd25 Same ouch! Same truth!</em>'); } }
        ], function () {
          celebrate('p8-sim');
          msg('p8-msg', '<strong style="color:#2a7a2a">\u2705 Same burn either way! Truth doesn\u2019t change based on who speaks it. That\u2019s P\u2088.</strong>');
          setTimeout(function () { quiz('p8-quiz'); }, 2160);
          done();
        });
      });
    })();

    /* ── P7: Auto-play animation — filler words fly away ── */
    (function () {
      addReplay('p7-sim', function (done) {
        var words = ['p7-w1','p7-w2','p7-w3','p7-w4','p7-w5','p7-w6','p7-w7','p7-w8'];
        var clean = el('p7-clean');
        /* reset */
        words.forEach(function (id) { var w = el(id); if (w) { w.style.transition = 'none'; w.style.opacity = '1'; w.style.transform = ''; w.style.background = ''; w.style.textDecoration = ''; } });
        if (clean) { clean.style.opacity = '0'; clean.style.display = 'none'; }
        var steps = [{ delay: 600, fn: function () { msg('p7-msg', '<em>A sentence full of filler words\u2026</em>'); } }];
        /* Highlight and remove each filler word */
        words.forEach(function (id) {
          var w = el(id); if (!w) return;
          if (w.dataset.filler === 'true') {
            steps.push({ delay: 500, fn: function () { w.style.transition = 'all .3s'; w.style.background = 'rgba(244,67,54,.25)'; } });
            steps.push({ delay: 400, fn: function () { w.style.transition = 'all .4s'; w.style.transform = 'translateY(-20px)'; w.style.opacity = '0'; } });
          }
        });
        /* Show clean result */
        steps.push({ delay: 600, fn: function () {
          if (clean) { clean.style.display = 'block'; clean.style.transition = 'all .5s'; clean.style.opacity = '1'; }
          msg('p7-msg', '<strong style="color:#2a7a2a">\u2705 Filler gone! "The answer is yes." Every remaining word earns its place. That\u2019s P\u2087.</strong>');
          celebrate('p7-sim');
        }});
        steps.push({ delay: 1200, fn: function () { quiz('p7-quiz'); done(); } });
        return autoAnim(steps);
      });
    })();
  }

  /* Master init — runs all sim handlers + match game + T7 drag */
  window._initAllSimsAndExtras = function () {
    console.log('[balthazar] _initAllSimsAndExtras called');
    _initAllSims();
    if (window._t7Init) window._t7Init();
    _initMatchGame();
    console.log('[balthazar] init complete');
  };

  /* ── BULLETPROOF AUTO-INIT ──────────────────────────────────────
     The sim scenes are injected dynamically by applyPageContent.
     Instead of fragile setTimeout chains, we watch the DOM for
     .sim-scene elements and init as soon as they appear.
     Also catches any tap on an unbound sim as a fallback. */

  /* Watch for sim scenes appearing in the DOM */
  var _obsCount = 0, _obsReset = 0;
  var _observer = new MutationObserver(function () {
    /* Rate limit: max 3 inits per 2 seconds to prevent infinite loops */
    var now = Date.now();
    if (now - _obsReset > 2000) { _obsCount = 0; _obsReset = now; }
    if (_obsCount >= 3) return;
    var scenes = document.querySelectorAll('.sim-scene');
    if (!scenes.length) return;
    var anyUnbound = false;
    scenes.forEach(function (s) {
      /* Skip scenes that already have replay bound (animation pages) */
      if (s._replayBound) return;
      var ids = s.querySelectorAll('[id]');
      var hasBound = false;
      ids.forEach(function (el) { if (el._bound || el._dragBound || el._swipeBound || el._holdBound || el._t12 || el._replayBound) hasBound = true; });
      if (!hasBound && ids.length > 0) anyUnbound = true;
    });
    if (anyUnbound) {
      _obsCount++;
      console.log('[balthazar] MutationObserver: sim scenes found, initing...');
      window._initAllSimsAndExtras();
    }
  });

  document.addEventListener('DOMContentLoaded', function () {
    _observer.observe(document.body, { childList: true, subtree: true });
  });

  /* Fallback: tap on unbound sim triggers init */
  document.addEventListener('click', function (e) {
    var sim = e.target.closest('.sim-scene');
    if (!sim) return;
    var anyBound = false;
    sim.querySelectorAll('[id]').forEach(function (el) { if (el._bound) anyBound = true; });
    if (!anyBound) window._initAllSimsAndExtras();
  }, true);

  /* ── Public toggle ───────────────────────────────────────────── */
  window.toggleKidsMode = function () {
    var active = !document.documentElement.classList.contains('kids-mode');
    document.documentElement.classList.toggle('kids-mode', active);
    localStorage.setItem(STORAGE_KEY, active ? '1' : '0');
    updateUI(active);
    applyHomeContent(active);
    applyPageContent(active);
    /* MutationObserver auto-inits sims when they appear in DOM */
  };

  /* ── DOMContentLoaded ────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var active = document.documentElement.classList.contains('kids-mode');
    updateUI(active);
    if (active) {
      applyHomeContent(true);
      applyPageContent(true);
      /* MutationObserver auto-inits sims when they appear in DOM */
    }

    /* Theorem tooltips (homepage) */
    var theoremHints = {
      't1-row':  'Everything that exists came from C \u2014 existence has a source',
      't2-row':  'To produce output, input must be given \u2014 the seed must fall',
      't3-row':  'C is recoverable by observing its effects in the world',
      't4-row':  'Giving from C does not deplete C \u2014 love self-replenishes',
      't5-row':  'Acting before full verification \u2014 confidence grounded in C',
      't6-row':  'The expected value of C is calculable before it is seen',
      't7-row':  'Clearing negative state restores C to full \u2014 forgiveness resets',
      't8-row':  'C exceeds any opposing force in the element set',
      't9-row':  'Claims require witnesses \u2014 assertion needs independent confirmation',
      't10-row': 'Branches that produce nothing are removed \u2014 pruning enables growth',
      't11-row': 'Apply the same measure to your own output as to all others',
      't12-row': 'No other foundation can be laid than what is already there'
    };
    Object.keys(theoremHints).forEach(function (id) {
      var li = document.getElementById(id);
      if (!li) return;
      var num = li.querySelector('.num');
      if (!num) return;
      num.setAttribute('data-tooltip', theoremHints[id]);
      num.classList.add('has-tooltip');
    });

    /* Triple-click the C in the display math (hidden bonus) */
    var magicC = document.getElementById('magic-c');
    if (magicC) {
      var clicks = 0, timer;
      magicC.addEventListener('click', function (e) {
        e.preventDefault();
        clicks++;
        clearTimeout(timer);
        timer = setTimeout(function () { clicks = 0; }, 1620);
        if (clicks >= 3) { clicks = 0; clearTimeout(timer); window.toggleKidsMode(); }
      });
    }
  });

  /* ══════════════════════════════════════════════════════════
     INTERACTIVE GAMES — injected CSS + logic for kids mode
     ══════════════════════════════════════════════════════════ */

  /* ── CSS for games ── */
  var gameCSS = document.createElement('style');
  gameCSS.textContent =
    /* Reveal game (proof page) */
    '.reveal-step{margin:8px 0}' +
    '.reveal-btn{background:#e8dcc8;border:1px solid #d4c4a8;border-radius:6px;padding:10px 16px;font-size:15px;cursor:pointer;width:100%;text-align:left;transition:background .2s}' +
    '.reveal-btn:hover{background:#ddd0b8}' +
    '.reveal-btn:active{background:#d4c4a8}' +
    '.reveal-content{display:none;padding:10px 16px;line-height:1.6;border-left:3px solid #c8a96e}' +
    '.reveal-step.open .reveal-btn{display:none}' +
    '.reveal-step.open .reveal-content{display:block;animation:fadeIn 1.2s ease}' +
    '@keyframes fadeIn{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}' +

    /* Quiz game (theorems page) */
    '.quiz-q{margin:10px 0;padding:10px;border-radius:6px;background:#faf6ee;line-height:1.6}' +
    '.quiz-opts{display:inline-flex;gap:6px;margin-left:4px;flex-wrap:wrap}' +
    '.quiz-opts button{background:#e8dcc8;border:1px solid #d4c4a8;border-radius:4px;padding:5px 12px;font-size:14px;cursor:pointer;transition:all .2s}' +
    '.quiz-opts button:hover{background:#ddd0b8}' +
    '.quiz-opts button.correct{background:#b8d4a8;border-color:#8cb87a;pointer-events:none}' +
    '.quiz-opts button.wrong{background:#e4b8b8;border-color:#c49090;pointer-events:none;opacity:.5}' +
    '.quiz-opts button:disabled{pointer-events:none;opacity:.4}' +

    /* Sim scene (interactive scenarios) */
    '.sim-scene{padding:12px;background:#faf6ee;border-radius:8px;margin:8px auto;max-width:400px}' +
    '.sim-scene.sim-fancy{padding:0;transition:background 1.8s ease}' +
    '.sim-object{padding:12px 0}' +
    '@keyframes t7float{from{transform:translateY(0) scale(1)}to{transform:translateY(-10px) scale(1.15)}}' +
    '.t7-drop{transition:all 1.8s ease}' +
    '.t7-sparkle{display:inline-block}' +

    /* Hint finger animations */
    '@keyframes hint-drag{0%,100%{transform:translate(0,0);opacity:.7}50%{transform:translate(40px,20px);opacity:1}}' +
    '@keyframes hint-swipe{0%,100%{transform:translateX(-30px);opacity:.7}50%{transform:translateX(30px);opacity:1}}' +
    '@keyframes hint-hold{0%,100%{transform:scale(1);opacity:.7}50%{transform:scale(1.2);opacity:1}}' +
    '.hint-finger{position:absolute;z-index:50;font-size:32px;pointer-events:none;filter:drop-shadow(0 2px 4px rgba(0,0,0,.3))}' +
    '.hint-finger.drag{animation:hint-drag 1.5s ease-in-out infinite}' +
    '.hint-finger.swipe{animation:hint-swipe 1.2s ease-in-out infinite}' +
    '.hint-finger.hold{animation:hint-hold 1.4s ease-in-out infinite}' +
    '.hint-ring{position:absolute;width:40px;height:40px;border:3px solid rgba(255,200,50,.5);border-radius:50%;top:-5px;left:-5px;animation:hint-hold 1.4s ease-in-out infinite}' +

    /* Trail particles */
    '@keyframes particle-fade{0%{transform:scale(1);opacity:.8}100%{transform:scale(0);opacity:0}}' +
    '.trail-dot{position:fixed;width:10px;height:10px;border-radius:50%;pointer-events:none;z-index:100;animation:particle-fade .5s ease-out forwards}' +

    /* Celebration burst */
    '@keyframes burst-out{0%{transform:translate(0,0) scale(1) rotate(0deg);opacity:1}100%{transform:translate(var(--tx,50px),var(--ty,-50px)) scale(0.3) rotate(var(--rot,180deg));opacity:0}}' +
    '.burst-star{position:absolute;font-size:20px;pointer-events:none;z-index:60}' +
    '.anim-check{color:#2a7a2a;font-weight:bold;font-size:18px}' +
    '.anim-x{color:#c44;font-weight:bold;font-size:18px}' +

    /* Match game (constraints page) */
    '.match-symbols,.match-meanings{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}' +
    '.match-btn{background:#e8dcc8;border:1px solid #d4c4a8;border-radius:6px;padding:8px 14px;font-size:14px;cursor:pointer;transition:all .2s;user-select:none}' +
    '.match-btn:hover{background:#ddd0b8}' +
    '.match-btn.selected{background:#c8a96e;color:#fff;border-color:#b8994e}' +
    '.match-btn.matched{background:#b8d4a8;border-color:#8cb87a;pointer-events:none;opacity:.7}' +
    '.match-btn.wrong-flash{background:#e4b8b8;border-color:#c49090}' +
    '';
  document.head.appendChild(gameCSS);

  /* ── Quiz check (theorems) ── */
  var _quizCorrect = 0, _quizTotal = 0, _quizAnswered = 0;
  window._quizCheck = function (btn, isCorrect) {
    var q = btn.closest('.quiz-q');
    if (q.dataset.done) return;
    q.dataset.done = '1';
    _quizAnswered++;
    _quizTotal = document.querySelectorAll('.quiz-q').length;
    if (isCorrect) {
      btn.classList.add('correct');
      _quizCorrect++;
    } else {
      btn.classList.add('wrong');
      /* Highlight the correct one */
      var btns = q.querySelectorAll('.quiz-opts button');
      btns.forEach(function (b) {
        if (b !== btn) {
          /* Check if this button has the correct onclick */
          var onclick = b.getAttribute('onclick') || '';
          if (onclick.indexOf('true') !== -1) b.classList.add('correct');
          else b.disabled = true;
        }
      });
    }
    /* Disable all buttons in this question */
    q.querySelectorAll('.quiz-opts button').forEach(function (b) {
      if (!b.classList.contains('correct')) b.disabled = true;
    });
    /* Show score when all answered */
    if (_quizAnswered >= _quizTotal) {
      var scoreEl = document.getElementById('quiz-score');
      if (scoreEl) {
        scoreEl.style.display = 'block';
        if (_quizCorrect === _quizTotal) {
          scoreEl.textContent = '\u2b50 ' + _quizCorrect + '/' + _quizTotal + ' \u2014 Perfect! You know the twelve discoveries!';
        } else {
          scoreEl.textContent = _quizCorrect + '/' + _quizTotal + ' \u2014 Tap any theorem card below to learn more!';
        }
      }
    }
  };

  /* ── Match game (constraints) ── */
  var _matchData = [
    { sym: 'P\u2081', meaning: 'Measure honestly' },
    { sym: 'P\u2082', meaning: 'Yes, no, or unsure' },
    { sym: 'P\u2083', meaning: 'Can\u2019t check = not sure' },
    { sym: 'P\u2084', meaning: 'Judge by the fruit' },
    { sym: 'P\u2085', meaning: 'Always a way out' },
    { sym: 'P\u2086', meaning: 'Open to correction' },
    { sym: 'P\u2087', meaning: 'No filler words' },
    { sym: 'P\u2088', meaning: 'Same idea = same judgment' }
  ];

  function _initMatchGame() {
    var left = document.getElementById('match-left');
    var right = document.getElementById('match-right');
    if (!left || !right) return;

    /* Shuffle meanings */
    var shuffled = _matchData.map(function (d, i) { return { i: i, m: d.meaning }; });
    for (var i = shuffled.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = tmp;
    }

    /* Build buttons */
    left.innerHTML = _matchData.map(function (d, i) {
      return '<button class="match-btn" data-idx="' + i + '" data-side="sym" onclick="window._matchTap(this)">' + d.sym + '</button>';
    }).join('');
    right.innerHTML = shuffled.map(function (d) {
      return '<button class="match-btn" data-idx="' + d.i + '" data-side="meaning" onclick="window._matchTap(this)">' + d.m + '</button>';
    }).join('');
  }

  var _matchSelected = null;
  var _matchCorrect = 0;
  window._matchTap = function (btn) {
    if (btn.classList.contains('matched')) return;

    if (!_matchSelected) {
      /* First tap */
      _matchSelected = btn;
      btn.classList.add('selected');
    } else if (_matchSelected.dataset.side === btn.dataset.side) {
      /* Same side — switch selection */
      _matchSelected.classList.remove('selected');
      _matchSelected = btn;
      btn.classList.add('selected');
    } else {
      /* Different sides — check match */
      var idx1 = parseInt(_matchSelected.dataset.idx);
      var idx2 = parseInt(btn.dataset.idx);
      if (idx1 === idx2) {
        /* Correct match! */
        _matchSelected.classList.remove('selected');
        _matchSelected.classList.add('matched');
        btn.classList.add('matched');
        _matchCorrect++;
        if (_matchCorrect >= _matchData.length) {
          var score = document.getElementById('match-score');
          if (score) {
            score.style.display = 'block';
            score.textContent = '\u2b50 All 8 matched! You know the rules of honest reasoning!';
          }
        }
      } else {
        /* Wrong match — flash red */
        _matchSelected.classList.remove('selected');
        _matchSelected.classList.add('wrong-flash');
        btn.classList.add('wrong-flash');
        var a = _matchSelected, b = btn;
        setTimeout(function () {
          a.classList.remove('wrong-flash');
          b.classList.remove('wrong-flash');
        }, 1080);
      }
      _matchSelected = null;
    }
  };

  /* Match game init handled by MutationObserver via _initAllSimsAndExtras */

  /* Match game + all sims init is called from the main toggle */

})();
