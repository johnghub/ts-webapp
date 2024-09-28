namespace Web.Api.SignalR.Models
{
    public class BarData
    {
        public int Value { get; set; }
        public string Color { get; set; } = string.Empty;
        public string StartColor { get; set; } = string.Empty;
        public string EndColor { get; set; } = string.Empty;
    }
}
