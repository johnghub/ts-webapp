
param(  
    [string]$swaggerJsonPath = "$((Get-Location).Path)\tools\swagger.json",
    [string]$outputFolder = "$((Get-Location).Path)\tools\ts-http"
)

$swaggerJson = Get-Content $swaggerJsonPath -Raw | ConvertFrom-Json

# Prepare the output folder
if (-Not (Test-Path $outputFolder)) {
    New-Item -ItemType Directory -Path $outputFolder
}

# Function to resolve $ref to a schema object and retrieve its properties
function ResolveSchema($ref) {
    $ref = $ref -replace '#/components/schemas/', ''
    $properties = $swaggerJson.components.schemas.$ref.properties.PSObject.Properties
    $params = @()
    foreach ($prop in $properties) {
        $type = $prop.Value.type
        if ($type -eq 'array') {
            $type = "Array<$(ResolveSchema($prop.Value.items.$ref))>"
        }
        $params += "$($prop.Name): $type"
    }
    return $params -join ', '
}

# Function to generate TypeScript proxy
function GenerateTypeScriptProxy($endpoint, $operationId, $method, $ref) {
    $className = $operationId
    $fileName = "$outputFolder\$className.ts"
    $parameters = ResolveSchema $ref

    # Start building the TypeScript function
    $tsFunction = "export async function $operationId($parameters"

    # Add parameters to the function signature
    # if ($parameters) {
    #     $paramList = $parameters | ForEach-Object { "$($_.name): $($_.schema.type)" }
    #     $tsFunction += $($paramList -join ', ') + ") {"
    # } else {
    #     $tsFunction += ") {`r`n"
    # }

    # Add the fetch call
    $tsFunction += @"
    const response = await fetch("$endpoint", {
        method: '$method',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({$parameters})
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    return await response.$responseType(); // Adjust based on expected response type
}
"@

    $tsFunction | Out-File -FilePath $fileName -Encoding UTF8

}

# Iterate over paths in the Swagger JSON
foreach ($path in $swaggerJson.paths.PSObject.Properties) {
    foreach ($method in $path.Value.PSObject.Properties) {
        $operationId = $method.Value.operationId
        $httpMethod = $method.Name.ToUpper()
        $ref = $method.Value.requestBody.content.'application/json'.schema.'$ref'
        if ($ref) {
            GenerateTypeScriptProxy $path.Name $operationId $httpMethod $ref
        }
        $responseType = if ($method.Value.responses.'200'.content.'application/json'.schema.type) {
            "json"
        } else {
            "text"
        }

        GenerateTypeScriptProxy $path.Name $operationId $httpMethod $ref
    }
}

<# Iterate over paths in the Swagger JSON v1
foreach ($path in $swaggerJson.paths.PSObject.Properties) {
    foreach ($method in $path.Value.PSObject.Properties) {
        $operationId = $method.Value.operationId
        if ($operationId) {
            $parameters = $method.Value.parameters
            GenerateTypeScriptProxy $path.Name $operationId $method.Name.ToUpper() $parameters
        }
    }
}
#>

<# Generate TypeScript files
foreach ($path in $openApiContent.paths.PSObject.Properties) {
    $endpoint = $path.Name
    $methods = $path.Value.PSObject.Properties
    
    foreach ($method in $methods) {
        $operationId = $method.Value.operationId
        $parameters = $method.Value.parameters
        $responses = $method.Value.responses

        # Start building the TypeScript function
        $tsCode = "function $operationId() {`n"
        $tsCode += "    // TODO: Add HTTP method logic here`n"
        $tsCode += "}`n"

        # Output to a TypeScript file
        $filePath = Join-Path $outputFolder "$operationId.ts"
        $tsCode | Out-File -FilePath $filePath
    }
}#>

