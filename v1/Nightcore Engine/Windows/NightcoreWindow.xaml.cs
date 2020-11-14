using MahApps.Metro.Controls;
using Microsoft.Win32;
using Nightcore_Engine.Enum;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Threading.Tasks;
using System.Windows;

namespace Nightcore_Engine.Windows
{
    /// <summary>
    /// Interaction logic for NightcoreWindow.xaml
    /// </summary>
    public partial class NightcoreWindow : MetroWindow
    {
        private readonly NightcoreWindowEnumeration Setting;
        public NightcoreWindow(NightcoreWindowEnumeration setting)
        {
            InitializeComponent();

            Setting = setting;


            switch (Setting)
            {
                case NightcoreWindowEnumeration.Single:
                    Title += "Single";
                    InputTextBox.SetValue(TextBoxHelper.WatermarkProperty, 
                        (InputTextBox.GetValue(TextBoxHelper.WatermarkProperty) as string) + " (File)");
                    OutputTextBox.SetValue(TextBoxHelper.WatermarkProperty, 
                        (OutputTextBox.GetValue(TextBoxHelper.WatermarkProperty) as string) + " (File)");
                    break;
                case NightcoreWindowEnumeration.Multiple:
                    Title += "Multiple";
                    InputTextBox.SetValue(TextBoxHelper.WatermarkProperty, 
                        (InputTextBox.GetValue(TextBoxHelper.WatermarkProperty) as string) + " (Directory)");
                    OutputTextBox.SetValue(TextBoxHelper.WatermarkProperty, 
                        (OutputTextBox.GetValue(TextBoxHelper.WatermarkProperty) as string) + " (Directory)");
                    break;
            }

            InputTextBox.SetValue(TextBoxHelper.WatermarkProperty, 
                (InputTextBox.GetValue(TextBoxHelper.WatermarkProperty) as string) + "...");
            OutputTextBox.SetValue(TextBoxHelper.WatermarkProperty, 
                (OutputTextBox.GetValue(TextBoxHelper.WatermarkProperty) as string) + "...");
        }

        public int GetFrequencyBase() => (int)FrequencyBaseNumericUpDown.Value;
        public uint GetFrequencyIncrease() => (uint)FrequencyIncreaseNumericUpDown.Value;

        private void InputButton_Click(object sender, RoutedEventArgs e)
        {
            if (Setting == NightcoreWindowEnumeration.Single)
            {
                OpenFileDialog openFileDialog = new OpenFileDialog()
                {
                    Filter = "Mp3 files (*.mp3)|*.mp3|Wave files (*.wav)|*.wav"
                };

                if (openFileDialog.ShowDialog() == true && File.Exists(openFileDialog.FileName))
                {
                    InputTextBox.Text = openFileDialog.FileName;
                }
            }
            else
            {
                var folderBrowserDialog = new System.Windows.Forms.FolderBrowserDialog();

                if (folderBrowserDialog.ShowDialog() == System.Windows.Forms.DialogResult.OK && Directory.Exists(folderBrowserDialog.SelectedPath))
                {
                    InputTextBox.Text = folderBrowserDialog.SelectedPath;
                }
            }

        }

        private void OutputButton_Click(object sender, RoutedEventArgs e)
        {
            if (Setting == NightcoreWindowEnumeration.Single)
            {
                SaveFileDialog saveFileDialog = new SaveFileDialog()
                {
                    Filter = "Mp3 files (*.mp3)|*.mp3|Wave files (*.wav)|*.wav"
                };

                if (saveFileDialog.ShowDialog() == true)
                {
                    OutputTextBox.Text = saveFileDialog.FileName;
                }
            }
            else
            {
                var folderBrowserDialog = new System.Windows.Forms.FolderBrowserDialog();

                if (folderBrowserDialog.ShowDialog() == System.Windows.Forms.DialogResult.OK && Directory.Exists(folderBrowserDialog.SelectedPath))
                {
                    OutputTextBox.Text = folderBrowserDialog.SelectedPath;
                }
            }

        }

        public static void CreateNightcore(string inputFile, string outputFile, long frequency, bool quiet = false)
        {
            Process p = new Process();
            p.StartInfo.FileName = "python.exe";
            p.StartInfo.Arguments = $"nightcore.py -i \"{inputFile}\" -o \"{outputFile}\" -f {frequency}";
            p.Start();
            p.WaitForExit();

            if (!quiet)
            {
                MessageBox.Show($" A nightcore version for {Path.GetFileName(inputFile)} has created and copied to {Path.GetFileName(outputFile)}.", "Nightcore Engine", MessageBoxButton.OK, MessageBoxImage.Information);
            }
        }

        private async void ConstructButton_Click(object sender, RoutedEventArgs e)
        {
            if (Setting == NightcoreWindowEnumeration.Single)
            {
                if (!File.Exists(InputTextBox.Text) && string.IsNullOrEmpty(OutputTextBox.Text))
                {
                    return;
                }

                
                /* copy to local variables so we do not reference gui thread (do not remove) */
                string input_file = InputTextBox.Text;
                string output_file = OutputTextBox.Text;
                long frequency = GetFrequencyBase() + GetFrequencyIncrease();

                await Task.Run(() => CreateNightcore(input_file, output_file, frequency));
            }
            else
            {
                if (Directory.Exists(InputTextBox.Text))
                {
                    if (!Directory.Exists(OutputTextBox.Text))
                    {
                        Directory.CreateDirectory(OutputTextBox.Text);
                    }

                    IEnumerable<string> files = Directory.GetFiles(InputTextBox.Text);
                    List<Task> tasks = new List<Task>();

                    foreach (string input_file in files)
                    {
                        if (Path.GetExtension(input_file) == ".mp3" ||
                            Path.GetExtension(input_file) == ".wav")
                        {
                            /* copy to local variables so we do not reference gui thread (do not remove) */

                            string output_file = Path.Combine(OutputTextBox.Text, 
                                Path.GetFileNameWithoutExtension(input_file) + ".nightcore" + Path.GetExtension(input_file));
                            long frequency = GetFrequencyBase() + GetFrequencyIncrease();

                            tasks.Add(Task.Run(() => CreateNightcore(input_file, output_file, frequency, true)));
                        }
                    }

                    await Task.WhenAll(tasks);
                }
            }
        }

        private void OnFileDrop(string file)
        {
            if (string.IsNullOrEmpty(file))
            {
                return;
            }

            if (Setting == NightcoreWindowEnumeration.Single)
            {
                if (File.Exists(file))
                {
                    InputTextBox.Text = file;
                    OutputTextBox.Text = Path.Combine(Path.GetDirectoryName(file), Path.GetFileNameWithoutExtension(file) + "_" + Path.GetExtension(file));
                }
            }
            else
            {
                if (Directory.Exists(file))
                {
                    InputTextBox.Text = file;
                    OutputTextBox.Text = file + "_";
                }
            }
        }

        private void MainWindow_Drop(object sender, DragEventArgs e)
        {
            OnFileDrop(((string[])e.Data.GetData(DataFormats.FileDrop, true))[0]);
        }
    }
}
