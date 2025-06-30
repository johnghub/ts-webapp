# PowerShell script to extract GET and POST methods, routes, and return types from a .NET DLL
param(
    [string]$DllPath = "C:\Git\public\ts-webapp\server\Web.Api\Web.Api\bin\Debug\net8.0",  # Path to the DLL
    [string]$DllName = "Web.Api.dll"  # Name of the DLL file
)

# Function to safely get types from an assembly, handling ReflectionTypeLoadException wrapped in MethodInvocationException
function Get-SafeTypes {
    param (
        [System.Reflection.Assembly]$assembly
    )
    
    try {
        $types = $assembly.GetTypes()
    } catch {
        # Check if the exception is a MethodInvocationException wrapping a ReflectionTypeLoadException
        if ($_.FullyQualifiedErrorId -eq 'ReflectionTypeLoadException') {
            $innerException = $_.Exception.InnerException
            if ($innerException -is [System.Reflection.ReflectionTypeLoadException]) {
                Write-Warning "Some types could not be loaded. Proceeding with successfully loaded types."
                # Get the types that could be loaded, filtering out null entries
                $types = $innerException.Types | Where-Object { $_ -ne $null }
            } else {
                throw $_
            }
        } else {
            throw $_
        }
    }
    
    # Filter the types to avoid compiler-generated classes and handle primary constructors properly
    $filteredTypes = $types | Where-Object {
        # Exclude compiler-generated classes and ensure we get only public classes
        $_.IsClass -and -not $_.IsAbstract -and $_.IsPublic -and $_.Name -notmatch '^<.*>$'
    }
    
    return $filteredTypes
}

function Get-HttpMethods{
    param (
        $controllers
    )

    foreach ($controller in $controllers) {
        Write-Output "Controller: $($controller.FullName)"

        # Iterate over methods to find GET and POST methods
        foreach ($method in $controller.GetMethods()) {
            try {
                $attributes = $method.GetCustomAttributes($true)
                $httpMethod = $null
                $route = $null

                # Check for HTTP method attributes
                foreach ($attribute in $attributes) {
                    if ($attribute.GetType().FullName -eq 'Microsoft.AspNetCore.Mvc.HttpGetAttribute') {
                        $httpMethod = 'GET'
                    }
                    elseif ($attribute.GetType().FullName -eq 'Microsoft.AspNetCore.Mvc.HttpPostAttribute') {
                        $httpMethod = 'POST'
                    }
                }

                # If method is either GET or POST, get route information
                if ($httpMethod) {
                    $routeAttribute = $attributes | Where-Object { $_.GetType().FullName -eq 'Microsoft.AspNetCore.Mvc.RouteAttribute' }
                    if ($routeAttribute) {
                        $route = $routeAttribute.Template
                    } else {
                        $route = $method.Name
                    }

                    # Extract return type
                    $returnType = $method.ReturnType
                    if ($returnType.FullName -like '*Task`1*') {
                        $returnType = $returnType.GetGenericArguments()[0].FullName
                    }

                    Write-Output "Method: $httpMethod $route"
                    Write-Output "Return Type: $returnType"
                }
            } catch {
                # Ignore methods that cannot be resolved
                Write-Output "Skipping method in $($controller.FullName) due to resolution error."
            }
        }
    }

}

# Get the return type (e.g., WeatherForecast) definitions
$types = $assembly.GetTypes() | Where-Object {
    try {
        $_.Name -eq 'WeatherForecast'
    } catch {
        # Ignore types that cannot be resolved
        $false
    }
}

foreach ($type in $types) {
    try {
        Write-Output "Return Type Definition: $($type.FullName)"
        foreach ($property in $type.GetProperties()) {
            Write-Output "- Property: $($property.Name) ($($property.PropertyType.FullName))"
        }
    } catch {
        Write-Output "Skipping type $($type.FullName) due to resolution error."
    }
}


# Load the main assembly
try {
    $assembly = [System.Reflection.Assembly]::LoadFrom("$DllPath\$DllName")
} catch {
    Write-Error "Failed to load assembly: $_"
    exit 1
}

$safeTypes = Get-SafeTypes($assembly)
# Iterate over types in the assembly to find controllers
$controllers = $safeTypes | Where-Object {
    try {
        $_.IsClass -and $_.Name -like '*Controller'
    } catch {
        # Ignore types that cannot be resolved
        $false
    }
}

Get-HttpMethods -controllers $controllers