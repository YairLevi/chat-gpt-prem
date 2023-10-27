export namespace deepgram {
	
	export class TranscriptionResult {
	    transcript: string;
	    is_final: boolean;
	
	    static createFrom(source: any = {}) {
	        return new TranscriptionResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.transcript = source["transcript"];
	        this.is_final = source["is_final"];
	    }
	}

}

