/** Web Audio API 기반 합성 효과음.
 *
 * 외부 음원 파일이 필요 없고, 브라우저에서 자동재생 정책에 걸리지 않도록
 * AudioContext는 첫 사용자 입력 시점에 만들어진다.
 */

let _ctx: AudioContext | null = null;

function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (_ctx) return _ctx;
  const W = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
  const Ctor = W.AudioContext ?? W.webkitAudioContext;
  if (!Ctor) return null;
  _ctx = new Ctor();
  return _ctx;
}

interface ToneSpec {
  freq: number;
  startOffset: number;  // seconds from now
  duration: number;     // seconds
  type?: OscillatorType;
  peakGain?: number;    // 0~1
}

function playTones(specs: ToneSpec[]) {
  const c = ctx();
  if (!c) return;
  if (c.state === "suspended") void c.resume();
  const now = c.currentTime;
  for (const s of specs) {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = s.type ?? "sine";
    osc.frequency.value = s.freq;
    osc.connect(g);
    g.connect(c.destination);
    const t0 = now + s.startOffset;
    const t1 = t0 + s.duration;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(s.peakGain ?? 0.25, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t1);
    osc.start(t0);
    osc.stop(t1 + 0.02);
  }
}

/** 정답 효과음 — C5 메이저 아르페지오 + 짧은 5도 마무리. */
export function playCorrectSound() {
  playTones([
    { freq: 523.25, startOffset: 0.00, duration: 0.16, type: "sine", peakGain: 0.30 },  // C5
    { freq: 659.25, startOffset: 0.08, duration: 0.16, type: "sine", peakGain: 0.30 },  // E5
    { freq: 783.99, startOffset: 0.16, duration: 0.22, type: "sine", peakGain: 0.34 },  // G5
    { freq: 1046.5, startOffset: 0.26, duration: 0.30, type: "sine", peakGain: 0.32 },  // C6
  ]);
}

/** 오답 효과음 — 하강 부저(불협). */
export function playWrongSound() {
  playTones([
    { freq: 220.00, startOffset: 0.00, duration: 0.18, type: "square", peakGain: 0.18 }, // A3
    { freq: 207.65, startOffset: 0.00, duration: 0.18, type: "sine",   peakGain: 0.18 }, // 슬쩍 어긋난 음
    { freq: 174.61, startOffset: 0.16, duration: 0.30, type: "square", peakGain: 0.18 }, // F3
  ]);
}

/** 사용자 첫 인터랙션에 호출해 audio context를 ‘깨워’ 둠. */
export function primeAudio() {
  const c = ctx();
  if (c && c.state === "suspended") void c.resume();
}
