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
    
    return $types
}

# Function to list all class definitions, excluding nested, compiler-generated, generic types, and handling loader exceptions
function List-AllClasses {
    param (
        [System.Reflection.Assembly]$assembly
    )

    $types = Get-SafeTypes -assembly $assembly
    if ($types.Count -eq 0) {
        Write-Output "No types found in the assembly."
    } else {
        Write-Output "Types in assembly '$($assembly.FullName)':"
        foreach ($type in $types) {
            if ($type.IsClass -and -not $type.IsNested -and -not $type.Name.StartsWith("<") -and -not $type.IsGenericType) {
                Write-Output "Class: $($type.FullName)"
            }
        }
    }
}

# Function to create a collection of class definitions of interest
function Create-ClassCollection {
    param (
        [System.Reflection.Assembly]$assembly
    )

    $classCollection = @{}
    $types = Get-SafeTypes -assembly $assembly

    foreach ($type in $types) {
        if ($type.IsClass -and -not $type.IsNested -and -not $type.Name.StartsWith("<") -and -not $type.IsGenericType) {
            $classCollection[$type.Name] = $type
        }
    }

    return $classCollection
}

# Function to search the collection by class name only and return the properties
function Get-ClassPropertiesFromCollection {
    param (
        [hashtable]$classCollection,
        [string]$className
    )

    if ($classCollection.ContainsKey($className)) {
        $type = $classCollection[$className]
        $properties = $type.GetProperties()
        if ($properties.Count -eq 0) {
            Write-Output "No properties found for class '$($type.FullName)'."
        } else {
            Write-Output "Properties of class '$($type.FullName)':"
            foreach ($property in $properties) {
                Write-Output "$($property.Name) : $($property.PropertyType.FullName)"
            }
        }
    } else {
        Write-Error "Class '$className' not found in the collection."
    }
}

# Main script execution


$classCollection = Create-ClassCollection -assembly $assembly

if (-not [string]::IsNullOrEmpty($className)) {
    Get-ClassPropertiesFromCollection -classCollection $classCollection -className $className
} else {
    List-AllClasses -assembly $assembly
}
