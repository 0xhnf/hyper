require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

// Konfigurasi model
const imageModel = {
  displayName: '🖼️ SD2',
  apiModelName: 'SD2'
};

const audioModel = {
  displayName: '🔊 Melo TTS'
};

// Fungsi untuk membaca prompt dari prompt.txt dan memilih secara acak
function getRandomPrompt() {
  try {
    const prompts = fs.readFileSync('prompt.txt', 'utf8').split('\n').filter(line => line.trim() !== '');
    if (prompts.length === 0) {
      console.error('Error: prompt.txt kosong atau tidak ada prompt valid.');
      return "Default prompt"; // Fallback jika file kosong
    }
    return prompts[Math.floor(Math.random() * prompts.length)];
  } catch (error) {
    console.error('Error membaca prompt.txt:', error.message);
    return "Default prompt"; // Fallback jika file tidak ada
  }
}

// Fungsi untuk menghasilkan gambar
async function generateImage(prompt, apiKey) {
  const url = "https://api.hyperbolic.xyz/v1/image/generation";
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`
  };
  const data = {
    model_name: imageModel.apiModelName,
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
      fs.appendFileSync('image.txt', `${fileName}\n`);
      fs.appendFileSync('prompt_log.txt', `Image: ${prompt}\n`);
      return true;
    } else {
      console.log('Tidak ada gambar yang dihasilkan.');
      return false;
    }
  } catch (error) {
    console.error('Error (Image):', error.response?.status === 401 ? 'API Key tidak valid' : 'Kesalahan saat memproses');
    return false;
  }
}

// Fungsi untuk menghasilkan audio
async function generateAudio(prompt, apiKey) {
  const url = "https://api.hyperbolic.xyz/v1/audio/generation";
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`
  };
  const data = {
    text: prompt,
    speed: 1
  };

  try {
    console.log(`Menghasilkan audio dengan prompt: "${prompt}"...`);
    const response = await axios.post(url, data, { headers });
    const audioData = response.data.audio;

    if (audioData) {
      const timestamp = Date.now();
      const fileName = `generated_audio_${timestamp}.mp3`;
      fs.writeFileSync(fileName, Buffer.from(audioData, 'base64'));
      console.log(`Audio berhasil disimpan sebagai: ${fileName}`);
      fs.appendFileSync('audio.txt', `${fileName}\n`);
      fs.appendFileSync('prompt_log.txt', `Audio: ${prompt}\n`);
      return true;
    } else {
      console.log('Tidak ada audio yang dihasilkan.');
      return false;
    }
  } catch (error) {
    console.error('Error (Audio):', error.response?.status === 401 ? 'API Key tidak valid' : 'Kesalahan saat memproses');
    return false;
  }
}

// Fungsi untuk mendapatkan jeda acak antara 90 hingga 150 detik
function getRandomDelay() {
  const min = 90 * 1000; // 90 detik
  const max = 150 * 1000; // 150 detik
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Fungsi utama untuk otomatisasi
async function runAutomation(apiKey) {
  // Fase Gambar: 100 gambar, jeda 90-150 detik
  let imageCount = 0;
  console.log('Memulai fase generasi gambar...');
  while (imageCount < 100) {
    const randomPrompt = getRandomPrompt();
    const success = await generateImage(randomPrompt, apiKey);

    if (success) {
      imageCount++;
      console.log(`Gambar ke-${imageCount} dari 100 telah dibuat.`);
    }

    const delay = getRandomDelay();
    console.log(`Menunggu ${(delay / 1000).toFixed(2)} detik sebelum gambar berikutnya...`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  // Fase Audio: 450 audio, jeda 90-150 detik
  let audioCount = 0;
  console.log('Fase gambar selesai. Memulai fase generasi audio...');
  while (audioCount < 450) {
    const randomPrompt = getRandomPrompt();
    const success = await generateAudio(randomPrompt, apiKey);

    if (success) {
      audioCount++;
      console.log(`Audio ke-${audioCount} dari 450 telah dibuat.`);
    }

    const delay = getRandomDelay();
    console.log(`Menunggu ${(delay / 1000).toFixed(2)} detik sebelum audio berikutnya...`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  console.log('Semua fase selesai. Bot berhenti.');
}

// Fungsi mulai
function main() {
  const apiKey = process.env.HYPERBOLIC_API_KEY;
  if (!apiKey) {
    console.error('Error: HYPERBOLIC_API_KEY tidak ditemukan di .env');
    process.exit(1);
  }

  console.log('Bot Generasi Gambar dan Audio Hyperbolic dimulai...');
  runAutomation(apiKey);
}

// Jalankan program
main();
