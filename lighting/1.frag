#version 330 core
in vec3 Normal;
in vec3 worldPos;
in vec2 TexCoords;

out vec4 FragColor;

struct Material {
    float gloss;

	sampler2D diffTex;
    sampler2D hhhTex;
};

struct DirLight {
	vec3 direction;
    vec3 lightColor;
	//参与各种反射的光的比例
	vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

struct PointLight {
    vec3 position;
    vec3 lightColor;
	// 衰减函数参数
    float constant;
    float linear;
    float quadratic;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

struct SpotLight {
    vec3 position;
    vec3 direction;
    float cutOff;
    float outerCutOff;
  
    float constant;
    float linear;
    float quadratic;
  
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;       
};

#define NR_POINT_LIGHTS 4

uniform Material material;
uniform DirLight dirLight;
uniform PointLight pointLights[NR_POINT_LIGHTS];
uniform SpotLight spotLight;
uniform vec3 viewPos;

vec3 CalcDirLight(DirLight dirLight, vec3 worldNormal, vec3 viewDir);
vec3 CalcPointLight(PointLight light, vec3 worldNormal, vec3 worldPos, vec3 viewDir);
vec3 CalcSpotLight(SpotLight light, vec3 normal, vec3 fragPos, vec3 viewDir);

void main()
{
	vec3 worldNormal = normalize(Normal);
    vec3 viewDir = normalize(viewPos - worldPos);

    // 第一阶段：定向光照
    vec3 result = CalcDirLight(dirLight, worldNormal, viewDir);
    // 第二阶段：点光源
    for(int i = 0; i < NR_POINT_LIGHTS; i++)
        result += CalcPointLight(pointLights[i], worldNormal, worldPos, viewDir);    
    // 第三阶段：聚光
    result += CalcSpotLight(spotLight, worldNormal, worldPos, viewDir);    

    FragColor = vec4(result, 1.0);
}

vec3 CalcDirLight(DirLight dirLight, vec3 worldNormal, vec3 viewDir)
{
    vec3 lightDir = normalize(-dirLight.direction);
	vec3 texColor = vec3(texture(material.diffTex, TexCoords)) * vec3(texture(material.hhhTex, vec2(1.0, -1.0) * TexCoords));
    // ambient
    vec3 ambient  = dirLight.ambient  * texColor;
	//diffuse
    vec3 diffuse  = dirLight.diffuse  * texColor * max(dot(worldNormal, lightDir), 0.0);
	// specular
	vec3 reflectDir = reflect(-lightDir, worldNormal);
    vec3 specular = dirLight.specular * texColor * pow(max(dot(viewDir, reflectDir), 0.0), material.gloss);

    return (ambient + diffuse + specular) * dirLight.lightColor;
}

vec3 CalcPointLight(PointLight light, vec3 normal, vec3 worldPos, vec3 viewDir)
{
    vec3 lightDir = normalize(light.position - worldPos);
    vec3 texColor = vec3(texture(material.diffTex, TexCoords)) * vec3(texture(material.hhhTex, vec2(1.0, -1.0) * TexCoords));

    // ambient
    vec3 ambient = light.ambient * texColor;
    // diffuse
    vec3 diffuse = light.diffuse * max(dot(normal, lightDir), 0.0) * texColor;
    // specular
    vec3 reflectDir = reflect(-lightDir, normal);
    vec3 specular = light.specular * pow(max(dot(viewDir, reflectDir), 0.0), material.gloss) * texColor;

     // attenuation
    float distance = length(light.position - worldPos);
    float attenuation = 1.0 / (light.constant + light.linear * distance + light.quadratic * (distance * distance));

    return (ambient + diffuse + specular) * attenuation * light.lightColor;
}

vec3 CalcSpotLight(SpotLight light, vec3 normal, vec3 fragPos, vec3 viewDir)
{
    vec3 lightDir = normalize(light.position - fragPos);
    vec3 texColor = vec3(texture(material.diffTex, TexCoords)) * vec3(texture(material.hhhTex, vec2(1.0, -1.0) * TexCoords));
    // diffuse shading
    float diff = max(dot(normal, lightDir), 0.0);
    // specular shading
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.gloss);
    // attenuation
    float distance = length(light.position - fragPos);
    float attenuation = 1.0 / (light.constant + light.linear * distance + light.quadratic * (distance * distance));    
    // spotlight intensity
    float theta = dot(lightDir, normalize(-light.direction)); 
    float epsilon = light.cutOff - light.outerCutOff;
    float intensity = clamp((theta - light.outerCutOff) / epsilon, 0.0, 1.0);
    // combine results
    vec3 ambient = light.ambient * texColor;
    vec3 diffuse = light.diffuse * diff * texColor;
    vec3 specular = light.specular * spec * texColor;
    
    return (ambient + diffuse + specular) * attenuation * intensity;;
}