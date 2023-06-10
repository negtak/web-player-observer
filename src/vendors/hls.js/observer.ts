import Hls from "hls.js";
import { Observer } from "../../core/observer";

export class HlsJsObserver extends Observer {

    protected _player: Hls;

    constructor(player: Hls, media: HTMLVideoElement, options?: any) {
        super(media, options);
        this._player = player;
    }

    enable () {
        console.log("observe process setup started");
        console.log("hls.js version " + Hls.version);
        super.addListener();
        this._player.on(Hls.Events.MANIFEST_LOADING, (_event, data) => {
            this._recorder.src_media = data.url;
        });
        this._player.on(Hls.Events.LEVEL_LOADED, (_event, data) => {
            this._is_live = data.details.live
        })
        this._player.on(Hls.Events.FRAG_LOADED, (_event, data) => {
            if (this._is_live) {
                const bitrate = data.frag.stats.bwEstimate;
                this._recorder.bitrate = bitrate;
            }
        });
        this._player.on(Hls.Events.FRAG_CHANGED, (_event, data) => {
            const pdt = data.frag.programDateTime;
            if (this._is_live && pdt) {
                const latency = new Date().getTime() - new Date(pdt).getTime();
                this._recorder.latency = latency
            }
        });
        this._player.on(Hls.Events.ERROR, (_event, data) => {
            this._error[data.details] = this._error[data.details] ?? 0 + 1;
        })
    }

    disable() {
        this.removeListener();
    }
}
