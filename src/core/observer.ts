import { Recorder } from './recorder';
export class Observer {
    protected _options: any;
    protected _recorder: Recorder;
    protected _media: HTMLVideoElement;
    protected _is_live: boolean;

    constructor(media: HTMLVideoElement, options?: any) {
        this._options = options
        this._media = media;
        this._is_live = false;
        this._recorder = new Recorder(this._options?.mode);
    }

    protected _record(event: String) {
        return  ()  => {
            switch (event) {
                case 'loadstart':
                    this._recorder.join_start();
                    break;
                case 'canplay':
                    this._recorder.join_end();
                    break;
                case 'playing':
                    this._recorder.state = 'playing';
                    if (this._recorder.play_t0 == 0) {
                        this._recorder.play_t0 = performance.now();
                    }
                    break;
                case 'pause':
                    this._recorder.state = 'pause';
                    break;
                case 'ended':
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
            // get meta info
            this._recorder.volume = this._media.volume;
            this._recorder.visibility = document.visibilityState;
            this._recorder.duration = this._is_live ? this._media.duration : 0;
            // set player state
            this._recorder.record_play();
            this._recorder.record_pause();
        }, 10000);
    }

    addListener () {
        this._media.addEventListener('loadstart', this._record('loadstart'));
        this._media.addEventListener('canplay', this._record('canplay'));
        this._media.addEventListener('pause', this._record('pause'));
        this._media.addEventListener('ended', this._record('ended'));
        this._media.addEventListener('playing', this._record('playing'));
        this.setStats();
    }

    removeListener () {
        console.log('Observe Process stop ...')
    }
}

