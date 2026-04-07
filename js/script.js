
/* ──────────────────────────────────────────
   구글 폼 연동 설정
   1. Google Forms에서 폼 생성
   2. 폼 미리보기 URL에서 formId 복사
   3. 각 필드의 entry ID 확인 (폼 소스 보기 or 개발자 도구)
   ────────────────────────────────────────── */
const GOOGLE_FORM_CONFIG = {
  // 폼 action URL: https://docs.google.com/forms/d/e/[FORM_ID]/formResponse
  actionUrl: 'https://docs.google.com/forms/d/e/1FAIpQLScjTbxUaCme3o2v9-MuzJ9TTFvefEvrTwnvXtwiuqTiEz5yGw/formResponse',
//1FAIpQLScjTbxUaCme3o2v9-MuzJ9TTFvefEvrTwnvXtwiuqTiEz5yGw
  // 각 필드의 Entry ID (구글 폼 소스에서 확인)
  fields: {
    name:       'entry.687788210',   // 이름 필드
    side:       'entry.78329411',   // 신랑/신부 측
    guests:     'entry.63150179',   // 동반 인원
    foods:      'entry.1380975312'    //  foods
  }
};

/* ── PETAL ANIMATION ── */
(function() {
  const canvas = document.getElementById('petal-canvas');
  const ctx = canvas.getContext('2d');
  let petals = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function Petal() {
    this.reset();
  }
  Petal.prototype.reset = function() {
    this.x = Math.random() * canvas.width;
    this.y = -20;
    this.size = 3 + Math.random() * 5;
    this.speedY = 0.4 + Math.random() * 0.8;
    this.speedX = (Math.random() - 0.5) * 0.6;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.03;
    this.opacity = 0.2 + Math.random() * 0.4;
    const colors = ['#e8d5c8','#d4b07a','#b5c4ae','#f2e8d8'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  };

  for (let i = 0; i < 25; i++) {
    const p = new Petal();
    p.y = Math.random() * canvas.height;
    petals.push(p);
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    petals.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX + Math.sin(p.y * 0.01) * 0.3;
      p.rotation += p.rotSpeed;
      if (p.y > canvas.height + 20) p.reset();

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    requestAnimationFrame(animate);
  }
  animate();
})();

/* ── SCROLL REVEAL ── */
(function() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

/* ── RSVP FORM ── */
document.getElementById('rsvpForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const form = this;
  const btn  = document.getElementById('submitBtn');
  const errEl = document.getElementById('formError');

  const name       = document.getElementById('guestName').value.trim();
  const side       = document.getElementById('side').value;
  //const accompany = document.querySelector('input[name="accompany"]:checked');
  const guests     = document.getElementById('guests').value;
  const foods    = document.getElementById('foods').value;

  // 유효성 검사
  errEl.style.display = 'none';
  if (!name) {
    errEl.textContent = 'Please enter your name.';
    errEl.style.display = 'block';
    document.getElementById('guestName').focus();
    return;
  }
  if (!side) {
    errEl.textContent = 'Please select Groom or Bride.';
    errEl.style.display = 'block';
    return;
  }

//   if (!accompany) {
//     errEl.textContent = '참석 여부를 선택해 주세요.';
//     errEl.style.display = 'block';
//     return;
//   }

  btn.disabled = true;
  btn.querySelector('span').textContent = 'Submitting...';

  const sideLabel = side === 'groom' ? 'Groom' : 'Bride';

  // ─── 구글 폼 제출 (no-cors 방식) ───
  const cfg = GOOGLE_FORM_CONFIG;

  // actionUrl이 아직 기본값이면 데모 모드로 동작
  if (cfg.actionUrl.includes('YOUR_FORM_ID')) {
    // 데모 모드: 1.5초 후 성공 화면
    setTimeout(() => showSuccess(form, btn), 1500);
    return;
  }

  const formData = new FormData();
  formData.append(cfg.fields.name,       name);
  formData.append(cfg.fields.side,       sideLabel);
  //formData.append(cfg.fields.accompany, accompany.value);
  formData.append(cfg.fields.guests,     guests);
  formData.append(cfg.fields.foods,      foods);
  //if (foods) formData.append(cfg.fields.foods, foods);
console.log(sideLabel);
console.log(guests);
console.log(foods);

  fetch(cfg.actionUrl, {
    method: 'POST',
    mode:   'no-cors',   // 구글 폼은 CORS 차단 → no-cors로 제출만
    body:   formData
  })
  .then(() => showSuccess(form, btn))
  .catch(() => showSuccess(form, btn)); // no-cors는 항상 opaque → 성공 처리
});

function showSuccess(form, btn) {
  form.style.display = 'none';
  document.getElementById('successOverlay').classList.add('visible');
  // 버튼 원복 (만약 돌아올 경우 대비)
  btn.disabled = false;
  btn.querySelector('span').textContent = 'Submit';
}
