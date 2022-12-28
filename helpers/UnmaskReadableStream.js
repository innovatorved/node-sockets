function unmask_returnUint8Array(MASK, ENCODED_BUFFER) {
  /**
   * Return Decoded Uint8Array
   * Easily convert it into String by
   * console.log(new TextDecoder("utf-8").decode(unmask2(MASK , ENCODED_BUFFER))
   */
  const finalBuffer = Buffer.from(ENCODED_BUFFER);
  const DECODED = Uint8Array.from(finalBuffer, (elt, i) => {
    return elt ^ MASK[i % 4];
  }); // Perform an XOR on the mask
  return DECODED;
}

function unmask_returnBuffer(MASK, ENCODED_BUFFER) {
  /**
   * Return Decoded Buffer
   * Easily convert it into String by
   * console.log(unmask2(MASK , ENCODED_BUFFER).toString('utf-8'))
   */
  const finalBuffer = Buffer.from(ENCODED_BUFFER);
  for (let index = 0; index < ENCODED_BUFFER.length; index++) {
    finalBuffer[index] = ENCODED_BUFFER[index] ^ MASK[index % 4];
  }
  return finalBuffer;
}

module.exports = {
  unmask_returnUint8Array,
  unmask_returnBuffer,
};
