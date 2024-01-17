import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

const electron = {
  send: (arg: any) => ipcRenderer.invoke('message', arg),
};
const env = {
  SUPABASE_URL: 'https://vwssqtmlbzybjyowynfw.supabase.co',
  SUPBASE_ANON_KEY:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3c3NxdG1sYnp5Ymp5b3d5bmZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQ2MzM4MTUsImV4cCI6MjAyMDIwOTgxNX0.bpIaM6IKnllSmuc47rXr-d0wjszYBLBH3ubAOfcTs0c',
};
contextBridge.exposeInMainWorld('electron', electron);
contextBridge.exposeInMainWorld('env', env);
// contextBridge.exposeInMainWorld('api', api);

export type ElectronHandler = typeof electron;
export type Env = typeof env;
