self.onmessage = async (event) => {
  const { dataArray } = event.data;
  // Calculate RMS
  const rms = Math.sqrt(
    dataArray.reduce((acc, val) => acc + (val - 128) ** 2, 0) / dataArray.length
  );
  const loudnessDB = 20 * Math.log10(rms / 128); // Normalize against max possible value

  // Convert dB to percentage (0-100)
  const value = Math.round(
    Math.min(Math.max(((loudnessDB + 100) / 100) * 100, 0), 100)
  );

  self.postMessage({
    value,
  });
};
