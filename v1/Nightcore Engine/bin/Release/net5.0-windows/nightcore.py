import wave
import os
import argparse
import subprocess

# python nightcore.py -i "C:\Projects\Nightcore Engine\Nightcore Engine\bin\x64\Release\org.wav" -o "C:\Projects\Nightcore Engine\Nightcore Engine\bin\x64\Release\test.wav" -f 59100

def nightcore(input_file_name, output_file_name, frequency):
    with wave.open(input_file_name, 'r') as input_file, wave.open(output_file_name, 'wb') as output_file:
        frames = input_file.readframes(input_file.getnframes())
        
        '''
        params[0] = 1 <- Mono
        params[0] = 2 <- Stereo
        params[2] = frequency
        '''

        params = list(input_file.getparams())
        params[0] = 2
        params[2] = int(frequency)

        output_file.setparams(tuple(params))
        output_file.writeframes(frames)

def nightcore_engine(input_file_name, output_file_name, frequency):
    intermediate_files = list()
    
    input_file = input_file_name if input_file_name.endswith('.wav') else input_file_name + '.wav'
    output_file = output_file_name if output_file_name.endswith('.wav') else output_file_name + '.wav'

    if input_file != input_file_name:
        intermediate_files.append(input_file)
        subprocess.call(['ffmpeg', '-loglevel', 'quiet', "-i", '%s' % input_file_name, '%s' % input_file])  

    nightcore(input_file, output_file, frequency)

    if output_file != output_file_name:
        intermediate_files.append(output_file)
        subprocess.call(['ffmpeg', '-loglevel', 'quiet', "-i", '%s' % output_file, '%s' % output_file_name]) 
    
    # print(intermediate_files)

    for file in intermediate_files:
        os.remove(file)

    

def main():
    parser = argparse.ArgumentParser(description='')
    parser.add_argument('-V', '--version', help='show program version and exit', action='store_true')
    parser.add_argument('-i', '--input_file', nargs='?', help='input music file')
    parser.add_argument('-o', '--output_file', nargs='?', help='output music file')
    parser.add_argument('-f', '--frequency', nargs='?', help='frequency for output music file', default=44100)
    args = parser.parse_args()

    if args.version:
        print("nightcore-engine version 1.1.1")
        return
    
    if args.input_file == None or args.output_file == None:
        parser.print_help()
        return

    nightcore_engine(args.input_file, args.output_file, args.frequency)

if __name__ == "__main__":
    main()
