
TODO:
Write unit tests for the DI system to ensure that all services are registered correctly.

8/24/2025

Verify codegen creates the correct proxies for login based on the new types that were created the api.ts and AuthProxyService.ts file.
  -- Complete

The best way to test functions that require authentication is to serve the client from kestrel server by running 

npm run build:copy

and then running the server project. This way the authentication cookies are properly handled. Note that there must be a localhost certificate 
installed for this to work. The best way to do this is to run the server project in Visual Studio which will create and trust a localhost certificate of just use 

   dotnet dev-certs https --trust

After testing you can remove the certificate by running 

   dotnet dev-certs https --clean

Another useful command is

   dotnet dev-certs https --check --trust

To see what the status of the certificate is.

All other testing can be done using the Vite development server.

8/17/2025

Complete updated registration system for DI as discussed in the AI project "Website by AI code gen-> Auth Provider Injection Benefit"
  -- Complete

Currently the DI system is only registering services in the Domain project so it misses the authentication stub class which is in the AuthProvider project.
   -Fixed by forcing the load of the assemblies program.cs

Complete the update to the DI system by adding the IModule interface with the new <assembly name>Startup method in each assembly that needs to register services.
  -- Complete

