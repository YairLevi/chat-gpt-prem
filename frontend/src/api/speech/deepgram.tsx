import { useEffect, useRef, useState } from "react";
import { Read, SendForTranscription } from "../../../wailsjs/go/deepgram/SpeechToTextController";


export function useSpeechRecognition(callback: (transcript: string) => void) {
  const [listening, setListening] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder>()
  const intervalIDRef = useRef<NodeJS.Timeout>()
  const recorderTimeSliceMS = 500
  const readMsgDelayMS = 300

  useEffect(() => {
    console.log('here')
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      if (!MediaRecorder.isTypeSupported('audio/webm'))
        return alert('Browser not supported')

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      })

      mediaRecorder.addEventListener('dataavailable', async (event) => {
        if (event.data.size > 0) {
          const arrayBuffer = await event.data.arrayBuffer()
          const uint8Array = new Uint8Array(arrayBuffer);
          const byteArray: number[] = Array.from(uint8Array);
          await SendForTranscription(byteArray)
        }
      })

      mediaRecorder.onstop = async () => {
        setListening(false)
        clearInterval(intervalIDRef.current)
      }

      mediaRecorder.onstart = async () => {
        setListening(true)
        intervalIDRef.current = setInterval(async () => {
          const result = await Read()
          if (!result.is_final || result.transcript == "") return
          callback(result.transcript)
        }, readMsgDelayMS)
      }

      mediaRecorderRef.current = mediaRecorder
    })
  }, []);

  function start() {
    mediaRecorderRef.current.start(recorderTimeSliceMS)
  }

  function stop() {
    mediaRecorderRef.current.stop()
  }

  return { start, stop, listening }
}
