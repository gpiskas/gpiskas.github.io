export default {
  image: {
    compress: false,
    jpeg: {
      options: {
        quality: 95,
        mozjpeg: true,
      },
    },
    png: {
      options: {
        compressionLevel: 2,
      },
    },
    webp: {
      options_lossless: {
        effort: 6,
        quality: 95,
        mode: 'lossless',
      },
      options_lossly: {
        effort: 6,
        quality: 95,
        mode: 'lossly',
      },
    },
  }
};