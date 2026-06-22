// App.js - Network Traffic Analyzer Simulation Logic

// -------------------------------------------------------------
// STATE MANAGEMENT
// -------------------------------------------------------------
const state = {
    isMonitoring: true,
    totalPackets: 48291,
    activeConnections: 14,
    dataTransferredBytes: 2.4 * 1024 * 1024, // 2.4 MB in bytes
    interfaces: [
        { name: 'eth0', type: 'Ethernet', ip: '192.168.1.5', mac: 'A4:C3:F0:12:88:2B', status: 'UP' },
        { name: 'lo', type: 'Loopback', ip: '127.0.0.1', mac: '00:00:00:00:00:00', status: 'UP' },
        { name: 'wlan0', type: 'Wireless', ip: '192.168.1.8', mac: 'A4:C3:F0:12:88:2C', status: 'DOWN' }
    ],
    // Protocol counts initialized to match baseline 48291 packets (TCP 58%, UDP 27%, ICMP 10%, Other 5%)
    protocolCounts: {
        TCP: Math.round(48291 * 0.58),
        UDP: Math.round(48291 * 0.27),
        ICMP: Math.round(48291 * 0.10),
        Other: Math.round(48291 * 0.05)
    },
    // Active connections mock table (6-8 rows)
    connections: [
        { localIp: '192.168.1.5', localPort: 49210, remoteIp: '140.82.112.4', remotePort: 443, state: 'ESTABLISHED', duration: 184 },
        { localIp: '192.168.1.5', localPort: 49301, remoteIp: '8.8.8.8', remotePort: 53, state: 'TIME_WAIT', duration: 12 },
        { localIp: '192.168.1.5', localPort: 49182, remoteIp: '172.217.16.142', remotePort: 443, state: 'ESTABLISHED', duration: 421 },
        { localIp: '127.0.0.1', localPort: 5432, remoteIp: '127.0.0.1', remotePort: 49152, state: 'ESTABLISHED', duration: 3200 },
        { localIp: '192.168.1.5', localPort: 49344, remoteIp: '1.1.1.1', remotePort: 443, state: 'CLOSE_WAIT', duration: 45 },
        { localIp: '192.168.1.5', localPort: 49455, remoteIp: '54.210.12.98', remotePort: 443, state: 'ESTABLISHED', duration: 89 },
        { localIp: '192.168.1.5', localPort: 49456, remoteIp: '192.168.1.1', remotePort: 80, state: 'ESTABLISHED', duration: 15 },
        { localIp: '192.168.1.5', localPort: 49500, remoteIp: '104.244.42.1', remotePort: 443, state: 'TIME_WAIT', duration: 8 }
    ]
};

// Common parameters for simulation
const MOCK_IPS = [
    '192.168.1.1', '192.168.1.12', '192.168.1.15', '192.168.1.20', '192.168.1.100',
    '10.0.0.1', '10.0.0.15', '10.0.0.42', '10.0.0.88',
    '8.8.8.8', '1.1.1.1', '140.82.112.4', '172.217.16.142', '54.210.12.98',
    '185.199.108.153', '104.244.42.1', '23.221.220.10'
];

const PROTOCOLS = ['TCP', 'UDP', 'ICMP', 'IGMP', 'DNS', 'HTTP', 'HTTPS'];

// -------------------------------------------------------------
// HELPER FUNCTIONS
// -------------------------------------------------------------
function formatBytes(bytes) {
    if (bytes >= 1048576) {
        return (bytes / 1048576).toFixed(2) + ' MB';
    } else if (bytes >= 1024) {
        return (bytes / 1024).toFixed(1) + ' KB';
    } else {
        return bytes + ' B';
    }
}

function formatDuration(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return [
        hrs.toString().padStart(2, '0'),
        mins.toString().padStart(2, '0'),
        secs.toString().padStart(2, '0')
    ].join(':');
}

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// -------------------------------------------------------------
// DOM ELEMENTS
// -------------------------------------------------------------
const timeEl = document.getElementById('timestamp');
const totalPacketsEl = document.getElementById('metric-total-packets');
const activeConnectionsEl = document.getElementById('metric-active-connections');
const dataTransferredEl = document.getElementById('metric-data-transferred');
const packetRateEl = document.getElementById('metric-packet-rate');
const bandwidthRateEl = document.getElementById('metric-bandwidth-rate');
const connChangeEl = document.getElementById('metric-conn-change');

const packetFeedBody = document.getElementById('packet-feed-body');
const packetFeedContainer = document.getElementById('packet-feed-container');
const connectionsBody = document.getElementById('connections-table-body');

const btnPauseFeed = document.getElementById('btn-pause-feed');
const btnClearFeed = document.getElementById('btn-clear-feed');
const systemStatusEl = document.getElementById('system-status');

// -------------------------------------------------------------
// DIGITAL CLOCK
// -------------------------------------------------------------
function updateClock() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    timeEl.textContent = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
setInterval(updateClock, 1000);
updateClock(); // Run immediately

// -------------------------------------------------------------
// PROTOCOL CHART INITIALIZATION
// -------------------------------------------------------------
let protocolChart;

function initChart() {
    const ctx = document.getElementById('protocolChart').getContext('2d');
    
    // Calculate initial percentages
    const total = Object.values(state.protocolCounts).reduce((a, b) => a + b, 0);
    const data = [
        ((state.protocolCounts.TCP / total) * 100).toFixed(1),
        ((state.protocolCounts.UDP / total) * 100).toFixed(1),
        ((state.protocolCounts.ICMP / total) * 100).toFixed(1),
        ((state.protocolCounts.Other / total) * 100).toFixed(1)
    ];

    protocolChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['TCP', 'UDP', 'ICMP', 'Other'],
            datasets: [{
                data: data,
                backgroundColor: [
                    '#00ff88', // Green
                    '#00cfff', // Cyan
                    '#ffaa00', // Amber
                    '#6c7a9c'  // Gray
                ],
                borderWidth: 2,
                borderColor: '#0f1526', // matches panel bg
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    display: false // We use custom legends below chart
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return ` ${context.label}: ${context.raw}%`;
                        }
                    },
                    backgroundColor: '#0a0e1a',
                    titleFont: { family: 'Fira Code', size: 11 },
                    bodyFont: { family: 'Fira Code', size: 12 },
                    borderColor: '#1e3a5f',
                    borderWidth: 1,
                    padding: 8,
                    displayColors: true,
                    boxWidth: 8,
                    boxHeight: 8,
                    boxPadding: 4
                }
            }
        }
    });
}

function updateChart() {
    if (!protocolChart) return;
    
    const total = Object.values(state.protocolCounts).reduce((a, b) => a + b, 0);
    
    const tcpPct = ((state.protocolCounts.TCP / total) * 100);
    const udpPct = ((state.protocolCounts.UDP / total) * 100);
    const icmpPct = ((state.protocolCounts.ICMP / total) * 100);
    const otherPct = ((state.protocolCounts.Other / total) * 100);
    
    // Update chart data
    protocolChart.data.datasets[0].data = [
        tcpPct.toFixed(1),
        udpPct.toFixed(1),
        icmpPct.toFixed(1),
        otherPct.toFixed(1)
    ];
    protocolChart.update('none'); // Update without full animation for performance

    // Update legend values
    document.getElementById('legend-tcp-val').textContent = tcpPct.toFixed(1) + '%';
    document.getElementById('legend-udp-val').textContent = udpPct.toFixed(1) + '%';
    document.getElementById('legend-icmp-val').textContent = icmpPct.toFixed(1) + '%';
    document.getElementById('legend-other-val').textContent = otherPct.toFixed(1) + '%';
}

// -------------------------------------------------------------
// STATIC INTERFACES LOAD
// -------------------------------------------------------------
// HTML has static interfaces based on specs. Let's make wlan0 turn on/off or fluctuate slightly
// every 30s to demonstrate live interactivity.
setInterval(() => {
    const wlan = state.interfaces.find(i => i.name === 'wlan0');
    const container = document.getElementById('interfaces-list-container');
    if (wlan && container) {
        wlan.status = wlan.status === 'UP' ? 'DOWN' : 'UP';
        wlan.ip = wlan.status === 'UP' ? '192.168.1.8' : '0.0.0.0';
        
        // Re-render interface items
        container.innerHTML = state.interfaces.map(intf => {
            const isUp = intf.status === 'UP';
            const iconName = intf.name === 'eth0' ? 'cable' : (intf.name === 'lo' ? 'refresh-cw' : 'wifi');
            const iconColor = intf.name === 'eth0' ? 'text-primary' : (intf.name === 'lo' ? 'text-secondary' : 'text-warning');
            
            return `
                <div class="interface-item">
                    <div class="interface-info">
                        <div class="interface-meta">
                            <i data-lucide="${iconName}" class="intf-icon ${iconColor}"></i>
                            <div>
                                <div class="intf-name monospace-text">${intf.name}</div>
                                <div class="intf-type">${intf.type} Adapter</div>
                            </div>
                        </div>
                        <div class="intf-addresses monospace-text">
                            <span class="intf-ip">IP: ${intf.ip}</span>
                            <span class="intf-mac">MAC: ${intf.mac}</span>
                        </div>
                    </div>
                    <span class="badge ${isUp ? 'badge-up' : 'badge-down'}">${intf.status}</span>
                </div>
            `;
        }).join('');
        lucide.createIcons();
    }
}, 30000);

// -------------------------------------------------------------
// TCP SOCKET DETAILS PANEL
// -------------------------------------------------------------
function renderConnections() {
    connectionsBody.innerHTML = state.connections.map(conn => {
        const isEst = conn.state === 'ESTABLISHED';
        const stateClass = isEst ? 'state-established' : 'state-wait';
        return `
            <tr>
                <td>${conn.localIp}</td>
                <td>${conn.localPort}</td>
                <td>${conn.remoteIp}</td>
                <td>${conn.remotePort}</td>
                <td><span class="${stateClass}">${conn.state}</span></td>
                <td>${formatDuration(conn.duration)}</td>
            </tr>
        `;
    }).join('');
}

// Tick connection durations and occasionally mutate socket states
function tickConnections() {
    // 1. Increment durations
    state.connections.forEach(conn => {
        conn.duration += 1;
    });

    // 2. Randomly shift connection state or cycle connection (every ~6-8 seconds)
    if (Math.random() < 0.15) {
        const index = getRandomInt(0, state.connections.length - 1);
        const conn = state.connections[index];
        
        if (conn.state === 'TIME_WAIT' || conn.state === 'CLOSE_WAIT') {
            // Close and spawn a new connection
            const activeLocalIntfs = state.interfaces.filter(i => i.status === 'UP');
            const localIntf = getRandomElement(activeLocalIntfs);
            
            state.connections[index] = {
                localIp: localIntf ? localIntf.ip : '192.168.1.5',
                localPort: getRandomInt(49152, 65535),
                remoteIp: getRandomElement(MOCK_IPS.filter(ip => !ip.startsWith('192.168') && ip !== '127.0.0.1')),
                remotePort: getRandomElement([80, 443, 8080, 22, 53]),
                state: 'ESTABLISHED',
                duration: 0
            };
            
            // Fluctuated active connections count
            state.activeConnections = state.connections.filter(c => c.state === 'ESTABLISHED').length;
            activeConnectionsEl.textContent = state.activeConnections;
            connChangeEl.textContent = '+1 Connect';
            connChangeEl.className = 'metric-detail text-primary';
        } else if (conn.state === 'ESTABLISHED') {
            // Transition state
            conn.state = getRandomElement(['TIME_WAIT', 'CLOSE_WAIT']);
            state.activeConnections = state.connections.filter(c => c.state === 'ESTABLISHED').length;
            activeConnectionsEl.textContent = state.activeConnections;
            connChangeEl.textContent = '-1 Establ.';
            connChangeEl.className = 'metric-detail text-warning';
        }
    }

    renderConnections();
}

// Tick connections every second
setInterval(tickConnections, 1000);

// -------------------------------------------------------------
// LIVE PACKET STREAM SIMULATION
// -------------------------------------------------------------
// Prepopulate feed with 10 historic records
function prepopulateFeed() {
    for (let i = 0; i < 10; i++) {
        addPacketRow(true); // silent add (no auto scroll or animation)
    }
}

function addPacketRow(silent = false) {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}`;
    
    // Choose interfaces & IP ranges
    const activeIntfs = state.interfaces.filter(i => i.status === 'UP');
    const localIntf = getRandomElement(activeIntfs);
    const localIp = localIntf ? localIntf.ip : '192.168.1.5';
    
    const direction = Math.random() > 0.5; // inbound vs outbound
    const sourceIp = direction ? getRandomElement(MOCK_IPS) : localIp;
    const destIp = direction ? localIp : getRandomElement(MOCK_IPS);
    
    // Protocols TCP, UDP, ICMP, DNS etc. Map specific details
    const protoBase = getRandomElement(['TCP', 'TCP', 'TCP', 'UDP', 'UDP', 'ICMP', 'OTHER']);
    let protoClass = 'proto-other';
    let rowClass = 'row-other';
    let port = '-';
    let status = 'ALLOWED';
    let statusClass = 'status-allow';
    
    if (protoBase === 'TCP') {
        protoClass = 'proto-tcp';
        rowClass = 'row-tcp';
        port = getRandomElement([80, 443, 22, 8080, 49152 + getRandomInt(0, 10000)]);
        state.protocolCounts.TCP += 1;
    } else if (protoBase === 'UDP') {
        protoClass = 'proto-udp';
        rowClass = 'row-udp';
        port = getRandomElement([53, 67, 68, 123, 161, 500]);
        state.protocolCounts.UDP += 1;
    } else if (protoBase === 'ICMP') {
        protoClass = 'proto-icmp';
        rowClass = 'row-icmp';
        port = '0'; // echo port
        state.protocolCounts.ICMP += 1;
    } else {
        state.protocolCounts.Other += 1;
    }
    
    const size = getRandomInt(40, 1500);
    
    // Determine filter status
    const randStatus = Math.random();
    if (randStatus > 0.94) {
        status = 'BLOCKED';
        statusClass = 'status-block';
    } else if (randStatus > 0.88) {
        status = 'NAT_REDIRECT';
        statusClass = 'status-warn';
    }
    
    // Update state variables
    if (!silent) {
        state.totalPackets += 1;
        state.dataTransferredBytes += size;
        
        // Update metric labels
        totalPacketsEl.textContent = state.totalPackets.toLocaleString();
        dataTransferredEl.textContent = formatBytes(state.dataTransferredBytes);
        
        // Dynamic rates
        packetRateEl.textContent = `+${getRandomInt(35, 55)} p/s`;
        bandwidthRateEl.textContent = `${getRandomInt(8, 22)} KB/s`;
    }
    
    // HTML Row structure
    const tr = document.createElement('tr');
    tr.className = `${rowClass} ${silent ? '' : 'fade-in-row'}`;
    tr.innerHTML = `
        <td>${timeStr}</td>
        <td>${sourceIp}</td>
        <td>${destIp}</td>
        <td><span class="${protoClass}">${protoBase}</span></td>
        <td>${port}</td>
        <td>${size}</td>
        <td><span class="${statusClass}">${status}</span></td>
    `;
    
    packetFeedBody.appendChild(tr);
    
    // Prune DOM rows to keep performance stable
    while (packetFeedBody.rows.length > 30) {
        packetFeedBody.deleteRow(0);
    }
    
    // Auto scroll container
    if (!silent && state.isMonitoring) {
        packetFeedContainer.scrollTop = packetFeedContainer.scrollHeight;
    }
}

// -------------------------------------------------------------
// CONTROL BUTTON HANDLERS
// -------------------------------------------------------------
btnPauseFeed.addEventListener('click', () => {
    state.isMonitoring = !state.isMonitoring;
    if (state.isMonitoring) {
        btnPauseFeed.classList.add('active');
        btnPauseFeed.innerHTML = '<i data-lucide="pause"></i>';
        systemStatusEl.textContent = 'MONITORING';
        systemStatusEl.className = 'status-badge';
    } else {
        btnPauseFeed.classList.remove('active');
        btnPauseFeed.innerHTML = '<i data-lucide="play"></i>';
        systemStatusEl.textContent = 'PAUSED';
        systemStatusEl.className = 'status-badge text-warning';
        // Add styling for paused state
        systemStatusEl.style.borderColor = 'rgba(255, 170, 0, 0.4)';
        systemStatusEl.style.backgroundColor = 'rgba(255, 170, 0, 0.08)';
    }
    lucide.createIcons();
});

btnClearFeed.addEventListener('click', () => {
    packetFeedBody.innerHTML = '';
});

// Run packet generator interval
let packetInterval;
function startPacketGenerator() {
    packetInterval = setInterval(() => {
        if (state.isMonitoring) {
            addPacketRow();
            updateChart();
        }
    }, 1500);
}

// -------------------------------------------------------------
// INITIALIZATION
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    prepopulateFeed();
    initChart();
    renderConnections();
    startPacketGenerator();
});
