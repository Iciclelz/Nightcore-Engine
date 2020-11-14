"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
var path = require("path");
var nightcore = require('./nightcore.js');
var fs = require('fs');
var g_main_window = null;
var mainwindow = /** @class */ (function () {
    function mainwindow(app) {
        var _this = this;
        this.app = app;
        this.app.on("ready", this.create_window);
        this.app.on("window-all-closed", function () {
            if (process.platform !== "darwin") {
                _this.app.quit();
            }
        });
        app.on("activate", function () {
            if (_this.main_window === null) {
                _this.create_window();
            }
        });
        electron_1.ipcMain.on('ipc-renderer-send', function (event, tuple) {
            var evt = tuple[0], args = tuple[1];
            if (evt == 'construct') {
                var type = args[0], input_1 = args[1], output_1 = args[2], frequency_1 = args[3];
                if (type == '0') {
                    if (fs.existsSync(input_1)) {
                        nightcore.nightcore_engine(input_1, output_1, frequency_1);
                        electron_1.dialog.showMessageBox({
                            type: "info",
                            title: "Nightcore Engine",
                            message: "fml",
                            detail: "A nightcore version for " + input_1 + " has created and copied to " + output_1 + "."
                        });
                    }
                }
                if (type == '1') {
                    if (!fs.existsSync(output_1)) {
                        fs.mkdirSync(output_1);
                    }
                    if (fs.existsSync(input_1) && fs.existsSync(output_1)) {
                        fs.readdir(input_1, function (err, files) {
                            for (var n = 0; n < files.length; ++n) {
                                if (path.extname(files[n]) === ".mp3" || path.extname(files[n]) === ".wav") {
                                    var input_file = path.parse(files[n]);
                                    var output_file = path.join(output_1, input_file.name + '.nightcore' + input_file.ext);
                                    nightcore.nightcore_engine(path.join(input_1, files[n]), output_file, frequency_1);
                                }
                            }
                        });
                    }
                }
            }
            if (evt == 'input-file') {
                var file_name = null;
                if (args == '0') {
                    var result = electron_1.dialog.showOpenDialogSync(g_main_window, {
                        properties: ['openFile'],
                        filters: [
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
                    var result = electron_1.dialog.showOpenDialogSync(g_main_window, {
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
                var file_name = null;
                if (args == '0') {
                    file_name = electron_1.dialog.showSaveDialogSync(g_main_window, {
                        filters: [
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
                    var result = electron_1.dialog.showOpenDialogSync(g_main_window, {
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
        electron_1.ipcMain.on('about-nightcore-engine', function () {
            electron_1.dialog.showMessageBox({
                type: "info",
                title: "About ts-electron-template",
                message: "ts-electron-template",
                detail: "Version: 1.0.0\nElectron: " + process.versions.electron + "\nChrome: " + process.versions.chrome + "\nNode.js: " + process.versions.node + "\nV8: " + process.versions.v8 + "\n\nCreated by Iciclez"
            });
        });
    }
    mainwindow.prototype.create_window = function () {
        var _this = this;
        this.main_window = new electron_1.BrowserWindow({
            width: 900,
            height: 260,
            opacity: 1,
            //backgroundColor: '#000000',
            icon: 'angelic-rainbow.png',
            webPreferences: {
                nodeIntegration: true
            }
        });
        this.main_window.setMenuBarVisibility(false);
        this.main_window.loadFile(path.join(__dirname, "../ui/index.html"));
        //this.main_window.webContents.openDevTools();
        this.main_window.on("closed", function () {
            _this.main_window = null;
        });
        g_main_window = this.main_window;
    };
    mainwindow.main = function () {
        new mainwindow(electron_1.app);
    };
    return mainwindow;
}());
exports["default"] = mainwindow;
//# sourceMappingURL=mainwindow.js.map