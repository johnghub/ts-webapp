using AuthProvider.DI;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Web.Api.Common.DI;
using Web.Api.Domain.DI;
using Web.Api.SignalR;

const string authCookieName = "YourAuthCookie";

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddSignalR();

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
//    options.Cookie.SameSite = SameSiteMode.None; // Required for cross-origin requests
    options.Cookie.SameSite = SameSiteMode.Strict; // 
    options.Cookie.Name = authCookieName;
    options.LoginPath = "/login"; // Path for login API
    options.LogoutPath = "/logout"; // Path for logout API
    options.AccessDeniedPath = "/access-denied";
    // Other cross-domain cookie testing code
    options.ExpireTimeSpan = TimeSpan.FromHours(1); // Adjust as necessary
    options.SlidingExpiration = true; // Renew the cookie if close to expiration
    options.Cookie.Path = "/";
    options.Events = new CookieAuthenticationEvents
    {
        OnValidatePrincipal = async context =>
        {
            // Reject if we somehow don't have an authenticated principal
            if (context.Principal?.Identity?.IsAuthenticated != true)
            {
                context.RejectPrincipal();           // invalidate the cookie
                                                     
                // optionally: await ctx.HttpContext.SignOutAsync(); // if you're in an async path
                await context.HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
                return; 
            }

            // Debug claims on cookie validation
            Console.WriteLine("Validating principal:");
            foreach (var claim in context.Principal.Claims)
            {
                Console.WriteLine($"{claim.Type}: {claim.Value}");
            }
        }
    };
    options.Events = new CookieAuthenticationEvents
    {
        OnSigningIn = context =>
        {

            if (context.Principal is not { } principal)
            {
                Console.WriteLine("Signing in with no principal (skipping claim log).");
                return Task.CompletedTask;
            }

            Console.WriteLine("Signing in with claims:");
            foreach (var claim in context.Principal.Claims)
            {
                Console.WriteLine($"{claim.Type}: {claim.Value}");
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("DevCorsPolicy",
        builder => builder.WithOrigins("http://localhost:5173")
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials());
});

// Force load assembly to ensure all DI registrations are processed
// TODO: This is a workaround to ensure all services are registered. Ideally, we should not need this. Maybe...
_ = typeof(AuthProviderStartup).Assembly;
_ = typeof(DomainStartup).Assembly;

// Register services from the Domain project
builder.Services.RegisterDomainServices();

var app = builder.Build();

app.Use(async (context, next) =>
{
    var cookie = context.Request.Cookies[authCookieName];
    if (string.IsNullOrEmpty(cookie))
        Console.WriteLine("Cookie is missing");
    //else
    //    Console.WriteLine($"Cookie received: {cookie}");

    await next();
});

// Use CORS with the specified policy
app.UseCors("DevCorsPolicy");

// Configure the default file name
DefaultFilesOptions options = new();
options.DefaultFileNames.Clear(); // Clear existing default files
options.DefaultFileNames.Add("index.html"); // Add your default file

app.UseDefaultFiles(options); // Must be called before UseStaticFiles

// Enable serving static files
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication(); // TODO: Is this required?
app.UseAuthorization();

app.Use(async (context, next) =>
{
    await next();

    // Only flip the code if the response hasn't started yet
    if (!context.Response.HasStarted
        && context.Response.StatusCode == StatusCodes.Status404NotFound
        && context.User is not { Identity.IsAuthenticated: true })
    {
        context.Response.Clear(); // clear any 404 body written by downstream
        context.Response.StatusCode = StatusCodes.Status403Forbidden;

    }
});

app.MapControllers();
app.MapHub<GraphHub>("/graphHub"); // Define the SignalR hub route

app.Run();
