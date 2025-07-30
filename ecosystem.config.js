module.exports = {
  apps: [{
    name: 'charging-station-api',
    script: 'app.js',
    cwd: '/home/chargingStations/server',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    log_file: '/home/chargingStations/log/charging-station-api.log',
    error_file: '/home/chargingStations/log/charging-station-api-error.log',
    out_file: '/home/chargingStations/log/charging-station-api-out.log',
    time: true
  }]
};