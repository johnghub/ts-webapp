using Microsoft.AspNetCore.SignalR;
using Web.Api.SignalR.Models;

namespace Web.Api.SignalR
{
    public class GraphHub : Hub
    {
        private readonly Random _random = new ();

        private readonly int numberOfBars = 10;
        private int[] baseValues; // Base values for the bars
        private int[] colorOffsets; // To hold color offsets

        public GraphHub()
        {
            // Initialize base values and color offsets
            //baseValues = Enumerable.Range(1, numberOfBars).Select(x => _random.Next(10, 36)).ToArray();
            //colorOffsets = Enumerable.Range(1, numberOfBars).Select(x => _random.Next(0, 256)).ToArray();
        }

#if true

        public async Task SendLineData(int totalLines)
        {
            while (true)
            {
                for (int i = 0; i < totalLines; i++)
                {
                    var lineData = new LineData
                    {
                        Length = _random.Next(50, 351), // Random length between 50 and 150
                        Angle = 2 * Math.PI * i / totalLines, // Evenly spaced angles
                        Color = $"#{_random.Next(0x1000000):X6}" // Random color
                    };

                    await Clients.All.SendAsync("ReceiveLineData", lineData);
                    await Task.Delay(100); // Delay to space out the line drawings
                }
            }
        }
#endif


#if false
        public async Task BroadcastGraphData()
        {
            var data = new List<BarData>();
            while (true)
            {
                // Increment color offsets slightly on each broadcast
                colorOffsets = colorOffsets.Select(x => (x + 5) % 256).ToArray();

                for (int i = 0; i < numberOfBars; i++)
                {
                    double angle = 2 * Math.PI * i / numberOfBars;
                    int waveValue = (int)(baseValues[i] + 20 * Math.Sin(angle + DateTime.UtcNow.Ticks / 1e+7)); // subtle wave pattern

                    // Generate a smooth gradient over time
                    int red = (colorOffsets[i] + 30) % 256;
                    int green = (colorOffsets[i] + 80) % 256;
                    int blue = (colorOffsets[i] + 130) % 256;

                    data.Add(new BarData
                    {
                        Value = waveValue,
                        Color = $"#{red:X2}{green:X2}{blue:X2}"
                    });
                }

                await Clients.All.SendAsync("ReceiveGraphData", data);

                await Task.Delay(1000);

            }
        }
#endif

#if false
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
#endif

#if false
        public async Task BroadcastGraphData()
        {

            int numberOfBars = 100;


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
            //await BroadcastGraphData();
            await SendLineData(100);
        }

    }
    
}
