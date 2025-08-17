
TODO:
Write unit tests for the DI system to ensure that all services are registered correctly.

8/17/2025

Complete updated registration system for DI as discussed in the AI project "Website by AI code gen-> Auth Provider Injection Benefit"
  -- Complete

Currently the DI system is only registering services in the Domain project so it misses the authentication stub class which is in the AuthProvider project.
   -Fixed by forcing the load of the assemblies program.cs

Complete the update to the DI system by adding the IModule interface with the new <assembly name>Startup method in each assembly that needs to register services.
  -- Complete