#!/usr/bin/env node

// node nightcore.js -i "org.mp3" -o "changed.mp3" -f 59100

const child_process = require('child_process');
const fs = require('fs');
const wavefile = require('wavefile');
const yargs = require('yargs')
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
        default: 44100
    });

const argv = yargs.argv;

const nightcore = (input_file_name: string, output_file_name: string, frequency: number, callback: { (): void; (): void; }) => {
    
    fs.readFile(input_file_name, (err: any, data: any) => {
        if (err) {
            throw err;
        }

        // data : Buffer
        let wav_object = new wavefile.WaveFile(data);
        
        wav_object.fmt.numChannels = 2;
        wav_object.fmt.sampleRate = frequency;

        fs.writeFile(output_file_name, wav_object.toBuffer(), (err: any) => {
            if (err) { 
                throw err;
            }
            
            callback();
          });
    });
};

const nightcore_engine = (input_file_name: string, output_file_name: string, frequency: number) => {
    let intermediate_files: string[] = [];

    let input_file = input_file_name.endsWith('.wav') ? input_file_name : input_file_name + '.wav';
    let output_file = output_file_name.endsWith('.wav') ? output_file_name : output_file_name + '.wav';

    if (input_file != input_file_name) {
        intermediate_files.push(input_file);
        child_process.spawnSync('ffmpeg', ['-y', '-i', input_file_name, input_file]);
    }

    nightcore(input_file, output_file, frequency, () => {
        if (output_file != output_file_name) {
            intermediate_files.push(output_file);
            child_process.spawnSync('ffmpeg', ['-y', '-i', output_file, output_file_name]);
        }
    
        //console.log(intermediate_files);

        // delete intermediate files
        for (let n = 0; n < intermediate_files.length; ++n) {
            fs.unlink(intermediate_files[n], (err: any) => {
                if (err) {
                  throw err;
                }
            });
        }
    });

};

const main = () => {
    if (!argv.input_file || !argv.output_file) {
        yargs.showHelp();
        return;
    }

    nightcore_engine(argv.input_file, argv.output_file, argv.frequency);
};

main();

module.exports = {
    nightcore_engine
}