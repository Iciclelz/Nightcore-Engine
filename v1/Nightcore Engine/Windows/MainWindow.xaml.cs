using MahApps.Metro.Controls;
using Nightcore_Engine.Enum;
using System.Windows;

namespace Nightcore_Engine.Windows
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : MetroWindow
    {
        public MainWindow()
        {
            InitializeComponent();
        }

        private void SingleFileNightcoreButton_Click(object sender, RoutedEventArgs e)
        {
            new NightcoreWindow(NightcoreWindowEnumeration.Single).ShowDialog();
        }

        private void MultipleFileNightcoreButton_Click(object sender, RoutedEventArgs e)
        {
            new NightcoreWindow(NightcoreWindowEnumeration.Multiple).ShowDialog();
        }

        private void AboutButton_Click(object sender, RoutedEventArgs e)
        {
            new AboutWindow().ShowDialog();
        }
    }
}
