const { ipcRenderer } = require('electron')

document.getElementById('construct-nightcore-button').onclick = () => {
    ipcRenderer.send('ipc-renderer-send', ['construct', [
        (document.getElementById('type-select') as HTMLSelectElement).selectedIndex,
        (document.getElementById('input-file-input') as HTMLInputElement).value,
        (document.getElementById('output-file-input') as HTMLInputElement).value,
        Number((document.getElementById('frequency-input') as HTMLInputElement).value) +
        Number((document.getElementById('frequency-increase-input') as HTMLInputElement).value)]]);
};

document.getElementById('input-file-button').onclick = () => {
    ipcRenderer.send('ipc-renderer-send', ['input-file', (document.getElementById('type-select') as HTMLSelectElement).selectedIndex]);
};

document.getElementById('output-file-button').onclick = () => {
    ipcRenderer.send('ipc-renderer-send', ['output-file', (document.getElementById('type-select') as HTMLSelectElement).selectedIndex]);
};

document.getElementById('type-select').onchange = () => {

    const input_file_input = document.getElementById('input-file-input') as HTMLInputElement;
    const output_file_input = document.getElementById('output-file-input') as HTMLInputElement;

    input_file_input.value = "";
    output_file_input.value = "";
    
    switch ((document.getElementById('type-select') as HTMLSelectElement).selectedIndex) {
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

ipcRenderer.on('ipc-renderer-receive', (event, tuple) => {
    
    const [evt, args] = tuple;

    if (evt == 'input-file-input' || evt == 'output-file-input') {
        (document.getElementById(evt) as HTMLInputElement).value = args;
    }
});