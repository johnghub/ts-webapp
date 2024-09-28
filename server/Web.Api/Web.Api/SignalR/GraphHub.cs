using Microsoft.AspNetCore.SignalR;
using System;
using Web.Api.SignalR.Models;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Web.Api.SignalR
{
    public class GraphHub : Hub
    {
        private readonly Random _random = new ();

#if (false)
        public async Task BroadcastGraphData()
        {
            while (true)
            {
                //var random = new Random();
                var data = new List<BarData>();

                for (int i = 0; i < 50; i++) // Generate data for 10 bars
                {
                    data.Add(new BarData
                    {
                        Value = _random.Next(5, 20), // Random value for the bar
                        Color = $"#{_random.Next(0x1000000):X6}", // Random hex color
                        StartColor = $"#{_random.Next(0x1000000):X6}",
                        EndColor = $"#{_random.Next(0x1000000):X6}"
                    });
                }

                await Clients.All.SendAsync("ReceiveGraphData", data);

                await Task.Delay(1000);
            }
        }
#else
        public async Task BroadcastGraphData()
        {

            int numberOfBars = 50;


            while (true)
            {

                var data = new List<BarData>();

                // Generate an array of 10 random integers (0-100)
                for (int i = 0; i < numberOfBars; i++)
                {

                    int startRed = _random.Next(256);
                    int startGreen = _random.Next(256);
                    int startBlue = _random.Next(256);


                    double angle = 2 * Math.PI * i / numberOfBars; // Full wave across the bars
                    int value = (int)(5 + 20 * Math.Sin(angle)); // Values between 50 and 100

                    // Calculate color based on position in array to ensure gradual change
                    double factor = (double)i / (numberOfBars - 1);
                    int red = (int)(startRed * (1 - factor) + 255 * factor);
                    int green = (int)(startGreen * (1 - factor) + 255 * factor);
                    int blue = (int)(startBlue * (1 - factor) + 255 * factor);

                    data.Add(new BarData
                    {
                        Value = value,
                        Color = $"#{red:X2}{green:X2}{blue:X2}"
                    });
                }

                // Send the data to all connected clients
                await Clients.All.SendAsync("ReceiveGraphData", data);

                // Wait for 500 milliseconds
                await Task.Delay(1000);
                //await Task.Delay(5000);
                //Console.WriteLine($"Sent data: {DateTime.Now.ToLongTimeString()}");
            }
        }

#endif
        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
            await BroadcastGraphData();
        }

    }
    
}
