import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

const electron = {
  send: (arg: any) => ipcRenderer.invoke('message', arg),
};
contextBridge.exposeInMainWorld('electron', electron);
export type ElectronHandler = typeof electron;
