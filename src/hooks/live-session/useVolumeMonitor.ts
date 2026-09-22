import { useEffect, type MutableRefObject, type Dispatch, type SetStateAction } from "react";
import { SessionState } from "../../types";

interface UseVolumeMonitorProps {
  playbackAnalyserRef: MutableRefObject<AnalyserNode | null>;
  sessionState: SessionState;
  cherryVolSmoothed: MutableRefObject<number>;
  setCherryVolume: Dispatch<SetStateAction<number>>;
}

export function useVolumeMonitor({
  playbackAnalyserRef,
  sessionState,
  cherryVolSmoothed,
  setCherryVolume,
}: UseVolumeMonitorProps) {
  useEffect(() => {
    let animId: number;
    const bufferLength = 128;
    const dataArray = new Uint8Array(bufferLength);

    const updateVolume = () => {
      if (playbackAnalyserRef.current && sessionState === "speaking") {
        playbackAnalyserRef.current.getByteTimeDomainData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          const v = (dataArray[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / bufferLength);
        cherryVolSmoothed.current = cherryVolSmoothed.current * 0.75 + rms * 0.25;
        setCherryVolume(cherryVolSmoothed.current > 0.002 ? cherryVolSmoothed.current : 0);
      } else {
        setCherryVolume((prev) => (prev !== 0 ? 0 : prev));
        cherryVolSmoothed.current = 0;
      }
      animId = requestAnimationFrame(updateVolume);
    };

    updateVolume();
    return () => cancelAnimationFrame(animId);
  }, [sessionState, playbackAnalyserRef, cherryVolSmoothed, setCherryVolume]);
}
