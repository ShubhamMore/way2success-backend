const sizeOf = require('image-size');

const getImageSize = async imgUrl => {
  const mimeType = ['jpg', 'jpeg', 'png'];
  const ext = imgUrl.substr(imgUrl.lastIndexOf('.') + 1).toLowerCase();
  if (mimeType.indexOf(ext) !== -1) {
    const dimensions = sizeOf(imgUrl);
    return { width: dimensions.width, height: dimensions.height };
  }
  return {};
};

module.exports = getImageSize;
