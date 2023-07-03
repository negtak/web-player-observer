import { Recorder } from "./recorder";
import { PlayerEvents } from "./types";

export class Observer {
    protected _options: any;
    protected _recorder: Recorder;
    protected _media: HTMLVideoElement;
    protected _is_live: boolean;
    protected _error: { [key: string]: number; };

    constructor(media: HTMLVideoElement, options?: any) {
        this._options = options
        this._media = media;
        this._is_live = false;
        this._error = {};
        this._recorder = new Recorder(this._options?.mode);
    }

    protected _record(event: PlayerEvents) {
        return  ()  => {
            switch (event) {
                case PlayerEvents.LOAD_START:
                    this._recorder.join_start();
                    break;
                case PlayerEvents.CAN_PLAY:
                    this._recorder.join_end();
                    break;
                case PlayerEvents.PLAYING:
                    this._recorder.state = 'playing';
                    if (this._recorder.play_t0 == 0) {
                        this._recorder.play_t0 = performance.now();
                    }
                    break;
                case PlayerEvents.PAUSE:
                    this._recorder.state = 'pause';
                    break;
                case PlayerEvents.ENDED:
                    this._recorder.state = 'ended';
                    break;
                default:
                    break;
            }   
        }
    }

    private setStats() {
        setInterval(() => {
            // get frame statistics
            const video_playback_quality = this._media.getVideoPlaybackQuality();
            const total_dropped_frame = video_playback_quality.droppedVideoFrames;
            this._recorder.total_dropped_frame = total_dropped_frame;
            this._recorder.current_time = this._media.currentTime;
            // get quality statistics
            this._recorder.height = this._media.videoHeight.toString();
            this._recorder.width = this._media.videoWidth.toString();
            // get page element info
            this._recorder.video_display_area_height = this._media.height.toString();
            this._recorder.video_display_area_width = this._media.width.toString();
            this._recorder.record_play();
            this._recorder.record_pause();
        }, 10000);
    }

    addListener () {
        this._media.addEventListener('loadstart', this._record(PlayerEvents.LOAD_START));
        this._media.addEventListener('canplay', this._record(PlayerEvents.CAN_PLAY));
        this._media.addEventListener('pause', this._record(PlayerEvents.PAUSE));
        this._media.addEventListener('ended', this._record(PlayerEvents.ENDED));
        this._media.addEventListener('playing', this._record(PlayerEvents.PLAYING));
        this.setStats();
    }

    removeListener () {
        console.log("Observe Process stop ...")
    }

    getStats () {
        return {
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
            'latency': this._recorder.state == 'playing' ? this._recorder.latency : 0,
            'src_media': this._recorder.src_media,
            'error': this._error,
        }
    }
}

