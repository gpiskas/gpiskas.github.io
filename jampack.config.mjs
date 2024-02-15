export default {
    jpeg: {
      options: {
        quality: 10,
        mozjpeg: true,
      },
    },
    png: {
      options: {
        compressionLevel: 9,
      },
    },
    webp: {
      options_lossless: {
        effort: 6,
        quality: 10,
        mode: 'lossless',
      },
      options_lossly: {
        effort: 6,
        quality: 10,
        mode: 'lossly',
      },
    },
  };