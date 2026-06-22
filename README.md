# 🛡️ Network Traffic Analyzer — Cybersecurity Dashboard

A fully responsive, dark-themed cybersecurity dashboard that simulates real-time network traffic monitoring. Built with vanilla HTML, CSS, and JavaScript — no frameworks, no build tools, no dependencies.

---

## 🖥️ Live Preview

> Open `index.html` directly in any modern browser — no server required.

---

## 📁 Project Structure

```
Network-Traffic-Analyser/
├── index.html       # Dashboard shell — layout, CDN imports, DOM structure
├── styles.css       # Cyber theme, animations, scanlines, glow effects
├── app.js           # Simulation engine — live feed, chart updates, state
└── README.md
```

---

## ✨ Features

### 📡 Live Packet Feed
- Simulates a live packet stream arriving every **1.5 seconds**
- Each packet row shows: **Timestamp, Source IP, Destination IP, Protocol, Port, Size, Status**
- Rows fade in and slide in with a smooth animation
- Protocol color-coding: `TCP → green`, `UDP → cyan`, `ICMP → amber`
- Auto-cleans the DOM — maintains a maximum of **30 rows** at all times
- **Pause Feed** button to freeze updates; **Clear Stream** to empty the log

### 📊 Metric Cards (4 live counters)
- **Total Packets Captured** — increments with every simulated packet
- **Active Connections** — live TCP socket count
- **Network Interfaces** — static display of detected adapters
- **Data Transferred** — cumulative bytes processed, formatted in KB/MB

### 🔌 Network Interfaces & Adapters Panel
- Displays 3 simulated interfaces: `eth0` (Ethernet), `lo` (Loopback), `wlan0` (Wireless)
- Each entry shows: Interface name, type, IP address, MAC address, and **UP/DOWN** status badge

### 🍩 Protocol Distribution Chart
- Live **Chart.js doughnut chart** — percentages recalculate dynamically as packets arrive
- Protocols tracked: **TCP / UDP / ICMP / Other**
- Soft-updates on every packet without re-rendering the chart

### 🔗 TCP/IP Active Connections Table
- Shows live active connections with: **Local Address, Local Port, Remote Address, Remote Port, State, Duration**
- States: `ESTABLISHED` (green), `TIME_WAIT` / `CLOSE_WAIT` (amber)
- Durations increment every second; states shift randomly to simulate real socket behavior

---

## 🎨 Design System

| Element | Value |
|---|---|
| Background | `#0a0e1a` |
| Panel surface | `#0f1526` |
| Border color | `#1e3a5f` |
| Primary accent | `#00ff88` (green) |
| Secondary accent | `#00cfff` (cyan) |
| Warning accent | `#ffaa00` (amber) |
| Data font | `Fira Code` (monospace) |
| UI font | `Outfit` (sans-serif) |

### Visual Effects
- **Scanlines** — subtle `linear-gradient` repeating overlay for a retro-terminal feel
- **Panel glow** — `box-shadow` on the top border of every widget
- **Live dot** — blinking green indicator in the header
- **Status badge** — pulsing border glow on the "Monitoring" badge
- **Row animation** — new packet rows fade in and slide horizontally on entry

---

## 🚀 Getting Started

### Prerequisites
- Any modern web browser (Chrome, Firefox, Edge, Safari)
- No installation, no build step, no server needed

### Run locally

```bash
# Clone the repository
git clone https://github.com/gayu389/Network-Traffic-Analyser.git

# Navigate into the folder
cd Network-Traffic-Analyser

# Open in browser
open index.html        # macOS
start index.html       # Windows
xdg-open index.html    # Linux
```

Or simply double-click `index.html` in your file explorer.

---

## 📦 Dependencies (CDN — no install needed)

| Library | Purpose |
|---|---|
| [Chart.js](https://www.chartjs.org/) | Doughnut chart for protocol distribution |
| [Lucide Icons](https://lucide.dev/) | UI icons throughout the dashboard |
| [Google Fonts — Outfit](https://fonts.google.com/specimen/Outfit) | Structural UI labels |
| [Google Fonts — Fira Code](https://fonts.google.com/specimen/Fira+Code) | Monospace data display |

---

## 📱 Responsive Breakpoints

| Viewport | Layout |
|---|---|
| `> 1200px` | Full 3-column grid |
| `768px – 1200px` | 2-column adjusted grid |
| `< 768px` | Single column stacked panels |

---

## 🎓 What This Project Demonstrates

- Real-time DOM manipulation with vanilla JavaScript (`setInterval`, dynamic row injection)
- Live chart updates with Chart.js without full re-renders
- CSS keyframe animations (fade-in, pulse, blink)
- Cyber/terminal aesthetic UI design using pure CSS
- TCP/IP and network protocol concepts (packet structure, socket states, interface info)
- Responsive dashboard layout without any CSS framework

---

## 🔒 Disclaimer

This is a **simulated** network traffic dashboard for educational and portfolio purposes. All IP addresses, MAC addresses, packet data, and connection states are randomly generated. No real network packets are captured or transmitted.

---

## 👤 Author

**Gayathri** — [@gayu389](https://github.com/gayu389)

---

## 📄 License

This project is open source under the [MIT License](LICENSE).
