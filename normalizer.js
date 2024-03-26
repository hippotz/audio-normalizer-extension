
function setNormalizer(enable) {
  console.log('normalizer clicked - starting');
  let stateChanged = false;
  Array.from(document.getElementsByTagName('video')).forEach((video) => {
    if (enable) {
      if (video.checkVisibility()) {
        stateChanged = true;
        if (!video.normalizerData) {
          const context = new AudioContext();
          const compressor = new DynamicsCompressorNode(context);
          video.normalizerData = {
            src: new MediaElementAudioSourceNode(context, {
              mediaElement: video
            }),
            compressor,
            context,
          }

          compressor.threshold.value = -50;
          compressor.knee.value = 40.0;
          compressor.ratio.value = 12.0;
          compressor.attack.value = 0.0;
          compressor.release.value = 0.25;
        }
        const {
          src, compressor, context
        } = video.normalizerData;
        try {
          src.disconnect(context.destination);
        } catch (ignore) {}
        src.connect(compressor);
        compressor.connect(context.destination);

        video.normalizerData.enabled = true;
      }
    } else if (video.normalizerData.enabled) {
      const {
        src, compressor, context
      } = video.normalizerData;
      src.disconnect(compressor);
      src.connect(context.destination);
      video.normalizerData.enabled = false;
      stateChanged = true;
    }
  });

  console.log('normalizer clicked - done');

  if (stateChanged) {
    window.normalizerOn = enable;
    console.log(`normalizer clicked - state changed: ${window.normalizerOn}`);
  }
  return window.normalizerOn;
};

window.normalizerRan = true;