#!/usr/bin/env node
// node nightcore.js -i "AY楊佬叁 - 零几年听的情歌動態歌詞Lyrics Video.mp3" -o "mc.mp3" -f 59100
var child_process = require('child_process');
var fs = require('fs');
var wavefile = require('wavefile');
var yargs = require('yargs')
    .option('input_file', {
    alias: 'i',
    type: 'string',
    description: 'input music file'
})
    .option('output_file', {
    alias: 'o',
    type: 'string',
    description: 'output music file'
})
    .option('frequency', {
    alias: 'f',
    type: 'number',
    description: 'frequency for output music file',
    "default": 44100
});
var argv = yargs.argv;
var nightcore = function (input_file_name, output_file_name, frequency, callback) {
    fs.readFile(input_file_name, function (err, data) {
        if (err) {
            throw err;
        }
        // data : Buffer
        var wav_object = new wavefile.WaveFile(data);
        wav_object.fmt.numChannels = 2;
        wav_object.fmt.sampleRate = frequency;
        fs.writeFile(output_file_name, wav_object.toBuffer(), function (err) {
            if (err) {
                throw err;
            }
            callback();
        });
    });
};
var nightcore_engine = function (input_file_name, output_file_name, frequency) {
    var intermediate_files = [];
    var input_file = input_file_name.endsWith('.wav') ? input_file_name : input_file_name + '.wav';
    var output_file = output_file_name.endsWith('.wav') ? output_file_name : output_file_name + '.wav';
    if (input_file != input_file_name) {
        intermediate_files.push(input_file);
        child_process.spawnSync('ffmpeg', ['-y', '-i', input_file_name, input_file]);
    }
    nightcore(input_file, output_file, frequency, function () {
        if (output_file != output_file_name) {
            intermediate_files.push(output_file);
            child_process.spawnSync('ffmpeg', ['-y', '-i', output_file, output_file_name]);
        }
        //console.log(intermediate_files);
        // delete intermediate files
        for (var n = 0; n < intermediate_files.length; ++n) {
            fs.unlink(intermediate_files[n], function (err) {
                if (err) {
                    throw err;
                }
            });
        }
    });
};
var main = function () {
    if (!argv.input_file || !argv.output_file) {
        yargs.showHelp();
        return;
    }
    nightcore_engine(argv.input_file, argv.output_file, argv.frequency);
};
//main();
module.exports = {
    nightcore_engine: nightcore_engine
};
//# sourceMappingURL=nightcore.js.map