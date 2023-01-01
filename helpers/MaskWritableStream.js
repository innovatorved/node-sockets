function mask_returnBuffer(MASK, DECODED_BUFFER) {
  /**
   * Return Encoded Buffer
   * Easily convert it into String by
   * console.log(mask2(MASK , DECODED_BUFFER).toString('utf-8'))
   */
  const finalBuffer = Buffer.from(DECODED_BUFFER);
  for (let index = 0; index < DECODED_BUFFER.length; index++) {
    finalBuffer[index] = DECODED_BUFFER[index] ^ MASK[index % 4];
  }
  return finalBuffer;
}

module.exports = {
  mask_returnBuffer,
};
