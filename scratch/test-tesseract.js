const { createWorker } = require('tesseract.js');

async function run() {
  const worker = await createWorker('eng');
  
  // Test with PSM 6 without whitelist
  await worker.setParameters({
    tessedit_pageseg_mode: '6',
  });
  console.log('Worker ready for testing');
  await worker.terminate();
}

run().catch(console.error);
