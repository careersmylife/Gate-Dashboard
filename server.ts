import express from "express";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";

const generateRadarData = () => [
  { subject: 'Shift A', A: Math.floor(Math.random() * 10) + 15, fullMark: 20 },
  { subject: 'Shift B', A: Math.floor(Math.random() * 10) + 10, fullMark: 20 },
  { subject: 'Shift C', A: Math.floor(Math.random() * 10) + 8, fullMark: 20 },
  { subject: 'Yard Ops', A: Math.floor(Math.random() * 10) + 12, fullMark: 20 },
  { subject: 'Gate Ops', A: Math.floor(Math.random() * 10) + 10, fullMark: 20 },
];

const generateComposedData = () => [
  { name: 'Jun', teu: Number((Math.random() * 0.4 + 0.9).toFixed(1)), calls: Math.floor(Math.random() * 4) + 5 },
  { name: 'Jul', teu: Number((Math.random() * 0.4 + 1.0).toFixed(1)), calls: Math.floor(Math.random() * 4) + 7 },
  { name: 'Aug', teu: Number((Math.random() * 0.4 + 1.1).toFixed(1)), calls: Math.floor(Math.random() * 4) + 8 },
  { name: 'Sep', teu: Number((Math.random() * 0.4 + 1.1).toFixed(1)), calls: Math.floor(Math.random() * 4) + 4 },
];

const generateDwellData = () => {
  const short = Math.floor(Math.random() * 15) + 60;
  return [
    { name: 'Short Dwell', value: short, fill: '#4ade80' },
    { name: 'Long Dwell', value: 100 - short, fill: '#3b82f6' },
  ];
};

const generateFleetData = () => [
  { name: 'RTG Fleet B', value: Math.floor(Math.random() * 40000) + 130000 },
  { name: 'RTG Fleet A', value: Math.floor(Math.random() * 40000) + 150000 },
  { name: 'STS Fleet C', value: Math.floor(Math.random() * 40000) + 180000 },
  { name: 'STS Fleet B', value: Math.floor(Math.random() * 40000) + 260000 },
  { name: 'STS Fleet A', value: Math.floor(Math.random() * 40000) + 230000 },
];

const generateGateData = () => {
  const op = Math.floor(Math.random() * 8) + 88;
  return [
    { name: 'Operational', value: op, fill: '#3b82f6' },
    { name: 'Maintenance', value: 100 - op, fill: '#ef4444' },
  ];
};

const generateKPIs = () => {
  return {
    craneMov: (Math.random() * 5 + 32).toFixed(1),
    berthOccupancy: (Math.random() * 10 + 80).toFixed(1) + '%',
    gateCycle: (Math.random() * 0.5 + 0.9).toFixed(2),
    ltiFree: Math.floor(Math.random() * 50) + 400,
    dwellTime: (Math.random() * 2 + 3.5).toFixed(1),
    teuVolume: Math.floor(Math.random() * 100000 + 1200000).toLocaleString(),
    teuTrend: '+' + (Math.random() * 2 + 1).toFixed(1) + '%',
  };
};

async function startServer() {
  const app = express();
  const PORT = 3000;
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*" }
  });

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // WebSocket connection
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Send initial data
    socket.emit("dashboard_data", {
      radarData: generateRadarData(),
      composedData: generateComposedData(),
      dwellData: generateDwellData(),
      fleetData: generateFleetData(),
      gateData: generateGateData(),
      kpiData: generateKPIs()
    });

    // Handle manual refresh request
    socket.on("request_refresh", () => {
      socket.emit("dashboard_data", {
        radarData: generateRadarData(),
        composedData: generateComposedData(),
        dwellData: generateDwellData(),
        fleetData: generateFleetData(),
        gateData: generateGateData(),
        kpiData: generateKPIs()
      });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  // Broadcast data every 5 seconds
  setInterval(() => {
    io.emit("dashboard_data", {
      radarData: generateRadarData(),
      composedData: generateComposedData(),
      dwellData: generateDwellData(),
      fleetData: generateFleetData(),
      gateData: generateGateData(),
      kpiData: generateKPIs()
    });
  }, 5000);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
