using Microsoft.AspNetCore.SignalR;

namespace Web.Api.SignalR
{
    public class GraphHub : Hub
    {
        private readonly Random _random = new Random();

        public async Task BroadcastGraphData()
        {
            while (true)
            {
                // Generate an array of 10 random integers (0-100)
                var data = new int[50];
                for (int i = 0; i < data.Length; i++)
                {
                    data[i] = _random.Next(0, 20); // Generate random numbers up to 100
                }

                // Send the data to all connected clients
                await Clients.All.SendAsync("ReceiveGraphData", data);

                // Wait for 500 milliseconds
                await Task.Delay(500);
                //await Task.Delay(5000);
                //Console.WriteLine($"Sent data: {DateTime.Now.ToLongTimeString()}");
            }
        }

        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
            await BroadcastGraphData();
        }

    }
    
}
