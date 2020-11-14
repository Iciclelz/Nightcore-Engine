var ipcRenderer = require('electron').ipcRenderer;
document.getElementById('construct-nightcore-button').onclick = function () {
    ipcRenderer.send('ipc-renderer-send', ['construct', [
            document.getElementById('type-select').selectedIndex,
            document.getElementById('input-file-input').value,
            document.getElementById('output-file-input').value,
            Number(document.getElementById('frequency-input').value) +
                Number(document.getElementById('frequency-increase-input').value)
        ]]);
};
document.getElementById('input-file-button').onclick = function () {
    ipcRenderer.send('ipc-renderer-send', ['input-file', document.getElementById('type-select').selectedIndex]);
};
document.getElementById('output-file-button').onclick = function () {
    ipcRenderer.send('ipc-renderer-send', ['output-file', document.getElementById('type-select').selectedIndex]);
};
document.getElementById('type-select').onchange = function () {
    var input_file_input = document.getElementById('input-file-input');
    var output_file_input = document.getElementById('output-file-input');
    input_file_input.value = "";
    output_file_input.value = "";
    switch (document.getElementById('type-select').selectedIndex) {
        case 0:
            input_file_input.placeholder = "Select a music file to convert...";
            output_file_input.placeholder = "Select a music file which the input file will be converted to...";
            break;
        case 1:
            input_file_input.placeholder = "Select a directory with music files to convert...";
            output_file_input.placeholder = "Select a directory which the input files will be converted to...";
            break;
    }
};
ipcRenderer.on('ipc-renderer-receive', function (event, tuple) {
    var evt = tuple[0], args = tuple[1];
    if (evt == 'input-file-input' || evt == 'output-file-input') {
        document.getElementById(evt).value = args;
    }
});
//# sourceMappingURL=mainwindowrenderer.js.map