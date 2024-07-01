using System.ComponentModel.DataAnnotations;

namespace Web.Api.Domain.Models
{
    public class WeatherRequest
    {
        [Required(ErrorMessage = "Location is required to fetch weather data.")]
        public string Location { get; set; } = string.Empty;
    }
}
