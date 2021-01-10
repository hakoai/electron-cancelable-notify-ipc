import { v1 } from 'uuid';
export interface Channels {
  act: string;
  notify: string;
  cancel: string;
  responce: string;
}

export function makeChannel(channel: string): Channels {
  const base = `${channel}-${v1()}`;
  return {
    act: `${base}-act`,
    notify: `${base}-notify`,
    cancel: `${base}-cancel`,
    responce: `${base}-responce`,
  };
}
