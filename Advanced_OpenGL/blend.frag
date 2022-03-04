#version 330
in vec2 TexCoords;

out vec4 FragColor;

uniform sampler2D blendTexture;

void main() {

    FragColor = texture(blendTexture, TexCoords);
}