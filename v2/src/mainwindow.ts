import { app, BrowserWindow, globalShortcut, dialog, ipcMain, Menu } from "electron";
import * as path from "path";

const nightcore = require('./nightcore.js');
const fs = require('fs');

let g_main_window: Electron.BrowserWindow = null;

export default class mainwindow {
  app: Electron.App;
  main_window: Electron.BrowserWindow;

  constructor(app: Electron.App) {
    this.app = app;

    this.app.on("ready", this.create_window);
    this.app.on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        this.app.quit();
      }
    });

    app.on("activate", () => {
      if (this.main_window === null) {
        this.create_window();
      }
    });

    ipcMain.on('ipc-renderer-send', (event, tuple) => {

      const [evt, args] = tuple;

      if (evt == 'construct') {

        const [type, input, output, frequency] = args;
        if (type == '0') {
          if (fs.existsSync(input)) {
            nightcore.nightcore_engine(input, output, frequency);
            dialog.showMessageBox({
              type: `info`,
              title: `Nightcore Engine`,
              message: `fml`,
              detail: `A nightcore version for ${input} has created and copied to ${output}.`,
            });
          }
        }
        if (type == '1') {
          if (!fs.existsSync(output)) {
            fs.mkdirSync(output);
          }

          if (fs.existsSync(input) && fs.existsSync(output)) {
            fs.readdir(input, (err: Error, files: string[]) => {
              for (let n = 0; n < files.length; ++n) {
                if (path.extname(files[n]) === ".mp3" || path.extname(files[n]) === ".wav") {

                  let input_file = path.parse(files[n]);
                  let output_file = path.join(output, input_file.name + '.nightcore' + input_file.ext);

                  nightcore.nightcore_engine(path.join(input, files[n]), output_file, frequency);
                }
              }
            });
          }
        }
      }

      if (evt == 'input-file') {

        let file_name: string = null;
        if (args == '0') {
          let result = dialog.showOpenDialogSync(g_main_window, {
            properties: ['openFile'],
            filters:
              [
                {
                  "name": "mp3 file",
                  "extensions": ["mp3"]
                },
                {
                  "name": "wav file",
                  "extensions": ["wav"]
                }
              ]
          });

          if (!(result === undefined)) {
            file_name = result[0];
          }
        }

        if (args == '1') {
          let result = dialog.showOpenDialogSync(g_main_window, {
            properties: ['openDirectory']
          });

          if (!(result === undefined)) {
            file_name = result[0];
          }
        }

        if (!(file_name == undefined) && fs.existsSync(file_name)) {
          g_main_window.webContents.send('ipc-renderer-receive', ['input-file-input', file_name]);
        }
      }

      if (evt == 'output-file') {
        let file_name: string = null;

        if (args == '0') {
          file_name = dialog.showSaveDialogSync(g_main_window, {
            filters:
              [
                {
                  "name": "mp3 file",
                  "extensions": ["mp3"]
                },
                {
                  "name": "wav file",
                  "extensions": ["wav"]
                }
              ]
          });
        }

        if (args == '1') {
          let result = dialog.showOpenDialogSync(g_main_window, {
            properties: ['openDirectory']
          });

          if (!(result === undefined)) {
            file_name = result[0];
          }

          if (!fs.existsSync(file_name)) {
            return;
          }
        }

        if (!(file_name == undefined)) {
          g_main_window.webContents.send('ipc-renderer-receive', ['output-file-input', file_name]);
        }
      }
    });

    ipcMain.on('about-nightcore-engine', () => {
      dialog.showMessageBox({
        type: `info`,
        title: `About ts-electron-template`,
        message: `ts-electron-template`,
        detail: `Version: 1.0.0\nElectron: ${process.versions.electron}\nChrome: ${process.versions.chrome}\nNode.js: ${process.versions.node}\nV8: ${process.versions.v8}\n\nCreated by Iciclez`,
      });
    });
  }

  create_window() {
    this.main_window = new BrowserWindow({
      width: 900,
      height: 260,
      opacity: 1,
      //backgroundColor: '#000000',
      icon: 'angelic-rainbow.png',
      webPreferences: {
        nodeIntegration: true,
      }
    });

    this.main_window.setMenuBarVisibility(false);
    this.main_window.loadFile(path.join(__dirname, "../ui/index.html"));
    //this.main_window.webContents.openDevTools();
    this.main_window.on("closed", () => {
      this.main_window = null;
    });

    g_main_window = this.main_window;
  }

  static main() {
    new mainwindow(app);
  }
}