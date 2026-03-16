* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --bg1: #9fd3c7;
  --bg2: #b6d0e2;
  --card: rgba(255, 255, 255, 0.88);
  --card-strong: rgba(255, 255, 255, 0.95);
  --text: #16353d;
  --muted: #4f6b73;
  --primary: #4c8ed9;
  --primary-dark: #2f6fb8;
  --primary-soft: rgba(76, 142, 217, 0.15);
  --border: rgba(255, 255, 255, 0.45);
  --shadow: 0 20px 45px rgba(22, 53, 61, 0.14);
  --shadow-hover: 0 28px 65px rgba(22, 53, 61, 0.22);
  --success: #22a06b;
  --danger: #e24d4d;
}

html,
body {
  min-height: 100%;
  font-family: Arial, Helvetica, sans-serif;
  color: var(--text);
  background:
    radial-gradient(circle at top left, rgba(255,255,255,0.35), transparent 30%),
    radial-gradient(circle at bottom right, rgba(255,255,255,0.22), transparent 30%),
    linear-gradient(135deg, var(--bg1), var(--bg2));
  overflow-x: hidden;
  scroll-behavior: smooth;
}

body {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 36px 18px 78px;
}

body::before,
body::after {
  content: "";
  position: fixed;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  filter: blur(72px);
  z-index: 0;
  opacity: 0.45;
  pointer-events: none;
  animation: floatBlob 10s ease-in-out infinite;
}

body::before {
  top: -80px;
  left: -90px;
  background: rgba(255, 255, 255, 0.35);
}

body::after {
  right: -60px;
  bottom: -80px;
  background: rgba(76, 142, 217, 0.22);
  animation-delay: 2s;
}

.page-center,
.page-wrap {
  position: relative;
  z-index: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-card,
.card,
.dashboard,
.glass-panel {
  position: relative;
  z-index: 1;
  background: var(--card);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid var(--border);
  border-radius: 24px;
  box-shadow: var(--shadow);
  animation: fadeUp 0.8s ease;
  overflow: hidden;
}

.main-card::before,
.card::before,
.dashboard::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    120deg,
    transparent 0%,
    rgba(255,255,255,0.18) 18%,
    transparent 36%
  );
  transform: translateX(-120%);
  transition: transform 0.9s ease;
  pointer-events: none;
}

.main-card:hover::before,
.card:hover::before,
.dashboard:hover::before {
  transform: translateX(120%);
}

.main-card:hover,
.card:hover,
.dashboard:hover {
  box-shadow: var(--shadow-hover);
}

.main-card {
  width: min(520px, 100%);
  text-align: center;
  padding: 44px 34px;
}

.card {
  width: min(500px, 100%);
  padding: 38px 28px;
}

.dashboard {
  width: min(1100px, 100%);
  padding: 32px;
  text-align: left;
}

.brand-title,
.page-title,
h1,
h2 {
  color: #006d6f;
  letter-spacing: -0.03em;
}

.brand-title {
  font-size: clamp(2.2rem, 4vw, 3rem);
  font-weight: 800;
  margin-bottom: 12px;
}

.brand-subtitle,
.page-subtitle,
p {
  color: var(--muted);
  line-height: 1.6;
}

.brand-subtitle {
  font-size: 1.02rem;
  margin-bottom: 30px;
}

.hero-buttons,
.button-row,
.inline-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  justify-content: center;
  align-items: center;
}

.primary-btn,
.secondary-btn,
button,
.role-card,
.link-btn,
.info-box,
input,
select,
textarea {
  transition:
    transform 0.28s ease,
    box-shadow 0.28s ease,
    background 0.28s ease,
    border 0.28s ease,
    opacity 0.28s ease;
}

.primary-btn,
.secondary-btn,
button,
.link-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 12px 22px;
  border-radius: 14px;
  border: none;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.98rem;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.primary-btn::after,
button::after,
.link-btn.primary::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    120deg,
    transparent 0%,
    rgba(255,255,255,0.18) 30%,
    transparent 60%
  );
  transform: translateX(-120%);
  transition: transform 0.65s ease;
}

.primary-btn:hover::after,
button:hover::after,
.link-btn.primary:hover::after {
  transform: translateX(120%);
}

.primary-btn,
button,
.link-btn.primary {
  color: white;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  box-shadow: 0 14px 30px rgba(76, 142, 217, 0.28);
}

.primary-btn:hover,
button:hover,
.link-btn.primary:hover {
  transform: translateY(-3px) scale(1.01);
  box-shadow: 0 20px 35px rgba(76, 142, 217, 0.36);
}

.secondary-btn,
.link-btn.secondary {
  color: var(--primary-dark);
  background: rgba(255,255,255,0.72);
  border: 1px solid rgba(76, 142, 217, 0.22);
}

.secondary-btn:hover,
.link-btn.secondary:hover {
  transform: translateY(-2px);
  background: white;
  box-shadow: 0 12px 24px rgba(22, 53, 61, 0.1);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

form {
  margin-top: 18px;
}

label {
  display: block;
  margin: 8px 0 8px;
  font-weight: 700;
  color: var(--text);
}

input,
select,
textarea {
  width: 100%;
  margin-bottom: 14px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid rgba(76, 142, 217, 0.18);
  outline: none;
  background: rgba(255,255,255,0.82);
  color: var(--text);
  font-size: 0.98rem;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.7);
}

input:hover,
select:hover,
textarea:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(22, 53, 61, 0.06);
}

input:focus,
select:focus,
textarea:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px var(--primary-soft);
  transform: translateY(-1px);
}

.role-grid,
.role-container {
  display: grid;
  grid-template-columns: repeat(3, minmax(170px, 1fr));
  gap: 22px;
  margin-top: 28px;
}

.role-card {
  background: var(--card-strong);
  border: 1px solid rgba(255,255,255,0.55);
  border-radius: 22px;
  padding: 28px 18px;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 12px 28px rgba(22, 53, 61, 0.1);
  animation: fadeUp 0.7s ease both;
}

.role-card:nth-child(2) {
  animation-delay: 0.08s;
}

.role-card:nth-child(3) {
  animation-delay: 0.16s;
}

.role-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: var(--shadow-hover);
  background: white;
}

.role-icon {
  font-size: 2rem;
  margin-bottom: 14px;
}

.role-card h3 {
  color: var(--text);
  font-size: 1.25rem;
}

.role-card p {
  margin-top: 8px;
  font-size: 0.92rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.dashboard-title {
  font-size: 2rem;
  font-weight: 800;
  color: #0a5f6c;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin: 20px 0;
}

.info-box {
  background: rgba(255,255,255,0.72);
  border: 1px solid rgba(76, 142, 217, 0.14);
  border-radius: 18px;
  padding: 18px;
}

.info-box:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 30px rgba(22, 53, 61, 0.08);
}

.info-box strong {
  display: block;
  margin-bottom: 8px;
  color: #0a5f6c;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 999px;
  font-weight: 700;
  background: rgba(255,255,255,0.8);
  border: 1px solid rgba(76, 142, 217, 0.2);
}

.status-live {
  color: var(--success);
}

.status-stop {
  color: var(--danger);
}

.map-shell {
  margin-top: 18px;
  border-radius: 22px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.45);
  box-shadow: 0 14px 30px rgba(22, 53, 61, 0.12);
  animation: fadeUp 0.9s ease;
}

.map-container {
  width: 100%;
  height: 600px;
}

.message {
  margin-top: 14px;
  font-weight: 700;
  color: var(--text);
}

.footer-credit {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 12px;
  text-align: center;
  z-index: 2;
  font-size: 0.92rem;
  color: rgba(22, 53, 61, 0.88);
  font-weight: 700;
  letter-spacing: 0.01em;
  animation: fadeUp 1s ease;
}

.fade-in {
  animation: fadeUp 0.75s ease both;
}

.slide-in {
  animation: slideIn 0.75s ease both;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(26px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(34px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes floatBlob {
  0%, 100% {
    transform: translateY(0px) translateX(0px);
  }
  50% {
    transform: translateY(18px) translateX(10px);
  }
}

@media (max-width: 900px) {
  .role-grid,
  .role-container {
    grid-template-columns: 1fr;
  }

  .dashboard {
    padding: 22px;
  }

  .map-container {
    height: 460px;
  }
}

@media (max-width: 600px) {
  body {
    padding: 22px 12px 72px;
  }

  .main-card,
  .card,
  .dashboard {
    border-radius: 20px;
  }

  .main-card,
  .card {
    padding: 28px 18px;
  }

  .brand-title {
    font-size: 2rem;
  }

  .hero-buttons,
  .button-row,
  .inline-actions {
    flex-direction: column;
  }

  .primary-btn,
  .secondary-btn,
  button,
  .link-btn {
    width: 100%;
  }
    }
