import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('edqDesktop', {
  platform: process.platform,
});
