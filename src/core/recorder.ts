export class Recorder {
    private join_t0: number = 0;
    public user_agent = window.navigator.userAgent;
    public referrer = document.referrer;
    public visibility = '';
    public duration = 0;
    public total_join_time: number = 0;
    public play_t0 = 0;
    public previous_playing_time: number = 0;
    public total_play_time: number = 0;
    public previous_pause_time: number = 0;
    public total_pausing_time: number = 0;
    public total_dropped_frame: number = 0;
    public current_time: number = 0;
    public height: string = '';
    public width: string = '';
    public video_display_area_height: string = '';
    public video_display_area_width: string = '';
    public src_media: string = '';
    public bitrate: number = 0;
    public latency: number = 0;
    public mode: string = '';
    public volume: number = 0;
    public state: string = 'ready';

    constructor (mode?: string) {
      this.mode = mode ?? 'ready';
    }

    join_start () {
      if (this.join_t0 == 0) {
        this.join_t0 = performance.now();
      }
    }

    join_end () {
      this.total_join_time = performance.now() - this.join_t0;
    }

    record_play() {
      if (this.state == 'playing') {
        if (this.previous_playing_time != 0) {
          this.total_play_time += performance.now() - this.previous_playing_time;
        }
        this.previous_playing_time = performance.now();
        this.previous_pause_time = 0;
      }
    }

    record_pause () {
      if (this.state == 'pause') {
        if (this.previous_pause_time != 0) {
          this.total_pausing_time += performance.now() - this.previous_pause_time;
        }
        this.previous_pause_time = performance.now();
        this.previous_playing_time = 0;
      }
    }
}
