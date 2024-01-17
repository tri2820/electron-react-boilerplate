import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

// export type Channels = 'ipc-example' | 'ai';

const electronHandler = {
  send: (arg: any) => ipcRenderer.invoke('message', arg),
};

// const electronHandler = {
//   ipcRenderer: {
//     sendMessage(channel: Channels, ...args: unknown[]) {
//       ipcRenderer.send(channel, ...args);
//     },
//     on(channel: Channels, func: (...args: unknown[]) => void) {
//       const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
//         func(...args);
//       ipcRenderer.on(channel, subscription);

//       return () => {
//         ipcRenderer.removeListener(channel, subscription);
//       };
//     },
//     once(channel: Channels, func: (...args: unknown[]) => void) {
//       ipcRenderer.once(channel, (_event, ...args) => func(...args));
//     },
//   },
// };

contextBridge.exposeInMainWorld('electron', electronHandler);
// contextBridge.exposeInMainWorld('api', api);

export type ElectronHandler = typeof electronHandler;
