// Data contoh halaman detail resource, sesuai isi desain Figma (frame "Kontribusi").
export const resourceDetail = {
  id: 'iot-aqi',
  title: 'Laporan Proyek Akhir: Rancang Bangun Sistem Monitoring Kualitas Udara Berbasis IoT & Machine Learning',
  fileInfo: 'PDF • 14.8 MB',
  author: { initials: 'BS', name: 'Budi Santoso', meta: "FIF '21 • Informatika" },
  date: '18 Des 2024',
  downloads: '1.240',
  rating: 4.9,
  reviewCount: 42,
  abstract: [
    <>
      Penelitian proyek akhir ini mengusulkan sebuah arsitektur terintegrasi <strong>Internet of Things (IoT)</strong> yang
      dikombinasikan dengan algoritma <strong>Machine Learning (Random Forest &amp; LSTM)</strong> untuk mendeteksi serta
      memprediksi indeks pencemaran udara (Air Quality Index - AQI) secara real-time di area kampus Telkom University.
    </>,
    'Perangkat keras edge node dirancang menggunakan mikrokontroler ESP32-WROOM-32D yang dihubungkan dengan rangkaian sensor multi-parameter, meliputi sensor debu optik Nova PM SDS011 (PM2.5 dan PM10), sensor semikonduktor gas MQ-135 (CO2, NH3), serta BME280 untuk pemantauan temperatur dan kelembaban lingkungan. Data telemetri dikirimkan secara berkala menggunakan protokol MQTT dengan enkripsi TLS 1.3 menuju broker AWS IoT Core.',
    'Perangkat keras edge node dirancang menggunakan mikrokontroler ESP32-WROOM-32D yang dihubungkan dengan rangkaian sensor multi-parameter, meliputi sensor debu optik Nova PM SDS011 (PM2.5 dan PM10), sensor semikonduktor gas MQ-135 (CO2, NH3), serta BME280 untuk pemantauan temperatur dan kelembaban lingkungan. Data telemetri dikirimkan secara berkala menggunakan protokol MQTT dengan enkripsi TLS 1.3 menuju broker AWS IoT Core.',
  ],
  keywords: ['Internet of Things', 'Air Quality Index', 'ESP32', 'Random Forest', 'AWS Cloud'],
  cover: {
    faculty: 'FAKULTAS INFORMATIKA • PROGRAM STUDI S1 INFORMATIKA',
    kicker: 'LAPORAN PROYEK AKHIR MATA KULIAH',
    title: 'Rancang Bangun Sistem Monitoring Kualitas Udara Berbasis IoT & Machine Learning',
    purpose: 'Disusun sebagai syarat kelulusan mata kuliah Pemrograman IoT (CSI3B3)',
    author: 'Budi Santoso',
    nim: '1301213088',
    place: 'Bandung, Semester Ganjil 2024',
  },
  totalPages: 48,
  reviews: [
    {
      id: 1,
      initials: 'RA',
      name: 'Rizky Adityawarman',
      meta: "FIF '21 • Informatika",
      rating: 5,
      text: 'Laporan sangat terstruktur rapi! Skema wiring pin ESP32 ke sensor SDS011 dan MQ-135 di Bab 3 sangat detail sehingga meminimalisir kesalahan kalibrasi saat tim kami mereplikasi alat di Lab IoT. Sangat direkomendasikan.',
      time: '3 hari yang lalu',
      helpful: 14,
    },
    {
      id: 2,
      initials: 'ND',
      name: 'Nabila Dewi',
      meta: "FIF '22 • Informatika",
      rating: 4.5,
      text: 'Penjelasan integrasi AWS IoT Core dengan lambda fungsi untuk pembersihan data sangat aplikatif. Catatan kecil di bagian LSTM mungkin butuh parameter tuning lebih mendalam jika dataset diperluas ke rentang cuaca ekstrem. Overall tugas akhir ini sangat bernilai!',
      time: '1 minggu yang lalu',
      helpful: 8,
    },
  ],
  meta: {
    course: 'Internet of Things (CSI3B3)',
    courseInfo: 'Bobot 3 SKS • Teori & Praktikum',
    lecturer: 'Dr. Ir. Hendra Kusuma, M.T.',
    lecturerInfo: 'NIP. 09780041 • KK Sistem Terdistribusi',
    semester: 'Lima (Ganjil)',
    year: '2024 / 2025',
    license: 'Open Academic Tel-U License',
    licenseNote: 'Bebas diadaptasi untuk rujukan riset non-komersial Telkom University.',
    doi: '10.34818/aksara.inf.2024.089',
  },
  related: [
    { id: 'coap', course: 'CSI3B3 • IoT', file: 'PDF • 9.2 MB', title: 'Implementasi Protokol CoAP pada Jaringan Smart Energy Metering Gedung Kuliah', author: 'Anindya Putri • 2023' },
    { id: 'esp-idf', course: 'CSI3B3 • IoT', file: 'ZIP + PDF • 24 MB', title: 'Firmware ESP-IDF & Library Sensor Debu Optik SDS011 Berbasis FreeRTOS', author: 'Lab IoT Tel-U • 2024' },
    { id: 'lstm-xgb', course: 'CSI3A3 • Machine Learning', file: 'PDF • 6.4 MB', title: 'Perbandingan Akurasi Algoritma LSTM vs XGBoost untuk Prediksi Data Runtun Waktu', author: 'Farhan Maulana • 2024' },
  ],
};
