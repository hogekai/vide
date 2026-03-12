<script setup lang="ts">
import { useData } from "vitepress";
import HeroDemo from "./HeroDemo.vue";

const { site } = useData();
const base = site.value.base;
</script>

<template>
  <div class="landing">
    <!-- Decorative squiggles -->
    <svg class="sq sq1" width="80" height="40" viewBox="0 0 80 40" fill="none">
      <path d="M4 20 Q14 4 24 20 Q34 36 44 20 Q54 4 64 20 Q74 36 80 16" stroke="#7EC8C8" stroke-width="2"
        stroke-linecap="round" />
    </svg>
    <svg class="sq sq2" width="60" height="32" viewBox="0 0 60 32" fill="none">
      <path d="M4 16 Q11 4 18 16 Q25 28 32 16 Q39 4 46 16 Q53 28 58 10" stroke="#7EC8C8" stroke-width="1.8"
        stroke-linecap="round" />
    </svg>
    <svg class="sq sq3" width="40" height="20" viewBox="0 0 40 20" fill="none">
      <path d="M2 10 Q7 2 12 10 Q17 18 22 10 Q27 2 32 10 Q37 18 40 6" stroke="#7EC8C8" stroke-width="1.4"
        stroke-linecap="round" />
    </svg>

    <!-- Nav -->
    <nav class="lnav">
      <a :href="base" class="logo">
        <div class="logo-mark"><svg width="8" height="9" viewBox="0 0 8 9" fill="#0e1c1a"><path d="M0 .5 L8 4.5 L0 8.5Z"/></svg></div>
        vide
      </a>
      <div class="nav-links">
        <a :href="`${base}getting-started`" class="nl">Guide</a>
        <a :href="`${base}plugins/hls`" class="nl">Plugins</a>
        <a :href="`${base}demo`" class="nl">Playground</a>
        <a href="https://github.com/hogekai/vide" class="nl">GitHub &#8599;</a>
        <a :href="`${base}getting-started`" class="nav-cta">Get started</a>
      </div>
    </nav>

    <!-- Hero -->
    <section class="hero">
      <div class="hero-inner">
        <div class="ht">
          <h1>A tiny player<br>that's <i>actually</i><br>good.</h1>
          <p class="hdesc">3 KB gzip core. Modular streaming, ads, DRM, and UI &mdash; add only what you need. Built on web standards.</p>
          <div class="hbtns">
            <a :href="`${base}getting-started`" class="btn btn-main">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                stroke-linecap="round" stroke-linejoin="round">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
              Quick start
            </a>
            <a href="https://github.com/hogekai/vide" class="btn btn-sec">View on GitHub</a>
          </div>
          <div class="hstat">
            <span><strong>3 KB</strong> gzipped</span>
            <span class="hstat-dot">&middot;</span>
            <span>zero deps</span>
            <span class="hstat-dot">&middot;</span>
            <span>ESM only</span>
          </div>
        </div>

        <div class="pw">
          <div class="pshell">
            <HeroDemo />
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="features">
      <div class="si">
        <div class="ey">Why Vide</div>
        <h2>Small footprint,<br>big capability.</h2>
        <p class="sdesc">No bloat, no implicit behavior. Just a clean, composable player that delegates to the browser whenever possible.</p>
        <div class="fgrid">
          <div class="fcard">
            <div class="ficon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div class="ftitle">Web Standards First</div>
            <div class="fdesc">Proxies HTMLVideoElement directly. play(), pause(), currentTime &mdash; the API you already know.</div>
          </div>
          <div class="fcard">
            <div class="ficon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div class="ftitle">3 KB Core</div>
            <div class="fdesc">Loads instantly. Zero runtime deps. Every plugin is a separate import &mdash; pay only for what you use.</div>
          </div>
          <div class="fcard">
            <div class="ficon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <div class="ftitle">Full Ad Stack</div>
            <div class="fdesc">VAST 4.2, VMAP, SSAI, VPAID, SIMID, OMID, and Google IMA &mdash; every ad format, built-in.</div>
          </div>
          <div class="fcard">
            <div class="ficon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path
                  d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
              </svg>
            </div>
            <div class="ftitle">Streaming &amp; DRM</div>
            <div class="fdesc">HLS and DASH with adaptive bitrate. Widevine, FairPlay, PlayReady, and ClearKey.</div>
          </div>
          <div class="fcard">
            <div class="ficon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <div class="ftitle">Framework Ready</div>
            <div class="fdesc">React hooks, Vue 3 composables, Svelte 5. First-class TypeScript. Tree-shakeable ESM.</div>
          </div>
          <div class="fcard">
            <div class="ficon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div class="ftitle">Event API</div>
            <div class="fdesc">Subscribe to anything. Build analytics, chapters, and custom UI on top of a clean event bus.</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick Start -->
    <section class="qs">
      <div class="si">
        <div class="qgrid">
          <div>
            <div class="ey">Quick start</div>
            <h2>Three steps<br>and you're done.</h2>
            <p class="sdesc">Sensible defaults, thorough docs, and TypeScript types from the first import.</p>
            <div class="steps">
              <div class="step">
                <div class="stepn">1</div>
                <div class="stept">
                  <h3>Install</h3>
                  <p>npm, pnpm, or a script tag.</p>
                  <code class="stepc">pnpm add @videts/vide</code>
                </div>
              </div>
              <div class="step">
                <div class="stepn">2</div>
                <div class="stept">
                  <h3>Create</h3>
                  <p>One function. Pass a video element.</p>
                  <code class="stepc">createPlayer(videoEl)</code>
                </div>
              </div>
              <div class="step">
                <div class="stepn">3</div>
                <div class="stept">
                  <h3>Extend</h3>
                  <p>Add plugins for what you need.</p>
                  <code class="stepc">player.use(hls())</code>
                </div>
              </div>
            </div>
            <a :href="`${base}getting-started`" class="btn btn-main" style="width: fit-content">Read the full docs
              &rarr;</a>
          </div>
          <div>
            <div class="code-wrap">
              <div class="code-bar">
                <div class="dot r" />
                <div class="dot y" />
                <div class="dot g" />
                <span class="fname">main.ts</span>
              </div>
              <pre class="code-body"><span class="cm">// pnpm add @videts/vide</span>
<span class="kw">import</span> { createPlayer } <span class="kw">from</span> <span class="str">"@videts/vide"</span>;
<span class="kw">import</span> { hls } <span class="kw">from</span> <span class="str">"@videts/vide/hls"</span>;
<span class="kw">import</span> { ui } <span class="kw">from</span> <span class="str">"@videts/vide/ui"</span>;
<span class="kw">import</span> <span class="str">"@videts/vide/ui/theme.css"</span>;

<span class="kw">const</span> video = document.<span class="fn">querySelector</span>(<span class="str">"video"</span>);
<span class="kw">const</span> player = <span class="fn">createPlayer</span>(video);

player.<span class="fn">use</span>(<span class="fn">hls</span>());
player.<span class="fn">use</span>(<span class="fn">ui</span>({ container: video.parentElement }));

player.src = <span class="str">"https://example.com/live.m3u8"</span>;

<span class="cm">// Listen for events</span>
player.<span class="fn">on</span>(<span class="str">"play"</span>, () =&gt; {
  console.<span class="fn">log</span>(<span class="str">"playing"</span>);
});</pre>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Plugin sizes -->
    <section class="sizes">
      <div class="si">
        <div class="ey">Bundle impact</div>
        <h2>Pay only for what you use.</h2>
        <p class="sdesc">Every plugin is a separate entry point. Tree-shaking works out of the box.</p>
        <div class="size-grid">
          <div class="size-item"><span class="size-name">Core</span><span class="size-val">3.0 KB</span></div>
          <div class="size-item"><span class="size-name">UI + Theme</span><span class="size-val">10.3 KB</span></div>
          <div class="size-item"><span class="size-name">HLS</span><span class="size-val">1.4 KB</span></div>
          <div class="size-item"><span class="size-name">DASH</span><span class="size-val">1.4 KB</span></div>
          <div class="size-item"><span class="size-name">VAST 4.2</span><span class="size-val">7.9 KB</span></div>
          <div class="size-item"><span class="size-name">VMAP</span><span class="size-val">8.8 KB</span></div>
          <div class="size-item"><span class="size-name">DRM</span><span class="size-val">2.6 KB</span></div>
          <div class="size-item"><span class="size-name">SSAI</span><span class="size-val">2.3 KB</span></div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <div class="ctaband">
      <h2>Ship a better player today.</h2>
      <p>Open source, MIT licensed. Built for teams who care about performance.</p>
      <div class="ctabtns">
        <a :href="`${base}getting-started`" class="btn btn-main">Get started</a>
        <a href="https://github.com/hogekai/vide" class="btn-ctasec">View on GitHub</a>
      </div>
    </div>

    <!-- Footer -->
    <footer class="lfooter">
      <div class="flogo">
        <div class="logo-mark" style="width: 20px; height: 20px"><svg width="7" height="8" viewBox="0 0 8 9" fill="#0e1c1a"><path d="M0 .5 L8 4.5 L0 8.5Z"/></svg></div>
        vide
      </div>
      <div class="flinks">
        <a :href="`${base}getting-started`" class="flink">Docs</a>
        <a href="https://github.com/hogekai/vide" class="flink">GitHub</a>
        <a href="https://www.npmjs.com/package/@videts/vide" class="flink">npm</a>
        <a :href="`${base}demo`" class="flink">Playground</a>
      </div>
      <div class="fcopy">MIT &middot; 2025</div>
    </footer>
  </div>
</template>

<style scoped>
/* ── Tokens ── */
.landing {
  --t: #7EC8C8;
  --tp: rgba(126, 200, 200, 0.1);
  --tb: rgba(126, 200, 200, 0.22);
  --bg: #f5f3ef;
  --card: #faf9f6;
  --ink: #1a1916;
  --ink2: #5a5650;
  --ink3: #a09a92;
  --r: 14px;

  font-family: 'Nunito', system-ui, sans-serif;
  background: var(--bg);
  color: var(--ink);
  overflow-x: hidden;
}

/* Texture overlay */
.landing::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.03'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 999;
  opacity: 0.4;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ── Squiggles ── */
.sq {
  position: absolute;
  pointer-events: none;
  opacity: 0.18;
}

.sq1 {
  top: 80px;
  left: 48px;
  transform: rotate(-12deg);
}

.sq2 {
  bottom: 80px;
  right: 60px;
  transform: rotate(15deg);
}

.sq3 {
  top: 55%;
  left: 20px;
  transform: rotate(-5deg);
  opacity: 0.1;
}

/* ── Nav ── */
.lnav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 58px;
  padding: 0 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(245, 243, 239, 0.9);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(126, 200, 200, 0.15);
}

.logo {
  font-family: 'Fraunces', serif;
  font-weight: 600;
  font-size: 18px;
  color: var(--ink);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: -0.01em;
}

.logo-mark {
  width: 22px;
  height: 22px;
  border-radius: 7px;
  background: var(--t);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0e1c1a;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2px;
}

.nl {
  font-size: 13px;
  font-weight: 400;
  color: var(--ink3);
  text-decoration: none;
  padding: 5px 10px;
  border-radius: 8px;
  transition: color 0.13s, background 0.13s;
}

.nl:hover {
  color: var(--ink);
  background: rgba(26, 25, 22, 0.05);
}

.nav-cta {
  font-family: 'Nunito', sans-serif;
  font-size: 12.5px;
  font-weight: 600;
  color: #0e1c1a;
  background: var(--t);
  border: none;
  cursor: pointer;
  padding: 6px 16px;
  border-radius: 100px;
  text-decoration: none;
  box-shadow: 0 2px 10px rgba(126, 200, 200, 0.35);
  transition: all 0.15s;
}

.nav-cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(126, 200, 200, 0.45);
}

/* ── Hero ── */
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 48px 72px;
  position: relative;
  overflow: hidden;
}

.hero-inner {
  max-width: 1160px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  gap: 72px;
  align-items: center;
  position: relative;
  z-index: 1;
}

.ht {
  animation: up 0.6s ease both;
}

h1 {
  font-family: 'Fraunces', serif;
  font-size: clamp(38px, 4vw, 58px);
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.025em;
  color: var(--ink);
  margin-bottom: 14px;
}

h1 i {
  font-style: italic;
  font-weight: 400;
  color: var(--t);
  display: inline-block;
  position: relative;
}

h1 i::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 3px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='3'%3E%3Cpath d='M0 2.5 Q7.5 0 15 2.5 Q22.5 5 30 2.5' fill='none' stroke='%237EC8C8' stroke-width='1.5'/%3E%3C/svg%3E") repeat-x;
}

.hdesc {
  font-size: 16px;
  font-weight: 300;
  line-height: 1.7;
  color: var(--ink2);
  margin-bottom: 30px;
  max-width: 420px;
}

.hbtns {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  font-family: 'Nunito', sans-serif;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  padding: 11px 24px;
  border-radius: 100px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  transition: all 0.16s;
}

.btn-main {
  color: #0e1c1a;
  background: var(--t);
  box-shadow: 0 3px 16px rgba(126, 200, 200, 0.35);
}

.btn-main:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 22px rgba(126, 200, 200, 0.48);
}

.btn-sec {
  color: var(--ink2);
  background: var(--card);
  border: 1.5px solid rgba(26, 25, 22, 0.1);
}

.btn-sec:hover {
  border-color: var(--tb);
  background: var(--tp);
  color: var(--ink);
}

.hstat {
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--ink3);
}

.hstat strong {
  color: var(--ink2);
  font-weight: 600;
}

.hstat-dot {
  color: var(--tb);
}

/* ── Player shell ── */
.pw {
  animation: up 0.6s 0.14s ease both;
}

.pshell {
  background: #111614;
  border-radius: 22px;
  overflow: hidden;
  box-shadow:
    0 0 0 1.5px rgba(126, 200, 200, 0.18),
    0 16px 48px rgba(0, 0, 0, 0.2),
    0 2px 6px rgba(0, 0, 0, 0.08);
}

/* ── Features ── */
.features {
  padding: 100px 48px;
  background: var(--card);
  border-top: 1px solid rgba(26, 25, 22, 0.07);
  border-bottom: 1px solid rgba(26, 25, 22, 0.07);
}

.si {
  max-width: 1160px;
  margin: 0 auto;
}

.ey {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--t);
  margin-bottom: 10px;
}

h2 {
  font-family: 'Fraunces', serif;
  font-size: clamp(28px, 2.8vw, 42px);
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--ink);
  margin-bottom: 10px;
  line-height: 1.15;
}

.sdesc {
  font-size: 15px;
  font-weight: 300;
  color: var(--ink2);
  line-height: 1.7;
  max-width: 520px;
  margin-bottom: 52px;
}

.fgrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.fcard {
  padding: 28px 24px;
  border-radius: 16px;
  border: 1.5px solid rgba(26, 25, 22, 0.07);
  background: var(--bg);
  transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
}

.fcard:hover {
  border-color: var(--tb);
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(126, 200, 200, 0.1);
}

.ficon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--tp);
  border: 1px solid var(--tb);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--t);
  margin-bottom: 13px;
}

.ftitle {
  font-family: 'Fraunces', serif;
  font-size: 14.5px;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 6px;
  letter-spacing: -0.01em;
}

.fdesc {
  font-size: 13px;
  font-weight: 300;
  color: var(--ink3);
  line-height: 1.6;
}

/* ── Quick Start ── */
.qs {
  padding: 100px 48px;
  background: var(--bg);
}

.qgrid {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: 72px;
  align-items: center;
}

.steps {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-bottom: 28px;
}

.step {
  display: flex;
  gap: 13px;
  align-items: flex-start;
}

.stepn {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--tp);
  border: 1.5px solid var(--tb);
  color: var(--t);
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Fraunces', serif;
}

.stept h3 {
  font-family: 'Fraunces', serif;
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 3px;
  letter-spacing: -0.01em;
}

.stept p {
  font-size: 13px;
  font-weight: 300;
  color: var(--ink3);
  line-height: 1.55;
}

.stepc {
  display: inline-block;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  background: var(--tp);
  color: var(--t);
  border: 1px solid var(--tb);
  padding: 2px 7px;
  border-radius: 7px;
  margin-top: 5px;
}

/* ── Code block ── */
.code-wrap {
  background: #111614;
  border-radius: 16px;
  border: 1px solid rgba(126, 200, 200, 0.1);
  overflow: hidden;
  box-shadow: 0 6px 32px rgba(0, 0, 0, 0.12);
}

.code-bar {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(255, 255, 255, 0.02);
}

.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.dot.r {
  background: #ff5f57;
}

.dot.y {
  background: #febc2e;
}

.dot.g {
  background: #28c840;
}

.fname {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.22);
  margin-left: 4px;
  font-family: 'Nunito', monospace;
  font-weight: 400;
}

.code-body {
  padding: 18px 18px 20px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.85;
  color: #8aada7;
  overflow-x: auto;
  white-space: pre;
}

.kw {
  color: var(--t);
}

.str {
  color: #c8a87e;
}

.cm {
  color: rgba(138, 173, 167, 0.3);
  font-style: italic;
}

.fn {
  color: #d4c07a;
}

/* ── Plugin sizes ── */
.sizes {
  padding: 100px 48px;
  background: var(--card);
  border-top: 1px solid rgba(26, 25, 22, 0.07);
}

.size-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.size-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-radius: 12px;
  border: 1.5px solid rgba(26, 25, 22, 0.07);
  background: var(--bg);
  transition: border-color 0.2s;
}

.size-item:hover {
  border-color: var(--tb);
}

.size-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--ink);
}

.size-val {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  font-weight: 600;
  color: var(--t);
}

/* ── CTA ── */
.ctaband {
  padding: 96px 48px;
  text-align: center;
  background: #111614;
  position: relative;
  overflow: hidden;
}

.ctaband::before {
  content: '';
  position: absolute;
  top: -2px;
  left: 0;
  right: 0;
  height: 36px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 36' preserveAspectRatio='none'%3E%3Cpath d='M0 36 Q200 0 400 18 Q600 36 800 12 Q1000 0 1200 20 L1200 36Z' fill='%23faf9f6'/%3E%3C/svg%3E") no-repeat top center / cover;
}

.ctaband h2 {
  color: #d8ecea;
  margin-bottom: 10px;
}

.ctaband p {
  color: rgba(216, 236, 234, 0.38);
  font-size: 14px;
  font-weight: 300;
  margin-bottom: 28px;
}

.ctabtns {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-ctasec {
  font-family: 'Nunito', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: rgba(216, 236, 234, 0.45);
  background: rgba(255, 255, 255, 0.06);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  padding: 9px 20px;
  border-radius: 100px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  transition: all 0.15s;
  cursor: pointer;
}

.btn-ctasec:hover {
  color: rgba(216, 236, 234, 0.7);
  border-color: rgba(126, 200, 200, 0.3);
}

/* ── Footer ── */
.lfooter {
  padding: 36px 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(26, 25, 22, 0.08);
}

.flogo {
  font-family: 'Fraunces', serif;
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
  display: flex;
  align-items: center;
  gap: 7px;
  letter-spacing: -0.01em;
}

.flinks {
  display: flex;
  gap: 18px;
}

.flink {
  font-size: 12.5px;
  color: var(--ink3);
  text-decoration: none;
  font-weight: 400;
  transition: color 0.13s;
}

.flink:hover {
  color: var(--t);
}

.fcopy {
  font-size: 12px;
  color: var(--ink3);
}

/* ── Anim ── */
@keyframes up {
  from {
    opacity: 0;
    transform: translateY(18px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

/* ── Responsive ── */
@media (max-width: 780px) {

  .hero-inner,
  .qgrid {
    grid-template-columns: 1fr;
  }

  .fgrid {
    grid-template-columns: 1fr 1fr;
  }

  .size-grid {
    grid-template-columns: 1fr 1fr;
  }

  .nav-links {
    display: none;
  }

  .lnav {
    padding: 0 18px;
  }

  .lfooter {
    flex-direction: column;
    gap: 16px;
    text-align: center;
    padding: 28px 20px;
  }

  .hero {
    padding: 74px 20px 52px;
  }

  .features,
  .qs,
  .sizes {
    padding: 60px 20px;
  }
}

@media (max-width: 480px) {

  .fgrid,
  .size-grid {
    grid-template-columns: 1fr;
  }
}
</style>
