
10/29/2025
Looks like SignalR isn't disconnecting cleanly when the browser tab is closed or when a different page is loaded. Maybe debug later. Generated username / password 
auth provider works.
Clean up AuthenticateAsync_ProviderThrowsInCanHandle_PropagatesException test as needed.

10/5/2025
Note that IAuthCredentials is an empty interface used to mark classes that contain authentication credentials. 
This allows the AuthProvider system to be extended by adding new classes that implement this interface without changing existing code.
This is useful for supporting multiple authentication methods.
The AuthProvider system uses DI to inject the appropriate IAuthProvider implementation based on the IAuthCredentials type passed to the Login method.
How does this make sense? The IAuthCredentials interface is used as a marker interface to identify classes that contain authentication credentials.
The AuthProvider system uses this interface to determine which IAuthProvider implementation to use for a given set of credentials.
For example, if you have a class called UsernamePasswordCredentials that implements IAuthCredentials, you can create an IAuthProvider implementation called UsernamePasswordAuthProvider that handles authentication using a username and password.
When the Login method is called with an instance of UsernamePasswordCredentials, the AuthProvider system will use the UsernamePasswordAuthProvider to perform the authentication.
Is there a better way to do this? 


9/21/2025
Replace hard coded strings with constants where appropriate.
Delete #if (false) code blocks if they are no longer needed.
Review concept behind sealed classes and determine where they should be used.

9/14/2025
See where string operations might be replaced with span operations for performance improvement.
.Replace()
.Regex() 
.IndexOf()
Use ReadOnlySpan<char> where possible.

Determine if EnsureAuthenticated() is actually useful.

Check commented out //[ReturnTypeDiscovery] to make sure it really isn't needed anymore.
-- Complete, deleted



Write unit tests for the DI system to ensure that all services are registered correctly.
 -- Complete
 TODO:
 Should review in more detail to ensure that all services are being registered correctly.

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

