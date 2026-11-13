const Avatar = (() => {
  const canvas = document.getElementById("stage");
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  const u = W / 500; // scale unit

  const C = {
    bgTop: "#fde2ee", bgBottom: "#f4b6d2",
    skin: "#f0b998", skinShade: "#dca07c", outline: "#a86f4c",
    hairTop: "#7a4e37", hairBottom: "#3b2418",
    sweater: "#c4588f", sweaterDark: "#9c3c72",
    eye: "#6b3e1f", brow: "#3b2418", lips: "#c0605a",
    cheek: "rgba(240, 110, 120, 0.30)",
  };

  const KEYS = ["neck", "head", "lShoulder", "rShoulder", "lElbow", "lWrist", "rElbow", "rWrist"];
  const IDLE_PTS = {
    neck: [0.5, 0.35], head: [0.5, 0.2],
    lShoulder: [0.4, 0.38], rShoulder: [0.6, 0.38],
    lElbow: [0.35, 0.55], lWrist: [0.3, 0.7],
    rElbow: [0.65, 0.55], rWrist: [0.7, 0.7],
  };

  // Hand shapes: c = curl per finger [thumb, index, middle, ring, pinky] (0 straight, 1 curled)
  // s = how much the fingers spread apart
  const HANDS = {
    relaxed:  { c: [0.3, 0.2, 0.25, 0.3, 0.35], s: 0.5 },
    open:     { c: [0, 0, 0, 0, 0], s: 1 },
    flat:     { c: [0.15, 0, 0, 0, 0], s: 0.1 },
    fist:     { c: [0.8, 1, 1, 1, 1], s: 0 },
    point:    { c: [0.9, 0, 1, 1, 1], s: 0.2 },
    thumbsUp: { c: [0, 1, 1, 1, 1], s: 0 },
    ily:      { c: [0, 0, 1, 1, 0], s: 1 },
    peace:    { c: [0.9, 0, 0, 1, 1], s: 1 },
    ok:       { c: [0.7, 0.75, 0, 0, 0], s: 0.8 },
  };

  const IDLE = { pts: IDLE_PTS, lh: HANDS.relaxed, rh: HANDS.relaxed };
  let current = IDLE;

  // ---------- helpers ----------
  function line(a, b, w, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = w;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(a[0] * W, a[1] * H);
    ctx.lineTo(b[0] * W, b[1] * H);
    ctx.stroke();
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function hairGradient(hy, r) {
    const g = ctx.createLinearGradient(0, hy - r * 1.3, 0, hy + r * 2);
    g.addColorStop(0, C.hairTop);
    g.addColorStop(1, C.hairBottom);
    return g;
  }

  // ---------- scene parts ----------
  function drawBackground() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, C.bgTop);
    g.addColorStop(1, C.bgBottom);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function drawTorso(P) {
    const l = P.lShoulder, r = P.rShoulder;
    const g = ctx.createLinearGradient(0, l[1] * H, 0, H);
    g.addColorStop(0, C.sweater);
    g.addColorStop(1, C.sweaterDark);
    ctx.fillStyle = g;
    ctx.strokeStyle = C.sweater;
    ctx.lineWidth = 24 * u;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(l[0] * W, l[1] * H);
    ctx.lineTo(r[0] * W, r[1] * H);
    ctx.lineTo(r[0] * W + 18 * u, H + 20);
    ctx.lineTo(l[0] * W - 18 * u, H + 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  function drawBackHair(P) {
    const hx = P.head[0] * W, hy = P.head[1] * H, r = 0.105 * W;
    ctx.fillStyle = hairGradient(hy, r);
    ctx.beginPath();
    ctx.moveTo(hx - r * 1.15, hy + r * 1.9);
    ctx.bezierCurveTo(hx - r * 1.7, hy + r * 0.8, hx - r * 1.35, hy - r * 1.5, hx, hy - r * 1.35);
    ctx.bezierCurveTo(hx + r * 1.35, hy - r * 1.5, hx + r * 1.7, hy + r * 0.8, hx + r * 1.15, hy + r * 1.9);
    ctx.quadraticCurveTo(hx + r * 0.95, hy + r * 1.45, hx + r * 0.6, hy + r * 1.9);
    ctx.quadraticCurveTo(hx, hy + r * 1.4, hx - r * 0.6, hy + r * 1.9);
    ctx.quadraticCurveTo(hx - r * 0.95, hy + r * 1.45, hx - r * 1.15, hy + r * 1.9);
    ctx.fill();
  }

  function drawNeckAndCollar(P) {
    const nx = P.neck[0] * W;
    const sy = ((P.lShoulder[1] + P.rShoulder[1]) / 2) * H;

    line([P.head[0], P.head[1] + 0.08], [P.neck[0], sy / H + 0.01], 30 * u, C.skinShade);

    ctx.fillStyle = C.skin;
    ctx.beginPath();
    ctx.moveTo(nx - 28 * u, sy - 6 * u);
    ctx.lineTo(nx + 28 * u, sy - 6 * u);
    ctx.lineTo(nx, sy + 46 * u);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = C.sweaterDark;
    ctx.lineWidth = 6 * u;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(nx - 30 * u, sy - 8 * u);
    ctx.lineTo(nx, sy + 50 * u);
    ctx.lineTo(nx + 30 * u, sy - 8 * u);
    ctx.stroke();
  }

  // ---------- HAND ----------
  const PALM_L = 40 * u, PALM_W = 38 * u;
  const FINGERS = [
    { len: 34, y: 14 }, { len: 38, y: 4.5 },
    { len: 34, y: -5 }, { len: 27, y: -14.5 },
  ];
  const FW = 8.5 * u; // finger width

  // sgn: +1 for left hand, -1 for right hand (thumb faces the body)
  function drawHand(wrist, elbow, hand, sgn) {
    const x = wrist[0] * W, y = wrist[1] * H;
    const ang = Math.atan2(y - elbow[1] * H, x - elbow[0] * W);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang); // x-axis points along the forearm
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // sleeve cuff
    ctx.fillStyle = C.sweaterDark;
    roundRect(-9 * u, -PALM_W / 2 - 3 * u, 11 * u, PALM_W + 6 * u, 4 * u);
    ctx.fill();

    // finger geometry
    const fingers = FINGERS.map((f, i) => {
      const c = hand.c[i + 1];
      const a = sgn * (1.5 - i) * 0.17 * hand.s;
      const L = f.len * u * (1 - 0.68 * c); // curled finger looks shorter
      const bx = PALM_L - 2 * u, by = sgn * f.y * u;
      return { bx, by, ex: bx + Math.cos(a) * L, ey: by + Math.sin(a) * L, c };
    });

    const tc = hand.c[0];
    const ta = sgn * (0.6 - tc * 1.1);
    const TL = 27 * u * (1 - 0.3 * tc);
    const tbx = PALM_L * 0.3, tby = sgn * PALM_W * 0.4;
    const thumb = { bx: tbx, by: tby, ex: tbx + Math.cos(ta) * TL, ey: tby + Math.sin(ta) * TL };

    // palm (outline then skin)
    const g = 3 * u;
    ctx.fillStyle = C.outline;
    roundRect(-g, -PALM_W / 2 - g, PALM_L + g * 2, PALM_W + g * 2, 11 * u);
    ctx.fill();
    ctx.fillStyle = C.skin;
    roundRect(0, -PALM_W / 2, PALM_L, PALM_W, 9 * u);
    ctx.fill();

    // fingers, each with its own outline so they stay separated
    for (const f of [...fingers].reverse()) {
      ctx.strokeStyle = C.outline;
      ctx.lineWidth = FW + 3.2 * u;
      ctx.beginPath(); ctx.moveTo(f.bx, f.by); ctx.lineTo(f.ex, f.ey); ctx.stroke();
      ctx.strokeStyle = C.skin;
      ctx.lineWidth = FW;
      ctx.beginPath(); ctx.moveTo(f.bx, f.by); ctx.lineTo(f.ex, f.ey); ctx.stroke();
    }

    // thumb
    ctx.strokeStyle = C.outline;
    ctx.lineWidth = 10 * u + 3.2 * u;
    ctx.beginPath(); ctx.moveTo(thumb.bx, thumb.by); ctx.lineTo(thumb.ex, thumb.ey); ctx.stroke();
    ctx.strokeStyle = C.skin;
    ctx.lineWidth = 10 * u;
    ctx.beginPath(); ctx.moveTo(thumb.bx, thumb.by); ctx.lineTo(thumb.ex, thumb.ey); ctx.stroke();

    // nails on straight fingers
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    for (const f of fingers) {
      if (f.c < 0.4) {
        ctx.beginPath();
        ctx.arc(f.ex - 3 * u, f.ey, 2.6 * u, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  function drawArms(P, lh, rh) {
    line(P.lShoulder, P.lElbow, 26 * u, C.sweater);
    line(P.rShoulder, P.rElbow, 26 * u, C.sweater);
    line(P.lElbow, P.lWrist, 21 * u, C.sweater);
    line(P.rElbow, P.rWrist, 21 * u, C.sweater);
    // shoulder + elbow joints
    ctx.fillStyle = C.sweater;
    for (const k of ["lShoulder", "rShoulder", "lElbow", "rElbow"]) {
      ctx.beginPath();
      ctx.arc(P[k][0] * W, P[k][1] * H, 12 * u, 0, Math.PI * 2);
      ctx.fill();
    }
    drawHand(P.lWrist, P.lElbow, lh, 1);
    drawHand(P.rWrist, P.rElbow, rh, -1);
  }

  // ---------- FACE ----------
  function drawFace(P, now) {
    const hx = P.head[0] * W, hy = P.head[1] * H, r = 0.105 * W;

    // ears
    ctx.fillStyle = C.skinShade;
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(hx + s * r * 0.92, hy + 5 * u, 7 * u, 9 * u, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // face with soft shading
    const fg = ctx.createRadialGradient(hx - r * 0.2, hy - r * 0.2, r * 0.2, hx, hy, r * 1.2);
    fg.addColorStop(0, "#f7c9a9");
    fg.addColorStop(1, C.skin);
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.ellipse(hx, hy + 2 * u, r * 0.92, r * 1.05, 0, 0, Math.PI * 2);
    ctx.fill();

    // side-parted fringe
    ctx.fillStyle = hairGradient(hy, r);
    ctx.beginPath();
    ctx.moveTo(hx - r * 1.0, hy + r * 0.55);
    ctx.bezierCurveTo(hx - r * 1.3, hy - r * 1.15, hx + r * 1.3, hy - r * 1.4, hx + r * 1.0, hy + r * 0.55);
    ctx.bezierCurveTo(hx + r * 0.85, hy - r * 0.2, hx + r * 0.3, hy - r * 0.62, hx - r * 0.3, hy - r * 0.74);
    ctx.bezierCurveTo(hx - r * 0.7, hy - r * 0.55, hx - r * 0.85, hy - r * 0.1, hx - r * 1.0, hy + r * 0.55);
    ctx.fill();

    // hair highlights
    ctx.strokeStyle = "rgba(255,255,255,0.14)";
    ctx.lineWidth = 2.5 * u;
    ctx.lineCap = "round";
    for (const o of [0, 0.25]) {
      ctx.beginPath();
      ctx.moveTo(hx + r * (0.1 + o), hy - r * 1.15);
      ctx.quadraticCurveTo(hx + r * (0.85 + o * 0.5), hy - r * 0.9, hx + r * 0.95, hy - r * 0.05);
      ctx.stroke();
    }

    // cheeks
    ctx.fillStyle = C.cheek;
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(hx + s * r * 0.58, hy + r * 0.45, 10 * u, 7 * u, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // eyebrows
    ctx.strokeStyle = C.brow;
    ctx.lineWidth = 3.6 * u;
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(hx + s * r * 0.2, hy - r * 0.2);
      ctx.quadraticCurveTo(hx + s * r * 0.45, hy - r * 0.38, hx + s * r * 0.7, hy - r * 0.22);
      ctx.stroke();
    }

    // eyes (blink every ~3.5s)
    const blinking = now % 3500 < 140;
    for (const s of [-1, 1]) {
      const ex = hx + s * r * 0.4, ey = hy + r * 0.08;
      if (blinking) {
        ctx.strokeStyle = C.brow;
        ctx.lineWidth = 2.8 * u;
        ctx.beginPath();
        ctx.moveTo(ex - 9 * u, ey);
        ctx.quadraticCurveTo(ex, ey + 4 * u, ex + 9 * u, ey);
        ctx.stroke();
      } else {
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.ellipse(ex, ey, 9.5 * u, 8 * u, 0, 0, Math.PI * 2);
        ctx.fill();
        const ig = ctx.createRadialGradient(ex, ey, 1, ex, ey, 6 * u);
        ig.addColorStop(0, "#9a6a3a");
        ig.addColorStop(1, C.eye);
        ctx.fillStyle = ig;
        ctx.beginPath();
        ctx.arc(ex, ey, 6 * u, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#1a0f08";
        ctx.beginPath();
        ctx.arc(ex, ey, 2.9 * u, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(ex + 2 * u, ey - 2.2 * u, 1.7 * u, 0, Math.PI * 2);
        ctx.fill();
        // upper lid + lash
        ctx.strokeStyle = C.brow;
        ctx.lineWidth = 3 * u;
        ctx.beginPath();
        ctx.arc(ex, ey + 1 * u, 9.5 * u, Math.PI * 1.08, Math.PI * 1.92);
        ctx.stroke();
        ctx.lineWidth = 2.2 * u;
        ctx.beginPath();
        ctx.moveTo(ex + s * 9 * u, ey - 2 * u);
        ctx.lineTo(ex + s * 13 * u, ey - 6 * u);
        ctx.stroke();
      }
    }

    // nose
    ctx.strokeStyle = C.skinShade;
    ctx.lineWidth = 2.6 * u;
    ctx.beginPath();
    ctx.moveTo(hx - 1 * u, hy + r * 0.2);
    ctx.quadraticCurveTo(hx + 6 * u, hy + r * 0.46, hx - 1 * u, hy + r * 0.52);
    ctx.stroke();

    // smile with teeth
    const mx = hx, my = hy + r * 0.58, mw = r * 0.42;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(mx - mw, my);
    ctx.quadraticCurveTo(mx, my + mw * 1.1, mx + mw, my);
    ctx.quadraticCurveTo(mx, my + mw * 0.25, mx - mw, my);
    ctx.fill();
    ctx.strokeStyle = C.lips;
    ctx.lineWidth = 3 * u;
    ctx.beginPath();
    ctx.moveTo(mx - mw, my);
    ctx.quadraticCurveTo(mx, my + mw * 1.1, mx + mw, my);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(mx - mw, my);
    ctx.quadraticCurveTo(mx, my + mw * 0.2, mx + mw, my);
    ctx.stroke();
  }

  // ---------- render ----------
  function render(state, now) {
    const P = state.pts;
    drawBackground();
    ctx.save();
    ctx.translate(0, Math.sin(now / 700) * 1.5 * u); // gentle breathing
    drawTorso(P);
    drawBackHair(P);
    drawNeckAndCollar(P);
    drawArms(P, state.lh, state.rh);
    drawFace(P, now);
    ctx.restore();
  }

  function loop(now) {
    render(current, now);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // ---------- animation ----------
  function resolve(frame) {
    return {
      pts: { ...IDLE_PTS, ...frame },
      lh: HANDS[frame.lHand] || HANDS.relaxed,
      rh: HANDS[frame.rHand] || HANDS.relaxed,
    };
  }

  function lerpHand(a, b, t) {
    return { c: a.c.map((v, i) => v + (b.c[i] - v) * t), s: a.s + (b.s - a.s) * t };
  }

  function lerpPts(a, b, t) {
    const out = {};
    for (const k of KEYS) {
      out[k] = [a[k][0] + (b[k][0] - a[k][0]) * t, a[k][1] + (b[k][1] - a[k][1]) * t];
    }
    return out;
  }

  function mix(a, b, t) {
    return {
      pts: lerpPts(a.pts, b.pts, t),
      lh: lerpHand(a.lh, b.lh, t),
      rh: lerpHand(a.rh, b.rh, t),
    };
  }

  function playSign(sign) {
    return new Promise(resolveDone => {
      const R = sign.frames.map(resolve);
      const start = performance.now();

      function step(now) {
        const p = Math.min((now - start) / sign.duration, 1);
        const f = p * (R.length - 1);
        const i = Math.floor(f);
        let t = f - i;
        t = t * t * (3 - 2 * t); // smooth easing
        current = i >= R.length - 1 ? R[R.length - 1] : mix(R[i], R[i + 1], t);

        if (p < 1) requestAnimationFrame(step);
        else resolveDone();
      }
      requestAnimationFrame(step);
    });
  }

  const wait = ms => new Promise(r => setTimeout(r, ms));

  async function playSequence(signs) {
    for (const s of signs) {
      await playSign(s);
      await wait(150);
    }
    current = IDLE;
  }

  return { playSequence };
})();