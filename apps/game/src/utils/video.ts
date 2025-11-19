import { isSafari } from './browser-detect';

export type VideoFileType = 'webm' | 'mp4' | 'mov';

// store preferred video type in a constant
let preferredFileType: VideoFileType | undefined;

/**
 * 1. Checks if the browser is detected as Safari (Mac, iOS, iPadOS).
 * 2. Confirms that the environment supports playing the MOV/MP4 container.
 * * @returns {VideoFileType} Video type to use based on the browser support
 */
export function getPreferredFormat(): VideoFileType {
  // Short circuit when already set
  if (preferredFileType !== undefined) {
    return preferredFileType;
  }

  if (isSafari()) {
    // create video to check if mov video type is supported by checking mime types
    const video = document.createElement('video');

    const canPlayQuickTime = video.canPlayType('video/quicktime') !== '';
    const canPlayHEVC = video.canPlayType('video/mp4; codecs="hvc1"') !== '';

    preferredFileType = canPlayQuickTime || canPlayHEVC ? 'mov' : 'webm';
  } else {
    preferredFileType = 'webm';
  }

  return preferredFileType;
}
