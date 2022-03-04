#version 330 core
out vec4 FragColor;

in vec3 Normal;
in vec3 Position;

uniform samplerCube skybox;
uniform vec3 cameraPos;

void main() {
    float ratio = 1.00 / 1.52;
    vec3 worldNormal = normalize(Normal);
    vec3 viewDir = normalize(Position - cameraPos);
    vec3 refracDir = refract(viewDir, worldNormal, ratio);
    FragColor = vec4(texture(skybox, refracDir).rgb, 1.0);
}