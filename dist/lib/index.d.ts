export interface Channels {
    act: string;
    notify: string;
    cancel: string;
    responce: string;
    error: string;
}
export declare function makeChannel(channel: string): Channels;
