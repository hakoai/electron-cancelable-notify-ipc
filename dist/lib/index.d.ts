export interface Channels {
    act: string;
    notify: string;
    cancel: string;
    responce: string;
}
export declare function makeChannel(channel: string): Channels;
