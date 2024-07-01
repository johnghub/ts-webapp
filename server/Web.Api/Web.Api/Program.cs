using Microsoft.AspNetCore.Authentication.Cookies;
using Web.Api.Domain.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Register IWeatherService as a scoped service, typical for database-related services
//builder.Services.AddScoped<IWeatherService, WeatherService>();

// Alternatively, register IWeatherService as a singleton if it does not maintain state
// builder.Services.AddSingleton<IWeatherService, WeatherService>();

// Or register as transient if a new instance is needed every time it's injected
builder.Services.AddTransient<IWeatherService, WeatherService>();

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
})
.AddCookie(options =>
{
    options.Cookie.HttpOnly = true;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.Cookie.SameSite = SameSiteMode.None;
    options.Cookie.Name = "YourAuthCookie";
    options.LoginPath = "/login"; // Path for login API
    options.LogoutPath = "/logout"; // Path for logout API
    options.AccessDeniedPath = "/access-denied";
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        builder => builder.WithOrigins("http://your-spa-domain.com")
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials());
});


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.Use(async (context, next) =>
{
    await next();

    if (context.Response.StatusCode == 404 && !context.User.Identity.IsAuthenticated)
    {
        context.Response.StatusCode = 403;
    }
});

app.MapControllers();

app.Run();
