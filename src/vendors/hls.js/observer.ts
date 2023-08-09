import Hls from "hls.js";
import { Observer } from "../../core/observer";

export class HlsJsObserver extends Observer {

    protected _player: Hls;

    private _error: { [key: string]: number; };
    private _total_duration: number;
    private _buffer_ran_out_count: number;
    private _buffered_count: number;

    constructor(player: Hls, media: HTMLVideoElement, options?: any) {
        super(media, options);
        this._player = player;
        this._error = {};
        this._total_duration = 0;
        this._buffer_ran_out_count = 0;
        this._buffered_count = 0;
    }

    enable () {
        console.log("observe process setup started");
        console.log("hls.js version " + Hls.version);
        super.addListener();
        this._player.on(Hls.Events.MANIFEST_LOADING, (_event, data) => {
            this._recorder.src_media = data.url;
        });
        this._player.on(Hls.Events.LEVEL_LOADED, (_event, data) => {
            this._is_live = data.details.live;
            this._total_duration = data.details.totalduration;
        })
        this._player.on(Hls.Events.FRAG_LOADED, (_event, data) => {
            if (this._is_live) {
                const bitrate = data.frag.stats.bwEstimate;
                this._recorder.bitrate = bitrate;
                const pdt = data.frag.programDateTime;
                if (pdt) {
                    const latency = new Date().getTime() - new Date(pdt).getTime();
                    this._recorder.latency = latency
                }
            }
        });
        this._player.on(Hls.Events.FRAG_BUFFERED, (_event, data) => {
            this._buffered_count+=1;
        })
        this._player.on(Hls.Events.ERROR, (_event, data) => {
            if (Hls.ErrorDetails.BUFFER_STALLED_ERROR === data.details) {
                this._buffer_ran_out_count+=1;
            }
            this._error[data.details] = this._error[data.details] ?? 0 + 1;
        })
    }

    disable() {
        this.removeListener();
    }

    getStats () {
        return {
            'user_agent': this._recorder.user_agent,
            'referrer': this._recorder.referrer,
            'visibility': this._recorder.visibility,
            'state': this._recorder.state,
            'current_time': this._recorder.current_time,
            'total_join_time': this._recorder.total_join_time,
            'total_play_time': this._recorder.total_play_time,
            'total_pausing_time': this._recorder.total_pausing_time,
            'current_bitrate': this._recorder.state == 'playing' ? this._recorder.bitrate : 0,
            'total_dropped_frame': this._recorder.total_dropped_frame,
            'video_height': this._recorder.height,
            'video_width': this._recorder.width,
            'video_display_area_height': this._recorder.video_display_area_height,
            'video_display_area_width': this._recorder.video_display_area_width,
            'latency': this._is_live && this._recorder.state == 'playing' ? this._recorder.latency : 0,
            'src_media': this._recorder.src_media,
            'volume': this._recorder.volume,
            'duration': this._recorder.duration,
            // hls.js object
            'is_live': this._is_live,
            'error': this._error,
            'total_duration': this._total_duration,
            'buffer_ran_out_count': this._buffer_ran_out_count,
            'buffered_count': this._buffered_count
        }
    }
}
