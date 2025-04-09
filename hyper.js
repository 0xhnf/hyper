require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

// Daftar prompt contoh (bisa ditambahkan atau diubah)
const prompts = [
  "A futuristic city at night",
  "A serene beach sunset",
  "A mystical forest with glowing mushrooms",
  "A steampunk airship in the sky",
  "A cyberpunk street with neon lights",
  "A medieval castle under a stormy sky",
  "A desert oasis with palm trees",
  "A snowy mountain peak at dawn",
  "A vibrant underwater coral reef",
  "A post-apocalyptic wasteland"
];

// Konfigurasi model hanya untuk SD2
const model = {
  displayName: '🖼️ SD2',
  apiModelName: 'SD2'
};

// Fungsi untuk menghasilkan gambar
async function generateImage(prompt, apiKey) {
  const url = "https://api.hyperbolic.xyz/v1/image/generation";
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`
  };
  const data = {
    model_name: model.apiModelName,
    prompt: prompt,
    steps: 30,
    cfg_scale: 5,
    enable_refiner: false,
    height: 1024,
    width: 1024,
    backend: "auto"
  };

  try {
    console.log(`Menghasilkan gambar dengan prompt: "${prompt}"...`);
    const response = await axios.post(url, data, { headers });
    const imageData = response.data.images?.[0]?.image;

    if (imageData) {
      const timestamp = Date.now();
      const fileName = `generated_image_${timestamp}.png`;
      fs.writeFileSync(fileName, Buffer.from(imageData, 'base64'));
      console.log(`Gambar berhasil disimpan sebagai: ${fileName}`);

      // Tambahkan nama file ke image.txt
      fs.appendFileSync('image.txt', `${fileName}\n`);
      // Tambahkan prompt ke prompt.txt
      fs.appendFileSync('prompt.txt', `${prompt}\n`);
      console.log(`Prompt dan nama file ditambahkan ke file log`);
      return true;
    } else {
      console.log('Tidak ada gambar yang dihasilkan.');
      return false;
    }
  } catch (error) {
    console.error('Error:', error.response?.status === 401 ? 'API Key tidak valid' : 'Kesalahan saat memproses');
    return false;
  }
}

// Fungsi untuk mendapatkan jeda acak dalam milidetik (5-10 menit)
function getRandomDelay() {
  const min = 5 * 60 * 1000; // 5 menit dalam ms
  const max = 10 * 60 * 1000; // 10 menit dalam ms
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Fungsi utama untuk otomatisasi
async function runAutomation(apiKey) {
  let imageCount = 0;

  while (true) {
    if (imageCount >= 100) {
      console.log('Mencapai batas 100 gambar, menunggu 24 jam...');
      await new Promise(resolve => setTimeout(resolve, 24 * 60 * 60 * 1000)); // Jeda 24 jam
      imageCount = 0; // Reset hitungan
    }

    // Pilih prompt acak dari daftar
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    const success = await generateImage(randomPrompt, apiKey);

    if (success) {
      imageCount++;
      console.log(`Gambar ke-${imageCount} dari 100 telah dibuat.`);
    }

    // Tunggu jeda acak antara 5-10 menit
    const delay = getRandomDelay();
    console.log(`Menunggu ${(delay / 60000).toFixed(2)} menit sebelum gambar berikutnya...`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

// Fungsi mulai
function main() {
  // Ambil API key dari environment
  const apiKey = process.env.HYPERBOLIC_API_KEY;
  if (!apiKey) {
    console.error('Error: HYPERBOLIC_API_KEY tidak ditemukan di .env');
    process.exit(1);
  }

  console.log('Bot Generasi Gambar Hyperbolic (SD2) dimulai...');
  runAutomation(apiKey);
}

// Jalankan program
main();
