#version 330 core

in vec3 Normal;
in vec3 Position;

out vec4 FragColor;

uniform samplerCube skybox;
uniform vec3 cameraPos;

void main() {
    vec3 worldNormal = normalize(Normal);
    vec3 viewDir = normalize(Position - cameraPos);
    vec3 reflectDir = reflect(viewDir, worldNormal);
    FragColor = vec4(texture(skybox, reflectDir).rgb, 1.0);
}