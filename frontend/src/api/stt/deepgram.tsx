import { useEffect, useRef, useState } from "react";
import { Close, Connect, ReadLastTranscription, SendForTranscription } from "@/../wailsjs/go/stt/Deepgram";


export function useSpeechRecognition(callback: (transcript: string) => void) {
  const [listening, setListening] = useState(false)
  const [ready, setReady] = useState(true)
  const intervalIDRef = useRef<NodeJS.Timeout>()
  const mediaRecorderRef = useRef<MediaRecorder>()

  const recorderTimeSliceMS = 500
  const readMsgDelayMS = 300

  useEffect(() => {
    if (!listening) {
      console.log('not listening')
      return
    }

    setReady(false)
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      if (!MediaRecorder.isTypeSupported('audio/webm'))
        return alert('Browser not supported')

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      })

      mediaRecorderRef.current = mediaRecorder

      Connect().then((connected) => {
        if (!connected) {
          console.log('Failed to connect to Deepgram.')
          return
        }

        intervalIDRef.current = setInterval(async () => {
          const result = await ReadLastTranscription()
          if (result.is_final) {
            callback(result.transcript)
          }
        }, readMsgDelayMS)

        mediaRecorder.addEventListener('dataavailable', async (event) => {
          if (event.data.size > 0) {
            const arrayBuffer = await event.data.arrayBuffer()
            const uint8Array = new Uint8Array(arrayBuffer);
            const byteArray: number[] = Array.from(uint8Array);
            await SendForTranscription(byteArray)
          }
        })

        mediaRecorder.start(recorderTimeSliceMS)
        setReady(true)
      })
    })

    return () => {
      setReady(false)
      mediaRecorderRef.current.stop()
      Close().then(() => setReady(true))
    }
  }, [listening]);

  return {
    toggle: () => setListening(prev => !prev),
    listening: listening,
    ready: ready
  }
}
