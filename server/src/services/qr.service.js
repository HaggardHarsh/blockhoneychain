const QRCode = require('qrcode');
const os = require('os');

// Function to get the local network IP address
function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

exports.generateQRCode = async (batchCode) => {
  // Use the computer's actual network IP so a phone can access it
  const localIp = getLocalIPAddress();
  const baseUrl = process.env.FRONTEND_URL || `http://${localIp}:3000`;
  const url = `${baseUrl}/verify/${batchCode}`;
  
  return await QRCode.toDataURL(url, {
    color: {
      dark: '#000000',
      light: '#ffffff'
    },
    width: 300,
    margin: 2
  });
};
