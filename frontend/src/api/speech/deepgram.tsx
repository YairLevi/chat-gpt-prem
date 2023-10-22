import { useEffect, useState } from "react";

export function useSpeechRecognition(callback: (transcript: string) => void) {
  const [socket, setSocket] = useState<WebSocket>()
  const [listening, setListening] = useState(false)

  useEffect(() => {
    if (!listening) {
      console.log('not listening.')
      return
    }

    const socket = new WebSocket('wss://api.deepgram.com/v1/listen?' +
      'sample_rate=16000&' +
      'smart_format=true&' +
      'model=nova&' +
      'language=en-US&' +
      'interim_results=true'
      , [
      'token',
      '71b9c06ebb4caef6eb6d3e0d1d3047446dbe1fa0',
    ])

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      console.log({ stream })
      if (!MediaRecorder.isTypeSupported('audio/webm'))
        return alert('Browser not supported')
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      })
      socket.onopen = () => {
        console.log({ event: 'onopen' })
        mediaRecorder.addEventListener('dataavailable', async (event) => {
          if (event.data.size > 0 && socket.readyState == 1) {
            socket.send(event.data)
          }
        })
        mediaRecorder.start(1000)
        setSocket(socket)
      }

      socket.onmessage = (message) => {
        const received = JSON.parse(message.data)
        const transcript = received.channel.alternatives[0].transcript
        if (transcript && received.is_final) {
          console.log(transcript)
          callback(transcript)
        }
      }

      socket.onclose = () => {
        console.log({ event: 'onclose' })
      }

      socket.onerror = (error) => {
        console.log({ event: 'onerror', error })
      }
    })

    return () => {
      console.log('closing socket...')
      socket?.close()
    }
  }, [listening]);

  return () => setListening(!listening)
}
