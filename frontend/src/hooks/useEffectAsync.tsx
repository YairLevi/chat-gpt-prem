import { useEffect } from "react";

export function useAsync(handler: Function, deps: any[]) {
  useEffect(() => {
    (async function(){
      handler()
    })()
  }, deps)
}